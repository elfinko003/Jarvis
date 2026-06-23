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

// Approximates a 7-segment LED readout with tabular-nums + a heavy glow —
// no real segment font is bundled, this is the closest a system font gets.
export function MorningCountdown() {
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setElapsed(elapsedSinceDayStart());
    const interval = setInterval(() => setElapsed(elapsedSinceDayStart()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-[3px] text-text-dim">SEIT TAGESSTART</p>
      <p className="font-mono text-7xl font-bold tabular-nums text-orange [text-shadow:0_0_6px_var(--orange),0_0_22px_var(--orange),0_0_44px_var(--orange-dim)]">
        {pad(elapsed.h)}:{pad(elapsed.m)}:{pad(elapsed.s)}
      </p>
    </div>
  );
}
