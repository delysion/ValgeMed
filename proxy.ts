import { createServerClient } from "@supabase/ssr";
import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextRequest } from "next/server";

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

const publicPaths = ["/login", "/auth", "/pending-approval", "/api/admin/notify-pending"];

const db = () => neon(process.env.DATABASE_URL!);

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

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sql = db();
    const adminEmail = process.env.OWNER_EMAIL;
    const isAdmin = adminEmail && user.email === adminEmail;

    if (isAdmin) {
      await sql.query(
        `INSERT INTO profiles (id, email, approved, is_admin)
         VALUES ($1, $2, true, true)
         ON CONFLICT (id) DO UPDATE SET email = $2, approved = true, is_admin = true`,
        [user.id, user.email],
      );
      return response;
    }

    const rows = await sql.query(
      "SELECT approved, notified_at FROM profiles WHERE id = $1",
      [user.id],
    );

    let profile = rows[0];

    if (!profile) {
      await sql.query(
        "INSERT INTO profiles (id, email, approved) VALUES ($1, $2, false) ON CONFLICT (id) DO NOTHING",
        [user.id, user.email],
      );
      profile = { approved: false, notified_at: null };
    }

    if (profile.approved) {
      return response;
    }

    if (!profile.notified_at) {
      await sql.query(
        "UPDATE profiles SET notified_at = NOW() WHERE id = $1",
        [user.id],
      );

      const origin = new URL(request.url).origin;
      fetch(`${origin}/api/admin/notify-pending`, { method: "POST" }).catch(() => {});
    }

    const pendingUrl = new URL("/pending-approval", request.url);
    return NextResponse.redirect(pendingUrl);
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
