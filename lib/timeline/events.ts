import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type TimelineEventType = "exam" | "study" | "review" | "task" | "error" | "contact" | "opportunity" | "daily";

export type TimelineEvent = {
  date: Date;
  type: TimelineEventType;
  title: string;
  detail?: string | null;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
};

export type TimelineLabels = {
  exam: string;
  reviewItem: string;
  dailyLog: string;
  energy: (value: string | number) => string;
};

export type TimelineEventInput = {
  exams: Array<{ title: string; examDate?: Date | string | null }>;
  studySessions: Array<{ method: string; durationMinutes: number; startedAt?: Date | string | null }>;
  reviewItems: Array<{ question?: string | null; isActive?: boolean | null; dueAt?: Date | string | null }>;
  tasks: Array<{ title: string; status?: string | null; dueAt?: Date | string | null }>;
  errorLogs: Array<{ title: string; resolved?: boolean | null; retestAt?: Date | string | null }>;
  contacts: Array<{ name: string; role?: string | null; nextFollowUpAt?: Date | string | null }>;
  opportunities: Array<{ title: string; status?: string | null; deadline?: Date | string | null }>;
  dailyLogs: Array<{ date: Date | string; energyLevel?: number | null }>;
  days?: number;
  now?: Date;
  labels: TimelineLabels;
};

export type TimelineDayGroup = {
  date: string;
  label: string;
  isToday: boolean;
  events: TimelineEvent[];
};

export type TimelineCalendarDay = {
  date: Date;
  dateKey: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: TimelineEvent[];
};

function asDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffInDays(date: Date, now: Date) {
  return (startOfDay(date).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24);
}

export function buildTimelineEvents(input: TimelineEventInput): TimelineEvent[] {
  const days = input.days ?? 30;
  const now = input.now ?? new Date();
  const events: TimelineEvent[] = [];

  for (const exam of input.exams) {
    const examDate = asDate(exam.examDate);
    if (!examDate) continue;
    const diff = diffInDays(examDate, now);
    if (diff >= -1 && diff <= days) {
      events.push({ date: examDate, type: "exam", title: exam.title, detail: input.labels.exam, tone: "gold" });
    }
  }

  for (const session of input.studySessions) {
    const startedAt = asDate(session.startedAt);
    if (!startedAt) continue;
    const diff = diffInDays(startedAt, now);
    if (diff >= -days && diff <= days) {
      events.push({ date: startedAt, type: "study", title: session.method.replace("_", " "), detail: `${session.durationMinutes} min`, tone: "cyan" });
    }
  }

  for (const item of input.reviewItems) {
    const dueAt = asDate(item.dueAt);
    if (!dueAt || item.isActive === false) continue;
    const diff = diffInDays(dueAt, now);
    if (diff >= -7 && diff <= days) {
      events.push({ date: dueAt, type: "review", title: item.question?.slice(0, 50) ?? input.labels.reviewItem, tone: "violet" });
    }
  }

  for (const task of input.tasks) {
    const dueAt = asDate(task.dueAt);
    if (!dueAt) continue;
    const diff = diffInDays(dueAt, now);
    if (diff >= -7 && diff <= days) {
      events.push({ date: dueAt, type: "task", title: task.title, detail: task.status, tone: "emerald" });
    }
  }

  for (const error of input.errorLogs) {
    const retestAt = asDate(error.retestAt);
    if (!retestAt || error.resolved) continue;
    const diff = diffInDays(retestAt, now);
    if (diff >= -7 && diff <= days) {
      events.push({ date: retestAt, type: "error", title: error.title, tone: "danger" });
    }
  }

  for (const contact of input.contacts) {
    const nextFollowUpAt = asDate(contact.nextFollowUpAt);
    if (!nextFollowUpAt) continue;
    const diff = diffInDays(nextFollowUpAt, now);
    if (diff >= -7 && diff <= days) {
      events.push({ date: nextFollowUpAt, type: "contact", title: contact.name, detail: contact.role ?? undefined, tone: "rose" });
    }
  }

  for (const opportunity of input.opportunities) {
    const deadline = asDate(opportunity.deadline);
    if (!deadline || ["passed", "archived"].includes(opportunity.status ?? "")) continue;
    const diff = diffInDays(deadline, now);
    if (diff >= -7 && diff <= days) {
      events.push({ date: deadline, type: "opportunity", title: opportunity.title, tone: "cyan" });
    }
  }

  for (const log of input.dailyLogs) {
    const logDate = asDate(log.date);
    if (!logDate) continue;
    const diff = diffInDays(logDate, now);
    if (diff >= -days && diff <= 0) {
      events.push({
        date: logDate,
        type: "daily",
        title: input.labels.dailyLog,
        detail: input.labels.energy(log.energyLevel ?? "-"),
      });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function groupTimelineEventsByDate(events: TimelineEvent[], now = new Date()): TimelineDayGroup[] {
  return events.reduce<TimelineDayGroup[]>((acc, event) => {
    const dateStr = format(event.date, "yyyy-MM-dd");
    const last = acc[acc.length - 1];
    if (!last || last.date !== dateStr) {
      acc.push({
        date: dateStr,
        label: isSameDay(event.date, now) ? "Today" : format(event.date, "EEE d MMM"),
        isToday: isSameDay(event.date, now),
        events: [event],
      });
    } else {
      last.events.push(event);
    }
    return acc;
  }, []);
}

export function buildTimelineCalendarWeeks(events: TimelineEvent[], month: Date, now = new Date()): TimelineCalendarDay[][] {
  const monthStart = startOfMonth(month);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });
  const eventsByDate = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const dateKey = format(event.date, "yyyy-MM-dd");
    eventsByDate.set(dateKey, [...(eventsByDate.get(dateKey) ?? []), event]);
  }

  return Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) =>
    days.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        date,
        dateKey,
        isToday: isSameDay(date, now),
        isCurrentMonth: isSameMonth(date, monthStart),
        events: eventsByDate.get(dateKey) ?? [],
      };
    }),
  );
}
