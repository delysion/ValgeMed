import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { addDays, formatISO, subDays } from "date-fns";
import { drizzle } from "drizzle-orm/neon-http";

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
  schema,
  studySessions,
  strategicReviews,
  subjects,
  tartuNotes,
  tasks,
  timeBlocks,
  topics,
} from "../lib/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL missing. Configure .env before seeding.");
  process.exit(1);
}

const db = drizzle(neon(databaseUrl), { schema });

const SEED_USER_ID = "seed-user-00000000-0000-0000-0000-000000000001";

await db.delete(identityNotes);
await db.delete(strategicReviews);
await db.delete(portfolioItems);
await db.delete(lifeAdminItems);
await db.delete(professionalContacts);
await db.delete(opportunities);
await db.delete(reputationEvents);
await db.delete(languageProgress);
await db.delete(healthLogs);
await db.delete(timeBlocks);
await db.delete(tartuNotes);
await db.delete(tasks);
await db.delete(goals);
await db.delete(dailyLogs);
await db.delete(quizAttempts);
await db.delete(errorLogs);
await db.delete(reviewItems);
await db.delete(studySessions);
await db.delete(topics);
await db.delete(exams);
await db.delete(subjects);

const [anatomy, chemistry] = await db
  .insert(subjects)
  .values([
    {
      userId: SEED_USER_ID,
      name: "Human Anatomy",
      code: "MED-ANAT",
      description: "Gross anatomy, bones, vessels, nerves.",
      color: "#a8d8ff",
      difficulty: 8,
      importance: 10,
    },
    {
      userId: SEED_USER_ID,
      name: "Medical Chemistry",
      code: "MED-CHEM",
      description: "Foundations for biochemistry and physiology.",
      color: "#b9a7ff",
      difficulty: 7,
      importance: 8,
    },
    {
      userId: SEED_USER_ID,
      name: "Biochemistry",
      code: "MED-BIOCHEM",
      description: "Metabolism, enzymes, molecular foundations.",
      color: "#8fb7ff",
      difficulty: 8,
      importance: 9,
    },
    {
      userId: SEED_USER_ID,
      name: "Histology",
      code: "MED-HIST",
      description: "Tissue recognition and microscopic structure.",
      color: "#c4b5fd",
      difficulty: 7,
      importance: 8,
    },
    {
      userId: SEED_USER_ID,
      name: "Physiology",
      code: "MED-PHYS",
      description: "Systems physiology and mechanisms.",
      color: "#93c5fd",
      difficulty: 8,
      importance: 10,
    },
    {
      userId: SEED_USER_ID,
      name: "Dental Anatomy",
      code: "DENT-ANAT",
      description: "Tooth morphology, occlusion foundations, dental terminology.",
      color: "#a7f3d0",
      difficulty: 8,
      importance: 9,
    },
    {
      userId: SEED_USER_ID,
      name: "Latin Medical Terminology",
      code: "LAT-MED",
      description: "Latin terms for anatomy and clinical vocabulary.",
      color: "#e5e7eb",
      difficulty: 5,
      importance: 7,
    },
    {
      userId: SEED_USER_ID,
      name: "Estonian for Clinical Life",
      code: "EST-A1",
      description: "Language layer for Tartu life and future patients.",
      color: "#d8dee9",
      difficulty: 5,
      importance: 7,
    },
  ])
  .returning();

const [anatomyExam, chemistryExam] = await db
  .insert(exams)
  .values([
    {
      userId: SEED_USER_ID,
      subjectId: anatomy.id,
      title: "Anatomy practical block exam",
      examDate: addDays(new Date(), 28),
      ects: 6,
      format: "practical",
      difficulty: 9,
      importance: 10,
      riskLevel: 6,
      notes: "Prioritize spatial recall and error retesting.",
    },
    {
      userId: SEED_USER_ID,
      subjectId: chemistry.id,
      title: "Chemistry written exam",
      examDate: addDays(new Date(), 42),
      ects: 4,
      format: "written",
      difficulty: 7,
      importance: 8,
      riskLevel: 4,
    },
  ])
  .returning();

const [brachialPlexus, skullBase, acidBase] = await db
  .insert(topics)
  .values([
    {
      userId: SEED_USER_ID,
      subjectId: anatomy.id,
      examId: anatomyExam.id,
      title: "Brachial plexus",
      status: "recalled",
      difficulty: 9,
      priority: 9,
      confidence: 4,
      lastStudiedAt: subDays(new Date(), 2),
      nextReviewAt: addDays(new Date(), 1),
    },
    {
      userId: SEED_USER_ID,
      subjectId: anatomy.id,
      examId: anatomyExam.id,
      title: "Skull base foramina",
      status: "first_exposure",
      difficulty: 8,
      priority: 8,
      confidence: 2,
      nextReviewAt: new Date(),
    },
    {
      userId: SEED_USER_ID,
      subjectId: chemistry.id,
      examId: chemistryExam.id,
      title: "Acid-base buffers",
      status: "practiced",
      difficulty: 6,
      priority: 6,
      confidence: 6,
      lastStudiedAt: subDays(new Date(), 1),
      nextReviewAt: addDays(new Date(), 3),
    },
  ])
  .returning();

