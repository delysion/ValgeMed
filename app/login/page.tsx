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
    <div className="relative flex min-h-screen items-center justify-center bg-bg-page p-4 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/20 via-bg-page to-cyan-bg/10" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-cyan/5 blur-[80px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center motion-premium">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
            <Command className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">ValgeMed</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            A quiet command system for serious medical students.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm motion-stagger-1">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">
          Single-owner system. No registration required.
        </p>
      </div>
    </div>
  );
}
