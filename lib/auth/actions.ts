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

    console.log("[LOGIN DEBUG] username:", username);
    console.log("[LOGIN DEBUG] appUsername:", appUsername);
    console.log("[LOGIN DEBUG] passwordHash exists:", !!passwordHash);
    console.log("[LOGIN DEBUG] passwordHash length:", passwordHash?.length);

    if (!passwordHash) {
      return { error: "Missing APP_PASSWORD_HASH." };
    }

    if (!username) {
      return { error: "Username is required." };
    }

    if (username !== appUsername) {
      console.log("[LOGIN DEBUG] Username mismatch!");
      return { error: "Invalid username or password." };
    }

    const validPassword = await bcrypt.compare(password, passwordHash);
    console.log("[LOGIN DEBUG] validPassword:", validPassword);

    if (!validPassword) {
      return { error: "Invalid username or password." };
    }

    await createOwnerSession(ownerEmail);
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
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
