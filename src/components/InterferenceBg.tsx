import { useRef, useEffect, useState } from "react";

export function InterferenceBg({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {/* SVG filter for the interference texture */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="interference-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015 0.015"
              numOctaves="3"
              seed="2"
              result="noise1"
            />
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02 0.025"
              numOctaves="3"
              seed="7"
              result="noise2"
            />
            <feTurbulence
              type="turbulence"
              baseFrequency="0.01 0.018"
              numOctaves="2"
              seed="13"
              result="noise3"
            />
            {/* Merge the three noise layers to create interference */}
            <feMerge result="merged">
              <feMergeNode in="noise1" />
              <feMergeNode in="noise2" />
              <feMergeNode in="noise3" />
            </feMerge>
            {/* Add a subtle color tint */}
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.65
                      0 0 0 0 0.68
                      0 0 0 0 0.75
                      0 0 0 0.08 0"
              in="merged"
            />
          </filter>
        </defs>
      </svg>

      {/* Interference layer via SVG filter */}
      <div
        className="absolute inset-0"
        style={{
          filter: "url(#interference-filter)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Animated wave rings — multiple overlapping radial wave sources */}
      {mounted && (
        <div className="absolute inset-0" style={{ mixBlendMode: "soft-light", opacity: 0.5 }}>
          {/* Source 1 */}
          <div
            className="absolute rounded-full border border-accent-slate/10"
            style={{
              width: "120vmax",
              height: "120vmax",
              top: "20%",
              left: "25%",
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 18px, oklch(0.55 0.06 260 / 0.03) 19px, transparent 20px)",
              animation: "interference-drift 20s ease-in-out infinite alternate",
            }}
          />
          {/* Source 2 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "100vmax",
              height: "100vmax",
              top: "35%",
              left: "65%",
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 22px, oklch(0.55 0.06 260 / 0.03) 23px, transparent 24px)",
              animation: "interference-drift2 25s ease-in-out infinite alternate",
            }}
          />
          {/* Source 3 — bottom center */}
          <div
            className="absolute rounded-full"
            style={{
              width: "140vmax",
              height: "140vmax",
              top: "75%",
              left: "45%",
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 26px, oklch(0.55 0.06 260 / 0.025) 27px, transparent 28px)",
              animation: "interference-drift3 30s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {/* Subtle linear wave overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, oklch(0.55 0.06 260 / 0.008) 4px, transparent 5px), " +
            "repeating-linear-gradient(60deg, transparent 0px, transparent 5px, oklch(0.55 0.06 260 / 0.006) 6px, transparent 7px), " +
            "repeating-linear-gradient(120deg, transparent 0px, transparent 4px, oklch(0.55 0.06 260 / 0.005) 5px, transparent 6px)",
          animation: "interference-scroll 40s linear infinite",
        }}
      />
    </div>
  );
}
