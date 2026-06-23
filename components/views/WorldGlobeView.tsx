"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JarvisLayout, Panel } from "@/components/hud";
import { findCountry, getDefaultCountry, type CountryInfo } from "@/lib/countries";
import { speak } from "@/lib/voice";
import type { FlyToRequest } from "./WorldGlobeCanvas";
import type { NewsArticle } from "@/app/api/news/route";

// Cesium touches `window`/WebGL at import time, so it must never be evaluated
// during SSR — load it client-only via next/dynamic.
const WorldGlobeCanvas = dynamic(() => import("./WorldGlobeCanvas").then((m) => m.WorldGlobeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[2px] text-text-dim">
      ▸ SATELLITE LINK ESTABLISHING…
    </div>
  ),
});

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: "POLITIK", value: "general" },
  { label: "WIRTSCHAFT", value: "business" },
  { label: "SPORT", value: "sports" },
  { label: "TECH", value: "technology" },
];

const CATEGORY_LABEL: Record<string, string> = {
  general: "POLITIK",
  business: "WIRTSCHAFT",
  sports: "SPORT",
  technology: "TECH",
};

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${latDir} · ${Math.abs(lng).toFixed(2)}° ${lngDir}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-[2px] border border-border-dim transition-colors hover:border-orange/50"
    >
      <div className="relative h-20 w-full bg-bg-panel-2">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.imageUrl} alt="" className="h-full w-full object-cover opacity-80" />
        ) : (
          <div className="h-full w-full [background:linear-gradient(135deg,#1a1a1f,#0a0a0c)]" />
        )}
        <span className="absolute left-2 top-2 rounded-[2px] bg-bg-black/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[1px] text-orange">
          {CATEGORY_LABEL[article.category] ?? article.category}
        </span>
      </div>
      <div className="p-2">
        <p className="line-clamp-2 font-mono text-[11px] text-text-bright">{article.title}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[1px] text-text-faint">
          {article.source} · {formatTime(article.publishedAt)}
        </p>
      </div>
    </a>
  );
}

export function WorldGlobeView() {
  const searchParams = useSearchParams();
  const announcedRef = useRef(false);
  const flyRequestIdRef = useRef(0);

  const [country, setCountry] = useState<CountryInfo>(() => {
    const fromParam = searchParams.get("country");
    return (fromParam && findCountry(fromParam)) || getDefaultCountry();
  });
  const [category, setCategory] = useState(CATEGORY_TABS[0].value);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null);

  const loadNews = useCallback(async (cca2: string, cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?country=${cca2}&category=${cat}`);
      const data = await res.json();
      setArticles(data.articles ?? []);
      return data.articles as NewsArticle[] | undefined;
    } catch {
      setArticles([]);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    flyRequestIdRef.current += 1;
    setFlyToRequest({ lat: country.lat, lng: country.lng, requestId: flyRequestIdRef.current });

    loadNews(country.cca2, category).then((loaded) => {
      const cameFromVoice = searchParams.get("country") !== null;
      if (cameFromVoice && !announcedRef.current && loaded && loaded.length > 0) {
        announcedRef.current = true;
        const headlines = loaded
          .slice(0, 3)
          .map((a) => a.title)
          .join(". ");
        speak(`Aktuelle Lage in ${country.name}, Sir. ${headlines}`);
      }
    });
    // category intentionally omitted — country changes re-fetch via this effect,
    // category changes are handled by the separate effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, loadNews]);

  useEffect(() => {
    loadNews(country.cca2, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, loadNews]);

  return (
    <JarvisLayout module="SATELLITEN // WELT-NETZ">
      <div className="flex h-full gap-3">
        <div className="relative h-full min-w-0 flex-1 overflow-hidden rounded-[2px] border border-border-dim">
          <WorldGlobeCanvas highlightLat={country.lat} highlightLng={country.lng} flyToRequest={flyToRequest} />

          <div className="pointer-events-none absolute left-4 top-4 z-10 w-[230px]">
            <Panel className="pointer-events-auto">
              <p className="font-mono text-[11px] uppercase tracking-[2px] text-orange [text-shadow:0_0_8px_var(--orange)]">
                ▸ {country.name.toUpperCase()}
              </p>
              <p className="mt-2 font-mono text-[10px] text-text-dim">{formatCoord(country.lat, country.lng)}</p>
              <p className="mt-1 font-mono text-[10px] text-text-dim">
                Hauptstadt <span className="text-text-bright">{country.capital}</span>
              </p>
              <p className="mt-1 font-mono text-[10px] text-text-dim">
                Bevölkerung <span className="text-text-bright">{country.population.toLocaleString("de-DE")}</span>
              </p>
            </Panel>
          </div>
        </div>

        <div className="flex h-full w-[340px] shrink-0 min-h-0 flex-col gap-3">
          <Panel
            title={`AKTUELLE LAGE // ${country.name.toUpperCase()}`}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="mb-3 flex gap-1.5">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setCategory(tab.value)}
                  className={`flex-1 rounded-[2px] border px-1.5 py-1 font-mono text-[9px] uppercase tracking-[1px] transition-colors ${
                    category === tab.value
                      ? "border-orange bg-orange/15 text-orange"
                      : "border-border-dim text-text-faint hover:border-orange/40 hover:text-orange-bright"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {loading && (
                <p className="font-mono text-[10px] uppercase tracking-[1px] text-text-dim">▸ LADE NACHRICHTEN…</p>
              )}
              {!loading && articles.length === 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[1px] text-text-dim">
                  ▸ KEINE DATEN VERFÜGBAR
                </p>
              )}
              {articles.map((article) => (
                <NewsCard key={article.url} article={article} />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </JarvisLayout>
  );
}
