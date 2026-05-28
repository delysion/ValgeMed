import "server-only";

import { and, asc, desc, eq, gte, ilike, isNull, lte, or } from "drizzle-orm";
import { addDays, formatISO, startOfDay, subDays } from "date-fns";

import { getUserId } from "@/lib/db/auth";
import { withDb } from "@/lib/db";
import {
  dailyLogs,
  errorLogs,
  exams,
  goals,
  healthLogs,
  hypotheses,
  identityNotes,
  languageProgress,
  lifeAdminItems,
  literatureGaps,
  manuscripts,
  opportunities,
  portfolioItems,
  profiles,
  professionalContacts,
  pushSubscriptions,
  quizAttempts,
  reviewItems,
  reputationEvents,
  researchAreas,
  studySessions,
  strategicReviews,
  subjects,
  tartuNotes,
  tasks,
  timeBlocks,
  topics,
  methodologyRisks,
  uploads,
  type DailyLog,
  type ErrorLog,
  type Exam,
  type Goal,
  type HealthLog,
  type Hypothesis,
  type IdentityNote,
  type LanguageProgress,
  type LifeAdminItem,
  type LiteratureGap,
  type Manuscript,
  type MethodologyRisk,
  type Opportunity,
  type PortfolioItem,
  type ProfessionalContact,
  type PushSubscription,
  type QuizAttempt,
  type ReviewItem,
  type ResearchArea,
  type ReputationEvent,
  type StudySession,
  type StrategicReview,
  type Subject,
  type TartuNote,
  type Task,
  type TimeBlock,
  type Topic,
  type Upload,
} from "@/lib/db/schema";
import {
  DEFAULT_ELITE_TARGET_SETTINGS,
  normalizeEliteTargetSettings,
  type EliteTargetSettings,
} from "@/lib/scoring/elite-performance";

export type CoreData = {
  subjects: Subject[];
  exams: Exam[];
  topics: Topic[];
  studySessions: StudySession[];
  reviewItems: ReviewItem[];
  errorLogs: ErrorLog[];
  quizAttempts: QuizAttempt[];
  dailyLogs: DailyLog[];
  goals: Goal[];
  tasks: Task[];
  identityNotes: IdentityNote[];
  tartuNotes: TartuNote[];
  timeBlocks: TimeBlock[];
  healthLogs: HealthLog[];
  languageProgress: LanguageProgress[];
  reputationEvents: ReputationEvent[];
  opportunities: Opportunity[];
  professionalContacts: ProfessionalContact[];
  lifeAdminItems: LifeAdminItem[];
  portfolioItems: PortfolioItem[];
  strategicReviews: StrategicReview[];
};

export type ExportData = CoreData & {
  researchAreas: ResearchArea[];
  literatureGaps: LiteratureGap[];
  hypotheses: Hypothesis[];
  manuscripts: Manuscript[];
  methodologyRisks: MethodologyRisk[];
  uploads: Upload[];
  pushSubscriptions: PushSubscription[];
};

const emptyCoreData: CoreData = {
  subjects: [], exams: [], topics: [], studySessions: [], reviewItems: [],
  errorLogs: [], quizAttempts: [], dailyLogs: [], goals: [], tasks: [],
  identityNotes: [], tartuNotes: [], timeBlocks: [], healthLogs: [],
  languageProgress: [], reputationEvents: [], opportunities: [],
  professionalContacts: [], lifeAdminItems: [], portfolioItems: [],
  strategicReviews: [],
};

