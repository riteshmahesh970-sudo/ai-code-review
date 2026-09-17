import { useState, useEffect, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InterferenceBg } from "@/components/InterferenceBg";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Cpu, FileWarning, GitBranch, Loader2, LogOut, Play, Shield, Zap, Code, AlertTriangle, XCircle } from "lucide-react";

const stages = [
  { key: "analyzing", label: "Repository Analyzer", detail: "Reading repository structure", icon: Cpu },
  { key: "reasoning", label: "Specialist Agents", detail: "Security, logic and performance agents", icon: Zap },
  { key: "auditing", label: "Review Synthesizer", detail: "Deduplicating and validating findings", icon: Shield },
];

const statusOrder = ["pending", "analyzing", "reasoning", "auditing", "completed", "failed"];

type Finding = {
  _id: string;
  findingId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  filePath: string;
  lineNumber: number;
  category: "SECURITY" | "PERFORMANCE" | "LOGIC" | "STYLE";
  description: string;
  suggestedFix: string;
};

type Status = "pending" | "analyzing" | "reasoning" | "auditing" | "completed" | "failed";

function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; className: string }> = {
    APPROVED: { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    CHANGES_REQUESTED: { icon: AlertTriangle, className: "text-amber-700 bg-amber-50 border-amber-200" },
    CRITICAL_BLOCKER: { icon: XCircle, className: "text-red-700 bg-red-50 border-red-200" },
  };
  const item = config[status ?? ""];
  if (!item) return null;
  const Icon = item.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${item.className}`}><Icon className="size-3.5" />{status?.replace(/_/g, " ")}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const classes: Record<string, string> = {
    CRITICAL: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-orange-700 bg-orange-50 border-orange-200",
    MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
    LOW: "text-muted-foreground bg-muted border-border",
  };
  return <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${classes[severity] ?? classes.LOW}`}>{severity}</span>;
}

function Category({ category }: { category: Finding["category"] }) {
  const icons = { SECURITY: Shield, PERFORMANCE: Zap, LOGIC: Code, STYLE: FileWarning };
  const Icon = icons[category];
  return <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Icon className="size-3" />{category}</span>;
}

