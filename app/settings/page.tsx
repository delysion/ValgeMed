import { FolderOpen, HardDrive, RefreshCw } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/supabase";
import { getI18n } from "@/lib/i18n/server";
import { LanguageSelector } from "@/components/language-selector";
import { OnboardingReplayButton } from "@/components/onboarding-replay-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();

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

        {/* Onboarding Replay */}
        <GlassCard tone="cyan">
          <SectionHeader
            title={locale === "et" ? "Alusta uuesti" : "Restart Onboarding"}
            description={
              locale === "et"
                ? "Käivita juhend uuesti, et näha õpetusi ja näpunäiteid."
                : "Replay the onboarding flow to see tutorials and tips again."
            }
            icon={RefreshCw}
          />
          <div className="mt-4">
            <OnboardingReplayButton />
          </div>
        </GlassCard>

        {/* Local Folder Integration */}
        <GlassCard tone="emerald">
          <SectionHeader
            title={locale === "et" ? "Kohalik kaust" : "Local Folder"}
            description={
              locale === "et"
                ? "Failid salvestatakse rakenduse kausta. Saad need kopeerida oma OneDrive'i või Google Drive'i."
                : "Files are saved in the app's uploads folder. You can copy them to your OneDrive or Google Drive."
            }
            icon={FolderOpen}
          />
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-bg-subtle p-3">
              <HardDrive className="h-5 w-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {locale === "et" ? "Failide asukoht" : "File Location"}
                </p>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {locale === "et"
                    ? "public/uploads/ (rakenduse kaust)"
                    : "public/uploads/ (app directory)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-bg-subtle p-3">
              <FolderOpen className="h-5 w-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {locale === "et" ? "Sünkroonimine" : "Sync with Cloud"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {locale === "et"
                    ? "Lingi oma OneDrive kaust rakenduse kaustaga, et automaatselt sünkroonida."
                    : "Link your OneDrive folder with the app folder for automatic sync."}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {locale === "et" ? "Soovitatud sammud" : "Recommended Steps"}
              </p>
              <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
                <li>{locale === "et" ? "Ava OneDrive sätted" : "Open OneDrive settings"}</li>
                <li>{locale === "et" ? "Lisa kaust: ValgeMed/public/uploads" : "Add folder: ValgeMed/public/uploads"}</li>
                <li>{locale === "et" ? "Failid sünkroonitakse automaatselt" : "Files will sync automatically"}</li>
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
              <a href="/api/export/csv">CSV</a>
            </Button>
          </div>
        </GlassCard>

        {/* Database Info */}
        <GlassCard>
          <SectionHeader title={t("settings.database")} />
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
            <p className="text-sm text-text-secondary">
              {locale === "et" ? "Neon Postgres · Ühendatud" : "Neon Postgres · Connected"}
            </p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
