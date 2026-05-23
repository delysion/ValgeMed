import { createServerClient } from "@supabase/ssr";
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
  const host = process.env.VERCEL_URL ?? request.headers.get("host") ?? "valgemed.vercel.app";
  const params = new URLSearchParams({ userId: user.id, email: user.email ?? "", name });

  try {
    const res = await fetch(`https://${host}/api/auth/check-profile?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      const data = await res.json();

      if (data.approved) {
        return NextResponse.next();
      }

      if (!data.notified) {
        fetch(`https://${host}/api/admin/notify-pending`, { method: "POST" }).catch(() => {});
      }
    }
  } catch {
    // block on error
  }

  return NextResponse.redirect(new URL("/pending-approval", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
