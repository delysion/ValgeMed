"use server";

import "server-only";

import { getProfileStatus } from "@/lib/auth/profile";
import { requireUser } from "@/lib/auth/supabase";
import { isOwnerUser } from "@/lib/auth/owner";
import { setUserApproval } from "@/lib/auth/approval";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeAiDailyCharLimit,
  normalizeAiDailyImportLimit,
  normalizeAiDailyRequestLimit,
  normalizeAiPromptLimit,
} from "@/lib/ai/prompt-limits";

export async function checkStatusAction() {
  try {
    const user = await requireUser();
    return await getProfileStatus(user);
  } catch (e) {
    console.error("check-status error:", e);
    return { hasProfile: false, approved: false, isAdmin: false };
  }
}

export async function approveUserAction(userId: string, approved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;
  if (!isOwnerUser(user.id) && !rows[0]?.is_admin) return { error: "Forbidden" };

  await setUserApproval(user.id, userId, approved);

  return { success: true };
}

export async function updateUserAiPromptLimitAction(userId: string, rawLimit: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;
  if (!isOwnerUser(user.id) && !rows[0]?.is_admin) return { error: "Forbidden" };

  const aiPromptLimitChars = normalizeAiPromptLimit(rawLimit);

  await db
    .update(profiles)
    .set({ aiPromptLimitChars, updatedAt: new Date() })
    .where(eq(profiles.id, userId));

  revalidatePath("/admin/users");

  return { success: true, aiPromptLimitChars };
}

export async function updateUserAiUsageLimitsAction(userId: string, rawRequestLimit: unknown, rawCharLimit: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;
  if (!isOwnerUser(user.id) && !rows[0]?.is_admin) return { error: "Forbidden" };

  const aiDailyRequestLimit = normalizeAiDailyRequestLimit(rawRequestLimit);
  const aiDailyCharLimit = normalizeAiDailyCharLimit(rawCharLimit);

  await db
    .update(profiles)
    .set({ aiDailyRequestLimit, aiDailyCharLimit, updatedAt: new Date() })
    .where(eq(profiles.id, userId));

  revalidatePath("/admin/users");

  return { success: true, aiDailyRequestLimit, aiDailyCharLimit };
}

export async function updateUserAiImportLimitAction(userId: string, rawLimit: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;
  if (!isOwnerUser(user.id) && !rows[0]?.is_admin) return { error: "Forbidden" };

  const aiDailyImportLimit = normalizeAiDailyImportLimit(rawLimit);

  await db
    .update(profiles)
    .set({ aiDailyImportLimit, updatedAt: new Date() })
    .where(eq(profiles.id, userId));

  revalidatePath("/admin/users");

  return { success: true, aiDailyImportLimit };
}
