import { JarvisVoiceProvider } from "@/lib/JarvisVoiceProvider";
import { ViewRotationController, ViewTransition } from "@/components/hud";

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <JarvisVoiceProvider>
      <ViewRotationController />
      <ViewTransition>{children}</ViewTransition>
    </JarvisVoiceProvider>
  );
}
