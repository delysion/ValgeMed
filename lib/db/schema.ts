import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { REVIEW_TYPES, STRATEGIC_REVIEW_TYPES } from "@/lib/constants/review-types";

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

export const reviewTypeEnum = pgEnum("review_type", REVIEW_TYPES);

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

export const strategicReviewTypeEnum = pgEnum("strategic_review_type", STRATEGIC_REVIEW_TYPES);

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
}, (table) => [
  index("subjects_user_id_name_idx").on(table.userId, table.name),
]);

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
}, (table) => [
  index("exams_user_id_exam_date_idx").on(table.userId, table.examDate),
]);

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
}, (table) => [
  index("topics_user_id_priority_title_idx").on(table.userId, table.priority, table.title),
  index("topics_user_id_subject_id_idx").on(table.userId, table.subjectId),
]);

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
}, (table) => [
  index("study_sessions_user_id_started_at_idx").on(table.userId, table.startedAt),
]);

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
}, (table) => [
  index("review_items_user_id_active_due_idx").on(table.userId, table.isActive, table.dueAt),
]);

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
}, (table) => [
  index("error_logs_user_id_resolved_severity_created_idx").on(
    table.userId,
    table.resolved,
    table.severity,
    table.createdAt,
  ),
]);

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
}, (table) => [
  index("quiz_attempts_user_id_date_idx").on(table.userId, table.date),
]);

export const dailyLogs = pgTable("daily_logs", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
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
}, (table) => [
  uniqueIndex("daily_logs_user_id_date_unique").on(table.userId, table.date),
]);

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
}, (table) => [
  index("goals_user_id_priority_created_idx").on(table.userId, table.priority, table.createdAt),
]);

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
}, (table) => [
  index("tasks_user_id_priority_due_idx").on(table.userId, table.priority, table.dueAt),
]);

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
}, (table) => [
  index("identity_notes_user_id_created_idx").on(table.userId, table.createdAt),
]);

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
}, (table) => [
  index("tartu_notes_user_id_priority_created_idx").on(table.userId, table.priority, table.createdAt),
]);

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
}, (table) => [
  index("time_blocks_user_id_date_created_idx").on(table.userId, table.date, table.createdAt),
]);

export const healthLogs = pgTable("health_logs", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  sleepQuality: integer("sleep_quality"),
  cognitiveFatigue: integer("cognitive_fatigue"),
  recoveryQuality: integer("recovery_quality"),
  foodQuality: integer("food_quality"),
  movementDone: boolean("movement_done").default(false).notNull(),
  energyIntegrityScore: doublePrecision("energy_integrity_score").default(0).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
}, (table) => [
  uniqueIndex("health_logs_user_id_date_unique").on(table.userId, table.date),
]);

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
}, (table) => [
  index("language_progress_user_id_next_practice_idx").on(table.userId, table.nextPracticeAt, table.createdAt),
]);

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
}, (table) => [
  index("reputation_events_user_id_event_impact_idx").on(table.userId, table.eventDate, table.impact),
]);

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
}, (table) => [
  index("opportunities_user_id_deadline_upside_idx").on(table.userId, table.deadline, table.strategicUpside),
]);

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
}, (table) => [
  index("professional_contacts_user_id_strength_followup_idx").on(
    table.userId,
    table.relationshipStrength,
    table.nextFollowUpAt,
  ),
]);

export const lifeAdminItems = pgTable("life_admin_items", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  category: lifeAdminCategoryEnum("category").default("other").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: integer("priority").default(0).notNull(),
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 255 }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
}, (table) => [
  index("life_admin_items_user_id_priority_due_idx").on(table.userId, table.priority, table.dueAt),
]);

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
}, (table) => [
  index("portfolio_items_user_id_date_created_idx").on(table.userId, table.date, table.createdAt),
]);

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
}, (table) => [
  index("strategic_reviews_user_id_date_idx").on(table.userId, table.date),
]);

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
}, (table) => [
  index("research_areas_user_id_created_idx").on(table.userId, table.createdAt),
]);

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
}, (table) => [
  index("literature_gaps_user_id_priority_created_idx").on(table.userId, table.priority, table.createdAt),
]);

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
}, (table) => [
  index("hypotheses_user_id_created_idx").on(table.userId, table.createdAt),
]);

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
}, (table) => [
  index("manuscripts_user_id_deadline_idx").on(table.userId, table.deadline),
]);

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
}, (table) => [
  index("methodology_risks_user_id_created_idx").on(table.userId, table.createdAt),
]);

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
}, (table) => [
  index("uploads_user_id_created_idx").on(table.userId, table.createdAt),
]);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
}, (table) => [
  index("push_subscriptions_user_id_endpoint_idx").on(table.userId, table.endpoint),
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name"),
  approved: boolean("approved").default(false),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  aiProvider: text("ai_provider"),
  aiApiKey: text("ai_api_key"),
  aiPromptLimitChars: integer("ai_prompt_limit_chars").default(24000).notNull(),
  aiDailyRequestLimit: integer("ai_daily_request_limit").default(40).notNull(),
  aiDailyCharLimit: integer("ai_daily_char_limit").default(240000).notNull(),
  targetLevel: text("target_level").default("top_5").notNull(),
  weaknessTolerance: text("weakness_tolerance").default("low").notNull(),
  examStrategy: text("exam_strategy").default("balanced").notNull(),
  isAdmin: boolean("is_admin").default(false),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: idColumn(),
  userId: uuid("user_id").notNull(),
  feature: varchar("feature", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 40 }).notNull(),
  promptChars: integer("prompt_chars").default(0).notNull(),
  responseChars: integer("response_chars").default(0).notNull(),
  metadata: jsonb("metadata"),
  createdAt: createdAtColumn(),
}, (table) => [
  index("ai_usage_events_user_id_created_idx").on(table.userId, table.createdAt),
  index("ai_usage_events_user_id_feature_created_idx").on(table.userId, table.feature, table.createdAt),
]);

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
  aiUsageEvents,
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
export type AiUsageEvent = typeof aiUsageEvents.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
