import { format, isSameDay } from "date-fns";
import { CalendarDays, Circle, Clock, GraduationCap, Handshake, Radar, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DailyLog, ErrorLog, Exam, Opportunity, ProfessionalContact, ReviewItem, StudySession, Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type TimelineEvent = {
  date: Date;
  type: "exam" | "study" | "review" | "task" | "error" | "contact" | "opportunity" | "daily";
  title: string;
  detail?: string | null;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
};

const typeIcons = {
  exam: GraduationCap,
  study: Clock,
  review: CalendarDays,
  task: Target,
  error: Circle,
  contact: Handshake,
  opportunity: Radar,
  daily: CalendarDays,
};

const typeTones: Record<TimelineEvent["type"], string> = {
  exam: "text-gold",
  study: "text-cyan",
  review: "text-violet",
  task: "text-emerald",
  error: "text-danger",
  contact: "text-muted",
  opportunity: "text-cyan",
  daily: "text-muted-2",
};

function buildEvents(input: {
  exams: Exam[];
  studySessions: StudySession[];
  reviewItems: ReviewItem[];
  tasks: Task[];
  errorLogs: ErrorLog[];
  contacts: ProfessionalContact[];
  opportunities: Opportunity[];
  dailyLogs: DailyLog[];
  days?: number;
}): TimelineEvent[] {
  const days = input.days ?? 30;
  const now = new Date();
  const events: TimelineEvent[] = [];

  for (const exam of input.exams) {
    if (exam.examDate) {
      const diff = (exam.examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -1 && diff <= days) {
        events.push({ date: exam.examDate, type: "exam", title: exam.title, detail: "Exam", tone: "gold" });
      }
    }
  }

  for (const session of input.studySessions) {
    if (session.startedAt) {
      const diff = (session.startedAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -days && diff <= days) {
        events.push({ date: session.startedAt, type: "study", title: session.method.replace("_", " "), detail: `${session.durationMinutes} min`, tone: "cyan" });
      }
    }
  }

  for (const item of input.reviewItems) {
    if (item.isActive && item.dueAt) {
      const diff = (item.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -7 && diff <= days) {
        events.push({ date: item.dueAt, type: "review", title: item.question?.slice(0, 50) ?? "Review item", tone: "violet" });
      }
    }
  }

  for (const task of input.tasks) {
    if (task.dueAt) {
      const diff = (task.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -7 && diff <= days) {
        events.push({ date: task.dueAt, type: "task", title: task.title, detail: task.status, tone: "emerald" });
      }
    }
  }

  for (const error of input.errorLogs) {
    if (error.retestAt && !error.resolved) {
      const diff = (error.retestAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -7 && diff <= days) {
        events.push({ date: error.retestAt, type: "error", title: error.title, tone: "danger" });
      }
    }
  }

  for (const contact of input.contacts) {
    if (contact.nextFollowUpAt) {
      const diff = (contact.nextFollowUpAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -7 && diff <= days) {
        events.push({ date: contact.nextFollowUpAt, type: "contact", title: contact.name, detail: contact.role ?? undefined, tone: "rose" });
      }
    }
  }

  for (const opp of input.opportunities) {
    if (opp.deadline && !["passed", "archived"].includes(opp.status)) {
      const deadlineDate = new Date(opp.deadline);
      const diff = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= -7 && diff <= days) {
        events.push({ date: deadlineDate, type: "opportunity", title: opp.title, tone: "cyan" });
      }
    }
  }

  for (const log of input.dailyLogs) {
    const logDate = new Date(log.date);
    const diff = (logDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= -days && diff <= 0) {
      events.push({ date: logDate, type: "daily", title: "Daily log", detail: `Energy: ${log.energyLevel ?? "-"}`, tone: undefined });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function TimelineView({
  exams,
  studySessions,
  reviewItems,
  tasks,
  errorLogs,
  contacts,
  opportunities,
  dailyLogs,
  days = 30,
}: {
  exams: Exam[];
  studySessions: StudySession[];
  reviewItems: ReviewItem[];
  tasks: Task[];
  errorLogs: ErrorLog[];
  contacts: ProfessionalContact[];
  opportunities: Opportunity[];
  dailyLogs: DailyLog[];
  days?: number;
}) {
  const events = buildEvents({ exams, studySessions, reviewItems, tasks, errorLogs, contacts, opportunities, dailyLogs, days });

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-muted-2" />
        <p className="mt-3 text-sm text-muted">No events in the next {days} days.</p>
      </div>
    );
  }

  const grouped = events.reduce<Array<{ date: string; label: string; isToday: boolean; events: TimelineEvent[] }>>((acc, event) => {
    const dateStr = format(event.date, "yyyy-MM-dd");
    const last = acc[acc.length - 1];
    if (!last || last.date !== dateStr) {
      acc.push({
        date: dateStr,
        label: isSameDay(event.date, new Date()) ? "Today" : format(event.date, "EEE d MMM"),
        isToday: isSameDay(event.date, new Date()),
        events: [event],
      });
    } else {
      last.events.push(event);
    }
    return acc;
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.06]" />
      <div className="space-y-1">
        {grouped.map((group) =>
          group.events.map((event, index) => {
            const Icon = typeIcons[event.type];
            const isPast = event.date < new Date();
            const isFirst = group.events.indexOf(event) === 0;

            return (
              <div key={`${event.title}-${index}`} className={cn("group flex gap-4 py-2 pl-1 transition", isPast && "opacity-40")}>
                <div className="relative flex flex-col items-center">
                  {isFirst ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-white/15">
                      <Icon className={cn("h-3 w-3", event.tone ? typeTones[event.type] : "text-muted-2")} />
                    </div>
                  ) : (
                    <div className={cn("h-1.5 w-1.5 rounded-full", group.isToday ? "bg-cyan ring-2 ring-cyan/20" : "bg-white/[0.15]")} />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  {isFirst ? (
                    <p className={cn("mb-1 text-xs font-semibold uppercase tracking-[0.1em]", group.isToday ? "text-cyan" : "text-muted-2")}>
                      {group.label}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">{event.title}</p>
                    {event.detail ? <Badge variant="muted" className="shrink-0 text-[10px]">{event.detail}</Badge> : null}
                  </div>
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
