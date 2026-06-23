export type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

// Real Web Speech API / ElevenLabs wiring lands in a later build step (Prompt 5).
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

// Deterministic stand-in for real mic/TTS amplitude until Prompt 5 wires the
// Web Speech API / ElevenLabs AnalyserNode. Same (status, t) always produces
// the same value, so independent rAF loops (orb scale, waveform bars) stay
// visually in sync without sharing state.
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
