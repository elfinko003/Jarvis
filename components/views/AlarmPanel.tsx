import { Panel } from "@/components/hud";

const ALARMS = ["⚠ KRITISCH: SERVER LOAD HIGH", "⚠ WARNUNG: BACKUP ÜBERFÄLLIG"];

export function AlarmPanel() {
  return (
    <Panel title="ALARME // EREIGNISSE" rightText="2 AKTIV" className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-2">
        {ALARMS.map((a) => (
          <div
            key={a}
            className="rounded-xl border border-red/25 bg-red/[0.06] px-3 py-2 font-mono text-[10px] uppercase tracking-[1px] text-red"
          >
            {a}
          </div>
        ))}
      </div>

      <div className="relative mt-1 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/[0.06]">
        <div className="absolute inset-0 [background:linear-gradient(135deg,#0d1220,#05070e)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-text-dim">
            ▶
          </span>
        </div>
        <p className="absolute bottom-0 left-0 right-0 bg-bg-black/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[1px] text-text-dim">
          SAT-FEED · LIVE BRIEFING VERFÜGBAR
        </p>
      </div>
    </Panel>
  );
}
