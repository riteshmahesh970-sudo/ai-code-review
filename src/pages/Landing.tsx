import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Shield,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitBranch,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const agents = [
  {
    name: "Code_Analyzer",
    tier: "Fast / Cheap",
    description:
      "Syntax verification, linting, basic static security scanning, and context chunking. Runs first to map the codebase.",
    icon: Cpu,
  },
  {
    name: "Logic_Reasoner",
    tier: "Advanced Reasoning",
    description:
      "Algorithmic efficiency, edge-case analysis, concurrency bug detection, and deep semantic review of critical paths.",
    icon: Zap,
  },
  {
    name: "Security_Auditor",
    tier: "Specialized Domain",
    description:
      "Vulnerability matching against OWASP Top 10, memory leaks, credential exposure, and injection risk detection.",
    icon: Shield,
  },
];

const steps = [
  "Paste your repository URL",
  "Code_Analyzer maps the codebase",
  "Logic_Reasoner reviews critical paths",
  "Security_Auditor scans for vulnerabilities",
  "Structured JSON report delivered",
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCta = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth?returnTo=/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
              <GitBranch className="size-4 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Auditflow
            </span>
          </div>
          <button
            onClick={handleCta}
            className="cursor-pointer rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/80"
          >
            Open App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Enterprise AI Code Review
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl font-bold tracking-tight leading-[1.1] sm:text-5xl"
          >
            Multi-agent code audit
            <br />
            in a single report.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            Three specialized AI agents — code analysis, logic reasoning, and
            security auditing — run in parallel on your entire repository and
            return a structured, actionable JSON report.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex items-center gap-4"
          >
            <button
              onClick={handleCta}
              className="cursor-pointer flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
            >
              Start a review
              <ArrowRight className="size-4" />
            </button>
            <a
              href="#architecture"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-border/60" />
      </div>

      {/* Architecture */}
      <section id="architecture" className="mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Agent Architecture
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-2xl font-bold tracking-tight"
          >
            Three agents. One pipeline.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground"
          >
            Each agent is optimized for a specific analysis tier. Tasks are
            decomposed, routed by complexity, and cached for cost efficiency.
          </motion.p>
        </motion.div>

        <div className="mt-12 grid gap-0 divide-y divide-border/60 border border-border/60 rounded-lg">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={i}
              className="flex items-start gap-5 px-6 py-6 sm:items-center"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <agent.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-sm font-semibold">{agent.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {agent.tier}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-border/60" />
      </div>

      {/* Pipeline steps */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Pipeline
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-2xl font-bold tracking-tight"
          >
            From URL to structured report.
          </motion.h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-5">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={i}
              className="flex flex-col"
            >
              <span className="mb-3 text-xs font-medium text-muted-foreground/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm font-medium leading-snug">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-border/60" />
      </div>

      {/* Output schema preview */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Output Schema
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-2xl font-bold tracking-tight"
          >
            Structured JSON. Every time.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground"
          >
            Every review returns a deterministic JSON payload with execution
            metadata, severity-scored findings, and complexity deltas.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          custom={3}
          className="mt-10 rounded-lg border border-border/60 bg-muted/30 p-6"
        >
          <pre className="overflow-x-auto text-xs leading-5 text-muted-foreground font-mono">
{`{
  "execution_metadata": {
    "tokens_consumed": 14820,
    "latency_ms": 3240,
    "agents_invoked": ["Code_Analyzer", "Logic_Reasoner", "Security_Auditor"],
    "cache_hit": false
  },
  "review_summary": {
    "status": "CHANGES_REQUESTED",
    "confidence_score": 0.91
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "HIGH",
      "file_path": "src/api/auth.ts",
      "line_number": 42,
      "category": "SECURITY",
      "description": "Unvalidated input passed to SQL query",
      "suggested_fix": "Use parameterized queries or ORM sanitization"
    }
  ],
  "deterministic_metrics": {
    "cyclomatic_complexity_delta": +3,
    "test_coverage_impact": "2 files lack test coverage"
  }
}`}
          </pre>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-border/60" />
      </div>

      {/* Status badges */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-wrap items-center gap-6"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span className="text-sm font-medium">APPROVED</span>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-sm font-medium">CHANGES_REQUESTED</span>
          </motion.div>
          <motion.div variants={fadeUp} custom={2} className="flex items-center gap-2">
            <XCircle className="size-4 text-red-600" />
            <span className="text-sm font-medium">CRITICAL_BLOCKER</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <p className="text-xs text-muted-foreground">
            Auditflow — Enterprise AI Code Review
          </p>
          <p className="text-xs text-muted-foreground/50">v1.0</p>
        </div>
      </footer>
    </div>
  );
}
