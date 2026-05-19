"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodType } from "zod";

import { requireOwnerSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  dailyLogs,
  errorLogs,
  exams,
  goals,
  healthLogs,
  identityNotes,
  languageProgress,
  lifeAdminItems,
  opportunities,
  portfolioItems,
  professionalContacts,
  quizAttempts,
  reviewItems,
  reputationEvents,
  studySessions,
  strategicReviews,
  subjects,
  tartuNotes,
  tasks,
  timeBlocks,
  topics,
} from "@/lib/db/schema";
import { getNextReviewSchedule } from "@/lib/scheduling/reviews";
import {
  dailyLogSchema,
  errorLogSchema,
  examSchema,
  formDataToObject,
  goalSchema,
  healthLogSchema,
  identityNoteSchema,
  idSchema,
  languageProgressSchema,
  lifeAdminItemSchema,
  opportunitySchema,
  portfolioItemSchema,
  professionalContactSchema,
  quizAttemptSchema,
  reviewItemSchema,
  reviewResultSchema,
  reputationEventSchema,
  studySessionSchema,
  strategicReviewSchema,
  subjectSchema,
  tartuNoteSchema,
  taskSchema,
  timeBlockSchema,
  topicSchema,
} from "@/lib/validators/schemas";

async function authorizedDb() {
  await requireOwnerSession();
  return getDb();
}

function parseForm<T>(schema: ZodType<T>, formData: FormData): T {
  const result = schema.safeParse(formDataToObject(formData));

  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => issue.message).join(" "));
  }

  return result.data;
}

function parseId(formData: FormData) {
  return idSchema.parse(String(formData.get("id") ?? ""));
}

function refresh(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function createSubjectAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(subjectSchema, formData);
  await db.insert(subjects).values(data);
  refresh(["/subjects", "/dashboard"]);
}

export async function updateSubjectAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(subjectSchema, formData);
  await db.update(subjects).set({ ...data, updatedAt: new Date() }).where(eq(subjects.id, recordId));
  refresh(["/subjects", "/dashboard"]);
  redirect("/subjects");
}

export async function deleteSubjectAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(subjects).where(eq(subjects.id, parseId(formData)));
  refresh(["/subjects", "/dashboard"]);
  redirect("/subjects");
}

export async function createExamAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(examSchema, formData);
  await db.insert(exams).values(data);
  refresh(["/exams", "/dashboard"]);
}

export async function updateExamAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(examSchema, formData);
  await db.update(exams).set({ ...data, updatedAt: new Date() }).where(eq(exams.id, recordId));
  refresh(["/exams", `/exams/${recordId}`, "/dashboard"]);
  redirect("/exams");
}

export async function deleteExamAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(exams).where(eq(exams.id, parseId(formData)));
  refresh(["/exams", "/dashboard"]);
  redirect("/exams");
}

export async function createTopicAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(topicSchema, formData);
  await db.insert(topics).values(data);
  refresh(["/topics", "/dashboard"]);
}

export async function updateTopicAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(topicSchema, formData);
  await db.update(topics).set({ ...data, updatedAt: new Date() }).where(eq(topics.id, recordId));
  refresh(["/topics", "/dashboard"]);
  redirect("/topics");
}

export async function deleteTopicAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(topics).where(eq(topics.id, parseId(formData)));
  refresh(["/topics", "/dashboard"]);
  redirect("/topics");
}

export async function createStudySessionAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(studySessionSchema, formData);
  await db.insert(studySessions).values(data);

  if (data.topicId) {
    await db
      .update(topics)
      .set({ lastStudiedAt: data.startedAt, updatedAt: new Date() })
      .where(eq(topics.id, data.topicId));
  }

  refresh(["/study-sessions", "/topics", "/dashboard"]);
}

export async function updateStudySessionAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(studySessionSchema, formData);
  await db.update(studySessions).set(data).where(eq(studySessions.id, recordId));
  refresh(["/study-sessions", "/dashboard"]);
  redirect("/study-sessions");
}

