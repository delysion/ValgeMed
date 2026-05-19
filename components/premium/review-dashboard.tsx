import { format, subDays } from "date-fns";
import { ArrowDown, ArrowUp, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DailyLog, ErrorLog, StudySession, StrategicReview } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function ReviewDashboard({
  dailyLogs,
  errorLogs,
  studySessions,
  strategicReviews,
  t,
}: {
  dailyLogs: DailyLog[];
  errorLogs: ErrorLog[];
  studySessions: StudySession[];
  strategicReviews: StrategicReview[];
  t: (key: string) => string;
}) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todayLog = dailyLogs.find((log) => log.date === todayStr);
  const yesterdayLog = dailyLogs.find((log) => log.date === format(subDays(today, 1), "yyyy-MM-dd"));

  const energyDelta = todayLog && yesterdayLog ? (todayLog.energyLevel ?? 0) - (yesterdayLog.energyLevel ?? 0) : 0;
  const stressDelta = todayLog && yesterdayLog ? (todayLog.stressLevel ?? 0) - (yesterdayLog.stressLevel ?? 0) : 0;

  const unresolved = errorLogs.filter((e) => !e.resolved).length;
  const resolved = errorLogs.filter((e) => e.resolved).length;
  const recurring = errorLogs.filter((e) => !e.resolved && e.recurrenceCount > 0).length;

  const thisWeekSessions = studySessions.filter((s) => s.startedAt >= subDays(today, 7));
  const totalMinutes = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const lastReview = strategicReviews.length > 0 ? strategicReviews[strategicReviews.length - 1] : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReviewStat
          label={t("dashboard.energyIntegrity")}
          value={todayLog?.energyLevel ?? "-"}
          suffix="/10"
          delta={energyDelta}
          tone={todayLog && todayLog.energyLevel != null && todayLog.energyLevel >= 6 ? "emerald" : "danger"}
        />
        <ReviewStat
          label={t("health.stress")}
          value={todayLog?.stressLevel ?? "-"}
          suffix="/10"
          delta={-stressDelta}
          tone={todayLog && todayLog.stressLevel != null && todayLog.stressLevel <= 4 ? "emerald" : "danger"}
        />
        <ReviewStat
          label={t("errors.destroyed")}
          value={resolved}
          delta={recurring > 0 ? -recurring : 1}
          tone={recurring === 0 ? "emerald" : "warning"}
        />
        <ReviewStat
          label={t("study.weeklyOutput")}
          value={totalMinutes}
          suffix=" min"
          tone="cyan"
        />
      </div>

      {lastReview ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h4 className="text-sm font-semibold text-white">{t("nav.strategicReview")}</h4>
          <p className="mt-1 text-xs text-muted-2">{format(lastReview.date, "d MMMM yyyy")}</p>
          {lastReview.nextFocus ? (
            <div className="mt-3 rounded-lg border border-violet/15 bg-violet/[0.04] p-3">
              <p className="text-xs font-medium text-violet">{t("common.nextAction")}</p>
              <p className="mt-1 text-sm text-white">{lastReview.nextFocus}</p>
            </div>
          ) : null}
          {lastReview.wins ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-emerald">Wins</p>
              <p className="mt-1 text-sm text-muted">{lastReview.wins}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {unresolved > 0 ? (
        <div className="rounded-xl border border-danger/15 bg-danger/[0.03] p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-danger" />
            <h4 className="text-sm font-semibold text-white">{unresolved} {t("errors.unresolved").toLowerCase()}</h4>
            {recurring > 0 ? <Badge variant="danger" className="text-[10px]">{recurring} recurring</Badge> : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald/15 bg-emerald/[0.03] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald" />
            <h4 className="text-sm font-semibold text-emerald">{t("errors.errorDestroyed")}</h4>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStat({
  label,
  value,
  suffix = "",
  delta,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: number;
  tone?: "cyan" | "emerald" | "danger" | "warning";
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[10px] text-muted">{label}</p>
      <div className="mt-1 flex items-end gap-1">
        <p className="font-mono text-2xl font-semibold text-white">{value}{suffix}</p>
        {delta != null && delta !== 0 ? (
          <div className={cn("flex items-center pb-1 text-xs", delta > 0 ? "text-emerald" : "text-danger")}>
            {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(delta)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
