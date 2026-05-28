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

const recordSchema = z.object({
  type: z.enum(["subject", "topic", "exam", "task"]),
  name: z.string().trim().min(1).max(220),
  parent: z.string().trim().max(220).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.number().int().min(0).max(10).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const curriculumImportSchema = z.object({
  records: z.array(recordSchema).max(50),
});

export interface CurriculumImportPreview {
  subjects: Array<{ name: string; isNew: boolean; existingId?: string; topics: string[] }>;
  topics: Array<{ name: string; subjectName: string; subjectId?: string; isNew: boolean }>;
  exams: Array<{ title: string; date: string | null; subjectName: string; subjectId?: string; isNew: boolean }>;
  tasks: Array<{ title: string; date: string | null; priority: number; isNew: boolean }>;
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

export async function parseCurriculumAction(
  rawText: string,
  locale: string = "en"
): Promise<{ success: boolean; preview?: CurriculumImportPreview; error?: string }> {
  try {
    const userId = await requireAuthUserId();

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
      return { success: false, error: locale === "et" ? "Vigane kirje struktuur" : "Invalid record structure" };
    }

    const records = validated.data.records;

    const subjectNames = new Set<string>();
    const topicMap = new Map<string, string>();
    const examList: Array<{ title: string; date: string | null; subjectName: string }> = [];
    const taskList: Array<{ title: string; date: string | null; priority: number }> = [];

    for (const rec of records) {
      if (rec.type === "subject") {
        subjectNames.add(rec.name);
      } else if (rec.type === "topic" && rec.parent) {
        topicMap.set(rec.name, rec.parent);
        subjectNames.add(rec.parent);
      } else if (rec.type === "exam") {
        examList.push({ title: rec.name, date: parseDate(rec.date), subjectName: rec.parent || "General" });
        subjectNames.add(rec.parent || "General");
      } else if (rec.type === "task") {
        taskList.push({ title: rec.name, date: parseDate(rec.date), priority: rec.priority ?? 5 });
      }
    }

    const preview: CurriculumImportPreview = {
      subjects: [],
      topics: [],
      exams: [],
      tasks: [],
    };

    for (const name of subjectNames) {
      const existingId = await findSubjectId(userId, name);
      const topicsForSubject = [...topicMap.entries()]
        .filter(([, parent]) => parent === name)
        .map(([topicName]) => topicName);

      preview.subjects.push({
        name,
        isNew: !existingId,
        existingId: existingId || undefined,
        topics: topicsForSubject,
      });
    }

    for (const [topicName, subjectName] of topicMap) {
      preview.topics.push({
        name: topicName,
        subjectName,
        isNew: true,
      });
    }

    for (const exam of examList) {
      preview.exams.push({
        title: exam.title,
        date: exam.date,
        subjectName: exam.subjectName,
        isNew: true,
      });
    }

    for (const task of taskList) {
      preview.tasks.push({
        title: task.title,
        date: task.date,
        priority: task.priority,
        isNew: true,
      });
    }

    return { success: true, preview };
  } catch (error) {
    console.error("parseCurriculumAction error:", error);
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

const confirmSubjectsSchema = z.array(z.string().trim().min(1).max(MAX_NAME_LENGTH)).default([]);
const confirmTopicsSchema = z.array(z.object({
  name: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  subjectName: z.string().trim().min(1).max(MAX_SUBJECTNAME_LENGTH),
})).default([]);
const confirmExamsSchema = z.array(z.object({
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  date: z.string().refine(isValidCalendarDate, { message: "Invalid date" }).nullable().optional(),
  subjectName: z.string().trim().min(1).max(MAX_SUBJECTNAME_LENGTH),
})).default([]);
const confirmTasksSchema = z.array(z.object({
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  date: z.string().refine(isValidCalendarDate, { message: "Invalid date" }).nullable().optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).default(5),
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

async function assertImportLimitAllowed(userId: string, now = new Date(), errorLocale: string = "en"): Promise<void> {
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
  if (count >= 10) {
    throw new Error(errorLocale === "et" ? "Päevane import limiit täis (10/päev). Tule tagasi homme." : "Daily import limit reached (10/day). Come back tomorrow.");
  }
}

async function recordImportUsage(userId: string) {
  const db = getDb();
  await db.insert(aiUsageEvents).values({
    userId,
    feature: "curriculum_import_confirm",
    provider: "local",
    promptChars: 0,
    responseChars: 0,
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

    await db.transaction(async (tx) => {
      for (const subjectName of selectedSubjects) {
        const rows = await tx
          .select({ id: subjects.id })
          .from(subjects)
          .where(and(eq(subjects.userId, userId), eq(subjects.name, subjectName)))
          .limit(1);

        if (rows.length > 0) {
          subjectIdMap.set(subjectName, rows[0].id);
        } else {
          const inserted = await tx
            .insert(subjects)
            .values({ userId, name: subjectName, description: "Imported" })
            .returning();
          subjectIdMap.set(subjectName, inserted[0].id);
          subjectsCreated++;
        }
      }

      for (const topic of selectedTopics) {
        const subjectId = subjectIdMap.get(topic.subjectName);
        if (!subjectId) continue;

        const existingTopic = await tx
          .select({ id: topics.id })
          .from(topics)
          .where(and(eq(topics.userId, userId), eq(topics.subjectId, subjectId), eq(topics.title, topic.name)))
          .limit(1);
        if (existingTopic.length > 0) continue;

        await tx
          .insert(topics)
          .values({ userId, subjectId, title: topic.name, description: "Imported" });
        topicsCreated++;
      }

      for (const exam of selectedExams) {
        const subjectId = subjectIdMap.get(exam.subjectName);
        if (!subjectId) continue;

        const examDateVal = exam.date ? new Date(exam.date) : null;
        const existingExam = await tx
          .select({ id: exams.id })
          .from(exams)
          .where(
            examDateVal !== null
              ? and(eq(exams.userId, userId), eq(exams.subjectId, subjectId), eq(exams.title, exam.title), eq(exams.examDate, examDateVal))
              : and(eq(exams.userId, userId), eq(exams.subjectId, subjectId), eq(exams.title, exam.title), isNull(exams.examDate))
          )
          .limit(1);
        if (existingExam.length > 0) continue;

        await tx.insert(exams).values({
          userId,
          subjectId,
          title: exam.title,
          examDate: examDateVal,
        });
        examsCreated++;
      }

      for (const task of selectedTasks) {
        const dueAtVal = task.date ? new Date(task.date) : null;
        const existingTask = await tx
          .select({ id: tasks.id })
          .from(tasks)
          .where(
            dueAtVal !== null
              ? and(eq(tasks.userId, userId), eq(tasks.title, task.title), eq(tasks.dueAt, dueAtVal))
              : and(eq(tasks.userId, userId), eq(tasks.title, task.title), isNull(tasks.dueAt))
          )
          .limit(1);
        if (existingTask.length > 0) continue;

        await tx.insert(tasks).values({
          userId,
          title: task.title,
          dueAt: dueAtVal,
          priority: task.priority,
          status: "todo",
        });
        tasksCreated++;
      }
    });

    await recordImportUsage(userId);
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