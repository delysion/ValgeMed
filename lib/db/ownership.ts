import "server-only";

import { and, eq } from "drizzle-orm";

import type { AppDb } from "@/lib/db";
import { exams, hypotheses, manuscripts, researchAreas, subjects, topics } from "@/lib/db/schema";

export const FORBIDDEN_RELATION_MESSAGE = "Forbidden relation";

type RelationKind = "subject" | "topic" | "exam" | "researchArea" | "hypothesis" | "manuscript";

async function hasOwnedRecord(db: AppDb, userId: string, kind: RelationKind, id: string) {
  if (kind === "subject") {
    const [record] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
      .limit(1);
    return !!record;
  }

  if (kind === "topic") {
    const [record] = await db
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.id, id), eq(topics.userId, userId)))
      .limit(1);
    return !!record;
  }

  if (kind === "researchArea") {
    const [record] = await db
      .select({ id: researchAreas.id })
      .from(researchAreas)
      .where(and(eq(researchAreas.id, id), eq(researchAreas.userId, userId)))
      .limit(1);
    return !!record;
  }

  if (kind === "hypothesis") {
    const [record] = await db
      .select({ id: hypotheses.id })
      .from(hypotheses)
      .where(and(eq(hypotheses.id, id), eq(hypotheses.userId, userId)))
      .limit(1);
    return !!record;
  }

  if (kind === "manuscript") {
    const [record] = await db
      .select({ id: manuscripts.id })
      .from(manuscripts)
      .where(and(eq(manuscripts.id, id), eq(manuscripts.userId, userId)))
      .limit(1);
    return !!record;
  }

  const [record] = await db
    .select({ id: exams.id })
    .from(exams)
    .where(and(eq(exams.id, id), eq(exams.userId, userId)))
    .limit(1);
  return !!record;
}

export async function verifyOwnedId(db: AppDb, userId: string, kind: RelationKind, id?: string | null) {
  if (!id) return;

  const owned = await hasOwnedRecord(db, userId, kind, id);
  if (!owned) {
    throw new Error(`${FORBIDDEN_RELATION_MESSAGE}: ${kind}`);
  }
}

export async function assertOwnedRelations(
  db: AppDb,
  userId: string,
  data: {
    subjectId?: string | null;
    topicId?: string | null;
    examId?: string | null;
    relatedSubjectId?: string | null;
    relatedTopicId?: string | null;
    relatedExamId?: string | null;
    researchAreaId?: string | null;
    hypothesisId?: string | null;
    manuscriptId?: string | null;
  },
) {
  await Promise.all([
    verifyOwnedId(db, userId, "subject", data.subjectId ?? data.relatedSubjectId),
    verifyOwnedId(db, userId, "topic", data.topicId ?? data.relatedTopicId),
    verifyOwnedId(db, userId, "exam", data.examId ?? data.relatedExamId),
    verifyOwnedId(db, userId, "researchArea", data.researchAreaId),
    verifyOwnedId(db, userId, "hypothesis", data.hypothesisId),
    verifyOwnedId(db, userId, "manuscript", data.manuscriptId),
  ]);
}
