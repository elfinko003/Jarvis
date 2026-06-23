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
    <div className="flex items-center gap-4 font-mono">
      <div className="flex items-end gap-3 border-r border-border-dim pr-4">
        <span
          suppressHydrationWarning
          className="font-display text-[34px] font-black leading-none text-orange [text-shadow:0_0_10px_var(--orange)]"
        >
          {day}
        </span>
        <div className="flex flex-col gap-0.5 pb-0.5 leading-tight">
          <span suppressHydrationWarning className="text-[11px] tracking-[2px] text-text-bright">
            {time}
          </span>
          <span suppressHydrationWarning className="text-[9px] tracking-[2px] text-text-dim">
            {month} · {year}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 pb-0.5">
        <span className="text-[9px] tracking-[2px] text-text-dim">LAT: 14ms</span>
        <div className="flex items-end gap-[2px]">
          {SIGNAL_BAR_HEIGHTS.map((height, i) => (
            <span
              key={i}
              style={{ height }}
              className={
                i < ACTIVE_SIGNAL_BARS
                  ? "w-[3px] bg-orange shadow-[0_0_4px_var(--orange)]"
                  : "w-[3px] bg-text-faint"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
