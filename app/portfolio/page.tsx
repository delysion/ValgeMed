import { Award, FileText, Star, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { PortfolioItemForm } from "@/components/forms/life-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { deletePortfolioItemAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.portfolioItems.find((item) => item.id === params.edit);

  const completedItems = data.portfolioItems.filter((item) => item.status === "active");
  const avgValue = completedItems.length > 0
    ? (completedItems.reduce((sum, item) => sum + item.strategicValue, 0) / completedItems.length).toFixed(1)
    : "-";
  const researchItems = data.portfolioItems.filter((item) => item.itemType === "project" || item.itemType === "presentation").length;

  return (
    <AppShell user={user}>
      <PageHeader title={t("portfolio.title")} description={t("portfolio.subtitle")} eyebrow={t("achievement.researchSeed")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("portfolio.title")} value={data.portfolioItems.length} detail="items" icon={Award} tone="cyan" />
        <MetricCard title={t("common.status")} value={completedItems.length} detail="completed" icon={Star} tone={completedItems.length > 0 ? "emerald" : "gold"} />
        <MetricCard title={t("opportunities.value")} value={avgValue} detail="/ 10 avg" icon={TrendingUp} tone={Number(avgValue) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="Research" value={researchItems} detail="items" icon={FileText} tone={researchItems > 0 ? "violet" : "gold"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <SectionHeader title={t("portfolio.addItem")} description={t("portfolio.subtitle")} />
          <div className="mt-4">
            <PortfolioItemForm item={editing} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard tone="gold">
            <SectionHeader title={t("portfolio.trophyRoom")} description={t("common.strategicSignal")} />
            <div className="mt-5 space-y-4">
              <MomentumBar label={t("opportunities.value")} value={(Number(avgValue) / 10) * 100} tone="gold" />
              <MomentumBar label="Completed" value={completedItems.length * 15} tone="emerald" />
              <MomentumBar label="Research" value={researchItems * 20} tone="violet" />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={t("portfolio.history")} description={`${data.portfolioItems.length} ${t("language.entries")}`} />
            <div className="mt-4">
              <ResourceTable
                rows={data.portfolioItems.slice(0, 12)}
                editBasePath="/portfolio"
                deleteAction={deletePortfolioItemAction}
                columns={[
                  { header: t("common.title"), render: (item) => <span className="font-medium text-text-primary">{item.title}</span> },
                  { header: t("common.type"), render: (item) => <Badge variant="muted">{humanize(item.itemType)}</Badge> },
                  { header: t("common.date"), render: (item) => <span className="text-xs text-text-secondary">{fmtDate(item.date)}</span> },
                  { header: t("opportunities.value"), render: (item) => <Badge variant={item.strategicValue >= 7 ? "success" : "default"}>{item.strategicValue}/10</Badge> },
                  { header: t("common.status"), render: (item) => <Badge variant="default">{humanize(item.status)}</Badge> },
                ]}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
