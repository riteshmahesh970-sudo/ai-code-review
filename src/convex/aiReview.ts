import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const MAX_FILES = 18;
const MAX_FILE_CHARS = 8000;
const MAX_CONTEXT_CHARS = 90000;
const DEFAULT_MODEL = "gemini-3.6-flash";

type Category = "SECURITY" | "PERFORMANCE" | "LOGIC" | "STYLE";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Finding = {
  findingId: string;
  severity: Severity;
  filePath: string;
  lineNumber: number;
  category: Category;
  description: string;
  suggestedFix: string;
};

type AgentResult = {
  agent: string;
  findings: Finding[];
  tokens: number;
};

const findingSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      findingId: { type: "string" },
      severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      filePath: { type: "string" },
      lineNumber: { type: "integer" },
      category: { type: "string", enum: ["SECURITY", "PERFORMANCE", "LOGIC", "STYLE"] },
      description: { type: "string" },
      suggestedFix: { type: "string" },
    },
    required: ["findingId", "severity", "filePath", "lineNumber", "category", "description", "suggestedFix"],
  },
};

const synthesisSchema = {
  type: "object",
  properties: {
    findings: findingSchema,
    confidenceScore: { type: "number" },
    summary: { type: "string" },
  },
  required: ["findings", "confidenceScore", "summary"],
};

function parseRepoUrl(repoUrl: string) {
  const url = new URL(repoUrl);
  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new Error("Only public github.com repository URLs are supported.");
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("Invalid GitHub repository URL.");

  return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
}

async function githubFetch(url: string) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "Auditflow-AI-Code-Reviewer",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}).`);
  }

  return response.json();
}

async function loadRepository(repoUrl: string) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const metadata = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`) as { default_branch: string };
  const branch = metadata.default_branch;
  const tree = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  ) as { truncated?: boolean; tree: Array<{ path: string; type: string; size?: number }> };

  const ignored = /(^|\/)(node_modules|dist|build|coverage|\.git)(\/|$)|\.(lock|map|min\.js|min\.css)$/i;
  const allowed = /\.(ts|tsx|js|jsx|py|java|go|rs|rb|php|c|cpp|h|hpp|cs|swift|kt|kts|sql|vue|svelte|json|yaml|yml|md)$/i;
  const files = tree.tree
    .filter((entry) => entry.type === "blob" && !ignored.test(entry.path) && allowed.test(entry.path))
    .sort((a, b) => (a.size ?? 0) - (b.size ?? 0))
    .slice(0, MAX_FILES);

  let context = "";
  for (const file of files) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${file.path.split("/").map(encodeURIComponent).join("/")}`;
    const response = await fetch(rawUrl, { headers: { "User-Agent": "Auditflow-AI-Code-Reviewer" } });
    if (!response.ok) continue;
    const text = (await response.text()).slice(0, MAX_FILE_CHARS);
    const numbered = text.split("\n").map((line, index) => `${index + 1}: ${line}`).join("\n");
    const block = `\n===== ${file.path} =====\n${numbered}\n`;
    if (context.length + block.length > MAX_CONTEXT_CHARS) break;
    context += block;
  }

  if (!context) throw new Error("No supported source files could be read from this repository.");
  return { context, filesRead: files.length };
}

async function callGemini(agent: string, focus: string, context: string): Promise<AgentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY in Convex environment variables.");

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const prompt = `You are ${agent}, a specialist in AI-assisted software engineering.

Review the supplied repository snapshot ONLY from your assigned perspective: ${focus}

Rules:
- Report only concrete, actionable issues supported by the supplied code.
- Do not invent files, functions, line numbers, tests, or runtime behavior.
- Every finding must point to an exact file and line number from the numbered source.
- Prefer a small number of high-signal findings over generic advice.
- If there is not enough evidence for an issue, omit it.
- Return valid JSON matching the requested schema.

Repository snapshot:
${context}`;

  const started = Date.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: findingSchema,
          temperature: 0.1,
        },
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini ${agent} failed (${response.status}): ${message.slice(0, 300)}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "[]";
  const findings = JSON.parse(text) as Finding[];
  const tokens = (payload.usageMetadata?.promptTokenCount ?? 0) + (payload.usageMetadata?.candidatesTokenCount ?? 0);

  return {
    agent: `${agent} (${Date.now() - started}ms)`,
    findings: Array.isArray(findings) ? findings : [],
    tokens,
  };
}

async function synthesize(context: string, results: AgentResult[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY in Convex environment variables.");

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const evidence = results.map((result) => JSON.stringify({ agent: result.agent, findings: result.findings })).join("\n");
  const prompt = `You are the senior review synthesizer for Auditflow.

