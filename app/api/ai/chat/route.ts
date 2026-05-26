import { NextRequest, NextResponse } from "next/server";

import { aiChat } from "@/lib/ai/ollama";
import {
  buildStudyCopilotContext,
  buildStudyCopilotPrompt,
  sanitizeStudyCopilotMessages,
} from "@/lib/ai/study-copilot";
import { getUserAiOptions } from "@/lib/ai/user-options";
import { requireUser } from "@/lib/auth/supabase";
import { getAiPageData } from "@/lib/data/queries";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const locale = typeof body?.locale === "string" ? body.locale : "en";
    const messages = sanitizeStudyCopilotMessages(body?.messages);

    if (messages.length === 0 || messages.at(-1)?.role !== "user") {
      return NextResponse.json({ error: "Missing user message" }, { status: 400 });
    }

    const [userOptions, pageData] = await Promise.all([
      getUserAiOptions(user.id),
      getAiPageData(user.id),
    ]);
    const context = buildStudyCopilotContext(pageData);
    const prompt = buildStudyCopilotPrompt({ locale, context, messages });
    const message = await aiChat(prompt, undefined, userOptions);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("AI chat error:", error);

    if (error instanceof Error) {
      if (error.message === "OLLAMA_NOT_RUNNING") {
        return NextResponse.json(
          { error: "AI not available. Add your API key in Settings -> AI Settings.", errorType: "OLLAMA_NOT_RUNNING" },
          { status: 503 },
        );
      }
      if (error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("Invalid API key")) {
        return NextResponse.json(
          { error: "Invalid API key. Check your key in Settings -> AI Settings.", errorType: "AUTH_ERROR" },
          { status: 401 },
        );
      }
      return NextResponse.json({ error: error.message, errorType: "UNKNOWN" }, { status: 500 });
    }

    return NextResponse.json({ error: "AI chat failed", errorType: "UNKNOWN" }, { status: 500 });
  }
}
