"use client";

import type { ReactNode } from "react";
import { ScanLines } from "./ScanLines";
import { StatusBar } from "./StatusBar";
import { Ticker } from "./Ticker";

const DEFAULT_TICKER_ITEMS = [
  'DAX <b class="text-orange-bright">18.339</b> <span class="text-green">+0.42%</span>',
  'BTC <b class="text-orange-bright">61.200€</b> <span class="text-red">-1.10%</span>',
  'WETTER TRIER <b class="text-orange-bright">14°C</b> BEWÖLKT',
  'NÄCHSTER TERMIN <b class="text-orange-bright">16:00</b> NORDIC FORGE CALL',
];

interface JarvisLayoutProps {
  module: string;
  children: ReactNode;
  tickerItems?: string[];
  headerCenter?: ReactNode;
}

export function JarvisLayout({ module, children, tickerItems, headerCenter }: JarvisLayoutProps) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg-black text-text-bright">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_42%,rgba(255,69,0,0.07),transparent_55%),radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75)_100%)]"
      />
      <div aria-hidden className="jarvis-particles pointer-events-none absolute inset-0 z-0" />
      <ScanLines />

      <header className="relative z-10 flex items-start gap-4 px-6 pt-5">
        <div className="font-display text-[15px] font-black uppercase tracking-[3px]">
          <span className="text-orange [text-shadow:0_0_10px_var(--orange)]">JARVIS</span>
          <span className="text-text-dim"> // </span>
          <span className="text-text-bright">{module}</span>
        </div>
        <div className="flex flex-1 items-center justify-center pt-1">{headerCenter}</div>
        <StatusBar />
      </header>

      <main className="relative z-10 min-h-0 flex-1 px-6 py-4">{children}</main>

      <Ticker items={tickerItems ?? DEFAULT_TICKER_ITEMS} />
    </div>
  );
}
