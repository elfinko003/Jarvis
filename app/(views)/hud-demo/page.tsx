import { JarvisLayout, Panel, Eyebrow, GlowText, HudCorner } from "@/components/hud";

export default function HudDemoPage() {
  return (
    <JarvisLayout module="HUD DEMO">
      <div className="grid h-full grid-cols-3 gap-4">
        <Panel title="NETZWERK // STATUS" rightText="LIVE">
          <div className="flex flex-col gap-2 pt-1">
            <p className="font-mono text-[11px] text-text-dim">
              CPU LOAD <span className="float-right text-green">34%</span>
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              MEMORY <span className="float-right text-orange">8.2GB</span>
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              UPTIME <span className="float-right text-text-bright">14:32</span>
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              THREATS <span className="float-right text-green">0</span>
            </p>
          </div>
        </Panel>

        <Panel title="REAKTOR // CORE" rightText="ONLINE">
          <div className="flex h-full flex-col items-center justify-center gap-3 pt-1">
            <GlowText className="font-display text-3xl font-black text-orange">
              71.350€
            </GlowText>
            <p className="font-mono text-[10px] uppercase tracking-[2px] text-green">
              +12,4% ▲
            </p>
          </div>
        </Panel>

        <Panel title="PIPELINE // ZAHLEN" rightText="UPDATED 21:00">
          <div className="flex flex-col gap-2 pt-1">
            <p className="font-mono text-[11px] text-text-dim">
              OFFENE TASKS <span className="float-right text-orange-bright">170</span>
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              LERNSTUNDEN <span className="float-right text-text-bright">24,7</span>
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              ALARME <span className="float-right text-red">2</span>
            </p>
          </div>
        </Panel>

        <Panel className="col-span-2" title="GLOW-TEXT // PROBE">
          <div className="flex flex-col gap-3 pt-2">
            <GlowText className="font-display text-2xl font-black uppercase tracking-[2px] text-orange">
              ALL SYSTEMS OPERATIONAL
            </GlowText>
            <GlowText className="font-mono text-sm text-orange-bright">
              GOOD EVENING, JONAH.
            </GlowText>
            <p className="font-mono text-xs text-text-faint">
              text-faint reference line — kein Glow, niedrigste Hierarchie.
            </p>
          </div>
        </Panel>

        <div className="glass-surface relative h-full overflow-hidden rounded-2xl p-4">
          <HudCorner />
          <Eyebrow text="ROHE HUDCORNER // OHNE PANEL" rightText="REF" />
          <p className="mt-3 font-mono text-[11px] text-text-dim">
            HudCorner + Eyebrow direkt verbaut, ohne den Panel-Wrapper — zur
            Kontrolle der Eck-Glow-Stärke und des Labels.
          </p>
        </div>
      </div>
    </JarvisLayout>
  );
}
