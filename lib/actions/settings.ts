"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/supabase";

export async function saveAiSettingsAction(formData: FormData): Promise<void> {
  try {
    const user = await requireUser();
    const db = getDb();
    const provider = formData.get("aiProvider") as string;
    const apiKey = formData.get("aiApiKey") as string;

    await db.update(profiles)
      .set({
        aiProvider: provider || null,
        aiApiKey: apiKey || null,
      })
      .where(eq(profiles.id, user.id));

    revalidatePath("/settings");
  } catch (e) {
    console.error("saveAiSettings error:", e);
  }
}