// ─────────────────────────────────────────────────────
// Legacy: loads ALL 22 tables at once (use sparingly)
// ─────────────────────────────────────────────────────
export async function getCoreData(userIdOverride?: string): Promise<CoreData> {
  const userId = userIdOverride ?? await getUserId();
  return withDb<CoreData>(async (db) => {
    const [
      subjectRows, examRows, topicRows, sessionRows, reviewRows,
      errorRows, quizRows, dailyRows, goalRows, taskRows,
      identityRows, tartuRows, timeRows, healthRows, languageRows,
      reputationRows, opportunityRows, contactRows, lifeAdminRows,
      portfolioRows, strategicReviewRows,
    ] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(50),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200),
      db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(200),
      db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(200),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(100),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(200),
      db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(90),
      db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.priority), desc(goals.createdAt)).limit(50),
      db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.priority), asc(tasks.dueAt)).limit(50),
      db.select().from(identityNotes).where(eq(identityNotes.userId, userId)).orderBy(desc(identityNotes.createdAt)).limit(50),
      db.select().from(tartuNotes).where(eq(tartuNotes.userId, userId)).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)).limit(50),
      db.select().from(timeBlocks).where(eq(timeBlocks.userId, userId)).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(200),
      db.select().from(healthLogs).where(eq(healthLogs.userId, userId)).orderBy(desc(healthLogs.date)).limit(120),
      db.select().from(languageProgress).where(eq(languageProgress.userId, userId)).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)).limit(50),
      db.select().from(reputationEvents).where(eq(reputationEvents.userId, userId)).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)).limit(100),
      db.select().from(opportunities).where(eq(opportunities.userId, userId)).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)).limit(100),
      db.select().from(professionalContacts).where(eq(professionalContacts.userId, userId)).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)).limit(100),
      db.select().from(lifeAdminItems).where(eq(lifeAdminItems.userId, userId)).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)).limit(100),
      db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)).limit(100),
      db.select().from(strategicReviews).where(eq(strategicReviews.userId, userId)).orderBy(desc(strategicReviews.date)).limit(100),
    ]);
    return {
      subjects: subjectRows, exams: examRows, topics: topicRows,
      studySessions: sessionRows, reviewItems: reviewRows, errorLogs: errorRows,
      quizAttempts: quizRows, dailyLogs: dailyRows, goals: goalRows, tasks: taskRows,
      identityNotes: identityRows, tartuNotes: tartuRows, timeBlocks: timeRows,
      healthLogs: healthRows, languageProgress: languageRows,
      reputationEvents: reputationRows, opportunities: opportunityRows,
      professionalContacts: contactRows, lifeAdminItems: lifeAdminRows,
      portfolioItems: portfolioRows, strategicReviews: strategicReviewRows,
    };
  }, emptyCoreData);
}

// ─────────────────────────────────────────────────────
// Targeted data helpers (preferred — load only what you need)
// ─────────────────────────────────────────────────────

export async function getExportData(userIdOverride?: string): Promise<ExportData> {
  const userId = userIdOverride ?? await getUserId();
  const [core, pipeline, uploadRows, pushRows] = await Promise.all([
    getCoreData(userId),
    getResearchPipelineData(userId),
    withDb<Upload[]>((db) => {
      return db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt)).limit(500);
    }, []),
    withDb<PushSubscription[]>((db) => {
      return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)).orderBy(desc(pushSubscriptions.createdAt)).limit(50);
    }, []),
  ]);

  return {
    ...core,
    researchAreas: pipeline.researchAreas,
    literatureGaps: pipeline.literatureGaps,
    hypotheses: pipeline.hypotheses,
    manuscripts: pipeline.manuscripts,
    methodologyRisks: pipeline.methodologyRisks,
    uploads: uploadRows,
    pushSubscriptions: pushRows,
  };
}

async function getUserIdOrThrow() {
  const uid = await getUserId();
  return uid;
}

export async function getEliteTargetSettings(userIdOverride?: string): Promise<EliteTargetSettings> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  return withDb<EliteTargetSettings>(async (db) => {
    const [profile] = await db
      .select({
        targetLevel: profiles.targetLevel,
        weaknessTolerance: profiles.weaknessTolerance,
        examStrategy: profiles.examStrategy,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return normalizeEliteTargetSettings(profile);
  }, DEFAULT_ELITE_TARGET_SETTINGS);
}

// Small reference tables (used by many pages for forms / dropdowns)
export async function getSubjects() {
  const userId = await getUserIdOrThrow();
  return withDb<Subject[]>((db) => {
    return db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name));
  }, []);
}

export async function getExams() {
  const userId = await getUserIdOrThrow();
  return withDb<Exam[]>((db) => {
    return db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(50);
  }, []);
}

export async function getTopics() {
  const userId = await getUserIdOrThrow();
  return withDb<Topic[]>((db) => {
    return db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200);
  }, []);
}

export async function getReferenceData() {
  const [s, e, t] = await Promise.all([getSubjects(), getExams(), getTopics()]);
  return { subjects: s, exams: e, topics: t };
}

// Individual entity queries
export async function getStudySessions(limit = 200) {
  const userId = await getUserIdOrThrow();
  return withDb<StudySession[]>((db) => {
    return db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(limit);
  }, []);
}

