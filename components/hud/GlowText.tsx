import type { ReactNode } from "react";

interface GlowTextProps {
  children: ReactNode;
  className?: string;
}

export function GlowText({ children, className }: GlowTextProps) {
  return (
    <span className={`[text-shadow:0_0_8px_var(--orange)] ${className ?? ""}`}>
      {children}
    </span>
  );
}
