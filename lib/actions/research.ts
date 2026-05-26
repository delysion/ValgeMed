"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { requireAuthUserId } from "@/lib/db/auth";
import { getDb } from "@/lib/db";
import { literatureGaps, hypotheses, manuscripts, researchAreas } from "@/lib/db/schema";
import { literatureGapSchema, hypothesisSchema, manuscriptSchema, researchAreaSchema } from "@/lib/validators/schemas";
import { parseForm, parseId, refresh } from "@/lib/utils/forms";

const researchPaths = ["/research", "/research/literature", "/research/hypotheses", "/research/manuscripts"];

export async function createResearchAreaAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(researchAreaSchema, formData);
  await db.insert(researchAreas).values({ ...data, userId });
  refresh(researchPaths);
}

export async function updateResearchAreaAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(researchAreaSchema, formData);
  await db.update(researchAreas).set({ ...data, updatedAt: new Date() }).where(and(eq(researchAreas.id, recordId), eq(researchAreas.userId, userId)));
  refresh(researchPaths);
  redirect("/research");
}

export async function createLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(literatureGapSchema, formData);
  await db.insert(literatureGaps).values({ ...data, userId });
  refresh(researchPaths);
}

export async function updateLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(literatureGapSchema, formData);
  await db.update(literatureGaps).set({ ...data, updatedAt: new Date() }).where(and(eq(literatureGaps.id, recordId), eq(literatureGaps.userId, userId)));
  refresh(researchPaths);
  redirect("/research/literature");
}

export async function deleteLiteratureGapAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(literatureGaps).where(and(eq(literatureGaps.id, parseId(formData)), eq(literatureGaps.userId, userId)));
  refresh(researchPaths);
  redirect("/research/literature");
}

// ─── Hypotheses ───

export async function createHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(hypothesisSchema, formData);
  await db.insert(hypotheses).values({ ...data, userId });
  refresh(researchPaths);
}

export async function updateHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(hypothesisSchema, formData);
  await db.update(hypotheses).set({ ...data, updatedAt: new Date() }).where(and(eq(hypotheses.id, recordId), eq(hypotheses.userId, userId)));
  refresh(researchPaths);
  redirect("/research/hypotheses");
}

export async function deleteHypothesisAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(hypotheses).where(and(eq(hypotheses.id, parseId(formData)), eq(hypotheses.userId, userId)));
  refresh(researchPaths);
  redirect("/research/hypotheses");
}

// ─── Manuscripts ───

export async function createManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const data = parseForm(manuscriptSchema, formData);
  await db.insert(manuscripts).values({ ...data, userId });
  refresh(researchPaths);
}

export async function updateManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  const recordId = parseId(formData);
  const data = parseForm(manuscriptSchema, formData);
  await db.update(manuscripts).set({ ...data, updatedAt: new Date() }).where(and(eq(manuscripts.id, recordId), eq(manuscripts.userId, userId)));
  refresh(researchPaths);
  redirect("/research/manuscripts");
}

export async function deleteManuscriptAction(formData: FormData) {
  const userId = await requireAuthUserId();
  const db = getDb();
  await db.delete(manuscripts).where(and(eq(manuscripts.id, parseId(formData)), eq(manuscripts.userId, userId)));
  refresh(researchPaths);
  redirect("/research/manuscripts");
}
