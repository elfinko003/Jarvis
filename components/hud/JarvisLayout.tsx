"use client";

import type { ReactNode } from "react";
import { ScanLines } from "./ScanLines";
import { StatusBar } from "./StatusBar";
import { Ticker } from "./Ticker";

const DEFAULT_TICKER_ITEMS = [
  'DAX <b class="text-text-bright">18.339</b> <span class="text-green">+0.42%</span>',
  'BTC <b class="text-text-bright">61.200€</b> <span class="text-red">-1.10%</span>',
  'WETTER TRIER <b class="text-text-bright">14°C</b> BEWÖLKT',
  'NÄCHSTER TERMIN <b class="text-text-bright">16:00</b> NORDIC FORGE CALL',
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
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_42%,rgba(191,224,255,0.035),transparent_55%),radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]"
      />
      <div aria-hidden className="jarvis-particles pointer-events-none absolute inset-0 z-0" />
      <ScanLines />

      <header className="relative z-10 flex items-start gap-4 px-6 pt-5">
        <div className="text-[14px] font-medium uppercase tracking-[4px]">
          <span className="text-text-bright">JARVIS</span>
          <span className="text-text-faint"> · </span>
          <span className="text-text-dim">{module}</span>
        </div>
        <div className="flex flex-1 items-center justify-center pt-1">{headerCenter}</div>
        <StatusBar />
      </header>

      <main className="relative z-10 min-h-0 flex-1 px-6 py-4">{children}</main>

      <Ticker items={tickerItems ?? DEFAULT_TICKER_ITEMS} />
    </div>
  );
}
