import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

function computeV2FieldPresence(preview: {
  subjects: Array<{ difficulty?: number; importance?: number }>;
  topics: Array<{ difficulty?: number; confidence?: number; status?: string; estimatedMinutes?: number }>;
  exams: Array<{ difficulty?: number; importance?: number; riskLevel?: number; readinessScore?: number; format?: string; ects?: number }>;
  tasks: Array<{ status?: string; estimatedMinutes?: number }>;
}) {
  let difficultyCount = 0;
  let confidenceCount = 0;
  let importanceCount = 0;
  let riskLevelCount = 0;
  let readinessScoreCount = 0;
  let formatCount = 0;
  let ectsCount = 0;
  let statusCount = 0;
  let taskStatusCount = 0;
  let estimatedMinutesCount = 0;

  for (const s of preview.subjects) {
    if (s.difficulty !== undefined) difficultyCount++;
    if (s.importance !== undefined) importanceCount++;
  }
  for (const t of preview.topics) {
    if (t.difficulty !== undefined) difficultyCount++;
    if (t.confidence !== undefined) confidenceCount++;
    if (t.status !== undefined) statusCount++;
    if (t.estimatedMinutes !== undefined) estimatedMinutesCount++;
  }
  for (const e of preview.exams) {
    if (e.difficulty !== undefined) difficultyCount++;
    if (e.importance !== undefined) importanceCount++;
    if (e.riskLevel !== undefined) riskLevelCount++;
    if (e.readinessScore !== undefined) readinessScoreCount++;
    if (e.format !== undefined) formatCount++;
    if (e.ects !== undefined) ectsCount++;
  }
  for (const t of preview.tasks) {
    if (t.status !== undefined) taskStatusCount++;
    if (t.estimatedMinutes !== undefined) estimatedMinutesCount++;
  }

  return {
    difficultyCount,
    confidenceCount,
    importanceCount,
    riskLevelCount,
    readinessScoreCount,
    formatCount,
    ectsCount,
    statusCount,
    taskStatusCount,
    estimatedMinutesCount,
  };
}

function categorizeWarningType(warning: string): string {
  if (warning.startsWith("Unrecognized topic status")) return "unrecognized_topic_status";
  if (warning.startsWith("Estimated minutes") && warning.includes("topic")) return "estimated_minutes_appended_to_topic";
  if (warning.startsWith("Unrecognized exam format")) return "unrecognized_exam_format";
  if (warning.startsWith("Unrecognized task status")) return "unrecognized_task_status";
  if (warning.startsWith("Estimated minutes") && warning.includes("task")) return "estimated_minutes_appended_to_task";
  return "unknown_warning";
}

function computeWarningTypes(warnings: string[]): string[] {
  const seen = new Set<string>();
  for (const w of warnings) {
    seen.add(categorizeWarningType(w));
  }
  return [...seen];
}

describe("curriculum import analytics — privacy", () => {
  const analytics = source("lib", "analytics", "curriculum-import-analytics.ts");
  const actions = source("lib", "actions", "curriculum-import.ts");

  it("does not reference rawText in analytics module", () => {
    expect(analytics).not.toContain("rawText");
  });

  it("does not reference rawInput in analytics module", () => {
    expect(analytics).not.toContain("rawInput");
  });

  it("does not reference rawOutput in analytics module", () => {
    expect(analytics).not.toContain("rawOutput");
  });

  it("does not log raw AI output in analytics module", () => {
    expect(analytics).not.toContain("executeData");
    expect(analytics).not.toContain("AI output");
    expect(analytics).not.toContain("raw AI");
  });

  it("does not pass notes content to analytics tracking", () => {
    const trackLines = actions.split("\n").filter((l) => l.includes("trackCurriculumImportParse"));
    for (const line of trackLines) {
      expect(line).not.toContain("notes");
    }
  });

  it("does not pass task titles to analytics tracking", () => {
    const trackLines = actions.split("\n").filter((l) => l.includes("trackCurriculumImportParse"));
    for (const line of trackLines) {
      expect(line).not.toContain("title");
    }
  });

  it("does not track curriculum text or API keys in analytics module", () => {
    expect(analytics).not.toContain("DATABASE_URL");
    expect(analytics).not.toContain("GROQ_API_KEY");
    expect(analytics).not.toContain("apiKey");
    expect(analytics).not.toContain("API_KEY");
  });
});

