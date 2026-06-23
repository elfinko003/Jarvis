import { JarvisLayout } from "@/components/hud";
import { PipelineFeaturedTile } from "./PipelineFeaturedTile";
import { PipelineMetricTile } from "./PipelineMetricTile";
import { FEATURED_METRIC, METRICS } from "@/lib/metrics";

export function PipelineView() {
  return (
    <JarvisLayout module="PIPELINE // PERSÖNLICHE METRIKEN">
      <div className="grid h-full grid-cols-4 grid-rows-3 gap-3">
        <div className="col-span-2 row-span-2">
          <PipelineFeaturedTile metric={FEATURED_METRIC} />
        </div>
        {METRICS.map((metric) => (
          <PipelineMetricTile key={metric.label} metric={metric} />
        ))}
      </div>
    </JarvisLayout>
  );
}
