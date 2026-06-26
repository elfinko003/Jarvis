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
    <p className="boot-cursor text-2xl font-light tracking-[1px] text-text-bright">
      {TEXT.slice(0, visibleCount)}
    </p>
  );
}
