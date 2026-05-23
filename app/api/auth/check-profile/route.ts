import "server-only";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? email;

    if (!userId || !email) {
      return Response.json({ error: "Missing params" }, { status: 400 });
    }

    const db = getDb();

    await db
      .insert(profiles)
      .values({ id: userId, email, displayName: name, approved: false })
      .onConflictDoUpdate({
        target: profiles.id,
        set: { email, displayName: name },
      });

    const [profile] = await db
      .select({ approved: profiles.approved, notifiedAt: profiles.notifiedAt })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return Response.json({
      approved: !!profile?.approved,
      notified: !!profile?.notifiedAt,
    });
  } catch (e) {
    console.error("check-profile error:", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
