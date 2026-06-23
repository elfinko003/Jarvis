import { NextRequest, NextResponse } from "next/server";
import { anthropic, JARVIS_SYSTEM_PROMPT } from "@/lib/claude";
import type { JarvisAction, JarvisIntentResponse } from "@/lib/jarvisActions";
import { getFacts, getRecentContext, saveConversation, saveFact } from "@/lib/memory";

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const FALLBACK_RESPONSE: JarvisIntentResponse = {
  spoken: "Entschuldigung, da ist etwas schiefgelaufen, Sir.",
  actions: [],
};

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

// Claude's output is untrusted JSON shaped by a prompt, not a typed
// contract — a malformed or hallucinated action here shouldn't crash the
// route, it should just be dropped silently.
function sanitizeActions(value: unknown): JarvisAction[] {
  if (!Array.isArray(value)) return [];
  return value.filter((a): a is JarvisAction => typeof a === "object" && a !== null && typeof (a as { type?: unknown }).type === "string");
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      spoken: "Mein Sprachmodul ist noch nicht konfiguriert, Sir.",
      actions: [],
    } satisfies JarvisIntentResponse);
  }

  const body = (await request.json()) as {
    text?: string;
    history?: ConversationTurn[];
    activePlace?: string | null;
    view?: string;
  };
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const [recentContext, facts] = await Promise.all([getRecentContext(10), getFacts()]);

  let systemPrompt = JARVIS_SYSTEM_PROMPT;
  if (facts.length > 0) {
    systemPrompt += `\n\n## Bekannte Fakten über den Nutzer\n${facts.map((f) => `- ${f.key}: ${f.value}`).join("\n")}`;
  }
  if (recentContext.length > 0) {
    systemPrompt += `\n\n## Letzte Unterhaltungen (Langzeit-Gedächtnis, älteste zuerst)\n${recentContext
      .map((c) => `[${new Date(c.ts).toLocaleString("de-DE")}] Nutzer: ${c.user_input}\nJarvis: ${c.jarvis_response}`)
      .join("\n\n")}`;
  }

  const contextLine = `[Aktiver Ort: ${body.activePlace?.trim() || "keiner"}]`;
  const messages: ConversationTurn[] = [
    ...(body.history ?? []).slice(-10),
    { role: "user", content: `${contextLine}\n${text}` },
  ];

  try {
    const completion = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      system: systemPrompt,
      messages,
    });

    const block = completion.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text : "";

    const parsedRaw = JSON.parse(extractJson(raw));
    const parsed: JarvisIntentResponse = {
      spoken: typeof parsedRaw.spoken === "string" ? parsedRaw.spoken : FALLBACK_RESPONSE.spoken,
      actions: sanitizeActions(parsedRaw.actions),
      ask: typeof parsedRaw.ask === "string" && parsedRaw.ask ? parsedRaw.ask : undefined,
    };

    void saveConversation(text, parsed.ask || parsed.spoken, body.view ?? null, parsed.actions);
    for (const action of parsed.actions) {
      if (action.type === "remember_fact") void saveFact(action.key, action.value);
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("jarvis route error", error);
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}
