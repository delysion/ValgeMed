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
      error: error instanceof Error ? error.message : "Invalid auth configuration.",
    };
  }

  try {
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const ownerEmail = process.env.OWNER_EMAIL ?? "owner@local";
    const passwordHash = process.env.APP_PASSWORD_HASH;
    const appUsername = process.env.APP_USERNAME ?? "admin";

    if (!passwordHash) {
      return { error: "Missing APP_PASSWORD_HASH." };
    }

    if (!username) {
      return { error: "Username is required." };
    }

    if (username !== appUsername) {
      return { error: `Username mismatch. Expected: ${appUsername}, Got: ${username}` };
    }

    console.log("[AUTH] Username check:", username === appUsername);
    console.log("[AUTH] Hash length:", passwordHash.length);
    console.log("[AUTH] Password length:", password.length);
    const validPassword = await bcrypt.compare(password, passwordHash);
    console.log("[AUTH] Password valid:", validPassword);
    if (!validPassword) {
      return { error: "Invalid credentials." };
    }

    await createOwnerSession(ownerEmail);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Login failed.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearOwnerSession();
  redirect("/login");
}
