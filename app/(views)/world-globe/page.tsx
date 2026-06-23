import { Suspense } from "react";
import { WorldGlobeView } from "@/components/views/WorldGlobeView";

export default function WorldGlobePage() {
  return (
    <Suspense fallback={null}>
      <WorldGlobeView />
    </Suspense>
  );
}
