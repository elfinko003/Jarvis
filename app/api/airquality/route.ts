import { NextRequest, NextResponse } from "next/server";

export interface AirQualityData {
  aqi: number | null;
  category: "good" | "moderate" | "poor" | "unavailable";
  available: boolean;
}

function categorize(aqi: number): AirQualityData["category"] {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  return "poor";
}

// EPA breakpoints (2024 revision) for converting a raw PM2.5 concentration
// (µg/m³) into the single 0-500 AQI figure most people mean by "air
// quality" — OpenAQ's /latest only returns raw per-sensor concentrations
// (each in its own pollutant's unit), not a precomputed AQI, so this has to
// be done here rather than just reading "the" value off the API.
const PM25_BREAKPOINTS: [number, number, number, number][] = [
  [0.0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500],
];

function pm25ToAqi(concentration: number): number | null {
  if (concentration < 0) return null;
  for (const [bpLo, bpHi, aqiLo, aqiHi] of PM25_BREAKPOINTS) {
    if (concentration <= bpHi) {
      return Math.round(((aqiHi - aqiLo) / (bpHi - bpLo)) * (concentration - bpLo) + aqiLo);
    }
  }
  return 500;
}

// OpenAQ's v3 API now requires a free API key (a change since this was
// spec'd) — without OPENAQ_KEY configured this reports "unavailable" rather
// than faking a number, since air quality is the kind of figure that
// shouldn't be guessed.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const apiKey = process.env.OPENAQ_KEY;

  if (!apiKey || !lat || !lng) {
    return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
  }

  try {
    const locationsRes = await fetch(
      `https://api.openaq.org/v3/locations?coordinates=${lat},${lng}&radius=25000&limit=1`,
      { headers: { "X-API-Key": apiKey } }
    );
    const locations = await locationsRes.json();
    const location = locations?.results?.[0];
    const locationId = location?.id;
    if (!locationId) {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }

    const pm25SensorId = (location.sensors as { id: number; parameter: { name: string } }[] | undefined)?.find(
      (s) => s.parameter?.name === "pm25"
    )?.id;
    if (!pm25SensorId) {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }

    const latestRes = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`, {
      headers: { "X-API-Key": apiKey },
    });
    const latest = await latestRes.json();
    const pm25Value = (latest?.results as { sensorsId: number; value: number }[] | undefined)?.find(
      (r) => r.sensorsId === pm25SensorId
    )?.value;
    if (typeof pm25Value !== "number") {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }

    const aqi = pm25ToAqi(pm25Value);
    if (aqi === null) {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }
    return NextResponse.json({ aqi, category: categorize(aqi), available: true } satisfies AirQualityData);
  } catch (error) {
    console.error("airquality route error", error);
    return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
  }
}
