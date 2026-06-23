"use client";

import { JarvisLayout } from "@/components/hud";
import { CommandCenterTabs } from "./CommandCenterTabs";
import { RadarRing } from "./RadarRing";
import { ReactorCore } from "./ReactorCore";
import { StatusMetricsList } from "./StatusMetricsList";
import { KpiBar } from "./KpiBar";
import { AlarmPanel } from "./AlarmPanel";
import { NewsFeed } from "./NewsFeed";

export function CommandCenterView() {
  return (
    <JarvisLayout module="COMMAND CENTER" headerCenter={<CommandCenterTabs />}>
      <div className="flex h-full flex-col gap-3 overflow-y-auto lg:overflow-visible">
        <div className="flex flex-col gap-3 lg:grid lg:min-h-0 lg:flex-[3] lg:grid-cols-[1fr_1.6fr_1fr]">
          <div className="min-h-[280px] shrink-0 lg:min-h-0">
            <RadarRing />
          </div>
          <div className="min-h-[280px] shrink-0 lg:min-h-0">
            <ReactorCore />
          </div>
          <div className="min-h-[280px] shrink-0 lg:min-h-0">
            <StatusMetricsList />
          </div>
        </div>

        <KpiBar />

        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:min-h-0 lg:flex-[2]">
          <div className="min-h-[260px] shrink-0 sm:min-h-0">
            <AlarmPanel />
          </div>
          <div className="min-h-[260px] shrink-0 sm:min-h-0">
            <NewsFeed />
          </div>
        </div>
      </div>
    </JarvisLayout>
  );
}
