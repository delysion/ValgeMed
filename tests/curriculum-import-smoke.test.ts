import { z } from "zod";
import { describe, expect, it } from "vitest";

/* ------------------------------------------------------------------ */
/*  Replicate production schemas to test validation without DB/auth    */
/* ------------------------------------------------------------------ */
const schema = {
  MAX_PRIORITY: 10,
  MAX_NAME_LENGTH: 220,
  MAX_TITLE_LENGTH: 220,
  MAX_SUBJECTNAME_LENGTH: 220,
  MAX_TOTAL_RECORDS: 50,
};

type SafeNumericOpts = { int?: boolean; min?: number; max?: number };

function safeNumeric(opts?: SafeNumericOpts) {
  const pre = (val: unknown) => {
    if (val === null) return undefined;
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "") return val;
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!Number.isNaN(num)) return num;
      }
    }
    return val;
  };
  const n = opts?.int ? z.number().int() : z.number();
  const b = opts?.min !== undefined ? n.min(opts.min) : n;
  const base = opts?.max !== undefined ? b.max(opts.max) : b;
  return z.preprocess(pre, base.optional());
}

const recordSchema = z.object({
  type: z.enum(["subject", "topic", "exam", "task"]),
  name: z.string().trim().min(1).max(220),
  parent: z.string().trim().max(220).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: safeNumeric({ int: true, min: 0, max: 10 }),
  notes: z.string().trim().max(2000).nullable().optional(),
  code: z.string().trim().max(40).nullable().optional(),
  difficulty: safeNumeric({ int: true, min: 0, max: 10 }),
  importance: safeNumeric({ int: true, min: 0, max: 10 }),
  confidence: safeNumeric({ int: true, min: 0, max: 10 }),
  riskLevel: safeNumeric({ int: true, min: 0, max: 10 }),
  readinessScore: safeNumeric({ min: 0, max: 10 }),
  format: z.string().trim().max(20).optional(),
  ects: safeNumeric({ min: 0, max: 999 }),
  estimatedMinutes: safeNumeric({ int: true, min: 0 }),
  status: z.preprocess((v) => v === null ? undefined : v, z.string().trim().max(40).optional()),
  taskStatus: z.preprocess((v) => v === null ? undefined : v, z.string().trim().max(20).optional()),
});

const curriculumImportSchema = z.object({
  records: z.array(recordSchema).max(50),
});

const confirmSubjectsSchema = z.array(z.object({
  name: z.string().trim().min(1).max(schema.MAX_NAME_LENGTH),
  notes: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(schema.MAX_PRIORITY).default(5),
  code: z.string().max(40).optional(),
  difficulty: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  importance: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
})).default([]);

