"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";

import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username" className="text-sm font-medium text-text-secondary">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Enter your username..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-sm font-medium text-text-secondary">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password..."
        />
      </div>

      {state.error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose/20 bg-rose-bg px-4 py-3 text-sm text-rose">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <Button size="lg" className="w-full mt-1" type="submit" disabled={pending}>
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Entering ValgeMed...
          </span>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Enter ValgeMed
          </>
        )}
      </Button>
    </form>
  );
}
