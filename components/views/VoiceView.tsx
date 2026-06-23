"use client";

import { useState } from "react";
import { HudCorner, ScanLines } from "@/components/hud";
import { VoiceOrb } from "./VoiceOrb";
import { VoiceWaveform } from "./VoiceWaveform";
import { useJarvisVoice } from "@/lib/useJarvisVoice";
import type { VoiceStatus } from "@/lib/voice";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "STANDBY",
  listening: "LISTENING",
  processing: "PROCESSING",
  speaking: "SPEAKING",
};

const DEV_STATUSES: VoiceStatus[] = ["idle", "listening", "processing", "speaking"];

export function VoiceView() {
  const { status: liveStatus, lastSpoken, amplitudeRef, supported } = useJarvisVoice();
  const [override, setOverride] = useState<VoiceStatus | null>(null);
  const status = override ?? liveStatus;
  const isLive = override === null;

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden bg-bg-black px-6 py-10 text-text-bright">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_45%,rgba(74,158,255,0.10),transparent_60%)]"
      />
      <ScanLines />

      <HudCorner color="blue" />
      <span className="pointer-events-none absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-blue/50" />
      <span className="pointer-events-none absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-blue/50" />
      <span className="pointer-events-none absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-blue/50" />
      <span className="pointer-events-none absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-blue/50" />

      <header className="relative z-10 flex flex-col items-center gap-1 text-center">
        <h1 className="font-display text-lg font-black uppercase tracking-[8px] text-blue [text-shadow:0_0_14px_var(--blue)]">
          J.A.R.V.I.S
        </h1>
        <p className="text-[10px] uppercase tracking-[3px] text-blue/60">
          Just A Rather Very Intelligent System
        </p>
        {!supported && (
          <p className="mt-2 text-[9px] uppercase tracking-[2px] text-red">
            ✕ Spracherkennung nicht verfügbar — nur Dev-Buttons aktiv
          </p>
        )}
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <VoiceOrb status={status} amplitudeRef={isLive && status === "speaking" ? amplitudeRef : undefined} />
      </div>

      <footer className="relative z-10 flex flex-col items-center gap-3">
        <p
          className={`font-mono text-[11px] uppercase tracking-[3px] text-blue ${
            status !== "idle" ? "animate-pulse" : "opacity-50"
          }`}
        >
          ● {STATUS_LABEL[status]}
        </p>
        <VoiceWaveform status={status} />
        {isLive && lastSpoken && (
          <p className="max-w-md text-center font-mono text-[10px] text-text-dim">{lastSpoken}</p>
        )}
        <p className="mt-4 text-[9px] uppercase tracking-[2px] text-text-faint">
          FATHMAKER INDUSTRIES · MARK XXXIX · CLASSIFIED
        </p>
      </footer>

      <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
        <button
          onClick={() => setOverride(null)}
          className={`rounded-[2px] border px-2 py-1 font-mono text-[9px] uppercase tracking-[1px] transition-colors ${
            isLive
              ? "border-green bg-green/15 text-green"
              : "border-border-dim text-text-faint hover:border-green/40 hover:text-green/70"
          }`}
        >
          live
        </button>
        {DEV_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setOverride(s)}
            className={`rounded-[2px] border px-2 py-1 font-mono text-[9px] uppercase tracking-[1px] transition-colors ${
              override === s
                ? "border-blue bg-blue/15 text-blue"
                : "border-border-dim text-text-faint hover:border-blue/40 hover:text-blue/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
