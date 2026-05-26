import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  MAX_STUDY_COPILOT_MESSAGE_CHARS,
  MAX_STUDY_COPILOT_MESSAGES,
  buildStudyCopilotContext,
  buildStudyCopilotPrompt,
  sanitizeStudyCopilotMessages,
} from "@/lib/ai/study-copilot";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("study copilot guardrails", () => {
  it("keeps only recent chat turns and bounds each message", () => {
    const messages = Array.from({ length: 12 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: index === 11 ? "x".repeat(MAX_STUDY_COPILOT_MESSAGE_CHARS + 500) : `message ${index}`,
    }));

    const safe = sanitizeStudyCopilotMessages(messages);

    expect(safe).toHaveLength(MAX_STUDY_COPILOT_MESSAGES);
    expect(safe[0].content).toBe("message 4");
    expect(safe.at(-1)?.content.length).toBeLessThanOrEqual(MAX_STUDY_COPILOT_MESSAGE_CHARS);
    expect(safe.at(-1)?.content).toContain("[truncated]");
  });

  it("builds a bounded user-scoped study context from relevant records", () => {
    const context = buildStudyCopilotContext({
      subjects: Array.from({ length: 14 }, (_, index) => ({ name: `Subject ${index + 1}` })),
      topics: [
        { title: "Cardiac physiology", confidence: 2, priority: 9, status: "doing" },
        { title: "Anatomy review", confidence: 8, priority: 2, status: "done" },
      ],
      errorLogs: [
        { title: "Missed contraindication", severity: 8, resolved: false },
        { title: "Old solved error", severity: 10, resolved: true },
      ],
      reviewItems: [
        { question: "What is preload?", isActive: true, dueAt: new Date("2026-05-25T09:00:00Z") },
        { question: "Inactive", isActive: false, dueAt: new Date("2026-05-25T09:00:00Z") },
      ],
      exams: [
        { title: "Physiology", examDate: new Date("2026-06-10T09:00:00Z"), importance: 9 },
      ],
    }, new Date("2026-05-26T09:00:00Z"));

    expect(context).toContain("Subject 1");
    expect(context).toContain("and 2 more");
    expect(context).toContain("Cardiac physiology");
    expect(context).toContain("Missed contraindication");
    expect(context).not.toContain("Old solved error");
    expect(context).toContain("Due reviews: 1");
    expect(context).toContain("Physiology");
  });

  it("prompts the model as a read-only copilot with no direct write permission", () => {
    const prompt = buildStudyCopilotPrompt({
      locale: "en",
      context: "Subjects: Physiology",
      messages: [{ role: "user", content: "What should I study now?" }],
    });

    expect(prompt).toContain("Study Copilot");
    expect(prompt).toContain("Use only the user context");
    expect(prompt).toContain("read-only");
    expect(prompt).toContain("Do not claim that you saved");
    expect(prompt).toContain("What should I study now?");
  });

  it("exposes a user-scoped read-only chat route", () => {
    const route = source("app", "api", "ai", "chat", "route.ts");

    expect(route).toContain("requireUser");
    expect(route).toContain("getAiPageData(user.id)");
    expect(route).toContain("getUserAiOptions(user.id)");
    expect(route).toContain("sanitizeStudyCopilotMessages");
    expect(route).toContain("buildStudyCopilotPrompt");
    expect(route).not.toContain("createErrorLogAction");
    expect(route).not.toContain("upsertDailyLogAction");
  });

  it("mounts the copilot panel on the AI page and sends chat through the guarded route", () => {
    const page = source("app", "ai", "page.tsx");
    const component = source("components", "study-copilot-chat.tsx");

    expect(page).toContain("StudyCopilotChat");
    expect(component).toContain("/api/ai/chat");
    expect(component).toContain("MAX_STUDY_COPILOT_MESSAGES");
    expect(component).toContain("ai.copilotReadOnly");
  });
});
