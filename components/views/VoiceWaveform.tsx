"use client";

import { useEffect, useRef } from "react";
import { sampleAmplitude, type VoiceStatus } from "@/lib/voice";

const BAR_COUNT = 28;

interface VoiceWaveformProps {
  status: VoiceStatus;
}

export function VoiceWaveform({ status }: VoiceWaveformProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const amp = sampleAmplitude(status, t + i * 0.045);
        bar.style.height = `${4 + amp * 22}px`;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  return (
    <div className="flex h-7 items-center gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="w-[2px] rounded-full bg-blue shadow-[0_0_4px_var(--blue)] will-change-[height]"
          style={{ height: "4px" }}
        />
      ))}
    </div>
  );
}
