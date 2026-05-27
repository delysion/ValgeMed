import { describe, expect, it } from "vitest";

import { shouldAutoSaveAiTool } from "@/lib/ai/tool-saving";

describe("AI tool saving policy", () => {
  it("requires manual confirmation before model output writes records", () => {
    expect(shouldAutoSaveAiTool("daily_command")).toBe(false);
    expect(shouldAutoSaveAiTool("error_analysis")).toBe(false);
    expect(shouldAutoSaveAiTool("weekly_review")).toBe(false);
    expect(shouldAutoSaveAiTool("exam_battle_plan")).toBe(false);
    expect(shouldAutoSaveAiTool("semester_plan")).toBe(false);
    expect(shouldAutoSaveAiTool("research_ideas")).toBe(false);
  });
});
