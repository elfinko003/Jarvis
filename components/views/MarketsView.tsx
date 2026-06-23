"use client";

import { useEffect, useState } from "react";
import { JarvisLayout, Panel } from "@/components/hud";
import { MarketIndexTile } from "./MarketIndexTile";
import { MarketMainChart } from "./MarketMainChart";
import { MarketHeatmap } from "./MarketHeatmap";
import { MarketCandlestick } from "./MarketCandlestick";
import { MarketLineChart } from "./MarketLineChart";
import { MarketWatchlist } from "./MarketWatchlist";
import {
  HEATMAP_TICKERS,
  STOCK_INDICES,
  WATCHLIST,
  buildInitialSeries,
  stepSeries,
  type MockAsset,
} from "@/lib/marketMock";
import type { Candle, CryptoSummary } from "@/app/api/markets/route";

const STEP_INTERVAL_MS = 2500;
const POLL_MARKETS_MS = 60_000;

interface IndexState extends MockAsset {
  price: number;
  change: number;
  history: number[];
}

interface HeatmapState extends MockAsset {
  change: number;
}

interface WatchlistState extends MockAsset {
  price: number;
  change: number;
  sparkline: number[];
}

function flatIndices(): IndexState[] {
  return STOCK_INDICES.map((idx) => ({ ...idx, price: idx.basePrice, change: idx.baseChange, history: Array(40).fill(idx.basePrice) }));
}

function flatHeatmap(): HeatmapState[] {
  return HEATMAP_TICKERS.map((t) => ({ ...t, change: t.baseChange }));
}

function flatWatchlist(): WatchlistState[] {
  return WATCHLIST.map((w) => ({ ...w, price: w.basePrice, change: w.baseChange, sparkline: Array(20).fill(w.basePrice) }));
}

export function MarketsView() {
  // Deterministic flat-line initial state so server-render and first client
  // hydration match exactly — random walks only start after mount (see the
  // effects below), which is a normal post-hydration state update, not a
  // hydration mismatch.
  const [indices, setIndices] = useState<IndexState[]>(flatIndices);
  const [heatmap, setHeatmap] = useState<HeatmapState[]>(flatHeatmap);
  const [watchlist, setWatchlist] = useState<WatchlistState[]>(flatWatchlist);
  const [crypto, setCrypto] = useState<CryptoSummary[]>([]);
  const [btcCandles, setBtcCandles] = useState<Candle[]>([]);

  useEffect(() => {
    setIndices((prev) => prev.map((idx) => ({ ...idx, history: buildInitialSeries(idx.basePrice) })));
    setWatchlist((prev) => prev.map((w) => ({ ...w, sparkline: buildInitialSeries(w.basePrice, 20) })));

    const interval = setInterval(() => {
      setIndices((prev) =>
        prev.map((idx) => {
          const history = stepSeries(idx.history, 0.006);
          const price = history[history.length - 1];
          const change = ((price - idx.basePrice) / idx.basePrice) * 100;
          return { ...idx, price, change, history };
        })
      );
      setHeatmap((prev) =>
        prev.map((t) => ({ ...t, change: t.change + (Math.random() - 0.5) * 0.3 }))
      );
      setWatchlist((prev) =>
        prev.map((w) => {
          const sparkline = stepSeries(w.sparkline, 0.01, 20);
          const price = sparkline[sparkline.length - 1];
          const change = ((price - w.basePrice) / w.basePrice) * 100;
          return { ...w, price, change, sparkline };
        })
      );
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/markets");
        const data = await res.json();
        if (cancelled) return;
        setCrypto(data.crypto ?? []);
        setBtcCandles(data.btcCandles ?? []);
      } catch {
        // keep whatever data we already have
      }
    };

    load();
    const poll = setInterval(load, POLL_MARKETS_MS);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, []);

  const btc = crypto.find((c) => c.id === "bitcoin");
  const dax = indices.find((i) => i.symbol === "DAX");
  const nasdaq = indices.find((i) => i.symbol === "NASDAQ");

  return (
    <JarvisLayout module="AKTIEN // MÄRKTE">
      <div className="flex h-full gap-3">
        <div className="h-full w-[260px] shrink-0">
          <MarketWatchlist entries={watchlist} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex gap-3">
            {indices.map((idx) => (
              <MarketIndexTile key={idx.symbol} symbol={idx.symbol} price={idx.price} change={idx.change} decimals={0} />
            ))}
            {btc && (
              <MarketIndexTile symbol="BTC/USD" price={btc.price} change={btc.change24h} decimals={0} />
            )}
          </div>

          <Panel title={`HAUPTINDEX · ${dax?.symbol ?? "DAX"}`} className="flex-[3] min-h-0">
            <div className="h-full">
              <MarketMainChart data={dax?.history ?? []} />
            </div>
          </Panel>

          <Panel title="HEATMAP · DAX-WERTE">
            <MarketHeatmap entries={heatmap} />
          </Panel>

          <div className="flex flex-[2] min-h-0 gap-3">
            <Panel title="BTC/USD · 7D" className="flex-1 min-h-0">
              <div className="h-full">
                <MarketCandlestick candles={btcCandles} />
              </div>
            </Panel>
            <Panel title={`${nasdaq?.symbol ?? "NASDAQ"} · LIVE`} className="flex-1 min-h-0">
              <div className="h-full">
                <MarketLineChart data={nasdaq?.history ?? []} color="var(--green)" />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </JarvisLayout>
  );
}
