import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  LogOut,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
  Cpu,
  FileWarning,
  Shield,
  Zap,
  Code,
  RefreshCw,
} from "lucide-react";

// --- Types ---

interface Finding {
  _id: string;
  reviewId: Id<"reviews">;
  findingId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  filePath: string;
  lineNumber: number;
  category: "SECURITY" | "PERFORMANCE" | "LOGIC" | "STYLE";
  description: string;
  suggestedFix: string;
}

interface Review {
  _id: Id<"reviews">;
  userId: string;
  repoUrl: string;
  status: string;
  executionMetadata?: {
    tokensConsumed: number;
    latencyMs: number;
    agentsInvoked: string[];
    cacheHit: boolean;
  };
  reviewSummary?: {
    status: "APPROVED" | "CHANGES_REQUESTED" | "CRITICAL_BLOCKER";
    confidenceScore: number;
  };
  deterministicMetrics?: {
    cyclomaticComplexityDelta: number;
    testCoverageImpact: string;
  };
  createdAt: number;
  findings?: Finding[];
}

// --- Simulated review engine ---

const SAMPLE_FINDINGS: Omit<Finding, "_id" | "reviewId">[] = [
  {
    findingId: "SEC-001",
    severity: "CRITICAL",
    filePath: "src/api/auth.ts",
    lineNumber: 42,
    category: "SECURITY",
    description:
      "Unvalidated user input passed directly to SQL query string without parameterization, enabling SQL injection attacks.",
    suggestedFix:
      "Replace string concatenation with parameterized queries using a prepared statement or ORM method.",
  },
  {
    findingId: "SEC-002",
    severity: "HIGH",
    filePath: "src/middleware/cors.ts",
    lineNumber: 15,
    category: "SECURITY",
    description:
      "CORS origin set to wildcard (*) on production endpoint, allowing cross-origin requests from any domain.",
    suggestedFix:
      "Restrict CORS origin to specific trusted domains via environment variable configuration.",
  },
  {
    findingId: "PERF-001",
    severity: "MEDIUM",
    filePath: "src/services/cache.ts",
    lineNumber: 88,
    category: "PERFORMANCE",
    description:
      "Unbounded cache growth detected — no TTL or eviction policy applied to in-memory cache map.",
    suggestedFix:
      "Implement an LRU cache with configurable max size and TTL, or use a managed cache service.",
  },
  {
    findingId: "LOGIC-001",
    severity: "HIGH",
    filePath: "src/workers/processor.ts",
    lineNumber: 127,
    category: "LOGIC",
    description:
      "Race condition in concurrent file processing — shared state mutated without mutex or atomic operation.",
    suggestedFix:
      "Guard shared state with a mutex lock or use a message queue to serialize access to critical sections.",
  },
  {
    findingId: "STYLE-001",
    severity: "LOW",
    filePath: "src/utils/helpers.ts",
    lineNumber: 5,
    category: "STYLE",
    description:
      "Unused export function 'formatDeprecated' detected — no references found in codebase.",
    suggestedFix:
      "Remove the unused function or add inline suppression comment if retained for future use.",
  },
  {
    findingId: "SEC-003",
    severity: "MEDIUM",
    filePath: "src/config/env.ts",
    lineNumber: 23,
    category: "SECURITY",
    description:
      "API key logged to stdout in non-production environment via console.log debugging statement.",
    suggestedFix:
      "Remove or guard the console.log behind an explicit debug flag that is disabled by default.",
  },
  {
    findingId: "LOGIC-002",
    severity: "MEDIUM",
    filePath: "src/api/webhooks.ts",
    lineNumber: 67,
    category: "LOGIC",
    description:
      "Edge case: webhook signature verification skipped when Content-Length header is missing.",
    suggestedFix:
      "Enforce signature verification on all incoming requests regardless of optional header presence.",
  },
  {
    findingId: "PERF-002",
    severity: "LOW",
    filePath: "src/db/queries.ts",
    lineNumber: 31,
    category: "PERFORMANCE",
    description:
      "N+1 query pattern detected in user listing endpoint — each iteration triggers an individual database call.",
    suggestedFix:
      "Batch queries using JOIN or IN clause to reduce round trips from N+1 to 1 query.",
  },
];

