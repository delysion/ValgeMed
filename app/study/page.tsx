import { Brain, Clock, Sparkles, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { MethodPieChart, MinutesBarChart } from "@/components/charts/study-charts";
import { StudySessionForm } from "@/components/forms/entity-forms";
import { CollapsiblePanel } from "@/components/premium/collapsible-panel";
import { FocusTimer } from "@/components/premium/focus-timer";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/supabase";
import { getReferenceData, getStudySessions } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [ref, studySessions] = await Promise.all([getReferenceData(), getStudySessions()]);
  const editing = studySessions.find((item) => item.id === params.edit);
  const subjectById = new Map(ref.subjects.map((subject) => [subject.id, subject]));
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const activeMinutes = studySessions.filter((item) => activeMethods.has(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const passiveMinutes = studySessions.filter((item) => ["reading", "notes"].includes(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalMinutes = activeMinutes + passiveMinutes;
  const activeRatio = totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 100;
  const methodTotals = Object.entries(
    studySessions.reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: humanize(name), value }));
  const dayTotals = Object.entries(
    studySessions.slice(0, 80).reduce<Record<string, number>>((acc, item) => {
      const key = item.startedAt.toISOString().slice(5, 10);
      acc[key] = (acc[key] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  ).map(([name, minutes]) => ({ name, minutes })).slice(-14);

  return (
    <AppShell user={user}>
      <PageHeader title={t("study.title")} description={t("study.subtitle")} />
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title={t("study.activeRecall")} value={activeMinutes} detail={t("common.minutes")} icon={Brain} tone="cyan" />
          <MetricCard title={t("study.passive")} value={passiveMinutes} detail={t("common.minutes")} icon={Clock} tone="violet" />
          <MetricCard title={t("gamification.momentum")} value={`${activeRatio.toFixed(0)}%`} detail={t("achievement.activeRecallShift")} icon={Zap} tone={activeRatio >= 55 ? "emerald" : "gold"} />
          <MetricCard title={t("study.weeklyOutput")} value={totalMinutes} detail={t("common.protectEnergy")} icon={Sparkles} tone="rose" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <GlassCard tone="cyan">
              <SectionHeader title={t("study.weeklyOutput")} description={t("common.protectEnergy")} />
              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
                <MinutesBarChart data={dayTotals} />
                <div className="space-y-4">
                  <MomentumBar label={t("study.activeRecall")} value={activeRatio} tone="cyan" />
                  <MomentumBar label={t("common.focus")} value={Math.min(100, studySessions[0]?.focusLevel ? studySessions[0].focusLevel * 10 : 0)} tone="violet" />
                  <MomentumBar label={t("common.output")} value={Math.min(100, studySessions[0]?.outputQuality ? studySessions[0].outputQuality * 10 : 0)} tone="emerald" />
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <SectionHeader title={t("study.sessionHistory")} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {studySessions.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:bg-white/[0.05]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-sm text-text-primary">{subjectById.get(item.subjectId)?.name ?? t("common.subject")}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{fmtDate(item.startedAt)} · {humanize(item.method)}</p>
                      </div>
                      <Badge variant={activeMethods.has(item.method) ? "success" : "muted"} className="shrink-0 text-[10px]">{item.durationMinutes}m</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-5">
            <GlassCard>
              <SectionHeader title={t("study.quickStart")} />
              <div className="mt-4">
                <StudySessionForm session={editing} subjects={ref.subjects} topics={ref.topics} exams={ref.exams} t={t as (key: string) => string} />
              </div>
            </GlassCard>

            <CollapsiblePanel title={t("command.focusTimer")} defaultOpen>
              <FocusTimer />
            </CollapsiblePanel>

            <GlassCard>
              <SectionHeader title={t("study.methodSelector")} />
              <div className="mt-4">
                <MethodPieChart data={methodTotals} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
