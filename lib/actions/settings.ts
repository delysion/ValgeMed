"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/supabase";
import { redirect } from "next/navigation";

export async function saveAiSettingsAction(formData: FormData) {
  const user = await requireUser();
  const db = getDb();
  const provider = formData.get("aiProvider") as string;
  const apiKey = formData.get("aiApiKey") as string;

  if (provider && !["openai", "groq"].includes(provider)) {
    throw new Error("Invalid provider");
  }

  await db.update(profiles)
    .set({
      aiProvider: provider || null,
      aiApiKey: apiKey || null,
    })
    .where(eq(profiles.id, user.id));

  redirect("/settings");
}
