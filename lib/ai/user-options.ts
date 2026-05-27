import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { AiChatOptions } from "@/lib/ai/ollama";
import { normalizeAiPromptLimit } from "@/lib/ai/prompt-limits";
import { decryptSecret } from "@/lib/security/crypto";

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

  const apiKey = decryptSecret(profile?.aiApiKey);

  return {
    provider: apiKey ? profile?.aiProvider || undefined : undefined,
    apiKey: apiKey || undefined,
    promptLimitChars: normalizeAiPromptLimit(profile?.aiPromptLimitChars),
  };
}
