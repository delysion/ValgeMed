import { differenceInDays, format } from "date-fns";
import { CalendarClock } from "lucide-react";

import type { Exam } from "@/lib/db/schema";

export function ExamCountdown({ exam }: { exam: Exam }) {
  if (!exam.examDate) return null;

  const daysLeft = differenceInDays(exam.examDate, new Date());
  const isUrgent = daysLeft <= 7;
  const isWarning = daysLeft <= 14;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isUrgent ? "bg-danger/10 text-danger" : isWarning ? "bg-gold/10 text-gold" : "bg-cyan/10 text-cyan"}`}>
        <CalendarClock className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{exam.title}</p>
        <p className="text-xs text-muted">{format(exam.examDate, "d MMMM yyyy")}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-mono text-2xl font-semibold ${isUrgent ? "text-danger" : isWarning ? "text-gold" : "text-white"}`}>{daysLeft}</p>
        <p className="text-[10px] text-muted-2">{daysLeft === 1 ? "day" : "days"}</p>
      </div>
    </div>
  );
}
