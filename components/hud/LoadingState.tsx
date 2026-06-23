interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "LADE", className }: LoadingStateProps) {
  return (
    <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-orange/80 ${className ?? ""}`}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-bright shadow-[0_0_6px_var(--orange-bright)]" />
      <span className="animate-pulse">▸ {label}…</span>
    </div>
  );
}

interface ErrorStateProps {
  label?: string;
  className?: string;
}

export function ErrorState({ label = "SIGNAL VERLOREN", className }: ErrorStateProps) {
  return (
    <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-red ${className ?? ""}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-red shadow-[0_0_6px_var(--red)]" />
      <span>✕ {label}</span>
    </div>
  );
}
