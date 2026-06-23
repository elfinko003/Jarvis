import { Panel } from "@/components/hud";
import { Sparkline } from "./Sparkline";

const HEX_POINTS = [0, 60, 120, 180, 240, 300]
  .map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return `${(100 + 46 * Math.cos(rad)).toFixed(1)},${(100 + 46 * Math.sin(rad)).toFixed(1)}`;
  })
  .join(" ");

export function ReactorCore() {
  return (
    <Panel title="REAKTOR // CORE" rightText="ONLINE" className="flex h-full flex-col items-center">
      <div className="relative mt-2 flex aspect-square w-full max-w-[260px] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 rounded-full [background:radial-gradient(circle,rgba(255,69,0,0.35),rgba(255,69,0,0.05)_55%,transparent_75%)] blur-md" />

        <div
          className="spin-loop absolute inset-[4%] rounded-full"
          style={{ animationDuration: "26s" }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle
              cx={100}
              cy={100}
              r={96}
              fill="none"
              stroke="var(--orange)"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="1.5 7"
            />
          </svg>
        </div>

        <div
          className="spin-loop absolute inset-[16%] rounded-full"
          style={{ animationDuration: "14s", animationDirection: "reverse" }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle
              cx={100}
              cy={100}
              r={82}
              fill="none"
              stroke="var(--orange-bright)"
              strokeOpacity={0.45}
              strokeWidth={1.2}
              strokeDasharray="12 3 2 3"
            />
          </svg>
        </div>

        <span className="absolute left-1/2 top-[2%] -translate-x-1/2 font-mono text-[8px] tracking-[1px] text-orange/50">
          0°
        </span>
        <span className="absolute right-[2%] top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-[1px] text-orange/50">
          90°
        </span>
        <span className="absolute bottom-[2%] left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[1px] text-orange/50">
          180°
        </span>
        <span className="absolute left-[2%] top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-[1px] text-orange/50">
          270°
        </span>

        <span className="absolute right-[8%] top-[14%] font-mono text-[8px] uppercase tracking-[1px] text-text-dim">
          FLUX <span className="text-green">STABLE</span>
        </span>
        <span className="absolute bottom-[14%] left-[6%] font-mono text-[8px] uppercase tracking-[1px] text-text-dim">
          OUTPUT <span className="text-orange-bright">98.2%</span>
        </span>

        <div className="absolute inset-[28%] flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-full w-full [filter:drop-shadow(0_0_14px_var(--orange))]">
            <polygon
              points={HEX_POINTS}
              fill="rgba(255,69,0,0.12)"
              stroke="var(--orange-bright)"
              strokeWidth={2}
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 w-full">
        <Sparkline />
      </div>
    </Panel>
  );
}
