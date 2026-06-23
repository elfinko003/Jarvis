"use client";

import { useEffect, useRef } from "react";

const WIDTH = 100;
const HEIGHT = 28;

function buildPath(data: number[]): string {
  if (data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = WIDTH / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * stepX;
      const y = HEIGHT - ((v - min) / range) * HEIGHT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface MiniSparklineProps {
  data: number[];
  color: string;
}

// Imperatively paints the path via a ref instead of putting `data` straight
// into JSX, mirroring Sparkline.tsx — keeps the random-walk data entirely
// out of the server-rendered markup so there's nothing for hydration to
// mismatch on.
export function MiniSparkline({ data, color }: MiniSparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    pathRef.current?.setAttribute("d", buildPath(data));
  }, [data]);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-7 w-[100px]">
      <path ref={pathRef} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}
