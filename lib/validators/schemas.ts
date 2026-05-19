import { z } from "zod";

export const examFormats = [
  "written",
  "oral",
  "practical",
  "osce",
  "mixed",
  "unknown",
] as const;

export const topicStatuses = [
  "not_started",
  "first_exposure",
  "understood",
  "recalled",
  "practiced",
  "error_corrected",
  "consolidated",
  "exam_ready",
] as const;

export const studyMethods = [
  "reading",
  "active_recall",
  "quiz",
  "simulation",
  "error_review",
  "notes",
  "mixed",
] as const;

export const reviewTypes = [
  "flashcard",
  "open_question",
  "feynman",
  "blurting",
  "quiz_prompt",
] as const;

export const errorTypes = [
  "memory",
  "concept",
  "distraction",
  "anxiety",
  "time",
  "language",
  "method",
  "interpretation",
  "calculation",
  "other",
] as const;

export const goalTypes = [
  "daily",
  "weekly",
  "monthly",
  "semester",
  "identity",
  "health",
  "language",
  "exam",
] as const;

export const goalStatuses = ["active", "completed", "paused", "archived"] as const;
export const taskStatuses = ["todo", "doing", "done", "archived"] as const;

export const identityCategories = [
  "professional_identity",
  "discipline",
  "image",
  "boundaries",
  "ambition",
  "tartu_life",
  "language",
  "personal_standard",
] as const;

export const tartuNoteCategories = [
  "estonian",
  "tartu_life",
  "academic_culture",
  "medicine_dentistry_requirements",
  "documents",
  "housing",
  "routine",
] as const;

export const timeBlockTypes = [
  "study",
  "review",
  "simulation",
  "recovery",
  "life_admin",
  "language",
  "opportunity",
] as const;

export const languages = ["estonian", "latin", "english"] as const;

export const reputationEventTypes = [
  "helped_someone",
  "excellent_work",
  "presentation",
  "project",
  "exam_result",
  "recommendation",
  "reliability_signal",
  "leadership_signal",
  "precise_question_after_lecture",
] as const;

export const opportunityTypes = [
  "research",
  "internship",
  "shadowing",
  "conference",
  "scholarship",
  "volunteering",
  "student_org",
  "mentorship",
  "clinical_exposure",
  "language_course",
  "other",
] as const;

export const opportunityStatuses = [
  "watching",
  "active",
  "applied",
  "won",
  "passed",
  "archived",
] as const;

export const lifeAdminCategories = [
  "documents",
  "housing",
  "finance",
  "health",
  "university",
  "travel",
  "other",
] as const;

export const portfolioItemTypes = [
  "exam_result",
  "project",
  "presentation",
  "certificate",
  "research",
  "volunteering",
  "reflection",
  "other",
] as const;

export const portfolioStatuses = ["draft", "active", "archived"] as const;
export const strategicReviewTypes = ["weekly", "monthly", "semester"] as const;

const emptyToNull = (value: unknown) => {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
};

const nullableText = z.preprocess(emptyToNull, z.string().trim().nullable());
const nullableShortText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable());
const nullableDate = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}, z.date().nullable());
const nullableDateString = z.preprocess(
  emptyToNull,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
);

export const idSchema = z.string().uuid();
export const scoreSchema = z.coerce.number().int().min(0).max(10);
const nullableScoreSchema = z.preprocess(emptyToNull, scoreSchema.nullable());
const positiveInt = z.coerce.number().int().min(0);
const positiveNumber = z.coerce.number().min(0);
const nullablePositiveNumber = z.preprocess(emptyToNull, positiveNumber.nullable());

export const subjectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  code: nullableShortText(40),
  description: nullableText,
  color: nullableShortText(40),
  difficulty: scoreSchema.default(0),
  importance: scoreSchema.default(0),
});

export const examSchema = z.object({
  subjectId: idSchema,
  title: z.string().trim().min(1).max(220),
  examDate: nullableDate,
  ects: nullablePositiveNumber,
  format: z.enum(examFormats).default("unknown"),
  difficulty: scoreSchema.default(0),
  importance: scoreSchema.default(0),
  notes: nullableText,
});

export const topicSchema = z.object({
  subjectId: idSchema,
  examId: z.preprocess(emptyToNull, idSchema.nullable()),
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  status: z.enum(topicStatuses).default("not_started"),
  difficulty: scoreSchema.default(0),
  priority: scoreSchema.default(0),
  confidence: scoreSchema.default(0),
  lastStudiedAt: nullableDate,
  nextReviewAt: nullableDate,
});

export const studySessionSchema = z.object({
  subjectId: idSchema,
  topicId: z.preprocess(emptyToNull, idSchema.nullable()),
  examId: z.preprocess(emptyToNull, idSchema.nullable()),
  startedAt: z.preprocess((value) => new Date(String(value)), z.date()),
  endedAt: nullableDate,
  durationMinutes: positiveInt,
  method: z.enum(studyMethods).default("mixed"),
  focusLevel: scoreSchema.default(0),
  energyLevel: scoreSchema.default(0),
  outputQuality: scoreSchema.default(0),
  notes: nullableText,
});

export const reviewItemSchema = z.object({
  subjectId: idSchema,
  topicId: z.preprocess(emptyToNull, idSchema.nullable()),
  question: z.string().trim().min(1),
  answer: nullableText,
  reviewType: z.enum(reviewTypes).default("flashcard"),
  confidence: scoreSchema.default(0),
  intervalDays: positiveInt.default(1),
  dueAt: z.preprocess((value) => new Date(String(value)), z.date()),
  isActive: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
});

