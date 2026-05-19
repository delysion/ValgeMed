import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";

const privatePrefixes = [
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
  "/life-admin",
  "/portfolio",
  "/strategic-review",
  "/ai",
  "/settings",
  "/api/export",
];

async function hasValidSession(token?: string) {
  if (!token || !process.env.SESSION_SECRET) {
    return false;
  }

  try {
    const key = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.owner === true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isPrivate) {
    return NextResponse.next();
  }

  const validSession = await hasValidSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (validSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/command/:path*",
    "/dashboard/:path*",
    "/elite-index/:path*",
    "/subjects/:path*",
    "/exams/:path*",
    "/topics/:path*",
    "/study/:path*",
    "/study-sessions/:path*",
    "/reviews/:path*",
    "/errors/:path*",
    "/daily-log/:path*",
    "/goals/:path*",
    "/identity/:path*",
    "/tartu/:path*",
    "/time/:path*",
    "/health/:path*",
    "/language/:path*",
    "/reputation/:path*",
    "/opportunities/:path*",
    "/network/:path*",
    "/life-admin/:path*",
    "/portfolio/:path*",
    "/strategic-review/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/api/export/:path*",
  ],
};