await db.insert(studySessions).values([
  {
    userId: SEED_USER_ID,
    subjectId: anatomy.id,
    topicId: brachialPlexus.id,
    examId: anatomyExam.id,
    startedAt: subDays(new Date(), 2),
    durationMinutes: 70,
    method: "active_recall",
    focusLevel: 8,
    energyLevel: 7,
    outputQuality: 8,
    notes: "Blank page recall and nerve branch map.",
  },
  {
    userId: SEED_USER_ID,
    subjectId: chemistry.id,
    topicId: acidBase.id,
    examId: chemistryExam.id,
    startedAt: subDays(new Date(), 1),
    durationMinutes: 55,
    method: "quiz",
    focusLevel: 7,
    energyLevel: 6,
    outputQuality: 7,
  },
  {
    userId: SEED_USER_ID,
    subjectId: anatomy.id,
    topicId: skullBase.id,
    examId: anatomyExam.id,
    startedAt: new Date(),
    durationMinutes: 45,
    method: "reading",
    focusLevel: 6,
    energyLevel: 5,
    outputQuality: 5,
  },
]);

await db.insert(reviewItems).values([
  {
    userId: SEED_USER_ID,
    subjectId: anatomy.id,
    topicId: brachialPlexus.id,
    question: "Draw the brachial plexus from roots to terminal branches.",
    answer: "Roots C5-T1, trunks, divisions, cords, terminal branches.",
    reviewType: "blurting",
    confidence: 4,
    intervalDays: 2,
    dueAt: new Date(),
  },
  {
    userId: SEED_USER_ID,
    subjectId: chemistry.id,
    topicId: acidBase.id,
    question: "Explain Henderson-Hasselbalch without looking.",
    answer: "pH = pKa + log conjugate base / acid.",
    reviewType: "feynman",
    confidence: 6,
    intervalDays: 4,
    dueAt: addDays(new Date(), 2),
  },
]);

await db.insert(errorLogs).values([
  {
    userId: SEED_USER_ID,
    subjectId: anatomy.id,
    topicId: skullBase.id,
    examId: anatomyExam.id,
    title: "Foramen rotundum vs ovale",
    description: "Mixed up V2 and V3 exits during recall.",
    errorType: "memory",
    cause: "Visual map not consolidated.",
    correction: "Create one comparison card and retest in 48h.",
    preventionRule: "Always recall nerve + foramen + target area together.",
    retestAt: addDays(new Date(), 2),
    severity: 8,
    recurrenceCount: 1,
  },
]);

await db.insert(quizAttempts).values([
  {
    userId: SEED_USER_ID,
    subjectId: anatomy.id,
    topicId: brachialPlexus.id,
    examId: anatomyExam.id,
    date: formatISO(subDays(new Date(), 2), { representation: "date" }),
    totalQuestions: 20,
    correctAnswers: 15,
    scorePercent: 75,
  },
  {
    userId: SEED_USER_ID,
    subjectId: chemistry.id,
    topicId: acidBase.id,
    examId: chemistryExam.id,
    date: formatISO(subDays(new Date(), 1), { representation: "date" }),
    totalQuestions: 15,
    correctAnswers: 12,
    scorePercent: 80,
  },
]);

await db.insert(dailyLogs).values([
  {
    userId: SEED_USER_ID,
    date: formatISO(subDays(new Date(), 2), { representation: "date" }),
    sleepHours: 7.5,
    energyLevel: 7,
    stressLevel: 4,
    moodLevel: 7,
    studyMinutes: 120,
    activeRecallMinutes: 70,
    passiveStudyMinutes: 50,
    movementDone: true,
  },
  {
    userId: SEED_USER_ID,
    date: formatISO(subDays(new Date(), 1), { representation: "date" }),
    sleepHours: 6.5,
    energyLevel: 6,
    stressLevel: 5,
    moodLevel: 6,
    studyMinutes: 110,
    activeRecallMinutes: 55,
    passiveStudyMinutes: 55,
    movementDone: false,
  },
  {
    userId: SEED_USER_ID,
    date: formatISO(new Date(), { representation: "date" }),
    sleepHours: 7,
    energyLevel: 6,
    stressLevel: 4,
    moodLevel: 7,
    studyMinutes: 45,
    activeRecallMinutes: 0,
    passiveStudyMinutes: 45,
    movementDone: false,
    notes: "Need convert reading into recall before evening.",
  },
]);

await db.insert(goals).values([
  {
    userId: SEED_USER_ID,
    title: "Build anatomy recall base",
    description: "Daily blank-page recall for high-yield anatomy structures.",
    goalType: "weekly",
    targetDate: formatISO(addDays(new Date(), 7), { representation: "date" }),
    status: "active",
    priority: 9,
  },
  {
    userId: SEED_USER_ID,
    title: "Protect sleep baseline",
    description: "Keep sleep above 7h during exam build-up.",
    goalType: "health",
    status: "active",
    priority: 8,
  },
]);