export async function getLiteratureGaps() {
  const userId = await getUserIdOrThrow();
  return withDb<LiteratureGap[]>((db) => {
    return db.select().from(literatureGaps).where(eq(literatureGaps.userId, userId)).orderBy(desc(literatureGaps.priority), asc(literatureGaps.createdAt)).limit(100);
  }, []);
}

export async function getResearchAreas() {
  const userId = await getUserIdOrThrow();
  return withDb<ResearchArea[]>((db) => {
    return db.select().from(researchAreas).where(eq(researchAreas.userId, userId)).orderBy(desc(researchAreas.createdAt)).limit(100);
  }, []);
}

export async function getHypotheses() {
  const userId = await getUserIdOrThrow();
  return withDb<Hypothesis[]>((db) => {
    return db.select().from(hypotheses).where(eq(hypotheses.userId, userId)).orderBy(desc(hypotheses.createdAt)).limit(100);
  }, []);
}

export async function getManuscripts() {
  const userId = await getUserIdOrThrow();
  return withDb<Manuscript[]>((db) => {
    return db.select().from(manuscripts).where(eq(manuscripts.userId, userId)).orderBy(desc(manuscripts.createdAt)).limit(100);
  }, []);
}

export async function getMethodologyRisks() {
  const userId = await getUserIdOrThrow();
  return withDb<MethodologyRisk[]>((db) => {
    return db.select().from(methodologyRisks).where(eq(methodologyRisks.userId, userId)).orderBy(desc(methodologyRisks.createdAt)).limit(100);
  }, []);
}

export async function getReviewItems(limit = 200) {
  const userId = await getUserIdOrThrow();
  return withDb<ReviewItem[]>((db) => {
    return db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(limit);
  }, []);
}

export async function getErrorLogs(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<ErrorLog[]>((db) => {
    return db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(limit);
  }, []);
}

export async function getQuizAttempts(limit = 200) {
  const userId = await getUserIdOrThrow();
  return withDb<QuizAttempt[]>((db) => {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(limit);
  }, []);
}

export async function getDailyLogs(limit = 90) {
  const userId = await getUserIdOrThrow();
  return withDb<DailyLog[]>((db) => {
    return db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(limit);
  }, []);
}

export async function getGoals(limit = 50) {
  const userId = await getUserIdOrThrow();
  return withDb<Goal[]>((db) => {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.priority), desc(goals.createdAt)).limit(limit);
  }, []);
}

export async function getTasks(limit = 50) {
  const userId = await getUserIdOrThrow();
  return withDb<Task[]>((db) => {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.priority), asc(tasks.dueAt)).limit(limit);
  }, []);
}

export async function getIdentityNotes(limit = 50) {
  const userId = await getUserIdOrThrow();
  return withDb<IdentityNote[]>((db) => {
    return db.select().from(identityNotes).where(eq(identityNotes.userId, userId)).orderBy(desc(identityNotes.createdAt)).limit(limit);
  }, []);
}

export async function getTartuNotes(limit = 50) {
  const userId = await getUserIdOrThrow();
  return withDb<TartuNote[]>((db) => {
    return db.select().from(tartuNotes).where(eq(tartuNotes.userId, userId)).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)).limit(limit);
  }, []);
}

export async function getTimeBlocks(limit = 200) {
  const userId = await getUserIdOrThrow();
  return withDb<TimeBlock[]>((db) => {
    return db.select().from(timeBlocks).where(eq(timeBlocks.userId, userId)).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(limit);
  }, []);
}

export async function getHealthLogs(limit = 120) {
  const userId = await getUserIdOrThrow();
  return withDb<HealthLog[]>((db) => {
    return db.select().from(healthLogs).where(eq(healthLogs.userId, userId)).orderBy(desc(healthLogs.date)).limit(limit);
  }, []);
}

export async function getLanguageProgress(limit = 50) {
  const userId = await getUserIdOrThrow();
  return withDb<LanguageProgress[]>((db) => {
    return db.select().from(languageProgress).where(eq(languageProgress.userId, userId)).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)).limit(limit);
  }, []);
}

export async function getReputationEvents(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<ReputationEvent[]>((db) => {
    return db.select().from(reputationEvents).where(eq(reputationEvents.userId, userId)).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)).limit(limit);
  }, []);
}

export async function getOpportunities(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<Opportunity[]>((db) => {
    return db.select().from(opportunities).where(eq(opportunities.userId, userId)).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)).limit(limit);
  }, []);
}

