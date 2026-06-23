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
    const locationId = locations?.results?.[0]?.id;
    if (!locationId) {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }

    const latestRes = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`, {
      headers: { "X-API-Key": apiKey },
    });
    const latest = await latestRes.json();
    const value = latest?.results?.[0]?.value;
    if (typeof value !== "number") {
      return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
    }

    const aqi = Math.round(value);
    return NextResponse.json({ aqi, category: categorize(aqi), available: true } satisfies AirQualityData);
  } catch (error) {
    console.error("airquality route error", error);
    return NextResponse.json({ aqi: null, category: "unavailable", available: false } satisfies AirQualityData);
  }
}
