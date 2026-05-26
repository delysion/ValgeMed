"use server";

import { revalidatePath } from "next/cache";
import { parseUserIntent, generateReviewItemsFromText, type ParsedStudyIntent } from "@/lib/ai/ollama";
import { AI_USAGE_LIMIT_ERROR, runAiChatWithUsage } from "@/lib/ai/usage";
import { getUserAiOptions } from "@/lib/ai/user-options";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import {
  dailyLogs,
  errorLogs,
  exams,
  healthLogs,
  languageProgress,
  lifeAdminItems,
  opportunities,
  professionalContacts,
  reviewItems,
  studySessions,
  subjects,
  tasks,
  timeBlocks,
  topics,
} from "@/lib/db/schema";
import { getNextReviewSchedule } from "@/lib/scheduling/reviews";
import { and, eq } from "drizzle-orm";
import type { Locale } from "@/lib/i18n/config";
import { parseSmartInputLocally, type SmartInputIntent } from "@/lib/smart-input/intent";

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
    examCreated: (title: string) => `Exam created: ${title}`,
    taskCreated: (title: string) => `Task created: ${title}`,
    lifeAdminCreated: (title: string) => `Life admin item created: ${title}`,
    opportunityCreated: (title: string) => `Opportunity created: ${title}`,
    errorCreated: (title: string) => `Error log created: ${title}`,
    dailyCreated: "Daily log updated",
    healthCreated: "Health log updated",
    languageCreated: (title: string) => `Language practice logged: ${title}`,
    contactCreated: (name: string) => `Contact created: ${name}`,
    timeBlockCreated: (title: string) => `Time block created: ${title}`,
    genericError: "An error occurred. Make sure Ollama is running (ollama serve) and the model is downloaded.",
    generateNoText: "Couldn't generate flashcards from text. Try with more structured text.",
    generateNoSubject: "To generate flashcards from text, specify the subject. Example: 'Generate flashcards from [text] in biochemistry'",
    generateSuccess: (count: number, text: string) => `Generated ${count} flashcards from "${text.substring(0, 30)}..."`,
    generateError: "Error generating. Make sure Ollama is running.",
    aiLimitReached: "Daily AI limit reached. Ask an admin to raise your AI caps.",
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
    examCreated: (title: string) => `Exam created: ${title}`,
    taskCreated: (title: string) => `Task created: ${title}`,
    lifeAdminCreated: (title: string) => `Life admin item created: ${title}`,
    opportunityCreated: (title: string) => `Opportunity created: ${title}`,
    errorCreated: (title: string) => `Error log created: ${title}`,
    dailyCreated: "Daily log updated",
    healthCreated: "Health log updated",
    languageCreated: (title: string) => `Language practice logged: ${title}`,
    contactCreated: (name: string) => `Contact created: ${name}`,
    timeBlockCreated: (title: string) => `Time block created: ${title}`,
    genericError: "Ilmnes viga. Veendu, et Ollama töötab (ollama serve) ja mudel on alla laaditud.",
    generateNoText: "Flaskardide genereerimine tekstist ebaõnnestus. Proovi struktureerituma tekstiga.",
    generateNoSubject: " Flashcardide genereerimiseks tekstist täpsusta ainet. Näide: 'Genereeri flashcards [tekst] biokeemias'",
    generateSuccess: (count: number, text: string) => `Genereeritud ${count} flashcards "${text.substring(0, 30)}..."`,
    generateError: "Genereerimise viga. Veendu, et Ollama töötab.",
    aiLimitReached: "Daily AI limit reached. Ask an admin to raise your AI caps.",
  },
};

function getMsg(locale: Locale) {
  return messages[locale] || messages.en;
}

type ParsedSmartInput = ParsedStudyIntent | SmartInputIntent;

async function findOrCreateSubject(userId: string, subjectName: string): Promise<string> {
  const db = getDb();
  const normalizedName = subjectName.trim();

  const existing = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.userId, userId), eq(subjects.name, normalizedName)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newSubject] = await db
    .insert(subjects)
    .values({
      userId,
      name: normalizedName,
      description: `Materia: ${normalizedName}`,
    })
    .returning();

  return newSubject.id;
}

