import { cookies } from "next/headers";
import { defaultLocale, isLocale, languageCookie, type Locale } from "@/lib/i18n/config";
import { en, type TranslationKey } from "@/lib/i18n/dictionaries/en";
import { getDictionary } from "@/lib/i18n/server";

export async function getI18n() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(languageCookie)?.value;
  const locale: Locale = isLocale(localeCookie) ? localeCookie : defaultLocale;
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
