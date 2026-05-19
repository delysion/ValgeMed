import { Bot, Brain, CalendarRange, FileJson, FlaskConical, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { Badge } from "@/components/ui/badge";
import { requireOwnerSession } from "@/lib/auth/session";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const aiTools = [
  { key: "ai.dailyCommand", icon: WandSparkles, tone: "violet" as const },
  { key: "ai.examBattlePlan", icon: Brain, tone: "cyan" as const },
  { key: "ai.errorPattern", icon: Sparkles, tone: "rose" as const },
  { key: "ai.weeklyReview", icon: CalendarRange, tone: "emerald" as const },
  { key: "ai.semesterPlan", icon: FileJson, tone: "gold" as const },
  { key: "ai.researchIdeas", icon: FlaskConical, tone: "cyan" as const },
];

export default async function AiPage() {
  const session = await requireOwnerSession();
  const { t, locale } = await getI18n();
  const payload = {
    language: locale,
    promptRule: t("ai.promptRule"),
    mode: "packet_preview",
    privacy: "review_before_share",
  };

  return (
    <AppShell session={session}>
      <PageHeader title={t("ai.title")} description={t("ai.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard tone="violet" className="p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-violet/25 bg-violet/10 text-violet">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="warning">{t("ai.status")}: OFF</Badge>
              <h3 className="mt-3 text-3xl font-semibold text-white">{t("ai.packetMode")}</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">{t("ai.warning")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetricCard title={t("language.label")} value={locale.toUpperCase()} detail={t("ai.promptRule")} icon={LockKeyhole} tone="gold" />
            <MetricCard title={t("settings.privacy")} value="Local" detail="No automatic cloud transfer" icon={LockKeyhole} tone="emerald" />
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <GlassCard key={tool.key} tone={tool.tone}>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <Icon className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t(tool.key as never)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{t("ai.warning")}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <GlassCard>
          <h3 className="text-xl font-semibold text-white">{t("ai.payloadPreview")}</h3>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </GlassCard>
        <GlassCard tone="emerald">
          <h3 className="text-xl font-semibold text-white">{t("ai.outputPreview")}</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-sm leading-6 text-muted">{t("common.nextMoveVisible")}</p>
            <p className="mt-3 text-sm leading-6 text-white">{t("ai.promptRule")}</p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
