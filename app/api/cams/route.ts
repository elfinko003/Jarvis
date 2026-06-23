import { NextRequest, NextResponse } from "next/server";
import { resolveCam } from "@/lib/cams";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const place = searchParams.get("place");
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const skip = Number(searchParams.get("skip") ?? 0);

  if (!place || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Missing place/lat/lng" }, { status: 400 });
  }

  try {
    const cam = await resolveCam(place, lat, lng, skip);
    return NextResponse.json(cam);
  } catch (error) {
    console.error("cams route error", error);
    return NextResponse.json({ place, sourceType: "none", videoId: null, imageUrl: null, title: "", actualPlace: null });
  }
}
