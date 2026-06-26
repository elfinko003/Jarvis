import { JarvisVoiceProvider } from "@/lib/JarvisVoiceProvider";
import { ViewRotationController, ViewTransition } from "@/components/hud";
import { VoiceBubbleGate } from "@/components/VoiceBubbleGate";

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <JarvisVoiceProvider>
      <ViewRotationController />
      <ViewTransition>{children}</ViewTransition>
      <VoiceBubbleGate />
    </JarvisVoiceProvider>
  );
}
