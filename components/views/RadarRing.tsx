import { Panel } from "@/components/hud";

const SECTOR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const BLIPS = [
  { x: 64, y: 28, delay: "0s" },
  { x: 32, y: 56, delay: "0.6s" },
  { x: 70, y: 70, delay: "1.2s" },
  { x: 42, y: 20, delay: "1.8s" },
];

export function RadarRing() {
  return (
    <Panel title="NETZWERK // STATUS" rightText="LIVE" className="flex h-full flex-col">
      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[230px] flex-1">
        <div className="absolute inset-0 rounded-full border border-border-dim" />
        <div className="absolute inset-[12%] rounded-full border border-border-dim" />
        <div className="absolute inset-[28%] rounded-full border border-border-dim" />
        <div className="absolute inset-[44%] rounded-full border border-orange/20" />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {SECTOR_ANGLES.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + 49 * Math.cos(rad);
            const y2 = 50 + 49 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={50}
                y1={50}
                x2={x2}
                y2={y2}
                stroke="var(--border-dim)"
                strokeWidth={0.5}
              />
            );
          })}
        </svg>

        <div className="radar-sweep absolute inset-0 rounded-full" />

        {BLIPS.map((blip, i) => (
          <span
            key={i}
            className="radar-blip absolute h-1.5 w-1.5 rounded-full bg-orange shadow-[0_0_6px_var(--orange)]"
            style={{ left: `${blip.x}%`, top: `${blip.y}%`, animationDelay: blip.delay }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-orange shadow-[0_0_8px_var(--orange)]" />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 font-mono text-[10px] text-text-dim">
        <p className="flex justify-between">
          <span>ACTIVE NODES</span>
          <span className="text-green">12</span>
        </p>
        <p className="flex justify-between">
          <span>THREATS</span>
          <span className="text-green">0</span>
        </p>
        <p className="flex justify-between">
          <span>SCAN CYCLE</span>
          <span className="text-text-bright">2.4s</span>
        </p>
      </div>
    </Panel>
  );
}
