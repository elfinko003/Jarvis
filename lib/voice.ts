export type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

// Real Web Speech API / ElevenLabs wiring lands in a later build step (Prompt 5).
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}
