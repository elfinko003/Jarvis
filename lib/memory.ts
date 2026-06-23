import { supabaseAdmin } from "./supabaseAdmin";

export interface ConversationRecord {
  id: number;
  ts: string;
  user_input: string;
  jarvis_response: string;
  view: string | null;
  action: unknown;
}

export interface FactRecord {
  key: string;
  value: string;
}

export async function saveConversation(
  userInput: string,
  jarvisResponse: string,
  view?: string | null,
  action?: unknown
): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("conversations").insert({
    user_input: userInput,
    jarvis_response: jarvisResponse,
    view: view ?? null,
    action: action ?? null,
  });
}

export async function getRecentContext(n: number): Promise<ConversationRecord[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .order("ts", { ascending: false })
    .limit(n);
  return (data ?? []).reverse();
}

export async function searchMemory(query: string): Promise<ConversationRecord[]> {
  if (!supabaseAdmin) return [];
  // PostgREST's .or() parses commas/parens as filter-grammar delimiters, so
  // strip them (and the ILIKE wildcard itself) from the raw search term
  // before interpolating — otherwise a crafted query could inject extra
  // OR-conditions into the filter.
  const safe = query.replace(/[,()%]/g, "").trim();
  if (!safe) return [];
  const { data } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .or(`user_input.ilike.%${safe}%,jarvis_response.ilike.%${safe}%`)
    .order("ts", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function saveFact(key: string, value: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("facts").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

export async function getFacts(): Promise<FactRecord[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin.from("facts").select("key, value");
  return data ?? [];
}
