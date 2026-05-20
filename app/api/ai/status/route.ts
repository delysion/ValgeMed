import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ 
        online: false, 
        models: [],
        error: `Ollama returned status ${response.status}` 
      });
    }

    const data = await response.json();
    const models = (data.models ?? []).map((m: { name: string }) => m.name);

    return NextResponse.json({ online: true, models });
  } catch (error) {
    // Ollama is not running or not reachable
    return NextResponse.json({ 
      online: false, 
      models: [],
      error: error instanceof Error ? error.message : "Connection failed"
    });
  }
}
