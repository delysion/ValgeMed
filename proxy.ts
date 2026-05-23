import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

const privatePrefixes = [
  "/",
  "/admin",
  "/command",
  "/dashboard",
  "/elite-index",
  "/subjects",
  "/exams",
  "/topics",
  "/study",
  "/study-sessions",
  "/reviews",
  "/errors",
  "/daily-log",
  "/goals",
  "/identity",
  "/tartu",
  "/time",
  "/health",
  "/language",
  "/reputation",
  "/opportunities",
  "/network",
  "/memory",
  "/timeline",
  "/research",
  "/life-admin",
  "/portfolio",
  "/strategic-review",
  "/ai",
  "/settings",
  "/api/export",
];

const publicPaths = [
  "/login",
  "/auth",
  "/pending-approval",
  "/api/admin/notify-pending",
  "/api/auth/check-profile",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPrivate = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isPrivate) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const adminEmail = process.env.OWNER_EMAIL;
  const isAdmin = adminEmail && user.email === adminEmail;

  if (isAdmin) {
    return NextResponse.next();
  }

  const name = user.user_metadata?.full_name ?? user.email ?? "";

  try {
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO profiles (id, email, display_name, approved)
      VALUES (${user.id}, ${user.email}, ${name}, false)
      ON CONFLICT (id) DO UPDATE SET email = ${user.email}, display_name = ${name}
    `;

    const rows = await sql`
      SELECT approved, notified_at FROM profiles WHERE id = ${user.id}
    `;

    const profile = rows[0];

    if (profile?.approved) {
      return NextResponse.next();
    }

    if (!profile?.notified_at && profile?.email === user.email) {
      fetch(
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api/admin/notify-pending`
          : `${new URL(request.url).origin}/api/admin/notify-pending`,
        { method: "POST" },
      ).catch(() => {});
    }
  } catch {
    console.error("proxy: check-profile/neon failed for", user.email);
  }

  return NextResponse.redirect(new URL("/pending-approval", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
