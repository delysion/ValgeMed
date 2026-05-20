import { format } from "date-fns";
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, Brain, Clock, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DailyLog, StudySession, Task } from "@/lib/db/schema";

function energyIcon(level: number | null) {
  if (level == null) return <Battery className="h-4 w-4 text-text-muted" />;
  if (level >= 8) return <BatteryCharging className="h-4 w-4 text-emerald" />;
  if (level >= 6) return <Battery className="h-4 w-4 text-cyan" />;
  if (level >= 4) return <BatteryMedium className="h-4 w-4 text-gold" />;
  return <BatteryLow className="h-4 w-4 text-rose" />;
}

export function TodayFocusCard({
  todayLog,
  todaySessions,
  todayTasks,
  t,
}: {
  todayLog: DailyLog | null;
  todaySessions: StudySession[];
  todayTasks: Task[];
  t: (key: string) => string;
}) {
  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const activeMinutes = todaySessions
    .filter((s) => ["active_recall", "quiz", "simulation", "error_review"].includes(s.method))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const criticalTasks = todayTasks.filter((t) => t.priority >= 8 && t.status !== "done");
  const energyLevel = todayLog?.energyLevel ?? null;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-violet-bg/20 p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">{t("command.todayFocus")}</h3>
        <Badge variant={energyLevel != null && energyLevel >= 6 ? "success" : energyLevel != null && energyLevel >= 4 ? "warning" : "danger"}>
          {energyIcon(energyLevel)}
          <span className="ml-1">{energyLevel ?? "-"}/10</span>
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
          <Clock className="h-4 w-4 text-cyan" />
          <div>
            <p className="font-mono text-lg font-semibold text-text-primary">{totalMinutes}</p>
            <p className="text-[10px] text-text-secondary">min studied</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
          <Brain className="h-4 w-4 text-violet" />
          <div>
            <p className="font-mono text-lg font-semibold text-text-primary">{activeMinutes}</p>
            <p className="text-[10px] text-text-secondary">active recall</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
          <Target className="h-4 w-4 text-rose" />
          <div>
            <p className="font-mono text-lg font-semibold text-text-primary">{criticalTasks.length}</p>
            <p className="text-[10px] text-text-secondary">critical tasks</p>
          </div>
        </div>
      </div>

      {criticalTasks.length > 0 ? (
        <div className="mt-4 space-y-2">
          {criticalTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2 rounded-lg border border-rose/20 bg-rose-bg px-3 py-2">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
              <p className="truncate text-sm text-text-primary">{task.title}</p>
              {task.dueAt ? <span className="ml-auto shrink-0 text-[10px] text-text-muted">{format(task.dueAt, "d MMM")}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
