import "server-only";

import { cookies } from "next/headers";

import { defaultLocale, isLocale, languageCookie, type Locale } from "@/lib/i18n/config";
import { en, type TranslationKey } from "@/lib/i18n/dictionaries/en";
import { et } from "@/lib/i18n/dictionaries/et";

const dictionaries = { en, et } as const;

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(languageCookie)?.value;
    return isLocale(value) ? value : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export async function getI18n() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return {
    locale,
    dictionary,
    t(key: TranslationKey) {
      return dictionary[key] ?? en[key] ?? key;
    },
  };
}
