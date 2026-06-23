"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { JarvisAction, JarvisIntentResponse } from "@/lib/jarvisActions";
import { VIEW_ROUTES, requiresExplorerView } from "@/lib/jarvisActions";
import { getActivePlaceName, publishActions } from "@/lib/explorerBus";
import {
  isSpeechRecognitionSupported,
  speak,
  startBargeInListening,
  startCommandListening,
  startWakeWordListening,
  type VoiceStatus,
  type WakeWordHandle,
} from "@/lib/voice";

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const FALLBACK_SPOKEN = "Entschuldigung, da ist etwas schiefgelaufen, Sir.";
const EXPLORER_ROUTE = "/world-globe";

// Wires Web Speech wake word -> command capture -> /api/jarvis -> dispatch
// actions -> speak() (interruptible by saying "Jarvis…" again, barge-in) ->
// resume wake listening. Runs entirely client-side; the amplitude of
// Jarvis's own voice is exposed via a ref so VoiceOrb can read it per-frame
// without triggering React re-renders.
export function useJarvisVoice() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [lastSpoken, setLastSpoken] = useState("");
  const historyRef = useRef<ConversationTurn[]>([]);
  const amplitudeRef = useRef(0);
  const wakeHandleRef = useRef<WakeWordHandle | null>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;

    const beginWakeListening = () => {
      wakeHandleRef.current = startWakeWordListening(() => {
        if (!cancelled) handleWake();
      });
    };

    function dispatchActions(actions: JarvisAction[]) {
      const explorerActions = actions.filter((a) => requiresExplorerView([a]));
      const viewActions = actions.filter((a) => a.type === "view") as { type: "view"; name: keyof typeof VIEW_ROUTES }[];

      if (explorerActions.length > 0) {
        publishActions(explorerActions);
        if (pathnameRef.current !== EXPLORER_ROUTE) router.push(EXPLORER_ROUTE);
      }

      for (const action of viewActions) {
        const path = VIEW_ROUTES[action.name];
        if (path) router.push(path);
      }
    }

    async function handleCommand(transcript: string) {
      setStatus("processing");
      historyRef.current.push({ role: "user", content: transcript });

      let data: JarvisIntentResponse;
      try {
        const res = await fetch("/api/jarvis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: transcript,
            history: historyRef.current.slice(-10),
            activePlace: getActivePlaceName(),
          }),
        });
        data = await res.json();
      } catch {
        data = { spoken: FALLBACK_SPOKEN, actions: [] };
      }

      const spoken = data.ask || data.spoken || FALLBACK_SPOKEN;
      historyRef.current.push({ role: "assistant", content: spoken });
      if (cancelled) return;
      setLastSpoken(spoken);

      if (!data.ask && data.actions.length > 0) {
        dispatchActions(data.actions);
      }

      if (cancelled) return;
      setStatus("speaking");

      const abortController = new AbortController();
      const bargeIn = startBargeInListening(() => {
        abortController.abort();
      });

      await speak(
        spoken,
        (level) => {
          amplitudeRef.current = level;
        },
        abortController.signal
      );
      bargeIn.stop();

      if (cancelled) return;

      if (abortController.signal.aborted) {
        // The user said "Jarvis…" again mid-sentence — go straight back into
        // listening for their new command instead of resuming wake-word
        // detection first (they've already triggered it).
        await handleWake(true);
        return;
      }

      setStatus("idle");
      beginWakeListening();
    }

    async function handleWake(skipWakeStop = false) {
      if (!skipWakeStop) wakeHandleRef.current?.stop();
      setStatus("listening");

      try {
        const transcript = await startCommandListening();
        if (cancelled) return;
        await handleCommand(transcript);
      } catch {
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
