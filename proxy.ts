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

const publicPaths = [
  "/login",
  "/reset-password",
  "/auth",
  "/pending-approval",
  "/api/admin/notify-pending",
  "/api/admin/check-status",
  "/api/auth/check-profile",
];

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

  if (publicPaths.some((path) => actualPathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPrivate = privatePrefixes.some(
    (prefix) => actualPathname === prefix || actualPathname.startsWith(`${prefix}/`),
  );

  if (!isPrivate) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

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

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const adminEmail = process.env.OWNER_EMAIL;
  if (adminEmail && user.email === adminEmail) {
    return response;
  }

  const name = user.user_metadata?.full_name ?? user.email ?? "";

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      INSERT INTO profiles (id, email, display_name, approved)
      VALUES (${user.id}, ${user.email ?? ""}, ${name}, false)
      ON CONFLICT (id) DO UPDATE SET email = ${user.email ?? ""}, display_name = ${name}
      RETURNING approved, notified_at
    `;

    const profile = rows[0];

    if (profile?.approved) {
      return response;
    }

    if (!profile?.notified_at) {
      fetch(`${request.nextUrl.origin}/api/admin/notify-pending`, { method: "POST" }).catch(() => {});
    }
  } catch {
    // block non-approved users on error
  }

  return NextResponse.redirect(new URL("/pending-approval", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
