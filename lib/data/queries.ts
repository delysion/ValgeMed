import "server-only";

import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { addDays, formatISO, startOfDay, subDays } from "date-fns";

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
        db.select().from(subjects).orderBy(asc(subjects.name)),
        db.select().from(exams).orderBy(asc(exams.examDate), desc(exams.importance)),
        db.select().from(topics).orderBy(desc(topics.priority), asc(topics.title)),
        db.select().from(studySessions).orderBy(desc(studySessions.startedAt)).limit(200),
        db.select().from(reviewItems).orderBy(asc(reviewItems.dueAt)).limit(200),
        db.select().from(errorLogs).orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt)),
        db.select().from(quizAttempts).orderBy(desc(quizAttempts.date)).limit(200),
        db.select().from(dailyLogs).orderBy(desc(dailyLogs.date)).limit(90),
        db.select().from(goals).orderBy(desc(goals.priority), desc(goals.createdAt)),
        db.select().from(tasks).orderBy(desc(tasks.priority), asc(tasks.dueAt)),
        db.select().from(identityNotes).orderBy(desc(identityNotes.createdAt)),
        db.select().from(tartuNotes).orderBy(desc(tartuNotes.priority), desc(tartuNotes.createdAt)),
        db.select().from(timeBlocks).orderBy(desc(timeBlocks.date), desc(timeBlocks.createdAt)).limit(200),
        db.select().from(healthLogs).orderBy(desc(healthLogs.date)).limit(120),
        db.select().from(languageProgress).orderBy(asc(languageProgress.nextPracticeAt), desc(languageProgress.createdAt)),
        db.select().from(reputationEvents).orderBy(desc(reputationEvents.eventDate), desc(reputationEvents.impact)),
        db.select().from(opportunities).orderBy(asc(opportunities.deadline), desc(opportunities.strategicUpside)),
        db.select().from(professionalContacts).orderBy(desc(professionalContacts.relationshipStrength), asc(professionalContacts.nextFollowUpAt)),
        db.select().from(lifeAdminItems).orderBy(desc(lifeAdminItems.priority), asc(lifeAdminItems.dueAt)),
        db.select().from(portfolioItems).orderBy(desc(portfolioItems.date), desc(portfolioItems.createdAt)),
        db.select().from(strategicReviews).orderBy(desc(strategicReviews.date)),
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
        db.select().from(subjects).orderBy(asc(subjects.name)),
        db
          .select()
          .from(exams)
          .where(or(isNull(exams.examDate), gte(exams.examDate, today)))
          .orderBy(asc(exams.examDate), desc(exams.importance))
          .limit(10),
        db.select().from(topics).orderBy(desc(topics.priority), asc(topics.title)).limit(80),
        db
          .select()
          .from(studySessions)
          .where(gte(studySessions.startedAt, weekAgo))
          .orderBy(desc(studySessions.startedAt)),
        db
          .select()
          .from(reviewItems)
          .where(
            and(eq(reviewItems.isActive, true), lte(reviewItems.dueAt, addDays(today, 1))),
          )
          .orderBy(asc(reviewItems.dueAt)),
        db
          .select()
          .from(errorLogs)
          .where(eq(errorLogs.resolved, false))
          .orderBy(desc(errorLogs.severity), desc(errorLogs.createdAt))
          .limit(10),
        db.select().from(quizAttempts).orderBy(desc(quizAttempts.date)).limit(50),
        db.select().from(dailyLogs).orderBy(desc(dailyLogs.date)).limit(30),
        db.select().from(dailyLogs).where(eq(dailyLogs.date, todayDate)).limit(1),
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
