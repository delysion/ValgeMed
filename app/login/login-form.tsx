"use client";

import { useActionState } from "react";
import { Command, LockKeyhole, UserRound } from "lucide-react";

import { LanguageSelector } from "@/components/language-selector";
import { loginAction } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    submit: string;
    pending: string;
    language: string;
  };
}) {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <div className="motion-scale-in w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-lg shadow-primary/20">
          <Command className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{copy.subtitle}</p>
      </div>
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-[var(--shadow-card)]">
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-text-secondary">{copy.username}</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input id="username" name="username" type="text" autoComplete="username" required className="pl-9" placeholder="admin" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-text-secondary">{copy.password}</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input id="password" name="password" type="password" autoComplete="current-password" required className="pl-9" />
            </div>
          </div>
          {state.error ? (
            <div className="rounded-lg border border-rose/20 bg-rose-bg px-3 py-2 text-sm text-rose">
              {state.error}
            </div>
          ) : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {copy.pending}
              </span>
            ) : (
              copy.submit
            )}
          </Button>
        </form>
      </div>
      <div className="mt-4 flex justify-center">
        <LanguageSelector current={locale} label={copy.language} compact />
      </div>
    </div>
  );
}
