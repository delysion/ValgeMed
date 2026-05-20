"use client";

import { createContext, useContext } from "react";
import type React from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary, TranslationKey } from "@/lib/i18n/dictionaries/en";

type TranslationContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale,
  dictionary,
  children,
}: TranslationContextValue & { children: React.ReactNode }) {
  return (
    <TranslationContext.Provider value={{ locale, dictionary }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);

  if (!ctx) {
    throw new Error("useTranslation must be used inside TranslationProvider.");
  }

  const { locale, dictionary } = ctx;

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = dictionary[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { locale, t };
}