import { Bell, FolderOpen, HardDrive, RefreshCw, Cpu, Target } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server-i18n";
import { LanguageSelector } from "@/components/language-selector";
import { OnboardingReplayButton } from "@/components/onboarding-replay-button";
import { PushNotificationButton } from "@/components/push-notification-button";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { EliteTargetSettingsForm } from "@/components/elite-target-settings-form";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeEliteTargetSettings } from "@/lib/scoring/elite-performance";
import { requireApprovedUser } from "@/lib/auth/supabase";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  let profile = {
    aiProvider: null as string | null,
    aiApiKey: null as string | null,
    targetLevel: null as string | null,
    weaknessTolerance: null as string | null,
    examStrategy: null as string | null,
  };
  try {
    const db = getDb();
    const [p] = await db.select({
      aiProvider: profiles.aiProvider,
      aiApiKey: profiles.aiApiKey,
      targetLevel: profiles.targetLevel,
      weaknessTolerance: profiles.weaknessTolerance,
      examStrategy: profiles.examStrategy,
    }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (p) profile = p;
  } catch {} // columns may not exist yet
  const eliteTargetSettings = normalizeEliteTargetSettings({
    targetLevel: profile.targetLevel,
    weaknessTolerance: profile.weaknessTolerance,
    examStrategy: profile.examStrategy,
  });

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
            <AiSettingsForm key={profile?.aiApiKey || "empty"} initialProvider={profile?.aiProvider} hasSavedKey={!!profile?.aiApiKey} />
          </div>
        </GlassCard>

        {/* Elite Target Mode */}
        <GlassCard tone="cyan">
          <SectionHeader
            title="Elite Target Mode"
            description="Private target calibration for the command engine. No public ranking, no comparison."
            icon={Target}
          />
          <div className="mt-4">
            <EliteTargetSettingsForm settings={eliteTargetSettings} />
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
            <Button asChild variant="outline">
              <a href="/api/export/ical">iCal</a>
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
