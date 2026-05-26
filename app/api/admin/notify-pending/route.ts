import "server-only";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { sendPushNotification } from "@/lib/push/notifications";
import { eq, and, isNull, sql } from "drizzle-orm";

function getInternalToken() {
  return process.env.INTERNAL_API_TOKEN ?? process.env.SESSION_SECRET ?? "";
}

function isAuthorizedInternalRequest(request: Request) {
  const expected = getInternalToken();
  return expected.length > 0 && request.headers.get("x-valgemed-internal-token") === expected;
}

export async function POST(request: Request) {
  if (!isAuthorizedInternalRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();

  let [admin] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.isAdmin, true))
    .limit(1);

  if (!admin && process.env.OWNER_EMAIL) {
    [admin] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, process.env.OWNER_EMAIL))
      .limit(1);
  }

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
    title: "New user pending",
    body: `${result.count} new user(s) awaiting approval`,
    url: "/admin/users",
  });

  return Response.json({ ok: true, notified: result.count });
}
