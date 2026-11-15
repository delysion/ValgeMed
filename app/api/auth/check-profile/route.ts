import { getCurrentUser } from "@/lib/auth/supabase";
import { getProfileStatus } from "@/lib/auth/profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { approved, notified } = await getProfileStatus(user);
  return Response.json({ approved, notified });
}
