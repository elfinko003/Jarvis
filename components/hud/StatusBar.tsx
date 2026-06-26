"use client";

import { useEffect, useState } from "react";

const MONTHS_DE = [
  "JAN",
  "FEB",
  "MÄR",
  "APR",
  "MAI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEZ",
];

const SIGNAL_BAR_HEIGHTS = [4, 7, 10, 13, 16];
const ACTIVE_SIGNAL_BARS = 4;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const day = now.getDate();
  const month = MONTHS_DE[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div className="glass-surface flex items-center gap-4 rounded-full px-4 py-1.5 font-mono">
      <div className="flex flex-col leading-tight">
        <span suppressHydrationWarning className="text-[11px] tracking-[1px] text-text-bright">
          {time}
        </span>
        <span suppressHydrationWarning className="text-[9px] tracking-[1px] text-text-faint">
          {day} {month} {year}
        </span>
      </div>

      <div className="flex items-end gap-[2px] border-l border-white/[0.08] pl-3">
        {SIGNAL_BAR_HEIGHTS.map((height, i) => (
          <span
            key={i}
            style={{ height }}
            className={i < ACTIVE_SIGNAL_BARS ? "w-[3px] rounded-full bg-text-dim" : "w-[3px] rounded-full bg-text-faint"}
          />
        ))}
      </div>
    </div>
  );
}
