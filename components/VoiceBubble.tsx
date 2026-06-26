"use client";

import { useState, type FormEvent } from "react";

type BubbleStatus = "idle" | "listening" | "processing" | "speaking";

const STATUS_LABEL: Record<BubbleStatus, string> = {
  idle: "Bereit",
  listening: "Hört zu",
  processing: "Verarbeitet",
  speaking: "Spricht",
};

const STATUS_ORDER: BubbleStatus[] = ["idle", "listening", "processing", "speaking"];
const DUMMY_TRANSCRIPT: Record<BubbleStatus, string> = {
  idle: "",
  listening: "Wie sieht das Wetter heute aus?",
  processing: "Wie sieht das Wetter heute aus?",
  speaking: "Heute sonnig bei 22 Grad, Sir.",
};

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 0 0-7 0v5A3.5 3.5 0 0 0 12 15Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Placeholder voice surface (UPDATE 1) — local dummy state only, cycled by
// clicking the mic so the animations/states can be reviewed. Real
// push-to-talk + wake word + Claude wiring lands in UPDATE 4; this purely
// establishes the always-visible glass pill and its visual states.
export function VoiceBubble() {
  const [status, setStatus] = useState<BubbleStatus>("idle");
  const [textMode, setTextMode] = useState(false);
  const [draft, setDraft] = useState("");

  const isActive = status !== "idle";
  const transcript = DUMMY_TRANSCRIPT[status];

  function cycleStatus() {
    setStatus((prev) => STATUS_ORDER[(STATUS_ORDER.indexOf(prev) + 1) % STATUS_ORDER.length]);
  }

  function submitDraft(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setDraft("");
    setTextMode(false);
    setStatus("processing");
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4">
      {transcript && (
        <p className="pointer-events-none max-w-md text-center font-light text-[12px] text-text-dim">{transcript}</p>
      )}

      <div className="glass-surface pointer-events-auto flex items-center gap-3 rounded-full px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <button
          onClick={cycleStatus}
          aria-label={isActive ? "Status weiterschalten" : "Mikrofon aktivieren (Demo)"}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue transition-colors hover:bg-blue/15"
        >
          {isActive && <span className="mic-pulse-ring absolute inset-0 rounded-full bg-blue/25" aria-hidden />}
          <MicIcon className="relative z-10 h-4 w-4" />
        </button>

        {textMode ? (
          <form onSubmit={submitDraft} className="flex items-center">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => !draft && setTextMode(false)}
              placeholder="Nachricht an Jarvis…"
              className="w-56 bg-transparent font-light text-[13px] text-text-bright placeholder:text-text-faint focus:outline-none"
            />
          </form>
        ) : (
          <button onClick={() => setTextMode(true)} className="flex items-center gap-2.5 pr-1">
            <span className="flex h-4 items-end gap-[3px]" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`wave-bar w-[2.5px] rounded-full bg-text-dim ${isActive ? "" : "opacity-30"}`}
                  style={isActive ? { animationDelay: `${i * 0.12}s` } : { height: 4, animationPlayState: "paused" }}
                />
              ))}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[2px] text-text-faint">
              {STATUS_LABEL[status]}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
