"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

interface MarketMainChartProps {
  data: number[];
}

export function MarketMainChart({ data }: MarketMainChartProps) {
  const points = data.map((value, i) => ({ i, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="mainChartGradient" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#mainChartGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
