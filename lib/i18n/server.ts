import { defaultLocale, isLocale, languageCookie, type Locale } from "@/lib/i18n/config";
import { en, type TranslationKey } from "@/lib/i18n/dictionaries/en";
import { et } from "@/lib/i18n/dictionaries/et";

export const dictionaries = { en, et } as const;

export function getLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const saved = localStorage.getItem(languageCookie);
  if (isLocale(saved)) {
    return saved;
  }
  return defaultLocale;
}

export async function getI18n() {
  let locale: Locale;

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(languageCookie)?.value;
    locale = isLocale(localeCookie) ? localeCookie : defaultLocale;
  } else {
    const saved = localStorage.getItem(languageCookie);
    locale = isLocale(saved) ? saved : defaultLocale;
  }

  const dictionary = getDictionary(locale);

  return {
    locale,
    dictionary,
    t(key: TranslationKey, params?: Record<string, string | number>): string {
      let text = dictionary[key] ?? en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
  };
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
