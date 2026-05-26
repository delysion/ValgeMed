import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { AiChatOptions } from "@/lib/ai/ollama";
import { normalizeAiPromptLimit } from "@/lib/ai/prompt-limits";

export async function getUserAiOptions(userId: string): Promise<AiChatOptions> {
  const db = getDb();
  const [profile] = await db
    .select({
      aiProvider: profiles.aiProvider,
      aiApiKey: profiles.aiApiKey,
      aiPromptLimitChars: profiles.aiPromptLimitChars,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return {
    provider: profile?.aiApiKey ? profile.aiProvider || undefined : undefined,
    apiKey: profile?.aiApiKey || undefined,
    promptLimitChars: normalizeAiPromptLimit(profile?.aiPromptLimitChars),
  };
}
