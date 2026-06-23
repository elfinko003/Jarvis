// Must be imported before "cesium" itself so Cesium can resolve its Workers/
// Widgets/Assets, which are served statically from /public/cesium (see
// scripts/copy-cesium-assets.js). ES module imports are evaluated in the
// order they appear, so this side-effect-only module runs first as long as
// it's the first import in any file that also imports "cesium".
if (typeof window !== "undefined") {
  (window as unknown as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium/";
}

export {};
