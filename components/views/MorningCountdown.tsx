"use client";

import { useEffect, useState } from "react";
import { timeToMinutes } from "@/lib/events";

const DAY_START = "06:30";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function elapsedSinceDayStart(): { h: number; m: number; s: number } {
  const now = new Date();
  const startMinutes = timeToMinutes(DAY_START);
  const startMs = new Date(now);
  startMs.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

  let diffMs = now.getTime() - startMs.getTime();
  if (diffMs < 0) diffMs += 24 * 3_600_000; // day start already passed midnight rollover

  const totalSeconds = Math.floor(diffMs / 1000);
  return { h: Math.floor(totalSeconds / 3600), m: Math.floor((totalSeconds % 3600) / 60), s: totalSeconds % 60 };
}

// Tabular-nums readout — the heavy multi-layer LED glow is gone (UPDATE 1),
// just clean bright digits with a faint lift.
export function MorningCountdown() {
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setElapsed(elapsedSinceDayStart());
    const interval = setInterval(() => setElapsed(elapsedSinceDayStart()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-[3px] text-text-faint">Seit Tagesstart</p>
      <p className="font-mono text-7xl font-light tabular-nums text-text-bright [text-shadow:0_0_24px_rgba(255,255,255,0.1)]">
        {pad(elapsed.h)}:{pad(elapsed.m)}:{pad(elapsed.s)}
      </p>
    </div>
  );
}
