"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { normalizeEliteTargetSettings, type EliteTargetSettings } from "@/lib/scoring/elite-performance";
import { encryptSecret } from "@/lib/security/crypto";

export async function saveAiSettingsAction(formData: FormData): Promise<void> {
  try {
    const user = await requireApprovedUser();
    const db = getDb();
    const provider = formData.get("aiProvider") as string;
    const apiKey = formData.get("aiApiKey") as string;
    const encryptedKey = apiKey ? encryptSecret(apiKey) : null;

    await db.update(profiles)
      .set({
        aiProvider: provider || null,
        aiApiKey: encryptedKey,
      })
      .where(eq(profiles.id, user.id));

    revalidatePath("/settings");
  } catch (e) {
    console.error("saveAiSettings error:", e);
  }
}

export async function saveEliteTargetSettingsAction(formData: FormData): Promise<void> {
  const user = await requireApprovedUser();
  const db = getDb();
  const settings = normalizeEliteTargetSettings({
    targetLevel: formData.get("targetLevel") as EliteTargetSettings["targetLevel"],
    weaknessTolerance: formData.get("weaknessTolerance") as EliteTargetSettings["weaknessTolerance"],
    examStrategy: formData.get("examStrategy") as EliteTargetSettings["examStrategy"],
  });

  await db
    .update(profiles)
    .set({
      targetLevel: settings.targetLevel,
      weaknessTolerance: settings.weaknessTolerance,
      examStrategy: settings.examStrategy,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id));

  revalidatePath("/settings");
  revalidatePath("/command");
}
