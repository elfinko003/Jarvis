import { redirect } from "next/navigation";

// city-briefing was merged into the universal place explorer at
// /world-globe (see lib/geocode.ts) — kept as a redirect so old
// bookmarks/voice routes still land somewhere sensible.
export default function CityBriefingPage() {
  redirect("/world-globe");
}
