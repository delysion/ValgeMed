import "server-only";

import { requireUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  const user = await requireUser();
  const db = getDb();

  const [ownProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const isAdmin = !!ownProfile?.isAdmin;
  if (!isAdmin) {
    return Response.json({ count: 0, isAdmin: false });
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles)
    .where(and(eq(profiles.approved, false), eq(profiles.isAdmin, false)));

  return Response.json({ count: result?.count ?? 0, isAdmin: true });
}
