"use client";

import { Panel, LoadingState } from "@/components/hud";
import { currencyForCca2, findCountryByCca2, flagEmoji } from "@/lib/countries";
import type { PlaceResult, PlaceType } from "@/lib/geocode";
import type { WeatherData } from "@/app/api/weather/route";
import type { AirQualityData } from "@/app/api/airquality/route";
import type { NewsArticle } from "@/app/api/news/route";

const TYPE_LABEL: Record<PlaceType, string> = {
  city: "STADT",
  country: "LAND",
  landmark: "SEHENSWÜRDIGKEIT",
  region: "REGION",
  continent: "KONTINENT",
  other: "ORT",
};

const AQI_COLOR: Record<AirQualityData["category"], string> = {
  good: "text-green",
  moderate: "text-orange",
  poor: "text-red",
  unavailable: "text-text-dim",
};

const AQI_LABEL: Record<AirQualityData["category"], string> = {
  good: "GUT",
  moderate: "MÄSSIG",
  poor: "SCHLECHT",
  unavailable: "N/V",
};

const INTEL_DOTS = ["bg-green", "bg-orange", "bg-text-dim"];
const INTEL_FALLBACK = [
  "Verkehrslage normal, keine Störungen gemeldet.",
  "Keine besonderen Vorkommnisse registriert.",
  "Infrastruktur läuft im Normalbetrieb.",
];

function approxUtcOffset(lng: number): string {
  const offset = Math.round(lng / 15);
  return `UTC${offset >= 0 ? "+" : ""}${offset}`;
}

function formatTime(iso?: string): string {
  try {
    return new Date(iso ?? Date.now()).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
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
      className="relative flex gap-2 overflow-hidden rounded-[2px] border border-border-dim p-1.5 transition-colors hover:border-orange/50"
    >
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[2px] bg-bg-panel-2">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.imageUrl} alt="" className="h-full w-full object-cover opacity-85" />
        ) : (
          <div className="h-full w-full [background:linear-gradient(135deg,#1a1a1f,#0a0a0c)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-mono text-[10px] text-text-bright">{article.title}</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[1px] text-text-faint">
          {article.source} · {formatTime(article.publishedAt)}
        </p>
      </div>
    </a>
  );
}

interface PlaceInfoPanelProps {
  place: PlaceResult;
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  articles: NewsArticle[];
  loadingNews: boolean;
}

export function PlaceInfoPanel({ place, weather, airQuality, articles, loadingNews }: PlaceInfoPanelProps) {
  const country = findCountryByCca2(place.countryCode ?? "");
  const aqi = airQuality ?? { aqi: null, category: "unavailable" as const, available: false };
  const situationLines = [articles[0]?.title, articles[1]?.title].filter((t): t is string => Boolean(t));
  const intelLines = INTEL_DOTS.map((dot, i) => ({
    dot,
    text: articles[i + 2]?.title ?? INTEL_FALLBACK[i],
    time: formatTime(articles[i + 2]?.publishedAt),
  }));

  return (
    <div className="flex h-full w-[38%] shrink-0 min-h-0 flex-col gap-2.5 overflow-y-auto">
      <Panel>
        <p className="font-mono text-2xl uppercase tracking-[2px] text-orange [text-shadow:0_0_8px_var(--orange)]">
          {place.name}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[2px] text-text-dim">
          {country?.name.toUpperCase() ?? place.countryCode ?? "—"} · {approxUtcOffset(place.lng)} ·{" "}
          {TYPE_LABEL[place.type]}
        </p>
      </Panel>

      {!weather && (
        <Panel title="WETTER">
          <LoadingState label="LADE WETTERDATEN" />
        </Panel>
      )}

      {weather && (
        <Panel title="WETTER">
          <p className="font-mono text-3xl text-text-bright">{weather.temp}°C</p>
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
        </Panel>
      )}

      <div className="flex gap-2.5">
        <Panel title="ECKDATEN" className="flex-1">
          <p className="font-mono text-2xl">{flagEmoji(place.countryCode)}</p>
          <p className="mt-1 font-mono text-[10px] text-text-dim">
            Hauptstadt <span className="text-text-bright">{country?.capital ?? "—"}</span>
          </p>
          <p className="font-mono text-[10px] text-text-dim">
            Einwohner{" "}
            <span className="text-text-bright">{country ? country.population.toLocaleString("de-DE") : "—"}</span>
          </p>
          <p className="font-mono text-[10px] text-text-dim">
            Währung <span className="text-text-bright">{currencyForCca2(place.countryCode)}</span>
          </p>
        </Panel>

        <Panel title="LUFTQUALITÄT" className="flex-1">
          <p className={`font-mono text-2xl ${AQI_COLOR[aqi.category]}`}>{aqi.aqi ?? "—"}</p>
          <p className={`font-mono text-[10px] uppercase tracking-[1px] ${AQI_COLOR[aqi.category]}`}>
            {AQI_LABEL[aqi.category]}
          </p>
          {!aqi.available && <p className="mt-1 font-mono text-[9px] text-text-faint">Keine Messstation gefunden</p>}
        </Panel>
      </div>

      <Panel title={`AKTUELLE LAGE · ${country?.name.toUpperCase() ?? place.countryCode ?? "—"}`}>
        <div className="space-y-1.5 font-mono text-[10px] text-text-dim">
          {loadingNews && <LoadingState />}
          {!loadingNews && situationLines.length === 0 && <p>Keine aktuellen Berichte.</p>}
          {situationLines.map((line, i) => (
            <p key={i} className="text-text-bright">
              {line}
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

      <Panel title="TOP-NEWS" className="flex-1">
        <div className="space-y-1.5">
          {loadingNews && <LoadingState label="LADE NACHRICHTEN" />}
          {!loadingNews && articles.length === 0 && (
            <p className="font-mono text-[10px] text-text-dim">Keine Daten verfügbar.</p>
          )}
          {articles.slice(0, 4).map((article) => (
            <NewsCard key={article.url} article={article} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
