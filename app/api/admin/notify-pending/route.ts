import "server-only";

import { timingSafeEqual } from "node:crypto";
import { notifyPendingProfiles } from "@/lib/push/pending";

function matchesSecret(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const actual = Buffer.from(received);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

async function deliver() {
  try {
    return Response.json({ ok: true, notified: await notifyPendingProfiles() });
  } catch {
    return Response.json({ ok: false, error: "Notification delivery failed" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const expected = process.env.INTERNAL_API_TOKEN ?? process.env.SESSION_SECRET;
  if (!matchesSecret(request.headers.get("x-valgemed-internal-token"), expected)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return deliver();
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !matchesSecret(request.headers.get("authorization"), "Bearer " + secret)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return deliver();
}
