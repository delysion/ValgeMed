import { differenceInCalendarDays, isBefore, startOfToday } from "date-fns";

import type {
  DailyLog,
  ErrorLog,
  Exam,
  LanguageProgress,
  LifeAdminItem,
  Opportunity,
  ReputationEvent,
  ReviewItem,
  Topic,
} from "@/lib/db/schema";

export type NextBestAction = {
  kind:
    | "recovery"
    | "simulation"
    | "error_review"
    | "spaced_review"
    | "active_recall"
    | "quiz"
    | "light_consolidation"
    | "priority_topic"
    | "language_move"
    | "opportunity_capture"
    | "reputation_signal"
    | "life_admin";
  title: string;
  reason: string;
  href: string;
};

export function getNextBestAction(input: {
  burnoutRisk: number;
  exams: Array<Exam & { liveReadiness?: number }>;
  reviewItems: ReviewItem[];
  errorLogs: ErrorLog[];
  topics: Topic[];
  todayLog?: DailyLog | null;
  energyIntegrity?: number;
  languageProgress?: LanguageProgress[];
  opportunities?: Opportunity[];
  reputationEvents?: ReputationEvent[];
  lifeAdminItems?: LifeAdminItem[];
}): NextBestAction {
  const today = startOfToday();

  if (input.burnoutRisk >= 8 || (input.energyIntegrity !== undefined && input.energyIntegrity < 4)) {
    return {
      kind: "recovery",
      title: "Recovery + light review",
      reason:
        input.energyIntegrity !== undefined && input.energyIntegrity < 4
          ? "Energy Integrity sotto 4/10: oggi proteggi sonno, recupero e consolidamento leggero."
          : "Il rischio burnout e alto: oggi conviene consolidare senza forzare.",
      href: "/health",
    };
  }

  const examByRisk = input.exams
    .filter((exam) => exam.riskLevel >= 8)
    .sort((a, b) => b.riskLevel - a.riskLevel)[0];

  if (examByRisk) {
    return {
      kind: "simulation",
      title: "Exam battle plan",
      reason: `${examByRisk.title} ha risk level ${examByRisk.riskLevel}/10: serve simulazione o piano di battaglia.`,
      href: `/exams/${examByRisk.id}`,
    };
  }

  const riskyExam = input.exams
    .filter((exam) => exam.examDate)
    .map((exam) => ({
      exam,
      days: differenceInCalendarDays(exam.examDate as Date, today),
      readiness: exam.liveReadiness ?? exam.readinessScore,
    }))
    .filter((item) => item.days >= 0 && item.days <= 21 && item.readiness < 6)
    .sort((a, b) => a.days - b.days)[0];

  if (riskyExam) {
    return {
      kind: "simulation",
      title: "Exam simulation",
      reason: `${riskyExam.exam.title} e vicino e readiness e sotto 6/10.`,
      href: `/exams/${riskyExam.exam.id}`,
    };
  }

  const severeOpenError = input.errorLogs
    .filter((error) => !error.resolved && error.severity >= 7)
    .sort((a, b) => b.severity - a.severity)[0];

  if (severeOpenError) {
    return {
      kind: "error_review",
      title: "Error review mirata",
      reason: `Errore aperto ad alta severita: ${severeOpenError.title}.`,
      href: "/errors",
    };
  }

  const dueReview = input.reviewItems.find(
    (item) =>
      item.isActive &&
      (isBefore(item.dueAt, today) ||
        differenceInCalendarDays(item.dueAt, today) === 0),
  );

  if (dueReview) {
    return {
      kind: "spaced_review",
      title: "Spaced review due",
      reason: "Ci sono item in scadenza oggi o arretrati.",
      href: "/reviews",
    };
  }

  const fragileTopic = input.topics
    .filter((topic) => topic.confidence <= 3)
    .sort((a, b) => b.priority + b.difficulty - (a.priority + a.difficulty))[0];

  if (fragileTopic) {
    return {
      kind: "active_recall",
      title: "Active recall su topic fragile",
      reason: `${fragileTopic.title} ha confidence <= 3.`,
      href: "/topics",
    };
  }

  if (
    input.todayLog &&
    input.todayLog.passiveStudyMinutes > 90 &&
    input.todayLog.passiveStudyMinutes > input.todayLog.activeRecallMinutes
  ) {
    return {
      kind: "quiz",
      title: "Converti passivo in quiz",
      reason: "Oggi lo studio passivo sta superando troppo l'active recall.",
      href: "/study-sessions",
    };
  }

  if (input.todayLog?.energyLevel !== null && input.todayLog?.energyLevel !== undefined) {
    if (input.todayLog.energyLevel <= 3) {
      return {
        kind: "light_consolidation",
        title: "Consolidamento leggero",
        reason: "Energia bassa: meglio ripasso leggero e chiusura ordinata.",
        href: "/reviews",
      };
    }
  }

  const neglectedLanguage = input.languageProgress
    ?.filter((item) => {
      if (!item.nextPracticeAt) {
        return item.language === "estonian" && item.minutes < 60;
      }

      return differenceInCalendarDays(item.nextPracticeAt, today) <= 0;
    })
    .sort((a, b) => a.confidence - b.confidence)[0];

  if (neglectedLanguage) {
    return {
      kind: "language_move",
      title: "Language move",
      reason: `${neglectedLanguage.title} richiede una micro-sessione: Estonia integration non deve restare teorica.`,
      href: "/language",
    };
  }

  const deadlineOpportunity = input.opportunities
    ?.filter((item) => item.deadline && !["passed", "archived"].includes(item.status))
    .map((item) => ({ item, days: differenceInCalendarDays(item.deadline as string, today) }))
    .filter(({ days }) => days >= 0 && days <= 14)
    .sort((a, b) => a.days - b.days || b.item.strategicUpside - a.item.strategicUpside)[0];

  if (deadlineOpportunity) {
    return {
      kind: "opportunity_capture",
      title: "Opportunity capture",
      reason: `${deadlineOpportunity.item.title} scade tra ${deadlineOpportunity.days} giorni: definisci o completa la next action.`,
      href: "/opportunities",
    };
  }

  const recentReputationSignals =
    input.reputationEvents?.filter(
      (event) => differenceInCalendarDays(today, new Date(event.eventDate)) <= 14,
    ).length ?? 0;

  if (input.reputationEvents && recentReputationSignals === 0) {
    return {
      kind: "reputation_signal",
      title: "Quiet reputation signal",
      reason: "Nessun segnale recente: scegli una domanda precisa, un contributo utile o una prova di affidabilita.",
      href: "/reputation",
    };
  }

  const overdueLifeAdmin = input.lifeAdminItems
    ?.filter((item) => item.dueAt && item.status !== "done" && differenceInCalendarDays(item.dueAt, today) <= 0)
    .sort((a, b) => b.priority - a.priority)[0];

  if (overdueLifeAdmin) {
    return {
      kind: "life_admin",
      title: "Life admin closure",
      reason: `${overdueLifeAdmin.title} e aperto o in scadenza: togli attrito prima che diventi rumore mentale.`,
      href: "/life-admin",
    };
  }

  const priorityTopic = input.topics
    .slice()
    .sort((a, b) => b.priority + b.difficulty - (a.priority + a.difficulty))[0];

  return {
    kind: "priority_topic",
    title: priorityTopic ? `Topic prioritario: ${priorityTopic.title}` : "Pianifica il primo topic",
    reason: priorityTopic
      ? "Nessun allarme immediato: scegli il topic con priorita e difficolta piu alte."
      : "Aggiungi materie e topics per avviare il sistema operativo di studio.",
    href: priorityTopic ? "/topics" : "/subjects",
  };
}
