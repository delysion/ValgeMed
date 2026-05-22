import { requireUser } from "@/lib/auth/supabase";
import { sendPushToAll, type PushPayload } from "@/lib/push/notifications";

export async function POST(request: Request) {
  await requireUser();
  const body = await request.json();

  const payload: PushPayload = {
    title: body.title ?? "ValgeMed",
    body: body.body ?? "",
    url: body.url,
  };

  await sendPushToAll(payload);

  return Response.json({ success: true });
}