import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const idColumn = () => uuid("id").defaultRandom().primaryKey();
const createdAtColumn = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAtColumn = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const examFormatEnum = pgEnum("exam_format", [
  "written",
  "oral",
  "practical",
  "osce",
  "mixed",
  "unknown",
]);

export const topicStatusEnum = pgEnum("topic_status", [
  "not_started",
  "first_exposure",
  "understood",
  "recalled",
  "practiced",
  "error_corrected",
  "consolidated",
  "exam_ready",
]);

export const studyMethodEnum = pgEnum("study_method", [
  "reading",
  "active_recall",
  "quiz",
  "simulation",
  "error_review",
  "notes",
  "mixed",
]);

export const reviewTypeEnum = pgEnum("review_type", [
  "flashcard",
  "open_question",
  "feynman",
  "blurting",
  "quiz_prompt",
]);

export const errorTypeEnum = pgEnum("error_type", [
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
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "daily",
  "weekly",
  "monthly",
  "semester",
  "identity",
  "health",
  "language",
  "exam",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "paused",
  "archived",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "doing",
  "done",
  "archived",
]);

export const identityCategoryEnum = pgEnum("identity_category", [
  "professional_identity",
  "discipline",
  "image",
  "boundaries",
  "ambition",
  "tartu_life",
  "language",
  "personal_standard",
]);

export const tartuNoteCategoryEnum = pgEnum("tartu_note_category", [
  "estonian",
  "tartu_life",
  "academic_culture",
  "medicine_dentistry_requirements",
  "documents",
  "housing",
  "routine",
]);

export const timeBlockTypeEnum = pgEnum("time_block_type", [
  "study",
  "review",
  "simulation",
  "recovery",
  "life_admin",
  "language",
  "opportunity",
]);

export const languageEnum = pgEnum("language", ["estonian", "latin", "english"]);

export const reputationEventTypeEnum = pgEnum("reputation_event_type", [
  "helped_someone",
  "excellent_work",
  "presentation",
  "project",
  "exam_result",
  "recommendation",
  "reliability_signal",
  "leadership_signal",
  "precise_question_after_lecture",
]);

export const opportunityTypeEnum = pgEnum("opportunity_type", [
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
]);

export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "watching",
  "active",
  "applied",
  "won",
  "passed",
  "archived",
]);

export const lifeAdminCategoryEnum = pgEnum("life_admin_category", [
  "documents",
  "housing",
  "finance",
  "health",
  "university",
  "travel",
  "other",
]);

export const portfolioItemTypeEnum = pgEnum("portfolio_item_type", [
  "exam_result",
  "project",
  "presentation",
  "certificate",
  "research",
  "volunteering",
  "reflection",
  "other",
]);

export const portfolioStatusEnum = pgEnum("portfolio_status", [
  "draft",
  "active",
  "archived",
]);

export const strategicReviewTypeEnum = pgEnum("strategic_review_type", [
  "weekly",
  "monthly",
  "semester",
]);

export const subjects = pgTable("subjects", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 40 }),
  description: text("description"),
  color: varchar("color", { length: 40 }),
  difficulty: integer("difficulty").default(0).notNull(),
  importance: integer("importance").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const exams = pgTable("exams", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 220 }).notNull(),
  examDate: timestamp("exam_date", { withTimezone: true }),
  ects: doublePrecision("ects"),
  format: examFormatEnum("format").default("unknown").notNull(),
  difficulty: integer("difficulty").default(0).notNull(),
  importance: integer("importance").default(0).notNull(),
  readinessScore: doublePrecision("readiness_score").default(0).notNull(),
  riskLevel: integer("risk_level").default(0).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const topics = pgTable("topics", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  status: topicStatusEnum("status").default("not_started").notNull(),
  difficulty: integer("difficulty").default(0).notNull(),
  priority: integer("priority").default(0).notNull(),
  confidence: integer("confidence").default(0).notNull(),
  lastStudiedAt: timestamp("last_studied_at", { withTimezone: true }),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const studySessions = pgTable("study_sessions", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes").notNull(),
  method: studyMethodEnum("method").default("mixed").notNull(),
  focusLevel: integer("focus_level").default(0).notNull(),
  energyLevel: integer("energy_level").default(0).notNull(),
  outputQuality: integer("output_quality").default(0).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
});

