import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  buildTimelineCalendarWeeks,
  buildTimelineEvents,
  groupTimelineEventsByDate,
} from "@/lib/timeline/events";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("timeline calendar events", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  it("builds sorted events and filters out inactive or out-of-window records", () => {
    const events = buildTimelineEvents({
      days: 30,
      now,
      labels: {
        exam: "Exam",
        reviewItem: "Review item",
        dailyLog: "Daily log",
        energy: (value) => `Energy: ${value}`,
      },
      exams: [
        { title: "Biochemistry final", examDate: new Date("2026-06-10T09:00:00Z") },
      ],
      studySessions: [
        { method: "active_recall", durationMinutes: 45, startedAt: new Date("2026-05-24T10:00:00Z") },
        { method: "old", durationMinutes: 20, startedAt: new Date("2026-04-01T10:00:00Z") },
      ],
      reviewItems: [
        { question: "Explain preload", isActive: true, dueAt: new Date("2026-05-27T08:00:00Z") },
        { question: "Inactive card", isActive: false, dueAt: new Date("2026-05-27T08:00:00Z") },
      ],
      tasks: [
        { title: "Submit anatomy notes", status: "todo", dueAt: new Date("2026-05-28T08:00:00Z") },
      ],
      errorLogs: [
        { title: "Retest contraindications", resolved: false, retestAt: new Date("2026-05-29T08:00:00Z") },
        { title: "Resolved error", resolved: true, retestAt: new Date("2026-05-29T08:00:00Z") },
      ],
      contacts: [
        { name: "Dr. Kask", role: "mentor", nextFollowUpAt: new Date("2026-05-30T08:00:00Z") },
      ],
      opportunities: [
        { title: "Research deadline", status: "active", deadline: "2026-06-01" },
        { title: "Archived opportunity", status: "archived", deadline: "2026-06-01" },
      ],
      dailyLogs: [
        { date: "2026-05-26", energyLevel: 7 },
      ],
    });

    expect(events.map((event) => event.type)).toEqual([
      "study",
      "daily",
      "review",
      "task",
      "error",
      "contact",
      "opportunity",
      "exam",
    ]);
    expect(events.map((event) => event.title)).not.toContain("Inactive card");
    expect(events.map((event) => event.title)).not.toContain("Resolved error");
    expect(events.map((event) => event.title)).not.toContain("Archived opportunity");
  });

  it("groups events by date and creates stable month calendar weeks", () => {
    const events = [
      { date: new Date("2026-05-26T08:00:00Z"), type: "daily" as const, title: "Daily log" },
      { date: new Date("2026-05-26T10:00:00Z"), type: "review" as const, title: "Review" },
      { date: new Date("2026-06-01T09:00:00Z"), type: "exam" as const, title: "Exam" },
    ];

    const grouped = groupTimelineEventsByDate(events, now);
    const weeks = buildTimelineCalendarWeeks(events, new Date("2026-05-01T00:00:00Z"), now);
    const may26 = weeks.flat().find((day) => day.dateKey === "2026-05-26");

    expect(grouped[0]).toMatchObject({ date: "2026-05-26", isToday: true });
    expect(grouped[0].events).toHaveLength(2);
    expect(weeks.length).toBeGreaterThanOrEqual(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(may26?.isCurrentMonth).toBe(true);
    expect(may26?.events.map((event) => event.title)).toEqual(["Daily log", "Review"]);
  });

  it("uses targeted timeline data and exposes a tabbed calendar view", () => {
    const page = source("app", "timeline", "page.tsx");
    const queries = source("lib", "data", "queries.ts");
    const view = source("components", "premium", "timeline-view.tsx");

    expect(page).toContain("getTimelinePageData(user.id)");
    expect(page).not.toContain("getCoreData");
    expect(queries).toContain("export type TimelinePageData");
    expect(queries).toContain("getTimelinePageData");
    expect(view).toContain("TabsTrigger");
    expect(view).toContain("buildTimelineCalendarWeeks");
    expect(view).toContain("timeline.calendar");
  });
});
