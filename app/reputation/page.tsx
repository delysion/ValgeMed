import { Award, Star, Shield, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReputationEventForm } from "@/components/forms/life-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { deleteReputationEventAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getReputationEvents } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReputationPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const reputationEvents = await getReputationEvents();
  const editing = reputationEvents.find((event) => event.id === params.edit);

  const activeEvents = reputationEvents.filter((e) => e.status === "done" || e.status === "doing");
  const avgImpact = activeEvents.length > 0
    ? (activeEvents.reduce((sum, e) => sum + e.impact, 0) / activeEvents.length).toFixed(1)
    : "-";
  const highImpact = activeEvents.filter((e) => e.impact >= 7).length;

  return (
    <AppShell user={user}>
      <PageHeader title={t("reputation.title")} description={t("reputation.subtitle")} eyebrow={t("nba.reputation_signal.reason")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("reputation.title")} value={reputationEvents.length} detail="events" icon={Award} tone="cyan" />
        <MetricCard title={t("common.status")} value={activeEvents.length} detail="active" icon={Star} tone={activeEvents.length > 0 ? "emerald" : "gold"} />
        <MetricCard title={t("reputation.trust")} value={avgImpact} detail="/ 10 avg" icon={Shield} tone={Number(avgImpact) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="High impact" value={highImpact} detail="≥ 7/10" icon={TrendingUp} tone={highImpact > 0 ? "violet" : "gold"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <SectionHeader title={t("reputation.logEvent")} description={t("reputation.subtitle")} />
          <div className="mt-4">
            <ReputationEventForm event={editing} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard tone="emerald">
            <SectionHeader title={t("reputation.trust")} description={t("common.strategicSignal")} />
            <div className="mt-5 space-y-4">
              <MomentumBar label={t("reputation.trust")} value={(Number(avgImpact) / 10) * 100} tone="emerald" />
              <MomentumBar label="Active" value={activeEvents.length * 20} tone="cyan" />
              <MomentumBar label="High impact" value={highImpact * 25} tone="violet" />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={t("reputation.history")} description={`${reputationEvents.length} ${t("language.entries")}`} />
            <div className="mt-4">
              <ResourceTable
                rows={reputationEvents}
                editBasePath="/reputation"
                deleteAction={deleteReputationEventAction}
                columns={[
                  { header: t("common.title"), render: (event) => <span className="font-medium text-text-primary">{event.title}</span> },
                  { header: t("common.type"), render: (event) => <Badge variant="muted">{humanize(event.eventType)}</Badge> },
                  { header: t("common.date"), render: (event) => <span className="text-xs text-text-secondary">{fmtDate(event.eventDate)}</span> },
                  { header: t("reputation.trust"), render: (event) => <Badge variant={event.impact >= 7 ? "success" : "default"}>{event.impact}/10</Badge> },
                  { header: t("common.status"), render: (event) => <Badge variant="default">{humanize(event.status)}</Badge> },
                ]}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