export async function deleteStudySessionAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(studySessions).where(eq(studySessions.id, parseId(formData)));
  refresh(["/study-sessions", "/dashboard"]);
  redirect("/study-sessions");
}

export async function createReviewItemAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(reviewItemSchema, formData);
  await db.insert(reviewItems).values(data);
  refresh(["/reviews", "/dashboard"]);
}

export async function updateReviewItemAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(reviewItemSchema, formData);
  await db.update(reviewItems).set({ ...data, updatedAt: new Date() }).where(eq(reviewItems.id, recordId));
  refresh(["/reviews", "/dashboard"]);
  redirect("/reviews");
}

export async function markReviewItemReviewedAction(formData: FormData) {
  const db = await authorizedDb();
  const { id, confidence } = parseForm(reviewResultSchema, formData);
  const [item] = await db.select().from(reviewItems).where(eq(reviewItems.id, id)).limit(1);

  if (!item) {
    throw new Error("Review item not found.");
  }

  const nextSchedule = getNextReviewSchedule(
    confidence,
    item.intervalDays,
    item.timesReviewed + 1,
  );

  await db
    .update(reviewItems)
    .set({
      confidence,
      intervalDays: nextSchedule.intervalDays,
      dueAt: nextSchedule.dueAt,
      lastReviewedAt: new Date(),
      timesReviewed: item.timesReviewed + 1,
      updatedAt: new Date(),
    })
    .where(eq(reviewItems.id, id));

  refresh(["/reviews", "/dashboard"]);
}

export async function deleteReviewItemAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(reviewItems).where(eq(reviewItems.id, parseId(formData)));
  refresh(["/reviews", "/dashboard"]);
  redirect("/reviews");
}

export async function createErrorLogAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(errorLogSchema, formData);
  await db.insert(errorLogs).values(data);
  refresh(["/errors", "/dashboard"]);
}

export async function updateErrorLogAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(errorLogSchema, formData);
  await db.update(errorLogs).set({ ...data, updatedAt: new Date() }).where(eq(errorLogs.id, recordId));
  refresh(["/errors", "/dashboard"]);
  redirect("/errors");
}

export async function toggleErrorResolvedAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  await db
    .update(errorLogs)
    .set({
      resolved: sql`not ${errorLogs.resolved}`,
      updatedAt: new Date(),
    })
    .where(eq(errorLogs.id, recordId));
  refresh(["/errors", "/dashboard"]);
}

export async function deleteErrorLogAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(errorLogs).where(eq(errorLogs.id, parseId(formData)));
  refresh(["/errors", "/dashboard"]);
  redirect("/errors");
}

export async function createQuizAttemptAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(quizAttemptSchema, formData);
  await db.insert(quizAttempts).values(data);
  refresh(["/exams", "/dashboard"]);
}

export async function deleteQuizAttemptAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(quizAttempts).where(eq(quizAttempts.id, parseId(formData)));
  refresh(["/exams", "/dashboard"]);
}

export async function upsertDailyLogAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(dailyLogSchema, formData);
  await db
    .insert(dailyLogs)
    .values(data)
    .onConflictDoUpdate({
      target: dailyLogs.date,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    });
  refresh(["/daily-log", "/dashboard"]);
}

export async function updateDailyLogAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(dailyLogSchema, formData);
  await db.update(dailyLogs).set({ ...data, updatedAt: new Date() }).where(eq(dailyLogs.id, recordId));
  refresh(["/daily-log", "/dashboard"]);
  redirect("/daily-log");
}

export async function deleteDailyLogAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(dailyLogs).where(eq(dailyLogs.id, parseId(formData)));
  refresh(["/daily-log", "/dashboard"]);
  redirect("/daily-log");
}

export async function createGoalAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(goalSchema, formData);
  await db.insert(goals).values(data);
  refresh(["/goals", "/dashboard"]);
}

