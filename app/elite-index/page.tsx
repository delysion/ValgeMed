import { Brain, Clock, Flame, Radar, ShieldCheck, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TrendLineChart } from "@/components/charts/study-charts";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { buildEliteIndex, type ScoreResult } from "@/lib/scoring/engine";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type TFunc = (key: string) => string;

export default async function EliteIndexPage() {
  const user = await requireUser();
  const { t } = await getI18n();
  const data = await getCoreData(user.id);
  const elite = buildEliteIndex(data);
  const hasReviews = data.strategicReviews.length > 0;
  const hasLogs = data.dailyLogs.length > 0;
  const history =
    hasReviews
      ? data.strategicReviews
          .slice()
          .reverse()
          .map((review) => ({ date: review.date.slice(5), score: review.eliteIndexSnapshot ?? 0 }))
      : hasLogs
        ? data.dailyLogs
            .slice(0, 8)
            .reverse()
            .map((log, i) => ({
              date: log.date.slice(5),
              score: Math.max(0, Math.min(10, (elite.eliteIndex.score ?? 0) * (i + 1) / 8)),
            }))
        : [];

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

      <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.82fr)_minmax(0,1.18fr)]">
        <EliteCommandPanel
          score={elite.eliteIndex.score}
          label={elite.eliteIndex.label}
          note={elite.eliteIndex.note}
          energyScore={elite.energyIntegrity.score}
          masteryScore={elite.medicalMastery.score}
          t={t as TFunc}
        />

        <div className="min-w-0 space-y-5">
          <GlassCard className="overflow-hidden">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{t("elite.history")}</h3>
                <p className="mt-1 text-sm text-text-secondary">{t("gamification.readinessTrend")}</p>
              </div>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-violet/20 bg-violet/10 text-violet">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            {history.length > 0 ? (
              <TrendLineChart data={history} lines={[{ key: "score", color: "#c7a6ff" }]} />
            ) : (
              <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-bg-page/30 text-sm text-text-muted">
                {t("common.noData")}
              </div>
            )}
          </GlassCard>

          <EliteSignalGrid items={components} t={t as TFunc} />
        </div>
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

function EliteCommandPanel({
  score,
  label,
  note,
  energyScore,
  masteryScore,
  t,
}: {
  score: number;
  label: string;
  note: string;
  energyScore: number;
  masteryScore: number;
  t: TFunc;
}) {
  return (
    <GlassCard tone="violet" className="overflow-hidden p-0">
      <div className="grid gap-6 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet">{t("elite.central")}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-primary">{label}</h2>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet/25 bg-violet/10 text-violet">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="grid place-items-center rounded-[1.25rem] border border-violet/15 bg-bg-page/45 px-4 py-7">
          <ScoreRing score={score} label={t("elite.title")} caption={label} size="xl" tone="violet" />
          <p className="mt-5 max-w-sm text-center text-sm leading-6 text-text-secondary">{note}</p>
        </div>

        <div className="grid gap-3">
          <MomentumBar label={t("elite.activeRecallBar")} value={masteryScore * 10} tone="cyan" />
          <MomentumBar label={t("elite.recoveryBar")} value={energyScore * 10} tone="emerald" />
        </div>
      </div>
    </GlassCard>
  );
}

function EliteSignalGrid({
  items,
  t,
}: {
  items: Array<{
    title: string;
    result: ScoreResult;
    icon: LucideIcon;
    tone: "cyan" | "violet" | "gold" | "rose" | "emerald";
  }>;
  t: TFunc;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <EliteSignalCard key={item.title} {...item} t={t} />
      ))}
    </div>
  );
}

function EliteSignalCard({
  title,
  result,
  icon: Icon,
  tone,
  t,
}: {
  title: string;
  result: ScoreResult;
  icon: LucideIcon;
  tone: "cyan" | "violet" | "gold" | "rose" | "emerald";
  t: TFunc;
}) {
  const firstFactor = result.factors[0];
  const toneClass = {
    cyan: "text-cyan bg-cyan/10 border-cyan/20",
    violet: "text-violet bg-violet/10 border-violet/20",
    gold: "text-gold bg-gold/10 border-gold/20",
    rose: "text-rose bg-rose/10 border-rose/20",
    emerald: "text-emerald bg-emerald/10 border-emerald/20",
  }[tone];
  const barClass = {
    cyan: "from-cyan to-emerald",
    violet: "from-violet to-cyan",
    gold: "from-gold to-emerald",
    rose: "from-rose to-gold",
    emerald: "from-emerald to-cyan",
  }[tone];

  return (
    <div className="min-w-0 rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/25 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-text-muted">{firstFactor ? t(firstFactor.label) : t("common.noData")}</p>
        </div>
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="font-mono text-3xl font-semibold leading-none tabular-nums text-text-primary">
          {result.score.toFixed(1)}
        </span>
        <span className="pb-1 text-xs font-medium text-text-muted">/10</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-page">
        <div className={cn("h-full rounded-full bg-gradient-to-r", barClass)} style={{ width: `${Math.max(4, result.score * 10)}%` }} />
      </div>
    </div>
  );
}
