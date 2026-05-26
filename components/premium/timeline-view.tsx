"use client";

import { useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  GraduationCap,
  Handshake,
  ListTree,
  Radar,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { DailyLog, ErrorLog, Exam, Opportunity, ProfessionalContact, ReviewItem, StudySession, Task } from "@/lib/db/schema";
import {
  buildTimelineCalendarWeeks,
  buildTimelineEvents,
  groupTimelineEventsByDate,
  type TimelineEvent,
} from "@/lib/timeline/events";
import { cn } from "@/lib/utils";

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
  const { t } = useTranslation();
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const events = useMemo(() => buildTimelineEvents({
    exams,
    studySessions,
    reviewItems,
    tasks,
    errorLogs,
    contacts,
    opportunities,
    dailyLogs,
    days,
    now,
    labels: {
      exam: t("timeline.exam"),
      reviewItem: t("timeline.reviewItem"),
      dailyLog: t("timeline.dailyLog"),
      energy: (value) => t("timeline.energy", { value }),
    },
  }), [contacts, dailyLogs, days, errorLogs, exams, now, opportunities, reviewItems, studySessions, t, tasks]);

  const grouped = useMemo(() => groupTimelineEventsByDate(events, now), [events, now]);
  const weeks = useMemo(() => buildTimelineCalendarWeeks(events, month, now), [events, month, now]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-8 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-text-muted" />
        <p className="mt-3 text-sm text-text-secondary">{t("timeline.noEvents", { days })}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList>
        <TabsTrigger value="timeline" className="gap-1.5">
          <ListTree className="h-3.5 w-3.5" />
          {t("timeline.stream")}
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {t("timeline.calendar")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timeline">
        <div className="relative">
          <div className="absolute bottom-0 left-3 top-0 w-px bg-border" />
          <div className="space-y-1">
            {grouped.map((group) =>
              group.events.map((event, index) => {
                const Icon = typeIcons[event.type];
                const isPast = event.date < now;
                const isFirst = group.events.indexOf(event) === 0;

                return (
                  <div key={`${event.title}-${event.type}-${index}`} className={cn("group flex gap-4 py-2 pl-1 transition", isPast && "opacity-40")}>
                    <div className="relative flex flex-col items-center">
                      {isFirst ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-surface ring-1 ring-border">
                          <Icon className={cn("h-3 w-3", event.tone ? typeTones[event.type] : "text-text-muted")} />
                        </div>
                      ) : (
                        <div className={cn("h-1.5 w-1.5 rounded-full", group.isToday ? "bg-cyan ring-2 ring-cyan/20" : "bg-border")} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-3">
                      {isFirst ? (
                        <p className={cn("mb-1 text-xs font-semibold uppercase tracking-[0.1em]", group.isToday ? "text-cyan" : "text-text-muted")}>
                          {group.isToday ? t("timeline.today") : group.label}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-text-primary">{event.title}</p>
                        {event.detail ? <Badge variant="muted" className="shrink-0 text-[10px]">{event.detail}</Badge> : null}
                      </div>
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="calendar">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary">{format(month, "MMMM yyyy")}</h3>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonth((current) => subMonths(current, 1))}
              title={t("timeline.previousMonth")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              title={t("timeline.nextMonth")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
          <div className="grid grid-cols-7 border-b border-border/70 bg-bg-subtle/60">
            {weeks[0].map((day) => (
              <div key={format(day.date, "EEE")} className="px-2 py-2 text-center text-[11px] font-semibold uppercase text-text-muted">
                {format(day.date, "EEE")}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.flat().map((day) => (
              <div
                key={day.dateKey}
                className={cn(
                  "min-h-28 border-b border-r border-border/60 p-2 last:border-r-0",
                  !day.isCurrentMonth && "bg-bg-subtle/35 text-text-muted",
                  day.isToday && "bg-cyan/5 ring-1 ring-inset ring-cyan/25",
                )}
              >
                <div className={cn("text-xs font-semibold", day.isToday ? "text-cyan" : "text-text-secondary")}>
                  {format(day.date, "d")}
                </div>
                <div className="mt-2 space-y-1">
                  {day.events.slice(0, 3).map((event, index) => {
                    const Icon = typeIcons[event.type];
                    return (
                      <div
                        key={`${day.dateKey}-${event.type}-${index}`}
                        className="flex min-w-0 items-center gap-1.5 rounded-md border border-border/60 bg-bg-surface/80 px-1.5 py-1 text-[11px]"
                        title={event.title}
                      >
                        <Icon className={cn("h-3 w-3 shrink-0", typeTones[event.type])} />
                        <span className="truncate text-text-secondary">{event.title}</span>
                      </div>
                    );
                  })}
                  {day.events.length > 3 ? (
                    <p className="text-[11px] font-medium text-text-muted">
                      {t("timeline.moreEvents", { count: day.events.length - 3 })}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
