"use client";

import type { MockAsset } from "@/lib/marketMock";

interface HeatmapEntry extends MockAsset {
  change: number;
}

interface MarketHeatmapProps {
  entries: HeatmapEntry[];
}

export function MarketHeatmap({ entries }: MarketHeatmapProps) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {entries.map((entry) => {
        const isUp = entry.change >= 0;
        const intensity = Math.min(1, Math.abs(entry.change) / 3);
        return (
          <div
            key={entry.symbol}
            className="flex flex-col items-center justify-center rounded-[2px] border py-2"
            style={{
              borderColor: isUp ? "var(--green-dim)" : "var(--red)",
              backgroundColor: isUp
                ? `rgba(0, 255, 136, ${0.08 + intensity * 0.18})`
                : `rgba(255, 51, 68, ${0.08 + intensity * 0.18})`,
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[1px] text-text-bright">{entry.symbol}</span>
            <span className={`font-mono text-[9px] ${isUp ? "text-green" : "text-red"}`}>
              {isUp ? "+" : ""}
              {entry.change.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
