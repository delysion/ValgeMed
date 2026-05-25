import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai/ollama";
import { requireUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  let locale = "en";
  try {
    const user = await requireUser();
    const body = await request.json();
    const { tool, input, locale: reqLocale = "en" } = body as {
      tool: string;
      input: string;
      locale?: string;
    };
    locale = reqLocale;

    // Get user's AI settings
    const db = getDb();
    const [profile] = await db.select({ aiProvider: profiles.aiProvider, aiApiKey: profiles.aiApiKey }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    const userOptions = profile?.aiApiKey ? { provider: profile.aiProvider || undefined, apiKey: profile.aiApiKey } : undefined;

    if (!tool || !input) {
      return NextResponse.json({ error: "Missing tool or input" }, { status: 400 });
    }

    const langRule = locale === "et"
      ? "Vasta eesti keeles. Meditsiiniterminoloogia olgu täpne. Ära leiuta fakte."
      : "Respond in English. Keep medical terminology precise. Do not invent facts.";

    let prompt = "";

    switch (tool) {
      case "daily_command":
        prompt = `${langRule}\n\nYou are a medical study strategist. Based on this study data, respond with a JSON object ONLY (no markdown, no explanation):\n{\n  "focus": "Primary focus for today (1 sentence)",\n  "activeRecallMinutes": 45,\n  "passiveStudyMinutes": 30,\n  "energyLevel": 7,\n  "stressLevel": 4,\n  "dailyCommand": "Brief daily command text"\n}\nEnergyLevel and stressLevel are 0-10. activeRecallMinutes and passiveStudyMinutes are estimated minutes. Respond with valid JSON only.\n\nStudy data:\n${input}`;
        break;
      case "exam_battle_plan":
        prompt = `${langRule}\n\nYou are an exam preparation strategist. Create a detailed battle plan for the exam described. Include: key topics to focus on, time allocation, common pitfalls, and a day-by-day breakdown.\n\nExam info:\n${input}`;
        break;
      case "error_analysis":
        prompt = `${langRule}\n\nYou are a study error analyst. Analyze the error data and respond with a JSON object ONLY (no markdown, no explanation). Use this exact structure:\n{\n  "title": "Short error title (max 220 chars)",\n  "cause": "Root cause analysis",\n  "correction": "Specific correction steps",\n  "preventionRule": "How to prevent this in the future",\n  "severity": 7\n}\nSeverity must be 0-10. Respond with valid JSON only.\n\nError data:\n${input}`;
        break;
      case "weekly_review":
        prompt = `${langRule}\n\nYou are a weekly review coach. Analyze this week's study data and respond with a JSON object ONLY (no markdown, no explanation):\n{\n  "wins": "What went well this week",\n  "weaknesses": "What needs improvement",\n  "nextFocus": "Primary focus for next week",\n  "decisions": "Key decisions made"\n}\nRespond with valid JSON only.\n\nWeekly data:\n${input}`;
        break;
      case "semester_plan":
        prompt = `${langRule}\n\nYou are a semester planning strategist. Create a semester plan based on these exams, subjects, and goals. Include milestone dates and priority allocation.\n\nSemester data:\n${input}`;
        break;
      case "research_ideas":
        prompt = `${langRule}\n\nYou are a research advisor. Analyze these research areas and suggest: potential hypotheses, methodology considerations, and publication opportunities.\n\nResearch data:\n${input}`;
        break;
      default:
        return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }

    const result = await aiChat(prompt, undefined, userOptions);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("AI execute error:", error);
    
    if (error instanceof Error && error.message === "OLLAMA_NOT_RUNNING") {
      return NextResponse.json(
        { 
          error: locale === "et" ? "AI ei tööta. Lisa AI_PROVIDER ja API võti Verceli keskkonnamuutujatesse või käivita kohalik Ollama." : "AI is not running. Add AI_PROVIDER and API key in Vercel environment variables, or start Ollama locally.",
          errorType: "OLLAMA_NOT_RUNNING"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      error: locale === "et" ? "AI töötlemine ebaõnnestus. Proovi uuesti." : "AI processing failed. Please try again.",
      errorType: "UNKNOWN"
    }, { status: 500 });
  }
}
