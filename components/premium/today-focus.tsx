import { format } from "date-fns";
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, Brain, Clock, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DailyLog, StudySession, Task } from "@/lib/db/schema";

function energyIcon(level: number | null) {
  if (level == null) return <Battery className="h-4 w-4 text-muted-2" />;
  if (level >= 8) return <BatteryCharging className="h-4 w-4 text-emerald" />;
  if (level >= 6) return <Battery className="h-4 w-4 text-cyan" />;
  if (level >= 4) return <BatteryMedium className="h-4 w-4 text-gold" />;
  return <BatteryLow className="h-4 w-4 text-danger" />;
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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{t("command.todayFocus")}</h3>
        <Badge variant={energyLevel != null && energyLevel >= 6 ? "success" : energyLevel != null && energyLevel >= 4 ? "warning" : "danger"}>
          {energyIcon(energyLevel)}
          <span className="ml-1">{energyLevel ?? "-"}/10</span>
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
          <Clock className="h-4 w-4 text-cyan" />
          <div>
            <p className="font-mono text-lg font-semibold text-white">{totalMinutes}</p>
            <p className="text-[10px] text-muted">min studied</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
          <Brain className="h-4 w-4 text-violet" />
          <div>
            <p className="font-mono text-lg font-semibold text-white">{activeMinutes}</p>
            <p className="text-[10px] text-muted">active recall</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
          <Target className="h-4 w-4 text-rose" />
          <div>
            <p className="font-mono text-lg font-semibold text-white">{criticalTasks.length}</p>
            <p className="text-[10px] text-muted">critical tasks</p>
          </div>
        </div>
      </div>

      {criticalTasks.length > 0 ? (
        <div className="mt-4 space-y-2">
          {criticalTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2 rounded-lg border border-rose/10 bg-rose/[0.03] px-3 py-2">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
              <p className="truncate text-sm text-white">{task.title}</p>
              {task.dueAt ? <span className="ml-auto shrink-0 text-[10px] text-muted-2">{format(task.dueAt, "d MMM")}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
