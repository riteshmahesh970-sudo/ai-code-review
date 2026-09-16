import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-9 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm" />;
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative size-9 cursor-pointer rounded-xl border border-border/50 bg-card/60 backdrop-blur-md overflow-hidden group transition-all duration-300 hover:shadow-lg"
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Ambient glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle at 50% 50%, oklch(0.55 0.06 260 / 0.15), transparent 70%)",
        }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !isDark ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle at 50% 50%, oklch(0.85 0.12 85 / 0.2), transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: 10, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="size-4 text-accent-slate" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 10, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="size-4 text-amber-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