export async function getProfessionalContacts(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<ProfessionalContact[]>((db) => {
    return db.select().from(professionalContacts).where(eq(professionalContacts.userId, userId)).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)).limit(limit);
  }, []);
}

export async function getLifeAdminItems(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<LifeAdminItem[]>((db) => {
    return db.select().from(lifeAdminItems).where(eq(lifeAdminItems.userId, userId)).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)).limit(limit);
  }, []);
}

export async function getPortfolioItems(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<PortfolioItem[]>((db) => {
    return db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)).limit(limit);
  }, []);
}

export async function getStrategicReviews(limit = 100) {
  const userId = await getUserIdOrThrow();
  return withDb<StrategicReview[]>((db) => {
    return db.select().from(strategicReviews).where(eq(strategicReviews.userId, userId)).orderBy(desc(strategicReviews.date)).limit(limit);
  }, []);
}

// ─────────────────────────────────────────────────────
// Composite page-level queries
// ─────────────────────────────────────────────────────

export type CommandPageData = Pick<
  CoreData,
  | "subjects"
  | "exams"
  | "topics"
  | "studySessions"
  | "reviewItems"
  | "errorLogs"
  | "quizAttempts"
  | "dailyLogs"
  | "tasks"
  | "timeBlocks"
  | "healthLogs"
  | "languageProgress"
  | "reputationEvents"
  | "opportunities"
  | "professionalContacts"
  | "lifeAdminItems"
  | "portfolioItems"
  | "strategicReviews"
  | "tartuNotes"
>;

const emptyCommandPageData: CommandPageData = {
  subjects: [],
  exams: [],
  topics: [],
  studySessions: [],
  reviewItems: [],
  errorLogs: [],
  quizAttempts: [],
  dailyLogs: [],
  tasks: [],
  timeBlocks: [],
  healthLogs: [],
  languageProgress: [],
  reputationEvents: [],
  opportunities: [],
  professionalContacts: [],
  lifeAdminItems: [],
  portfolioItems: [],
  strategicReviews: [],
  tartuNotes: [],
};

export async function getCommandPageData(userIdOverride?: string): Promise<CommandPageData> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  return withDb<CommandPageData>(async (db) => {
    const [
      subjectRows,
      examRows,
      topicRows,
      sessionRows,
      reviewRows,
      errorRows,
      quizRows,
      dailyRows,
      taskRows,
      timeRows,
      healthRows,
      languageRows,
      reputationRows,
      opportunityRows,
      contactRows,
      lifeAdminRows,
      portfolioRows,
      strategicReviewRows,
      tartuRows,
    ] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(20),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(120),
      db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(120),
      db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(80),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(60),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(80),
      db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(45),
      db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.priority), asc(tasks.dueAt)).limit(40),
      db.select().from(timeBlocks).where(eq(timeBlocks.userId, userId)).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(80),
      db.select().from(healthLogs).where(eq(healthLogs.userId, userId)).orderBy(desc(healthLogs.date)).limit(45),
      db.select().from(languageProgress).where(eq(languageProgress.userId, userId)).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)).limit(30),
      db.select().from(reputationEvents).where(eq(reputationEvents.userId, userId)).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)).limit(40),
      db.select().from(opportunities).where(eq(opportunities.userId, userId)).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)).limit(50),
      db.select().from(professionalContacts).where(eq(professionalContacts.userId, userId)).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)).limit(40),
      db.select().from(lifeAdminItems).where(eq(lifeAdminItems.userId, userId)).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)).limit(50),
      db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)).limit(40),
      db.select().from(strategicReviews).where(eq(strategicReviews.userId, userId)).orderBy(desc(strategicReviews.date)).limit(20),
      db.select().from(tartuNotes).where(eq(tartuNotes.userId, userId)).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)).limit(30),
    ]);

    return {
      subjects: subjectRows,
      exams: examRows,
      topics: topicRows,
      studySessions: sessionRows,
      reviewItems: reviewRows,
      errorLogs: errorRows,
      quizAttempts: quizRows,
      dailyLogs: dailyRows,
      tasks: taskRows,
      timeBlocks: timeRows,
      healthLogs: healthRows,
      languageProgress: languageRows,
      reputationEvents: reputationRows,
      opportunities: opportunityRows,
      professionalContacts: contactRows,
      lifeAdminItems: lifeAdminRows,
      portfolioItems: portfolioRows,
      strategicReviews: strategicReviewRows,
      tartuNotes: tartuRows,
    };
  }, emptyCommandPageData);
}

