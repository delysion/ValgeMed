"use client";

import { useState } from "react";
import { Check, X, Shield, Ban, Save } from "lucide-react";
import { approveUserAction, updateUserAiPromptLimitAction, updateUserAiUsageLimitsAction } from "@/lib/actions/admin";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Profile = {
  id: string;
  displayName: string | null;
  email: string | null;
  approved: boolean | null;
  rejectedAt: Date | null;
  isAdmin: boolean | null;
  aiPromptLimitChars: number;
  aiDailyRequestLimit: number;
  aiDailyCharLimit: number;
  createdAt: Date | null;
};

export function UserRow({ profile: initial }: { profile: Profile }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [limitBusy, setLimitBusy] = useState(false);
  const [promptLimit, setPromptLimit] = useState(initial.aiPromptLimitChars);
  const [dailyRequestLimit, setDailyRequestLimit] = useState(initial.aiDailyRequestLimit);
  const [dailyCharLimit, setDailyCharLimit] = useState(initial.aiDailyCharLimit);
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

  const handleSavePromptLimit = async () => {
    setLimitBusy(true);
    try {
      const res = await updateUserAiPromptLimitAction(profile.id, promptLimit);
      if (res.success) {
        setProfile((p) => ({ ...p, aiPromptLimitChars: res.aiPromptLimitChars }));
        setPromptLimit(res.aiPromptLimitChars);
        showToast(t("admin.promptLimitSaved"));
      }
    } finally {
      setLimitBusy(false);
    }
  };

  const handleSaveUsageLimits = async () => {
    setLimitBusy(true);
    try {
      const res = await updateUserAiUsageLimitsAction(profile.id, dailyRequestLimit, dailyCharLimit);
      if (res.success) {
        setProfile((p) => ({
          ...p,
          aiDailyRequestLimit: res.aiDailyRequestLimit,
          aiDailyCharLimit: res.aiDailyCharLimit,
        }));
        setDailyRequestLimit(res.aiDailyRequestLimit);
        setDailyCharLimit(res.aiDailyCharLimit);
        showToast(t("admin.aiUsageLimitsSaved"));
      }
    } finally {
      setLimitBusy(false);
    }
  };

  const isPending = !profile.approved && !profile.rejectedAt;
  const isApproved = profile.approved === true;
  const isRejected = !profile.approved && !!profile.rejectedAt;
  const isAdminUser = !!profile.isAdmin;

  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-border/60 bg-bg-surface/80 p-4 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <label htmlFor={`prompt-limit-${profile.id}`} className="text-xs font-medium text-text-muted">
            {t("admin.promptLimit")}
          </label>
          <input
            id={`prompt-limit-${profile.id}`}
            type="number"
            min={1000}
            max={500000}
            step={1000}
            value={promptLimit}
            onChange={(event) => setPromptLimit(Number(event.target.value))}
            className="h-9 w-28 rounded-lg border border-border/60 bg-bg-page px-2 text-sm text-text-primary outline-none focus:border-primary"
          />
          <button
            onClick={handleSavePromptLimit}
            disabled={limitBusy || busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-page disabled:opacity-50"
            title={t("admin.saveLimit")}
          >
            <Save className="h-3.5 w-3.5" />
            {t("admin.saveLimit")}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <label htmlFor={`daily-request-limit-${profile.id}`} className="text-xs font-medium text-text-muted">
            {t("admin.aiDailyRequests")}
          </label>
          <input
            id={`daily-request-limit-${profile.id}`}
            type="number"
            min={1}
            max={500}
            step={1}
            value={dailyRequestLimit}
            onChange={(event) => setDailyRequestLimit(Number(event.target.value))}
            className="h-9 w-20 rounded-lg border border-border/60 bg-bg-page px-2 text-sm text-text-primary outline-none focus:border-primary"
          />
          <label htmlFor={`daily-char-limit-${profile.id}`} className="text-xs font-medium text-text-muted">
            {t("admin.aiDailyChars")}
          </label>
          <input
            id={`daily-char-limit-${profile.id}`}
            type="number"
            min={10000}
            max={2000000}
            step={10000}
            value={dailyCharLimit}
            onChange={(event) => setDailyCharLimit(Number(event.target.value))}
            className="h-9 w-32 rounded-lg border border-border/60 bg-bg-page px-2 text-sm text-text-primary outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveUsageLimits}
            disabled={limitBusy || busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-page disabled:opacity-50"
            title={t("admin.saveAiUsageLimits")}
          >
            <Save className="h-3.5 w-3.5" />
            {t("admin.saveAiUsageLimits")}
          </button>
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
    </div>
  );
}
