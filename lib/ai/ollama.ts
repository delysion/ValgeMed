"use server";

import { boundPrompt } from "@/lib/ai/prompt-limits";
import { getCloudModelSelection, warnIfDeprecatedGroqModel } from "@/lib/ai/models";

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

type AiTextRunner = (prompt: string) => Promise<string>;

export async function aiChat(prompt: string, model?: string, userOptions?: AiChatOptions): Promise<string> {
  const provider = userOptions?.provider || process.env.AI_PROVIDER || "ollama";
  const apiKey = userOptions?.apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
  const boundedPrompt = boundPrompt(prompt, userOptions?.promptLimitChars);

  // Try cloud provider
  if (provider !== "ollama" && apiKey) {
    const baseUrl = provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : "https://api.openai.com/v1";
    const modelSelection = model
      ? getCloudModelSelection(provider, model, "explicit")
      : getCloudModelSelection(provider, process.env.AI_MODEL, "env");
    warnIfDeprecatedGroqModel(modelSelection, "aiChat");
    const selectedModel = modelSelection.model;

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
  action: "study_session" | "review_item" | "subject" | "topic" | "exam" | "task" | "life_admin" | "opportunity" | "error_log" | "daily_log" | "health_log" | "language_progress" | "contact" | "time_block" | "unknown";
  subject?: string;
  topic?: string;
  title?: string;
  durationMinutes?: number;
  question?: string;
  answer?: string;
  notes?: string;
  description?: string;
  dueAt?: string;
  deadline?: string;
  examDate?: string;
  date?: string;
  nextPracticeAt?: string;
  nextFollowUpAt?: string;
  priority?: number;
  severity?: number;
  energyLevel?: number;
  stressLevel?: number;
  moodLevel?: number;
  studyMinutes?: number;
  activeRecallMinutes?: number;
  passiveStudyMinutes?: number;
  sleepQuality?: number;
  cognitiveFatigue?: number;
  recoveryQuality?: number;
  foodQuality?: number;
  minutes?: number;
  confidence?: number;
  name?: string;
  category?: "documents" | "housing" | "finance" | "health" | "university" | "travel" | "other";
  opportunityType?: "research" | "internship" | "shadowing" | "conference" | "scholarship" | "volunteering" | "student_org" | "mentorship" | "clinical_exposure" | "language_course" | "other";
  nextAction?: string;
  language?: "estonian" | "latin" | "english";
  role?: string;
  institution?: string;
  blockType?: "study" | "review" | "simulation" | "recovery" | "life_admin" | "language" | "opportunity";
  plannedMinutes?: number;
}

const SYSTEM_PROMPT = `You are a study assistant that parses natural language into structured data. 
Analyze the user's intent and respond with ONLY a JSON object (no markdown, no explanation).
Valid actions:
- "study_session": User wants to log a study block (needs subject, optional topic and durationMinutes)
- "review_item": User wants to add a flashcard/review item (needs question and optionally answer, subject, topic)
- "subject": User wants to create a new subject/course (needs subject name)
- "topic": User wants to create a topic under a subject (needs subject and topic name)
- "exam": User wants to create an exam/deadline (needs title, optional subject, examDate)
- "task": User wants to create a task/to-do (needs title, optional dueAt)
- "life_admin": User wants to track documents, permits, housing, finance, university or travel admin (needs title, optional dueAt)
- "opportunity": User wants to track research, scholarship, internship, conference or mentorship opportunity (needs title, optional deadline)
- "error_log": User wants to save a mistake/error pattern (needs title, optional subject/topic)
- "daily_log": User wants to log daily energy, stress, mood or study minutes
- "health_log": User wants to log sleep, fatigue, recovery, food or health status
- "language_progress": User wants to log language practice (needs title, optional minutes/confidence)
- "contact": User wants to add or follow up with a person (needs name, optional dueAt)
- "time_block": User wants to schedule or log a time block (needs title, optional date/durationMinutes)
- "unknown": Can't determine intent

Response format:
{"action": "...", "title": "...", "subject": "...", "topic": "...", "durationMinutes": ..., "question": "...", "answer": "...", "date": "YYYY-MM-DD", "dueAt": "YYYY-MM-DD", "deadline": "YYYY-MM-DD", "examDate": "YYYY-MM-DD", "name": "...", "priority": ..., "severity": ..., "minutes": ..., "confidence": ..., "notes": "..."}
Use null for missing fields. Durations and scores should be numbers if provided.`;

export async function parseUserIntent(
  text: string,
  userOptions?: AiChatOptions,
  runner?: AiTextRunner,
): Promise<ParsedStudyIntent> {
  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser input: "${text}"\n\nRespond with ONLY JSON.`;
    const response = runner ? await runner(fullPrompt) : await aiChat(fullPrompt, undefined, userOptions);
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
  runner?: AiTextRunner,
  locale: string = "en",
): Promise<Array<{ question: string; answer: string; notes: string }>> {
  try {
    const languageHint = locale === "et" ? "Generate flashcards in Estonian." : "Generate flashcards in English.";
    const prompt = `Generate 3-5 review flashcards from the following study material.
${languageHint}
Return ONLY a JSON array of objects with fields: question, answer, notes.
Each flashcard should test a key concept. Format: [{"question": "...", "answer": "...", "notes": "..."}]

Study material:
${text}
${subject ? `\nSubject: ${subject}` : ""}
${topic ? `\nTopic: ${topic}` : ""}`;

    const response = runner ? await runner(prompt) : await aiChat(prompt, undefined, userOptions);
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