export async function updateGoalAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(goalSchema, formData);
  await db.update(goals).set({ ...data, updatedAt: new Date() }).where(eq(goals.id, recordId));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(goals).where(eq(goals.id, parseId(formData)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function createTaskAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(taskSchema, formData);
  await db.insert(tasks).values(data);
  refresh(["/goals", "/dashboard"]);
}

export async function updateTaskAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(taskSchema, formData);
  await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, recordId));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function deleteTaskAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(tasks).where(eq(tasks.id, parseId(formData)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function createIdentityNoteAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(identityNoteSchema, formData);
  await db.insert(identityNotes).values(data);
  refresh(["/identity", "/goals", "/dashboard"]);
}

export async function updateIdentityNoteAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(identityNoteSchema, formData);
  await db
    .update(identityNotes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(identityNotes.id, recordId));
  refresh(["/identity", "/goals", "/dashboard"]);
  redirect("/identity");
}

export async function deleteIdentityNoteAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(identityNotes).where(eq(identityNotes.id, parseId(formData)));
  refresh(["/identity", "/goals", "/dashboard"]);
  redirect("/identity");
}

export async function createTartuNoteAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(tartuNoteSchema, formData);
  await db.insert(tartuNotes).values(data);
  refresh(["/tartu", "/command"]);
}

export async function updateTartuNoteAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(tartuNoteSchema, formData);
  await db.update(tartuNotes).set({ ...data, updatedAt: new Date() }).where(eq(tartuNotes.id, recordId));
  refresh(["/tartu", "/command"]);
  redirect("/tartu");
}

export async function deleteTartuNoteAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(tartuNotes).where(eq(tartuNotes.id, parseId(formData)));
  refresh(["/tartu", "/command"]);
  redirect("/tartu");
}

export async function createTimeBlockAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(timeBlockSchema, formData);
  await db.insert(timeBlocks).values(data);
  refresh(["/time", "/command", "/elite-index"]);
}

export async function updateTimeBlockAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(timeBlockSchema, formData);
  await db.update(timeBlocks).set({ ...data, updatedAt: new Date() }).where(eq(timeBlocks.id, recordId));
  refresh(["/time", "/command", "/elite-index"]);
  redirect("/time");
}

export async function deleteTimeBlockAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(timeBlocks).where(eq(timeBlocks.id, parseId(formData)));
  refresh(["/time", "/command", "/elite-index"]);
  redirect("/time");
}

export async function createHealthLogAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(healthLogSchema, formData);
  await db
    .insert(healthLogs)
    .values(data)
    .onConflictDoUpdate({
      target: healthLogs.date,
      set: { ...data, updatedAt: new Date() },
    });
  refresh(["/health", "/command", "/elite-index"]);
}

export async function updateHealthLogAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(healthLogSchema, formData);
  await db.update(healthLogs).set({ ...data, updatedAt: new Date() }).where(eq(healthLogs.id, recordId));
  refresh(["/health", "/command", "/elite-index"]);
  redirect("/health");
}

export async function deleteHealthLogAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(healthLogs).where(eq(healthLogs.id, parseId(formData)));
  refresh(["/health", "/command", "/elite-index"]);
  redirect("/health");
}

export async function createLanguageProgressAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(languageProgressSchema, formData);
  await db.insert(languageProgress).values(data);
  refresh(["/language", "/command", "/elite-index"]);
}

export async function updateLanguageProgressAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(languageProgressSchema, formData);
  await db.update(languageProgress).set({ ...data, updatedAt: new Date() }).where(eq(languageProgress.id, recordId));
  refresh(["/language", "/command", "/elite-index"]);
  redirect("/language");
}

export async function deleteLanguageProgressAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(languageProgress).where(eq(languageProgress.id, parseId(formData)));
  refresh(["/language", "/command", "/elite-index"]);
  redirect("/language");
}

export async function createReputationEventAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(reputationEventSchema, formData);
  await db.insert(reputationEvents).values(data);
  refresh(["/reputation", "/command", "/elite-index"]);
}

