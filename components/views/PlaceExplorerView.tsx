"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { JarvisLayout } from "@/components/hud";
import { PlaceInfoPanel } from "./PlaceInfoPanel";
import { CamGrid, type CamState } from "./CamGrid";
import { resolvePlace, type PlaceResult } from "@/lib/geocode";
import { setActivePlaceName, subscribeActions } from "@/lib/explorerBus";
import type { JarvisAction } from "@/lib/jarvisActions";
import type { DistributiveOmit, GlobeCommand, GlobeMarker, NewsHotspot } from "./PlaceExplorerCanvas";
import type { WeatherData } from "@/app/api/weather/route";
import type { AirQualityData } from "@/app/api/airquality/route";
import type { NewsArticle } from "@/app/api/news/route";
import type { CamResult } from "@/lib/cams";
import type { EarthquakeEvent } from "@/app/api/earthquakes/route";
import { findCountryByCca2 } from "@/lib/countries";

// Cesium touches `window`/WebGL at import time, so it must never be
// evaluated during SSR — load it client-only.
const PlaceExplorerCanvas = dynamic(() => import("./PlaceExplorerCanvas").then((m) => m.PlaceExplorerCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[2px] text-text-dim">
      ▸ SATELLITE LINK ESTABLISHING…
    </div>
  ),
});

function dedupeAddMarker(markers: GlobeMarker[], next: GlobeMarker): GlobeMarker[] {
  if (markers.some((m) => m.name === next.name)) return markers;
  return [...markers, next];
}

async function resolveOne(query: string): Promise<PlaceResult | null> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return (data.results as PlaceResult[])?.[0] ?? null;
}

async function resolveEarthquake(): Promise<PlaceResult | null> {
  try {
    const res = await fetch("/api/earthquakes");
    const data = await res.json();
    const event: EarthquakeEvent | undefined = data.events?.[0];
    if (!event) return null;
    return {
      name: event.place,
      displayName: `${event.place} (M${event.magnitude.toFixed(1)})`,
      lat: event.lat,
      lng: event.lng,
      type: "other",
      countryCode: null,
      boundingBox: null,
      importance: 1,
    };
  } catch {
    return null;
  }
}

