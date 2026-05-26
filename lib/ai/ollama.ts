"use server";

import { boundPrompt } from "@/lib/ai/prompt-limits";

// ─── AI Provider Abstraction ───
// Supports: ollama (local), openai (OpenAI API), groq (Groq API)
// Uses user's API key if provided, falls back to env vars, then Ollama.
// To configure, users can set their key in Settings → AI Settings.
// Admins can also set AI_PROVIDER and API key in Vercel env vars.

export type AiChatOptions = {
  provider?: string;
  apiKey?: string;
  promptLimitChars?: number | null;
}

export async function aiChat(prompt: string, model?: string, userOptions?: AiChatOptions): Promise<string> {
  const provider = userOptions?.provider || process.env.AI_PROVIDER || "ollama";
  const apiKey = userOptions?.apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
  const boundedPrompt = boundPrompt(prompt, userOptions?.promptLimitChars);

  // Try cloud provider
  if (provider !== "ollama" && apiKey) {
    const baseUrl = provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : "https://api.openai.com/v1";
    const selectedModel = model || process.env.AI_MODEL || (provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: selectedModel, messages: [{ role: "user", content: boundedPrompt }], temperature: 0.3, max_tokens: 2000 }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI API error: ${response.status} — ${err}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
      if (!userOptions?.apiKey) throw error; // Only fall back to Ollama if using default key
      throw new Error("Invalid API key or provider configuration");
    }
  }

  // Fallback: Ollama locally
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: model || "llama3.2", prompt: boundedPrompt, stream: false }),
    });
    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("OLLAMA_NOT_RUNNING");
    }
    throw error;
  }
}

// ─── Parsing Utilities ───

export interface ParsedStudyIntent {
  action: "study_session" | "review_item" | "subject" | "topic" | "unknown";
  subject?: string;
  topic?: string;
  durationMinutes?: number;
  question?: string;
  answer?: string;
  notes?: string;
}

const SYSTEM_PROMPT = `You are a study assistant that parses natural language into structured data. 
Analyze the user's intent and respond with ONLY a JSON object (no markdown, no explanation).
Valid actions:
- "study_session": User wants to log a study block (needs subject, optional topic and durationMinutes)
- "review_item": User wants to add a flashcard/review item (needs question and optionally answer, subject, topic)
- "subject": User wants to create a new subject/course (needs subject name)
- "topic": User wants to create a topic under a subject (needs subject and topic name)
- "unknown": Can't determine intent

Response format:
{"action": "...", "subject": "...", "topic": "...", "durationMinutes": ..., "question": "...", "answer": "...", "notes": "..."}
Use null for missing fields. durationMinutes should be a number if provided.`;

export async function parseUserIntent(text: string, userOptions?: AiChatOptions): Promise<ParsedStudyIntent> {
  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser input: "${text}"\n\nRespond with ONLY JSON.`;
    const response = await aiChat(fullPrompt, undefined, userOptions);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as ParsedStudyIntent;
  } catch {
    return { action: "unknown" };
  }
}

export async function generateReviewItemsFromText(
  text: string,
  subject?: string,
  topic?: string,
  userOptions?: AiChatOptions,
): Promise<Array<{ question: string; answer: string; notes: string }>> {
  try {
    const prompt = `Generate 3-5 review flashcards from the following study material. 
Return ONLY a JSON array of objects with fields: question, answer, notes.
Each flashcard should test a key concept. Format: [{"question": "...", "answer": "...", "notes": "..."}]

Study material:
${text}
${subject ? `\nSubject: ${subject}` : ""}
${topic ? `\nTopic: ${topic}` : ""}`;

    const response = await aiChat(prompt, undefined, userOptions);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function summarizeText(text: string, maxLength = 200, userOptions?: AiChatOptions): Promise<string> {
  try {
    const prompt = `Summarize this text in no more than ${maxLength} characters. Return ONLY the summary:\n\n${text}`;
    return await aiChat(prompt, undefined, userOptions);
  } catch {
    return "Summary unavailable — AI not connected";
  }
}
