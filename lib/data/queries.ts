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
  subjects: [],
  exams: [],
  topics: [],
  studySessions: [],
  reviewItems: [],
  errorLogs: [],
  quizAttempts: [],
  dailyLogs: [],
  goals: [],
  tasks: [],
  identityNotes: [],
  tartuNotes: [],
  timeBlocks: [],
  healthLogs: [],
  languageProgress: [],
  reputationEvents: [],
  opportunities: [],
  professionalContacts: [],
  lifeAdminItems: [],
  portfolioItems: [],
  strategicReviews: [],
};

export async function getCoreData(): Promise<CoreData> {
  const userId = await getUserId();

  return withDb<CoreData>(
    async (db) => {
      const [
        subjectRows,
        examRows,
        topicRows,
        sessionRows,
        reviewRows,
        errorRows,
        quizRows,
        dailyRows,
        goalRows,
        taskRows,
        identityRows,
        tartuRows,
        timeRows,
        healthRows,
        languageRows,
        reputationRows,
        opportunityRows,
        contactRows,
        lifeAdminRows,
        portfolioRows,
        strategicReviewRows,
      ] = await Promise.all([
        db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
        db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate), desc(exams.importance)),
        db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)),
        db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startedAt)).limit(200),
        db.select().from(reviewItems).where(eq(reviewItems.userId, userId)).orderBy(asc(reviewItems.dueAt)).limit(200),
        db.select().from(errorLogs).where(eq(errorLogs.userId, userId)).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)),
        db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(200),
        db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(90),
        db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.priority), desc(goals.createdAt)),
        db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.priority), asc(tasks.dueAt)),
        db.select().from(identityNotes).where(eq(identityNotes.userId, userId)).orderBy(desc(identityNotes.createdAt)),
        db.select().from(tartuNotes).where(eq(tartuNotes.userId, userId)).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)),
        db.select().from(timeBlocks).where(eq(timeBlocks.userId, userId)).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(200),
        db.select().from(healthLogs).where(eq(healthLogs.userId, userId)).orderBy(desc(healthLogs.date)).limit(120),
        db.select().from(languageProgress).where(eq(languageProgress.userId, userId)).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)),
        db.select().from(reputationEvents).where(eq(reputationEvents.userId, userId)).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)),
        db.select().from(opportunities).where(eq(opportunities.userId, userId)).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)),
        db.select().from(professionalContacts).where(eq(professionalContacts.userId, userId)).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)),
        db.select().from(lifeAdminItems).where(eq(lifeAdminItems.userId, userId)).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)),
        db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)),
        db.select().from(strategicReviews).where(eq(strategicReviews.userId, userId)).orderBy(desc(strategicReviews.date)),
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
        goals: goalRows,
        tasks: taskRows,
        identityNotes: identityRows,
        tartuNotes: tartuRows,
        timeBlocks: timeRows,
        healthLogs: healthRows,
        languageProgress: languageRows,
        reputationEvents: reputationRows,
        opportunities: opportunityRows,
        professionalContacts: contactRows,
        lifeAdminItems: lifeAdminRows,
        portfolioItems: portfolioRows,
        strategicReviews: strategicReviewRows,
      };
    },
    emptyCoreData,
  );
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
  subjects: [],
  exams: [],
  topics: [],
  studySessions: [],
  reviewItems: [],
  errorLogs: [],
  quizAttempts: [],
  dailyLogs: [],
  todayLog: null,
};

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await getUserId();
  const today = startOfDay(new Date());
  const todayDate = formatISO(today, { representation: "date" });
  const weekAgo = subDays(today, 6);

  return withDb<DashboardData>(
    async (db) => {
      const [
        subjectRows,
        examRows,
        topicRows,
        sessionRows,
        reviewRows,
        errorRows,
        quizRows,
        dailyRows,
        todayRows,
      ] = await Promise.all([
        db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name)),
        db
          .select()
          .from(exams)
          .where(and(eq(exams.userId, userId), or(isNull(exams.examDate), gte(exams.examDate, today))))
          .orderBy(asc(exams.examDate), desc(exams.importance))
          .limit(10),
        db.select().from(topics).where(eq(topics.userId, userId)).orderBy(desc(topics.priority), asc(topics.title)).limit(80),
        db
          .select()
          .from(studySessions)
          .where(and(eq(studySessions.userId, userId), gte(studySessions.startedAt, weekAgo)))
          .orderBy(desc(studySessions.startedAt)),
        db
          .select()
          .from(reviewItems)
          .where(
            and(eq(reviewItems.userId, userId), eq(reviewItems.isActive, true), lte(reviewItems.dueAt, addDays(today, 1))),
          )
          .orderBy(asc(reviewItems.dueAt)),
        db
          .select()
          .from(errorLogs)
          .where(and(eq(errorLogs.userId, userId), eq(errorLogs.resolved, false)))
          .orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt))
          .limit(10),
        db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.date)).limit(50),
        db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date)).limit(30),
        db.select().from(dailyLogs).where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, todayDate))).limit(1),
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
        todayLog: todayRows[0] ?? null,
      };
    },
    emptyDashboardData,
  );
}