describe("curriculum import analytics — event shape", () => {
  const analytics = source("lib", "analytics", "curriculum-import-analytics.ts");

  it("exports CurriculumImportParseEvent interface", () => {
    expect(analytics).toContain("CurriculumImportParseEvent");
    expect(analytics).toContain("promptMode");
    expect(analytics).toContain("parseSuccess");
  });

  it("exports CurriculumImportConfirmEvent interface", () => {
    expect(analytics).toContain("CurriculumImportConfirmEvent");
    expect(analytics).toContain("confirmClicked");
    expect(analytics).toContain("importConfirmed");
  });

  it("parse event includes all required aggregate fields", () => {
    expect(analytics).toContain("recordCount");
    expect(analytics).toContain("countByType");
    expect(analytics).toContain("warningCount");
    expect(analytics).toContain("warningsByType");
    expect(analytics).toContain("v2FieldPresence");
    expect(analytics).toContain("numericCoercionCount");
  });

  it("v2FieldPresence includes all required sub-fields", () => {
    const fields = [
      "difficultyCount", "confidenceCount", "importanceCount",
      "riskLevelCount", "readinessScoreCount", "formatCount",
      "ectsCount", "statusCount", "taskStatusCount", "estimatedMinutesCount",
    ];
    for (const field of fields) {
      expect(analytics).toContain(field);
    }
  });

  it("confirm event includes all required fields", () => {
    expect(analytics).toContain("confirmClicked");
    expect(analytics).toContain("importConfirmed");
    expect(analytics).toContain("recordCount");
    expect(analytics).toContain("countByType");
  });

  it("exports trackCurriculumImportParse and trackCurriculumImportConfirm", () => {
    expect(analytics).toContain("trackCurriculumImportParse");
    expect(analytics).toContain("trackCurriculumImportConfirm");
  });
});

describe("computeV2FieldPresence", () => {
  it("counts zero for empty preview", () => {
    const result = computeV2FieldPresence({ subjects: [], topics: [], exams: [], tasks: [] });
    expect(result.difficultyCount).toBe(0);
    expect(result.confidenceCount).toBe(0);
    expect(result.importanceCount).toBe(0);
    expect(result.riskLevelCount).toBe(0);
    expect(result.readinessScoreCount).toBe(0);
    expect(result.formatCount).toBe(0);
    expect(result.ectsCount).toBe(0);
    expect(result.statusCount).toBe(0);
    expect(result.taskStatusCount).toBe(0);
    expect(result.estimatedMinutesCount).toBe(0);
  });

  it("counts difficulty across subjects, topics, and exams", () => {
    const result = computeV2FieldPresence({
      subjects: [{ difficulty: 7 }, { difficulty: 3 }, {}],
      topics: [{ difficulty: 5 }, {}],
      exams: [{ difficulty: 8 }, { difficulty: 2 }, { difficulty: 6 }, {}],
      tasks: [],
    });
    expect(result.difficultyCount).toBe(6);
  });

  it("counts importance across subjects and exams", () => {
    const result = computeV2FieldPresence({
      subjects: [{ importance: 8 }, {}],
      topics: [],
      exams: [{ importance: 5 }, { importance: 3 }],
      tasks: [],
    });
    expect(result.importanceCount).toBe(3);
  });

  it("counts confidence across topics", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [{ confidence: 7 }, { confidence: 4 }, {}],
      exams: [],
      tasks: [],
    });
    expect(result.confidenceCount).toBe(2);
  });

  it("counts riskLevel and readinessScore across exams", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [],
      exams: [{ riskLevel: 3, readinessScore: 7.5 }, { riskLevel: 5 }, { readinessScore: 6 }],
      tasks: [],
    });
    expect(result.riskLevelCount).toBe(2);
    expect(result.readinessScoreCount).toBe(2);
  });

  it("counts format across exams", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [],
      exams: [{ format: "written" }, {}, { format: "oral" }],
      tasks: [],
    });
    expect(result.formatCount).toBe(2);
  });

  it("counts ects across exams", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [],
      exams: [{ ects: 6 }, { ects: 3 }],
      tasks: [],
    });
    expect(result.ectsCount).toBe(2);
  });

  it("counts status across topics only", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [{ status: "understood" }, {}, { status: "reviewed" }],
      exams: [],
      tasks: [],
    });
    expect(result.statusCount).toBe(2);
  });

  it("counts taskStatus across tasks only", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [],
      exams: [],
      tasks: [{ status: "done" }, {}, { status: "doing" }, { status: "todo" }],
    });
    expect(result.taskStatusCount).toBe(3);
  });

  it("counts estimatedMinutes across topics and tasks", () => {
    const result = computeV2FieldPresence({
      subjects: [],
      topics: [{ estimatedMinutes: 30 }, {}, { estimatedMinutes: 45 }],
      exams: [],
      tasks: [{ estimatedMinutes: 60 }],
    });
    expect(result.estimatedMinutesCount).toBe(3);
  });
});

