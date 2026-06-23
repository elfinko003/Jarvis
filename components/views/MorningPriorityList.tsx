import { Panel } from "@/components/hud";
import { PRIORITIES, type PriorityLevel } from "@/lib/events";

const PRIORITY_ICON: Record<PriorityLevel, string> = {
  critical: "🔺",
  medium: "🟡",
  done: "🟢",
};

export function MorningPriorityList() {
  return (
    <Panel title="PRIORITÄTS-LISTE" className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto">
        {PRIORITIES.map((item) => (
          <div key={item.title} className="flex items-start gap-2.5 border-b border-border-dim pb-2.5">
            <span className="text-base leading-none">{PRIORITY_ICON[item.priority]}</span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] text-text-bright">{item.title}</p>
              <p className="mt-0.5 font-mono text-[9px] text-text-faint">{item.subtitle}</p>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-text-dim">{item.estimateMinutes} min</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
