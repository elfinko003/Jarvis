"use client";

import { Panel } from "@/components/hud";
import { MiniSparkline } from "./MiniSparkline";
import type { MockAsset } from "@/lib/marketMock";

interface WatchlistEntry extends MockAsset {
  price: number;
  change: number;
  sparkline: number[];
}

interface MarketWatchlistProps {
  entries: WatchlistEntry[];
}

export function MarketWatchlist({ entries }: MarketWatchlistProps) {
  return (
    <Panel title="WATCHLIST" className="flex h-full flex-col">
      <div className="flex-1 space-y-2.5 overflow-y-auto">
        {entries.map((entry) => {
          const isUp = entry.change >= 0;
          return (
            <div key={entry.symbol} className="flex items-center justify-between gap-2 border-b border-border-dim pb-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[1px] text-text-bright">{entry.symbol}</p>
                <p className="truncate font-mono text-[9px] text-text-faint">{entry.name}</p>
              </div>
              <MiniSparkline data={entry.sparkline} color={isUp ? "var(--green)" : "var(--red)"} />
              <div className="text-right">
                <p className="font-mono text-[11px] text-text-bright">{entry.price.toFixed(2)}</p>
                <p className={`font-mono text-[9px] ${isUp ? "text-green" : "text-red"}`}>
                  {isUp ? "+" : ""}
                  {entry.change.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
