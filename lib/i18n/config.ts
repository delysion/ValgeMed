export const languages = ["en", "et"] as const;

export type Locale = (typeof languages)[number];

export const defaultLocale: Locale = "en";
export const languageCookie = "elise_language";

export const languageLabels: Record<Locale, string> = {
  en: "English",
  et: "Eesti",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && languages.includes(value as Locale);
}
