"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";
import { Command, Hourglass, Loader2 } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");

      try {
        const res = await fetch("/api/admin/check-status");
        if (res.ok) {
          const data = await res.json();
          if (data.hasProfile && data.approved) {
            router.replace("/command");
            return;
          }
        }
        setError(false);
      } catch {
        setError(true);
      }
      setChecking(false);
      setLastChecked(new Date());
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
          <Hourglass className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Account pending approval</h1>
        {checking ? (
          <div className="flex items-center justify-center gap-2 text-text-secondary mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking your account...</span>
          </div>
        ) : (
          <p className="text-text-secondary mb-6 text-sm leading-relaxed">
            Your account <strong className="text-text-primary">{email}</strong> is waiting for admin approval. 
            Once approved, you will be redirected automatically.
          </p>
        )}
        {error && (
          <p className="text-xs text-amber-400 mb-4">
            Could not check approval status. Retrying every 15 seconds...
          </p>
        )}
        {lastChecked && (
          <p className="text-xs text-text-muted mb-2">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        <p className="text-xs text-text-muted mb-6">
          Checking every 15 seconds — no need to refresh.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <Command className="h-3.5 w-3.5" />
          <span>ValgeMed</span>
        </div>
      </div>
    </div>
  );
}