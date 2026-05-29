import { Award, Star, Shield, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReputationEventForm } from "@/components/forms/life-forms";
import { ReputationEventList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteReputationEventAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getReputationEvents } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

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

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 sm:grid-cols-4">
        <MetricCard title={t("reputation.title")} value={reputationEvents.length} detail="events" icon={Award} tone="cyan" />
        <MetricCard title={t("common.status")} value={activeEvents.length} detail="active" icon={Star} tone={activeEvents.length > 0 ? "emerald" : "gold"} />
        <MetricCard title={t("reputation.trust")} value={avgImpact} detail="/ 10 avg" icon={Shield} tone={Number(avgImpact) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="High" value={highImpact} detail="≥ 7" icon={TrendingUp} tone={highImpact > 0 ? "violet" : "gold"} />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:gap-5">
        <div className="rounded-2xl border border-border/60 bg-bg-surface shadow-[var(--shadow-card)]">
          <div className="p-4 sm:p-5">
            <SectionHeader title={t("reputation.logEvent")} description={t("reputation.subtitle")} />
          </div>
          <ReputationEventForm event={editing} />
        </div>

        <div className="rounded-2xl border border-emerald/20 bg-gradient-to-br from-emerald-bg/40 via-bg-surface to-bg-surface shadow-[var(--shadow-card)]">
          <div className="p-4 sm:p-5">
            <SectionHeader title={t("reputation.trust")} description={t("common.strategicSignal")} />
          </div>
          <div className="px-4 pb-4 space-y-3 sm:px-5 sm:pb-5 sm:space-y-4">
            <MomentumBar label={t("reputation.trust")} value={(Number(avgImpact) / 10) * 100} tone="emerald" />
            <MomentumBar label="Active" value={activeEvents.length * 20} tone="cyan" />
            <MomentumBar label="High impact" value={highImpact * 25} tone="violet" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface shadow-[var(--shadow-card)]">
          <div className="p-4 sm:p-5">
            <SectionHeader title={t("reputation.history")} description={`${reputationEvents.length} ${t("language.entries")}`} />
          </div>
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <ReputationEventList
              events={reputationEvents}
              editBasePath="/reputation"
              deleteAction={deleteReputationEventAction}
              labels={{
                emptyTitle: t("common.emptyTitle"),
                emptyBody: t("common.emptyBody"),
                open: t("common.open"),
                edit: t("common.edit"),
                delete: t("common.delete"),
              }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