export type EliteIndexPageData = Pick<
  CoreData,
  | "topics"
  | "studySessions"
  | "quizAttempts"
  | "errorLogs"
  | "dailyLogs"
  | "healthLogs"
  | "timeBlocks"
  | "languageProgress"
  | "tartuNotes"
  | "lifeAdminItems"
  | "reputationEvents"
  | "professionalContacts"
  | "portfolioItems"
  | "opportunities"
  | "strategicReviews"
>;

const emptyEliteIndexPageData: EliteIndexPageData = {
  topics: [],
  studySessions: [],
  quizAttempts: [],
  errorLogs: [],
  dailyLogs: [],
  healthLogs: [],
  timeBlocks: [],
  languageProgress: [],
  tartuNotes: [],
  lifeAdminItems: [],
  reputationEvents: [],
  professionalContacts: [],
  portfolioItems: [],
  opportunities: [],
  strategicReviews: [],
};

export async function getEliteIndexPageData(userIdOverride?: string): Promise<EliteIndexPageData> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  return withDb<EliteIndexPageData>(async (db) => {
    const [
      topicRows,
      sessionRows,
      quizRows,
      errorRows,
      dailyRows,
      healthRows,
      timeRows,
      languageRows,
      tartuRows,
      lifeAdminRows,
      reputationRows,
      contactRows,
      portfolioRows,
      opportunityRows,
      strategicReviewRows,
    ] = await Promise.all([
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(160),
      db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(160),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(120),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(80),
      db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(90),
      db.select().from(healthLogs).where(eq(healthLogs.userId, userId)).orderBy(desc(healthLogs.date)).limit(90),
      db.select().from(timeBlocks).where(eq(timeBlocks.userId, userId)).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(160),
      db.select().from(languageProgress).where(eq(languageProgress.userId, userId)).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)).limit(60),
      db.select().from(tartuNotes).where(eq(tartuNotes.userId, userId)).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)).limit(60),
      db.select().from(lifeAdminItems).where(eq(lifeAdminItems.userId, userId)).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)).limit(80),
      db.select().from(reputationEvents).where(eq(reputationEvents.userId, userId)).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)).limit(80),
      db.select().from(professionalContacts).where(eq(professionalContacts.userId, userId)).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)).limit(80),
      db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)).limit(80),
      db.select().from(opportunities).where(eq(opportunities.userId, userId)).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)).limit(80),
      db.select().from(strategicReviews).where(eq(strategicReviews.userId, userId)).orderBy(desc(strategicReviews.date)).limit(80),
    ]);

    return {
      topics: topicRows,
      studySessions: sessionRows,
      quizAttempts: quizRows,
      errorLogs: errorRows,
      dailyLogs: dailyRows,
      healthLogs: healthRows,
      timeBlocks: timeRows,
      languageProgress: languageRows,
      tartuNotes: tartuRows,
      lifeAdminItems: lifeAdminRows,
      reputationEvents: reputationRows,
      professionalContacts: contactRows,
      portfolioItems: portfolioRows,
      opportunities: opportunityRows,
      strategicReviews: strategicReviewRows,
    };
  }, emptyEliteIndexPageData);
}

export type ResearchPipelineData = {
  researchAreas: ResearchArea[];
  literatureGaps: LiteratureGap[];
  hypotheses: Hypothesis[];
  manuscripts: Manuscript[];
  methodologyRisks: MethodologyRisk[];
};

const emptyResearchPipelineData: ResearchPipelineData = {
  researchAreas: [],
  literatureGaps: [],
  hypotheses: [],
  manuscripts: [],
  methodologyRisks: [],
};

export async function getResearchPipelineData(userIdOverride?: string): Promise<ResearchPipelineData> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  return withDb<ResearchPipelineData>(async (db) => {
    const [areaRows, gapRows, hypothesisRows, manuscriptRows, riskRows] = await Promise.all([
      db.select().from(researchAreas).where(eq(researchAreas.userId, userId)).orderBy(desc(researchAreas.createdAt)).limit(100),
      db.select().from(literatureGaps).where(eq(literatureGaps.userId, userId)).orderBy(desc(literatureGaps.priority), asc(literatureGaps.createdAt)).limit(100),
      db.select().from(hypotheses).where(eq(hypotheses.userId, userId)).orderBy(desc(hypotheses.createdAt)).limit(100),
      db.select().from(manuscripts).where(eq(manuscripts.userId, userId)).orderBy(asc(manuscripts.deadline), desc(manuscripts.createdAt)).limit(100),
      db.select().from(methodologyRisks).where(eq(methodologyRisks.userId, userId)).orderBy(desc(methodologyRisks.createdAt)).limit(100),
    ]);

    return {
      researchAreas: areaRows,
      literatureGaps: gapRows,
      hypotheses: hypothesisRows,
      manuscripts: manuscriptRows,
      methodologyRisks: riskRows,
    };
  }, emptyResearchPipelineData);
}

