"use server";

import { z } from "zod";

import { requireAuthUserId } from "@/lib/db/auth";
import { getDb } from "@/lib/db";
import { refresh } from "@/lib/utils/forms";
import {
  aiUsageEvents,
  exams,
  subjects,
  tasks,
  topics,
} from "@/lib/db/schema";
import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import {
  computeV2FieldPresence,
  computeWarningTypes,
  trackCurriculumImportParse,
} from "@/lib/analytics/curriculum-import-analytics";

type SafeNumericOpts = { int?: boolean; min?: number; max?: number };

let numericCoercionCount = 0;

async function trackAnalyticsSafely(label: string, promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    console.error("[curriculum-import analytics]", {
      label,
      error: error instanceof Error ? error.message : String(error),
    });

    if (process.env.NODE_ENV !== "production") {
      throw error;
    }
  }
}

export async function getAndResetNumericCoercionCount(): Promise<number> {
  const count = numericCoercionCount;
  numericCoercionCount = 0;
  return count;
}

function safeNumeric(opts?: SafeNumericOpts) {
  const pre = (val: unknown) => {
    if (val === null) return undefined;
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "") return val;
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!Number.isNaN(num)) {
          numericCoercionCount++;
          return num;
        }
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

export interface CurriculumImportPreview {
  subjects: Array<{ name: string; notes: string | null; priority: number; code?: string; difficulty?: number; importance?: number; isNew: boolean; existingId?: string; topics: string[] }>;
  topics: Array<{ name: string; subjectName: string; priority: number; notes: string | null; difficulty?: number; confidence?: number; status?: string; estimatedMinutes?: number; subjectId?: string; isNew: boolean }>;
  exams: Array<{ title: string; date: string | null; subjectName: string; priority: number; notes: string | null; difficulty?: number; importance?: number; riskLevel?: number; readinessScore?: number; format?: string; ects?: number; subjectId?: string; isNew: boolean }>;
  tasks: Array<{ title: string; date: string | null; priority: number; notes: string | null; status?: string; estimatedMinutes?: number; isNew: boolean }>;
  warnings: string[];
}

export interface CurriculumImportResult {
  success: boolean;
  message: string;
  imported?: {
    subjects: number;
    topics: number;
    exams: number;
    tasks: number;
  };
  error?: string;
}

async function findSubjectId(userId: string, name: string): Promise<string | null> {
  const db = getDb();
  const [found] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(and(eq(subjects.userId, userId), eq(subjects.name, name.trim())))
    .limit(1);
  return found?.id ?? null;
}

function parseDate(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

type TopicStatus = "not_started" | "first_exposure" | "understood" | "recalled" | "practiced" | "error_corrected" | "consolidated" | "exam_ready";
type ExamFormat = "written" | "oral" | "practical" | "osce" | "mixed" | "unknown";
type TaskStatus = "todo" | "doing" | "done" | "archived";

const TOPIC_STATUS_MAP: Record<string, TopicStatus> = {
  "not_started": "not_started",
  "not started": "not_started",
  "first_exposure": "first_exposure",
  "first exposure": "first_exposure",
  "understood": "understood",
  "recalled": "recalled",
  "practiced": "practiced",
  "error_corrected": "error_corrected",
  "error corrected": "error_corrected",
  "consolidated": "consolidated",
  "exam_ready": "exam_ready",
  "exam ready": "exam_ready",
};

const TASK_STATUS_MAP: Record<string, string> = {
  "todo": "todo",
  "doing": "doing",
  "done": "done",
  "archived": "archived",
};

const EXAM_FORMAT_MAP: Record<string, string> = {
  "written": "written",
  "oral": "oral",
  "practical": "practical",
  "osce": "osce",
  "mixed": "mixed",
  "unknown": "unknown",
};

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
  if (estimatedMinutes !== null && estimatedMinutes !== undefined) {
    parts.push(`[Estimated: ${estimatedMinutes} min]`);
  }
  return parts.length > 0 ? parts.join("\n") : null;
}

