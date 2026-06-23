"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLines } from "@/components/hud";

type BootLine =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "divider" }
  | { type: "ok"; label: string; status: string }
  | { type: "final"; text: string };

const BOOT_LINES: BootLine[] = [
  { type: "title", text: "JARVIS OS v2.4.1" },
  { type: "subtitle", text: "FATHMAKER INDUSTRIES · MARK XXXIX · CLASSIFIED" },
  { type: "divider" },
  { type: "ok", label: "CORE SYSTEMS", status: "ONLINE" },
  { type: "ok", label: "VOICE ENGINE", status: "ONLINE" },
  { type: "ok", label: "SATELLITE LINK", status: "ESTABLISHED" },
  { type: "ok", label: "NEWS FEED", status: "SYNCED" },
  { type: "ok", label: "SMART HOME GRID", status: "CONNECTED" },
  { type: "ok", label: "MEMORY BANK", status: "LOADED" },
  { type: "divider" },
  { type: "final", text: "> ALL SYSTEMS OPERATIONAL" },
  { type: "final", text: "> GOOD MORNING, JONAH." },
];

const LINE_DELAY_MS = 150;
const HOLD_AFTER_MS = 900;
const GLITCH_MS = 380;
const SESSION_KEY = "jarvis-booted";
const DIVIDER = "─".repeat(39);

function playBootTone() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(64, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(46, ctx.currentTime + 1.4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.7);
    osc.onended = () => ctx.close();
  } catch {
    // autoplay blocked or AudioContext unavailable — boot continues silently
  }
}

export function BootSequence() {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      router.replace("/command-center");
      return;
    }

    playBootTone();

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((_, i) => {
      timeouts.push(setTimeout(() => setVisibleCount(i + 1), (i + 1) * LINE_DELAY_MS));
    });

    const totalLineTime = BOOT_LINES.length * LINE_DELAY_MS;
    timeouts.push(setTimeout(() => setGlitching(true), totalLineTime + HOLD_AFTER_MS));
    timeouts.push(
      setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        router.push("/command-center");
      }, totalLineTime + HOLD_AFTER_MS + GLITCH_MS)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [router]);

  const progress = (visibleCount / BOOT_LINES.length) * 100;

  return (
    <div
      className={`relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-bg-black ${
        glitching ? "boot-glitch" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_45%,rgba(255,69,0,0.08),transparent_60%)]"
      />
      <ScanLines />

      <div className="relative z-10 w-full max-w-xl px-6 font-mono text-[13px] leading-relaxed">
        {BOOT_LINES.slice(0, visibleCount).map((line, i) => {
          const isLast = i === visibleCount - 1;
          const showCursor =
            isLast && !glitching && (line.type === "title" || line.type === "subtitle" || line.type === "final");
          const cursorClass = showCursor ? "boot-cursor" : "";

          if (line.type === "title") {
            return (
              <p key={i} className={`font-display tracking-[2px] text-orange ${cursorClass}`}>
                {line.text}
              </p>
            );
          }

          if (line.type === "subtitle") {
            return (
              <p key={i} className={`mb-2 tracking-[1px] text-text-dim ${cursorClass}`}>
                {line.text}
              </p>
            );
          }

          if (line.type === "divider") {
            return (
              <p key={i} className="my-1 select-none text-text-faint">
                {DIVIDER}
              </p>
            );
          }

          if (line.type === "ok") {
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-text-dim">[</span>
                <span className="ok-flash">OK</span>
                <span className="text-text-dim">]</span>
                <span className="text-orange">{line.label}</span>
                <span className="mx-1 flex-1 border-b border-dotted border-text-faint" />
                <span className="text-green">{line.status}</span>
              </div>
            );
          }

          return (
            <p
              key={i}
              className={`mt-2 font-semibold text-orange-bright [text-shadow:0_0_10px_var(--orange)] ${cursorClass}`}
            >
              {line.text}
            </p>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-[2px] bg-border-dim">
        <div
          className="h-full bg-orange shadow-[0_0_8px_var(--orange)] transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
