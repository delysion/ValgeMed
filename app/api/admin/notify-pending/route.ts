import "server-only";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { sendPushNotification } from "@/lib/push/notifications";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function POST() {
  const db = getDb();

  const [admin] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.isAdmin, true))
    .limit(1);

  if (!admin) return Response.json({ ok: false });

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles)
    .where(
      and(
        eq(profiles.approved, false),
        eq(profiles.isAdmin, false),
        isNull(profiles.notifiedAt),
      ),
    );

  if (!result?.count) return Response.json({ ok: true, skipped: true });

  await db
    .update(profiles)
    .set({ notifiedAt: new Date() })
    .where(
      and(
        eq(profiles.approved, false),
        eq(profiles.isAdmin, false),
        isNull(profiles.notifiedAt),
      ),
    );

  await sendPushNotification(admin.id, {
    title: "Nuovo utente in attesa",
    body: `Ci sono ${result.count} nuovo/i utente/i da approvare`,
    url: "/admin/users",
  });

  return Response.json({ ok: true, notified: result.count });
}
