import { requireUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const db = getDb();

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: "Missing subscription data" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? null;

  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(pushSubscriptions)
      .set({ p256dh: keys.p256dh, auth: keys.auth, userAgent, updatedAt: new Date() })
      .where(eq(pushSubscriptions.id, existing[0].id));
  } else {
    await db.insert(pushSubscriptions).values({
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const db = getDb();
  const { endpoint } = body;

  if (!endpoint) {
    return Response.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  return Response.json({ success: true });
}