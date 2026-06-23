import { NextRequest, NextResponse } from "next/server";
import { anthropic, JARVIS_SYSTEM_PROMPT, type JarvisResponse } from "@/lib/claude";

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const FALLBACK_RESPONSE: JarvisResponse = {
  spoken: "Entschuldigung, da ist etwas schiefgelaufen, Sir.",
  action: "none",
};

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      spoken: "Mein Sprachmodul ist noch nicht konfiguriert, Sir.",
      action: "none",
    } satisfies JarvisResponse);
  }

  const body = (await request.json()) as { text?: string; history?: ConversationTurn[] };
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const messages: ConversationTurn[] = [...(body.history ?? []).slice(-10), { role: "user", content: text }];

  try {
    const completion = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: JARVIS_SYSTEM_PROMPT,
      messages,
    });

    const block = completion.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text : "";

    const parsed: JarvisResponse = JSON.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("jarvis route error", error);
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}
