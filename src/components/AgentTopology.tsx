import { motion } from "framer-motion";
import {
  Brain,
  Cpu,
  Zap,
  Shield,
  FileJson,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const pulse = {
  animate: { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

interface NodeProps {
  icon: typeof Cpu;
  label: string;
  sub?: string;
  color: string;
  ringColor: string;
  delay: number;
  active: boolean;
}

function TopoNode({ icon: Icon, label, sub, color, ringColor, delay, active }: NodeProps) {
  return (
    <motion.div
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        {active && (
          <motion.div
            className={`absolute -inset-2 rounded-2xl ${ringColor}`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: delay * 0.2 }}
          />
        )}
        <div className={`relative flex size-14 items-center justify-center rounded-2xl border border-border/50 bg-card ${color} shadow-md`}>
          <Icon className="size-6" />
        </div>
      </div>
      <p className="text-xs font-semibold text-center leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground text-center">{sub}</p>}
    </motion.div>
  );
}

function FlowArrow({ delay }: { delay: number }) {
  return (
    <motion.div
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="flex items-center self-start mt-4"
    >
      <div className="w-8 h-px bg-border/80" />
      <motion.div
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight className="size-3.5 text-muted-foreground/40" />
      </motion.div>
      <div className="w-8 h-px bg-border/80" />
    </motion.div>
  );
}

export function AgentTopology({ isRunning = false }: { isRunning?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6"
        >
          Agent Topology
        </motion.p>
      </motion.div>

      {/* Desktop: horizontal layout */}
      <div className="hidden sm:flex items-start justify-center gap-4">
        {/* Orchestrator */}
        <TopoNode
          icon={Brain}
          label="Orchestrator"
          sub="Routes & decomposes"
          color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          ringColor="bg-violet-500/20"
          delay={1}
          active={isRunning}
        />

        <FlowArrow delay={2} />

        {/* Sub-agents column */}
        <div className="flex flex-col gap-3">
          <TopoNode
            icon={Cpu}
            label="Code_Analyzer"
            sub="Fast tier"
            color="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
            ringColor="bg-slate-400/20"
            delay={3}
            active={isRunning}
          />
          <TopoNode
            icon={Zap}
            label="Logic_Reasoner"
            sub="Advanced"
            color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            ringColor="bg-amber-400/20"
            delay={4}
            active={isRunning}
          />
          <TopoNode
            icon={Shield}
            label="Security_Auditor"
            sub="Domain"
            color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            ringColor="bg-red-400/20"
            delay={5}
            active={isRunning}
          />
        </div>

        <FlowArrow delay={6} />

        {/* Output */}
        <TopoNode
          icon={FileJson}
          label="JSON Report"
          sub="Structured output"
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          ringColor="bg-emerald-400/20"
          delay={7}
          active={isRunning}
        />
      </div>

      {/* Mobile: vertical layout */}
      <div className="sm:hidden flex flex-col items-center gap-0">
        <TopoNode
          icon={Brain}
          label="Orchestrator"
          sub="Routes & decomposes"
          color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          ringColor="bg-violet-500/20"
          delay={1}
          active={isRunning}
        />
        <div className="w-px h-6 bg-border/80" />
        <div className="flex gap-3">
          {[
            { icon: Cpu, label: "Code_Analyzer", color: "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400", ring: "bg-slate-400/20" },
            { icon: Zap, label: "Logic_Reasoner", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400", ring: "bg-amber-400/20" },
            { icon: Shield, label: "Security_Auditor", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400", ring: "bg-red-400/20" },
          ].map((a, i) => (
            <TopoNode
              key={a.label}
              icon={a.icon}
              label={a.label}
              color={a.color}
              ringColor={a.ring}
              delay={2 + i}
              active={isRunning}
            />
          ))}
        </div>
        <div className="w-px h-6 bg-border/80" />
        <TopoNode
          icon={FileJson}
          label="JSON Report"
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          ringColor="bg-emerald-400/20"
          delay={5}
          active={isRunning}
        />
      </div>
    </div>
  );
}
