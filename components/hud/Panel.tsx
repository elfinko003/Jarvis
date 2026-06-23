import type { ReactNode } from "react";
import { HudCorner } from "./HudCorner";
import { Eyebrow } from "./Eyebrow";

interface PanelProps {
  title?: string;
  rightText?: string;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, rightText, className, children }: PanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2px] border border-border-dim p-3.5 [background:linear-gradient(160deg,var(--bg-panel),#0d0d10)] ${className ?? ""}`}
    >
      <HudCorner />
      {title && <Eyebrow text={title} rightText={rightText} className="mb-2.5" />}
      {children}
    </div>
  );
}
