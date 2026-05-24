import { Battery, Brain, HeartPulse, Moon, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/premium/empty-state";
import { HealthLogForm } from "@/components/forms/life-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { deleteHealthLogAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getHealthLogs } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function HealthPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const healthLogs = await getHealthLogs();
  const editing = healthLogs.find((log) => log.id === params.edit);

  const latestLog = healthLogs[0];
  const avgSleep = healthLogs.length > 0
    ? (healthLogs.reduce((sum, log) => sum + (log.sleepQuality ?? 0), 0) / healthLogs.length).toFixed(1)
    : "-";
  const avgFatigue = healthLogs.length > 0
    ? (healthLogs.reduce((sum, log) => sum + (log.cognitiveFatigue ?? 0), 0) / healthLogs.length).toFixed(1)
    : "-";
  const avgRecovery = healthLogs.length > 0
    ? (healthLogs.reduce((sum, log) => sum + (log.recoveryQuality ?? 0), 0) / healthLogs.length).toFixed(1)
    : "-";

  return (
    <AppShell user={user}>
      <PageHeader title={t("health.title")} description={t("health.subtitle")} eyebrow={t("common.protectEnergy")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("health.sleep")} value={avgSleep} detail="/ 10 avg" icon={Moon} tone="cyan" />
        <MetricCard title={t("health.cognitiveFatigue")} value={avgFatigue} detail="/ 10 avg" icon={Brain} tone={Number(avgFatigue) >= 7 ? "danger" : "emerald"} />
        <MetricCard title={t("health.recoveryBalance")} value={avgRecovery} detail="/ 10 avg" icon={Battery} tone={Number(avgRecovery) >= 6 ? "emerald" : "gold"} />
        <MetricCard title={t("health.energyIntegrity")} value={latestLog?.energyIntegrityScore ?? "-"} detail="/ 10 latest" icon={Zap} tone={(latestLog?.energyIntegrityScore ?? 0) >= 6 ? "emerald" : "rose"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <SectionHeader title={t("health.logEntry")} description={t("health.subtitle")} />
          <div className="mt-4">
            <HealthLogForm log={editing} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard tone="emerald">
            <SectionHeader title={t("health.energyIntegrity")} description={t("common.strategicSignal")} />
            <div className="mt-5 space-y-4">
              <MomentumBar label={t("health.sleep")} value={(Number(avgSleep) / 10) * 100} tone="cyan" />
              <MomentumBar label={t("health.cognitiveFatigue")} value={Math.max(0, 100 - (Number(avgFatigue) / 10) * 100)} tone="violet" />
              <MomentumBar label={t("health.recoveryBalance")} value={(Number(avgRecovery) / 10) * 100} tone="emerald" />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={t("health.history")} description={`${healthLogs.length} ${t("health.entries")}`} />
            <div className="mt-4">
              {healthLogs.length === 0 ? (
                <EmptyState
                  icon={HeartPulse}
                  title={t("common.emptyTitle")}
                  description={t("common.emptyBody")}
                  tone="emerald"
                />
              ) : (
                <ResourceTable
                  rows={healthLogs.slice(0, 12)}
                  editBasePath="/health"
                  deleteAction={deleteHealthLogAction}
                  emptyState={{ title: t("common.emptyTitle"), description: t("common.emptyBody") }}
                  columns={[
                    { header: t("common.date"), render: (log) => <span className="font-medium text-text-primary">{fmtDate(log.date)}</span> },
                    { header: t("health.sleep"), render: (log) => <Badge variant="muted">{log.sleepQuality ?? "-"}</Badge> },
                    { header: t("health.cognitiveFatigue"), render: (log) => <Badge variant={(log.cognitiveFatigue ?? 0) >= 7 ? "danger" : "muted"}>{log.cognitiveFatigue ?? "-"}</Badge> },
                    { header: t("health.recoveryBalance"), render: (log) => <Badge variant={(log.recoveryQuality ?? 0) >= 6 ? "success" : "muted"}>{log.recoveryQuality ?? "-"}</Badge> },
                    { header: t("health.energyIntegrity"), render: (log) => <Badge variant={(log.energyIntegrityScore ?? 0) >= 6 ? "success" : "danger"}>{log.energyIntegrityScore ?? "-"}</Badge> },
                  ]}
                />
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
