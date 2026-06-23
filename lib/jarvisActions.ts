// The single source of truth for action shapes Claude can return from
// /api/jarvis and that the frontend (mainly PlaceExplorerView) executes.
// Keeping this as a shared module means the API route's system prompt, the
// route's runtime validation, and the view's dispatcher can't drift apart.

export interface GotoPlaceAction {
  type: "goto_place";
  query: string;
  zoom?: "region" | "street";
  multi?: boolean;
}

export interface GlobeZoomAction {
  type: "globe_zoom";
  direction: "in" | "out";
  level?: "region" | "street" | "country";
}

export interface GlobeResetAction {
  type: "globe_reset";
}

export interface GlobeFitAllAction {
  type: "globe_fit_all";
}

export interface GlobeDayNightAction {
  type: "globe_daynight";
  mode: "night" | "realtime";
}

export interface GlobeTourAction {
  type: "globe_tour";
  places?: string[];
}

export interface CamOpenAction {
  type: "cam_open";
  place: string;
  layout?: "single" | "grid";
}

export interface CamAddAction {
  type: "cam_add";
  place: string;
}

export interface CamCloseAction {
  type: "cam_close";
  place: string;
}

export interface CamCloseAllAction {
  type: "cam_close_all";
}

export interface CamFullscreenAction {
  type: "cam_fullscreen";
  place: string;
}

export interface CamExitFullscreenAction {
  type: "cam_exit_fullscreen";
}

export interface CamSoundAction {
  type: "cam_sound";
  place: string;
  on: boolean;
}

export interface CamOnlyAction {
  type: "cam_only";
  place: string;
}

export interface CamNextAction {
  type: "cam_next";
  place: string;
}

export interface ReadNewsAction {
  type: "read_news";
  place?: string;
  count?: number;
}

export interface MoreInfoAction {
  type: "more_info";
  place: string;
  topic?: "weather" | "politics" | "economy" | "airquality";
}

export interface SmarthomeAction {
  type: "smarthome";
  device: "light" | "ventilation" | "plug" | "camera" | "spotify" | "scene";
  action: string;
  value?: string | number;
}

export interface SystemAction {
  type: "system";
  op: "open_url" | "launch_app" | "screenshot" | "notify";
  value: string;
}

export interface ViewAction {
  type: "view";
  name: "command_center" | "globe" | "markets" | "pipeline" | "morning" | "voice";
}

export interface RememberFactAction {
  type: "remember_fact";
  key: string;
  value: string;
}

export interface NoneAction {
  type: "none";
}

export type JarvisAction =
  | GotoPlaceAction
  | GlobeZoomAction
  | GlobeResetAction
  | GlobeFitAllAction
  | GlobeDayNightAction
  | GlobeTourAction
  | CamOpenAction
  | CamAddAction
  | CamCloseAction
  | CamCloseAllAction
  | CamFullscreenAction
  | CamExitFullscreenAction
  | CamSoundAction
  | CamOnlyAction
  | CamNextAction
  | ReadNewsAction
  | MoreInfoAction
  | SmarthomeAction
  | SystemAction
  | ViewAction
  | RememberFactAction
  | NoneAction;

export interface JarvisIntentResponse {
  spoken: string;
  actions: JarvisAction[];
  ask?: string;
}

export const VIEW_ROUTES: Record<ViewAction["name"], string> = {
  command_center: "/command-center",
  globe: "/world-globe",
  markets: "/markets",
  pipeline: "/pipeline",
  morning: "/morning",
  voice: "/voice",
};

const PLACE_ACTION_TYPES = new Set<JarvisAction["type"]>([
  "goto_place",
  "globe_zoom",
  "globe_reset",
  "globe_fit_all",
  "globe_daynight",
  "globe_tour",
  "cam_open",
  "cam_add",
  "cam_close",
  "cam_close_all",
  "cam_fullscreen",
  "cam_exit_fullscreen",
  "cam_sound",
  "cam_only",
  "cam_next",
  "read_news",
  "more_info",
]);

export function requiresExplorerView(actions: JarvisAction[]): boolean {
  return actions.some((a) => PLACE_ACTION_TYPES.has(a.type));
}
