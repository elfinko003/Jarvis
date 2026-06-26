"use client";

import type { CamResult } from "@/lib/cams";

export interface CamState extends CamResult {
  soundOn: boolean;
  skip?: number;
}

interface CamGridProps {
  cams: CamState[];
  fullscreenPlace: string | null;
}

// 1 -> full, 2 -> side by side, 3-4 -> 2x2, 5-6 -> 3x2, 7-9 -> 3x3, 10-12 -> 4x3
function gridClass(count: number): string {
  if (count <= 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  if (count <= 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-3 grid-rows-2";
  if (count <= 9) return "grid-cols-3 grid-rows-3";
  return "grid-cols-4 grid-rows-3";
}

function CamTile({ cam, isThrottled }: { cam: CamState; isThrottled: boolean }) {
  // Hardware note: many concurrent YouTube <iframe> live players are very
  // CPU/GPU/network-heavy — an Intel N100-class machine will choke on 8-12
  // of them at once. Past the first few grid tiles, fall back to a static
  // thumbnail instead of a real embed rather than melting weak hardware.
  const showLiveVideo = cam.sourceType === "youtube" && !isThrottled;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/[0.08] bg-bg-panel-2">
      {showLiveVideo && cam.videoId ? (
        <iframe
          key={cam.soundOn ? "unmuted" : "muted"}
          src={`https://www.youtube.com/embed/${cam.videoId}?autoplay=1&mute=${cam.soundOn ? 0 : 1}&controls=0&modestbranding=1&playsinline=1`}
          className="h-full w-full"
          loading="lazy"
          allow="autoplay; encrypted-media"
        />
      ) : cam.sourceType === "youtube" && cam.videoId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://i.ytimg.com/vi/${cam.videoId}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover opacity-85"
        />
      ) : cam.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cam.imageUrl} alt="" className="h-full w-full object-cover opacity-85" />
      ) : (
        <div className="flex h-full w-full items-center justify-center [background:linear-gradient(135deg,#0d1220,#05070e)]">
          <p className="font-mono text-[10px] uppercase tracking-[1px] text-text-faint">Kein Signal</p>
        </div>
      )}

      <span className="glass-surface absolute left-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[1px] text-text-bright">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />LIVE · {cam.place.toUpperCase()}
        {cam.actualPlace && <span className="text-text-faint">(nächste: {cam.actualPlace})</span>}
      </span>

      <span className="glass-surface absolute bottom-2 right-2 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[1px] text-text-faint">
        {cam.sourceType === "youtube" ? "YOUTUBE" : cam.sourceType === "windy" ? "WEBCAM" : "—"}
        {cam.soundOn && cam.sourceType === "youtube" ? " · 🔊" : " · 🔇"}
      </span>
    </div>
  );
}

export function CamGrid({ cams, fullscreenPlace }: CamGridProps) {
  if (cams.length === 0) return null;

  const fullscreenCam = fullscreenPlace ? cams.find((c) => c.place === fullscreenPlace) : null;
  if (fullscreenCam) {
    return (
      <div className="h-full w-full">
        <CamTile cam={fullscreenCam} isThrottled={false} />
      </div>
    );
  }

  return (
    <div className={`grid h-full w-full gap-2 ${gridClass(cams.length)}`}>
      {cams.map((cam, i) => (
        <CamTile key={cam.place} cam={cam} isThrottled={cams.length > 4 && i >= 4} />
      ))}
    </div>
  );
}
