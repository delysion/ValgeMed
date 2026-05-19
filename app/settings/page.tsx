import Link from "next/link";
import { Database, Download, Globe2, Shield } from "lucide-react";

import packageJson from "@/package.json";
import { AppShell, PageHeader } from "@/components/app-shell";
import { LanguageSelector } from "@/components/language-selector";
import { GlassCard } from "@/components/premium/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDatabaseStatus } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { burnoutWeights, efficiencyWeights, eliteIndexWeights, readinessWeights } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireOwnerSession();
  const { t, locale } = await getI18n();
  const dbStatus = getDatabaseStatus();

  return (
    <AppShell session={session}>
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />
      <div className="flex flex-col gap-5">
        {/* Settings Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <GlassCard tone="cyan">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-bg text-cyan">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{t("settings.database")}</h3>
            <Badge className="mt-3" variant={dbStatus.configured ? "success" : "danger"}>
              {dbStatus.configured ? t("settings.configured") : t("settings.missingDb")}
            </Badge>
            <p className="mt-2 text-sm text-text-secondary">{dbStatus.provider}</p>
          </GlassCard>

          <GlassCard tone="violet">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-bg text-violet">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{t("settings.export")}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href="/api/export/json">JSON</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/api/export/csv">CSV</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/settings/import-export">{t("settings.export")}</Link>
              </Button>
            </div>
          </GlassCard>

          <GlassCard tone="gold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-bg text-gold">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{t("settings.languagePreference")}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{t("settings.languageBody")}</p>
            <div className="mt-3">
              <LanguageSelector current={locale} label={t("language.label")} />
            </div>
          </GlassCard>

          <GlassCard tone="emerald">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-bg text-emerald">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{t("settings.privacy")}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{session.email}</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{t("settings.version")}: {packageJson.version}</p>
          </GlassCard>
        </div>

        {/* Weight Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <WeightCard title={t("settings.weightExam")} weights={readinessWeights} tone="cyan" />
          <WeightCard title={t("settings.weightEfficiency")} weights={efficiencyWeights} tone="violet" />
          <WeightCard title={t("settings.weightBurnout")} weights={burnoutWeights} tone="rose" />
          <WeightCard title={t("settings.weightElite")} weights={eliteIndexWeights} tone="emerald" />
        </div>
      </div>
    </AppShell>
  );
}

function WeightCard({ title, weights, tone }: { title: string; weights: Record<string, number>; tone: "cyan" | "violet" | "rose" | "emerald" }) {
  const toneBar = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    rose: "bg-rose",
    emerald: "bg-emerald",
  };

  const maxWeight = Math.max(...Object.values(weights));

  return (
    <GlassCard>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <div className="mt-3 flex flex-col gap-3">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{key}</span>
              <span className="font-mono text-sm font-medium text-text-primary">{value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
              <div
                className={`h-full rounded-full ${toneBar[tone]}`}
                style={{ width: `${(value / maxWeight) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