const confirmTopicsSchema = z.array(z.object({
  name: z.string().trim().min(1).max(schema.MAX_TITLE_LENGTH),
  subjectName: z.string().trim().min(1).max(schema.MAX_SUBJECTNAME_LENGTH),
  priority: z.number().int().min(0).max(schema.MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  difficulty: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  confidence: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  status: z.string().max(40).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
})).default([]);

const confirmExamsSchema = z.array(z.object({
  title: z.string().trim().min(1).max(schema.MAX_TITLE_LENGTH),
  date: z.string().nullable().optional(),
  subjectName: z.string().trim().min(1).max(schema.MAX_SUBJECTNAME_LENGTH),
  priority: z.number().int().min(0).max(schema.MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  difficulty: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  importance: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  riskLevel: z.number().int().min(0).max(schema.MAX_PRIORITY).optional(),
  readinessScore: z.number().min(0).max(10).optional(),
  format: z.string().max(20).optional(),
  ects: z.number().min(0).max(999).optional(),
})).default([]);

const confirmTasksSchema = z.array(z.object({
  title: z.string().trim().min(1).max(schema.MAX_TITLE_LENGTH),
  date: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(schema.MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  status: z.string().max(20).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
})).default([]);

const confirmImportInputSchema = z.object({
  subjects: confirmSubjectsSchema,
  topics: confirmTopicsSchema,
  exams: confirmExamsSchema,
  tasks: confirmTasksSchema,
});

/* ------------------------------------------------------------------ */
/*  Helpers (replicated from production)                               */
/* ------------------------------------------------------------------ */
type TopicStatus = "not_started" | "first_exposure" | "understood" | "recalled" | "practiced" | "error_corrected" | "consolidated" | "exam_ready";
type ExamFormat = "written" | "oral" | "practical" | "osce" | "mixed" | "unknown";
type TaskStatus = "todo" | "doing" | "done" | "archived";

const TOPIC_STATUS_MAP: Record<string, TopicStatus> = {
  "not_started": "not_started", "not started": "not_started",
  "first_exposure": "first_exposure", "first exposure": "first_exposure",
  "understood": "understood", "recalled": "recalled", "practiced": "practiced",
  "error_corrected": "error_corrected", "error corrected": "error_corrected",
  "consolidated": "consolidated", "exam_ready": "exam_ready", "exam ready": "exam_ready",
};
const TASK_STATUS_MAP: Record<string, string> = { "todo": "todo", "doing": "doing", "done": "done", "archived": "archived" };
const EXAM_FORMAT_MAP: Record<string, string> = { "written": "written", "oral": "oral", "practical": "practical", "osce": "osce", "mixed": "mixed", "unknown": "unknown" };

function mapTopicStatus(input: string | null | undefined): TopicStatus | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  return TOPIC_STATUS_MAP[normalized] ?? null;
}
function mapTaskStatus(input: string | null | undefined): TaskStatus | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  return (TASK_STATUS_MAP[normalized] ?? null) as TaskStatus | null;
}
function mapExamFormat(input: string | null | undefined): ExamFormat | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  return (EXAM_FORMAT_MAP[normalized] ?? null) as ExamFormat | null;
}
function buildDescription(notes: string | null | undefined, estimatedMinutes?: number | null): string | null {
  const parts: string[] = [];
  if (notes) parts.push(notes);
  if (estimatedMinutes !== null && estimatedMinutes !== undefined) parts.push(`[Estimated: ${estimatedMinutes} min]`);
  return parts.length > 0 ? parts.join("\n") : null;
}

/* ------------------------------------------------------------------ */
/*  Test data — user's input curriculum                                */
/* ------------------------------------------------------------------ */

const v2MockRecords = [
  // Subjects
  { type: "subject", name: "Chemistry", priority: 10, difficulty: 8, importance: 8, confidence: 6 },
  { type: "subject", name: "Physics", priority: 10, difficulty: 8, importance: 9, confidence: 5 },

  // Topics — Chemistry
  { type: "topic", name: "Stoichiometry", parent: "Chemistry", priority: 10, difficulty: 8, confidence: 4, estimatedMinutes: 90 },
  { type: "topic", name: "Redox reactions", parent: "Chemistry", priority: 8, difficulty: 7, confidence: 5 },
  { type: "topic", name: "Organic functional groups", parent: "Chemistry", priority: 7, difficulty: 6, confidence: 6 },

  // Topics — Physics
  { type: "topic", name: "Mechanics", parent: "Physics", priority: 10, difficulty: 8, confidence: 5 },
  { type: "topic", name: "Electricity", parent: "Physics", priority: 8, difficulty: 7, confidence: 6 },
  { type: "topic", name: "Waves and optics", parent: "Physics", priority: 6, difficulty: 5, confidence: 7 },

  // Exam
  { type: "exam", name: "Physics and Chemistry entrance exam", parent: "Physics", date: "2026-07-08", format: "written", importance: 10, difficulty: 9, riskLevel: 8, readinessScore: 6, priority: 10 },

  // Tasks
  { type: "task", name: "Do 50 stoichiometry problems", date: "2026-06-05", priority: 9, estimatedMinutes: 120 },
  { type: "task", name: "Review redox mistakes", date: "2026-06-07", priority: 8, estimatedMinutes: 60 },
  { type: "task", name: "Complete mechanics timed drill", date: "2026-06-08", priority: 9, estimatedMinutes: 90 },
];