async function findOrCreateTopic(userId: string, subjectId: string, topicName: string): Promise<string | null> {
  if (!topicName) return null;

  const db = getDb();
  const normalizedName = topicName.trim();

  const existing = await db
    .select()
    .from(topics)
    .where(
      and(
        eq(topics.userId, userId),
        eq(topics.subjectId, subjectId),
        eq(topics.title, normalizedName),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newTopic] = await db
    .insert(topics)
    .values({
      userId,
      subjectId,
      title: normalizedName,
      description: `Topic: ${normalizedName}`,
    })
    .returning();

  return newTopic.id;
}

function toDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function processSmartInputAction(input: string, locale: Locale = "en"): Promise<SmartInputResult> {
  const msg = getMsg(locale);

  try {
    const user = await requireApprovedUser();
    const userOptions = await getUserAiOptions(user.id);

    const parsed: ParsedSmartInput = parseSmartInputLocally(input) ?? await parseUserIntent(
      input,
      userOptions,
      (prompt) => runAiChatWithUsage({
        userId: user.id,
        feature: "smart_input_parse",
        prompt,
        userOptions,
      }),
    );

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

        const subjectId = await findOrCreateSubject(user.id, parsed.subject);
        const topicId = parsed.topic ? await findOrCreateTopic(user.id, subjectId, parsed.topic) : null;
        const durationMinutes = parsed.durationMinutes || 60;
        const startedAt = new Date();

        await getDb().insert(studySessions).values({
          userId: user.id,
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

        const subjectId = await findOrCreateSubject(user.id, parsed.subject);
        const topicId = parsed.topic ? await findOrCreateTopic(user.id, subjectId, parsed.topic) : null;

        const nextSchedule = getNextReviewSchedule(3, 1, 0);

        await getDb().insert(reviewItems).values({
          userId: user.id,
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

        await findOrCreateSubject(user.id, parsed.subject);

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

        const subjectId = await findOrCreateSubject(user.id, parsed.subject);
        await findOrCreateTopic(user.id, subjectId, parsed.topic);

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

      case "exam": {
        const title = parsed.title || parsed.subject || "Exam";
        const subjectId = await findOrCreateSubject(user.id, parsed.subject || "General");

        await getDb().insert(exams).values({
          userId: user.id,
          subjectId,
          title,
          examDate: toDate(parsed.examDate),
          notes: parsed.notes ?? input,
        });

        revalidatePath("/exams");
        revalidatePath("/dashboard");
        revalidatePath("/timeline");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.examCreated(title),
          messageKey: "examCreated",
          details: { subject: parsed.subject },
        };
      }

      case "task": {
        const title = parsed.title || "Task";
        await getDb().insert(tasks).values({
          userId: user.id,
          title,
          description: parsed.description ?? input,
          dueAt: toDate(parsed.dueAt),
          priority: parsed.priority ?? 0,
        });

        revalidatePath("/goals");
        revalidatePath("/timeline");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.taskCreated(title),
          messageKey: "taskCreated",
        };
      }

      case "life_admin": {
        const title = parsed.title || "Life admin item";
        await getDb().insert(lifeAdminItems).values({
          userId: user.id,
          title,
          description: parsed.description ?? input,
          category: parsed.category ?? "other",
          dueAt: toDate(parsed.dueAt),
          priority: parsed.priority ?? 0,
        });

        revalidatePath("/life-admin");
        revalidatePath("/timeline");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.lifeAdminCreated(title),
          messageKey: "lifeAdminCreated",
        };
      }

      case "opportunity": {
        const title = parsed.title || "Opportunity";
        await getDb().insert(opportunities).values({
          userId: user.id,
          title,
          description: parsed.description ?? input,
          opportunityType: parsed.opportunityType ?? "other",
          deadline: parsed.deadline ?? null,
          nextAction: parsed.nextAction ?? null,
          status: "watching",
        });

        revalidatePath("/opportunities");
        revalidatePath("/timeline");
        revalidatePath("/elite-index");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.opportunityCreated(title),
          messageKey: "opportunityCreated",
        };
      }

      case "error_log": {
        const title = parsed.title || "Error pattern";
        const subjectId = await findOrCreateSubject(user.id, parsed.subject || "General");
        const topicId = parsed.topic ? await findOrCreateTopic(user.id, subjectId, parsed.topic) : null;

        await getDb().insert(errorLogs).values({
          userId: user.id,
          subjectId,
          topicId: topicId ?? undefined,
          title,
          description: parsed.description ?? input,
          severity: parsed.severity ?? 0,
        });

        revalidatePath("/errors");
        revalidatePath("/timeline");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.errorCreated(title),
          messageKey: "errorCreated",
          details: { subject: parsed.subject, topic: parsed.topic },
        };
      }

      case "daily_log": {
        const date = parsed.date ?? todayKey();

        await getDb()
          .insert(dailyLogs)
          .values({
            userId: user.id,
            date,
            energyLevel: parsed.energyLevel ?? null,
            stressLevel: parsed.stressLevel ?? null,
            moodLevel: parsed.moodLevel ?? null,
            studyMinutes: parsed.studyMinutes ?? 0,
            activeRecallMinutes: parsed.activeRecallMinutes ?? 0,
            passiveStudyMinutes: parsed.passiveStudyMinutes ?? 0,
            movementDone: false,
            notes: parsed.notes ?? input,
          })
          .onConflictDoUpdate({
            target: [dailyLogs.userId, dailyLogs.date],
            set: {
              energyLevel: parsed.energyLevel ?? null,
              stressLevel: parsed.stressLevel ?? null,
              moodLevel: parsed.moodLevel ?? null,
              studyMinutes: parsed.studyMinutes ?? 0,
              activeRecallMinutes: parsed.activeRecallMinutes ?? 0,
              passiveStudyMinutes: parsed.passiveStudyMinutes ?? 0,
              notes: parsed.notes ?? input,
              updatedAt: new Date(),
            },
          });

        revalidatePath("/daily-log");
        revalidatePath("/dashboard");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.dailyCreated,
          messageKey: "dailyCreated",
        };
      }

      case "health_log": {
        const date = parsed.date ?? todayKey();

        await getDb()
          .insert(healthLogs)
          .values({
            userId: user.id,
            date,
            sleepQuality: parsed.sleepQuality ?? null,
            cognitiveFatigue: parsed.cognitiveFatigue ?? null,
            recoveryQuality: parsed.recoveryQuality ?? null,
            foodQuality: parsed.foodQuality ?? null,
            movementDone: false,
            notes: parsed.notes ?? input,
          })
          .onConflictDoUpdate({
            target: [healthLogs.userId, healthLogs.date],
            set: {
              sleepQuality: parsed.sleepQuality ?? null,
              cognitiveFatigue: parsed.cognitiveFatigue ?? null,
              recoveryQuality: parsed.recoveryQuality ?? null,
              foodQuality: parsed.foodQuality ?? null,
              notes: parsed.notes ?? input,
              updatedAt: new Date(),
            },
          });

        revalidatePath("/health");
        revalidatePath("/command");
        revalidatePath("/elite-index");

        return {
          success: true,
          message: msg.healthCreated,
          messageKey: "healthCreated",
        };
      }

      case "language_progress": {
        const title = parsed.title || parsed.language || "Language practice";
        await getDb().insert(languageProgress).values({
          userId: user.id,
          language: parsed.language ?? "estonian",
          title,
          minutes: parsed.minutes ?? 0,
          confidence: parsed.confidence ?? 0,
          lastPracticedAt: new Date(),
          nextPracticeAt: toDate(parsed.nextPracticeAt),
          notes: parsed.notes ?? input,
        });

        revalidatePath("/language");
        revalidatePath("/timeline");
        revalidatePath("/command");
        revalidatePath("/elite-index");

        return {
          success: true,
          message: msg.languageCreated(title),
          messageKey: "languageCreated",
        };
      }

      case "contact": {
        const name = parsed.name || ("title" in parsed ? parsed.title : undefined) || "Contact";
        await getDb().insert(professionalContacts).values({
          userId: user.id,
          name,
          role: parsed.role ?? null,
          institution: parsed.institution ?? null,
          nextFollowUpAt: toDate(parsed.nextFollowUpAt),
          notes: parsed.notes ?? input,
        });

        revalidatePath("/network");
        revalidatePath("/timeline");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.contactCreated(name),
          messageKey: "contactCreated",
        };
      }

      case "time_block": {
        const title = parsed.title || "Time block";
        await getDb().insert(timeBlocks).values({
          userId: user.id,
          date: parsed.date ?? todayKey(),
          title,
          blockType: parsed.blockType ?? "study",
          plannedMinutes: parsed.plannedMinutes ?? 0,
          actualMinutes: 0,
          notes: parsed.notes ?? input,
        });

        revalidatePath("/time");
        revalidatePath("/timeline");
        revalidatePath("/command");

        return {
          success: true,
          message: msg.timeBlockCreated(title),
          messageKey: "timeBlockCreated",
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
    if (error instanceof Error && error.name === AI_USAGE_LIMIT_ERROR) {
      return {
        success: false,
        message: msg.aiLimitReached,
        messageKey: "aiLimitReached",
      };
    }
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
    const user = await requireApprovedUser();
    const userOptions = await getUserAiOptions(user.id);

    const items = await generateReviewItemsFromText(
      text,
      subject,
      topic,
      userOptions,
      (prompt) => runAiChatWithUsage({
        userId: user.id,
        feature: "flashcard_generation",
        prompt,
        userOptions,
      }),
    );

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

    const subjectId = await findOrCreateSubject(user.id, subject);
    const topicId = topic ? await findOrCreateTopic(user.id, subjectId, topic) : null;

    for (const item of items) {
      const nextSchedule = getNextReviewSchedule(3, 1, 0);
      await getDb().insert(reviewItems).values({
        userId: user.id,
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
    if (error instanceof Error && error.name === AI_USAGE_LIMIT_ERROR) {
      return {
        success: false,
        message: msg.aiLimitReached,
        messageKey: "aiLimitReached",
      };
    }
    return {
      success: false,
      message: msg.generateError,
      messageKey: "generateError",
    };
  }
}
