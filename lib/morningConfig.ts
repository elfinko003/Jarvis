// Auto-opened on arrival at /morning, via Electron's shell.openExternal
// (see electron/preload.js -> window.jarvisSystem.openUrl). Empty by
// default so nothing unexpected launches — add your own daily-routine
// URLs here (e.g. a Nordic Forge dashboard, webmail, calendar).
export const MORNING_AUTO_TABS: string[] = [];

// URI scheme Spotify registers on desktop; openUrl() hands it to the OS the
// same way it does https:// links. Leave null to skip.
export const MORNING_SPOTIFY_URI: string | null = null;
