"use client";

import { useEffect, useId, useRef } from "react";

const POINTS = 40;
const WIDTH = 400;
const HEIGHT = 70;

function buildPaths(data: number[]): { line: string; area: string } {
  const stepX = WIDTH / (data.length - 1);
  const coords = data.map((v, i) => [i * stepX, HEIGHT - v * HEIGHT] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  return { line, area };
}

export function Sparkline() {
  const gradientId = useId();
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dataRef = useRef<number[]>(Array.from({ length: POINTS }, () => 0.4 + Math.random() * 0.2));

  useEffect(() => {
    const paint = () => {
      const { line, area } = buildPaths(dataRef.current);
      lineRef.current?.setAttribute("d", line);
      areaRef.current?.setAttribute("d", area);
    };

    paint();

    const interval = setInterval(() => {
      const data = dataRef.current;
      const last = data[data.length - 1];
      const next = Math.min(0.95, Math.max(0.1, last + (Math.random() - 0.5) * 0.18));
      data.shift();
      data.push(next);
      paint();
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-[70px] w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={areaRef} fill={`url(#${gradientId})`} stroke="none" />
      <path ref={lineRef} fill="none" stroke="var(--green)" strokeWidth={1.5} />
    </svg>
  );
}
