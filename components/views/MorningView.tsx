"use client";

import { useEffect, useRef } from "react";
import { JarvisLayout } from "@/components/hud";
import { MorningTypewriter } from "./MorningTypewriter";
import { MorningCountdown } from "./MorningCountdown";
import { MorningTimeline } from "./MorningTimeline";
import { MorningPriorityList } from "./MorningPriorityList";
import { EVENTS, PRIORITIES } from "@/lib/events";
import { MORNING_AUTO_TABS, MORNING_SPOTIFY_URI } from "@/lib/morningConfig";
import { speak } from "@/lib/voice";
import type { WeatherData } from "@/app/api/weather/route";

// Home base — same coordinates the HUD ticker's "WETTER TRIER" reading uses.
const HOME_LAT = 49.7596;
const HOME_LNG = 6.6428;

declare global {
  interface Window {
    jarvisSystem?: {
      openUrl: (url: string) => void;
      notify: (title: string, body: string) => void;
      platform: string;
    };
  }
}

export function MorningView() {
  const announcedRef = useRef(false);

  useEffect(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;

    for (const url of MORNING_AUTO_TABS) window.jarvisSystem?.openUrl(url);
    if (MORNING_SPOTIFY_URI) window.jarvisSystem?.openUrl(MORNING_SPOTIFY_URI);

    (async () => {
      const time = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const topPriority = PRIORITIES.find((p) => p.priority !== "done") ?? PRIORITIES[0];

      let weatherLine = "Wetterdaten nicht verfügbar";
      try {
        const res = await fetch(`/api/weather?lat=${HOME_LAT}&lng=${HOME_LNG}`);
        const data: WeatherData = await res.json();
        weatherLine = `${data.temp} Grad, ${data.description}`;
      } catch {
        // keep fallback line
      }

      const briefing =
        `Guten Morgen, Jonah. Es ist ${time}. Heute erwarten dich ${EVENTS.length} Termine. ` +
        `Das Wetter: ${weatherLine}. Deine wichtigste Aufgabe: ${topPriority.title}.`;

      void speak(briefing);
    })();
  }, []);

  return (
    <JarvisLayout module="MORNING ROUTINE // BRIEFING">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <MorningTypewriter />
        </div>

        <MorningCountdown />

        <div className="flex min-h-0 flex-1 gap-3">
          <div className="min-w-0 flex-[2]">
            <MorningTimeline />
          </div>
          <div className="w-[320px] shrink-0">
            <MorningPriorityList />
          </div>
        </div>
      </div>
    </JarvisLayout>
  );
}
