import "server-only";

import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getOwnerUserId } from "@/lib/auth/owner";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { sendPushNotification } from "@/lib/push/notifications";

export async function notifyPendingProfiles(): Promise<number> {
  const db = getDb();
  const owner = getOwnerUserId();
  const [admin] = owner ? [] : await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.isAdmin, true))
    .orderBy(profiles.id)
    .limit(1);
  const recipient = owner ?? admin?.id;
  if (!recipient) return 0;

  const claimedUntil = new Date(Date.now() + 60_000);
  const pending = and(
    eq(profiles.approved, false),
    eq(profiles.isAdmin, false),
    isNull(profiles.rejectedAt),
    isNull(profiles.notifiedAt),
    sql`${profiles.id} <> ${recipient}`,
  );
  const claimed = await db.update(profiles)
    .set({ notificationClaimedUntil: claimedUntil })
    .where(and(pending, or(
      isNull(profiles.notificationClaimedUntil),
      sql`${profiles.notificationClaimedUntil} <= now()`,
    )))
    .returning({ id: profiles.id });
  if (!claimed.length) return 0;

  const sent = await sendPushNotification(recipient, {
    title: "New user pending",
    body: `${claimed.length} new user(s) awaiting approval`,
    url: "/admin/users",
  });
  // Failed attempts remain eligible for retry after the lease expires.
  if (!sent) throw new Error("No push subscription accepted the notification");

  const updated = await db.update(profiles)
    .set({ notifiedAt: new Date(), notificationClaimedUntil: null })
    .where(and(pending, inArray(profiles.id, claimed.map(({ id }) => id)),
      eq(profiles.notificationClaimedUntil, claimedUntil)))
    .returning({ id: profiles.id });
  return updated.length;
}
