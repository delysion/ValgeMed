"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLanguageAction } from "@/lib/i18n/actions";
import { languageCookie, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSelector({
  current,
  label = "Language",
  compact = false,
}: {
  current: Locale;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeLanguage(locale: Locale) {
    startTransition(async () => {
      await setLanguageAction(locale);
      try {
        localStorage.setItem(languageCookie, locale);
      } catch {
        // localStorage is a convenience fallback only.
      }
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-bg-subtle p-1",
        pending && "opacity-70",
      )}
      aria-label={label}
    >
      {(["en", "et"] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => changeLanguage(locale)}
          disabled={pending}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            current === locale
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-muted hover:bg-white hover:text-text-secondary",
            compact && "px-2 py-0.5",
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
