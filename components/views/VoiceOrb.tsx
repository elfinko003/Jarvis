"use client";

import { useEffect, useRef } from "react";
import { sampleAmplitude, type VoiceStatus } from "@/lib/voice";

interface Ring {
  radius: number;
  dash: string;
  width: number;
  duration: number;
  reverse: boolean;
  opacity: number;
}

const RINGS: Ring[] = [
  { radius: 96, dash: "1 5", width: 1, duration: 24, reverse: false, opacity: 0.35 },
  { radius: 80, dash: "14 3 2 3", width: 1.2, duration: 16, reverse: true, opacity: 0.5 },
  { radius: 64, dash: "1 3", width: 1, duration: 10, reverse: false, opacity: 0.6 },
  { radius: 48, dash: "8 2 1 2 1 2", width: 1.4, duration: 28, reverse: true, opacity: 0.45 },
];

interface VoiceOrbProps {
  status: VoiceStatus;
  /** When provided, drives the sphere from live playback levels (see
   * useJarvisVoice) instead of the deterministic sampleAmplitude preview. */
  amplitudeRef?: { current: number };
}

export function VoiceOrb({ status, amplitudeRef }: VoiceOrbProps) {
  const sphereRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const amp = amplitudeRef ? amplitudeRef.current : sampleAmplitude(status, t);
      const scale = 0.95 + amp * 0.14;

      if (sphereRef.current) {
        sphereRef.current.style.transform = `scale(${scale})`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.35 + amp * 0.5);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, amplitudeRef]);

  return (
    <div className="relative h-[280px] w-[280px]">
      {RINGS.map((ring, i) => (
        <div
          key={i}
          className="voice-ring absolute inset-0"
          style={{
            animationDuration: `${ring.duration}s`,
            animationDirection: ring.reverse ? "reverse" : "normal",
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle
              cx={100}
              cy={100}
              r={ring.radius}
              fill="none"
              stroke="var(--blue)"
              strokeWidth={ring.width}
              strokeOpacity={ring.opacity}
              strokeDasharray={ring.dash}
            />
          </svg>
        </div>
      ))}

      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-[18%] rounded-full bg-blue opacity-40 blur-2xl will-change-[opacity]"
      />

      <div
        ref={sphereRef}
        className="absolute inset-[28%] flex items-center justify-center rounded-full border border-blue/60 shadow-[0_0_30px_rgba(74,158,255,0.55)] will-change-transform"
        style={{
          backgroundImage:
            "radial-gradient(circle at 38% 32%, rgba(74,158,255,0.45), rgba(10,10,12,0.92) 70%), radial-gradient(circle, rgba(74,158,255,0.6) 1px, transparent 1.4px)",
          backgroundSize: "100% 100%, 6px 6px",
        }}
      >
        <span className="font-display text-[11px] tracking-[3px] text-blue [text-shadow:0_0_10px_var(--blue)]">
          J.A.R.V.I.S
        </span>
      </div>
    </div>
  );
}
