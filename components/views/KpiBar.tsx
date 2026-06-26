"use client";

import { Panel } from "@/components/hud";
import { useCountUp } from "@/lib/useCountUp";

interface Kpi {
  label: string;
  value: number;
  suffix: string;
  delta: string;
  positive: boolean;
}

const KPIS: Kpi[] = [
  { label: "UMSATZ HEUTE", value: 71350, suffix: " €", delta: "+12,4% ▲", positive: true },
  { label: "PIPELINE WERT", value: 52000, suffix: " €", delta: "+4,1% ▲", positive: true },
  { label: "OFFENE POSTEN", value: 24760, suffix: " €", delta: "-3,2% ▼", positive: false },
  { label: "AKTIVE TASKS", value: 170, suffix: "", delta: "+8 ▲", positive: true },
];

function KpiTile({ kpi }: { kpi: Kpi }) {
  const animated = useCountUp(kpi.value);
  const formatted = Math.round(animated).toLocaleString("de-DE");

  return (
    <Panel className="flex-1">
      <p className="font-mono text-[10px] uppercase tracking-[2px] text-text-dim">{kpi.label}</p>
      <p className="mt-1 text-2xl font-light text-text-bright">
        {formatted}
        {kpi.suffix}
      </p>
      <p
        className={`mt-1 font-mono text-[10px] uppercase tracking-[1px] ${
          kpi.positive ? "text-green" : "text-red"
        }`}
      >
        {kpi.delta}
      </p>
    </Panel>
  );
}

export function KpiBar() {
  return (
    <div className="flex gap-3">
      {KPIS.map((kpi) => (
        <KpiTile key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
