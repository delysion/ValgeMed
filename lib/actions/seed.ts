"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { subjects, topics, reviewItems, studySessions, dailyLogs } from "@/lib/db/schema";
import { getNextReviewSchedule } from "@/lib/scheduling/reviews";
import { startOfToday, formatISO } from "date-fns";
import type { Locale } from "@/lib/i18n/config";

export interface SeedResult {
  success: boolean;
  message: string;
  details?: {
    subjectsCreated?: number;
    topicsCreated?: number;
    reviewsCreated?: number;
    sessionsCreated?: number;
  };
}

const seedMessages = {
  en: {
    hasData: "There is already data in the system. Delete existing data before loading sample data.",
    success: (count: number) => `Sample data loaded: 3 subjects, 4 topics, ${count} flashcards, 2 study sessions`,
    error: "Error loading sample data",
  },
  et: {
    hasData: "Süsteemis on juba andmeid. Kustuta olemasolevad andmed enne näidisandmete laadimist.",
    success: (count: number) => `Näidisandmed laaditud: 3 ainet, 4 teemat, ${count} flashcards, 2 õppesessiooni`,
    error: "Viga näidisandmete laadimisel",
  },
};

function getSeedMsg(locale: Locale) {
  return seedMessages[locale] || seedMessages.en;
}

export async function seedSampleDataAction(locale: Locale = "en"): Promise<SeedResult> {
  const msg = getSeedMsg(locale);

  try {
    await requireOwnerSession();
    const db = getDb();
    const today = startOfToday();

    const existingSubjects = await db.select().from(subjects);
    if (existingSubjects.length > 0) {
      return {
        success: false,
        message: msg.hasData,
      };
    }

    const [biochimica] = await db
      .insert(subjects)
      .values({ name: "Biochemistry", description: "General and metabolic biochemistry" })
      .returning();

    const [anatomia] = await db
      .insert(subjects)
      .values({ name: "Anatomy", description: "Human body anatomy" })
      .returning();

    const [fisiologia] = await db
      .insert(subjects)
      .values({ name: "Physiology", description: "Physiology of body systems" })
      .returning();

    const [mitocondri] = await db
      .insert(topics)
      .values({ subjectId: biochimica.id, title: "Mitochondria", description: "Structure and function of mitochondria" })
      .returning();

    const [glicolisi] = await db
      .insert(topics)
      .values({ subjectId: biochimica.id, title: "Glycolysis", description: "Glycolytic pathway" })
      .returning();

    const [cuore] = await db
      .insert(topics)
      .values({ subjectId: anatomia.id, title: "Heart", description: "Heart anatomy" })
      .returning();

    const [SistemaNervoso] = await db
      .insert(topics)
      .values({ subjectId: fisiologia.id, title: "Nervous System", description: "Neurophysiology" })
      .returning();

    const reviewData = [
      { subjectId: biochimica.id, topicId: mitocondri.id, question: "What is the mitochondrion?", answer: "The mitochondrion is the cellular organelle responsible for ATP production through cellular respiration." },
      { subjectId: biochimica.id, topicId: mitocondri.id, question: "What is the main function of mitochondria?", answer: "Produces ATP (adenosine triphosphate) through oxidative phosphorylation." },
      { subjectId: biochimica.id, topicId: glicolisi.id, question: "Where does glycolysis occur?", answer: "In the cell cytoplasm." },
      { subjectId: biochimica.id, topicId: glicolisi.id, question: "What are the final products of glycolysis?", answer: "2 molecules of pyruvate, 2 ATP, 2 NADH." },
      { subjectId: anatomia.id, topicId: cuore.id, question: "How many chambers does the heart have?", answer: "The heart has 4 chambers: 2 atria and 2 ventricles." },
      { subjectId: fisiologia.id, topicId: SistemaNervoso.id, question: "What is the basic function of the nervous system?", answer: "Receive, process and transmit information to coordinate body functions." },
    ];

    for (const item of reviewData) {
      const nextSchedule = getNextReviewSchedule(3, 1, 0);
      await db.insert(reviewItems).values({
        subjectId: item.subjectId,
        topicId: item.topicId,
        question: item.question,
        answer: item.answer,
        intervalDays: nextSchedule.intervalDays,
        dueAt: nextSchedule.dueAt,
      });
    }

    const session1 = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    await db.insert(studySessions).values({
      subjectId: biochimica.id,
      topicId: mitocondri.id,
      startedAt: session1,
      endedAt: new Date(session1.getTime() + 90 * 60 * 1000),
      durationMinutes: 90,
      notes: "Studied mitochondria - Krebs cycle",
    });

    const session2 = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    await db.insert(studySessions).values({
      subjectId: anatomia.id,
      topicId: cuore.id,
      startedAt: session2,
      endedAt: new Date(session2.getTime() + 60 * 60 * 1000),
      durationMinutes: 60,
      notes: "Heart anatomy review",
    });

    await db.insert(dailyLogs).values({
      date: formatISO(today, { representation: "date" }),
      activeRecallMinutes: 45,
      passiveStudyMinutes: 20,
      energyLevel: 7,
      notes: "Productive day",
    });

    revalidatePath("/subjects");
    revalidatePath("/topics");
    revalidatePath("/reviews");
    revalidatePath("/study-sessions");
    revalidatePath("/daily-log");
    revalidatePath("/dashboard");
    revalidatePath("/command");

    return {
      success: true,
      message: msg.success(reviewData.length),
      details: {
        subjectsCreated: 3,
        topicsCreated: 4,
        reviewsCreated: reviewData.length,
        sessionsCreated: 2,
      },
    };
  } catch (error) {
    console.error("Seed error:", error);
    return {
      success: false,
      message: msg.error,
    };
  }
}