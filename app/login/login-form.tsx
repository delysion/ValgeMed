"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { LanguageSelector } from "@/components/language-selector";
import { loginAction } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    password: string;
    submit: string;
    pending: string;
    language: string;
  };
}) {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <Card className="motion-premium w-full max-w-md overflow-hidden rounded-[2rem] border-white/15 bg-white/[0.055]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <LanguageSelector current={locale} label={copy.language} compact />
        </div>
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">{copy.password}</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error ? (
            <div className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {state.error}
            </div>
          ) : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
