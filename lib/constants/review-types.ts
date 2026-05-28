export const REVIEW_TYPES = [
  "flashcard",
  "open_question",
  "feynman",
  "blurting",
  "quiz_prompt",
] as const;

export const STRATEGIC_REVIEW_TYPES = ["weekly", "monthly", "semester"] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number];
export type StrategicReviewType = (typeof STRATEGIC_REVIEW_TYPES)[number];
