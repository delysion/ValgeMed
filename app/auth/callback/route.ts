import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const VALID_REDIRECT_PATHS = [
  "/command",
  "/dashboard",
  "/settings",
  "/ai",
  "/subjects",
  "/exams",
  "/reviews",
  "/goals",
  "/study",
  "/elite-index",
  "/errors",
  "/identity",
  "/tartu",
  "/time",
  "/health",
  "/language",
  "/life-admin",
  "/portfolio",
  "/reputation",
  "/network",
  "/memory",
  "/opportunities",
  "/topics",
  "/strategic-review",
  "/daily-log",
  "/research",
  "/research/literature",
  "/research/hypotheses",
  "/research/manuscripts",
  "/subjects/[id]",
];

function isValidRedirect(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.includes("//") || path.includes("://")) return false;
  if (path.length > 200) return false;
  return VALID_REDIRECT_PATHS.includes(path) || path.startsWith("/exams/") || path.startsWith("/subjects/");
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/command";
  const next = isValidRedirect(nextParam) ? nextParam : "/command";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalHost = process.env.NODE_ENV === "development";
      const allowedHosts = ["localhost", "127.0.0.1", "valgemed.vercel.app"];

      if (isLocalHost) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost && allowedHosts.some((h) => forwardedHost.includes(h))) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