export const reviewResultSchema = z.object({
  id: idSchema,
  confidence: scoreSchema,
});

export const errorLogSchema = z.object({
  subjectId: idSchema,
  topicId: z.preprocess(emptyToNull, idSchema.nullable()),
  examId: z.preprocess(emptyToNull, idSchema.nullable()),
  title: z.string().trim().min(1).max(220),
  description: z.string().trim().min(1),
  errorType: z.enum(errorTypes).default("other"),
  cause: nullableText,
  correction: nullableText,
  preventionRule: nullableText,
  retestAt: nullableDate,
  resolved: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  severity: scoreSchema.default(0),
  recurrenceCount: positiveInt.default(0),
});

export const quizAttemptSchema = z
  .object({
    subjectId: idSchema,
    topicId: z.preprocess(emptyToNull, idSchema.nullable()),
    examId: z.preprocess(emptyToNull, idSchema.nullable()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    totalQuestions: z.coerce.number().int().min(1),
    correctAnswers: z.coerce.number().int().min(0),
    notes: nullableText,
  })
  .refine((value) => value.correctAnswers <= value.totalQuestions, {
    message: "Correct answers cannot exceed total questions.",
    path: ["correctAnswers"],
  })
  .transform((value) => ({
    ...value,
    scorePercent: (value.correctAnswers / value.totalQuestions) * 100,
  }));

export const dailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleepHours: nullablePositiveNumber,
  energyLevel: nullableScoreSchema,
  stressLevel: nullableScoreSchema,
  moodLevel: nullableScoreSchema,
  studyMinutes: positiveInt.default(0),
  activeRecallMinutes: positiveInt.default(0),
  passiveStudyMinutes: positiveInt.default(0),
  movementDone: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  notes: nullableText,
});

export const goalSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  goalType: z.enum(goalTypes).default("daily"),
  targetDate: nullableDateString,
  status: z.enum(goalStatuses).default("active"),
  priority: scoreSchema.default(0),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  dueAt: nullableDate,
  status: z.enum(taskStatuses).default("todo"),
  priority: scoreSchema.default(0),
  relatedSubjectId: z.preprocess(emptyToNull, idSchema.nullable()),
  relatedExamId: z.preprocess(emptyToNull, idSchema.nullable()),
  relatedTopicId: z.preprocess(emptyToNull, idSchema.nullable()),
});

export const identityNoteSchema = z.object({
  title: z.string().trim().min(1).max(220),
  content: z.string().trim().min(1),
  category: z.enum(identityCategories).default("professional_identity"),
});

export const tartuNoteSchema = z.object({
  title: z.string().trim().min(1).max(220),
  content: z.string().trim().min(1),
  category: z.enum(tartuNoteCategories).default("tartu_life"),
  priority: scoreSchema.default(0),
  status: z.enum(taskStatuses).default("todo"),
});

export const timeBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1).max(220),
  blockType: z.enum(timeBlockTypes).default("study"),
  plannedMinutes: positiveInt.default(0),
  actualMinutes: positiveInt.default(0),
  energyCost: scoreSchema.default(0),
  leverageScore: scoreSchema.default(0),
  notes: nullableText,
});

export const healthLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleepQuality: nullableScoreSchema,
  cognitiveFatigue: nullableScoreSchema,
  recoveryQuality: nullableScoreSchema,
  foodQuality: nullableScoreSchema,
  movementDone: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  energyIntegrityScore: scoreSchema.default(0),
  notes: nullableText,
});

export const languageProgressSchema = z.object({
  language: z.enum(languages).default("estonian"),
  title: z.string().trim().min(1).max(220),
  category: nullableShortText(120),
  minutes: positiveInt.default(0),
  confidence: scoreSchema.default(0),
  lastPracticedAt: nullableDate,
  nextPracticeAt: nullableDate,
  notes: nullableText,
});

export const reputationEventSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  eventType: z.enum(reputationEventTypes).default("reliability_signal"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  impact: scoreSchema.default(0),
  evidenceUrl: nullableText,
  followUpAt: nullableDate,
  status: z.enum(taskStatuses).default("done"),
});

export const opportunitySchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  opportunityType: z.enum(opportunityTypes).default("other"),
  deadline: nullableDateString,
  valueScore: scoreSchema.default(0),
  effortScore: scoreSchema.default(0),
  strategicUpside: scoreSchema.default(0),
  nextAction: nullableText,
  status: z.enum(opportunityStatuses).default("watching"),
});

export const professionalContactSchema = z.object({
  name: z.string().trim().min(1).max(220),
  role: nullableShortText(160),
  institution: nullableShortText(220),
  relationshipStrength: scoreSchema.default(0),
  lastContactedAt: nullableDate,
  nextFollowUpAt: nullableDate,
  notes: nullableText,
});

export const lifeAdminItemSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  category: z.enum(lifeAdminCategories).default("other"),
  dueAt: nullableDate,
  status: z.enum(taskStatuses).default("todo"),
  priority: scoreSchema.default(0),
});

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: nullableText,
  itemType: z.enum(portfolioItemTypes).default("other"),
  date: nullableDateString,
  evidenceUrl: nullableText,
  strategicValue: scoreSchema.default(0),
  status: z.enum(portfolioStatuses).default("active"),
});

export const strategicReviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewType: z.enum(strategicReviewTypes).default("weekly"),
  wins: nullableText,
  weaknesses: nullableText,
  decisions: nullableText,
  nextFocus: nullableText,
  eliteIndexSnapshot: z.coerce.number().min(0).max(10).default(0),
});

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
