"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const supabase = getClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "This reset link is expired or invalid. Request a new password email.");
      return;
    }

    setDone(true);
    setPassword("");
    setConfirmPassword("");
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald/25 bg-emerald-bg/30 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold text-text-primary">Password updated</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Your new password is active. Continue to your command page.
        </p>
        <Button asChild className="mt-5">
          <Link href="/command">Open Command</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters..."
          className="mt-2 w-full rounded-xl border border-border/60 bg-bg-page px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your new password..."
          className="mt-2 w-full rounded-xl border border-border/60 bg-bg-page px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error ? <p className="rounded-xl border border-rose/30 bg-rose-bg/30 px-3 py-2 text-xs text-rose">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Update Password
      </Button>
      <p className="text-center text-xs text-text-muted">
        Link expired? <Link href="/login" className="text-primary hover:underline">Request another email</Link>
      </p>
    </form>
  );
}
