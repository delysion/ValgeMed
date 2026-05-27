const manualConfirmTools = new Set([
  "daily_command",
  "exam_battle_plan",
  "error_analysis",
  "weekly_review",
  "semester_plan",
  "research_ideas",
]);

export function shouldAutoSaveAiTool(tool: string) {
  return !manualConfirmTools.has(tool);
}
