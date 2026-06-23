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
      <div className="flex h-full flex-col gap-3">
        <div className="grid min-h-0 flex-[3] grid-cols-[1fr_1.6fr_1fr] gap-3">
          <RadarRing />
          <ReactorCore />
          <StatusMetricsList />
        </div>

        <KpiBar />

        <div className="grid min-h-0 flex-[2] grid-cols-2 gap-3">
          <AlarmPanel />
          <NewsFeed />
        </div>
      </div>
    </JarvisLayout>
  );
}
