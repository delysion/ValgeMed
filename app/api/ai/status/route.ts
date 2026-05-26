import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Check env vars first (server default)
  const envProvider = process.env.AI_PROVIDER;
  const envHasKey = !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);

  if (envProvider && envHasKey) {
    const model = process.env.AI_MODEL || (envProvider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");
    return NextResponse.json({ online: true, provider: envProvider, model, models: [model] });
  }

  // Check user's own API key
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const db = getDb();
      const [profile] = await db.select({ aiProvider: profiles.aiProvider, aiApiKey: profiles.aiApiKey }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
      if (profile?.aiProvider && profile?.aiApiKey) {
        const model = profile.aiProvider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
        return NextResponse.json({ online: true, provider: profile.aiProvider, model, models: [model] });
      }
    }
  } catch {}

  // Check Ollama locally
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("http://localhost:11434/api/tags", { method: "GET", signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const models = (data.models ?? []).map((m: { name: string }) => m.name);
      return NextResponse.json({ online: true, provider: "ollama", model: models[0] || "llama3.2", models });
    }
  } catch {}

  return NextResponse.json({ online: false, models: [], error: "AI not configured. Add your API key in Settings → AI Settings." });
}
