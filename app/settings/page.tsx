import { Bell, FolderOpen, HardDrive, RefreshCw, Cpu } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/supabase";
import { getI18n } from "@/lib/i18n/server-i18n";
import { LanguageSelector } from "@/components/language-selector";
import { OnboardingReplayButton } from "@/components/onboarding-replay-button";
import { PushNotificationButton } from "@/components/push-notification-button";
import { saveAiSettingsAction } from "@/lib/actions/settings";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const { t } = await getI18n();
  const db = getDb();
  const [profile] = await db.select({ aiProvider: profiles.aiProvider, aiApiKey: profiles.aiApiKey }).from(profiles).where(eq(profiles.id, user.id)).limit(1);

  return (
    <AppShell user={user}>
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />

      <div className="flex flex-col gap-5">
        {/* Language */}
        <GlassCard>
          <SectionHeader title={t("settings.languagePreference")} icon={RefreshCw} />
          <p className="mt-2 text-sm text-text-secondary">{t("settings.languageBody")}</p>
          <div className="mt-4">
            <LanguageSelector />
          </div>
        </GlassCard>

        {/* AI Configuration */}
        <GlassCard tone="violet">
          <SectionHeader title="AI Settings" description="Use your own API key for AI features" icon={Cpu} />
          <div className="mt-4">
            <form action={saveAiSettingsAction} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-muted">Provider</label>
                <select
                  name="aiProvider"
                  defaultValue={profile?.aiProvider || ""}
                  className="h-12 w-full rounded-xl border border-border/60 bg-bg-elevated px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">None (use server default)</option>
                  <option value="groq">Groq (free)</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-muted">API Key</label>
                <Input
                  name="aiApiKey"
                  type="password"
                  defaultValue={profile?.aiApiKey || ""}
                  placeholder={profile?.aiApiKey ? "•••••••• (saved)" : "sk-... or gsk_..."}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  {profile?.aiApiKey ? "✅ Key saved" : "Key is stored encrypted in your profile"}
                </p>
                <Button type="submit" size="sm">Save</Button>
              </div>
            </form>
          </div>
        </GlassCard>

        {/* Push Notifications */}
        <GlassCard tone="gold">
          <SectionHeader
            title={t("settings.pushTitle")}
            description={t("settings.pushDesc")}
            icon={Bell}
          />
          <div className="mt-4">
            <PushNotificationButton />
          </div>
        </GlassCard>

        {/* Onboarding Replay */}
        <GlassCard tone="cyan">
          <SectionHeader
            title={t("settings.onboardingTitle")}
            description={t("settings.onboardingDesc")}
            icon={RefreshCw}
          />
          <div className="mt-4">
            <OnboardingReplayButton />
          </div>
        </GlassCard>

        {/* Local Folder Integration */}
        <GlassCard tone="emerald">
          <SectionHeader
            title={t("settings.folderTitle")}
            description={t("settings.folderDesc")}
            icon={FolderOpen}
          />
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-bg-subtle p-3">
              <HardDrive className="h-5 w-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t("settings.fileLocation")}
                </p>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {t("settings.appDirectory")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-bg-subtle p-3">
              <FolderOpen className="h-5 w-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t("settings.syncCloud")}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {t("settings.syncDesc")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {t("settings.recommendedSteps")}
              </p>
              <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
                <li>{t("settings.step1")}</li>
                <li>{t("settings.step2")}</li>
                <li>{t("settings.step3")}</li>
              </ol>
            </div>
          </div>
        </GlassCard>

        {/* Export */}
        <GlassCard>
          <SectionHeader title={t("settings.export")} icon={HardDrive} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <a href="/api/export/json">{t("app.exportJson")}</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/csv">{t("settings.csv")}</a>
            </Button>
          </div>
        </GlassCard>

        {/* Database Info */}
        <GlassCard>
          <SectionHeader title={t("settings.database")} />
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
            <p className="text-sm text-text-secondary">
              {t("settings.dbConnected")}
            </p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