Merge independent specialist findings into one evidence-based review.

Rules:
- Deduplicate overlapping findings.
- Keep a finding only when the repository snapshot supports it.
- Resolve disagreements using the actual code, not majority vote.
- Preserve exact file paths and line numbers.
- Do not invent tests, metrics, or behavior.
- Severity must reflect the concrete impact visible in the code.
- Confidence is a number from 0 to 1.
- Return only the requested JSON object.

Repository snapshot:
${context}

Specialist evidence:
${evidence}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: synthesisSchema,
          temperature: 0.1,
        },
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini synthesizer failed (${response.status}): ${message.slice(0, 300)}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "{}";
  const result = JSON.parse(text) as { findings: Finding[]; confidenceScore: number; summary: string };
  const tokens = (payload.usageMetadata?.promptTokenCount ?? 0) + (payload.usageMetadata?.candidatesTokenCount ?? 0);
  return { ...result, tokens };
}

export const run = action({
  args: { repoUrl: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const started = Date.now();
    const reviewId = await ctx.runMutation(api.reviews.create, { repoUrl: args.repoUrl.trim() });

    try {
      await ctx.runMutation(api.reviews.updateStatus, { reviewId, status: "analyzing" });
      const repository = await loadRepository(args.repoUrl.trim());

      await ctx.runMutation(api.reviews.updateStatus, { reviewId, status: "reasoning" });
      const [security, logic, performance] = await Promise.all([
        callGemini("Security_Auditor", "security vulnerabilities, authentication/authorization mistakes, injection risks, secret exposure, unsafe input handling, and trust-boundary issues", repository.context),
        callGemini("Logic_Reasoner", "correctness, edge cases, state management, concurrency, error handling, and likely runtime bugs", repository.context),
        callGemini("Performance_Reviewer", "algorithmic complexity, unnecessary work, I/O patterns, memory growth, caching, and scalability risks", repository.context),
      ]);

      await ctx.runMutation(api.reviews.updateStatus, { reviewId, status: "auditing" });
      const synthesis = await synthesize(repository.context, [security, logic, performance]);
      const findings = Array.isArray(synthesis.findings) ? synthesis.findings.slice(0, 50) : [];
      const hasCritical = findings.some((finding) => finding.severity === "CRITICAL");
      const hasHigh = findings.some((finding) => finding.severity === "HIGH");
      const summaryStatus = hasCritical ? "CRITICAL_BLOCKER" : hasHigh ? "CHANGES_REQUESTED" : "APPROVED";
      const confidence = Math.max(0, Math.min(1, Number(synthesis.confidenceScore) || 0));

      for (const finding of findings) {
        await ctx.runMutation(api.reviews.addFinding, {
          reviewId,
          findingId: finding.findingId || `${finding.category}-${finding.lineNumber}`,
          severity: finding.severity,
          filePath: finding.filePath,
          lineNumber: Math.max(1, Math.round(finding.lineNumber)),
          category: finding.category,
          description: finding.description,
          suggestedFix: finding.suggestedFix,
        });
      }

      const tokensConsumed = security.tokens + logic.tokens + performance.tokens + synthesis.tokens;
      await ctx.runMutation(api.reviews.complete, {
        reviewId,
        executionMetadata: {
          tokensConsumed,
          latencyMs: Date.now() - started,
          agentsInvoked: ["Security_Auditor", "Logic_Reasoner", "Performance_Reviewer", "Review_Synthesizer"],
          cacheHit: false,
        },
        reviewSummary: {
          status: summaryStatus,
          confidenceScore: confidence,
        },
        deterministicMetrics: {
          cyclomaticComplexityDelta: 0,
          testCoverageImpact: `Static review only; ${repository.filesRead} source files sampled. Test coverage was not measured.`,
        },
      });

      return reviewId;
    } catch (error) {
      await ctx.runMutation(api.reviews.updateStatus, { reviewId, status: "failed" });
      throw error;
    }
  },
});