async function runSimulatedReview(
  createReview: (args: { repoUrl: string }) => Promise<Id<"reviews">>,
  updateStatus: (args: { reviewId: Id<"reviews">; status: "pending" | "analyzing" | "reasoning" | "auditing" | "completed" | "failed" }) => void,
  completeReview: (args: {
    reviewId: Id<"reviews">;
    executionMetadata: {
      tokensConsumed: number;
      latencyMs: number;
      agentsInvoked: string[];
      cacheHit: boolean;
    };
    reviewSummary: {
      status: "APPROVED" | "CHANGES_REQUESTED" | "CRITICAL_BLOCKER";
      confidenceScore: number;
    };
    deterministicMetrics: {
      cyclomaticComplexityDelta: number;
      testCoverageImpact: string;
    };
  }) => void,
  addFinding: (args: {
    reviewId: Id<"reviews">;
    findingId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    filePath: string;
    lineNumber: number;
    category: "SECURITY" | "PERFORMANCE" | "LOGIC" | "STYLE";
    description: string;
    suggestedFix: string;
  }) => void,
  repoUrl: string,
  onStatusChange?: (status: "pending" | "analyzing" | "reasoning" | "auditing" | "completed" | "failed") => void,
): Promise<Id<"reviews">> {
  const reviewId = await createReview({ repoUrl });
  onStatusChange?.("analyzing");
  updateStatus({ reviewId, status: "analyzing" });
  await delay(1800);

  onStatusChange?.("reasoning");
  updateStatus({ reviewId, status: "reasoning" });
  await delay(2200);

  onStatusChange?.("auditing");
  updateStatus({ reviewId, status: "auditing" });
  await delay(1600);

  // Add findings
  for (const f of SAMPLE_FINDINGS) {
    addFinding({ reviewId, ...f });
    await delay(120);
  }

  const hasCritical = SAMPLE_FINDINGS.some((f) => f.severity === "CRITICAL");
  const highCount = SAMPLE_FINDINGS.filter((f) => f.severity === "HIGH").length;

  const summaryStatus = hasCritical
    ? "CRITICAL_BLOCKER"
    : highCount >= 2
      ? "CHANGES_REQUESTED"
      : "APPROVED";
  const confidence = hasCritical ? 0.94 : highCount >= 2 ? 0.87 : 0.96;

  completeReview({
    reviewId,
    executionMetadata: {
      tokensConsumed: 14820 + Math.floor(Math.random() * 3000),
      latencyMs: 5640 + Math.floor(Math.random() * 2000),
      agentsInvoked: ["Code_Analyzer", "Logic_Reasoner", "Security_Auditor"],
      cacheHit: false,
    },
    reviewSummary: {
      status: summaryStatus,
      confidenceScore: confidence,
    },
    deterministicMetrics: {
      cyclomaticComplexityDelta: 3,
      testCoverageImpact:
        "2 files lack test coverage (src/workers/processor.ts, src/api/webhooks.ts)",
    },
  });

  onStatusChange?.("completed");
  return reviewId;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Sub-components ---

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    APPROVED: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    CHANGES_REQUESTED: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    CRITICAL_BLOCKER: { icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  };
  const c = config[status] ?? config.APPROVED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${c.bg} ${c.color}`}>
      <c.icon className="size-3.5" />
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[severity] ?? colors.LOW}`}>
      {severity}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const icons: Record<string, typeof Shield> = {
    SECURITY: Shield,
    PERFORMANCE: Zap,
    LOGIC: Code,
    STYLE: FileWarning,
  };
  const Icon = icons[category] ?? FileWarning;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <Icon className="size-3" />
      {category}
    </span>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <SeverityBadge severity={finding.severity} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug truncate">
            {finding.description}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{finding.filePath}:{finding.lineNumber}</span>
            <CategoryBadge category={finding.category} />
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-4 py-3 bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Suggested Fix
              </p>
              <p className="text-sm leading-relaxed">{finding.suggestedFix}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PipelineStatus({ status }: { status: string }) {
  const stages = [
    { key: "analyzing", label: "Code_Analyzer", icon: Cpu },
    { key: "reasoning", label: "Logic_Reasoner", icon: Zap },
    { key: "auditing", label: "Security_Auditor", icon: Shield },
  ];

  const stageOrder = ["pending", "analyzing", "reasoning", "auditing", "completed", "failed"];
  const currentIdx = stageOrder.indexOf(status);

  return (
    <div className="flex items-center gap-2">
      {stages.map((s, i) => {
        const sIdx = stageOrder.indexOf(s.key);
        const isActive = status === s.key;
        const isDone = currentIdx > sIdx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-6 h-px ${
                  isDone || isActive ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : isDone
                    ? "border-foreground/30 text-foreground"
                    : "border-border text-muted-foreground"
              }`}
            >
              {isActive ? (
                <Loader2 className="size-3 animate-spin" />
              ) : isDone ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <s.icon className="size-3" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Main Dashboard ---

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const createReview = useMutation(api.reviews.create);
  const updateStatus = useMutation(api.reviews.updateStatus);
  const completeReview = useMutation(api.reviews.complete);
  const addFinding = useMutation(api.reviews.addFinding);

  const reviews = useQuery(api.reviews.listByUser) ?? [];

  const [repoUrl, setRepoUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"pending" | "analyzing" | "reasoning" | "auditing" | "completed" | "failed" | "">("");
  const [selectedReview, setSelectedReview] = useState<Id<"reviews"> | null>(null);
  const selectedReviewData = useQuery(
    api.reviews.get,
    selectedReview ? { reviewId: selectedReview } : "skip",
  );
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleReview = useCallback(async () => {
    if (!repoUrl.trim() || isRunning) return;
    setIsRunning(true);
    setCurrentStatus("pending");
    try {
      await runSimulatedReview(
        createReview,
        updateStatus,
        completeReview,
        addFinding,
        repoUrl.trim(),
        setCurrentStatus,
      );
      setRepoUrl("");
    } catch (err) {
      console.error("Review failed:", err);
      setCurrentStatus("failed");
    } finally {
      setIsRunning(false);
    }
  }, [repoUrl, isRunning, createReview, updateStatus, completeReview, addFinding]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const findings = selectedReviewData?.findings ?? [];
  const filteredFindings = findings.filter((f) => {
    if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
    if (filterCategory !== "all" && f.category !== filterCategory) return false;
    return true;
  });

  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <nav className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
              <GitBranch className="size-3.5 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Auditflow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.name ?? user?.email ?? "User"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1.5 text-xs text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {selectedReview && selectedReviewData ? (
          /* --- Review Detail View --- */
          <div>
            <button
              onClick={() => setSelectedReview(null)}
              className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-3.5" />
              Back to reviews
            </button>

            {/* Review header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div className="min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate mb-1">
                  {selectedReviewData.repoUrl}
                </p>
                <h2 className="text-xl font-bold tracking-tight">
                  Review Report
                </h2>
                {selectedReviewData.reviewSummary && (
                  <div className="mt-2">
                    <StatusBadge status={selectedReviewData.reviewSummary.status} />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {Math.round(selectedReviewData.reviewSummary.confidenceScore * 100)}% confidence
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata cards */}
            {selectedReviewData.executionMetadata && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="rounded-lg border border-border/60 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Tokens
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {selectedReviewData.executionMetadata.tokensConsumed.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Latency
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {(selectedReviewData.executionMetadata.latencyMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Agents
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {selectedReviewData.executionMetadata.agentsInvoked.length}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Cache
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {selectedReviewData.executionMetadata.cacheHit ? "Hit" : "Miss"}
                  </p>
                </div>
              </div>
            )}

            {/* Deterministic metrics */}
            {selectedReviewData.deterministicMetrics && (
              <div className="rounded-lg border border-border/60 px-5 py-4 mb-8">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Deterministic Metrics
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium">Cyclomatic Complexity Delta</p>
                    <p className="text-sm font-mono mt-0.5 text-muted-foreground">
                      {selectedReviewData.deterministicMetrics.cyclomaticComplexityDelta > 0 ? "+" : ""}
                      {selectedReviewData.deterministicMetrics.cyclomaticComplexityDelta}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Test Coverage Impact</p>
                    <p className="text-sm mt-0.5 text-muted-foreground">
                      {selectedReviewData.deterministicMetrics.testCoverageImpact}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Findings */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">
                  Findings ({filteredFindings.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="cursor-pointer rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Severity</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="cursor-pointer rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Category</option>
                  <option value="SECURITY">Security</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="LOGIC">Logic</option>
                  <option value="STYLE">Style</option>
                </select>
              </div>
            </div>

            {findings.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((s) =>
                  severityCounts[s] ? (
                    <span key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <SeverityBadge severity={s} />
                      {severityCounts[s]}
                    </span>
                  ) : null,
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {filteredFindings.length === 0 && findings.length > 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No findings match the current filters.
                </p>
              )}
              {filteredFindings.map((f) => (
                <FindingCard key={f._id} finding={f} />
              ))}
              {findings.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No findings recorded for this review.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* --- Review List / Input View --- */
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Reviews
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter a repository URL to run a multi-agent code audit.
            </p>

            {/* Input section */}
            <div className="rounded-lg border border-border/60 p-5 mb-10">
              <label
                htmlFor="repo-url"
                className="block text-xs font-medium text-muted-foreground mb-2"
              >
                Repository URL
              </label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  id="repo-url"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleReview();
                  }}
                  disabled={isRunning}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handleReview}
                  disabled={!repoUrl.trim() || isRunning}
                  className="cursor-pointer gap-2 shrink-0"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span className="hidden sm:inline">Reviewing…</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      <span className="hidden sm:inline">Run Review</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Pipeline indicator */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-border/60">
                      <PipelineStatus status={currentStatus} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Review history */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  History
                </h2>
                <div className="flex flex-col gap-2">
                  {reviews.map((review) => (
                    <button
                      key={review._id}
                      onClick={() => setSelectedReview(review._id)}
                      className="cursor-pointer w-full text-left rounded-lg border border-border/60 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium font-mono truncate">
                            {review.repoUrl}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(review.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            {review.executionMetadata && (
                              <span className="flex items-center gap-1">
                                <Cpu className="size-3" />
                                {(review.executionMetadata.latencyMs / 1000).toFixed(1)}s
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {review.status === "completed" && review.reviewSummary ? (
                            <StatusBadge status={review.reviewSummary.status} />
                          ) : review.status === "failed" ? (
                            <StatusBadge status="CRITICAL_BLOCKER" />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              <Loader2 className="size-3 animate-spin" />
                              {review.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {reviews.length === 0 && !isRunning && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-4">
                  <GitBranch className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Enter a repository URL above to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
