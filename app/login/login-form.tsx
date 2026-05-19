"use client";

import { useActionState } from "react";
import { Command, LockKeyhole } from "lucide-react";

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
    <Card className="motion-premium w-full max-w-md overflow-hidden rounded-2xl border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-sm">
            <Command className="h-6 w-6 text-white" />
          </div>
          <LanguageSelector current={locale} label={copy.language} compact />
        </div>
        <CardTitle className="text-2xl text-text-primary">{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">{copy.password}</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error ? (
            <div className="rounded-md border border-rose/20 bg-rose-bg px-3 py-2 text-sm text-rose">
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
