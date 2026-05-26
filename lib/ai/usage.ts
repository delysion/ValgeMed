import "server-only";

import { and, eq, gte, lt, sql } from "drizzle-orm";

import { aiChat, type AiChatOptions } from "@/lib/ai/ollama";
import {
  normalizeAiDailyCharLimit,
  normalizeAiDailyRequestLimit,
  normalizeAiPromptLimit,
} from "@/lib/ai/prompt-limits";
import { getDb } from "@/lib/db";
import { aiUsageEvents, profiles } from "@/lib/db/schema";

export const AI_USAGE_LIMIT_ERROR = "AI_DAILY_LIMIT_REACHED";

export class AiUsageLimitError extends Error {
  constructor(message = "Daily AI usage limit reached.") {
    super(message);
    this.name = AI_USAGE_LIMIT_ERROR;
  }
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextUtcDay(date: Date) {
  const next = startOfUtcDay(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function countChars(value: string) {
  return [...value].length;
}

export async function assertAiUsageAllowed(userId: string, promptChars: number, now = new Date()) {
  const db = getDb();
  const [profile] = await db
    .select({
      aiPromptLimitChars: profiles.aiPromptLimitChars,
      aiDailyRequestLimit: profiles.aiDailyRequestLimit,
      aiDailyCharLimit: profiles.aiDailyCharLimit,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  const promptLimit = normalizeAiPromptLimit(profile?.aiPromptLimitChars);
  const requestLimit = normalizeAiDailyRequestLimit(profile?.aiDailyRequestLimit);
  const charLimit = normalizeAiDailyCharLimit(profile?.aiDailyCharLimit, promptLimit);
  const dayStart = startOfUtcDay(now);
  const dayEnd = nextUtcDay(now);
  const [usage] = await db
    .select({
      requestCount: sql<number>`count(*)::int`,
      usedChars: sql<number>`coalesce(sum(${aiUsageEvents.promptChars} + ${aiUsageEvents.responseChars}), 0)::int`,
    })
    .from(aiUsageEvents)
    .where(
      and(
        eq(aiUsageEvents.userId, userId),
        gte(aiUsageEvents.createdAt, dayStart),
        lt(aiUsageEvents.createdAt, dayEnd),
      ),
    );

  const requestCount = Number(usage?.requestCount ?? 0);
  const usedChars = Number(usage?.usedChars ?? 0);

  if (requestCount >= requestLimit || usedChars + promptChars > charLimit) {
    throw new AiUsageLimitError();
  }

  return {
    requestCount,
    usedChars,
    requestLimit,
    charLimit,
  };
}

export async function recordAiUsage({
  userId,
  feature,
  provider,
  promptChars,
  responseChars,
}: {
  userId: string;
  feature: string;
  provider: string;
  promptChars: number;
  responseChars: number;
}) {
  await getDb().insert(aiUsageEvents).values({
    userId,
    feature,
    provider,
    promptChars,
    responseChars,
  });
}

export async function runAiChatWithUsage({
  userId,
  feature,
  prompt,
  model,
  userOptions,
}: {
  userId: string;
  feature: string;
  prompt: string;
  model?: string;
  userOptions?: AiChatOptions;
}) {
  const promptChars = countChars(prompt);
  await assertAiUsageAllowed(userId, promptChars);

  const result = await aiChat(prompt, model, userOptions);
  await recordAiUsage({
    userId,
    feature,
    provider: userOptions?.provider || process.env.AI_PROVIDER || "ollama",
    promptChars,
    responseChars: countChars(result),
  });

  return result;
}
