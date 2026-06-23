// Digit hotkeys 1-8 jump straight to a view; the same ordered list also
// drives auto-rotation cycling (Prompt 13, item 3+4). Slots 7/8 are reserved
// for views not built yet (smart home).
export const HOTKEY_VIEWS: (string | null)[] = [
  "/command-center",
  "/world-globe",
  "/markets",
  "/pipeline",
  "/morning",
  "/voice",
  null,
  null,
];

export const ROTATION_VIEWS: string[] = ["/command-center", "/world-globe", "/markets", "/pipeline", "/morning"];

export const ROTATION_INTERVAL_MS = 8000;
