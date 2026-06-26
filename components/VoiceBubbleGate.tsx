"use client";

import { usePathname } from "next/navigation";
import { VoiceBubble } from "./VoiceBubble";

// /voice already centers its whole layout around the orb + transcript —
// showing the floating bubble there too would just duplicate it.
const HIDDEN_ON = ["/voice"];

export function VoiceBubbleGate() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return <VoiceBubble />;
}
