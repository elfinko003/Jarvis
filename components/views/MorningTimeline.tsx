"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/hud";
import { EVENTS, timeToMinutes } from "@/lib/events";

const CATEGORY_COLOR: Record<string, string> = {
  orange: "var(--orange-bright)",
  green: "var(--green)",
  salmon: "#e8a48c",
};

const DAY_START_MIN = Math.min(...EVENTS.map((e) => timeToMinutes(e.start)));
const DAY_END_MIN = Math.max(...EVENTS.map((e) => timeToMinutes(e.end)));
const DAY_SPAN_MIN = DAY_END_MIN - DAY_START_MIN;

function percent(minutes: number): number {
  return ((minutes - DAY_START_MIN) / DAY_SPAN_MIN) * 100;
}

export function MorningTimeline() {
  const [nowPercent, setNowPercent] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      setNowPercent(Math.min(100, Math.max(0, percent(nowMin))));
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Panel title="TAGESPLAN" className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 space-y-2.5 overflow-y-auto">
        {nowPercent !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 h-full w-px bg-text-bright/40"
            style={{ left: `${nowPercent}%` }}
          />
        )}

        {EVENTS.map((event) => {
          const left = percent(timeToMinutes(event.start));
          const width = percent(timeToMinutes(event.end)) - left;
          return (
            <div key={event.title} className="flex items-center gap-3">
              <div className="w-[150px] shrink-0">
                <p className="font-mono text-[10px] text-text-dim">
                  {event.start} – {event.end}
                </p>
                <p className="font-mono text-[11px] text-text-bright">{event.title}</p>
              </div>
              <div className="relative h-5 flex-1 rounded-md bg-bg-panel-2">
                <div
                  className="absolute top-0 h-full rounded-md opacity-80"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: CATEGORY_COLOR[event.category],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
