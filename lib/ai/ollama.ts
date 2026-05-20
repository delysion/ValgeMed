"use server";

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function ollamaChat(prompt: string, model = "llama3.2"): Promise<string> {
  try {
    const body: Record<string, unknown> = {
      model,
      prompt,
      stream: false,
    };

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response.trim();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("OLLAMA_NOT_RUNNING");
    }
    throw error;
  }
}

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

export async function parseUserIntent(text: string): Promise<ParsedStudyIntent> {
  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser input: "${text}"\n\nRespond with ONLY JSON.`;

    const response = await ollamaChat(fullPrompt);

    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as ParsedStudyIntent;
    } catch {
      return { action: "unknown" };
    }
  } catch {
    return { action: "unknown" };
  }
}

export async function generateReviewItemsFromText(
  text: string,
  subject?: string,
  topic?: string
): Promise<Array<{ question: string; answer: string; notes: string }>> {
  try {
    const prompt = `Generate 3-5 review flashcards from the following study material. 
Return ONLY a JSON array of objects with fields: question, answer, notes.
Each flashcard should test a key concept. Format: [{"question": "...", "answer": "...", "notes": "..."}]

Study material:
${text}

${subject ? `Subject: ${subject}` : ""}
${topic ? `Topic: ${topic}` : ""}`;

    const response = await ollamaChat(prompt);

    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

export async function summarizeText(text: string, maxLength = 200): Promise<string> {
  try {
    const prompt = `Summarize this text in no more than ${maxLength} characters. Return ONLY the summary:\n\n${text}`;
    return await ollamaChat(prompt);
  } catch {
    return "Summary unavailable - Ollama not connected";
  }
}
