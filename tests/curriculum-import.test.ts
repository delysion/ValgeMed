import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("curriculum import field pipeline", () => {
  const actions = source("lib", "actions", "curriculum-import.ts");
  const component = source("components", "curriculum-importer.tsx");

  /* ------------------------------------------------------------------ */
  /*  v1 backward compatibility                                          */
  /* ------------------------------------------------------------------ */
  it("v1 6-field contract: type, name, parent, date, priority, notes", () => {
    const contractFields = ["type", "name", "parent", "date", "priority", "notes"];
    for (const field of contractFields) {
      expect(actions).toMatch(
        new RegExp(`${field}:\\s*z\\.`),
      );
    }
  });

  it("does not introduce z.passthrough", () => {
    expect(actions).not.toContain("z.passthrough");
  });

  it("CurriculumImportResult shape is unchanged", () => {
    expect(actions).toMatch(/subjects:\s*number;/);
    expect(actions).toMatch(/topics:\s*number;/);
    expect(actions).toMatch(/exams:\s*number;/);
    expect(actions).toMatch(/tasks:\s*number;/);
  });

  it("record max limit is unchanged", () => {
    expect(actions).toContain(".max(50)");
  });

  /* ------------------------------------------------------------------ */
  /*  v2 subjects                                                        */
  /* ------------------------------------------------------------------ */
  it("accepts subject code in recordSchema", () => {
    expect(actions).toContain("code: z.string().trim().max(40).nullable().optional()");
  });

  it("accepts subject difficulty in recordSchema", () => {
    expect(actions).toContain("difficulty: safeNumeric({ int: true, min: 0, max: 10 })");
  });

  it("accepts subject importance in recordSchema", () => {
    expect(actions).toContain("importance: safeNumeric({ int: true, min: 0, max: 10 })");
  });

  it("captures subject code/difficulty/importance in maps", () => {
    expect(actions).toContain("subjectCode.set(rec.name, rec.code)");
    expect(actions).toContain("subjectDifficulty.set(rec.name, rec.difficulty)");
    expect(actions).toContain("subjectImportance.set(rec.name, rec.importance)");
  });

  it("includes v2 fields in CurriculumImportPreview.subjects", () => {
    const previewLine = actions
      .split("\n")
      .find((l) => l.includes("subjects:") && l.includes("name") && l.includes("notes"));
    expect(previewLine).toContain("code?");
    expect(previewLine).toContain("difficulty?");
    expect(previewLine).toContain("importance?");
  });

  it("maps subject code/difficulty/importance to preview.subjects push", () => {
    expect(actions).toContain("code: subjectCode.get(name),");
    expect(actions).toContain("difficulty: subjectDifficulty.get(name),");
    expect(actions).toContain("importance: subjectImportance.get(name),");
  });

  it("accepts subject v2 fields in confirmSubjectsSchema", () => {
    expect(actions).toContain("code: z.string().max(40).optional()");
    expect(actions).toContain("difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    // confirmSubjectsSchema has importance
    const linesWithImportance = actions.match(/importance: z\.number\(\)\.int\(\)\.min\(0\)\.max\(MAX_PRIORITY\)\.optional\(\)/g);
    expect(linesWithImportance).toBeTruthy();
    expect(linesWithImportance!.length).toBeGreaterThanOrEqual(2);
  });

  it("maps subject v2 fields to subjects DB insert", () => {
    expect(actions).toContain("code: subject.code || null,");
    expect(actions).toContain("difficulty: subject.difficulty ?? 0,");
    expect(actions).toContain("importance: subject.importance ?? subject.priority,");
  });

  it("sends subject v2 fields from client selection state", () => {
    expect(component).toContain("difficulty: s.difficulty");
    expect(component).toContain("importance: s.importance");
  });

  /* ------------------------------------------------------------------ */
  /*  v2 topics                                                          */
  /* ------------------------------------------------------------------ */
  it("includes v2 fields in CurriculumImportPreview.topics", () => {
    const previewLine = actions
      .split("\n")
      .find((l) => l.includes("topics:") && l.includes("name") && l.includes("subjectName"));
    expect(previewLine).toContain("difficulty?");
    expect(previewLine).toContain("confidence?");
    expect(previewLine).toContain("status?");
    expect(previewLine).toContain("estimatedMinutes?");
  });

  it("captures topic v2 fields from AI records", () => {
    expect(actions).toContain("difficulty: rec.difficulty,");
    expect(actions).toContain("confidence: rec.confidence,");
    expect(actions).toContain("status: rec.status,");
    expect(actions).toContain("estimatedMinutes: rec.estimatedMinutes,");
  });

  it("accepts topic v2 fields in confirmTopicsSchema", () => {
    expect(actions).toContain("difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    expect(actions).toContain("confidence: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    expect(actions).toContain("status: z.string().max(40).optional()");
    expect(actions).toContain("estimatedMinutes: z.number().int().min(0).optional()");
  });

  it("maps topic v2 fields to topics DB insert", () => {
    expect(actions).toContain("difficulty: topic.difficulty ?? 0,");
    expect(actions).toContain("confidence: topic.confidence ?? 0,");
    expect(actions).toContain("status: mapTopicStatus(topic.status) ?? \"not_started\"");
  });

  it("sends topic v2 fields from client selection state", () => {
    expect(component).toContain("difficulty: t.difficulty");
    expect(component).toContain("confidence: t.confidence");
    expect(component).toContain("status: t.status");
    expect(component).toContain("estimatedMinutes: t.estimatedMinutes");
  });

  /* ------------------------------------------------------------------ */
  /*  v2 exams                                                           */
  /* ------------------------------------------------------------------ */
  it("includes v2 fields in CurriculumImportPreview.exams", () => {
    const previewLine = actions
      .split("\n")
      .find((l) => l.includes("exams:") && l.includes("title") && l.includes("date"));
    expect(previewLine).toContain("difficulty?");
    expect(previewLine).toContain("importance?");
    expect(previewLine).toContain("riskLevel?");
    expect(previewLine).toContain("readinessScore?");
    expect(previewLine).toContain("format?");
    expect(previewLine).toContain("ects?");
  });

  it("captures exam v2 fields from AI records", () => {
    expect(actions).toContain("difficulty: rec.difficulty,");
    expect(actions).toContain("importance: rec.importance,");
    expect(actions).toContain("riskLevel: rec.riskLevel,");
    expect(actions).toContain("readinessScore: rec.readinessScore,");
    expect(actions).toContain("format: rec.format,");
    expect(actions).toContain("ects: rec.ects,");
  });

  it("accepts exam v2 fields in confirmExamsSchema", () => {
    expect(actions).toContain("difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    expect(actions).toContain("importance: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    expect(actions).toContain("riskLevel: z.number().int().min(0).max(MAX_PRIORITY).optional()");
    expect(actions).toContain("readinessScore: z.number().min(0).max(10).optional()");
    expect(actions).toContain("format: z.string().max(20).optional()");
    expect(actions).toContain("ects: z.number().min(0).max(999).optional()");
  });

  it("maps exam v2 fields to exams DB insert", () => {
    expect(actions).toContain("difficulty: exam.difficulty ?? 0,");
    expect(actions).toContain("importance: exam.importance ?? exam.priority,");
    expect(actions).toContain("riskLevel: exam.riskLevel ?? 0,");
    expect(actions).toContain("readinessScore: exam.readinessScore ?? 0,");
    expect(actions).toContain("format: mapExamFormat(exam.format) ?? \"unknown\"");
    expect(actions).toContain("ects: exam.ects ?? null,");
  });

  it("sends exam v2 fields from client selection state", () => {
    expect(component).toContain("difficulty: e.difficulty");
    expect(component).toContain("importance: e.importance");
    expect(component).toContain("riskLevel: e.riskLevel");
    expect(component).toContain("readinessScore: e.readinessScore");
    expect(component).toContain("format: e.format");
    expect(component).toContain("ects: e.ects");
  });

  /* ------------------------------------------------------------------ */
  /*  v2 tasks                                                           */
  /* ------------------------------------------------------------------ */
  it("includes v2 fields in CurriculumImportPreview.tasks", () => {
    const previewLine = actions
      .split("\n")
      .find((l) => l.includes("tasks:") && l.includes("title") && l.includes("date"));
    expect(previewLine).toContain("status?");
    expect(previewLine).toContain("estimatedMinutes?");
  });

  it("captures task v2 fields from AI records", () => {
    expect(actions).toContain("taskStatus: rec.taskStatus,");
    expect(actions).toContain("estimatedMinutes: rec.estimatedMinutes,");
  });

  it("accepts task v2 fields in confirmTasksSchema", () => {
    expect(actions).toContain("status: z.string().max(20).optional()");
    expect(actions).toContain("estimatedMinutes: z.number().int().min(0).optional()");
  });

  it("maps task v2 fields to tasks DB insert", () => {
    expect(actions).toContain("description: buildDescription(task.notes, task.estimatedMinutes),");
    expect(actions).toContain("status: mapTaskStatus(task.status) ?? \"todo\"");
  });

  it("sends task v2 fields from client selection state", () => {
    expect(component).toContain("status: t.status");
    expect(component).toContain("estimatedMinutes: t.estimatedMinutes");
  });

  /* ------------------------------------------------------------------ */
  /*  v2 helpers                                                         */
  /* ------------------------------------------------------------------ */
  it("defines TOPIC_STATUS_MAP", () => {
    expect(actions).toContain("exam_ready");
    expect(actions).toContain("not_started");
  });

  it("defines TASK_STATUS_MAP", () => {
    expect(actions).toContain("\"archived\": \"archived\"");
  });

  it("defines EXAM_FORMAT_MAP", () => {
    expect(actions).toContain("\"unknown\": \"unknown\"");
  });

  it("defines mapTopicStatus helper", () => {
    expect(actions).toContain("function mapTopicStatus");
    expect(actions).toContain("TOPIC_STATUS_MAP[normalized] ?? null");
  });

  it("defines mapTaskStatus helper", () => {
    expect(actions).toContain("function mapTaskStatus");
    expect(actions).toContain("TASK_STATUS_MAP[normalized] ?? null");
  });

  it("defines mapExamFormat helper", () => {
    expect(actions).toContain("function mapExamFormat");
    expect(actions).toContain("EXAM_FORMAT_MAP[normalized] ?? null");
  });

  it("defines buildDescription helper", () => {
    expect(actions).toContain("function buildDescription");
    expect(actions).toContain("[Estimated:");
    expect(actions).toContain("parts.length > 0 ? parts.join");
  });

  /* ------------------------------------------------------------------ */
  /*  v1 priority mappings (unchanged)                                   */
  /* ------------------------------------------------------------------ */
  it("captures exam priority from AI records in examList", () => {
    expect(actions).toContain("priority: rec.priority ?? 5,");
  });

  it("passes exam priority to preview.exams push", () => {
    expect(actions).toMatch(/priority:\s*exam\.priority/);
  });

  it("accepts exam priority in confirmExamsSchema", () => {
    expect(actions).toContain("priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),");
  });

  it("captures subject priority from AI records", () => {
    expect(actions).toContain("subjectPriority.set(rec.name, rec.priority ?? 5)");
  });

  it("accepts subject priority in confirmSubjectsSchema", () => {
    expect(actions).toContain("priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),");
  });

  it("maps task notes to tasks.description", () => {
    expect(actions).toContain("description: buildDescription(task.notes, task.estimatedMinutes),");
  });

  /* ------------------------------------------------------------------ */
  /*  warnings                                                           */
  /* ------------------------------------------------------------------ */
  it("generates warnings for unrecognized topic status", () => {
    expect(actions).toContain("Unrecognized topic status");
    expect(actions).toContain("defaulted to not_started");
  });

  it("generates warnings for unrecognized exam format", () => {
    expect(actions).toContain("Unrecognized exam format");
    expect(actions).toContain("set to unknown");
  });

  it("generates warnings for unrecognized task status", () => {
    expect(actions).toContain("Unrecognized task status");
    expect(actions).toContain("defaulted to todo");
  });

  it("generates warnings for estimatedMinutes appended to description", () => {
    expect(actions).toContain("Estimated minutes");
    expect(actions).toContain("appended to description");
  });

  it("includes warnings array in CurriculumImportPreview", () => {
    expect(actions).toContain("warnings: string[]");
  });

  it("initializes warnings in preview", () => {
    expect(actions).toContain("const warnings: string[] = []");
  });

  /* ------------------------------------------------------------------ */
  /*  readinessScore scale (0-10)                                        */
  /* ------------------------------------------------------------------ */
  it("readinessScore uses 0-10 scale", () => {
    expect(actions).toContain("readinessScore: safeNumeric({ min: 0, max: 10 })");
    expect(actions).toContain("readinessScore: exam.readinessScore ?? 0,");
  });

  /* ------------------------------------------------------------------ */
  /*  configurable daily import limit                                     */
  /* ------------------------------------------------------------------ */
  it("exports getCurriculumImportDailyLimit", () => {
    expect(actions).toContain("export async function getCurriculumImportDailyLimit");
  });

  it("reads CURRICULUM_IMPORT_DAILY_LIMIT env var", () => {
    expect(actions).toContain("process.env.CURRICULUM_IMPORT_DAILY_LIMIT");
  });

  it("defaults to 10 when env is missing", () => {
    expect(actions).toContain('if (raw === undefined) return 10');
  });

  it("returns 0 when env is 0 to disable limit", () => {
    expect(actions).toContain("if (limit === 0) return");
  });

  it("validates integer >= 0 for env value", () => {
    expect(actions).toContain("Number.isInteger(n) && n >= 0");
  });

  it("falls back to 10 for invalid env values", () => {
    expect(actions).toContain("return 10");
  });

  it("throws error with configured limit in message", () => {
    expect(actions).toContain("`Daily import limit reached (${limit}/day). Come back tomorrow.`");
  });

  it("shows localized error with configured limit", () => {
    expect(actions).toContain("`Päevane import limiit täis (${limit}/päev). Tule tagasi homme.`");
  });

  it("calls assertImportLimitAllowed in confirm action", () => {
    expect(actions).toContain("await assertImportLimitAllowed(userId, new Date(), locale)");
  });

  it("preserves catch handler for Daily import limit error", () => {
    expect(actions).toContain('error.message.includes("Daily import limit")');
  });
});
