"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold text-text-primary">{t("error.somethingWrong")}</h2>
      <p className="text-sm text-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-gradient-to-br from-primary to-primary-ring px-5 py-2.5 text-sm font-semibold text-white"
      >
        {t("error.retry")}
      </button>
    </div>
  );
}