export function PlaceExplorerView() {
  const [activePlace, setActivePlace] = useState<PlaceResult | null>(null);
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [cams, setCams] = useState<CamState[]>([]);
  const [fullscreenPlace, setFullscreenPlace] = useState<string | null>(null);
  const [dayNight, setDayNight] = useState<"night" | "realtime">("night");
  const [command, setCommand] = useState<GlobeCommand | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsHotspots, setNewsHotspots] = useState<NewsHotspot[]>([]);
  const commandIdRef = useRef(0);
  const placeCacheRef = useRef<Map<string, PlaceResult>>(new Map());

  // Plain `Omit<GlobeCommand, "id">` collapses a discriminated union down to
  // its common fields only — this distributes Omit over each member instead
  // so the per-variant fields (lat/lng, points, places, ...) stay intact.
  const issueCommand = useCallback((command: DistributiveOmit<GlobeCommand, "id">) => {
    commandIdRef.current += 1;
    setCommand({ ...command, id: commandIdRef.current } as GlobeCommand);
  }, []);

  // Idle-mode hotspots: NewsAPI's headline-to-location extraction would need
  // its own NLU pass per article, so this uses USGS's already-geocoded
  // significant-earthquake feed as a stand-in source of "interesting places"
  // to pulse on the globe while nobody's actively exploring.
  useEffect(() => {
    fetch("/api/earthquakes")
      .then((r) => r.json())
      .then((data) => {
        const events: EarthquakeEvent[] = data.events ?? [];
        setNewsHotspots(events.slice(0, 15).map((e) => ({ title: e.place, lat: e.lat, lng: e.lng })));
      })
      .catch(() => undefined);
  }, []);

  const loadPlaceData = useCallback(async (place: PlaceResult) => {
    setLoadingNews(true);
    const country = findCountryByCca2(place.countryCode ?? "");
    const [weatherRes, newsRes, airRes] = await Promise.all([
      fetch(`/api/weather?lat=${place.lat}&lng=${place.lng}`).then((r) => r.json()),
      fetch(`/api/news?country=${country?.cca2 ?? place.countryCode ?? "de"}&category=general`).then((r) => r.json()),
      fetch(`/api/airquality?lat=${place.lat}&lng=${place.lng}`).then((r) => r.json()),
    ]);
    setWeather(weatherRes);
    setArticles(newsRes.articles ?? []);
    setAirQuality(airRes);
    setLoadingNews(false);
    return { weather: weatherRes as WeatherData, articles: (newsRes.articles ?? []) as NewsArticle[] };
  }, []);

  const resolveQuery = useCallback(async (query: string): Promise<PlaceResult | null> => {
    const lower = query.toLowerCase();
    if (lower.includes("erdbeben") || lower.includes("earthquake")) {
      return resolveEarthquake();
    }
    const cached = placeCacheRef.current.get(lower);
    if (cached) return cached;
    const resolved = await resolveOne(query);
    if (resolved) placeCacheRef.current.set(lower, resolved);
    return resolved;
  }, []);

  const handleActions = useCallback(
    async (actions: JarvisAction[]) => {
      for (const action of actions) {
        switch (action.type) {
          case "goto_place": {
            const place = await resolveQuery(action.query);
            if (!place) break;
            setActivePlace(place);
            setActivePlaceName(place.name);
            setMarkers((prev) =>
              action.multi
                ? dedupeAddMarker(prev, { name: place.name, lat: place.lat, lng: place.lng })
                : [{ name: place.name, lat: place.lat, lng: place.lng }]
            );
            issueCommand({ type: "goto", lat: place.lat, lng: place.lng, zoom: action.zoom ?? "region" });
            void loadPlaceData(place);
            break;
          }
          case "globe_zoom":
            issueCommand({ type: "zoom", direction: action.direction });
            break;
          case "globe_reset":
            setMarkers([]);
            setCams([]);
            setFullscreenPlace(null);
            setActivePlace(null);
            setActivePlaceName(null);
            issueCommand({ type: "reset" });
            break;
          case "globe_fit_all":
            issueCommand({ type: "fit_all", points: markers.map((m) => ({ lat: m.lat, lng: m.lng })) });
            break;
          case "globe_daynight":
            setDayNight(action.mode);
            break;
          case "globe_tour": {
            let places: GlobeMarker[] = markers;
            if (action.places && action.places.length > 0) {
              const resolved = await Promise.all(action.places.map((p) => resolveQuery(p)));
              places = resolved
                .filter((p): p is PlaceResult => Boolean(p))
                .map((p) => ({ name: p.name, lat: p.lat, lng: p.lng }));
            }
            issueCommand({ type: "tour", places });
            break;
          }
          case "cam_open":
          case "cam_add": {
            const place = await resolveQuery(action.place);
            if (!place) break;
            setActivePlace(place);
            setActivePlaceName(place.name);
            setMarkers((prev) => dedupeAddMarker(prev, { name: place.name, lat: place.lat, lng: place.lng }));
            const camRes: CamResult = await fetch(
              `/api/cams?place=${encodeURIComponent(place.name)}&lat=${place.lat}&lng=${place.lng}`
            ).then((r) => r.json());
            setCams((prev) => {
              const replaced = action.type === "cam_open" ? [] : prev.filter((c) => c.place !== camRes.place);
              return [...replaced, { ...camRes, soundOn: false }];
            });
            break;
          }
          case "cam_close":
            setCams((prev) => {
              const next = prev.filter((c) => c.place !== action.place);
              return next;
            });
            break;
          case "cam_close_all":
            setCams([]);
            if (markers.length > 0) {
              issueCommand({ type: "fit_all", points: markers.map((m) => ({ lat: m.lat, lng: m.lng })) });
            }
            break;
          case "cam_fullscreen":
            setFullscreenPlace(action.place);
            break;
          case "cam_exit_fullscreen":
            setFullscreenPlace(null);
            break;
          case "cam_sound":
            setCams((prev) =>
              prev.map((c) => ({ ...c, soundOn: c.place === action.place ? action.on : c.sourceType === "youtube" ? false : c.soundOn }))
            );
            break;
          case "cam_only":
            setCams((prev) => prev.filter((c) => c.place === action.place));
            break;
          case "cam_next": {
            const existing = cams.find((c) => c.place === action.place);
            const place = await resolveQuery(action.place);
            if (!place) break;
            const nextSkip = (existing?.skip ?? 0) + 1;
            const camRes: CamResult = await fetch(
              `/api/cams?place=${encodeURIComponent(place.name)}&lat=${place.lat}&lng=${place.lng}&skip=${nextSkip}`
            ).then((r) => r.json());
            setCams((prev) => [
              ...prev.filter((c) => c.place !== camRes.place),
              { ...camRes, soundOn: false, skip: nextSkip },
            ]);
            break;
          }
          case "read_news":
          case "more_info": {
            const place = action.place ? await resolveQuery(action.place) : activePlace;
            if (!place) break;
            if (place !== activePlace) {
              setActivePlace(place);
              setActivePlaceName(place.name);
              setMarkers((prev) => dedupeAddMarker(prev, { name: place.name, lat: place.lat, lng: place.lng }));
              issueCommand({ type: "goto", lat: place.lat, lng: place.lng, zoom: "region" });
            }
            void loadPlaceData(place);
            break;
          }
          default:
            break;
        }
      }
    },
    [activePlace, cams, issueCommand, loadPlaceData, markers, resolveQuery]
  );

  useEffect(() => {
    return subscribeActions((actions) => {
      void handleActions(actions);
    });
  }, [handleActions]);

  const idle = cams.length === 0 && markers.length === 0;
  const showCams = cams.length > 0;

  return (
    <JarvisLayout module="ORTS-EXPLORER // LIVE">
      <div className="flex h-full gap-3">
        <div className="relative h-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.06]">
          {showCams ? (
            <CamGrid cams={cams} fullscreenPlace={fullscreenPlace} />
          ) : (
            <PlaceExplorerCanvas
              command={command}
              markers={markers}
              newsHotspots={newsHotspots}
              idle={idle}
              dayNight={dayNight}
            />
          )}
        </div>

        {activePlace && !showCams && (
          <PlaceInfoPanel
            place={activePlace}
            weather={weather}
            airQuality={airQuality}
            articles={articles}
            loadingNews={loadingNews}
          />
        )}
      </div>
    </JarvisLayout>
  );
}