export type ExamPageData = {
  subjects: Subject[];
  exams: Exam[];
  topics: Topic[];
  studySessions: StudySession[];
  errorLogs: ErrorLog[];
  quizAttempts: QuizAttempt[];
  dailyLogs: DailyLog[];
};

export async function getExamPageData(): Promise<ExamPageData> {
  const userId = await getUserIdOrThrow();
  return withDb<ExamPageData>(async (db) => {
    const [s, e, t, ss, er, qa, dl] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(50),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200),
      db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(200),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(100),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(200),
      db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(90),
    ]);
    return { subjects: s, exams: e, topics: t, studySessions: ss, errorLogs: er, quizAttempts: qa, dailyLogs: dl };
  }, { subjects: [], exams: [], topics: [], studySessions: [], errorLogs: [], quizAttempts: [], dailyLogs: [] });
}

export type SubjectDetailData = {
  subjects: Subject[];
  topics: Topic[];
  studySessions: StudySession[];
  reviewItems: ReviewItem[];
  errorLogs: ErrorLog[];
  quizAttempts: QuizAttempt[];
};

export async function getSubjectDetailData(): Promise<SubjectDetailData> {
  const userId = await getUserIdOrThrow();
  return withDb<SubjectDetailData>(async (db) => {
    const [s, t, ss, ri, er, qa] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200),
      db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(200),
      db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(200),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(100),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(200),
    ]);
    return { subjects: s, topics: t, studySessions: ss, reviewItems: ri, errorLogs: er, quizAttempts: qa };
  }, { subjects: [], topics: [], studySessions: [], reviewItems: [], errorLogs: [], quizAttempts: [] });
}

export type GoalPageData = {
  subjects: Subject[];
  exams: Exam[];
  topics: Topic[];
  goals: Goal[];
  tasks: Task[];
  identityNotes: IdentityNote[];
};

export async function getGoalPageData(): Promise<GoalPageData> {
  const userId = await getUserIdOrThrow();
  return withDb<GoalPageData>(async (db) => {
    const [s, e, t, g, tk, i] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(50),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200),
      db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.priority), desc(goals.createdAt)).limit(50),
      db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.priority), asc(tasks.dueAt)).limit(50),
      db.select().from(identityNotes).where(eq(identityNotes.userId, userId)).orderBy(desc(identityNotes.createdAt)).limit(50),
    ]);
    return { subjects: s, exams: e, topics: t, goals: g, tasks: tk, identityNotes: i };
  }, { subjects: [], exams: [], topics: [], goals: [], tasks: [], identityNotes: [] });
}

export type AiPageData = {
  subjects: Subject[];
  topics: Topic[];
  errorLogs: ErrorLog[];
  reviewItems: ReviewItem[];
  exams: Exam[];
};

export async function getAiPageData(userIdOverride?: string): Promise<AiPageData> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  return withDb<AiPageData>(async (db) => {
    const [s, t, er, ri, e] = await Promise.all([
      db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
      db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(200),
      db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(100),
      db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(200),
      db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)).limit(50),
    ]);
    return { subjects: s, topics: t, errorLogs: er, reviewItems: ri, exams: e };
  }, { subjects: [], topics: [], errorLogs: [], reviewItems: [], exams: [] });
}

// ─────────────────────────────────────────────────────
// Dashboard (already optimized, used only by /dashboard)
// ─────────────────────────────────────────────────────

export type TimelinePageData = Pick<
  CoreData,
  | "exams"
  | "studySessions"
  | "reviewItems"
  | "tasks"
  | "errorLogs"
  | "professionalContacts"
  | "opportunities"
  | "dailyLogs"
>;

