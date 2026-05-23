import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const privatePrefixes = [
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

const publicPaths = ["/login", "/auth", "/pending-approval"];

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
    const adminEmail = process.env.OWNER_EMAIL;
    const isAdmin = adminEmail && user.email === adminEmail;

    if (isAdmin) {
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email, approved: true, is_admin: true },
          { onConflict: "id" },
        );
      return response;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", user.id)
      .single();

    if (profile?.approved) {
      return response;
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
