"use client";

import { useState } from "react";
import { Check, X, Shield } from "lucide-react";

type Profile = {
  id: string;
  displayName: string | null;
  approved: boolean | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
};

export function UserRow({ profile: initial }: { profile: Profile }) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, approved: !profile.approved }),
      });
      if (res.ok) setProfile((p) => ({ ...p, approved: !p.approved }));
    } finally {
      setBusy(false);
    }
  };

  const isApproved = !!profile.approved;
  const isAdminUser = !!profile.isAdmin;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-surface/80 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {profile.displayName ?? "Unknown"}
        </p>
        <p className="text-xs text-text-muted">
          {isAdminUser && (
            <span className="inline-flex items-center gap-1 mr-2 text-amber-400 font-medium">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          )}
          {isApproved ? "Approved" : "Pending approval"}
          {profile.createdAt && ` · ${new Date(profile.createdAt).toLocaleDateString()}`}
        </p>
      </div>
      <button
        onClick={handleApprove}
        disabled={busy || isAdminUser}
        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 ${
          isApproved
            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}
      >
        {isApproved ? (
          <span className="flex items-center gap-1.5"><X className="h-4 w-4" /> Revoke</span>
        ) : (
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Approve</span>
        )}
      </button>
    </div>
  );
}