export async function updateReputationEventAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(reputationEventSchema, formData);
  await db.update(reputationEvents).set({ ...data, updatedAt: new Date() }).where(eq(reputationEvents.id, recordId));
  refresh(["/reputation", "/command", "/elite-index"]);
  redirect("/reputation");
}

export async function deleteReputationEventAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(reputationEvents).where(eq(reputationEvents.id, parseId(formData)));
  refresh(["/reputation", "/command", "/elite-index"]);
  redirect("/reputation");
}

export async function createOpportunityAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(opportunitySchema, formData);
  await db.insert(opportunities).values(data);
  refresh(["/opportunities", "/command", "/elite-index"]);
}

export async function updateOpportunityAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(opportunitySchema, formData);
  await db.update(opportunities).set({ ...data, updatedAt: new Date() }).where(eq(opportunities.id, recordId));
  refresh(["/opportunities", "/command", "/elite-index"]);
  redirect("/opportunities");
}

export async function deleteOpportunityAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(opportunities).where(eq(opportunities.id, parseId(formData)));
  refresh(["/opportunities", "/command", "/elite-index"]);
  redirect("/opportunities");
}

export async function createProfessionalContactAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(professionalContactSchema, formData);
  await db.insert(professionalContacts).values(data);
  refresh(["/network", "/command"]);
}

export async function updateProfessionalContactAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(professionalContactSchema, formData);
  await db.update(professionalContacts).set({ ...data, updatedAt: new Date() }).where(eq(professionalContacts.id, recordId));
  refresh(["/network", "/command"]);
  redirect("/network");
}

export async function deleteProfessionalContactAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(professionalContacts).where(eq(professionalContacts.id, parseId(formData)));
  refresh(["/network", "/command"]);
  redirect("/network");
}

export async function createLifeAdminItemAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(lifeAdminItemSchema, formData);
  await db.insert(lifeAdminItems).values(data);
  refresh(["/life-admin", "/command"]);
}

export async function updateLifeAdminItemAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(lifeAdminItemSchema, formData);
  await db.update(lifeAdminItems).set({ ...data, updatedAt: new Date() }).where(eq(lifeAdminItems.id, recordId));
  refresh(["/life-admin", "/command"]);
  redirect("/life-admin");
}

export async function deleteLifeAdminItemAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(lifeAdminItems).where(eq(lifeAdminItems.id, parseId(formData)));
  refresh(["/life-admin", "/command"]);
  redirect("/life-admin");
}

export async function createPortfolioItemAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(portfolioItemSchema, formData);
  await db.insert(portfolioItems).values(data);
  refresh(["/portfolio", "/elite-index"]);
}

export async function updatePortfolioItemAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(portfolioItemSchema, formData);
  await db.update(portfolioItems).set({ ...data, updatedAt: new Date() }).where(eq(portfolioItems.id, recordId));
  refresh(["/portfolio", "/elite-index"]);
  redirect("/portfolio");
}

export async function deletePortfolioItemAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(portfolioItems).where(eq(portfolioItems.id, parseId(formData)));
  refresh(["/portfolio", "/elite-index"]);
  redirect("/portfolio");
}

export async function createStrategicReviewAction(formData: FormData) {
  const db = await authorizedDb();
  const data = parseForm(strategicReviewSchema, formData);
  await db.insert(strategicReviews).values(data);
  refresh(["/strategic-review", "/elite-index"]);
}

export async function updateStrategicReviewAction(formData: FormData) {
  const db = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(strategicReviewSchema, formData);
  await db.update(strategicReviews).set({ ...data, updatedAt: new Date() }).where(eq(strategicReviews.id, recordId));
  refresh(["/strategic-review", "/elite-index"]);
  redirect("/strategic-review");
}

export async function deleteStrategicReviewAction(formData: FormData) {
  const db = await authorizedDb();
  await db.delete(strategicReviews).where(eq(strategicReviews.id, parseId(formData)));
  refresh(["/strategic-review", "/elite-index"]);
  redirect("/strategic-review");
}
