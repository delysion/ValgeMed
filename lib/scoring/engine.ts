import { differenceInCalendarDays, isAfter, subDays } from "date-fns";

import type {
  DailyLog,
  ErrorLog,
  HealthLog,
  LanguageProgress,
  LifeAdminItem,
  Opportunity,
  PortfolioItem,
  ProfessionalContact,
  QuizAttempt,
  ReputationEvent,
  StudySession,
  StrategicReview,
  TartuNote,
  TimeBlock,
  Topic,
} from "@/lib/db/schema";
import { asNumber, clamp } from "@/lib/utils";

export type ScoreFactor = {
  label: string;
  value: number;
  weight: number;
  impact: number;
  direction: "positive" | "negative";
};

export type ScoreResult = {
  score: number;
  factors: ScoreFactor[];
  note: string;
};

export const readinessWeights = {
  topicCompletion: 0.3,
  activeRecallScore: 0.25,
  quizScore: 0.2,
  errorResolution: 0.15,
  consistencyScore: 0.1,
  burnoutRisk: -0.2,
};

export const efficiencyWeights = {
  outputQuality: 0.3,
  focusLevel: 0.25,
  activeRecallRatio: 0.25,
  quizAccuracy: 0.2,
  passiveStudyPenalty: -0.2,
  fatiguePenalty: -0.15,
};

export const burnoutWeights = {
  lowSleepScore: 0.3,
  stressScore: 0.25,
  decliningAccuracyScore: 0.2,
  excessiveMinutesScore: 0.15,
  lowEnergyScore: 0.1,
};

const scoreNote =
  "Indicatore euristico in scala 0-10: utile per decidere il prossimo passo, non una verita assoluta.";

function factor(
  label: string,
  value: number,
  weight: number,
  direction: "positive" | "negative" = weight >= 0 ? "positive" : "negative",
): ScoreFactor {
  return {
    label,
    value: clamp(value),
    weight,
    impact: clamp(value) * weight,
    direction,
  };
}

function weightedScore(factors: ScoreFactor[]) {
  return clamp(factors.reduce((total, current) => total + current.impact, 0));
}

export function calculateExamReadinessScore(input: {
  topicCompletion: number;
  activeRecallScore: number;
  quizScore: number;
  errorResolution: number;
  consistencyScore: number;
  burnoutRisk: number;
}): ScoreResult {
  const factors = [
    factor("scoring.topicCompletion", input.topicCompletion, readinessWeights.topicCompletion),
    factor("scoring.activeRecall", input.activeRecallScore, readinessWeights.activeRecallScore),
    factor("scoring.quizSimulations", input.quizScore, readinessWeights.quizScore),
    factor("scoring.errorsResolved", input.errorResolution, readinessWeights.errorResolution),
    factor("scoring.recentConsistency", input.consistencyScore, readinessWeights.consistencyScore),
    factor("scoring.burnoutRisk", input.burnoutRisk, readinessWeights.burnoutRisk, "negative"),
  ];

  return {
    score: weightedScore(factors),
    factors,
    note: scoreNote,
  };
}

export function calculateStudyEfficiencyScore(input: {
  outputQuality: number;
  focusLevel: number;
  activeRecallRatio: number;
  quizAccuracy: number;
  passiveStudyPenalty: number;
  fatiguePenalty: number;
}): ScoreResult {
  const factors = [
    factor("scoring.outputQuality", input.outputQuality, efficiencyWeights.outputQuality),
    factor("scoring.focus", input.focusLevel, efficiencyWeights.focusLevel),
    factor("scoring.activeRecallRatio", input.activeRecallRatio, efficiencyWeights.activeRecallRatio),
    factor("scoring.quizAccuracy", input.quizAccuracy, efficiencyWeights.quizAccuracy),
    factor(
      "scoring.passiveStudyPenalty",
      input.passiveStudyPenalty,
      efficiencyWeights.passiveStudyPenalty,
      "negative",
    ),
    factor(
      "scoring.fatiguePenalty",
      input.fatiguePenalty,
      efficiencyWeights.fatiguePenalty,
      "negative",
    ),
  ];

  return {
    score: weightedScore(factors),
    factors,
    note: scoreNote,
  };
}

