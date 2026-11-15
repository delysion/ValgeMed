import { describe, expect, it } from "vitest";

import { tallinnDate } from "@/lib/dates";
import { progressionLevel } from "@/lib/scoring/progression";
import { navigationSectionForPath } from "@/components/navigation-config";

describe("Command UX", () => {
  it("uses Tallinn midnight in winter and summer", () => {
    expect(tallinnDate(new Date("2026-01-01T22:00:00Z"))).toBe("2026-01-02");
    expect(tallinnDate(new Date("2026-06-01T20:59:59Z"))).toBe("2026-06-01");
    expect(tallinnDate(new Date("2026-06-01T21:00:00Z"))).toBe("2026-06-02");
  });

  it("uses cumulative XP and reaches the final archetype", () => {
    expect(progressionLevel(0)).toEqual({ level: 1, xp: 0, xpToNext: 60 });
    expect(progressionLevel(625)).toEqual({ level: 11, xp: 25, xpToNext: 60 });
    expect(progressionLevel(5940)).toEqual({ level: 100, xp: 60, xpToNext: 60 });
  });

  it("groups presentation routes consistently across viewports", () => {
    expect(navigationSectionForPath("/performance-blockers")).toBe("nav.sectionCommand");
    expect(navigationSectionForPath("/daily-log")).toBe("nav.sectionCommand");
    expect(navigationSectionForPath("/exams/exam-id")).toBe("nav.sectionStudy");
    expect(navigationSectionForPath("/research/manuscripts")).toBe("nav.sectionResearch");
  });
});
