import { Suspense } from "react";
import { CityBriefingView } from "@/components/views/CityBriefingView";

export default function CityBriefingPage() {
  return (
    <Suspense fallback={null}>
      <CityBriefingView />
    </Suspense>
  );
}
