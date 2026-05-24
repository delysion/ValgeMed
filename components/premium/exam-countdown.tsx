"use client";

import { differenceInDays, format } from "date-fns";
import { CalendarClock } from "lucide-react";

import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Exam } from "@/lib/db/schema";

export function ExamCountdown({ exam }: { exam: Exam }) {
  const { t } = useTranslation();
  if (!exam.examDate) return null;

  const daysLeft = differenceInDays(exam.examDate, new Date());
  const isUrgent = daysLeft <= 7;
  const isWarning = daysLeft <= 14;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-gradient-to-r from-bg-surface to-bg-subtle/30 p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isUrgent ? "bg-rose-bg text-rose" : isWarning ? "bg-gold-bg text-gold" : "bg-cyan-bg text-cyan"}`}>
        <CalendarClock className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text-primary">{exam.title}</p>
        <p className="text-xs text-text-secondary">{format(exam.examDate, "d MMMM yyyy")}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-mono text-2xl font-semibold ${isUrgent ? "text-rose" : isWarning ? "text-gold" : "text-text-primary"}`}>{daysLeft}</p>
        <p className="text-[10px] text-text-muted">{daysLeft === 1 ? t("common.day") : t("common.days")}</p>
      </div>
    </div>
  );
}
