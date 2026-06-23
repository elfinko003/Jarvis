"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import { useJarvisVoice } from "./useJarvisVoice";
import type { VoiceStatus } from "./voice";

interface JarvisVoiceContextValue {
  status: VoiceStatus;
  lastSpoken: string;
  amplitudeRef: MutableRefObject<number>;
  supported: boolean;
}

const JarvisVoiceContext = createContext<JarvisVoiceContextValue | null>(null);

// Mounted exactly once, in app/(views)/layout.tsx, so "Hey Jarvis" works on
// every view (Prompt 13) without spinning up a second competing
// SpeechRecognition instance when an individual page also wants the live
// status (VoiceView's orb reads it from here instead of calling
// useJarvisVoice() itself).
export function JarvisVoiceProvider({ children }: { children: React.ReactNode }) {
  const value = useJarvisVoice();
  return <JarvisVoiceContext.Provider value={value}>{children}</JarvisVoiceContext.Provider>;
}

export function useJarvisVoiceState(): JarvisVoiceContextValue {
  const ctx = useContext(JarvisVoiceContext);
  if (!ctx) throw new Error("useJarvisVoiceState must be used within JarvisVoiceProvider");
  return ctx;
}
