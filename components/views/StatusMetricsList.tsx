import { Panel } from "@/components/hud";

interface Metric {
  label: string;
  value: string;
  tone?: "green" | "orange";
}

const METRICS: Metric[] = [
  { label: "CPU LOAD", value: "34%", tone: "orange" },
  { label: "MEMORY", value: "8.2GB" },
  { label: "UPTIME", value: "14:32:07" },
  { label: "THREATS", value: "0", tone: "green" },
  { label: "LATENCY", value: "14ms", tone: "green" },
  { label: "NETWORK IN", value: "842 KB/s" },
  { label: "NETWORK OUT", value: "310 KB/s" },
  { label: "DISK I/O", value: "12%", tone: "green" },
  { label: "ACTIVE SESSIONS", value: "3" },
  { label: "VOICE ENGINE", value: "ONLINE", tone: "green" },
  { label: "SATELLITE LINK", value: "ESTABLISHED", tone: "green" },
  { label: "SMART HOME GRID", value: "CONNECTED", tone: "green" },
];

const TONE_CLASS: Record<string, string> = {
  green: "text-green",
  orange: "text-orange",
};

export function StatusMetricsList() {
  return (
    <Panel title="SYSTEM // METRICS" rightText="12 NODES" className="flex h-full flex-col">
      <div className="mt-1 flex flex-1 flex-col justify-between gap-[5px] font-mono text-[11px]">
        {METRICS.map((m) => (
          <div key={m.label} className="flex items-baseline gap-2 text-text-dim">
            <span className="whitespace-nowrap">{m.label}</span>
            <span className="mx-1 flex-1 border-b border-dotted border-text-faint" />
            <span className={TONE_CLASS[m.tone ?? ""] ?? "text-text-bright"}>{m.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
