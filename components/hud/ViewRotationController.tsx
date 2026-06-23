"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HOTKEY_VIEWS, ROTATION_INTERVAL_MS, ROTATION_VIEWS } from "@/lib/viewRotation";

export function ViewRotationController() {
  const router = useRouter();
  const pathname = usePathname();
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (e.key >= "1" && e.key <= "8") {
        const path = HOTKEY_VIEWS[Number(e.key) - 1];
        if (path) router.push(path);
        return;
      }

      if (e.key === "r" || e.key === "R") {
        setRotating((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  useEffect(() => {
    if (!rotating) return;
    const interval = setInterval(() => {
      const currentIndex = ROTATION_VIEWS.indexOf(pathname);
      const next = ROTATION_VIEWS[(currentIndex + 1 + ROTATION_VIEWS.length) % ROTATION_VIEWS.length];
      router.push(next);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [rotating, pathname, router]);

  if (!rotating) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-[2px] border border-orange/40 bg-bg-panel/90 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[2px] text-orange-bright">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-bright shadow-[0_0_6px_var(--orange-bright)]" />
      AUTO-ROTATION
    </div>
  );
}