export function calculateBurnoutRisk(input: {
  lowSleepScore: number;
  stressScore: number;
  decliningAccuracyScore: number;
  excessiveMinutesScore: number;
  lowEnergyScore: number;
}): ScoreResult {
  const factors = [
    factor("scoring.insufficientSleep", input.lowSleepScore, burnoutWeights.lowSleepScore),
    factor("scoring.stress", input.stressScore, burnoutWeights.stressScore),
    factor(
      "scoring.decliningAccuracy",
      input.decliningAccuracyScore,
      burnoutWeights.decliningAccuracyScore,
    ),
    factor(
      "scoring.excessiveMinutes",
      input.excessiveMinutesScore,
      burnoutWeights.excessiveMinutesScore,
    ),
    factor("scoring.lowEnergy", input.lowEnergyScore, burnoutWeights.lowEnergyScore),
  ];

  return {
    score: weightedScore(factors),
    factors,
    note: scoreNote,
  };
}

const statusScore: Record<Topic["status"], number> = {
  not_started: 0,
  first_exposure: 2,
  understood: 4,
  recalled: 5.5,
  practiced: 7,
  error_corrected: 8,
  consolidated: 9,
  exam_ready: 10,
};

function average(values: number[], fallback = 0) {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildBurnoutRiskFromLogs(
  dailyLogs: DailyLog[],
  quizAttempts: QuizAttempt[] = [],
) {
  const recentLogs = dailyLogs
    .filter((log) => isAfter(new Date(log.date), subDays(new Date(), 14)))
    .sort((a, b) => a.date.localeCompare(b.date));
  const recentQuizzes = quizAttempts
    .filter((attempt) => isAfter(new Date(attempt.date), subDays(new Date(), 21)))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sleepAverage = average(
    recentLogs
      .map((log) => (log.sleepHours === null ? NaN : asNumber(log.sleepHours)))
      .filter(Number.isFinite),
    7.5,
  );
  const stressAverage = average(
    recentLogs
      .map((log) => (log.stressLevel === null ? NaN : asNumber(log.stressLevel)))
      .filter(Number.isFinite),
    0,
  );
  const energyAverage = average(
    recentLogs
      .map((log) => (log.energyLevel === null ? NaN : asNumber(log.energyLevel)))
      .filter(Number.isFinite),
    7,
  );
  const minutesAverage = average(
    recentLogs.map((log) => asNumber(log.studyMinutes)),
    0,
  );

  const firstHalf = recentQuizzes.slice(0, Math.floor(recentQuizzes.length / 2));
  const secondHalf = recentQuizzes.slice(Math.floor(recentQuizzes.length / 2));
  const firstAccuracy = average(firstHalf.map((quiz) => asNumber(quiz.scorePercent)), 75);
  const secondAccuracy = average(secondHalf.map((quiz) => asNumber(quiz.scorePercent)), firstAccuracy);
  const decline = Math.max(0, firstAccuracy - secondAccuracy);

  return calculateBurnoutRisk({
    lowSleepScore: clamp((7 - sleepAverage) * 2.5),
    stressScore: clamp(stressAverage),
    decliningAccuracyScore: clamp(decline / 3),
    excessiveMinutesScore: clamp((minutesAverage - 360) / 30),
    lowEnergyScore: clamp(10 - energyAverage),
  });
}

export function buildExamReadiness(input: {
  topics: Topic[];
  studySessions: StudySession[];
  errorLogs: ErrorLog[];
  quizAttempts: QuizAttempt[];
  dailyLogs: DailyLog[];
}) {
  const topicCompletion = average(
    input.topics.map((topic) => statusScore[topic.status] ?? 0),
    0,
  );
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const recentSessions = input.studySessions.filter((session) =>
    isAfter(session.startedAt, subDays(new Date(), 21)),
  );
  const activeMinutes = recentSessions
    .filter((session) => activeMethods.has(session.method))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const totalMinutes = recentSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const activeRecallScore = totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 10;
  const quizScore = average(
    input.quizAttempts.map((attempt) => asNumber(attempt.scorePercent) / 10),
    0,
  );
  const resolvedErrors = input.errorLogs.filter((error) => error.resolved).length;
  const errorResolution =
    input.errorLogs.length === 0 ? 7 : (resolvedErrors / input.errorLogs.length) * 10;
  const activeDays = new Set(
    recentSessions.map((session) => session.startedAt.toISOString().slice(0, 10)),
  ).size;
  const consistencyScore = clamp((activeDays / 7) * 10);
  const burnoutRisk = buildBurnoutRiskFromLogs(input.dailyLogs, input.quizAttempts).score;

  return calculateExamReadinessScore({
    topicCompletion,
    activeRecallScore,
    quizScore,
    errorResolution,
    consistencyScore,
    burnoutRisk,
  });
}

export function buildStudyEfficiency(input: {
  sessions: StudySession[];
  dailyLogs: DailyLog[];
  quizAttempts: QuizAttempt[];
}) {
  const recentSessions = input.sessions.filter((session) =>
    isAfter(session.startedAt, subDays(new Date(), 14)),
  );
  const totalMinutes = recentSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const activeMinutes = recentSessions
    .filter((session) =>
      ["active_recall", "quiz", "simulation", "error_review"].includes(session.method),
    )
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const passiveMinutes = recentSessions
    .filter((session) => ["reading", "notes"].includes(session.method))
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  return calculateStudyEfficiencyScore({
    outputQuality: average(recentSessions.map((session) => session.outputQuality), 0),
    focusLevel: average(recentSessions.map((session) => session.focusLevel), 0),
    activeRecallRatio: totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 10,
    quizAccuracy: average(
      input.quizAttempts
        .filter((attempt) => differenceInCalendarDays(new Date(), new Date(attempt.date)) <= 21)
        .map((attempt) => asNumber(attempt.scorePercent) / 10),
      0,
    ),
    passiveStudyPenalty: totalMinutes === 0 ? 0 : (passiveMinutes / totalMinutes) * 10,
    fatiguePenalty: buildBurnoutRiskFromLogs(input.dailyLogs, input.quizAttempts).score,
  });
}

export const eliteIndexWeights = {
  medicalMastery: 0.25,
  examReadiness: 0.2,
  timeLeverage: 0.15,
  errorDestruction: 0.15,
  energyIntegrity: 0.1,
  estoniaIntegration: 0.05,
  reputationCapital: 0.05,
  opportunityCapture: 0.05,
};

export function calculateTimeLeverageScore(input: {
  plannedExecution: number;
  leverageAverage: number;
  activeBlockRatio: number;
  recoveryProtection: number;
}): ScoreResult {
  const factors = [
    factor("scoring.plannedVsActual", input.plannedExecution, 0.3),
    factor("scoring.blockLeverage", input.leverageAverage, 0.3),
    factor("scoring.highYieldBlocks", input.activeBlockRatio, 0.25),
    factor("scoring.recoveryProtection", input.recoveryProtection, 0.15),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateMedicalMasteryScore(input: {
  topicStatus: number;
  confidence: number;
  quizAccuracy: number;
  activeRecallCoverage: number;
  openErrorPenalty: number;
}): ScoreResult {
  const factors = [
    factor("scoring.topicStatus", input.topicStatus, 0.3),
    factor("scoring.avgConfidence", input.confidence, 0.2),
    factor("scoring.quizAccuracy", input.quizAccuracy, 0.2),
    factor("scoring.activeRecallCoverage", input.activeRecallCoverage, 0.2),
    factor("scoring.openErrorPenalty", input.openErrorPenalty, -0.1, "negative"),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateErrorDestructionScore(input: {
  resolvedRatio: number;
  retestCoverage: number;
  recurrenceControl: number;
  preventionRules: number;
}): ScoreResult {
  const factors = [
    factor("scoring.errorsResolved", input.resolvedRatio, 0.35),
    factor("scoring.plannedRetests", input.retestCoverage, 0.25),
    factor("scoring.recurrenceControl", input.recurrenceControl, 0.2),
    factor("scoring.preventionRules", input.preventionRules, 0.2),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateEnergyIntegrityScore(input: {
  sleepQuality: number;
  lowFatigue: number;
  recoveryQuality: number;
  foodQuality: number;
  movementConsistency: number;
}): ScoreResult {
  const factors = [
    factor("scoring.sleepQuality", input.sleepQuality, 0.3),
    factor("scoring.lowCognitiveFatigue", input.lowFatigue, 0.25),
    factor("scoring.recovery", input.recoveryQuality, 0.2),
    factor("scoring.foodQuality", input.foodQuality, 0.15),
    factor("scoring.movement", input.movementConsistency, 0.1),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateEstoniaIntegrationScore(input: {
  estonianPractice: number;
  tartuSystems: number;
  academicCulture: number;
  adminReadiness: number;
}): ScoreResult {
  const factors = [
    factor("scoring.estonianPractice", input.estonianPractice, 0.35),
    factor("scoring.tartuRoutine", input.tartuSystems, 0.25),
    factor("scoring.academicCulture", input.academicCulture, 0.2),
    factor("scoring.adminLogistics", input.adminReadiness, 0.2),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateReputationCapitalScore(input: {
  impactSignals: number;
  followUpDiscipline: number;
  contactBase: number;
  portfolioEvidence: number;
}): ScoreResult {
  const factors = [
    factor("scoring.reliabilitySignals", input.impactSignals, 0.35),
    factor("scoring.followUp", input.followUpDiscipline, 0.2),
    factor("scoring.professionalNetwork", input.contactBase, 0.2),
    factor("scoring.portfolioEvidence", input.portfolioEvidence, 0.25),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateOpportunityCaptureScore(input: {
  trackedOpportunities: number;
  nextActions: number;
  deadlineDiscipline: number;
  strategicUpside: number;
}): ScoreResult {
  const factors = [
    factor("scoring.trackedOpportunities", input.trackedOpportunities, 0.25),
    factor("scoring.definedNextActions", input.nextActions, 0.25),
    factor("scoring.deadlineDiscipline", input.deadlineDiscipline, 0.25),
    factor("scoring.strategicUpside", input.strategicUpside, 0.25),
  ];

  return { score: weightedScore(factors), factors, note: scoreNote };
}

export function calculateEliteIndexScore(input: {
  medicalMastery: number;
  examReadiness: number;
  timeLeverage: number;
  errorDestruction: number;
  energyIntegrity: number;
  estoniaIntegration: number;
  reputationCapital: number;
  opportunityCapture: number;
}): ScoreResult & { label: string } {
  const factors = [
    factor("Medical mastery", input.medicalMastery, eliteIndexWeights.medicalMastery),
    factor("Exam readiness", input.examReadiness, eliteIndexWeights.examReadiness),
    factor("Time leverage", input.timeLeverage, eliteIndexWeights.timeLeverage),
    factor("Error destruction", input.errorDestruction, eliteIndexWeights.errorDestruction),
    factor("Energy integrity", input.energyIntegrity, eliteIndexWeights.energyIntegrity),
    factor("Estonia integration", input.estoniaIntegration, eliteIndexWeights.estoniaIntegration),
    factor("Reputation capital", input.reputationCapital, eliteIndexWeights.reputationCapital),
    factor("Opportunity capture", input.opportunityCapture, eliteIndexWeights.opportunityCapture),
  ];
  const score = weightedScore(factors);

  return {
    score,
    factors,
    label: getEliteIndexLabel(score),
    note: "Segnale strategico in scala 0-10: non e una verita oggettiva, serve a scegliere il prossimo passo.",
  };
}

export function getEliteIndexLabel(score: number) {
  if (score < 3) {
    return "Fragmented";
  }

  if (score < 5) {
    return "Disciplined but unstable";
  }

  if (score < 7) {
    return "Strong student";
  }

  if (score < 8.5) {
    return "Elite trajectory";
  }

  return "National-level trajectory";
}

export function buildTimeLeverageScore(timeBlocks: TimeBlock[]) {
  const recent = timeBlocks.filter((block) => isAfter(new Date(block.date), subDays(new Date(), 14)));
  const planned = recent.reduce((sum, block) => sum + block.plannedMinutes, 0);
  const actual = recent.reduce((sum, block) => sum + block.actualMinutes, 0);
  const activeBlocks = recent.filter((block) =>
    ["study", "review", "simulation", "language", "opportunity"].includes(block.blockType),
  );
  const recoveryBlocks = recent.filter((block) => block.blockType === "recovery");

  return calculateTimeLeverageScore({
    plannedExecution: planned === 0 ? 0 : clamp((Math.min(actual, planned) / planned) * 10),
    leverageAverage: average(recent.map((block) => block.leverageScore), 0),
    activeBlockRatio: recent.length === 0 ? 0 : (activeBlocks.length / recent.length) * 10,
    recoveryProtection: recoveryBlocks.length === 0 ? 3 : clamp(recoveryBlocks.length * 2),
  });
}

export function buildMedicalMasteryScore(input: {
  topics: Topic[];
  studySessions: StudySession[];
  quizAttempts: QuizAttempt[];
  errorLogs: ErrorLog[];
}) {
  const totalMinutes = input.studySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const activeMinutes = input.studySessions
    .filter((session) => ["active_recall", "quiz", "simulation", "error_review"].includes(session.method))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const openErrors = input.errorLogs.filter((error) => !error.resolved);

  return calculateMedicalMasteryScore({
    topicStatus: average(input.topics.map((topic) => statusScore[topic.status] ?? 0), 0),
    confidence: average(input.topics.map((topic) => topic.confidence), 0),
    quizAccuracy: average(input.quizAttempts.map((attempt) => asNumber(attempt.scorePercent) / 10), 0),
    activeRecallCoverage: totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 10,
    openErrorPenalty: clamp(openErrors.length + average(openErrors.map((error) => error.severity), 0) / 2),
  });
}

export function buildErrorDestructionScore(errorLogs: ErrorLog[]) {
  const resolved = errorLogs.filter((error) => error.resolved);
  const withRetest = errorLogs.filter((error) => error.retestAt);
  const withRules = errorLogs.filter((error) => error.preventionRule);
  const recurrenceAverage = average(errorLogs.map((error) => error.recurrenceCount), 0);

  return calculateErrorDestructionScore({
    resolvedRatio: errorLogs.length === 0 ? 6 : (resolved.length / errorLogs.length) * 10,
    retestCoverage: errorLogs.length === 0 ? 5 : (withRetest.length / errorLogs.length) * 10,
    recurrenceControl: clamp(10 - recurrenceAverage * 2),
    preventionRules: errorLogs.length === 0 ? 5 : (withRules.length / errorLogs.length) * 10,
  });
}

export function buildEnergyIntegrityScore(healthLogs: HealthLog[], dailyLogs: DailyLog[]) {
  const recentHealth = healthLogs.filter((log) => isAfter(new Date(log.date), subDays(new Date(), 14)));
  const recentDaily = dailyLogs.filter((log) => isAfter(new Date(log.date), subDays(new Date(), 14)));
  const movementDays =
    recentHealth.length === 0
      ? recentDaily.filter((log) => log.movementDone).length
      : recentHealth.filter((log) => log.movementDone).length;
  const movementBase = Math.max(recentHealth.length, recentDaily.length);

  return calculateEnergyIntegrityScore({
    sleepQuality: average(
      recentHealth.map((log) => (log.sleepQuality === null ? NaN : log.sleepQuality)).filter(Number.isFinite),
      average(
        recentDaily
          .map((log) => (log.sleepHours === null ? NaN : clamp((asNumber(log.sleepHours) / 8) * 10)))
          .filter(Number.isFinite),
        0,
      ),
    ),
    lowFatigue: average(
      recentHealth
        .map((log) => (log.cognitiveFatigue === null ? NaN : 10 - log.cognitiveFatigue))
        .filter(Number.isFinite),
      average(
        recentDaily
          .map((log) => (log.energyLevel === null ? NaN : log.energyLevel))
          .filter(Number.isFinite),
        0,
      ),
    ),
    recoveryQuality: average(
      recentHealth.map((log) => (log.recoveryQuality === null ? NaN : log.recoveryQuality)).filter(Number.isFinite),
      0,
    ),
    foodQuality: average(
      recentHealth.map((log) => (log.foodQuality === null ? NaN : log.foodQuality)).filter(Number.isFinite),
      0,
    ),
    movementConsistency: movementBase === 0 ? 0 : (movementDays / movementBase) * 10,
  });
}

export function buildEstoniaIntegrationScore(input: {
  languageProgress: LanguageProgress[];
  tartuNotes: TartuNote[];
  lifeAdminItems: LifeAdminItem[];
}) {
  const estonianMinutes = input.languageProgress
    .filter((item) => item.language === "estonian")
    .reduce((sum, item) => sum + item.minutes, 0);
  const cultureNotes = input.tartuNotes.filter((note) => note.category === "academic_culture");
  const adminItems = input.lifeAdminItems.filter((item) =>
    ["documents", "housing", "university"].includes(item.category),
  );
  const adminDone = adminItems.filter((item) => item.status === "done").length;

  return calculateEstoniaIntegrationScore({
    estonianPractice: clamp(estonianMinutes / 30),
    tartuSystems: clamp(input.tartuNotes.length * 1.5),
    academicCulture: clamp(cultureNotes.length * 2.5),
    adminReadiness: adminItems.length === 0 ? 4 : (adminDone / adminItems.length) * 10,
  });
}

export function buildReputationCapitalScore(input: {
  reputationEvents: ReputationEvent[];
  professionalContacts: ProfessionalContact[];
  portfolioItems: PortfolioItem[];
}) {
  const activePortfolio = input.portfolioItems.filter((item) => item.status === "active");
  const followUps = input.reputationEvents.filter((event) => event.followUpAt);

  return calculateReputationCapitalScore({
    impactSignals: average(input.reputationEvents.map((event) => event.impact), 0),
    followUpDiscipline:
      input.reputationEvents.length === 0 ? 0 : (followUps.length / input.reputationEvents.length) * 10,
    contactBase: clamp(input.professionalContacts.length * 1.5),
    portfolioEvidence: clamp(
      activePortfolio.length + average(activePortfolio.map((item) => item.strategicValue), 0) / 2,
    ),
  });
}

export function buildOpportunityCaptureScore(opportunities: Opportunity[]) {
  const active = opportunities.filter((item) => !["passed", "archived"].includes(item.status));
  const withNextAction = active.filter((item) => item.nextAction);
  const withDeadline = active.filter((item) => item.deadline);

  return calculateOpportunityCaptureScore({
    trackedOpportunities: clamp(active.length * 2),
    nextActions: active.length === 0 ? 0 : (withNextAction.length / active.length) * 10,
    deadlineDiscipline: active.length === 0 ? 0 : (withDeadline.length / active.length) * 10,
    strategicUpside: average(active.map((item) => item.strategicUpside), 0),
  });
}

export function buildEliteIndex(input: {
  topics: Topic[];
  studySessions: StudySession[];
  quizAttempts: QuizAttempt[];
  errorLogs: ErrorLog[];
  dailyLogs: DailyLog[];
  healthLogs: HealthLog[];
  timeBlocks: TimeBlock[];
  languageProgress: LanguageProgress[];
  tartuNotes: TartuNote[];
  lifeAdminItems: LifeAdminItem[];
  reputationEvents: ReputationEvent[];
  professionalContacts: ProfessionalContact[];
  portfolioItems: PortfolioItem[];
  opportunities: Opportunity[];
  strategicReviews?: StrategicReview[];
}) {
  const medicalMastery = buildMedicalMasteryScore(input);
  const examReadiness = buildExamReadiness(input);
  const timeLeverage = buildTimeLeverageScore(input.timeBlocks);
  const errorDestruction = buildErrorDestructionScore(input.errorLogs);
  const energyIntegrity = buildEnergyIntegrityScore(input.healthLogs, input.dailyLogs);
  const estoniaIntegration = buildEstoniaIntegrationScore(input);
  const reputationCapital = buildReputationCapitalScore(input);
  const opportunityCapture = buildOpportunityCaptureScore(input.opportunities);

  return {
    medicalMastery,
    examReadiness,
    timeLeverage,
    errorDestruction,
    energyIntegrity,
    estoniaIntegration,
    reputationCapital,
    opportunityCapture,
    eliteIndex: calculateEliteIndexScore({
      medicalMastery: medicalMastery.score,
      examReadiness: examReadiness.score,
      timeLeverage: timeLeverage.score,
      errorDestruction: errorDestruction.score,
      energyIntegrity: energyIntegrity.score,
      estoniaIntegration: estoniaIntegration.score,
      reputationCapital: reputationCapital.score,
      opportunityCapture: opportunityCapture.score,
    }),
  };
}