describe("categorizeWarningType", () => {
  it("categorizes topic status warning without leaking content", () => {
    const result = categorizeWarningType('Unrecognized topic status "foo" for "bar" — defaulted to not_started');
    expect(result).toBe("unrecognized_topic_status");
  });

  it("categorizes exam format warning without leaking content", () => {
    const result = categorizeWarningType('Unrecognized exam format "baz" for "qux" — set to unknown');
    expect(result).toBe("unrecognized_exam_format");
  });

  it("categorizes task status warning without leaking content", () => {
    const result = categorizeWarningType('Unrecognized task status "abc" for "def" — defaulted to todo');
    expect(result).toBe("unrecognized_task_status");
  });

  it("categorizes estimated minutes topic warning without leaking content", () => {
    const result = categorizeWarningType("Estimated minutes (30) for topic \"Renal\" appended to description");
    expect(result).toBe("estimated_minutes_appended_to_topic");
  });

  it("categorizes estimated minutes task warning without leaking content", () => {
    const result = categorizeWarningType("Estimated minutes (45) for task \"Review\" appended to description");
    expect(result).toBe("estimated_minutes_appended_to_task");
  });

  it("returns unknown_warning for unrecognized pattern", () => {
    const result = categorizeWarningType("Some random warning");
    expect(result).toBe("unknown_warning");
  });
});

describe("computeWarningTypes", () => {
  it("deduplicates warning types", () => {
    const result = computeWarningTypes([
      'Unrecognized topic status "X" for "Y" — defaulted to not_started',
      'Unrecognized topic status "A" for "B" — defaulted to not_started',
      "Estimated minutes (30) for topic \"Renal\" appended to description",
    ]);
    expect(result).toEqual(["unrecognized_topic_status", "estimated_minutes_appended_to_topic"]);
  });

  it("returns empty for empty warnings", () => {
    const result = computeWarningTypes([]);
    expect(result).toEqual([]);
  });
});

describe("curriculum import — analytics integration in actions", () => {
  const actions = source("lib", "actions", "curriculum-import.ts");

  it("calls trackCurriculumImportParse on success path", () => {
    expect(actions).toMatch(/trackCurriculumImportParse\(userId,\s*\{[\s\S]*?parseSuccess:\s*true[\s\S]*?\}\)/);
  });

  it("calls trackCurriculumImportParse on JSON error path with parseSuccess: false", () => {
    expect(actions).toContain("trackCurriculumImportParse(userId, { promptMode: pm, parseSuccess: false, error: \"Invalid JSON response\" })");
  });

  it("calls trackCurriculumImportParse on structure error path with parseSuccess: false", () => {
    expect(actions).toContain("trackCurriculumImportParse(userId, { promptMode: pm, parseSuccess: false, error: \"Invalid record structure\" })");
  });

  it("calls getAndResetNumericCoercionCount on success path", () => {
    expect(actions).toContain("numericCoercionCount: await getAndResetNumericCoercionCount()");
  });

  it("passes analytics metadata to recordImportUsage on confirm", () => {
    expect(actions).toContain("confirmClicked: true");
    expect(actions).toContain("importConfirmed: true");
    expect(actions).toContain("recordImportUsage(userId, confirmMetadata)");
  });
});

