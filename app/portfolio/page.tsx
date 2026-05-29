import { Award, FileText, Star, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { PortfolioItemForm } from "@/components/forms/life-forms";
import { PortfolioItemList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { deletePortfolioItemAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getPortfolioItems } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const portfolioItems = await getPortfolioItems();
  const editing = portfolioItems.find((item) => item.id === params.edit);

  const activeItems = portfolioItems.filter((item) => item.status === "active");
  const avgValue = activeItems.length > 0
    ? (activeItems.reduce((sum, item) => sum + item.strategicValue, 0) / activeItems.length).toFixed(1)
    : "-";
  const researchItems = portfolioItems.filter((item) => item.itemType === "project" || item.itemType === "presentation").length;

  return (
    <AppShell user={user}>
      <PageHeader title={t("portfolio.title")} description={t("portfolio.subtitle")} eyebrow={t("achievement.researchSeed")} />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 sm:grid-cols-4">
        <MetricCard title={t("portfolio.title")} value={portfolioItems.length} detail="items" icon={Award} tone="cyan" />
        <MetricCard title={t("common.status")} value={activeItems.length} detail="active" icon={Star} tone={activeItems.length > 0 ? "emerald" : "gold"} />
        <MetricCard title={t("opportunities.value")} value={avgValue} detail="/ 10 avg" icon={TrendingUp} tone={Number(avgValue) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="Research" value={researchItems} detail="items" icon={FileText} tone={researchItems > 0 ? "violet" : "gold"} />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:gap-5">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-4 sm:mb-5">
            <SectionHeader title={t("portfolio.addItem")} description={t("portfolio.subtitle")} />
          </div>
          <PortfolioItemForm item={editing} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold-bg/40 via-bg-surface to-bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-4 sm:mb-5">
            <SectionHeader title={t("portfolio.trophyRoom")} description={t("common.strategicSignal")} />
          </div>
          <div className="space-y-4 sm:space-y-5">
            <MomentumBar label={t("opportunities.value")} value={(Number(avgValue) / 10) * 100} tone="gold" />
            <MomentumBar label="Active" value={activeItems.length * 15} tone="emerald" />
            <MomentumBar label="Research" value={researchItems * 20} tone="violet" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-4 sm:mb-5">
            <SectionHeader title={t("portfolio.history")} description={`${portfolioItems.length} ${t("language.entries")}`} />
          </div>
          <PortfolioItemList
            items={portfolioItems}
            editBasePath="/portfolio"
            deleteAction={deletePortfolioItemAction}
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
    </AppShell>
  );
}
