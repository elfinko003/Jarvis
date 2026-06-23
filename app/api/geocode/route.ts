import { NextRequest, NextResponse } from "next/server";
import { resolvePlace } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  try {
    const results = await resolvePlace(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("geocode route error", error);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
