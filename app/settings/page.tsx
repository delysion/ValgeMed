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
      <div className="grid gap-5 xl:grid-cols-4">
        <GlassCard tone="cyan">
          <Database className="h-5 w-5 text-cyan" />
          <h3 className="mt-4 text-xl font-semibold text-white">{t("settings.database")}</h3>
          <Badge className="mt-4" variant={dbStatus.configured ? "success" : "danger"}>
            {dbStatus.configured ? "configured" : "missing DATABASE_URL"}
          </Badge>
          <p className="mt-3 text-sm text-muted">{dbStatus.provider}</p>
        </GlassCard>

        <GlassCard tone="violet">
          <Download className="h-5 w-5 text-violet" />
          <h3 className="mt-4 text-xl font-semibold text-white">{t("settings.export")}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
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
          <Globe2 className="h-5 w-5 text-gold" />
          <h3 className="mt-4 text-xl font-semibold text-white">{t("settings.languagePreference")}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{t("settings.languageBody")}</p>
          <div className="mt-4">
            <LanguageSelector current={locale} label={t("language.label")} />
          </div>
        </GlassCard>

        <GlassCard tone="emerald">
          <Shield className="h-5 w-5 text-emerald" />
          <h3 className="mt-4 text-xl font-semibold text-white">{t("settings.privacy")}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{session.email}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{t("settings.version")}: {packageJson.version}</p>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-4">
        <WeightCard title="Exam readiness" weights={readinessWeights} />
        <WeightCard title="Study efficiency" weights={efficiencyWeights} />
        <WeightCard title="Burnout" weights={burnoutWeights} />
        <WeightCard title="Elite Index" weights={eliteIndexWeights} />
      </div>
    </AppShell>
  );
}

function WeightCard({ title, weights }: { title: string; weights: Record<string, number> }) {
  return (
    <GlassCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-2">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 text-sm">
            <span className="text-muted">{key}</span>
            <span className="font-mono text-white">{value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
