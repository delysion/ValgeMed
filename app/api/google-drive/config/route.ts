import { NextRequest, NextResponse } from "next/server";

import { requireApprovedUser } from "@/lib/auth/supabase";
import { getGoogleDriveConfig } from "@/lib/google-drive/config";

export async function GET(request: NextRequest) {
  try {
    await requireApprovedUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentOrigin = new URL(request.url).origin;
  const config = getGoogleDriveConfig({
    clientId: process.env.GOOGLE_CLIENT_ID,
    appId: process.env.GOOGLE_APP_ID,
    apiKey: process.env.GOOGLE_API_KEY,
    allowedOrigins: process.env.GOOGLE_AUTHORIZED_ORIGINS,
    currentOrigin,
  });

  return NextResponse.json({
    clientId: config.clientId,
    appId: config.appId,
    apiKey: config.apiKey,
    allowedOrigins: config.allowedOrigins.join(","),
    currentOrigin: config.currentOrigin,
    issue: config.issue,
    ready: config.ready,
  });
}
