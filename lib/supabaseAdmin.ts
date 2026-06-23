import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only client (service role bypasses RLS) — never import this from a
// "use client" file. null when the project isn't configured yet, so memory
// degrades to a no-op instead of crashing the request.
export const supabaseAdmin = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;