const emptyTimelinePageData: TimelinePageData = {
  exams: [],
  studySessions: [],
  reviewItems: [],
  tasks: [],
  errorLogs: [],
  professionalContacts: [],
  opportunities: [],
  dailyLogs: [],
};

export async function getTimelinePageData(userIdOverride?: string, days = 30): Promise<TimelinePageData> {
  const userId = userIdOverride ?? await getUserIdOrThrow();
  const today = startOfDay(new Date());
  const pastWindow = subDays(today, days);
  const nearPastWindow = subDays(today, 7);
  const futureWindow = addDays(today, days);
  const pastDate = formatISO(pastWindow, { representation: "date" });
  const nearPastDate = formatISO(nearPastWindow, { representation: "date" });
  const todayDate = formatISO(today, { representation: "date" });
  const futureDate = formatISO(futureWindow, { representation: "date" });

  return withDb<TimelinePageData>(async (db) => {
    const [examRows, sessionRows, reviewRows, taskRows, errorRows, contactRows, opportunityRows, dailyRows] =
      await Promise.all([
        db.select().from(exams)
          .where(and(eq(exams.userId, userId), gte(exams.examDate, subDays(today, 1)), lte(exams.examDate, futureWindow)))
          .orderBy(asc(exams.examDate), desc(exams.importance))
          .limit(50),
        db.select().from(studySessions)
          .where(and(eq(studySessions.userId, userId), gte(studySessions.startedAt, pastWindow), lte(studySessions.startedAt, futureWindow)))
          .orderBy(asc(studySessions.startedAt))
          .limit(200),
        db.select().from(reviewItems)
          .where(and(eq(reviewItems.userId, userId), eq(reviewItems.isActive, true), gte(reviewItems.dueAt, nearPastWindow), lte(reviewItems.dueAt, futureWindow)))
          .orderBy(asc(reviewItems.dueAt))
          .limit(200),
        db.select().from(tasks)
          .where(and(eq(tasks.userId, userId), gte(tasks.dueAt, nearPastWindow), lte(tasks.dueAt, futureWindow)))
          .orderBy(asc(tasks.dueAt), desc(tasks.priority))
          .limit(100),
        db.select().from(errorLogs)
          .where(and(eq(errorLogs.userId, userId), eq(errorLogs.resolved, false), gte(errorLogs.retestAt, nearPastWindow), lte(errorLogs.retestAt, futureWindow)))
          .orderBy(asc(errorLogs.retestAt), desc(errorLogs.severity))
          .limit(100),
        db.select().from(professionalContacts)
          .where(and(eq(professionalContacts.userId, userId), gte(professionalContacts.nextFollowUpAt, nearPastWindow), lte(professionalContacts.nextFollowUpAt, futureWindow)))
          .orderBy(asc(professionalContacts.nextFollowUpAt), desc(professionalContacts.relationshipStrength))
          .limit(100),
        db.select().from(opportunities)
          .where(and(eq(opportunities.userId, userId), gte(opportunities.deadline, nearPastDate), lte(opportunities.deadline, futureDate)))
          .orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside))
          .limit(100),
        db.select().from(dailyLogs)
          .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.date, pastDate), lte(dailyLogs.date, todayDate)))
          .orderBy(desc(dailyLogs.date))
          .limit(days + 1),
      ]);

    return {
      exams: examRows,
      studySessions: sessionRows,
      reviewItems: reviewRows,
      tasks: taskRows,
      errorLogs: errorRows,
      professionalContacts: contactRows,
      opportunities: opportunityRows,
      dailyLogs: dailyRows,
    };
  }, emptyTimelinePageData);
}

export type DashboardData = Pick<
  CoreData,
  | "subjects"
  | "exams"
  | "topics"
  | "studySessions"
  | "reviewItems"
  | "errorLogs"
  | "quizAttempts"
  | "dailyLogs"
> & {
  todayLog: DailyLog | null;
};

