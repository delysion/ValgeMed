"use server";

import { revalidatePath } from "next/cache";
import { parseUserIntent, generateReviewItemsFromText, type ParsedStudyIntent } from "@/lib/ai/ollama";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { subjects, topics, studySessions, reviewItems } from "@/lib/db/schema";
import { getNextReviewSchedule } from "@/lib/scheduling/reviews";
import { eq } from "drizzle-orm";
import type { Locale } from "@/lib/i18n/config";

export interface SmartInputResult {
  success: boolean;
  message: string;
  messageKey: string;
  details?: {
    subject?: string;
    topic?: string;
    durationMinutes?: number;
    itemsCreated?: number;
  };
}

const messages = {
  en: {
    unknown: "I couldn't understand what you want to do. Try typing for example 'Study biochemistry for 2 hours' or 'Add question about mitochondria'.",
    noSubject: "To create a study session, tell me which subject to study. Example: 'Study biochemistry for 2 hours'",
    sessionCreated: (subject: string, topic: string | undefined, minutes: number) =>
      `Study session created: ${minutes} minutes of ${subject}${topic ? ` (${topic})` : ""}`,
    noQuestion: "To add a question, write for example: 'Add question: what is the mitochondrion? Answer: cellular organelle'",
    noSubjectForQuestion: "To add a question, specify the subject. Example: 'Add question about mitochondria in biochemistry'",
    questionAdded: (subject: string | undefined, question: string) =>
      `Question added${subject ? ` for ${subject}` : ""}: "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}"`,
    noSubject2: "To create a subject, write for example: 'Add subject biochemistry'",
    subjectCreated: (subject: string) => `Subject "${subject}" created`,
    noTopic: "To create a topic, write for example: 'Add topic mitochondria to biology subject'",
    topicCreated: (topic: string, subject: string) => `Topic "${topic}" created under ${subject}`,
    genericError: "An error occurred. Make sure Ollama is running (ollama serve) and the model is downloaded.",
    generateNoText: "Couldn't generate flashcards from text. Try with more structured text.",
    generateNoSubject: "To generate flashcards from text, specify the subject. Example: 'Generate flashcards from [text] in biochemistry'",
    generateSuccess: (count: number, text: string) => `Generated ${count} flashcards from "${text.substring(0, 30)}..."`,
    generateError: "Error generating. Make sure Ollama is running.",
  },
  et: {
    unknown: "Ma ei saanud aru, mida sa soovid teha. Proovi näiteks kirjutada ' Õpi biokeemia 2 tundi' või 'Lisa küsimus mitokondrite kohta'.",
    noSubject: " Õppesessiooni loomiseks ütle mulle, millist ainet õppida. Näide: ' Õpi biokeemia 2 tundi'",
    sessionCreated: (subject: string, topic: string | undefined, minutes: number) =>
      ` Õppesessioon loodud: ${minutes} minutit ${subject}${topic ? ` (${topic})` : ""}`,
    noQuestion: " Küsimuse lisamiseks kirjuta näiteks: 'Lisa küsimus: mis on mitokonder? Vastus: organell'",
    noSubjectForQuestion: " Küsimuse lisamiseks täpsusta ainet. Näide: 'Lisa küsimus mitokondrite kohta biokeemias'",
    questionAdded: (subject: string | undefined, question: string) =>
      `Küsimus lisatud${subject ? ` ${subject} jaoks` : ""}: "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}"`,
    noSubject2: " Aine loomiseks kirjuta näiteks: 'Lisa aine biokeemia'",
    subjectCreated: (subject: string) => `Aine "${subject}" loodud`,
    noTopic: " Teema loomiseks kirjuta näiteks: 'Lisa teema mitokondrid bioloogia aine juurde'",
    topicCreated: (topic: string, subject: string) => `Teema "${topic}" loodud ${subject} aine juurde`,
    genericError: "Ilmnes viga. Veendu, et Ollama töötab (ollama serve) ja mudel on alla laaditud.",
    generateNoText: "Flaskardide genereerimine tekstist ebaõnnestus. Proovi struktureerituma tekstiga.",
    generateNoSubject: " Flashcardide genereerimiseks tekstist täpsusta ainet. Näide: 'Genereeri flashcards [tekst] biokeemias'",
    generateSuccess: (count: number, text: string) => `Genereeritud ${count} flashcards "${text.substring(0, 30)}..."`,
    generateError: "Genereerimise viga. Veendu, et Ollama töötab.",
  },
};

function getMsg(locale: Locale) {
  return messages[locale] || messages.en;
}

async function findOrCreateSubject(subjectName: string): Promise<string> {
  const db = getDb();
  const normalizedName = subjectName.trim();

    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.name, normalizedName))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name: normalizedName,
        description: `Materia: ${normalizedName}`,
      })
    .returning();

  return newSubject.id;
}