await db.insert(tasks).values([
  {
    userId: SEED_USER_ID,
    title: "Create skull base error cards",
    dueAt: addDays(new Date(), 1),
    status: "todo",
    priority: 8,
    relatedSubjectId: anatomy.id,
    relatedExamId: anatomyExam.id,
    relatedTopicId: skullBase.id,
  },
]);

await db.insert(identityNotes).values([
  {
    userId: SEED_USER_ID,
    title: "Professional standard",
    content:
      "I train like a future clinician: precise, calm, evidence-aware, and kind to my nervous system.",
    category: "professional_identity",
  },
]);

await db.insert(tartuNotes).values([
  {
    userId: SEED_USER_ID,
    title: "Tartu academic culture",
    content: "Track quiet competence: precise questions, prepared seminars, reliable follow-through.",
    category: "academic_culture",
    priority: 8,
    status: "doing",
  },
  {
    userId: SEED_USER_ID,
    title: "Estonian micro-routine",
    content: "Ten minutes per day: patient-facing phrases, university vocabulary, pronunciation.",
    category: "estonian",
    priority: 7,
    status: "todo",
  },
]);

await db.insert(timeBlocks).values([
  {
    userId: SEED_USER_ID,
    date: formatISO(new Date(), { representation: "date" }),
    title: "Skull base recall block",
    blockType: "study",
    plannedMinutes: 50,
    actualMinutes: 45,
    energyCost: 5,
    leverageScore: 8,
    notes: "High-value weak topic block.",
  },
  {
    userId: SEED_USER_ID,
    date: formatISO(new Date(), { representation: "date" }),
    title: "Recovery walk",
    blockType: "recovery",
    plannedMinutes: 30,
    actualMinutes: 0,
    energyCost: 1,
    leverageScore: 6,
  },
]);

await db.insert(healthLogs).values([
  {
    userId: SEED_USER_ID,
    date: formatISO(new Date(), { representation: "date" }),
    sleepQuality: 7,
    cognitiveFatigue: 4,
    recoveryQuality: 6,
    foodQuality: 7,
    movementDone: false,
    energyIntegrityScore: 6.4,
    notes: "Good baseline, needs movement later.",
  },
]);

await db.insert(languageProgress).values([
  {
    userId: SEED_USER_ID,
    language: "estonian",
    title: "Clinical greetings and university phrases",
    category: "medical terminology",
    minutes: 35,
    confidence: 3,
    lastPracticedAt: subDays(new Date(), 3),
    nextPracticeAt: new Date(),
  },
  {
    userId: SEED_USER_ID,
    language: "latin",
    title: "Cranial bone terms",
    category: "anatomy",
    minutes: 25,
    confidence: 5,
    lastPracticedAt: subDays(new Date(), 1),
    nextPracticeAt: addDays(new Date(), 3),
  },
]);

await db.insert(reputationEvents).values([
  {
    userId: SEED_USER_ID,
    title: "Precise anatomy question after seminar",
    description: "Asked one prepared question linking foramina to cranial nerve function.",
    eventType: "precise_question_after_lecture",
    eventDate: formatISO(subDays(new Date(), 5), { representation: "date" }),
    impact: 6,
    status: "done",
  },
]);

await db.insert(opportunities).values([
  {
    userId: SEED_USER_ID,
    title: "Anatomy lab assistant shadowing",
    description: "Potential way to build competence and visibility through quiet reliability.",
    opportunityType: "shadowing",
    deadline: formatISO(addDays(new Date(), 14), { representation: "date" }),
    valueScore: 8,
    effortScore: 5,
    strategicUpside: 8,
    nextAction: "Ask academic advisor which student lab roles are realistic for first year.",
    status: "watching",
  },
]);

await db.insert(professionalContacts).values([
  {
    userId: SEED_USER_ID,
    name: "Academic advisor",
    role: "Advisor",
    institution: "University of Tartu",
    relationshipStrength: 2,
    nextFollowUpAt: addDays(new Date(), 21),
    notes: "Use only for precise, prepared questions.",
  },
]);

await db.insert(lifeAdminItems).values([
  {
    userId: SEED_USER_ID,
    title: "Collect Tartu arrival documents",
    description: "Keep admission, housing, insurance and ID documents in one checklist.",
    category: "documents",
    dueAt: addDays(new Date(), 30),
    status: "todo",
    priority: 8,
  },
]);

await db.insert(portfolioItems).values([
  {
    userId: SEED_USER_ID,
    title: "Anatomy recall map sample",
    description: "Keep a before/after evidence item for spatial recall improvement.",
    itemType: "reflection",
    date: formatISO(new Date(), { representation: "date" }),
    strategicValue: 6,
    status: "active",
  },
]);

await db.insert(strategicReviews).values([
  {
    userId: SEED_USER_ID,
    date: formatISO(new Date(), { representation: "date" }),
    reviewType: "weekly",
    wins: "Active recall blocks started; error log is concrete.",
    weaknesses: "Passive reading still leaks into study time.",
    decisions: "Every reading block must end with a retrieval artifact.",
    nextFocus: "Destroy skull base foramina confusion and protect sleep baseline.",
    eliteIndexSnapshot: 5.8,
  },
]);

console.log("Seed completato.");