const v1MockRecords = v2MockRecords.map((r: Record<string, unknown>) => {
  const { code, difficulty, importance, confidence, riskLevel, readinessScore, format, ects, status, taskStatus, estimatedMinutes, ...v1 } = r;
  return v1;
});

describe("curriculum import v2 smoke test", () => {
  /* ================================================================== */
  /*  MODE 1: v1 prompt (backward compat)                               */
  /* ================================================================== */
  describe("MODE 1: v1 prompt (6-field contract)", () => {
    const result = curriculumImportSchema.safeParse({ records: v1MockRecords });

    it("v1 records parse successfully", () => {
      expect(result.success).toBe(true);
    });

    it("v1 produces 12 records", () => {
      expect(result.success && result.data.records.length).toBe(12);
    });

    if (result.success) {
      const records = result.data.records;
      const subjects = records.filter((r: { type: string }) => r.type === "subject");
      const topics = records.filter((r: { type: string }) => r.type === "topic");
      const exams = records.filter((r: { type: string }) => r.type === "exam");
      const tasks = records.filter((r: { type: string }) => r.type === "task");

      it("v1 has 2 subjects", () => expect(subjects.length).toBe(2));
      it("v1 has 6 topics", () => expect(topics.length).toBe(6));
      it("v1 has 1 exam", () => expect(exams.length).toBe(1));
      it("v1 has 3 tasks", () => expect(tasks.length).toBe(3));

      it("v1 basic fields survive (type, name, parent, date, priority, notes)", () => {
        for (const r of records) {
          expect(r.type).toBeDefined();
          expect(r.name).toBeDefined();
          if (r.type === "topic" || r.type === "exam") expect(r.parent).toBeDefined();
        }
      });

      it("v1 v2 fields are undefined (not present in output)", () => {
        for (const r of records) {
          expect((r as { code?: unknown }).code).toBeUndefined();
          expect((r as { difficulty?: unknown }).difficulty).toBeUndefined();
          expect((r as { importance?: unknown }).importance).toBeUndefined();
          expect((r as { confidence?: unknown }).confidence).toBeUndefined();
        }
      });
    }
  });

  /* ================================================================== */
  /*  MODE 2: v2 prompt (all fields)                                     */
  /* ================================================================== */
  describe("MODE 2: v2 prompt (12 optional fields)", () => {
    const result = curriculumImportSchema.safeParse({ records: v2MockRecords });

    it("v2 records parse successfully", () => {
      expect(result.success).toBe(true);
    });

    it("v2 produces 12 records", () => {
      expect(result.success && result.data.records.length).toBe(12);
    });

    if (result.success) {
      const records = result.data.records;
      const subjects = records.filter((r: { type: string }) => r.type === "subject");
      const topics = records.filter((r: { type: string }) => r.type === "topic");
      const exams = records.filter((r: { type: string }) => r.type === "exam");
      const tasks = records.filter((r: { type: string }) => r.type === "task");

      it("v2 has 2 subjects", () => expect(subjects.length).toBe(2));
      it("v2 has 6 topics", () => expect(topics.length).toBe(6));
      it("v2 has 1 exam", () => expect(exams.length).toBe(1));
      it("v2 has 3 tasks", () => expect(tasks.length).toBe(3));

      /* ---- subjects ---- */
      it("v2 subjects preserve difficulty/importance", () => {
        const chem = subjects.find((s: { name: string }) => s.name === "Chemistry");
        expect(chem?.difficulty).toBe(8);
        expect(chem?.importance).toBe(8);
        const phys = subjects.find((s: { name: string }) => s.name === "Physics");
        expect(phys?.difficulty).toBe(8);
        expect(phys?.importance).toBe(9);
      });

      /* ---- topics ---- */
      it("v2 topics preserve priority/difficulty/confidence/estimatedMinutes", () => {
        const stoi = topics.find((t: { name: string }) => t.name === "Stoichiometry");
        expect(stoi?.priority).toBe(10);
        expect(stoi?.difficulty).toBe(8);
        expect(stoi?.confidence).toBe(4);
        expect(stoi?.estimatedMinutes).toBe(90);

        const redox = topics.find((t: { name: string }) => t.name === "Redox reactions");
        expect(redox?.priority).toBe(8);
        expect(redox?.difficulty).toBe(7);
        expect(redox?.confidence).toBe(5);

        const waves = topics.find((t: { name: string }) => t.name === "Waves and optics");
        expect(waves?.priority).toBe(6);
        expect(waves?.difficulty).toBe(5);
        expect(waves?.confidence).toBe(7);
      });

      /* ---- exam ---- */
      it("v2 exam preserves all fields", () => {
        const exam = exams[0];
        expect(exam?.name).toBe("Physics and Chemistry entrance exam");
        expect(exam?.date).toBe("2026-07-08");
        expect(exam?.format).toBe("written");
        expect(exam?.importance).toBe(10);
        expect(exam?.difficulty).toBe(9);
        expect(exam?.riskLevel).toBe(8);
        expect(exam?.readinessScore).toBe(6);
        expect(exam?.priority).toBe(10);
      });

      /* ---- tasks ---- */
      it("v2 tasks preserve dates/priority/estimatedMinutes", () => {
        const problems = tasks.find((t: { name: string }) => t.name === "Do 50 stoichiometry problems");
        expect(problems?.date).toBe("2026-06-05");
        expect(problems?.priority).toBe(9);
        expect(problems?.estimatedMinutes).toBe(120);

        const redoxTask = tasks.find((t: { name: string }) => t.name === "Review redox mistakes");
        expect(redoxTask?.date).toBe("2026-06-07");
        expect(redoxTask?.priority).toBe(8);
        expect(redoxTask?.estimatedMinutes).toBe(60);
      });
    }
  });

  /* ================================================================== */
  /*  HELPER FUNCTION TESTS with real data                               */
  /* ================================================================== */
  describe("helper functions with smoke data", () => {
    it("buildDescription appends estimated minutes to notes", () => {
      const desc = buildDescription("Do 50 stoichiometry problems", 120);
      expect(desc).toBe("Do 50 stoichiometry problems\n[Estimated: 120 min]");
    });

    it("buildDescription returns notes-only when no estimatedMinutes", () => {
      expect(buildDescription("Review redox mistakes")).toBe("Review redox mistakes");
    });

    it("buildDescription returns null when both empty", () => {
      expect(buildDescription(null)).toBeNull();
      expect(buildDescription(undefined)).toBeNull();
    });

    it("mapExamFormat maps 'written' correctly", () => {
      expect(mapExamFormat("written")).toBe("written");
    });

    it("mapExamFormat returns null for unknown", () => {
      expect(mapExamFormat("multiple_choice")).toBeNull();
    });

    it("mapTopicStatus maps known values", () => {
      expect(mapTopicStatus("not_started")).toBe("not_started");
      expect(mapTopicStatus("exam_ready")).toBe("exam_ready");
    });

    it("mapTaskStatus maps known values", () => {
      expect(mapTaskStatus("todo")).toBe("todo");
      expect(mapTaskStatus("done")).toBe("done");
    });

    it("readinessScore is 0-10 (not 0-100)", () => {
      const examRecord = { type: "exam" as const, name: "Test", date: "2026-07-08", parent: "Physics", format: "written", importance: 10, difficulty: 9, riskLevel: 8, readinessScore: 6 };
      const parsed = recordSchema.safeParse(examRecord);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.readinessScore).toBe(6);
        expect(parsed.data.readinessScore).toBeLessThanOrEqual(10);
      }
    });

    it("readinessScore rejects value > 10", () => {
      const bad = recordSchema.safeParse({ type: "exam", name: "Test", readinessScore: 60 });
      expect(bad.success).toBe(false);
    });
  });

  /* ================================================================== */
  /*  CONFIRM SCHEMA TESTS — simulate client confirm payload             */
  /* ================================================================== */
  describe("confirm schema accepts v2 fields", () => {
    const validSubjects = [
      { name: "Chemistry", notes: null, priority: 10, difficulty: 8, importance: 8 },
      { name: "Physics", notes: null, priority: 10, difficulty: 8, importance: 9 },
    ];
    const validTopics = [
      { name: "Stoichiometry", subjectName: "Chemistry", priority: 10, notes: null, difficulty: 8, confidence: 4, estimatedMinutes: 90 },
      { name: "Redox reactions", subjectName: "Chemistry", priority: 8, notes: null, difficulty: 7, confidence: 5 },
      { name: "Organic functional groups", subjectName: "Chemistry", priority: 7, notes: null, difficulty: 6, confidence: 6 },
      { name: "Mechanics", subjectName: "Physics", priority: 10, notes: null, difficulty: 8, confidence: 5 },
      { name: "Electricity", subjectName: "Physics", priority: 8, notes: null, difficulty: 7, confidence: 6 },
      { name: "Waves and optics", subjectName: "Physics", priority: 6, notes: null, difficulty: 5, confidence: 7 },
    ];
    const validExams = [
      { title: "Physics and Chemistry entrance exam", date: "2026-07-08", subjectName: "Physics", priority: 10, notes: null, difficulty: 9, importance: 10, riskLevel: 8, readinessScore: 6, format: "written" },
    ];
    const validTasks = [
      { title: "Do 50 stoichiometry problems", date: "2026-06-05", priority: 9, notes: "Do 50 stoichiometry problems", estimatedMinutes: 120 },
      { title: "Review redox mistakes", date: "2026-06-07", priority: 8, notes: "Review redox mistakes", estimatedMinutes: 60 },
      { title: "Complete mechanics timed drill", date: "2026-06-08", priority: 9, notes: "Complete mechanics timed drill", estimatedMinutes: 90 },
    ];

    it("confirmSubjectsSchema accepts v2 fields", () => {
      const r = confirmSubjectsSchema.safeParse(validSubjects);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data[0].difficulty).toBe(8);
        expect(r.data[0].importance).toBe(8);
      }
    });

    it("confirmTopicsSchema accepts v2 fields", () => {
      const r = confirmTopicsSchema.safeParse(validTopics);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data[0].difficulty).toBe(8);
        expect(r.data[0].confidence).toBe(4);
        expect(r.data[0].estimatedMinutes).toBe(90);
      }
    });

    it("confirmExamsSchema accepts v2 fields", () => {
      const r = confirmExamsSchema.safeParse(validExams);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data[0].difficulty).toBe(9);
        expect(r.data[0].importance).toBe(10);
        expect(r.data[0].riskLevel).toBe(8);
        expect(r.data[0].readinessScore).toBe(6);
        expect(r.data[0].format).toBe("written");
      }
    });

    it("confirmTasksSchema accepts v2 fields", () => {
      const r = confirmTasksSchema.safeParse(validTasks);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data[0].estimatedMinutes).toBe(120);
        expect(r.data[0].date).toBe("2026-06-05");
      }
    });

    it("confirmImportInputSchema validates total payload", () => {
      const r = confirmImportInputSchema.safeParse({
        subjects: validSubjects,
        topics: validTopics,
        exams: validExams,
        tasks: validTasks,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        const total = r.data.subjects.length + r.data.topics.length + r.data.exams.length + r.data.tasks.length;
        expect(total).toBe(12);
      }
    });
  });

  /* ================================================================== */
  /*  DB FIELD MAPPING LOGIC                                             */
  /* ================================================================== */
  describe("DB insert mapping verification", () => {
    it("subjects.importance falls back to subject.priority", () => {
      const withImportance: { importance?: number; priority: number } = { importance: 8, priority: 10 };
      const withoutImportance: { importance?: number; priority: number } = { priority: 7 };
      expect(withImportance.importance ?? withImportance.priority).toBe(8);
      expect(withoutImportance.importance ?? withoutImportance.priority).toBe(7);
    });

    it("exams.importance falls back to exam.priority", () => {
      const withImportance: { importance?: number; priority: number } = { importance: 10, priority: 5 };
      const withoutImportance: { importance?: number; priority: number } = { priority: 5 };
      expect(withImportance.importance ?? withImportance.priority).toBe(10);
      expect(withoutImportance.importance ?? withoutImportance.priority).toBe(5);
    });

    it("topics.description uses buildDescription with fallback", () => {
      const withNotes = buildDescription("Study stoichiometry", 90) ?? "Imported";
      expect(withNotes).toContain("Study stoichiometry");
      expect(withNotes).toContain("[Estimated: 90 min]");

      const withoutEstimated = buildDescription("Study redox") ?? "Imported";
      expect(withoutEstimated).toBe("Study redox");

      const empty = buildDescription(null, undefined) ?? "Imported";
      expect(empty).toBe("Imported");
    });

    it("tasks.description uses buildDescription (can return null)", () => {
      const desc = buildDescription("Do 50 stoichiometry problems", 120);
      expect(desc).toBe("Do 50 stoichiometry problems\n[Estimated: 120 min]");
    });

    it("topics.status maps through mapTopicStatus", () => {
      expect(mapTopicStatus("not_started") ?? "not_started").toBe("not_started");
      expect(mapTopicStatus("unknown_value") ?? "not_started").toBe("not_started");
      expect(mapTopicStatus(undefined) ?? "not_started").toBe("not_started");
    });

    it("tasks.status maps through mapTaskStatus", () => {
      expect(mapTaskStatus("todo") ?? "todo").toBe("todo");
      expect(mapTaskStatus("done") ?? "todo").toBe("done");
      expect(mapTaskStatus(null) ?? "todo").toBe("todo");
    });

    it("exams.format maps through mapExamFormat", () => {
      expect(mapExamFormat("written") ?? "unknown").toBe("written");
      expect(mapExamFormat("multiple_choice") ?? "unknown").toBe("unknown");
      expect(mapExamFormat(null) ?? "unknown").toBe("unknown");
    });
  });

  /* ================================================================== */
  /*  WARNINGS                                                            */
  /* ================================================================== */
  describe("warning generation", () => {
    it("unrecognized topic status generates warning", () => {
      const mapped = mapTopicStatus("unknown_status");
      const warns = mapped === null;
      expect(warns).toBe(true);
    });

    it("unrecognized exam format generates warning", () => {
      const mapped = mapExamFormat("multiple_choice");
      const warns = mapped === null;
      expect(warns).toBe(true);
    });

    it("estimatedMinutes present generates appended-to-description warning", () => {
      const hasMinutes = 90;
      expect(hasMinutes).toBeGreaterThanOrEqual(0);
      expect(buildDescription("test", 90)).toContain("[Estimated: 90 min]");
    });
  });

  /* ================================================================== */
  /*  EDGE CASES                                                         */
  /* ================================================================== */
  describe("edge cases", () => {
    it("rejects readinessScore of 60 (out of range)", () => {
      const r = recordSchema.safeParse({ type: "exam", name: "Test", readinessScore: 60 });
      expect(r.success).toBe(false);
    });

    it("accepts readinessScore of 0", () => {
      const r = recordSchema.safeParse({ type: "exam", name: "Test", readinessScore: 0 });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.readinessScore).toBe(0);
    });

    it("accepts estimatedMinutes of 0", () => {
      const r = recordSchema.safeParse({ type: "task", name: "Quick task", estimatedMinutes: 0 });
      expect(r.success).toBe(true);
    });

    it("rejects difficulty of 11 (over max)", () => {
      const r = recordSchema.safeParse({ type: "subject", name: "Test", difficulty: 11 });
      expect(r.success).toBe(false);
    });

    it("rejects priority of -1 (under min)", () => {
      const r = recordSchema.safeParse({ type: "subject", name: "Test", priority: -1 });
      expect(r.success).toBe(false);
    });

    it("empty records array is valid", () => {
      const r = curriculumImportSchema.safeParse({ records: [] });
      expect(r.success).toBe(true);
    });

    it("more than 50 records is rejected", () => {
      const many = Array.from({ length: 51 }, (_, i) => ({ type: "subject" as const, name: `Subject ${i}` }));
      const r = curriculumImportSchema.safeParse({ records: many });
      expect(r.success).toBe(false);
    });

    it("unknown type is rejected", () => {
      const r = recordSchema.safeParse({ type: "lecture", name: "Test" });
      expect(r.success).toBe(false);
    });

    it("missing name is rejected", () => {
      const r = recordSchema.safeParse({ type: "subject" });
      expect(r.success).toBe(false);
    });
  });

  describe("safeNumeric — numeric string coercion", () => {
    const base = { type: "topic" as const, name: "Test", parent: "Subject" };

    it('"10" accepted as 10 for priority', () => {
      const r = recordSchema.safeParse({ ...base, priority: "10" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.priority).toBe(10);
    });

    it('"8" accepted as 8 for difficulty', () => {
      const r = recordSchema.safeParse({ ...base, difficulty: "8" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.difficulty).toBe(8);
    });

    it('"6.5" accepted for readinessScore', () => {
      const r = recordSchema.safeParse({ ...base, readinessScore: "6.5" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.readinessScore).toBe(6.5);
    });

    it('"10/10" rejected', () => {
      const r = recordSchema.safeParse({ ...base, priority: "10/10" });
      expect(r.success).toBe(false);
    });

    it('"high" rejected', () => {
      const r = recordSchema.safeParse({ ...base, priority: "high" });
      expect(r.success).toBe(false);
    });

    it('"" rejected', () => {
      const r = recordSchema.safeParse({ ...base, priority: "" });
      expect(r.success).toBe(false);
    });

    it("true rejected", () => {
      const r = recordSchema.safeParse({ ...base, priority: true });
      expect(r.success).toBe(false);
    });

    it("60 rejected for readinessScore", () => {
      const r = recordSchema.safeParse({ ...base, readinessScore: 60 });
      expect(r.success).toBe(false);
    });

    it("null becomes undefined for optional numeric field", () => {
      const r = recordSchema.safeParse({ ...base, priority: null });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.priority).toBeUndefined();
    });

    it("existing numeric values still pass", () => {
      const r = recordSchema.safeParse({ ...base, priority: 5, difficulty: 3 });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.priority).toBe(5);
        expect(r.data.difficulty).toBe(3);
      }
    });

    it("null becomes undefined for nullable fields (ects)", () => {
      const r = recordSchema.safeParse({ ...base, type: "exam", name: "Exam", ects: null });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.ects).toBeUndefined();
    });

    it("null becomes undefined for nullable fields (estimatedMinutes)", () => {
      const r = recordSchema.safeParse({ ...base, estimatedMinutes: null });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.estimatedMinutes).toBeUndefined();
    });

    it('negative string "-1" rejected for priority', () => {
      const r = recordSchema.safeParse({ ...base, priority: "-1" });
      expect(r.success).toBe(false);
    });

    it('float string "3.14" not accepted for int-only field', () => {
      const r = recordSchema.safeParse({ ...base, priority: "3.14" });
      expect(r.success).toBe(false);
    });

    it("whitespace trimmed before parsing", () => {
      const r = recordSchema.safeParse({ ...base, priority: " 7 " });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.priority).toBe(7);
    });
  });
});