export async function parseCurriculumAction(
  rawText: string,
  locale: string = "en"
): Promise<{ success: boolean; preview?: CurriculumImportPreview; error?: string }> {
  let userId: string;
  try {
    userId = await requireAuthUserId();
  } catch {
    return { success: false, error: locale === "et" ? "Autentimise viga" : "Auth error" };
  }

  try {
    const stripped = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/`/g, "")
      .trim();

    let parsed: unknown;
    try {
      const match = stripped.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : stripped);
    } catch {
      const pm = process.env.CURRICULUM_IMPORT_V2_PROMPT === "true" ? "v2" : "v1";
      await trackAnalyticsSafely("parse_invalid_json", trackCurriculumImportParse(userId, { promptMode: pm, parseSuccess: false, error: "Invalid JSON response" }));
      await getAndResetNumericCoercionCount();
      return { success: false, error: locale === "et" ? "Vigane JSON vastus" : "Invalid JSON response" };
    }

    function normalizeDate(d: unknown): string | null {
      if (d == null || d === "") return null;
      if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      if (typeof d === "string") {
        const dt = new Date(d);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
      }
      return null;
    }

    function normalizeRecords(raw: unknown): unknown {
      let records: unknown[];
      if (Array.isArray(raw)) records = raw;
      else if (raw && typeof raw === "object" && "records" in raw && Array.isArray((raw as { records: unknown }).records)) {
        records = (raw as { records: unknown[] }).records;
      } else return raw;

      return { records: records.map((r) => {
        if (!r || typeof r !== "object") return r;
        const rec = r as Record<string, unknown>;
        return { ...rec, date: normalizeDate(rec.date) };
      })};
    }

    const validated = curriculumImportSchema.safeParse(normalizeRecords(parsed));
    if (!validated.success) {
      const pm = process.env.CURRICULUM_IMPORT_V2_PROMPT === "true" ? "v2" : "v1";
      await trackAnalyticsSafely("parse_invalid_structure", trackCurriculumImportParse(userId, { promptMode: pm, parseSuccess: false, error: "Invalid record structure" }));
      await getAndResetNumericCoercionCount();
      return { success: false, error: locale === "et" ? "Vigane kirje struktuur" : "Invalid record structure" };
    }

    const records = validated.data.records;

    const subjectNames = new Set<string>();
    const subjectNotes = new Map<string, string | null>();
    const subjectPriority = new Map<string, number>();
    const subjectCode = new Map<string, string>();
    const subjectDifficulty = new Map<string, number>();
    const subjectImportance = new Map<string, number>();
    const topicList: Array<{ name: string; subjectName: string; priority: number; notes: string | null; difficulty?: number; confidence?: number; status?: string; estimatedMinutes?: number }> = [];
    const examList: Array<{ title: string; date: string | null; subjectName: string; priority: number; notes: string | null; difficulty?: number; importance?: number; riskLevel?: number; readinessScore?: number; format?: string; ects?: number }> = [];
    const taskList: Array<{ title: string; date: string | null; priority: number; notes: string | null; taskStatus?: string; estimatedMinutes?: number }> = [];
    const warnings: string[] = [];

    for (const rec of records) {
      if (rec.type === "subject") {
        subjectNames.add(rec.name);
        if (!subjectNotes.has(rec.name)) {
          subjectNotes.set(rec.name, rec.notes ?? null);
        }
        if (!subjectPriority.has(rec.name)) {
          subjectPriority.set(rec.name, rec.priority ?? 5);
        }
        if (rec.code && !subjectCode.has(rec.name)) {
          subjectCode.set(rec.name, rec.code);
        }
        if (rec.difficulty !== undefined && !subjectDifficulty.has(rec.name)) {
          subjectDifficulty.set(rec.name, rec.difficulty);
        }
        if (rec.importance !== undefined && !subjectImportance.has(rec.name)) {
          subjectImportance.set(rec.name, rec.importance);
        }
      } else if (rec.type === "topic" && rec.parent) {
        topicList.push({
          name: rec.name,
          subjectName: rec.parent,
          priority: rec.priority ?? 5,
          notes: rec.notes ?? null,
          difficulty: rec.difficulty,
          confidence: rec.confidence,
          status: rec.status,
          estimatedMinutes: rec.estimatedMinutes,
        });
        subjectNames.add(rec.parent);
      } else if (rec.type === "exam") {
        examList.push({
          title: rec.name,
          date: parseDate(rec.date),
          subjectName: rec.parent || "General",
          priority: rec.priority ?? 5,
          notes: rec.notes ?? null,
          difficulty: rec.difficulty,
          importance: rec.importance,
          riskLevel: rec.riskLevel,
          readinessScore: rec.readinessScore,
          format: rec.format,
          ects: rec.ects,
        });
        subjectNames.add(rec.parent || "General");
      } else if (rec.type === "task") {
        taskList.push({
          title: rec.name,
          date: parseDate(rec.date),
          priority: rec.priority ?? 5,
          notes: rec.notes ?? null,
          taskStatus: rec.taskStatus,
          estimatedMinutes: rec.estimatedMinutes,
        });
      }
    }

    const preview: CurriculumImportPreview = {
      subjects: [],
      topics: [],
      exams: [],
      tasks: [],
      warnings,
    };

    for (const name of subjectNames) {
      const existingId = await findSubjectId(userId, name);
      const topicsForSubject = topicList
        .filter(t => t.subjectName === name)
        .map(t => t.name);

      preview.subjects.push({
        name,
        notes: subjectNotes.get(name) ?? null,
        priority: subjectPriority.get(name) ?? 5,
        code: subjectCode.get(name),
        difficulty: subjectDifficulty.get(name),
        importance: subjectImportance.get(name),
        isNew: !existingId,
        existingId: existingId || undefined,
        topics: topicsForSubject,
      });
    }

    for (const topic of topicList) {
      const mappedStatus = mapTopicStatus(topic.status);
      if (topic.status && !mappedStatus) {
        warnings.push(`Unrecognized topic status "${topic.status}" for "${topic.name}" — defaulted to not_started`);
      }
      if (topic.estimatedMinutes !== undefined) {
        warnings.push(`Estimated minutes (${topic.estimatedMinutes}) for topic "${topic.name}" appended to description`);
      }
      preview.topics.push({
        name: topic.name,
        subjectName: topic.subjectName,
        priority: topic.priority,
        notes: topic.notes,
        difficulty: topic.difficulty,
        confidence: topic.confidence,
        status: mappedStatus ?? undefined,
        estimatedMinutes: topic.estimatedMinutes,
        isNew: true,
      });
    }

    for (const exam of examList) {
      const mappedFormat = mapExamFormat(exam.format);
      if (exam.format && !mappedFormat) {
        warnings.push(`Unrecognized exam format "${exam.format}" for "${exam.title}" — set to unknown`);
      }
      preview.exams.push({
        title: exam.title,
        date: exam.date,
        subjectName: exam.subjectName,
        priority: exam.priority,
        notes: exam.notes,
        difficulty: exam.difficulty,
        importance: exam.importance,
        riskLevel: exam.riskLevel,
        readinessScore: exam.readinessScore,
        format: mappedFormat ?? undefined,
        ects: exam.ects,
        isNew: true,
      });
    }

    for (const task of taskList) {
      const mappedTaskStatus = mapTaskStatus(task.taskStatus);
      if (task.taskStatus && !mappedTaskStatus) {
        warnings.push(`Unrecognized task status "${task.taskStatus}" for "${task.title}" — defaulted to todo`);
      }
      if (task.estimatedMinutes !== undefined) {
        warnings.push(`Estimated minutes (${task.estimatedMinutes}) for task "${task.title}" appended to description`);
      }
      preview.tasks.push({
        title: task.title,
        date: task.date,
        priority: task.priority,
        notes: task.notes,
        status: mappedTaskStatus ?? undefined,
        estimatedMinutes: task.estimatedMinutes,
        isNew: true,
      });
    }

    const pmParse = process.env.CURRICULUM_IMPORT_V2_PROMPT === "true" ? "v2" : "v1";
    await trackAnalyticsSafely("parse_success", trackCurriculumImportParse(userId, {
      promptMode: pmParse,
      parseSuccess: true,
      recordCount: records.length,
      countByType: {
        subjects: preview.subjects.length,
        topics: preview.topics.length,
        exams: preview.exams.length,
        tasks: preview.tasks.length,
      },
      warningCount: warnings.length,
      warningsByType: computeWarningTypes(warnings),
      v2FieldPresence: computeV2FieldPresence(preview),
      numericCoercionCount: await getAndResetNumericCoercionCount(),
    }));

    return { success: true, preview };
  } catch (error) {
    console.error("parseCurriculumAction error:", error);
    const pm = process.env.CURRICULUM_IMPORT_V2_PROMPT === "true" ? "v2" : "v1";
    await trackAnalyticsSafely("parse_catch", trackCurriculumImportParse(userId, { promptMode: pm, parseSuccess: false, error: "Parse error" }));
    await getAndResetNumericCoercionCount();
    return { success: false, error: locale === "et" ? "Viga parsimisel" : "Parse error" };
  }
}

const MAX_NAME_LENGTH = 220;
const MAX_TITLE_LENGTH = 220;
const MAX_SUBJECTNAME_LENGTH = 220;
const MAX_PRIORITY = 10;
const MAX_TOTAL_RECORDS = 50;

function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().startsWith(dateStr);
}

const confirmSubjectsSchema = z.array(z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  notes: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),
  code: z.string().max(40).optional(),
  difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  importance: z.number().int().min(0).max(MAX_PRIORITY).optional(),
})).default([]);
const confirmTopicsSchema = z.array(z.object({
  name: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  subjectName: z.string().trim().min(1).max(MAX_SUBJECTNAME_LENGTH),
  priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  confidence: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  status: z.string().max(40).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
})).default([]);
const confirmExamsSchema = z.array(z.object({
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  date: z.string().refine(isValidCalendarDate, { message: "Invalid date" }).nullable().optional(),
  subjectName: z.string().trim().min(1).max(MAX_SUBJECTNAME_LENGTH),
  priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  difficulty: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  importance: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  riskLevel: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  readinessScore: z.number().min(0).max(10).optional(),
  format: z.string().max(20).optional(),
  ects: z.number().min(0).max(999).optional(),
})).default([]);
const confirmTasksSchema = z.array(z.object({
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  date: z.string().refine(isValidCalendarDate, { message: "Invalid date" }).nullable().optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),
  notes: z.string().nullable().optional(),
  status: z.string().max(20).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
})).default([]);

const confirmImportInputSchema = z.object({
  subjects: confirmSubjectsSchema,
  topics: confirmTopicsSchema,
  exams: confirmExamsSchema,
  tasks: confirmTasksSchema,
}).refine(
  (data) => {
    const total = data.subjects.length + data.topics.length + data.exams.length + data.tasks.length;
    return total <= MAX_TOTAL_RECORDS;
  },
  {
    message: `Maximum ${MAX_TOTAL_RECORDS} records allowed per import`,
  }
);

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextUtcDay(date: Date) {
  const next = startOfUtcDay(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export async function getCurriculumImportDailyLimit(): Promise<number> {
  const raw = process.env.CURRICULUM_IMPORT_DAILY_LIMIT;
  if (raw === undefined) return 10;
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 0) return n;
  return 10;
}

async function assertImportLimitAllowed(userId: string, now = new Date(), errorLocale: string = "en"): Promise<void> {
  const limit = await getCurriculumImportDailyLimit();

  console.log("[curriculum-import limit runtime]", {
    configuredLimit: process.env.CURRICULUM_IMPORT_DAILY_LIMIT,
    parsedLimit: limit,
    commit: process.env.VERCEL_GIT_COMMIT_SHA,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  });

  if (limit === 0) return;

  const db = getDb();
  const dayStart = startOfUtcDay(now);
  const dayEnd = nextUtcDay(now);

  const [usage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiUsageEvents)
    .where(
      and(
        eq(aiUsageEvents.userId, userId),
        eq(aiUsageEvents.feature, "curriculum_import_confirm"),
        gte(aiUsageEvents.createdAt, dayStart),
        lt(aiUsageEvents.createdAt, dayEnd),
      ),
    );

  const count = Number(usage?.count ?? 0);
  if (count >= limit) {
    const limitDebug = ` [limit=${limit} env=${process.env.CURRICULUM_IMPORT_DAILY_LIMIT ?? "unset"} commit=${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}]`;
    throw new Error(
      errorLocale === "et"
        ? `Päevane import limiit täis (${limit}/päev). Tule tagasi homme.${limitDebug}`
        : `Daily import limit reached (${limit}/day). Come back tomorrow.${limitDebug}`,
    );
  }
}

async function recordImportUsage(userId: string, metadata?: Record<string, unknown>) {
  const db = getDb();
  await db.insert(aiUsageEvents).values({
    userId,
    feature: "curriculum_import_confirm",
    provider: "local",
    promptChars: 0,
    responseChars: 0,
    metadata: metadata ?? null,
  });
}

export async function confirmCurriculumImportAction(
  selected: unknown,
  locale: string = "en"
): Promise<CurriculumImportResult> {
  try {
    const userId = await requireAuthUserId();

    const validated = confirmImportInputSchema.safeParse(selected);
    if (!validated.success) {
      return {
        success: false,
        message: locale === "et" ? "Vigane andmed" : "Invalid data",
        error: validated.error.message,
      };
    }

    const { subjects: selectedSubjects, topics: selectedTopics, exams: selectedExams, tasks: selectedTasks } = validated.data;

    const totalRecords = selectedSubjects.length + selectedTopics.length + selectedExams.length + selectedTasks.length;
    if (totalRecords === 0) {
      return {
        success: false,
        message: locale === "et" ? "Vali vähemalt üks kirje" : "Select at least one record",
      };
    }

    await assertImportLimitAllowed(userId, new Date(), locale);
    const db = getDb();

    let subjectsCreated = 0;
    let topicsCreated = 0;
    let examsCreated = 0;
    let tasksCreated = 0;

    const subjectIdMap = new Map<string, string>();

    for (const subject of selectedSubjects) {
      const rows = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(and(eq(subjects.userId, userId), eq(subjects.name, subject.name)))
        .limit(1);

      if (rows.length > 0) {
        subjectIdMap.set(subject.name, rows[0].id);
      } else {
        const inserted = await db
          .insert(subjects)
          .values({
            userId,
            name: subject.name,
            code: subject.code || null,
            description: subject.notes || "Imported",
            difficulty: subject.difficulty ?? 0,
            importance: subject.importance ?? subject.priority,
          })
          .returning();
        subjectIdMap.set(subject.name, inserted[0].id);
        subjectsCreated++;
      }
    }

    for (const topic of selectedTopics) {
      const subjectId = subjectIdMap.get(topic.subjectName);
      if (!subjectId) continue;

      const existingTopic = await db
        .select({ id: topics.id })
        .from(topics)
        .where(and(eq(topics.userId, userId), eq(topics.subjectId, subjectId), eq(topics.title, topic.name)))
        .limit(1);
      if (existingTopic.length > 0) continue;

      await db
        .insert(topics)
        .values({
          userId,
          subjectId,
          title: topic.name,
          description: buildDescription(topic.notes, topic.estimatedMinutes) ?? "Imported",
          priority: topic.priority,
          difficulty: topic.difficulty ?? 0,
          confidence: topic.confidence ?? 0,
          status: mapTopicStatus(topic.status) ?? "not_started",
        });
      topicsCreated++;
    }

    for (const exam of selectedExams) {
      const subjectId = subjectIdMap.get(exam.subjectName);
      if (!subjectId) continue;

      const examDateVal = exam.date ? new Date(exam.date) : null;
      const existingExam = await db
        .select({ id: exams.id })
        .from(exams)
        .where(
          examDateVal !== null
            ? and(eq(exams.userId, userId), eq(exams.subjectId, subjectId), eq(exams.title, exam.title), eq(exams.examDate, examDateVal))
            : and(eq(exams.userId, userId), eq(exams.subjectId, subjectId), eq(exams.title, exam.title), isNull(exams.examDate))
        )
        .limit(1);
      if (existingExam.length > 0) continue;

      await db.insert(exams).values({
        userId,
        subjectId,
        title: exam.title,
        examDate: examDateVal,
        difficulty: exam.difficulty ?? 0,
        importance: exam.importance ?? exam.priority,
        riskLevel: exam.riskLevel ?? 0,
        readinessScore: exam.readinessScore ?? 0,
        format: mapExamFormat(exam.format) ?? "unknown",
        ects: exam.ects ?? null,
        notes: exam.notes || null,
      });
      examsCreated++;
    }

    for (const task of selectedTasks) {
      const dueAtVal = task.date ? new Date(task.date) : null;
      const existingTask = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(
          dueAtVal !== null
            ? and(eq(tasks.userId, userId), eq(tasks.title, task.title), eq(tasks.dueAt, dueAtVal))
            : and(eq(tasks.userId, userId), eq(tasks.title, task.title), isNull(tasks.dueAt))
        )
        .limit(1);
      if (existingTask.length > 0) continue;

      await db.insert(tasks).values({
        userId,
        title: task.title,
        description: buildDescription(task.notes, task.estimatedMinutes),
        dueAt: dueAtVal,
        priority: task.priority,
        status: mapTaskStatus(task.status) ?? "todo",
      });
      tasksCreated++;
    }

    const pm = process.env.CURRICULUM_IMPORT_V2_PROMPT === "true" ? "v2" : "v1";
    const confirmMetadata: Record<string, unknown> = {
      promptMode: pm,
      confirmClicked: true,
      importConfirmed: true,
      recordCount: totalRecords,
      countByType: {
        subjects: selectedSubjects.length,
        topics: selectedTopics.length,
        exams: selectedExams.length,
        tasks: selectedTasks.length,
      },
    };
    await recordImportUsage(userId, confirmMetadata);
    refresh(["/subjects", "/topics", "/exams", "/goals", "/dashboard", "/command"]);

    return {
      success: true,
      message: locale === "et"
        ? `Loodud: ${subjectsCreated} ainet, ${topicsCreated} teemat, ${examsCreated} eksamit, ${tasksCreated} ülesannet`
        : `Created: ${subjectsCreated} subjects, ${topicsCreated} topics, ${examsCreated} exams, ${tasksCreated} tasks`,
      imported: { subjects: subjectsCreated, topics: topicsCreated, exams: examsCreated, tasks: tasksCreated },
    };
  } catch (error) {
    console.error("confirmCurriculumImportAction error:", error);
    if (error instanceof Error && error.message.includes("Daily import limit")) {
      return { success: false, message: error.message };
    }
    return { success: false, message: locale === "et" ? "Viga salvestamisel" : "Save error" };
  }
}