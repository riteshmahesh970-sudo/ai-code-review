import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cpu, Zap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface Vuln {
  id: string;
  label: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  file: string;
  line: number;
  category: "SECURITY" | "LOGIC" | "STYLE";
  code: string;
  description: string;
  agents: { name: string; tier: string; verdict: string; icon: typeof Cpu }[];
}

const VULNS: Vuln[] = [
  {
    id: "sql",
    label: "SQL Injection",
    severity: "CRITICAL",
    file: "src/api/users.ts",
    line: 42,
    category: "SECURITY",
    code: `const query = \`\n  SELECT * FROM users\n  WHERE id = '\${userId}'\n\`;`,
    description: "Unvalidated user input passed directly to SQL query string without parameterization.",
    agents: [
      { name: "Code_Analyzer", tier: "Fast", verdict: "Syntax OK, unparameterized query detected", icon: Cpu },
      { name: "Logic_Reasoner", tier: "Advanced", verdict: "Input flows unsanitized into DB layer — high injection risk", icon: Zap },
      { name: "Security_Auditor", tier: "Domain", verdict: "CRITICAL — OWASP A03:2021 (Injection). Use parameterized queries.", icon: Shield },
    ],
  },
  {
    id: "reentrancy",
    label: "Reentrancy Bug",
    severity: "HIGH",
    file: "src/contracts/withdraw.ts",
    line: 87,
    category: "LOGIC",
    code: `function withdraw(amount) {\n  const balance = balances[msg.sender];\n  // external call before state update!\n  payable(msg.sender).call{value: amount}("");\n  balances[msg.sender] -= amount;\n}`,
    description: "External call before state update allows recursive re-entry draining funds.",
    agents: [
      { name: "Code_Analyzer", tier: "Fast", verdict: "External call found before balance decrement", icon: Cpu },
      { name: "Logic_Reasoner", tier: "Advanced", verdict: "HIGH — classic reentrancy pattern. Update state before external call.", icon: Zap },
      { name: "Security_Auditor", tier: "Domain", verdict: "Checks-effects-interactions violated. Apply reentrancy guard.", icon: Shield },
    ],
  },
  {
    id: "unused",
    label: "Unused Variable",
    severity: "MEDIUM",
    file: "src/utils/format.ts",
    line: 12,
    category: "STYLE",
    code: `const cachedResult = await fetch(url);\nconst data = await parseJson(cachedResult);\nreturn data.filter(item => item.active);`,
    description: "Variable 'cachedResult' is assigned but never referenced after parseJson.",
    agents: [
      { name: "Code_Analyzer", tier: "Fast", verdict: "Unused variable 'cachedResult' — remove or prefix with _", icon: Cpu },
      { name: "Logic_Reasoner", tier: "Advanced", verdict: "No behavioral impact. Dead code cleanup recommended.", icon: Zap },
      { name: "Security_Auditor", tier: "Domain", verdict: "LOW — no security risk. Style/code hygiene issue.", icon: Shield },
    ],
  },
];

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "CRITICAL") return <XCircle className="size-3.5" />;
  if (severity === "HIGH") return <AlertTriangle className="size-3.5" />;
  return <CheckCircle2 className="size-3.5" />;
}

export function HeroDemo() {
  const [active, setActive] = useState(0);
  const vuln = VULNS[active];

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Window chrome */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-foreground/[0.04]">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3 bg-muted/20">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-muted" />
            <div className="size-2.5 rounded-full bg-muted" />
            <div className="size-2.5 rounded-full bg-muted" />
          </div>
          <span className="ml-2 text-xs font-mono text-muted-foreground/60">Live Demo</span>
        </div>

        {/* Toggle bar */}
        <div className="flex gap-1.5 px-5 py-3 border-b border-border/50 bg-muted/10">
          {VULNS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActive(i)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                active === i
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
          {/* Code panel */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">
                {vuln.file}:{vuln.line}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityColors[vuln.severity]}`}>
                <SeverityIcon severity={vuln.severity} />
                {vuln.severity}
              </span>
            </div>
            <pre className="rounded-xl bg-muted/30 border border-border/30 p-4 text-[13px] leading-6 font-mono overflow-x-auto">
              <code>
                {vuln.code.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-muted-foreground/30 w-6 text-right mr-4">
                      {vuln.line + i}
                    </span>
                    <span className={
                      line.includes("call{value") || line.includes("SELECT") || line.includes("${")
                        ? "text-red-500 dark:text-red-400"
                        : line.includes("cachedResult") && i === 0
                          ? "text-amber-500 dark:text-amber-400"
                          : ""
                    }>
                      {line}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {vuln.description}
            </p>
          </div>

          {/* Agent responses panel */}
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Sub-Agent Responses
            </p>
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {vuln.agents.map((agent, i) => (
                  <motion.div
                    key={`${vuln.id}-${agent.name}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.12, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-border/50 bg-muted/20 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex size-6 items-center justify-center rounded-md ${
                        i === 0 ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" :
                        i === 1 ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                        "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      }`}>
                        <agent.icon className="size-3" />
                      </div>
                      <span className="text-xs font-semibold">{agent.name}</span>
                      <span className="text-[10px] text-muted-foreground/60">{agent.tier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                      {agent.verdict}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Simulated JSON output snippet */}
            <motion.div
              key={`json-${vuln.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 rounded-xl bg-muted/30 border border-border/30 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">
                Output
              </p>
              <pre className="text-[11px] leading-5 font-mono text-muted-foreground overflow-x-auto">
{`{
  "severity": "${vuln.severity}",
  "category": "${vuln.category}",
  "status": "${
    vuln.severity === "CRITICAL" ? "CRITICAL_BLOCKER" :
    vuln.severity === "HIGH" ? "CHANGES_REQUESTED" : "APPROVED"
  }"
}`}
              </pre>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