async function findOrCreateTopic(subjectId: string, topicName: string): Promise<string | null> {
  if (!topicName) return null;

  const db = getDb();
  const normalizedName = topicName.trim();

  const existing = await db
    .select()
    .from(topics)
    .where(eq(topics.title, normalizedName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newTopic] = await db
    .insert(topics)
    .values({
      subjectId,
      title: normalizedName,
      description: `Topic: ${normalizedName}`,
    })
    .returning();

  return newTopic.id;
}

export async function processSmartInputAction(input: string, locale: Locale = "en"): Promise<SmartInputResult> {
  const msg = getMsg(locale);

  try {
    await requireOwnerSession();

    const parsed: ParsedStudyIntent = await parseUserIntent(input);

    if (parsed.action === "unknown" || !parsed.action) {
      return {
        success: false,
        message: msg.unknown,
        messageKey: "unknown",
      };
    }

    switch (parsed.action) {
      case "study_session": {
        if (!parsed.subject) {
          return {
            success: false,
            message: msg.noSubject,
            messageKey: "noSubject",
          };
        }

        const subjectId = await findOrCreateSubject(parsed.subject);
        const topicId = parsed.topic ? await findOrCreateTopic(subjectId, parsed.topic) : null;
        const durationMinutes = parsed.durationMinutes || 60;
        const startedAt = new Date();

        await getDb().insert(studySessions).values({
          subjectId,
          topicId: topicId || undefined,
          startedAt,
          endedAt: new Date(startedAt.getTime() + durationMinutes * 60 * 1000),
          durationMinutes,
          method: "active_recall",
          notes: input,
        });

        revalidatePath("/study-sessions");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.sessionCreated(parsed.subject, parsed.topic || undefined, durationMinutes),
          messageKey: "sessionCreated",
          details: {
            subject: parsed.subject,
            topic: parsed.topic || undefined,
            durationMinutes,
          },
        };
      }

      case "review_item": {
        if (!parsed.question) {
          return {
            success: false,
            message: msg.noQuestion,
            messageKey: "noQuestion",
          };
        }

        if (!parsed.subject) {
          return {
            success: false,
            message: msg.noSubjectForQuestion,
            messageKey: "noSubjectForQuestion",
          };
        }

        const subjectId = await findOrCreateSubject(parsed.subject);
        const topicId = parsed.topic ? await findOrCreateTopic(subjectId, parsed.topic) : null;

        const nextSchedule = getNextReviewSchedule(3, 1, 0);

        await getDb().insert(reviewItems).values({
          subjectId,
          topicId: topicId ?? undefined,
          question: parsed.question,
          answer: parsed.answer || "",
          intervalDays: nextSchedule.intervalDays,
          dueAt: nextSchedule.dueAt,
        });

        revalidatePath("/reviews");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.questionAdded(parsed.subject, parsed.question),
          messageKey: "questionAdded",
          details: {
            subject: parsed.subject,
            topic: parsed.topic,
            itemsCreated: 1,
          },
        };
      }

      case "subject": {
        if (!parsed.subject) {
          return {
            success: false,
            message: msg.noSubject2,
            messageKey: "noSubject2",
          };
        }

        await findOrCreateSubject(parsed.subject);

        revalidatePath("/subjects");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.subjectCreated(parsed.subject),
          messageKey: "subjectCreated",
          details: { subject: parsed.subject },
        };
      }

      case "topic": {
        if (!parsed.subject || !parsed.topic) {
          return {
            success: false,
            message: msg.noTopic,
            messageKey: "noTopic",
          };
        }

        const subjectId = await findOrCreateSubject(parsed.subject);
        await findOrCreateTopic(subjectId, parsed.topic);

        revalidatePath("/topics");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.topicCreated(parsed.topic, parsed.subject),
          messageKey: "topicCreated",
          details: { subject: parsed.subject, topic: parsed.topic },
        };
      }

      default:
        return {
          success: false,
          message: msg.unknown,
          messageKey: "unknown",
        };
    }
  } catch (error) {
    console.error("Smart input error:", error);
    return {
      success: false,
      message: msg.genericError,
      messageKey: "genericError",
    };
  }
}

export async function generateFlashcardsFromTextAction(
  text: string,
  subject?: string,
  topic?: string,
  locale: Locale = "en"
): Promise<SmartInputResult> {
  const msg = getMsg(locale);

  try {
    await requireOwnerSession();

    const items = await generateReviewItemsFromText(text, subject, topic);

    if (items.length === 0) {
      return {
        success: false,
        message: msg.generateNoText,
        messageKey: "generateNoText",
      };
    }

    if (!subject) {
      return {
        success: false,
        message: msg.generateNoSubject,
        messageKey: "generateNoSubject",
      };
    }

    const subjectId = await findOrCreateSubject(subject);
    const topicId = topic ? await findOrCreateTopic(subjectId, topic) : null;

    for (const item of items) {
      const nextSchedule = getNextReviewSchedule(3, 1, 0);
      await getDb().insert(reviewItems).values({
        subjectId,
        topicId: topicId ?? undefined,
        question: item.question,
        answer: item.answer,
        intervalDays: nextSchedule.intervalDays,
        dueAt: nextSchedule.dueAt,
      });
    }

    revalidatePath("/reviews");
    revalidatePath("/dashboard");
    revalidatePath("/command");

    return {
      success: true,
      message: msg.generateSuccess(items.length, text),
      messageKey: "generateSuccess",
      details: { itemsCreated: items.length },
    };
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return {
      success: false,
      message: msg.generateError,
      messageKey: "generateError",
    };
  }
}