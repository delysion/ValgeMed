const manualConfirmTools = new Set(["error_analysis"]);

export function shouldAutoSaveAiTool(tool: string) {
  return !manualConfirmTools.has(tool);
}
