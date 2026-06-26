import type { ReactNode } from "react";

interface GlowTextProps {
  children: ReactNode;
  className?: string;
}

// Glow all but removed (UPDATE 1) — a faint lift instead of a neon shadow.
export function GlowText({ children, className }: GlowTextProps) {
  return (
    <span className={`[text-shadow:0_0_20px_rgba(255,255,255,0.12)] ${className ?? ""}`}>
      {children}
    </span>
  );
}
