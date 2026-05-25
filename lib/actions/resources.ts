"use server";

import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ZodType } from "zod";

import { requireAuthUserId } from "@/lib/db/auth";
import { getDb } from "@/lib/db";
import { parseForm, parseId, refresh } from "@/lib/utils/forms";
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
  const userId = await requireAuthUserId();
  const db = getDb();
  return { db, userId };
}

export async function createSubjectAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(subjectSchema, formData);
  await db.insert(subjects).values({ ...data, userId });
  refresh(["/subjects", "/dashboard"]);
}

export async function updateSubjectAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(subjectSchema, formData);
  await db.update(subjects).set({ ...data, updatedAt: new Date() }).where(and(eq(subjects.id, recordId), eq(subjects.userId, userId)));
  refresh(["/subjects", "/dashboard"]);
  redirect("/subjects");
}

export async function deleteSubjectAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(subjects).where(and(eq(subjects.id, parseId(formData)), eq(subjects.userId, userId)));
  refresh(["/subjects", "/dashboard"]);
  redirect("/subjects");
}

export async function createExamAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(examSchema, formData);
  await db.insert(exams).values({ ...data, userId });
  refresh(["/exams", "/dashboard"]);
}

export async function updateExamAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(examSchema, formData);
  await db.update(exams).set({ ...data, updatedAt: new Date() }).where(and(eq(exams.id, recordId), eq(exams.userId, userId)));
  refresh(["/exams", `/exams/${recordId}`, "/dashboard"]);
  redirect("/exams");
}

export async function deleteExamAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(exams).where(and(eq(exams.id, parseId(formData)), eq(exams.userId, userId)));
  refresh(["/exams", "/dashboard"]);
  redirect("/exams");
}

export async function createTopicAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(topicSchema, formData);
  await db.insert(topics).values({ ...data, userId });
  refresh(["/topics", "/dashboard"]);
}

export async function updateTopicAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(topicSchema, formData);
  await db.update(topics).set({ ...data, updatedAt: new Date() }).where(and(eq(topics.id, recordId), eq(topics.userId, userId)));
  refresh(["/topics", "/dashboard"]);
  redirect("/topics");
}

export async function deleteTopicAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(topics).where(and(eq(topics.id, parseId(formData)), eq(topics.userId, userId)));
  refresh(["/topics", "/dashboard"]);
  redirect("/topics");
}

export async function createStudySessionAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(studySessionSchema, formData);
  await db.insert(studySessions).values({ ...data, userId });

  if (data.topicId) {
    await db
      .update(topics)
      .set({ lastStudiedAt: data.startedAt, updatedAt: new Date() })
      .where(and(eq(topics.id, data.topicId), eq(topics.userId, userId)));
  }

  refresh(["/study-sessions", "/topics", "/dashboard"]);
}

export async function updateStudySessionAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(studySessionSchema, formData);
  await db.update(studySessions).set(data).where(and(eq(studySessions.id, recordId), eq(studySessions.userId, userId)));
  refresh(["/study-sessions", "/dashboard"]);
  redirect("/study-sessions");
}

export async function deleteStudySessionAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(studySessions).where(and(eq(studySessions.id, parseId(formData)), eq(studySessions.userId, userId)));
  refresh(["/study-sessions", "/dashboard"]);
  redirect("/study-sessions");
}

export async function createReviewItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(reviewItemSchema, formData);
  await db.insert(reviewItems).values({ ...data, userId });
  refresh(["/reviews", "/dashboard"]);
}

export async function updateReviewItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(reviewItemSchema, formData);
  await db.update(reviewItems).set({ ...data, updatedAt: new Date() }).where(and(eq(reviewItems.id, recordId), eq(reviewItems.userId, userId)));
  refresh(["/reviews", "/dashboard"]);
  redirect("/reviews");
}

export async function markReviewItemReviewedAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const { id, confidence } = parseForm(reviewResultSchema, formData);
  const [item] = await db.select().from(reviewItems).where(and(eq(reviewItems.id, id), eq(reviewItems.userId, userId))).limit(1);

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
    .where(and(eq(reviewItems.id, id), eq(reviewItems.userId, userId)));

  refresh(["/reviews", "/dashboard"]);
}

