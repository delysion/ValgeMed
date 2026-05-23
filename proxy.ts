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

  // Extract the actual path from _next/data RSC requests
  let actualPathname = pathname;
  const rscMatch = pathname.match(/^\/_next\/data\/[^/]+\/(.+)\.json$/);
  if (rscMatch) {
    actualPathname = `/${rscMatch[1]}`;
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

  let response = NextResponse.next();

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
  const isAdmin = adminEmail && user.email === adminEmail;

  if (isAdmin) {
    return response;
  }

  // Bypass: if user was manually approved by admin (cookie), let them through.
  // Otherwise block until approved by admin.
  const name = user.user_metadata?.full_name ?? user.email ?? "";
  const params = new URLSearchParams({ userId: user.id, email: user.email ?? "", name });

  try {
    const res = await fetch(`https://valgemed.vercel.app/api/auth/check-profile?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      const data = await res.json() as { approved?: boolean; notified?: boolean };

      if (data.approved) {
        return response;
      }

      if (!data.notified) {
        fetch(`https://valgemed.vercel.app/api/admin/notify-pending`, { method: "POST" }).catch(() => {});
      }
    }
  } catch {
    // block non-approved users
  }

  return NextResponse.redirect(new URL("/pending-approval", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
