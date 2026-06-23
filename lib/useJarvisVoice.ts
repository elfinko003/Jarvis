"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JarvisResponse } from "@/lib/claude";
import {
  isSpeechRecognitionSupported,
  speak,
  startCommandListening,
  startWakeWordListening,
  type VoiceStatus,
  type WakeWordHandle,
} from "@/lib/voice";

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const VIEW_ROUTES: Record<string, string> = {
  command_center: "/command-center",
  world_globe: "/world-globe",
  city_briefing: "/city-briefing",
  markets: "/markets",
  pipeline: "/pipeline",
  morning_routine: "/morning",
  voice: "/voice",
};

const FALLBACK_SPOKEN = "Entschuldigung, da ist etwas schiefgelaufen, Sir.";

// Wires Web Speech wake word -> command capture -> /api/jarvis -> speak() ->
// optional view navigation. Runs entirely client-side; the amplitude of
// Jarvis's own voice is exposed via a ref so VoiceOrb can read it per-frame
// without triggering React re-renders.
export function useJarvisVoice() {
  const router = useRouter();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [lastSpoken, setLastSpoken] = useState("");
  const historyRef = useRef<ConversationTurn[]>([]);
  const amplitudeRef = useRef(0);
  const wakeHandleRef = useRef<WakeWordHandle | null>(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;

    const beginWakeListening = () => {
      wakeHandleRef.current = startWakeWordListening(() => {
        if (!cancelled) handleWake();
      });
    };

    async function handleCommand(transcript: string) {
      setStatus("processing");
      historyRef.current.push({ role: "user", content: transcript });

      let data: JarvisResponse;
      try {
        const res = await fetch("/api/jarvis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript, history: historyRef.current.slice(-10) }),
        });
        data = await res.json();
      } catch {
        data = { spoken: FALLBACK_SPOKEN, action: "none" };
      }

      const spoken = data.spoken || FALLBACK_SPOKEN;
      historyRef.current.push({ role: "assistant", content: spoken });
      if (!cancelled) setLastSpoken(spoken);

      if (data.action === "navigate" && data.view && VIEW_ROUTES[data.view]) {
        let path = VIEW_ROUTES[data.view];
        const qs = new URLSearchParams();
        for (const [key, value] of Object.entries(data.params ?? {})) {
          if (typeof value === "string" && value) qs.set(key, value);
        }
        const qsString = qs.toString();
        if (qsString) path += `?${qsString}`;
        router.push(path);
      }

      if (cancelled) return;
      setStatus("speaking");
      await speak(spoken, (level) => {
        amplitudeRef.current = level;
      });
    }

    async function handleWake() {
      wakeHandleRef.current?.stop();
      setStatus("listening");

      try {
        const transcript = await startCommandListening();
        if (cancelled) return;
        await handleCommand(transcript);
      } catch {
        // no speech captured within the window — just resume listening
      } finally {
        if (!cancelled) {
          setStatus("idle");
          beginWakeListening();
        }
      }
    }

    beginWakeListening();

    return () => {
      cancelled = true;
      wakeHandleRef.current?.stop();
    };
  }, [router, supported]);

  return { status, lastSpoken, amplitudeRef, supported };
}
