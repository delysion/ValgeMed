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
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used inside TranslationProvider.");
  }

  return {
    locale: context.locale,
    t(key: TranslationKey) {
      return context.dictionary[key] ?? key;
    },
  };
}
