"use client";

interface TickerProps {
  items: string[];
}

export function Ticker({ items }: TickerProps) {
  const content = items.join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  return (
    <div className="relative z-10 h-7 w-full overflow-hidden border-t border-border-dim bg-bg-black/80 font-mono text-[10px] tracking-[1px] text-text-dim">
      <div className="ticker-track absolute top-0 flex h-full w-max items-center whitespace-nowrap will-change-transform">
        <span className="px-4" dangerouslySetInnerHTML={{ __html: content }} />
        <span aria-hidden className="px-4" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
