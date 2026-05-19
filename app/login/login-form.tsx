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
    <div className="motion-scale-in w-full">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-xl shadow-primary/20">
          <Command className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.subtitle}</p>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-[var(--shadow-elevated)] sm:p-8">
        <form action={action} className="flex flex-col gap-5">
          {/* Username Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-sm font-medium text-text-secondary">{copy.username}</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="pl-10"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-text-secondary">{copy.password}</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="pl-10"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error State */}
          {state.error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose/20 bg-rose-bg px-4 py-3 text-sm text-rose">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
              <span>{state.error}</span>
            </div>
          ) : null}

          {/* Submit Button */}
          <Button size="lg" className="w-full mt-1" type="submit" disabled={pending}>
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

      {/* Language Selector */}
      <div className="mt-5 flex justify-center">
        <LanguageSelector current={locale} label={copy.language} compact />
      </div>
    </div>
  );
}
