export type PlaceType = "city" | "country" | "landmark" | "region" | "continent" | "other";

export interface PlaceResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: PlaceType;
  countryCode: string | null;
  boundingBox: [number, number, number, number] | null; // [south, north, west, east]
  importance: number;
}

interface NominatimResult {
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: { country_code?: string };
  boundingbox: [string, string, string, string];
  importance: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; results: PlaceResult[] }>();

// Nominatim's usage policy caps anonymous use at ~1 request/sec — this
// queues requests through a single in-flight chain instead of firing them
// concurrently, so a burst of geocode calls doesn't get throttled/blocked.
let lastRequestAt = 0;
let chain: Promise<unknown> = Promise.resolve();
const MIN_INTERVAL_MS = 1100;

function throttle<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  chain = run.catch(() => undefined);
  return run;
}

function classifyType(osmClass: string, osmType: string): PlaceType {
  if (osmType === "country") return "country";
  if (osmClass === "place") {
    if (["city", "town", "village", "hamlet"].includes(osmType)) return "city";
    if (["continent"].includes(osmType)) return "continent";
    if (["state", "region", "county", "province"].includes(osmType)) return "region";
  }
  if (["administrative"].includes(osmType)) return "region";
  if (["historic", "tourism", "man_made", "monument", "memorial"].includes(osmClass)) return "landmark";
  return "other";
}

function toPlaceResult(r: NominatimResult): PlaceResult {
  const [south, north, west, east] = r.boundingbox.map(Number) as [number, number, number, number];
  return {
    name: r.name ?? r.display_name.split(",")[0],
    displayName: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
    type: classifyType(r.class, r.type),
    countryCode: r.address?.country_code?.toUpperCase() ?? null,
    boundingBox: [south, north, west, east],
    importance: r.importance,
  };
}

/**
 * Resolves a free-text place query (city, country, landmark, region,
 * continent — in any language) via OpenStreetMap Nominatim. No API key, but
 * rate-limited to ~1req/s per Nominatim's usage policy, so calls are
 * throttled and short-term cached here.
 */
export async function resolvePlace(query: string): Promise<PlaceResult[]> {
  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.results;
  }

  const results = await throttle(async () => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("extratags", "1");
    url.searchParams.set("limit", "5");

    const res = await fetch(url, {
      headers: { "User-Agent": "JarvisOS/1.0 (personal desktop assistant, non-commercial)" },
    });
    if (!res.ok) return [];
    const data: NominatimResult[] = await res.json();
    return data.map(toPlaceResult);
  });

  cache.set(key, { at: Date.now(), results });
  return results;
}

/**
 * Decides whether a set of geocoding results is ambiguous enough that
 * Jarvis should ask which one the user meant, rather than guessing. A clear
 * favourite (importance well above the runner-up) is taken directly.
 */
export function isAmbiguous(results: PlaceResult[]): boolean {
  if (results.length < 2) return false;
  const [first, second] = results;
  return second.importance > first.importance * 0.85;
}
