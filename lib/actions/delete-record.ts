"use server";

import { z } from "zod";

import { requireAuthUserId } from "@/lib/db/auth";
import { getDb } from "@/lib/db";
import { refresh } from "@/lib/utils/forms";
import {
  aiUsageEvents,
  errorLogs,
  exams,
  goals,
  healthLogs,
  lifeAdminItems,
  opportunities,
  professionalContacts,
  subjects,
  tasks,
  topics,
} from "@/lib/db/schema";
import { and, eq, gte, ilike, lt, sql } from "drizzle-orm";

const deleteQuerySchema = z.object({
  query: z.string().trim().min(1).max(200),
  filters: z.object({
    type: z.enum([
      "subject", "topic", "exam", "task", "error_log", "contact", "opportunity",
      "life_admin", "time_block", "goal", "review_item", "study_session",
      "health_log", "daily_log", "language_progress", "reputation_event",
      "strategic_review", "hypothesis", "manuscript"
    ]).nullable(),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  }).optional(),
  confidence: z.number().int().min(0).max(10),
});

export interface DeleteCandidate {
  id: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
}

export interface DeletePreviewResult {
  success: boolean;
  candidate?: DeleteCandidate;
  error?: string;
  tooAmbiguous?: boolean;
  notFound?: boolean;
}

