import { createServerClient } from "@supabase/ssr";
import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";

import { isOwnerUser } from "@/lib/auth/owner";

const publicPaths = new Set([
  "/login",
  "/reset-password",
  "/privacy-policy",
  "/terms-of-service",
  "/auth/callback",
  "/pending-approval",
  "/api/admin/check-status",
  "/api/admin/notify-pending",
  "/api/auth/check-profile",
  "/api/app-version",
]);

const publicAssets = new Set([
  "/favicon.ico", "/manifest.json", "/manifest.webmanifest", "/sw.js",
  "/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg",
  "/apple-icon.png", "/icon.png",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the actual path from _next/data RSC requests
  let actualPathname = pathname;
  const rscMatch = pathname.match(/^\/_next\/data\/[^/]+\/(.+)\.json$/);
  if (rscMatch) {
    actualPathname = `/${rscMatch[1]}`;
  }
  // Normalize RSC root path (/_next/data/.../index.json → / → /)
  if (actualPathname === "/index") {
    actualPathname = "/";
  }

  if (publicPaths.has(actualPathname) || publicAssets.has(actualPathname)
    || actualPathname.startsWith("/icons/") || actualPathname.startsWith("/screenshots/")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          const previous = response.cookies.getAll();
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const cookie of previous) response.cookies.set(cookie);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  function withCookies(result: NextResponse) {
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
    return result;
  }

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return withCookies(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withCookies(NextResponse.redirect(loginUrl, 303));
  }

  if (isOwnerUser(user.id)) return response;

  const sql = neon(process.env.DATABASE_URL!);
  const [profile] = await sql`SELECT approved, is_admin FROM profiles WHERE id = ${user.id}`;
  if (profile?.approved || profile?.is_admin) return response;

  if (pathname.startsWith("/api/")) {
    return withCookies(NextResponse.json({ error: "Approval required" }, { status: 403 }));
  }
  return withCookies(NextResponse.redirect(new URL("/pending-approval", request.url), 303));
}

export const config = {
  matcher: ["/((?!_next/static/|_next/image(?:/|$)).*)"],
};