describe("curriculum import — analytics error handling", () => {
  const actions = source("lib", "actions", "curriculum-import.ts");

  it("defines trackAnalyticsSafely helper", () => {
    expect(actions).toContain("async function trackAnalyticsSafely");
    expect(actions).toContain("label");
    expect(actions).toContain("promise");
  });

  it("does not use silent .catch(() => {})", () => {
    expect(actions).not.toContain(".catch(() => {})");
  });

  it("wraps all trackCurriculumImportParse calls in trackAnalyticsSafely", () => {
    const trackCalls = actions.match(/trackCurriculumImportParse\(/g);
    const safelyWrapped = actions.match(/trackAnalyticsSafely\(.*trackCurriculumImportParse/g);
    expect(trackCalls).not.toBeNull();
    expect(safelyWrapped).not.toBeNull();
    expect(trackCalls!.length).toBe(safelyWrapped!.length);
  });

  it("does not log raw data in analytics error handler", () => {
    const safeLines = actions.split("\n").filter((l) => l.includes("trackAnalyticsSafely"));
    for (const line of safeLines) {
      expect(line).not.toContain("notes");
      expect(line).not.toContain(".title");
      expect(line).not.toContain("curriculumText");
      expect(line).not.toContain("rawOutput");
    }
  });

  it("logs only label and sanitized error message", () => {
    expect(actions).toContain('console.error("[curriculum-import analytics]"');
    expect(actions).toContain("label");
    expect(actions).toContain("error.message");
  });

  it("rethrows in non-production and swallows in production", () => {
    expect(actions).toContain('process.env.NODE_ENV !== "production"');
    expect(actions).toContain("throw error");
  });
});

vi.mock("server-only", () => ({}));

describe("getCurriculumImportDailyLimit", () => {
  beforeEach(() => {
    delete process.env.CURRICULUM_IMPORT_DAILY_LIMIT;
  });

  it("defaults to 10 when env is missing", async () => {
    const { getCurriculumImportDailyLimit } = await import("@/lib/actions/curriculum-import");
    expect(getCurriculumImportDailyLimit()).toBe(10);
  });

  it("uses configured limit when set", async () => {
    process.env.CURRICULUM_IMPORT_DAILY_LIMIT = "25";
    const { getCurriculumImportDailyLimit } = await import("@/lib/actions/curriculum-import");
    expect(getCurriculumImportDailyLimit()).toBe(25);
  });

  it("returns 0 when set to 0 (disable limit)", async () => {
    process.env.CURRICULUM_IMPORT_DAILY_LIMIT = "0";
    const { getCurriculumImportDailyLimit } = await import("@/lib/actions/curriculum-import");
    expect(getCurriculumImportDailyLimit()).toBe(0);
  });

  it("falls back to 10 for invalid env values", async () => {
    process.env.CURRICULUM_IMPORT_DAILY_LIMIT = "not-a-number";
    const { getCurriculumImportDailyLimit } = await import("@/lib/actions/curriculum-import");
    expect(getCurriculumImportDailyLimit()).toBe(10);
  });

  it("falls back to 10 for negative numbers", async () => {
    process.env.CURRICULUM_IMPORT_DAILY_LIMIT = "-5";
    const { getCurriculumImportDailyLimit } = await import("@/lib/actions/curriculum-import");
    expect(getCurriculumImportDailyLimit()).toBe(10);
  });
});