export async function deleteReviewItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(reviewItems).where(and(eq(reviewItems.id, parseId(formData)), eq(reviewItems.userId, userId)));
  refresh(["/reviews", "/dashboard"]);
  redirect("/reviews");
}

export async function createErrorLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(errorLogSchema, formData);
  await db.insert(errorLogs).values({ ...data, userId });
  refresh(["/errors", "/dashboard"]);
}

export async function updateErrorLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(errorLogSchema, formData);
  await db.update(errorLogs).set({ ...data, updatedAt: new Date() }).where(and(eq(errorLogs.id, recordId), eq(errorLogs.userId, userId)));
  refresh(["/errors", "/dashboard"]);
  redirect("/errors");
}

export async function toggleErrorResolvedAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  await db
    .update(errorLogs)
    .set({
      resolved: sql`not ${errorLogs.resolved}`,
      updatedAt: new Date(),
    })
    .where(and(eq(errorLogs.id, recordId), eq(errorLogs.userId, userId)));
  refresh(["/errors", "/dashboard"]);
}

export async function deleteErrorLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(errorLogs).where(and(eq(errorLogs.id, parseId(formData)), eq(errorLogs.userId, userId)));
  refresh(["/errors", "/dashboard"]);
  redirect("/errors");
}

export async function createQuizAttemptAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(quizAttemptSchema, formData);
  await db.insert(quizAttempts).values({ ...data, userId });
  refresh(["/exams", "/dashboard"]);
}

export async function deleteQuizAttemptAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(quizAttempts).where(and(eq(quizAttempts.id, parseId(formData)), eq(quizAttempts.userId, userId)));
  refresh(["/exams", "/dashboard"]);
}

export async function upsertDailyLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(dailyLogSchema, formData);
  await db
    .insert(dailyLogs)
    .values({ ...data, userId })
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
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(dailyLogSchema, formData);
  await db.update(dailyLogs).set({ ...data, updatedAt: new Date() }).where(and(eq(dailyLogs.id, recordId), eq(dailyLogs.userId, userId)));
  refresh(["/daily-log", "/dashboard"]);
  redirect("/daily-log");
}

export async function deleteDailyLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(dailyLogs).where(and(eq(dailyLogs.id, parseId(formData)), eq(dailyLogs.userId, userId)));
  refresh(["/daily-log", "/dashboard"]);
  redirect("/daily-log");
}

export async function createGoalAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(goalSchema, formData);
  await db.insert(goals).values({ ...data, userId });
  refresh(["/goals", "/dashboard"]);
}

export async function updateGoalAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(goalSchema, formData);
  await db.update(goals).set({ ...data, updatedAt: new Date() }).where(and(eq(goals.id, recordId), eq(goals.userId, userId)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(goals).where(and(eq(goals.id, parseId(formData)), eq(goals.userId, userId)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function createTaskAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(taskSchema, formData);
  await db.insert(tasks).values({ ...data, userId });
  refresh(["/goals", "/dashboard"]);
}

export async function updateTaskAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(taskSchema, formData);
  await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(and(eq(tasks.id, recordId), eq(tasks.userId, userId)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function deleteTaskAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(tasks).where(and(eq(tasks.id, parseId(formData)), eq(tasks.userId, userId)));
  refresh(["/goals", "/dashboard"]);
  redirect("/goals");
}

export async function createIdentityNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(identityNoteSchema, formData);
  await db.insert(identityNotes).values({ ...data, userId });
  refresh(["/identity", "/goals", "/dashboard"]);
}

export async function updateIdentityNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(identityNoteSchema, formData);
  await db
    .update(identityNotes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(identityNotes.id, recordId), eq(identityNotes.userId, userId)));
  refresh(["/identity", "/goals", "/dashboard"]);
  redirect("/identity");
}

export async function deleteIdentityNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(identityNotes).where(and(eq(identityNotes.id, parseId(formData)), eq(identityNotes.userId, userId)));
  refresh(["/identity", "/goals", "/dashboard"]);
  redirect("/identity");
}

