import { Clock, Radar, Target, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { OpportunityForm } from "@/components/forms/life-forms";
import { OpportunityList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteOpportunityAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getOpportunities } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const opportunities = await getOpportunities();
  const editing = opportunities.find((opportunity) => opportunity.id === params.edit);

  const activeOps = opportunities.filter((op) => op.status === "watching" || op.status === "active");
  const avgUpside = activeOps.length > 0
    ? (activeOps.reduce((sum, op) => sum + op.strategicUpside, 0) / activeOps.length).toFixed(1)
    : "-";
  const highValue = activeOps.filter((op) => op.strategicUpside >= 7).length;

  return (
    <AppShell user={user}>
      <PageHeader title={t("opportunities.title")} description={t("opportunities.subtitle")} eyebrow={t("common.nextMoveVisible")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("opportunities.title")} value={opportunities.length} detail="tracked" icon={Radar} tone="cyan" />
        <MetricCard title={t("common.status")} value={activeOps.length} detail="active" icon={Target} tone={activeOps.length > 0 ? "emerald" : "gold"} />
        <MetricCard title={t("opportunities.upside")} value={avgUpside} detail="/ 10 avg" icon={TrendingUp} tone={Number(avgUpside) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="High value" value={highValue} detail="≥ 7/10" icon={Clock} tone={highValue > 0 ? "violet" : "gold"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <SectionHeader title={t("opportunities.addOpportunity")} description={t("opportunities.subtitle")} />
          <div className="mt-4">
            <OpportunityForm opportunity={editing} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard tone="gold">
            <SectionHeader title={t("opportunities.radar")} description={t("common.strategicSignal")} />
            <div className="mt-5 space-y-4">
              <MomentumBar label={t("opportunities.upside")} value={(Number(avgUpside) / 10) * 100} tone="gold" />
              <MomentumBar label="Active" value={activeOps.length * 20} tone="cyan" />
              <MomentumBar label="High value" value={highValue * 25} tone="violet" />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={t("opportunities.history")} description={`${opportunities.length} ${t("language.entries")}`} />
            <div className="mt-4">
              <OpportunityList
                opportunities={opportunities}
                editBasePath="/opportunities"
                deleteAction={deleteOpportunityAction}
                labels={{
                  emptyTitle: t("common.emptyTitle"),
                  emptyBody: t("common.emptyBody"),
                  open: t("common.open"),
                  edit: t("common.edit"),
                  delete: t("common.delete"),
                }}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
