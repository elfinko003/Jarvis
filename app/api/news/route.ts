import { NextRequest, NextResponse } from "next/server";

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
}

// NewsAPI's free tier blocks browser-origin (CORS) requests outside
// localhost, so this route proxies it server-side with NEWSAPI_KEY.
export async function GET(request: NextRequest) {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ articles: [], error: "NEWSAPI_KEY not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") ?? "de";
  const category = searchParams.get("category") ?? "general";

  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("country", country);
  url.searchParams.set("category", category);
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("apiKey", apiKey);

  try {
    const res = await fetch(url, { headers: { "User-Agent": "JarvisOS/1.0" } });
    const data = await res.json();

    if (!res.ok || data.status !== "ok") {
      return NextResponse.json(
        { articles: [], error: data.message ?? "NewsAPI request failed" },
        { status: res.status === 200 ? 502 : res.status }
      );
    }

    const articles: NewsArticle[] = (data.articles ?? []).map(
      (a: { title: string; source?: { name?: string }; url: string; urlToImage?: string; publishedAt: string }) => ({
        title: a.title,
        source: a.source?.name ?? "Unbekannt",
        url: a.url,
        imageUrl: a.urlToImage ?? null,
        publishedAt: a.publishedAt,
        category,
      })
    );

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("news route error", error);
    return NextResponse.json({ articles: [], error: "Network error" }, { status: 502 });
  }
}
