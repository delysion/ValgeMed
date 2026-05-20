import { NextRequest, NextResponse } from "next/server";
import { ollamaChat } from "@/lib/ai/ollama";
import { requireUser } from "@/lib/auth/supabase";

export async function POST(request: NextRequest) {
  let locale = "en";
  try {
    await requireUser();

    const body = await request.json();
    const { tool, input, locale: reqLocale = "en" } = body as {
      tool: string;
      input: string;
      locale?: string;
    };
    locale = reqLocale;

    if (!tool || !input) {
      return NextResponse.json({ error: "Missing tool or input" }, { status: 400 });
    }

    const langRule = locale === "et"
      ? "Vasta eesti keeles. Meditsiiniterminoloogia olgu täpne. Ära leiuta fakte."
      : "Respond in English. Keep medical terminology precise. Do not invent facts.";

    let prompt = "";

    switch (tool) {
      case "daily_command":
        prompt = `${langRule}\n\nYou are a medical study strategist. Based on this study data, generate a focused daily command with 3-5 actionable priorities.\n\nStudy data:\n${input}`;
        break;
      case "exam_battle_plan":
        prompt = `${langRule}\n\nYou are an exam preparation strategist. Create a detailed battle plan for the exam described. Include: key topics to focus on, time allocation, common pitfalls, and a day-by-day breakdown.\n\nExam info:\n${input}`;
        break;
      case "error_analysis":
        prompt = `${langRule}\n\nYou are a study error analyst. Analyze these error patterns and provide: root causes, prevention rules, and specific corrective actions.\n\nError data:\n${input}`;
        break;
      case "weekly_review":
        prompt = `${langRule}\n\nYou are a weekly review coach. Analyze this week's study data and provide: wins, areas to improve, specific recommendations for next week.\n\nWeekly data:\n${input}`;
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

    const result = await ollamaChat(prompt);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("AI execute error:", error);
    
    if (error instanceof Error && error.message === "OLLAMA_NOT_RUNNING") {
      return NextResponse.json(
        { 
          error: locale === "et" 
            ? "Ollama ei tööta. Käivita 'ollama serve' terminalis." 
            : "Ollama is not running. Run 'ollama serve' in your terminal.",
          errorType: "OLLAMA_NOT_RUNNING"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      error: locale === "et" 
        ? "AI töötlemine ebaõnnestus. Proovi uuesti." 
        : "AI processing failed. Please try again.",
      errorType: "UNKNOWN"
    }, { status: 500 });
  }
}
