"use client";

import { useEffect, useState } from "react";

const TEXT = "Mein Tag startet.";
const CHAR_DELAY_MS = 70;

export function MorningTypewriter() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= TEXT.length; i++) {
      timeouts.push(setTimeout(() => setVisibleCount(i), i * CHAR_DELAY_MS));
    }
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <p className="boot-cursor font-display text-2xl font-black uppercase tracking-[2px] text-orange [text-shadow:0_0_12px_var(--orange)]">
      &gt; {TEXT.slice(0, visibleCount)}
    </p>
  );
}
