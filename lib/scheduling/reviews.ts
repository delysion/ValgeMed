import { addDays } from "date-fns";

import { clamp } from "@/lib/utils";

const baseReviewSchedule = [1, 3, 7, 14, 30] as const;

export function getNextReviewSchedule(
  confidence: number,
  currentIntervalDays: number,
  timesReviewed = 0,
) {
  const safeConfidence = clamp(confidence);

  if (safeConfidence <= 2) {
    return { intervalDays: 1, dueAt: addDays(new Date(), 1) };
  }

  const scheduleIndex = Math.min(Math.max(0, timesReviewed), baseReviewSchedule.length - 1);
  const intervalDays = Math.max(currentIntervalDays, baseReviewSchedule[scheduleIndex]);
  return { intervalDays, dueAt: addDays(new Date(), intervalDays) };
}
