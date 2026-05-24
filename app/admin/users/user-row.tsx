"use client";

import { useState } from "react";
import { Check, X, Shield } from "lucide-react";
import { approveUserAction } from "@/lib/actions/admin";

type Profile = {
  id: string;
  displayName: string | null;
  email: string | null;
  approved: boolean | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
};

export function UserRow({ profile: initial }: { profile: Profile }) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await approveUserAction(profile.id, !profile.approved);
      if (res.success) {
        const wasApproved = !!profile.approved;
        setProfile((p) => ({ ...p, approved: !p.approved }));
        setToast(wasApproved ? "Access revoked" : "User approved");
        setTimeout(() => setToast(null), 2500);
      }
    } finally {
      setBusy(false);
    }
  };

  const isApproved = !!profile.approved;
  const isAdminUser = !!profile.isAdmin;

  return (
    <div className="relative flex items-center justify-between rounded-xl border border-border/60 bg-bg-surface/80 p-4">
      {toast && (
        <div className="absolute -top-2 right-2 rounded-lg bg-text-primary px-3 py-1 text-xs font-medium text-bg-page shadow-md animate-in fade-in slide-in-from-top-1">
          {toast}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {profile.displayName ?? "Unknown"}
        </p>
        <p className="text-xs text-text-muted">
          {profile.email && <span className="mr-2">{profile.email}</span>}
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