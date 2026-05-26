import { describe, expect, it } from "vitest";

import { shouldAutoSaveAiTool } from "@/lib/ai/tool-saving";

describe("AI tool saving policy", () => {
  it("does not auto-save error analysis results because they have a manual confirm step", () => {
    expect(shouldAutoSaveAiTool("error_analysis")).toBe(false);
  });

  it("keeps one-click auto-save behavior for tools without a subject confirmation step", () => {
    expect(shouldAutoSaveAiTool("daily_command")).toBe(true);
    expect(shouldAutoSaveAiTool("weekly_review")).toBe(true);
    expect(shouldAutoSaveAiTool("exam_battle_plan")).toBe(true);
    expect(shouldAutoSaveAiTool("semester_plan")).toBe(true);
    expect(shouldAutoSaveAiTool("research_ideas")).toBe(true);
  });
});
