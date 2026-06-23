import { NextResponse } from "next/server";

export interface EarthquakeEvent {
  place: string;
  magnitude: number;
  time: string;
  lat: number;
  lng: number;
}

interface UsgsFeature {
  properties: { place: string; mag: number; time: number };
  geometry: { coordinates: [number, number, number] };
}

// USGS's feed needs no key and is the source for "wo war das Erdbeben"-style
// event queries — Claude routes these to goto_place with a query resolved
// here rather than a free-text geocode of "the earthquake".
export async function GET() {
  try {
    const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson");
    if (!res.ok) return NextResponse.json({ events: [] });

    const data = await res.json();
    const events: EarthquakeEvent[] = (data.features as UsgsFeature[])
      .map((f) => ({
        place: f.properties.place,
        magnitude: f.properties.mag,
        time: new Date(f.properties.time).toISOString(),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error("earthquakes route error", error);
    return NextResponse.json({ events: [] });
  }
}
