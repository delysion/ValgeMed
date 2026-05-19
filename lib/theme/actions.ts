"use server";

import { cookies } from "next/headers";
import { themeCookie } from "./config";

export async function setThemeAction(theme: "light" | "dark") {
  const cookieStore = await cookies();
  cookieStore.set(themeCookie, theme, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}
