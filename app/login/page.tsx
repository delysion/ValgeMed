import { redirect } from "next/navigation";
import { Command } from "lucide-react";

import { LoginForm } from "./login-form";
import { getOwnerSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getOwnerSession();

  if (session) {
    redirect("/command");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-page via-primary-soft/5 to-bg-page" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center motion-premium">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-hero">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">ValgeMed</h1>
          <p className="mt-1 text-sm text-text-secondary">
            A quiet command system for serious medical students.
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-bg-surface p-6 shadow-premium motion-stagger-1">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
