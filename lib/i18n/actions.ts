"use server";

import { cookies } from "next/headers";

import { isLocale, languageCookie, type Locale } from "@/lib/i18n/config";

export async function setLanguageAction(locale: Locale) {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(languageCookie, locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
