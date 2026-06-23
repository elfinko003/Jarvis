export type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

// --- Minimal Web Speech API types -----------------------------------------
// Not part of TypeScript's bundled DOM lib (still non-standard), so we
// declare just the surface we actually use instead of pulling in a package.

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

function resultsToText(results: SpeechRecognitionResultListLike): string {
  let text = "";
  for (let i = 0; i < results.length; i++) {
    text += `${results[i][0].transcript} `;
  }
  return text.trim();
}

// --- Wake word --------------------------------------------------------------

const WAKE_WORDS = ["hey jarvis", "jarvis"];

export interface WakeWordHandle {
  stop: () => void;
}

// NOTE: Electron's bundled Chromium has no Google speech-recognition backend
// (that's a Google Chrome-only proprietary service), so SpeechRecognition
// typically fails inside the packaged app. Test this in an actual Chrome tab
// pointed at the dev server until a local wake-word engine (e.g. Porcupine)
// replaces this in a later pass.
export function startWakeWordListening(onWake: () => void): WakeWordHandle {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return { stop: () => {} };

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "de-DE";

  let stopped = false;

  recognition.onresult = (event) => {
    const transcript = resultsToText(event.results).toLowerCase();
    if (WAKE_WORDS.some((w) => transcript.includes(w))) {
      onWake();
    }
  };

  recognition.onerror = () => {
    // transient errors (no-speech, network blips) — onend handles restart
  };

  recognition.onend = () => {
    if (stopped) return;
    try {
      recognition.start();
    } catch {
      // already starting — ignore
    }
  };

  try {
    recognition.start();
  } catch {
    // ignore double-start races
  }

  return {
    stop: () => {
      stopped = true;
      recognition.onend = null;
      recognition.stop();
    },
  };
}

// --- Single command capture -------------------------------------------------

export function startCommandListening(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      reject(new Error("SpeechRecognition not supported"));
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "de-DE";

    let settled = false;

    recognition.onresult = (event) => {
      settled = true;
      resolve(resultsToText(event.results));
    };

    recognition.onerror = (event) => {
      if (settled) return;
      settled = true;
      reject(new Error(event.error || "speech-recognition-error"));
    };

    recognition.onend = () => {
      if (!settled) {
        settled = true;
        reject(new Error("no-speech"));
      }
    };

    try {
      recognition.start();
    } catch (error) {
      reject(error instanceof Error ? error : new Error("speech-recognition-start-failed"));
    }
  });
}

// --- Amplitude simulation (used as fallback + dummy-state preview) ---------

// Deterministic stand-in for real mic/TTS amplitude. Same (status, t) always
// produces the same value, so independent rAF loops (orb scale, waveform
// bars) stay visually in sync without sharing state.
export function sampleAmplitude(status: VoiceStatus, t: number): number {
  let value: number;

  switch (status) {
    case "listening":
      value = 0.35 + 0.15 * Math.sin(t * 1.4) + 0.05 * Math.sin(t * 3.1);
      break;
    case "processing":
      value = 0.4 + 0.25 * Math.abs(Math.sin(t * 4.2)) * Math.sin(t * 0.9 + 1);
      break;
    case "speaking":
      value =
        0.5 +
        0.3 * Math.sin(t * 9.5) +
        0.15 * Math.sin(t * 17.3 + 1.2) +
        0.1 * Math.sin(t * 5.1 + 0.4);
      break;
    default:
      value = 0.08 + 0.04 * Math.sin(t * 0.6);
  }

  return Math.min(1, Math.max(0, value));
}

// --- Text-to-speech ----------------------------------------------------------

type AmplitudeCallback = (level: number) => void;

async function synthesizeSpeech(text: string): Promise<string | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

function playAudioWithAmplitude(url: string, onAmplitude?: AmplitudeCallback): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    let raf = 0;

    const cleanup = () => {
      cancelAnimationFrame(raf);
      URL.revokeObjectURL(url);
      onAmplitude?.(0);
    };

    audio.addEventListener("ended", () => {
      cleanup();
      resolve();
    });
    audio.addEventListener("error", () => {
      cleanup();
      resolve();
    });

    if (onAmplitude) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(ctx.destination);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
          onAmplitude(Math.min(1, avg / 140));
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // AnalyserNode unavailable — playback continues without amplitude feed
      }
    }

    audio.play().catch(() => {
      cleanup();
      resolve();
    });
  });
}

function speakWithBrowserFallback(text: string, onAmplitude?: AmplitudeCallback): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";

    let raf = 0;
    const start = performance.now();
    const pump = () => {
      if (onAmplitude) {
        onAmplitude(sampleAmplitude("speaking", (performance.now() - start) / 1000));
      }
      raf = requestAnimationFrame(pump);
    };
    if (onAmplitude) pump();

    const finish = () => {
      cancelAnimationFrame(raf);
      onAmplitude?.(0);
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

// Tries ElevenLabs (via /api/tts) first, falls back to window.speechSynthesis.
// onAmplitude is fed live playback levels for the orb animation.
export async function speak(text: string, onAmplitude?: AmplitudeCallback): Promise<void> {
  const audioUrl = await synthesizeSpeech(text);
  if (audioUrl) {
    await playAudioWithAmplitude(audioUrl, onAmplitude);
    return;
  }
  await speakWithBrowserFallback(text, onAmplitude);
}