export async function createTartuNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(tartuNoteSchema, formData);
  await db.insert(tartuNotes).values({ ...data, userId });
  refresh(["/tartu", "/command"]);
}

export async function updateTartuNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(tartuNoteSchema, formData);
  await db.update(tartuNotes).set({ ...data, updatedAt: new Date() }).where(and(eq(tartuNotes.id, recordId), eq(tartuNotes.userId, userId)));
  refresh(["/tartu", "/command"]);
  redirect("/tartu");
}

export async function deleteTartuNoteAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(tartuNotes).where(and(eq(tartuNotes.id, parseId(formData)), eq(tartuNotes.userId, userId)));
  refresh(["/tartu", "/command"]);
  redirect("/tartu");
}

export async function createTimeBlockAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(timeBlockSchema, formData);
  await db.insert(timeBlocks).values({ ...data, userId });
  refresh(["/time", "/command", "/elite-index"]);
}

export async function updateTimeBlockAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(timeBlockSchema, formData);
  await db.update(timeBlocks).set({ ...data, updatedAt: new Date() }).where(and(eq(timeBlocks.id, recordId), eq(timeBlocks.userId, userId)));
  refresh(["/time", "/command", "/elite-index"]);
  redirect("/time");
}

export async function deleteTimeBlockAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(timeBlocks).where(and(eq(timeBlocks.id, parseId(formData)), eq(timeBlocks.userId, userId)));
  refresh(["/time", "/command", "/elite-index"]);
  redirect("/time");
}

export async function createHealthLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(healthLogSchema, formData);
  await db
    .insert(healthLogs)
    .values({ ...data, userId })
    .onConflictDoUpdate({
      target: healthLogs.date,
      set: { ...data, updatedAt: new Date() },
    });
  refresh(["/health", "/command", "/elite-index"]);
}

export async function updateHealthLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(healthLogSchema, formData);
  await db.update(healthLogs).set({ ...data, updatedAt: new Date() }).where(and(eq(healthLogs.id, recordId), eq(healthLogs.userId, userId)));
  refresh(["/health", "/command", "/elite-index"]);
  redirect("/health");
}

export async function deleteHealthLogAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(healthLogs).where(and(eq(healthLogs.id, parseId(formData)), eq(healthLogs.userId, userId)));
  refresh(["/health", "/command", "/elite-index"]);
  redirect("/health");
}

export async function createLanguageProgressAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(languageProgressSchema, formData);
  await db.insert(languageProgress).values({ ...data, userId });
  refresh(["/language", "/command", "/elite-index"]);
}

export async function updateLanguageProgressAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(languageProgressSchema, formData);
  await db.update(languageProgress).set({ ...data, updatedAt: new Date() }).where(and(eq(languageProgress.id, recordId), eq(languageProgress.userId, userId)));
  refresh(["/language", "/command", "/elite-index"]);
  redirect("/language");
}

export async function deleteLanguageProgressAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(languageProgress).where(and(eq(languageProgress.id, parseId(formData)), eq(languageProgress.userId, userId)));
  refresh(["/language", "/command", "/elite-index"]);
  redirect("/language");
}

export async function createReputationEventAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(reputationEventSchema, formData);
  await db.insert(reputationEvents).values({ ...data, userId });
  refresh(["/reputation", "/command", "/elite-index"]);
}

export async function updateReputationEventAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(reputationEventSchema, formData);
  await db.update(reputationEvents).set({ ...data, updatedAt: new Date() }).where(and(eq(reputationEvents.id, recordId), eq(reputationEvents.userId, userId)));
  refresh(["/reputation", "/command", "/elite-index"]);
  redirect("/reputation");
}

export async function deleteReputationEventAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(reputationEvents).where(and(eq(reputationEvents.id, parseId(formData)), eq(reputationEvents.userId, userId)));
  refresh(["/reputation", "/command", "/elite-index"]);
  redirect("/reputation");
}

