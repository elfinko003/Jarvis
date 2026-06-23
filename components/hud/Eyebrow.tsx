interface EyebrowProps {
  text: string;
  rightText?: string;
  className?: string;
}

export function Eyebrow({ text, rightText, className }: EyebrowProps) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${className ?? ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-[3px] text-orange">
        ▸ {text}
      </span>
      {rightText && (
        <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[2px] text-text-dim">
          {rightText}
        </span>
      )}
    </div>
  );
}
