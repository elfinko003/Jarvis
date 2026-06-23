"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { Panel, GlowText } from "@/components/hud";
import { useCountUp } from "@/lib/useCountUp";
import type { FeaturedMetric } from "@/lib/metrics";

interface PipelineFeaturedTileProps {
  metric: FeaturedMetric;
}

export function PipelineFeaturedTile({ metric }: PipelineFeaturedTileProps) {
  const animatedValue = useCountUp(metric.value, 1600);
  const points = metric.history.map((value, i) => ({ i, value }));

  return (
    <Panel className="flex h-full flex-col">
      <p className="font-mono text-[10px] uppercase tracking-[2px] text-text-dim">{metric.label}</p>

      <div className="mt-2 flex items-baseline gap-3">
        <GlowText className="font-display text-6xl font-black text-text-bright">
          {animatedValue.toFixed(0)}
        </GlowText>
        {metric.unit && <span className="font-mono text-sm text-text-dim">{metric.unit}</span>}
        <span className={`font-mono text-[12px] ${metric.changePercent >= 0 ? "text-green" : "text-red"}`}>
          {metric.changePercent >= 0 ? "▲" : "▼"} {metric.changePercent >= 0 ? "+" : ""}
          {metric.changePercent.toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pipelineFeaturedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--orange)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--orange)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--orange-bright)"
              strokeWidth={1.75}
              fill="url(#pipelineFeaturedGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