export async function createOpportunityAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(opportunitySchema, formData);
  await db.insert(opportunities).values({ ...data, userId });
  refresh(["/opportunities", "/command", "/elite-index"]);
}

export async function updateOpportunityAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(opportunitySchema, formData);
  await db.update(opportunities).set({ ...data, updatedAt: new Date() }).where(and(eq(opportunities.id, recordId), eq(opportunities.userId, userId)));
  refresh(["/opportunities", "/command", "/elite-index"]);
  redirect("/opportunities");
}

export async function deleteOpportunityAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(opportunities).where(and(eq(opportunities.id, parseId(formData)), eq(opportunities.userId, userId)));
  refresh(["/opportunities", "/command", "/elite-index"]);
  redirect("/opportunities");
}

export async function createProfessionalContactAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(professionalContactSchema, formData);
  await db.insert(professionalContacts).values({ ...data, userId });
  refresh(["/network", "/command"]);
}

export async function updateProfessionalContactAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(professionalContactSchema, formData);
  await db.update(professionalContacts).set({ ...data, updatedAt: new Date() }).where(and(eq(professionalContacts.id, recordId), eq(professionalContacts.userId, userId)));
  refresh(["/network", "/command"]);
  redirect("/network");
}

export async function deleteProfessionalContactAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(professionalContacts).where(and(eq(professionalContacts.id, parseId(formData)), eq(professionalContacts.userId, userId)));
  refresh(["/network", "/command"]);
  redirect("/network");
}

export async function createLifeAdminItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(lifeAdminItemSchema, formData);
  await db.insert(lifeAdminItems).values({ ...data, userId });
  refresh(["/life-admin", "/command"]);
}

export async function updateLifeAdminItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(lifeAdminItemSchema, formData);
  await db.update(lifeAdminItems).set({ ...data, updatedAt: new Date() }).where(and(eq(lifeAdminItems.id, recordId), eq(lifeAdminItems.userId, userId)));
  refresh(["/life-admin", "/command"]);
  redirect("/life-admin");
}

export async function deleteLifeAdminItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(lifeAdminItems).where(and(eq(lifeAdminItems.id, parseId(formData)), eq(lifeAdminItems.userId, userId)));
  refresh(["/life-admin", "/command"]);
  redirect("/life-admin");
}

export async function createPortfolioItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(portfolioItemSchema, formData);
  await db.insert(portfolioItems).values({ ...data, userId });
  refresh(["/portfolio", "/elite-index"]);
}

export async function updatePortfolioItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(portfolioItemSchema, formData);
  await db.update(portfolioItems).set({ ...data, updatedAt: new Date() }).where(and(eq(portfolioItems.id, recordId), eq(portfolioItems.userId, userId)));
  refresh(["/portfolio", "/elite-index"]);
  redirect("/portfolio");
}

export async function deletePortfolioItemAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(portfolioItems).where(and(eq(portfolioItems.id, parseId(formData)), eq(portfolioItems.userId, userId)));
  refresh(["/portfolio", "/elite-index"]);
  redirect("/portfolio");
}

export async function createStrategicReviewAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(strategicReviewSchema, formData);
  await db.insert(strategicReviews).values({ ...data, userId });
  refresh(["/strategic-review", "/elite-index"]);
}

export async function updateStrategicReviewAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  const data = parseForm(strategicReviewSchema, formData);
  await db.update(strategicReviews).set({ ...data, updatedAt: new Date() }).where(and(eq(strategicReviews.id, recordId), eq(strategicReviews.userId, userId)));
  refresh(["/strategic-review", "/elite-index"]);
  redirect("/strategic-review");
}

export async function deleteStrategicReviewAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  await db.delete(strategicReviews).where(and(eq(strategicReviews.id, parseId(formData)), eq(strategicReviews.userId, userId)));
  refresh(["/strategic-review", "/elite-index"]);
  redirect("/strategic-review");
}
