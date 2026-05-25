import { NextResponse } from "next/server";

export async function GET() {
  const provider = process.env.AI_PROVIDER || "ollama";
  const hasKey = !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);

  // Cloud provider configured
  if (provider !== "ollama" && hasKey) {
    const model = process.env.AI_MODEL || (provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");
    return NextResponse.json({
      online: true,
      provider,
      model,
      models: [model],
    });
  }

  // Check Ollama locally
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ online: false, models: [], error: `Ollama status ${response.status}` });
    }

    const data = await response.json();
    const models = (data.models ?? []).map((m: { name: string }) => m.name);
    return NextResponse.json({ online: true, provider: "ollama", model: models[0] || "llama3.2", models });
  } catch {
    return NextResponse.json({
      online: false,
      models: [],
      error: process.env.AI_PROVIDER
        ? "Check your AI_PROVIDER and API key in Vercel environment variables"
        : "Ollama is not running locally. Start with: ollama serve",
    });
  }
}
