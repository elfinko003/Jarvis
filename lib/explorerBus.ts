import type { JarvisAction } from "./jarvisActions";

// A voice command can arrive while PlaceExplorerView isn't mounted yet (the
// router navigation to /world-globe and the dynamic Cesium import both take
// a moment) — the same mount-race class of bug found in earlier prompts.
// Rather than re-derive that fix, this is a tiny module-level pubsub: publish
// is fire-and-forget, but the most recent batch is buffered so a late
// subscriber can replay it once it mounts.
type Listener = (actions: JarvisAction[]) => void;

let lastBatch: JarvisAction[] | null = null;
let lastBatchConsumed = true;
const listeners = new Set<Listener>();

export function publishActions(actions: JarvisAction[]): void {
  lastBatch = actions;
  lastBatchConsumed = listeners.size > 0;
  listeners.forEach((listener) => listener(actions));
}

export function subscribeActions(listener: Listener): () => void {
  listeners.add(listener);
  if (lastBatch && !lastBatchConsumed) {
    lastBatchConsumed = true;
    listener(lastBatch);
  }
  return () => listeners.delete(listener);
}

// Sticky-location context: PlaceExplorerView reports the canonical resolved
// place name here once geocoding finishes, so the next /api/jarvis call
// (made from useJarvisVoice, which never does its own geocoding) can resolve
// "dort/dazu/da" the same way Claude expects.
let activePlaceName: string | null = null;

export function setActivePlaceName(name: string | null): void {
  activePlaceName = name;
}

export function getActivePlaceName(): string | null {
  return activePlaceName;
}
