import { JarvisLayout } from "@/components/hud";
import { PipelineFeaturedTile } from "./PipelineFeaturedTile";
import { PipelineMetricTile } from "./PipelineMetricTile";
import { FEATURED_METRIC, METRICS } from "@/lib/metrics";

export function PipelineView() {
  return (
    <JarvisLayout module="PIPELINE // PERSÖNLICHE METRIKEN">
      <div className="flex h-full flex-col gap-3 overflow-y-auto lg:grid lg:grid-cols-4 lg:grid-rows-3 lg:overflow-visible">
        <div className="min-h-[260px] shrink-0 lg:col-span-2 lg:row-span-2 lg:min-h-0">
          <PipelineFeaturedTile metric={FEATURED_METRIC} />
        </div>
        {METRICS.map((metric) => (
          <div key={metric.label} className="shrink-0">
            <PipelineMetricTile metric={metric} />
          </div>
        ))}
      </div>
    </JarvisLayout>
  );
}