export const reviewItems = pgTable("review_items", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  question: text("question").notNull(),
  answer: text("answer"),
  reviewType: reviewTypeEnum("review_type").default("flashcard").notNull(),
  confidence: integer("confidence").default(0).notNull(),
  intervalDays: integer("interval_days").default(1).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  timesReviewed: integer("times_reviewed").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const errorLogs = pgTable("error_logs", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description").notNull(),
  errorType: errorTypeEnum("error_type").default("other").notNull(),
  cause: text("cause"),
  correction: text("correction"),
  preventionRule: text("prevention_rule"),
  retestAt: timestamp("retest_at", { withTimezone: true }),
  resolved: boolean("resolved").default(false).notNull(),
  severity: integer("severity").default(0).notNull(),
  recurrenceCount: integer("recurrence_count").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  scorePercent: doublePrecision("score_percent").notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull().unique(),
  sleepHours: doublePrecision("sleep_hours"),
  energyLevel: integer("energy_level"),
  stressLevel: integer("stress_level"),
  moodLevel: integer("mood_level"),
  studyMinutes: integer("study_minutes").default(0).notNull(),
  activeRecallMinutes: integer("active_recall_minutes").default(0).notNull(),
  passiveStudyMinutes: integer("passive_study_minutes").default(0).notNull(),
  movementDone: boolean("movement_done").default(false).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const goals = pgTable("goals", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  goalType: goalTypeEnum("goal_type").default("daily").notNull(),
  targetDate: date("target_date"),
  status: goalStatusEnum("status").default("active").notNull(),
  priority: integer("priority").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const tasks = pgTable("tasks", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: integer("priority").default(0).notNull(),
  relatedSubjectId: uuid("related_subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  relatedExamId: uuid("related_exam_id").references(() => exams.id, {
    onDelete: "set null",
  }),
  relatedTopicId: uuid("related_topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const identityNotes = pgTable("identity_notes", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  content: text("content").notNull(),
  category: identityCategoryEnum("category")
    .default("professional_identity")
    .notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const tartuNotes = pgTable("tartu_notes", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  content: text("content").notNull(),
  category: tartuNoteCategoryEnum("category").default("tartu_life").notNull(),
  priority: integer("priority").default(0).notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const timeBlocks = pgTable("time_blocks", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  blockType: timeBlockTypeEnum("block_type").default("study").notNull(),
  plannedMinutes: integer("planned_minutes").default(0).notNull(),
  actualMinutes: integer("actual_minutes").default(0).notNull(),
  energyCost: integer("energy_cost").default(0).notNull(),
  leverageScore: integer("leverage_score").default(0).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const healthLogs = pgTable("health_logs", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull().unique(),
  sleepQuality: integer("sleep_quality"),
  cognitiveFatigue: integer("cognitive_fatigue"),
  recoveryQuality: integer("recovery_quality"),
  foodQuality: integer("food_quality"),
  movementDone: boolean("movement_done").default(false).notNull(),
  energyIntegrityScore: doublePrecision("energy_integrity_score").default(0).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const languageProgress = pgTable("language_progress", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  language: languageEnum("language").default("estonian").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  category: varchar("category", { length: 120 }),
  minutes: integer("minutes").default(0).notNull(),
  confidence: integer("confidence").default(0).notNull(),
  lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }),
  nextPracticeAt: timestamp("next_practice_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const reputationEvents = pgTable("reputation_events", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  eventType: reputationEventTypeEnum("event_type").default("reliability_signal").notNull(),
  eventDate: date("event_date").notNull(),
  impact: integer("impact").default(0).notNull(),
  evidenceUrl: text("evidence_url"),
  followUpAt: timestamp("follow_up_at", { withTimezone: true }),
  status: taskStatusEnum("status").default("done").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const opportunities = pgTable("opportunities", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  opportunityType: opportunityTypeEnum("opportunity_type").default("other").notNull(),
  deadline: date("deadline"),
  valueScore: integer("value_score").default(0).notNull(),
  effortScore: integer("effort_score").default(0).notNull(),
  strategicUpside: integer("strategic_upside").default(0).notNull(),
  nextAction: text("next_action"),
  status: opportunityStatusEnum("status").default("watching").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const professionalContacts = pgTable("professional_contacts", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 220 }).notNull(),
  role: varchar("role", { length: 160 }),
  institution: varchar("institution", { length: 220 }),
  relationshipStrength: integer("relationship_strength").default(0).notNull(),
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const lifeAdminItems = pgTable("life_admin_items", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  category: lifeAdminCategoryEnum("category").default("other").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: integer("priority").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  itemType: portfolioItemTypeEnum("item_type").default("other").notNull(),
  date: date("date"),
  evidenceUrl: text("evidence_url"),
  strategicValue: integer("strategic_value").default(0).notNull(),
  status: portfolioStatusEnum("status").default("active").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const strategicReviews = pgTable("strategic_reviews", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  reviewType: strategicReviewTypeEnum("review_type").default("weekly").notNull(),
  wins: text("wins"),
  weaknesses: text("weaknesses"),
  decisions: text("decisions"),
  nextFocus: text("next_focus"),
  eliteIndexSnapshot: doublePrecision("elite_index_snapshot").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const researchAreas = pgTable("research_areas", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  whatIsKnown: text("what_is_known"),
  whatIsUnknown: text("what_is_unknown"),
  isControversial: text("is_controversial"),
  methodologicallyWeak: text("methodologically_weak"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const literatureGaps = pgTable("literature_gaps", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  researchAreaId: uuid("research_area_id").references(() => researchAreas.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").default(0),
  publishableForStudent: boolean("publishable_for_student").default(false),
  status: text("status").default("identified"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const hypotheses = pgTable("hypotheses", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  question: text("question").notNull(),
  totalScore: integer("total_score"),
  output: text("output"),
  status: text("status").default("draft"),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const manuscripts = pgTable("manuscripts", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  hypothesisId: uuid("hypothesis_id").references(() => hypotheses.id),
  stage: text("stage").notNull().default("idea"),
  journal: text("journal"),
  deadline: timestamp("deadline"),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const methodologyRisks = pgTable("methodology_risks", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  manuscriptId: uuid("manuscript_id").references(() => manuscripts.id),
  hypothesisId: uuid("hypothesis_id").references(() => hypotheses.id),
  type: text("type").notNull(),
  description: text("description"),
  severity: text("severity").default("medium"),
  mitigated: boolean("mitigated").default(false),
  mitigationNotes: text("mitigation_notes"),
  createdAt: createdAtColumn(),
});

export const uploads = pgTable("uploads", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  extractedText: text("extracted_text"),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  processed: boolean("processed").default(false).notNull(),
  flashcardsGenerated: integer("flashcards_generated").default(0).notNull(),
  createdAt: createdAtColumn(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const schema = {
  subjects,
  exams,
  topics,
  studySessions,
  reviewItems,
  errorLogs,
  quizAttempts,
  dailyLogs,
  goals,
  tasks,
  identityNotes,
  tartuNotes,
  timeBlocks,
  healthLogs,
  languageProgress,
  reputationEvents,
  opportunities,
  professionalContacts,
  lifeAdminItems,
  portfolioItems,
  strategicReviews,
  researchAreas,
  literatureGaps,
  hypotheses,
  manuscripts,
  methodologyRisks,
  uploads,
  profiles,
  pushSubscriptions,
};

export type Subject = typeof subjects.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type ReviewItem = typeof reviewItems.$inferSelect;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type IdentityNote = typeof identityNotes.$inferSelect;
export type TartuNote = typeof tartuNotes.$inferSelect;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type HealthLog = typeof healthLogs.$inferSelect;
export type LanguageProgress = typeof languageProgress.$inferSelect;
export type ReputationEvent = typeof reputationEvents.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type ProfessionalContact = typeof professionalContacts.$inferSelect;
export type LifeAdminItem = typeof lifeAdminItems.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type StrategicReview = typeof strategicReviews.$inferSelect;
export type ResearchArea = typeof researchAreas.$inferSelect;
export type LiteratureGap = typeof literatureGaps.$inferSelect;
export type Hypothesis = typeof hypotheses.$inferSelect;
export type Manuscript = typeof manuscripts.$inferSelect;
export type MethodologyRisk = typeof methodologyRisks.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
