"use client";

import { useState } from "react";
import { Check, X, Shield, Ban } from "lucide-react";
import { approveUserAction } from "@/lib/actions/admin";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Profile = {
  id: string;
  displayName: string | null;
  email: string | null;
  approved: boolean | null;
  rejectedAt: Date | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
};

export function UserRow({ profile: initial }: { profile: Profile }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await approveUserAction(profile.id, true);
      if (res.success) {
        setProfile((p) => ({ ...p, approved: true }));
        showToast(t("admin.userApproved"));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      const res = await approveUserAction(profile.id, false);
      if (res.success) {
        setProfile((p) => ({ ...p, approved: false }));
        showToast(t("admin.userRejected"));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    setBusy(true);
    try {
      const res = await approveUserAction(profile.id, false);
      if (res.success) {
        setProfile((p) => ({ ...p, approved: false }));
        showToast(t("admin.accessRevoked"));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReapprove = async () => {
    setBusy(true);
    try {
      const res = await approveUserAction(profile.id, true);
      if (res.success) {
        setProfile((p) => ({ ...p, approved: true }));
        showToast(t("admin.userApproved"));
      }
    } finally {
      setBusy(false);
    }
  };

  const isPending = !profile.approved && !profile.rejectedAt;
  const isApproved = profile.approved === true;
  const isRejected = !profile.approved && !!profile.rejectedAt;
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
          {profile.displayName ?? t("admin.unknown")}
        </p>
        <p className="text-xs text-text-muted">
          {profile.email && <span className="mr-2">{profile.email}</span>}
          {isAdminUser && (
            <span className="inline-flex items-center gap-1 mr-2 text-amber-400 font-medium">
              <Shield className="h-3 w-3" />
              {t("admin.adminLabel")}
            </span>
          )}
          {isApproved ? t("admin.approved") : isRejected ? t("admin.rejected") : t("admin.pendingApproval")}
          {profile.createdAt && ` · ${new Date(profile.createdAt).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isPending && (
          <>
            <button
              onClick={handleReject}
              disabled={busy || isAdminUser}
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <span className="flex items-center gap-1.5"><Ban className="h-4 w-4" /> {t("admin.reject")}</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={busy || isAdminUser}
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> {t("admin.approve")}</span>
            </button>
          </>
        )}
        {isApproved && (
          <button
            onClick={handleRevoke}
            disabled={busy || isAdminUser}
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <span className="flex items-center gap-1.5"><X className="h-4 w-4" /> {t("admin.revoke")}</span>
          </button>
        )}
        {isRejected && (
          <button
            onClick={handleReapprove}
            disabled={busy || isAdminUser}
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> {t("admin.approve")}</span>
          </button>
        )}
      </div>
    </div>
  );
}