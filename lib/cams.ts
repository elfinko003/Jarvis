export interface CamResult {
  place: string;
  sourceType: "youtube" | "windy" | "none";
  videoId: string | null;
  imageUrl: string | null;
  title: string;
  actualPlace: string | null; // set when falling back to the nearest cam, not the exact place
}

interface WindyWebcam {
  title: string;
  images?: { current?: { preview?: string } };
  location?: { latitude: number; longitude: number; city?: string };
}

async function searchYouTubeLive(query: string): Promise<{ videoId: string; title: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("eventType", "live");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("q", `${query} live cam`);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    return { videoId: item.id.videoId, title: item.snippet.title };
  } catch (error) {
    console.error("youtube live search error", error);
    return null;
  }
}

async function findWindyWebcam(
  lat: number,
  lng: number,
  placeName: string,
  skip = 0
): Promise<{ imageUrl: string; title: string; actualPlace: string | null } | null> {
  const apiKey = process.env.WINDY_WEBCAMS_KEY;
  if (!apiKey) return null;

  // Windy's `near` geo-filter is unreliable on this plan (see
  // app/api/webcams/route.ts) — grow the search radius and pick the closest
  // result that actually has a usable image, announcing it as "nearest" if
  // it's not right on top of the requested coordinates. `skip` lets
  // cam_next cycle through further results at the same location.
  for (const radius of [50, 200, 600]) {
    try {
      const url = `https://api.windy.com/webcams/api/v3/webcams?near=${lat},${lng},${radius}&limit=${5 + skip}&include=images,location`;
      const res = await fetch(url, { headers: { "x-windy-api-key": apiKey } });
      if (!res.ok) continue;
      const data = await res.json();
      const webcams: WindyWebcam[] = data.webcams ?? [];
      const withImages = webcams.filter((w) => w.images?.current?.preview);
      const chosen = withImages[skip] ?? withImages[0];
      if (chosen?.images?.current?.preview) {
        const isExact = radius === 50;
        return {
          imageUrl: chosen.images.current.preview,
          title: chosen.title,
          actualPlace: isExact ? null : chosen.location?.city ?? chosen.title,
        };
      }
    } catch (error) {
      console.error("windy webcam search error", error);
    }
  }

  return null;
}

/**
 * Combined cam source strategy: real YouTube live video preferred, falling
 * back to a Windy still-image webcam, falling back further to the nearest
 * webcam available at growing radii. Returns sourceType "none" if nothing
 * is found at all (caller shows a placeholder).
 */
export async function resolveCam(place: string, lat: number, lng: number, skip = 0): Promise<CamResult> {
  if (skip === 0) {
    const live = await searchYouTubeLive(place);
    if (live) {
      return {
        place,
        sourceType: "youtube",
        videoId: live.videoId,
        imageUrl: null,
        title: live.title,
        actualPlace: null,
      };
    }
  }

  const windy = await findWindyWebcam(lat, lng, place, skip);
  if (windy) {
    return {
      place,
      sourceType: "windy",
      videoId: null,
      imageUrl: windy.imageUrl,
      title: windy.title,
      actualPlace: windy.actualPlace,
    };
  }

  return { place, sourceType: "none", videoId: null, imageUrl: null, title: "", actualPlace: null };
}
