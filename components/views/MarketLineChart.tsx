"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface MarketLineChartProps {
  data: number[];
  color?: string;
}

export function MarketLineChart({ data, color = "var(--green)" }: MarketLineChartProps) {
  const points = data.map((value, i) => ({ i, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <YAxis domain={["auto", "auto"]} hide />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
