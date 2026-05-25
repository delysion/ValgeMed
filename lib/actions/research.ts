"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { requireAuthUserId } from "@/lib/db/auth";
import { getDb } from "@/lib/db";
import { literatureGaps, hypotheses, manuscripts } from "@/lib/db/schema";
import { literatureGapSchema, hypothesisSchema, manuscriptSchema } from "@/lib/validators/schemas";
import { parseForm, parseId, refresh } from "@/lib/utils/forms";

export async function createLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(literatureGapSchema, formData);
  await db.insert(literatureGaps).values({ ...data, userId });
  refresh(["/research/literature"]);
}

export async function updateLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(literatureGapSchema, formData);
  await db.update(literatureGaps).set({ ...data, updatedAt: new Date() }).where(and(eq(literatureGaps.id, recordId), eq(literatureGaps.userId, userId)));
  refresh(["/research/literature"]);
  redirect("/research/literature");
}

export async function deleteLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(literatureGaps).where(and(eq(literatureGaps.id, parseId(formData)), eq(literatureGaps.userId, userId)));
  refresh(["/research/literature"]);
  redirect("/research/literature");
}

// ─── Hypotheses ───

export async function createHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(hypothesisSchema, formData);
  await db.insert(hypotheses).values({ ...data, userId });
  refresh(["/research/hypotheses"]);
}

export async function updateHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(hypothesisSchema, formData);
  await db.update(hypotheses).set({ ...data, updatedAt: new Date() }).where(and(eq(hypotheses.id, recordId), eq(hypotheses.userId, userId)));
  refresh(["/research/hypotheses"]);
  redirect("/research/hypotheses");
}

export async function deleteHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(hypotheses).where(and(eq(hypotheses.id, parseId(formData)), eq(hypotheses.userId, userId)));
  refresh(["/research/hypotheses"]);
  redirect("/research/hypotheses");
}

// ─── Manuscripts ───

export async function createManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(manuscriptSchema, formData);
  await db.insert(manuscripts).values({ ...data, userId });
  refresh(["/research/manuscripts"]);
}

export async function updateManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(manuscriptSchema, formData);
  await db.update(manuscripts).set({ ...data, updatedAt: new Date() }).where(and(eq(manuscripts.id, recordId), eq(manuscripts.userId, userId)));
  refresh(["/research/manuscripts"]);
  redirect("/research/manuscripts");
}

export async function deleteManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(manuscripts).where(and(eq(manuscripts.id, parseId(formData)), eq(manuscripts.userId, userId)));
  refresh(["/research/manuscripts"]);
  redirect("/research/manuscripts");
}