export interface DeleteConfirmResult {
  success: boolean;
  message: string;
  deleted?: { type: string; id: string };
  error?: string;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextUtcDay(date: Date) {
  const next = startOfUtcDay(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

async function assertDeleteLimitAllowed(userId: string, now = new Date()): Promise<void> {
  const db = getDb();
  const dayStart = startOfUtcDay(now);
  const dayEnd = nextUtcDay(now);

  const [usage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiUsageEvents)
    .where(
      and(
        eq(aiUsageEvents.userId, userId),
        eq(aiUsageEvents.feature, "delete_confirm"),
        gte(aiUsageEvents.createdAt, dayStart),
        lt(aiUsageEvents.createdAt, dayEnd),
      ),
    );

  const count = Number(usage?.count ?? 0);
  if (count >= 10) {
    throw new Error("Daily delete limit reached (10/day). Come back tomorrow.");
  }
}

async function recordDeleteUsage(userId: string) {
  const db = getDb();
  await db.insert(aiUsageEvents).values({
    userId,
    feature: "delete_confirm",
    provider: "local",
    promptChars: 0,
    responseChars: 0,
  });
}

export async function previewDeleteAction(
  rawQuery: string,
  locale: string = "en"
): Promise<DeletePreviewResult> {
  try {
    const userId = await requireAuthUserId();

    let parsed: unknown;
    try {
      const cleaned = rawQuery.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let normalized = cleaned;
      const tmp = JSON.parse(cleaned);
      if (Array.isArray(tmp)) {
        if (tmp.length === 0) {
          return { success: false, error: locale === "et" ? "Vigane JSON" : "Invalid JSON" };
        }
        normalized = JSON.stringify({ records: tmp });
      }
      parsed = JSON.parse(normalized);
    } catch {
      return { success: false, error: locale === "et" ? "Vigane JSON" : "Invalid JSON" };
    }

    const validated = deleteQuerySchema.safeParse(parsed);
    if (!validated.success) {
      return { success: false, error: locale === "et" ? "Vigane päring" : "Invalid query" };
    }

    const { query, filters, confidence } = validated.data;

    if (confidence < 7) {
      return {
        success: false,
        error: locale === "et"
          ? "Päring pole piisavalt täpne. Palun täpsusta (nt täpne nimi, kuupäev)."
          : "Query not specific enough. Please be more specific (e.g. exact name + date).",
        tooAmbiguous: true,
      };
    }

    const recordType = filters?.type;
    const searchTerm = `%${query}%`;

    const db = getDb();

    if (recordType) {
      switch (recordType) {
        case "subject": {
          const results = await db.select({ id: subjects.id }).from(subjects)
            .where(and(eq(subjects.userId, userId), ilike(subjects.name, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(subjects).where(and(eq(subjects.id, results[0].id), eq(subjects.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "subject", title: rec.name } } : { success: false, notFound: true };
        }
        case "topic": {
          const results = await db.select({ id: topics.id }).from(topics)
            .where(and(eq(topics.userId, userId), ilike(topics.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(topics).where(and(eq(topics.id, results[0].id), eq(topics.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "topic", title: rec.title } } : { success: false, notFound: true };
        }
        case "exam": {
          const results = await db.select({ id: exams.id }).from(exams)
            .where(and(eq(exams.userId, userId), ilike(exams.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(exams).where(and(eq(exams.id, results[0].id), eq(exams.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "exam", title: rec.title } } : { success: false, notFound: true };
        }
        case "task": {
          const results = await db.select({ id: tasks.id }).from(tasks)
            .where(and(eq(tasks.userId, userId), ilike(tasks.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(tasks).where(and(eq(tasks.id, results[0].id), eq(tasks.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "task", title: rec.title } } : { success: false, notFound: true };
        }
        case "error_log": {
          const results = await db.select({ id: errorLogs.id }).from(errorLogs)
            .where(and(eq(errorLogs.userId, userId), ilike(errorLogs.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(errorLogs).where(and(eq(errorLogs.id, results[0].id), eq(errorLogs.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "error_log", title: rec.title } } : { success: false, notFound: true };
        }
        case "opportunity": {
          const results = await db.select({ id: opportunities.id }).from(opportunities)
            .where(and(eq(opportunities.userId, userId), ilike(opportunities.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(opportunities).where(and(eq(opportunities.id, results[0].id), eq(opportunities.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "opportunity", title: rec.title } } : { success: false, notFound: true };
        }
        case "goal": {
          const results = await db.select({ id: goals.id }).from(goals)
            .where(and(eq(goals.userId, userId), ilike(goals.title, searchTerm))).limit(2);
          if (results.length === 0) return { success: false, notFound: true };
          if (results.length > 1) return { success: false, error: locale === "et" ? "Leiti mitu sobivat kirjet." : "Multiple records found.", tooAmbiguous: true };
          const [rec] = await db.select().from(goals).where(and(eq(goals.id, results[0].id), eq(goals.userId, userId))).limit(1);
          return rec ? { success: true, candidate: { id: rec.id, type: "goal", title: rec.title } } : { success: false, notFound: true };
        }
        default:
          return { success: false, error: locale === "et" ? "Tüüp ei toetata" : "Type not supported" };
      }
    }

    let result = await db.select({ id: subjects.id }).from(subjects)
      .where(and(eq(subjects.userId, userId), ilike(subjects.name, searchTerm))).limit(2);
    if (result.length === 1) {
      const [rec] = await db.select().from(subjects).where(and(eq(subjects.id, result[0].id), eq(subjects.userId, userId))).limit(1);
      if (rec) return { success: true, candidate: { id: rec.id, type: "subject", title: rec.name } };
    }

    result = await db.select({ id: topics.id }).from(topics)
      .where(and(eq(topics.userId, userId), ilike(topics.title, searchTerm))).limit(2);
    if (result.length === 1) {
      const [rec] = await db.select().from(topics).where(and(eq(topics.id, result[0].id), eq(topics.userId, userId))).limit(1);
      if (rec) return { success: true, candidate: { id: rec.id, type: "topic", title: rec.title } };
    }

    result = await db.select({ id: exams.id }).from(exams)
      .where(and(eq(exams.userId, userId), ilike(exams.title, searchTerm))).limit(2);
    if (result.length === 1) {
      const [rec] = await db.select().from(exams).where(and(eq(exams.id, result[0].id), eq(exams.userId, userId))).limit(1);
      if (rec) return { success: true, candidate: { id: rec.id, type: "exam", title: rec.title } };
    }

    result = await db.select({ id: tasks.id }).from(tasks)
      .where(and(eq(tasks.userId, userId), ilike(tasks.title, searchTerm))).limit(2);
    if (result.length === 1) {
      const [rec] = await db.select().from(tasks).where(and(eq(tasks.id, result[0].id), eq(tasks.userId, userId))).limit(1);
      if (rec) return { success: true, candidate: { id: rec.id, type: "task", title: rec.title } };
    }

    return { success: false, notFound: true };
  } catch (error) {
    console.error("previewDeleteAction error:", error);
    return { success: false, error: locale === "et" ? "Viga otsingul" : "Search error" };
  }
}

export async function confirmDeleteAction(
  recordId: string,
  recordType: string,
  locale: string = "en"
): Promise<DeleteConfirmResult> {
  try {
    const userId = await requireAuthUserId();
    await assertDeleteLimitAllowed(userId);
    const db = getDb();

    switch (recordType) {
      case "subject": {
        const [existing] = await db.select({ id: subjects.id }).from(subjects)
          .where(and(eq(subjects.id, recordId), eq(subjects.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(subjects).where(eq(subjects.id, recordId));
        break;
      }
      case "topic": {
        const [existing] = await db.select({ id: topics.id }).from(topics)
          .where(and(eq(topics.id, recordId), eq(topics.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(topics).where(eq(topics.id, recordId));
        break;
      }
      case "exam": {
        const [existing] = await db.select({ id: exams.id }).from(exams)
          .where(and(eq(exams.id, recordId), eq(exams.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(exams).where(eq(exams.id, recordId));
        break;
      }
      case "task": {
        const [existing] = await db.select({ id: tasks.id }).from(tasks)
          .where(and(eq(tasks.id, recordId), eq(tasks.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(tasks).where(eq(tasks.id, recordId));
        break;
      }
      case "error_log": {
        const [existing] = await db.select({ id: errorLogs.id }).from(errorLogs)
          .where(and(eq(errorLogs.id, recordId), eq(errorLogs.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(errorLogs).where(eq(errorLogs.id, recordId));
        break;
      }
      case "opportunity": {
        const [existing] = await db.select({ id: opportunities.id }).from(opportunities)
          .where(and(eq(opportunities.id, recordId), eq(opportunities.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(opportunities).where(and(eq(opportunities.id, recordId), eq(opportunities.userId, userId)));
        break;
      }
      case "goal": {
        const [existing] = await db.select({ id: goals.id }).from(goals)
          .where(and(eq(goals.id, recordId), eq(goals.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(goals).where(and(eq(goals.id, recordId), eq(goals.userId, userId)));
        break;
      }
      case "contact": {
        const [existing] = await db.select({ id: professionalContacts.id }).from(professionalContacts)
          .where(and(eq(professionalContacts.id, recordId), eq(professionalContacts.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(professionalContacts).where(and(eq(professionalContacts.id, recordId), eq(professionalContacts.userId, userId)));
        break;
      }
      case "life_admin": {
        const [existing] = await db.select({ id: lifeAdminItems.id }).from(lifeAdminItems)
          .where(and(eq(lifeAdminItems.id, recordId), eq(lifeAdminItems.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(lifeAdminItems).where(and(eq(lifeAdminItems.id, recordId), eq(lifeAdminItems.userId, userId)));
        break;
      }
      case "health_log": {
        const [existing] = await db.select({ id: healthLogs.id }).from(healthLogs)
          .where(and(eq(healthLogs.id, recordId), eq(healthLogs.userId, userId))).limit(1);
        if (!existing) return { success: false, message: locale === "et" ? "Kirjet ei leitud" : "Record not found" };
        await db.delete(healthLogs).where(and(eq(healthLogs.id, recordId), eq(healthLogs.userId, userId)));
        break;
      }
      default:
        return { success: false, message: locale === "et" ? "Tüüp ei toetata" : "Type not supported" };
    }

    const pathMap: Record<string, string[]> = {
      subject: ["/subjects", "/dashboard"],
      topic: ["/topics", "/dashboard"],
      exam: ["/exams", "/dashboard"],
      task: ["/goals", "/dashboard"],
      error_log: ["/errors", "/dashboard"],
      contact: ["/network", "/dashboard"],
      opportunity: ["/opportunities", "/dashboard"],
      life_admin: ["/life-admin", "/dashboard"],
      goal: ["/goals", "/dashboard"],
      health_log: ["/health", "/dashboard"],
    };

    const paths = pathMap[recordType] || ["/dashboard"];
    refresh([...paths, "/command"]);

    await recordDeleteUsage(userId);

    return {
      success: true,
      message: locale === "et" ? "Kustutatud" : "Deleted",
      deleted: { type: recordType, id: recordId },
    };
  } catch (error) {
    console.error("confirmDeleteAction error:", error);
    return { success: false, message: locale === "et" ? "Viga kustutamisel" : "Delete error" };
  }
}