import "server-only";

import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { addDays, formatISO, startOfDay, subDays } from "date-fns";

import { getUserId } from "@/lib/db/auth";
import { withDb } from "@/lib/db";
import {
  dailyLogs,
  errorLogs,
  exams,
  goals,
  healthLogs,
  identityNotes,
  languageProgress,
  lifeAdminItems,
  opportunities,
  portfolioItems,
  professionalContacts,
  quizAttempts,
  reviewItems,
  reputationEvents,
  studySessions,
  strategicReviews,
  subjects,
  tartuNotes,
  tasks,
  timeBlocks,
  topics,
  type DailyLog,
  type ErrorLog,
  type Exam,
  type Goal,
  type HealthLog,
  type IdentityNote,
  type LanguageProgress,
  type LifeAdminItem,
  type Opportunity,
  type PortfolioItem,
  type ProfessionalContact,
  type QuizAttempt,
  type ReviewItem,
  type ReputationEvent,
  type StudySession,
  type StrategicReview,
  type Subject,
  type TartuNote,
  type Task,
  type TimeBlock,
  type Topic,
} from "@/lib/db/schema";

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
export async function getCoreData(): Promise<CoreData> {
  const userId = await getUserId();
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

async function getUserIdOrThrow() {
  const uid = await getUserId();
  return uid;
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

export async function getAiPageData(): Promise<AiPageData> {
  const userId = await getUserIdOrThrow();
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
