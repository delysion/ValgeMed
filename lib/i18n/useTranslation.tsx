"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type React from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary, TranslationKey } from "@/lib/i18n/dictionaries/en";
import { setLanguageAction } from "@/lib/i18n/actions";

type TranslationContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  changeLocale: (locale: Locale) => void;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale: initialLocale,
  dictionary: initialDictionary,
  dictionaries,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  dictionaries: Record<Locale, Dictionary>;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary);

  const changeLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;
    
    // Instant client-side switch
    setLocale(newLocale);
    setDictionary(dictionaries[newLocale]);
    
    // Sync cookie in background
    setLanguageAction(newLocale).catch(() => {});
    
    // Also sync localStorage
    try {
      localStorage.setItem("locale", newLocale);
    } catch {}
  }, [locale, dictionaries]);

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = dictionary[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return (
    <TranslationContext.Provider value={{ locale, dictionary, t, changeLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);

  if (!ctx) {
    throw new Error("useTranslation must be used inside TranslationProvider.");
  }

  return ctx;
}
