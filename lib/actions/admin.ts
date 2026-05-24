"use server";

import "server-only";

import { requireUser } from "@/lib/auth/supabase";
import { neon } from "@neondatabase/serverless";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function checkStatusAction() {
  try {
    const user = await requireUser();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT approved, is_admin FROM profiles WHERE id = ${user.id}
    `;
    const profile = rows[0];
    return {
      hasProfile: !!profile,
      approved: !!profile?.approved,
      isAdmin: !!profile?.is_admin,
    };
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
  if (!rows[0]?.is_admin) return { error: "Forbidden" };

  await db
    .update(profiles)
    .set({ approved, notifiedAt: null })
    .where(eq(profiles.id, userId));

  return { success: true };
}
