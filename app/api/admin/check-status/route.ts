import "server-only";

import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth/supabase";
import { getProfileStatus } from "@/lib/auth/profile";
import { notifyPendingProfiles } from "@/lib/push/pending";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const status = await getProfileStatus(user);
  if (!status.approved && !status.notified) {
    after(async () => {
      try {
        await notifyPendingProfiles();
      } catch {
        console.error("Pending approval notification failed");
      }
    });
  }

  return Response.json(status);
}
