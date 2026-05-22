import webPush from "web-push";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

webPush.setVapidDetails(
  "mailto:admin@valgemed.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const db = getDb();
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const promises = subscriptions.map(async (sub: typeof pushSubscriptions.$inferSelect) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
      console.error("Push failed:", error);
    }
  });

  await Promise.allSettled(promises);
}

export async function sendPushToAll(
  payload: PushPayload
): Promise<void> {
  const db = getDb();
  const allSubs = await db.select().from(pushSubscriptions);

  const promises = allSubs.map(async (sub: typeof pushSubscriptions.$inferSelect) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
  });

  await Promise.allSettled(promises);
}