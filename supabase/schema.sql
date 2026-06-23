-- Run once in the Supabase SQL Editor (no DB password is available to this
-- project, only the API keys in .env.local, so this can't be applied via a
-- script — paste-and-run is the only path).
--
-- RLS is intentionally left off: only the server-side SUPABASE_SERVICE_ROLE_KEY
-- ever touches these tables (lib/supabaseAdmin.ts), and that key never reaches
-- the browser.

create table if not exists conversations (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  user_input text not null,
  jarvis_response text not null,
  view text,
  action jsonb
);

create index if not exists conversations_ts_idx on conversations (ts desc);

create table if not exists facts (
  id bigint generated always as identity primary key,
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);
