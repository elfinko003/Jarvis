import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface PanelProps {
  title?: string;
  rightText?: string;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, rightText, className, children }: PanelProps) {
  return (
    <div className={`glass-surface relative overflow-hidden rounded-2xl p-4 ${className ?? ""}`}>
      {title && <Eyebrow text={title} rightText={rightText} className="mb-3" />}
      {children}
    </div>
  );
}
