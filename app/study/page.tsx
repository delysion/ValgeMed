import { Brain, Clock, Sparkles, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { MethodPieChart, MinutesBarChart } from "@/components/charts/study-charts";
import { StudySessionForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { Badge } from "@/components/ui/badge";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.studySessions.find((item) => item.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const activeMinutes = data.studySessions.filter((item) => activeMethods.has(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const passiveMinutes = data.studySessions.filter((item) => ["reading", "notes"].includes(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalMinutes = activeMinutes + passiveMinutes;
  const activeRatio = totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 100;
  const methodTotals = Object.entries(
    data.studySessions.reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: humanize(name), value }));
  const dayTotals = Object.entries(
    data.studySessions.slice(0, 80).reduce<Record<string, number>>((acc, item) => {
      const key = item.startedAt.toISOString().slice(5, 10);
      acc[key] = (acc[key] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  ).map(([name, minutes]) => ({ name, minutes })).slice(-14);

  return (
    <AppShell session={session}>
      <PageHeader title={t("study.title")} description={t("study.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <StudySessionForm session={editing} subjects={data.subjects} topics={data.topics} exams={data.exams} />
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title={t("study.activeRecall")} value={activeMinutes} detail={t("common.minutes")} icon={Brain} tone="cyan" />
            <MetricCard title={t("study.passive")} value={passiveMinutes} detail={t("common.minutes")} icon={Clock} tone="violet" />
            <MetricCard title={t("gamification.momentum")} value={`${activeRatio.toFixed(0)}%`} detail={t("achievement.activeRecallShift")} icon={Zap} tone={activeRatio >= 55 ? "emerald" : "gold"} />
            <MetricCard title={t("study.weeklyOutput")} value={totalMinutes} detail={t("common.protectEnergy")} icon={Sparkles} tone="rose" />
          </div>

          <GlassCard tone="cyan">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">{t("study.weeklyOutput")}</h3>
              <Badge>{activeRatio.toFixed(0)}%</Badge>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
              <MinutesBarChart data={dayTotals} />
              <div className="space-y-4">
                <MomentumBar label={t("study.activeRecall")} value={activeRatio} tone="cyan" />
                <MomentumBar label={t("common.focus")} value={Math.min(100, data.studySessions[0]?.focusLevel ? data.studySessions[0].focusLevel * 10 : 0)} tone="violet" />
                <MomentumBar label={t("common.output")} value={Math.min(100, data.studySessions[0]?.outputQuality ? data.studySessions[0].outputQuality * 10 : 0)} tone="emerald" />
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <GlassCard>
              <h3 className="text-xl font-semibold text-white">{t("study.methodSelector")}</h3>
              <MethodPieChart data={methodTotals} />
            </GlassCard>
            <GlassCard>
              <h3 className="text-xl font-semibold text-white">{t("study.sessionHistory")}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data.studySessions.slice(0, 10).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{subjectById.get(item.subjectId)?.name ?? t("common.subject")}</p>
                        <p className="mt-1 text-xs text-muted">{fmtDate(item.startedAt)} - {humanize(item.method)}</p>
                      </div>
                      <Badge variant={activeMethods.has(item.method) ? "success" : "muted"}>{item.durationMinutes}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
