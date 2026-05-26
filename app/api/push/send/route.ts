import { requireAdmin } from "@/lib/auth/admin";
import { sendPushToAll, type PushPayload } from "@/lib/push/notifications";

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();

  const payload: PushPayload = {
    title: body.title ?? "ValgeMed",
    body: body.body ?? "",
    url: body.url,
  };

  await sendPushToAll(payload);

  return Response.json({ success: true });
}
