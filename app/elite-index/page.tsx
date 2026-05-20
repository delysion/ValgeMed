import { Brain, Clock, Flame, Radar, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TrendLineChart } from "@/components/charts/study-charts";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { buildEliteIndex } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function EliteIndexPage() {
  const user = await requireUser();
  const { t } = await getI18n();
  const data = await getCoreData();
  const elite = buildEliteIndex(data);
  const history =
    data.strategicReviews.length > 0
      ? data.strategicReviews
          .slice()
          .reverse()
          .map((review) => ({ date: review.date.slice(5), score: review.eliteIndexSnapshot }))
      : data.dailyLogs
          .slice()
          .reverse()
          .slice(-8)
          .map((log, index) => ({
            date: log.date.slice(5),
            score: Math.max(0, Math.min(10, elite.eliteIndex.score - (data.dailyLogs.length - index) * 0.12)),
          }));

  const components = [
    { title: t("elite.medicalMastery"), result: elite.medicalMastery, icon: Brain, tone: "cyan" as const },
    { title: t("elite.examReadiness"), result: elite.examReadiness, icon: ShieldCheck, tone: "violet" as const },
    { title: t("elite.timeLeverage"), result: elite.timeLeverage, icon: Clock, tone: "gold" as const },
    { title: t("elite.errorDestruction"), result: elite.errorDestruction, icon: Flame, tone: "rose" as const },
    { title: t("elite.energyIntegrity"), result: elite.energyIntegrity, icon: Sparkles, tone: "emerald" as const },
    { title: t("elite.opportunityCapture"), result: elite.opportunityCapture, icon: Radar, tone: "cyan" as const },
  ];

  return (
    <AppShell user={user}>
      <PageHeader title={t("elite.title")} description={t("elite.subtitle")} eyebrow={t("common.strategicSignal")} />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard tone="violet" className="grid place-items-center p-8">
          <ScoreRing score={elite.eliteIndex.score} label={t("elite.central")} caption={elite.eliteIndex.label} size="lg" tone="violet" />
          <p className="mt-5 max-w-md text-center text-sm leading-6 text-text-secondary">{elite.eliteIndex.note}</p>
        </GlassCard>

        <GlassCard>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">{t("elite.history")}</h3>
              <p className="mt-1 text-sm text-text-secondary">{t("gamification.readinessTrend")}</p>
            </div>
          </div>
          <TrendLineChart data={history} lines={[{ key: "score", color: "#c7a6ff" }]} />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MomentumBar label={t("gamification.weeklyMomentum")} value={elite.eliteIndex.score * 10} tone="violet" />
            <MomentumBar label={t("gamification.recoveryBalance")} value={elite.energyIntegrity.score * 10} tone="emerald" />
          </div>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {components.map((item) => (
          <MetricCard
            key={item.title}
            title={item.title}
            value={item.result.score.toFixed(1)}
            detail={t(item.result.factors[0]?.label as never) ?? item.result.factors[0]?.label}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <GlassCard>
          <h3 className="text-xl font-semibold text-text-primary">{t("elite.breakdown")}</h3>
          <div className="mt-5">
            <ScoreBreakdown result={elite.eliteIndex} />
          </div>
        </GlassCard>
        <GlassCard tone="emerald">
          <h3 className="text-xl font-semibold text-text-primary">{t("elite.improve")}</h3>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{t("elite.improveBody")}</p>
          <div className="mt-5 space-y-4">
            <MomentumBar label={t("elite.activeRecallBar")} value={elite.medicalMastery.score * 10} tone="cyan" />
            <MomentumBar label={t("elite.recoveryBar")} value={elite.energyIntegrity.score * 10} tone="emerald" />
            <MomentumBar label={t("elite.errorsBar")} value={elite.errorDestruction.score * 10} tone="rose" />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
