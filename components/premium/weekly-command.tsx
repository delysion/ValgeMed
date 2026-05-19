import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { DailyLog, StudySession } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function WeeklyCommandPanel({
  dailyLogs,
  studySessions,
  t,
}: {
  dailyLogs: DailyLog[];
  studySessions: StudySession[];
  t: (key: string) => string;
}) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

  const thisWeekLogs = dailyLogs.filter((log) => {
    const d = new Date(log.date);
    return d >= weekStart && d <= weekEnd;
  });
  const lastWeekLogs = dailyLogs.filter((log) => {
    const d = new Date(log.date);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  const thisWeekMinutes = thisWeekLogs.reduce((sum, log) => sum + (log.studyMinutes ?? 0), 0);
  const lastWeekMinutes = lastWeekLogs.reduce((sum, log) => sum + (log.studyMinutes ?? 0), 0);
  const trend = lastWeekMinutes === 0 ? 0 : ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100;

  const thisWeekSessions = studySessions.filter((s) => s.startedAt >= weekStart && s.startedAt <= weekEnd);
  const activeSessions = thisWeekSessions.filter((s) => ["active_recall", "quiz", "simulation", "error_review"].includes(s.method));
  const activeRatio = thisWeekSessions.length === 0 ? 0 : (activeSessions.length / thisWeekSessions.length) * 100;

  const avgEnergy = thisWeekLogs.length === 0 ? 0 : thisWeekLogs.reduce((sum, log) => sum + (log.energyLevel ?? 0), 0) / thisWeekLogs.length;
  const avgSleep = thisWeekLogs.length === 0 ? 0 : thisWeekLogs.reduce((sum, log) => sum + (log.sleepHours ?? 0), 0) / thisWeekLogs.length;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const logDates = new Set(thisWeekLogs.map((log) => log.date));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{t("command.weeklyCommand")}</h3>
        <Badge variant={trend >= 0 ? "success" : "danger"} className="text-[10px]">
          {trend >= 0 ? "+" : ""}{trend.toFixed(0)}% vs last week
        </Badge>
      </div>

      <div className="mb-4 flex gap-1">
        {days.map((day, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          const dateStr = format(date, "yyyy-MM-dd");
          const hasLog = logDates.has(dateStr);
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={cn("h-7 w-full rounded transition", hasLog ? "bg-cyan/15" : "bg-white/[0.04]", isToday && "ring-1 ring-cyan/30")} />
              <span className={cn("text-[10px]", isToday ? "text-cyan" : "text-muted-2")}>{day.slice(0, 2)}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Study" value={`${thisWeekMinutes} min`} />
        <Stat label="Active ratio" value={`${activeRatio.toFixed(0)}%`} />
        <Stat label="Avg energy" value={avgEnergy.toFixed(1)} />
        <Stat label="Avg sleep" value={`${avgSleep.toFixed(1)}h`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
