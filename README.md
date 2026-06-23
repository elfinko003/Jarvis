# JARVIS

A personal, Iron-Man-style voice command center built on Next.js + Cesium +
Claude. Runs as a regular web app for development, and as a fullscreen
Electron kiosk app for daily use.

## Setup

```bash
npm install
# create .env.local at the project root, then fill in the keys below
npm run dev                        # Next.js + Electron together
```

`npm run dev:next` runs just the Next.js dev server at `localhost:3000` if
you don't need the Electron shell while iterating on a view.

## API keys

Put these in `.env.local` at the project root. Nothing here is required to
boot the app — every integration degrades gracefully (a themed "unavailable"
state, not a crash) if its key is missing, but you'll want at least
Anthropic + ElevenLabs for the voice assistant to do anything.

| Variable | Service | Used for | Cost | Get it at |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic | Jarvis's brain — all intent parsing and spoken replies | ~$10–20/mo | console.anthropic.com |
| `ELEVENLABS_API_KEY` | ElevenLabs | Jarvis's voice (TTS) | $0–5/mo | elevenlabs.io |
| `ELEVENLABS_VOICE_ID` | ElevenLabs | which voice to speak with (male, calm, British accent recommended) | — | elevenlabs.io → Voices |
| `NEWSAPI_KEY` | NewsAPI | headlines for Command Center + the place explorer | $0 (100 req/day) | newsapi.org |
| `OPENWEATHER_KEY` | OpenWeatherMap | weather everywhere it's shown/spoken | $0 | openweathermap.org |
| `WINDY_WEBCAMS_KEY` | Windy Webcams | fallback live city webcams | $0 | api.windy.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | long-term conversation + fact memory | $0 | supabase.com |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | server-side write access for the same memory store | $0 | supabase.com → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase | (reserved for any future client-side reads) | $0 | supabase.com → Project Settings → API |
| `NEXT_PUBLIC_CESIUM_ION_TOKEN` | Cesium ion | optional — only needed for ion-hosted terrain/imagery add-ons | $0 | cesium.com/ion |

Two integrations need a little more than just an API key:

- **YouTube live cams** (`YOUTUBE_API_KEY`, not yet wired into `.env.local`):
  without it, the cam system silently skips straight to the Windy webcam
  fallback. Add the key to enable real YouTube live-stream search.
- **OpenAQ air quality** (`OPENAQ_KEY`): OpenAQ's v3 API now requires a free
  key. Without it, the info panel shows "N/V" instead of a number.

### Supabase memory tables

This project only has Supabase's API keys, not a database password, so the
schema can't be applied by a script. Once, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) into your Supabase project's
SQL Editor and run it. Until you do, memory persistence is a silent no-op
(Jarvis still works, it just won't remember past sessions).

## Voice control

- Say **"Jarvis"** from any view to wake it up, then speak your command.
- While Jarvis is talking, saying **"Jarvis"** again barges in and cuts off
  the current sentence so you can give a new command immediately.
- Jarvis replies in whichever language you spoke to it (German/English).

## Keyboard shortcuts

| Key | Action |
|---|---|
| `1`–`6` | Jump to Command Center / Globe / Markets / Pipeline / Morning / Voice |
| `r` | Toggle auto-rotation (cycles the 5 dashboard views every 8s) |

(Shortcuts are ignored while typing in a text field.)

## Building the desktop app

```bash
npm run dist
```

Runs `next build` then `electron-builder` (config lives in the `build` key
of `package.json`) producing an NSIS installer on Windows, a `.dmg` on
macOS, or an AppImage on Linux into `electron-dist/`. The packaged app
spawns its own `next start` server on launch — make sure `.env.local` sits
next to the installed app (or set the same variables as real environment
variables) since secrets are intentionally not bundled into the build.

## Project structure

- `app/(views)/*` — each dashboard view (one route per screen)
- `components/views/*` — the view implementations
- `components/hud/*` — shared chrome (panels, status bar, ticker, scanlines, transitions)
- `lib/*` — voice engine, Claude intent system, geocoding, memory, metrics, etc.
- `app/api/*` — server routes proxying the third-party APIs above
- `electron/*` — the desktop shell (main process + preload bridge)
