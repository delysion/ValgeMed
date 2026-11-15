import { isOwnerUser } from "@/lib/auth/owner";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class ApprovalRequiredError extends Error {
  constructor() {
    super("Approval required");
    this.name = "ApprovalRequiredError";
  }
}

export type ApprovedAuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getApprovedAuthUser(): Promise<ApprovedAuthUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const isOwner = isOwnerUser(user.id);
  if (isOwner) {
    return { id: user.id, email: user.email ?? null };
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

  if (profile?.approved || profile?.isAdmin) {
    return { id: user.id, email: user.email ?? null };
  }

  return null;
}

export async function requireApprovedUserId(): Promise<string> {
  const user = await getApprovedAuthUser();
  if (!user) {
    const hasSession = await getAuthUserId();
    if (hasSession) throw new ApprovalRequiredError();
    throw new Error("Unauthorized");
  }
  return user.id;
}

export async function requireAuthUserId(): Promise<string> {
  return requireApprovedUserId();
}

export async function getUserId(): Promise<string> {
  return requireApprovedUserId();
}
