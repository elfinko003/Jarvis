import { NextRequest, NextResponse } from "next/server";

export interface WebcamInfo {
  title: string;
  imageUrl: string | null;
}

interface WindyWebcam {
  title: string;
  images?: { current?: { preview?: string } };
  location?: { latitude: number; longitude: number };
}

const MAX_DISTANCE_KM = 200;

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// The Windy webcams API key in use here is on a plan that silently ignores
// the `near` geo-filter (it always returns the same globally top-viewed
// webcams, confirmed by querying it with wildly different coordinates and
// getting identical results back) — so results are filtered by actual
// distance here instead of trusting the API to have done it.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const apiKey = process.env.WINDY_WEBCAMS_KEY;
  if (!apiKey || !lat || !lng) {
    return NextResponse.json({ webcams: [null, null] });
  }

  try {
    const url = `https://api.windy.com/webcams/api/v3/webcams?near=${lat},${lng},150&limit=10&include=images,location`;
    const res = await fetch(url, { headers: { "x-windy-api-key": apiKey } });
    const data = await res.json();

    if (!res.ok || !Array.isArray(data.webcams)) {
      return NextResponse.json({ webcams: [null, null] });
    }

    const nearby = (data.webcams as WindyWebcam[]).filter(
      (cam) =>
        cam.location &&
        distanceKm(Number(lat), Number(lng), cam.location.latitude, cam.location.longitude) <= MAX_DISTANCE_KM
    );

    const webcams: (WebcamInfo | null)[] = nearby.slice(0, 2).map((cam) => ({
      title: cam.title,
      imageUrl: cam.images?.current?.preview ?? null,
    }));
    while (webcams.length < 2) webcams.push(null);

    return NextResponse.json({ webcams });
  } catch (error) {
    console.error("webcams route error", error);
    return NextResponse.json({ webcams: [null, null] });
  }
}
