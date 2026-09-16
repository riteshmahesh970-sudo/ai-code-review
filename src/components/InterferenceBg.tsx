import { useRef, useEffect, useState, useCallback } from "react";

export function InterferenceBg({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    setMounted(true);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Smooth interpolation loop for mouse-reactive wave positions
  useEffect(() => {
    if (!mounted) return;
    let smoothX = 0.5;
    let smoothY = 0.5;
    const animate = () => {
      smoothX += (mouseRef.current.x - smoothX) * 0.03;
      smoothY += (mouseRef.current.y - smoothY) * 0.03;
      setMouse({ x: smoothX, y: smoothY });
      timeRef.current += 0.005;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted]);

  // Dynamic wave source positions influenced by mouse
  const src1 = { x: 25 + mouse.x * 20, y: 20 + mouse.y * 15 };
  const src2 = { x: 65 - mouse.x * 15, y: 35 + mouse.y * 10 };
  const src3 = { x: 45 + mouse.x * 10, y: 75 - mouse.y * 20 };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {/* SVG turbulence filter for noise texture */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="interference-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.015 0.015" numOctaves="3" seed="2" result="noise1" />
            <feTurbulence type="turbulence" baseFrequency="0.02 0.025" numOctaves="3" seed="7" result="noise2" />
            <feTurbulence type="turbulence" baseFrequency="0.01 0.018" numOctaves="2" seed="13" result="noise3" />
            <feMerge result="merged">
              <feMergeNode in="noise1" />
              <feMergeNode in="noise2" />
              <feMergeNode in="noise3" />
            </feMerge>
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

      {/* Noise texture layer */}
      <div
        className="absolute inset-0"
        style={{ filter: "url(#interference-filter)", mixBlendMode: "multiply" }}
      />

      {/* Mouse-reactive wave rings */}
      {mounted && (
        <div className="absolute inset-0" style={{ mixBlendMode: "soft-light", opacity: 0.5 }}>
          <div
            className="absolute rounded-full"
            style={{
              width: "120vmax",
              height: "120vmax",
              top: `${src1.y}%`,
              left: `${src1.x}%`,
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 18px, oklch(0.55 0.06 260 / 0.03) 19px, transparent 20px)",
              transition: "top 0.8s cubic-bezier(0.22,1,0.36,1), left 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "100vmax",
              height: "100vmax",
              top: `${src2.y}%`,
              left: `${src2.x}%`,
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 22px, oklch(0.55 0.06 260 / 0.03) 23px, transparent 24px)",
              transition: "top 1s cubic-bezier(0.22,1,0.36,1), left 1s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "140vmax",
              height: "140vmax",
              top: `${src3.y}%`,
              left: `${src3.x}%`,
              transform: "translate(-50%, -50%)",
              background:
                "repeating-radial-gradient(circle at center, transparent 0px, transparent 26px, oklch(0.55 0.06 260 / 0.025) 27px, transparent 28px)",
              transition: "top 1.2s cubic-bezier(0.22,1,0.36,1), left 1.2s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      )}

      {/* Fine cross-hatched interference lines */}
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
