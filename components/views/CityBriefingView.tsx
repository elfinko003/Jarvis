"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JarvisLayout, Panel, GlowText } from "@/components/hud";
import { CITIES, type City } from "@/lib/cities";
import { findCountry } from "@/lib/countries";
import { speak } from "@/lib/voice";
import type { FlyToRequest } from "./CityGlobeCanvas";
import type { WeatherData } from "@/app/api/weather/route";
import type { WebcamInfo } from "@/app/api/webcams/route";
import type { NewsArticle } from "@/app/api/news/route";

// Cesium touches `window`/WebGL at import time, so it must never be evaluated
// during SSR — load it client-only via next/dynamic.
const CityGlobeCanvas = dynamic(() => import("./CityGlobeCanvas").then((m) => m.CityGlobeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[2px] text-text-dim">
      ▸ SATELLITE LINK ESTABLISHING…
    </div>
  ),
});

const ROTATE_INTERVAL_MS = 30_000;

const SITUATION_LABELS = ["REGIERUNG", "REGION", "WIRTSCHAFT"];
const INTEL_DOTS = ["bg-green", "bg-orange", "bg-text-dim"];
const INTEL_FALLBACK = [
  "Verkehrslage normal, keine Störungen gemeldet.",
  "Wetterbeobachtung aktualisiert.",
  "Keine sicherheitsrelevanten Meldungen.",
];

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${latDir} · ${Math.abs(lng).toFixed(2)}° ${lngDir}`;
}

function formatTime(iso?: string): string {
  try {
    return new Date(iso ?? Date.now()).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function localStatus(timezone: string): string {
  const match = /UTC([+-]\d+)/.exec(timezone);
  const offset = match ? Number(match[1]) : 0;
  const hour = (new Date().getUTCHours() + offset + 24) % 24;
  return hour >= 6 && hour < 20 ? "TAG" : "NACHT";
}

// Deterministic per-city "air traffic" flavor numbers — there's no real
// flight-data source wired up, this is cosmetic HUD dressing only.
function airTraffic(cityName: string) {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) hash = (hash * 31 + cityName.charCodeAt(i)) >>> 0;
  return {
    inbound: 4 + (hash % 12),
    outbound: 3 + ((hash >> 3) % 12),
    avgDelay: hash % 9,
    connections: 60 + ((hash >> 5) % 40),
  };
}

function WebcamBlock({ label, dotColor, webcam, lat, lng }: { label: string; dotColor: string; webcam: WebcamInfo | null; lat: number; lng: number }) {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-[2px] border border-border-dim bg-bg-panel-2">
      {webcam?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={webcam.imageUrl} alt="" className="h-full w-full object-cover opacity-85" />
      ) : (
        <div className="h-full w-full [background:linear-gradient(135deg,#1a1a1f,#0a0a0c)]" />
      )}
      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[2px] bg-bg-black/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[1px] text-text-bright">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
      <span className="absolute bottom-2 right-2 rounded-[2px] bg-bg-black/80 px-1.5 py-0.5 font-mono text-[8px] text-text-dim">
        {formatCoord(lat, lng)}
      </span>
    </div>
  );
}

export function CityBriefingView() {
  const searchParams = useSearchParams();
  const announcedRef = useRef(false);
  const flyRequestIdRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(() => {
    const fromParam = searchParams.get("city");
    if (fromParam) {
      const idx = CITIES.findIndex((c) => c.name.toLowerCase() === fromParam.toLowerCase());
      if (idx >= 0) return idx;
    }
    return 0;
  });
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [webcams, setWebcams] = useState<(WebcamInfo | null)[]>([null, null]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  const city: City = CITIES[activeIndex];

  const loadCityData = useCallback(async (target: City) => {
    const [weatherRes, webcamRes] = await Promise.all([
      fetch(`/api/weather?lat=${target.lat}&lng=${target.lng}`).then((r) => r.json()),
      fetch(`/api/webcams?lat=${target.lat}&lng=${target.lng}`).then((r) => r.json()),
    ]);
    setWeather(weatherRes);
    setWebcams(webcamRes.webcams ?? [null, null]);

    const country = findCountry(target.country);
    const newsRes = await fetch(`/api/news?country=${country?.cca2 ?? "de"}&category=general`).then((r) =>
      r.json()
    );
    const loaded: NewsArticle[] = newsRes.articles ?? [];
    setArticles(loaded);
    return { weather: weatherRes as WeatherData, articles: loaded };
  }, []);

  // Auto-rotation: chains a fresh 30s timeout off of whatever index is
  // currently active, so a manual voice jump also gets a full 30s dwell
  // before the cycle continues.
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % CITIES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  useEffect(() => {
    flyRequestIdRef.current += 1;
    setFlyToRequest({ lat: city.lat, lng: city.lng, requestId: flyRequestIdRef.current });

    loadCityData(city).then(({ weather: w, articles: loaded }) => {
      const cameFromVoice = searchParams.get("city") !== null;
      if (cameFromVoice && !announcedRef.current) {
        announcedRef.current = true;
        const headline = loaded[0]?.title;
        speak(
          `Wir befinden uns nun über ${city.name}, Sir. Aktuell ${w.temp} Grad und ${w.description}.` +
            (headline ? ` Hauptmeldung: ${headline}.` : "")
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, loadCityData]);

  const traffic = airTraffic(city.name);
  const situationLines = SITUATION_LABELS.map((label, i) => articles[i]?.title ?? "Keine aktuellen Berichte.");
  const intelLines = INTEL_DOTS.map((dot, i) => ({
    dot,
    text: articles[i + 3]?.title ?? INTEL_FALLBACK[i],
    time: formatTime(articles[i + 3]?.publishedAt),
  }));

  return (
    <JarvisLayout module="STADT-BRIEFING // LIVE RECON">
      <div className="flex h-full gap-3">
        <div className="relative h-full min-w-0 flex-1 overflow-hidden rounded-[2px] border border-border-dim">
          <CityGlobeCanvas activeCityName={city.name} flyToRequest={flyToRequest} />
          <div className="scan-line pointer-events-none absolute inset-x-0 z-10 h-px [background:linear-gradient(90deg,transparent,var(--orange),transparent)]" />
        </div>

        <div className="flex h-full w-[38%] shrink-0 min-h-0 flex-col gap-2.5 overflow-y-auto">
          <Panel>
            <GlowText className="font-mono text-2xl uppercase tracking-[2px] text-orange">{city.name}</GlowText>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[2px] text-text-dim">
              {city.country.toUpperCase()} · {city.timezone} · {localStatus(city.timezone)}
            </p>
          </Panel>

          <WebcamBlock label={`● LIVE · ${city.name.toUpperCase()} STREET`} dotColor="bg-red" webcam={webcams[0]} lat={city.lat} lng={city.lng} />
          <WebcamBlock label={`SAT-VIEW · ${city.name.toUpperCase()}`} dotColor="bg-orange" webcam={webcams[1]} lat={city.lat} lng={city.lng} />

          <div className="flex gap-2.5">
            <Panel title="WETTER" className="flex-1">
              {weather && (
                <>
                  <GlowText className="font-mono text-3xl text-text-bright">{weather.temp}°C</GlowText>
                  <p className="mt-0.5 font-mono text-[11px] capitalize text-text-dim">{weather.description}</p>
                  <p className="mt-2 font-mono text-[10px] text-text-dim">
                    Feels {weather.feelsLike}°C · Wind {weather.windSpeed} m/s
                  </p>
                  <p className="font-mono text-[10px] text-text-dim">
                    Humidity {weather.humidity}% · UV {weather.uvIndex}
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-border-dim pt-2.5">
                    {weather.forecast.map((f, i) => (
                      <div key={i} className="text-center">
                        <p className="font-mono text-[9px] uppercase tracking-[1px] text-text-faint">{f.label}</p>
                        <p className="font-mono text-[11px] text-text-bright">{f.temp}°</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Panel>

            <Panel title="AIR-TRAFFIC · LIVE" className="flex-1">
              <div className="space-y-1.5 font-mono text-[10px] text-text-dim">
                <p>
                  Inbound <span className="text-text-bright">{traffic.inbound}</span>
                </p>
                <p>
                  Outbound <span className="text-text-bright">{traffic.outbound}</span>
                </p>
                <p>
                  Avg Delay <span className="text-text-bright">{traffic.avgDelay} min</span>
                </p>
                <p>
                  Connection <span className="text-text-bright">{traffic.connections}%</span>
                </p>
              </div>
              <p className="mt-2.5 inline-block rounded-[2px] bg-green/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[1px] text-green">
                ■ ALL OPERATIONAL
              </p>
            </Panel>
          </div>

          <Panel title={`AKTUELLE LAGE · ${city.country.toUpperCase()}`}>
            <div className="space-y-1.5 font-mono text-[10px] text-text-dim">
              {situationLines.map((line, i) => (
                <p key={i}>
                  <span className="text-orange">{SITUATION_LABELS[i]}</span> · {line}
                </p>
              ))}
            </div>
          </Panel>

          <Panel title="LOKAL INTEL · HEUTE">
            <div className="space-y-1.5">
              {intelLines.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 font-mono text-[10px] text-text-dim">
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${entry.dot}`} />
                  <span className="flex-1 text-text-bright">{entry.text}</span>
                  {entry.time && <span className="shrink-0 text-text-faint">{entry.time}</span>}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </JarvisLayout>
  );
}