const emptyDashboardData: DashboardData = {
  subjects: [], exams: [], topics: [], studySessions: [], reviewItems: [],
  errorLogs: [], quizAttempts: [], dailyLogs: [], todayLog: null,
};

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await getUserId();
  const today = startOfDay(new Date());
  const todayDate = formatISO(today, { representation: "date" });
  const weekAgo = subDays(today, 6);

  return withDb<DashboardData>(async (db) => {
    const [subjectRows, examRows, topicRows, sessionRows, reviewRows, errorRows, quizRows, dailyRows, todayRows] =
      await Promise.all([
        db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
        db.select().from(exams).where(and(eq(exams.userId, userId), or(isNull(exams.examDate), gte(exams.examDate, today)))).orderBy(asc(exams.examDate), desc(exams.importance)).limit(10),
        db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(80),
        db.select().from(studySessions).where(and(eq(studySessions.userId, userId), gte(studySessions.startedAt, weekAgo))).orderBy(desc(studySessions.startedAt)),
        db.select().from(reviewItems).where(and(eq(reviewItems.userId, userId), eq(reviewItems.isActive, true), lte(reviewItems.dueAt, addDays(today, 1)))).orderBy(asc(reviewItems.dueAt)),
        db.select().from(errorLogs).where(and(eq(errorLogs.userId, userId), eq(errorLogs.resolved, false))).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)).limit(10),
        db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(50),
        db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(30),
        db.select().from(dailyLogs).where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, todayDate))).limit(1),
      ]);
    return {
      subjects: subjectRows, exams: examRows, topics: topicRows,
      studySessions: sessionRows, reviewItems: reviewRows, errorLogs: errorRows,
      quizAttempts: quizRows, dailyLogs: dailyRows, todayLog: todayRows[0] ?? null,
    };
  }, emptyDashboardData);
}

// ─────────────────────────────────────────────────────
// Flashcard-specific queries (new route: /flashcards)
// ─────────────────────────────────────────────────────

export type FlashcardFilter = {
  subjectId?: string;
  confidence?: number;
  dueStatus?: "overdue" | "today" | "week" | "all";
  search?: string;
};

export type FlashcardItem = {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string | null;
  question: string;
  answer: string | null;
  reviewType: "flashcard" | "open_question" | "feynman" | "blurting" | "quiz_prompt";
  confidence: number;
  intervalDays: number;
  dueAt: Date;
  lastReviewedAt: Date | null;
  timesReviewed: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subjectName: string | null;
  topicTitle: string | null;
};

export async function getFlashcards(filters: FlashcardFilter = {}) {
  const userId = await getUserIdOrThrow();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);

  return withDb<FlashcardItem[]>(async (db) => {
    const conditions = [eq(reviewItems.userId, userId), eq(reviewItems.reviewType, "flashcard")];

    if (filters.subjectId) {
      conditions.push(eq(reviewItems.subjectId, filters.subjectId));
    }

    if (filters.confidence !== undefined) {
      conditions.push(eq(reviewItems.confidence, filters.confidence));
    }

    if (filters.dueStatus === "overdue") {
      conditions.push(lte(reviewItems.dueAt, today));
      conditions.push(eq(reviewItems.isActive, true));
    } else if (filters.dueStatus === "today") {
      conditions.push(gte(reviewItems.dueAt, today));
      conditions.push(lte(reviewItems.dueAt, tomorrow));
      conditions.push(eq(reviewItems.isActive, true));
    } else if (filters.dueStatus === "week") {
      conditions.push(gte(reviewItems.dueAt, today));
      conditions.push(lte(reviewItems.dueAt, weekEnd));
      conditions.push(eq(reviewItems.isActive, true));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(reviewItems.question, `%${filters.search}%`),
          ilike(reviewItems.answer, `%${filters.search}%`),
        )!,
      );
    }

    const rows = await db
      .select({
        id: reviewItems.id,
        userId: reviewItems.userId,
        subjectId: reviewItems.subjectId,
        topicId: reviewItems.topicId,
        question: reviewItems.question,
        answer: reviewItems.answer,
        reviewType: reviewItems.reviewType,
        confidence: reviewItems.confidence,
        intervalDays: reviewItems.intervalDays,
        dueAt: reviewItems.dueAt,
        lastReviewedAt: reviewItems.lastReviewedAt,
        timesReviewed: reviewItems.timesReviewed,
        isActive: reviewItems.isActive,
        createdAt: reviewItems.createdAt,
        updatedAt: reviewItems.updatedAt,
        subjectName: subjects.name,
        topicTitle: topics.title,
      })
      .from(reviewItems)
      .leftJoin(subjects, eq(reviewItems.subjectId, subjects.id))
      .leftJoin(topics, eq(reviewItems.topicId, topics.id))
      .where(and(...conditions))
      .orderBy(asc(reviewItems.dueAt))
      .limit(200);

    return rows;
  }, []);
}

export { reviewItems } from "@/lib/db/schema";
export type { ReviewItem } from "@/lib/db/schema";
