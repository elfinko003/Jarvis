// Cesium's Workers/ThirdParty/Widgets/Assets must be served as static files at
// runtime (web workers, widget CSS, etc.). Next.js only serves /public
// verbatim, and we're on Turbopack (no webpack CopyPlugin), so we copy them
// here instead of wiring a bundler plugin. Runs via npm postinstall.
const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const DEST = path.join(__dirname, "..", "public", "cesium");
const FOLDERS = ["Assets", "ThirdParty", "Widgets", "Workers"];

if (!fs.existsSync(SOURCE)) {
  console.warn("[copy-cesium-assets] cesium package not found, skipping copy.");
  process.exit(0);
}

fs.mkdirSync(DEST, { recursive: true });

for (const folder of FOLDERS) {
  const src = path.join(SOURCE, folder);
  const dest = path.join(DEST, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

console.log("[copy-cesium-assets] Cesium static assets copied to public/cesium");