function Pipeline({ status }: { status: string }) {
  const current = statusOrder.indexOf(status);
  return <div className="space-y-3">
    {stages.map((stage) => {
      const index = statusOrder.indexOf(stage.key);
      const active = status === stage.key;
      const done = current > index;
      const Icon = stage.icon;
      return <div key={stage.key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? "border-foreground/20 bg-muted/40" : done ? "border-border bg-card" : "border-border/40 bg-muted/20 opacity-50"}`}>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          {active ? <Loader2 className="size-4 animate-spin" /> : done ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Icon className="size-4" />}
        </div>
        <div className="min-w-0 flex-1"><p className="text-sm font-medium">{stage.label}</p><p className="text-xs text-muted-foreground">{active ? stage.detail : done ? "Completed" : "Waiting"}</p></div>
      </div>;
    })}
  </div>;
}

function FindingCard({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false);
  return <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
    <button className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-muted/30" onClick={() => setOpen((value) => !value)}>
      <SeverityBadge severity={finding.severity} />
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{finding.description}</p><div className="mt-2 flex flex-wrap items-center gap-3"><code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{finding.filePath}:{finding.lineNumber}</code><Category category={finding.category} /></div></div>
      {open ? <ChevronUp className="mt-1 size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" />}
    </button>
    <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/60 bg-muted/20 px-5 py-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggested fix</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{finding.suggestedFix}</p></motion.div>}</AnimatePresence>
  </div>;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const runReview = useAction(api.aiReview.run);
  const reviews = useQuery(api.reviews.listByUser) ?? [];
  const [repoUrl, setRepoUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [activeReview, setActiveReview] = useState<Id<"reviews"> | null>(null);
  const [selectedReview, setSelectedReview] = useState<Id<"reviews"> | null>(null);
  const [error, setError] = useState("");

  const activeData = useQuery(api.reviews.get, activeReview ? { reviewId: activeReview } : "skip");
  const selectedData = useQuery(api.reviews.get, selectedReview ? { reviewId: selectedReview } : "skip");

  useEffect(() => {
    if (activeData?.status === "completed" || activeData?.status === "failed") {
      setRunning(false);
    }
  }, [activeData?.status]);

  const handleReview = useCallback(async () => {
    const value = repoUrl.trim();
    if (!value || running) return;
    setError("");
    setRunning(true);
    try {
      const reviewId = await runReview({ repoUrl: value });
      setActiveReview(reviewId);
      setSelectedReview(reviewId);
      setRepoUrl("");
    } catch (err) {
      setRunning(false);
      setError(err instanceof Error ? err.message : "Review failed.");
    }
  }, [repoUrl, running, runReview]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const detail = selectedData ?? activeData;
  const findings = detail?.findings ?? [];

  return <div className="relative min-h-screen bg-background text-foreground">
    <InterferenceBg />
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
      <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-xl bg-foreground"><GitBranch className="size-4 text-background" /></div><span className="font-semibold">Auditflow</span></div>
      <div className="flex items-center gap-3"><span className="hidden rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground sm:inline">{user?.name ?? user?.email ?? "User"}</span><ThemeToggle /><Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="mr-1.5 size-3.5" />Sign out</Button></div>
    </div></nav>

    <main className="mx-auto max-w-6xl px-6 py-10">
      {detail ? <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => setSelectedReview(null)} className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Back to reviews</button>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row"><div><p className="mb-2 break-all font-mono text-xs text-muted-foreground">{detail.repoUrl}</p><h1 className="text-2xl font-bold">Review Report</h1><div className="mt-3 flex items-center gap-3"><StatusBadge status={detail.reviewSummary?.status} />{detail.reviewSummary && <span className="text-xs text-muted-foreground">{Math.round(detail.reviewSummary.confidenceScore * 100)}% confidence</span>}</div></div></div>
        {detail.status !== "completed" && detail.status !== "failed" && <div className="mb-8 rounded-2xl border border-border/60 bg-card p-5"><p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Live pipeline</p><Pipeline status={detail.status} /></div>}
        {detail.status === "failed" && <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">The review failed. Check the Convex logs and verify GEMINI_API_KEY / GitHub access.</div>}
        {detail.executionMetadata && <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[
          ["Tokens", detail.executionMetadata.tokensConsumed.toLocaleString()],
          ["Latency", `${(detail.executionMetadata.latencyMs / 1000).toFixed(1)}s`],
          ["Agents", String(detail.executionMetadata.agentsInvoked.length)],
          ["Cache", detail.executionMetadata.cacheHit ? "Hit" : "Miss"],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-border/60 bg-card p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-1 font-mono text-lg font-bold">{value}</p></div>)}</div>}
        <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Findings <span className="ml-1 text-sm font-normal text-muted-foreground">({findings.length})</span></h2></div>
        <div className="space-y-3">{findings.map((finding) => <FindingCard key={finding._id} finding={finding} />)}{detail.status === "completed" && findings.length === 0 && <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">No actionable findings were produced.</div>}</div>
      </motion.section> : <>
        <section className="mb-10"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Code Intelligence</p><h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Review your repository with a <span className="text-muted-foreground">team of AI specialists.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Auditflow now runs real repository analysis: independent security, logic and performance agents review the code in parallel, followed by a synthesis pass that removes duplicate or weak findings.</p></section>
        <div className="mb-10 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row"><Input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void handleReview(); }} placeholder="https://github.com/owner/repository" disabled={running} /><Button onClick={() => void handleReview()} disabled={!repoUrl.trim() || running} className="sm:w-40">{running ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}{running ? "Reviewing..." : "Start review"}</Button></div>{error && <p className="mt-3 text-xs text-red-600">{error}</p>}<p className="mt-3 text-[11px] text-muted-foreground">Public GitHub repositories are supported. Server-side credentials are never sent to the browser.</p></div>
        <section><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Review history</h2><span className="text-xs text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span></div><div className="space-y-3">{reviews.map((review) => <button key={review._id} onClick={() => setSelectedReview(review._id)} className="flex w-full items-center gap-4 rounded-xl border border-border/60 bg-card p-4 text-left hover:bg-muted/30"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><GitBranch className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-mono text-xs">{review.repoUrl}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleString()}</p></div><StatusBadge status={review.reviewSummary?.status} /><span className="hidden text-xs text-muted-foreground sm:inline">{review.status}</span></button>)}{reviews.length === 0 && <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Paste a GitHub repository above to run your first real AI review.</div>}</div></section>
      </>}
    </main>
  </div>;
}
