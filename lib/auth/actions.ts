"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import {
  clearOwnerSession,
  createOwnerSession,
  validateLoginEnvironment,
} from "@/lib/auth/session";

type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    validateLoginEnvironment();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Configurazione auth non valida.",
    };
  }

  const password = String(formData.get("password") ?? "");
  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@local";
  const passwordHash = process.env.APP_PASSWORD_HASH;

  if (!passwordHash) {
    return { error: "APP_PASSWORD_HASH mancante." };
  }

  const validPassword = await bcrypt.compare(password, passwordHash);

  if (!validPassword) {
    return { error: "Password non corretta." };
  }

  await createOwnerSession(ownerEmail);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearOwnerSession();
  redirect("/login");
}
