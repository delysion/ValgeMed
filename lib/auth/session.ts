import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/auth/constants";

const SESSION_DAYS = 7;

export type OwnerSession = {
  owner: true;
  email: string;
  expiresAt: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET missing or too short. Use at least 32 random characters.",
    );
  }

  return new TextEncoder().encode(secret);
}

export function validateLoginEnvironment() {
  if (!process.env.APP_PASSWORD_HASH) {
    throw new Error("APP_PASSWORD_HASH missing. Generate a bcrypt hash and configure it.");
  }

  getSessionSecret();
}

export async function encryptSession(payload: OwnerSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSessionSecret());
}

export async function decryptSession(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (payload.owner !== true || typeof payload.email !== "string") {
      return null;
    }

    return payload as OwnerSession;
  } catch {
    return null;
  }
}

export async function createOwnerSession(email: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encryptSession({
    owner: true,
    email,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getOwnerSession() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireOwnerSession() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
