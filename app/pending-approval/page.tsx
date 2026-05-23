"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";
import { Command, Hourglass } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const check = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("approved")
        .eq("id", user.id)
        .single();

      if (profile?.approved) {
        router.replace("/command");
      }
    };
    check();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
          <Hourglass className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Account pending approval</h1>
        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
          Your account <strong className="text-text-primary">{email}</strong> is waiting for admin approval. 
          You will receive access once approved. If you believe this is an error, contact the administrator.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <Command className="h-3.5 w-3.5" />
          <span>ValgeMed</span>
        </div>
      </div>
    </div>
  );
}