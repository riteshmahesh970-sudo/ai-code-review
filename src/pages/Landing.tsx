import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { InterferenceBg } from "@/components/InterferenceBg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroDemo } from "@/components/HeroDemo";
import {
  Shield,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitBranch,
  Braces,
  Eye,
  Lock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const agents = [
  {
    name: "Code_Analyzer",
    tier: "Fast / Cheap",
    description:
      "Syntax verification, linting, basic static security scanning, and context chunking. Runs first to map the codebase.",
    icon: Cpu,
    color: "bg-slate-100 text-slate-600 border-slate-200",
    accent: "group-hover:border-slate-300",
  },
  {
    name: "Logic_Reasoner",
    tier: "Advanced Reasoning",
    description:
      "Algorithmic efficiency, edge-case analysis, concurrency bug detection, and deep semantic review of critical paths.",
    icon: Zap,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    accent: "group-hover:border-amber-300",
  },
  {
    name: "Security_Auditor",
    tier: "Specialized Domain",
    description:
      "Vulnerability matching against OWASP Top 10, memory leaks, credential exposure, and injection risk detection.",
    icon: Shield,
    color: "bg-red-50 text-red-600 border-red-200",
    accent: "group-hover:border-red-300",
  },
];

const steps = [
  { label: "Paste your repository URL", icon: Braces },
  { label: "Code_Analyzer maps the codebase", icon: Cpu },
  { label: "Logic_Reasoner reviews critical paths", icon: Zap },
  { label: "Security_Auditor scans for vulnerabilities", icon: Shield },
  { label: "Structured JSON report delivered", icon: CheckCircle2 },
];

const stats = [
  { value: "3", label: "Specialized agents" },
  { value: "< 10s", label: "Average latency" },
  { value: "OWASP", label: "Security coverage" },
  { value: "100%", label: "Structured output" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const handleCta = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth?returnTo=/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <InterferenceBg />
      {/* Nav */}
      <nav className="relative z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground shadow-sm">
              <GitBranch className="size-4 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              Auditflow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#architecture"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <ThemeToggle />
            <button
              onClick={handleCta}
              className="cursor-pointer rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:shadow-lg hover:shadow-foreground/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Open App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative">
        {/* Decorative background */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-accent-slate/[0.06] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent-slate/[0.04] to-transparent rounded-full blur-3xl" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto max-w-6xl px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 mb-8"
            >
              <Sparkles className="size-3.5 text-accent-slate" />
              <span className="text-xs font-medium text-muted-foreground">
                Enterprise AI Code Review
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-[2.75rem] sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05]"
            >
              Multi-agent code audit
              <br />
              <span className="text-muted-foreground">in a single report.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-7 max-w-xl text-[15px] leading-[1.7] text-muted-foreground"
            >
              Three specialized AI agents — code analysis, logic reasoning, and
              security auditing — run in parallel on your entire repository and
              return a structured, actionable JSON report.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={handleCta}
                className="cursor-pointer group flex items-center gap-2.5 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:shadow-lg hover:shadow-foreground/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start a review
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#architecture"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                See how it works
                <ChevronRight className="size-3.5" />
              </a>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="group"
              >
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Demo */}
        <div className="relative mt-16 max-w-4xl mx-auto">
          <HeroDemo />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-t border-border/50" />
      </div>

      {/* Architecture */}
      <section id="architecture" className="relative mx-auto max-w-6xl px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 mb-6"
          >
            <Eye className="size-3.5 text-accent-slate" />
            <span className="text-xs font-medium text-muted-foreground">
              Agent Architecture
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]"
          >
            Three agents. One pipeline.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
          >
            Each agent is optimized for a specific analysis tier. Tasks are
            decomposed, routed by complexity, and cached for cost efficiency.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mt-14 grid gap-4 sm:grid-cols-3"
        >
          {agents.map((agent) => (
            <motion.div
              key={agent.name}
              variants={scaleIn}
              className={`group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-foreground/[0.03] ${agent.accent}`}
            >
              <div className={`inline-flex size-10 items-center justify-center rounded-xl border ${agent.color} mb-5`}>
                <agent.icon className="size-4.5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                {agent.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground/70">
                {agent.tier}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {agent.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-t border-border/50" />
      </div>

      {/* Pipeline steps */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 mb-6"
          >
            <Lock className="size-3.5 text-accent-slate" />
            <span className="text-xs font-medium text-muted-foreground">
              Pipeline
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]"
          >
            From URL to structured report.
          </motion.h2>
        </motion.div>

        <div className="mt-14">
          <div className="relative">
            {/* Vertical line connector */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/50 hidden sm:block" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="space-y-0"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  variants={fadeUp}
                  custom={i}
                  className="relative flex items-center gap-5 py-5"
                >
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground">
                    <step.icon className="size-4" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium text-muted-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-medium">{step.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-t border-border/50" />
      </div>

      {/* Output schema preview */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 mb-6"
          >
            <Braces className="size-3.5 text-accent-slate" />
            <span className="text-xs font-medium text-muted-foreground">
              Output Schema
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]"
          >
            Structured JSON. Every time.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
          >
            Every review returns a deterministic JSON payload with execution
            metadata, severity-scored findings, and complexity deltas.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={scaleIn}
          className="mt-12 relative"
        >
          {/* Window chrome */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-foreground/[0.04]">
            <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-muted" />
                <div className="size-2.5 rounded-full bg-muted" />
                <div className="size-2.5 rounded-full bg-muted" />
              </div>
              <span className="ml-2 text-xs font-mono text-muted-foreground/60">
                review_output.json
              </span>
            </div>
            <pre className="overflow-x-auto p-6 text-[13px] leading-6 text-muted-foreground font-mono">
{`{
  "execution_metadata": {
    "tokens_consumed": 14820,
    "latency_ms": 3240,
    "agents_invoked": [
      "Code_Analyzer",
      "Logic_Reasoner",
      "Security_Auditor"
    ],
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
      "suggested_fix": "Use parameterized queries"
    }
  ],
  "deterministic_metrics": {
    "cyclomatic_complexity_delta": +3,
    "test_coverage_impact": "2 files lack test coverage"
  }
}`}
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-t border-border/50" />
      </div>

      {/* Status badges section */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] mb-10"
          >
            Clear verdicts, every review.
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-5"
          >
            <motion.div
              variants={scaleIn}
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-4"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-emerald-800">
                  APPROVED
                </p>
                <p className="text-xs text-emerald-600/80">
                  No issues found
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={scaleIn}
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-4"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-800">
                  CHANGES REQUESTED
                </p>
                <p className="text-xs text-amber-600/80">
                  Review required
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={scaleIn}
              className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-6 py-4"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-800">
                  CRITICAL BLOCKER
                </p>
                <p className="text-xs text-red-600/80">
                  Immediate action needed
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA section */}
      <section className="relative mx-auto max-w-6xl px-6 lg:px-8 pb-24 lg:pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-10 sm:p-14 text-center"
        >
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="relative">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl font-bold tracking-[-0.02em]"
            >
              Ready to audit your codebase?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-3 text-sm text-muted-foreground max-w-md mx-auto"
            >
              Paste a repository URL and let three specialized AI agents find
              bugs, security flaws, and performance issues.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              <button
                onClick={handleCta}
                className="cursor-pointer group inline-flex items-center gap-2.5 rounded-xl bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-all hover:shadow-lg hover:shadow-foreground/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded-md bg-foreground">
              <GitBranch className="size-3 text-background" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-muted-foreground">
              Auditflow — Enterprise AI Code Review
            </p>
          </div>
          <p className="text-xs text-muted-foreground/50">v1.0</p>
        </div>
      </footer>
    </div>
  );
}
