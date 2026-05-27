"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

export function LanguageSelector({
  label = "Language",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const { locale, changeLocale } = useTranslation();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-bg-subtle p-1"
      )}
      aria-label={label}
    >
      {(["en", "et"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => changeLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            locale === l
              ? "bg-gradient-to-br from-bg-surface to-bg-subtle/40 text-text-primary shadow-sm"
              : "text-text-muted hover:bg-gradient-to-br hover:from-bg-surface hover:to-bg-subtle/40 hover:text-text-secondary",
            compact && "px-2 py-0.5"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
