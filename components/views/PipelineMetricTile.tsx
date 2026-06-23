"use client";

import { useId } from "react";
import { Panel, GlowText } from "@/components/hud";
import { useCountUp } from "@/lib/useCountUp";
import type { Metric } from "@/lib/metrics";

function formatNumber(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function MiniSparkline({ history }: { history: number[] }) {
  const gradientId = useId();
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const stepX = width / (history.length - 1);
  const points = history.map((v, i) => [i * stepX, height - ((v - min) / range) * height] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orange)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="var(--orange)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} stroke="none" />
      <path d={line} fill="none" stroke="var(--orange-bright)" strokeWidth={1.5} />
    </svg>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const animatedPercent = useCountUp(percent, 1200);
  const offset = circumference * (1 - animatedPercent / 100);

  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--border-dim)" strokeWidth={5} />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="var(--orange-bright)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

interface PipelineMetricTileProps {
  metric: Metric;
}

export function PipelineMetricTile({ metric }: PipelineMetricTileProps) {
  const animatedValue = useCountUp(metric.value, 1400);

  return (
    <Panel className="flex flex-col justify-between">
      <p className="font-mono text-[9px] uppercase tracking-[2px] text-text-dim">{metric.label}</p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <GlowText className="font-display text-4xl font-black text-text-bright">
          {formatNumber(animatedValue)}
          {metric.unit && <span className="ml-1 text-base font-normal text-text-dim">{metric.unit}</span>}
        </GlowText>
        {metric.kind === "progress_ring" && <ProgressRing percent={metric.percent} />}
      </div>

      {metric.kind === "change" && (
        <p className={`mt-2 font-mono text-[11px] ${metric.changePercent >= 0 ? "text-green" : "text-red"}`}>
          {metric.changePercent >= 0 ? "▲" : "▼"} {metric.changePercent >= 0 ? "+" : ""}
          {metric.changePercent.toFixed(1)}%
        </p>
      )}

      {metric.kind === "progress_bar" && (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-panel-2">
            <div
              className="h-full rounded-full bg-orange-bright transition-[width] duration-700"
              style={{ width: `${Math.min(100, (metric.value / metric.goal) * 100)}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-[9px] text-text-faint">Ziel {metric.goal.toLocaleString("de-DE")}</p>
        </div>
      )}

      {metric.kind === "sparkline" && (
        <div className="mt-1.5">
          <MiniSparkline history={metric.history} />
        </div>
      )}
    </Panel>
  );
}
