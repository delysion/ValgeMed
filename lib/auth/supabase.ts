import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApprovedUser() {
  const user = await requireUser();

  if (process.env.OWNER_EMAIL && user.email === process.env.OWNER_EMAIL) {
    return user;
  }

  const db = getDb();
  const [profile] = await db
    .select({
      approved: profiles.approved,
      isAdmin: profiles.isAdmin,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile?.approved && !profile?.isAdmin) {
    redirect("/pending-approval");
  }

  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
