import { differenceInCalendarDays, startOfToday } from "date-fns";
import { describe, expect, it } from "vitest";

import { getNextReviewSchedule } from "@/lib/scheduling/reviews";

describe("review scheduling", () => {
  it("uses the document base cadence after successful reviews", () => {
    const first = getNextReviewSchedule(7, 1, 1);
    const second = getNextReviewSchedule(7, 3, 2);
    const third = getNextReviewSchedule(7, 7, 3);

    expect(first.intervalDays).toBe(3);
    expect(second.intervalDays).toBe(7);
    expect(third.intervalDays).toBe(14);
  });

  it("repeats tomorrow when confidence is very low", () => {
    const result = getNextReviewSchedule(1, 14, 4);

    expect(result.intervalDays).toBe(1);
    expect(differenceInCalendarDays(result.dueAt, startOfToday())).toBe(1);
  });
});
