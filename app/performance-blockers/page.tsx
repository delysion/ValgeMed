import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Target } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getCommandPageData, getEliteTargetSettings } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import {
  buildElitePerformanceCommand,
  derivePerformanceBlockers,
  type PerformanceBlocker,
} from "@/lib/scoring/elite-performance";

export const dynamic = "force-dynamic";

type Translate = (key: string, params?: Record<string, string | number>) => string;

function localizeBlockerAction(blocker: PerformanceBlocker, t: Translate) {
  if (blocker.status === "destroyed") return t("blockers.action.destroyed");
  return blocker.recurrenceCount > 0 ? t("blockers.action.error") : t("blockers.action.topic");
}

function localizeBlockerStatus(blocker: PerformanceBlocker, t: Translate) {
  return t(`blockers.status.${blocker.status}`);
}

export default async function PerformanceBlockersPage() {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as Translate;
  const [data, settings] = await Promise.all([
    getCommandPageData(user.id),
    getEliteTargetSettings(user.id),
  ]);
  const command = buildElitePerformanceCommand({
    settings,
    exams: data.exams,
    topics: data.topics,
    studySessions: data.studySessions,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    quizAttempts: data.quizAttempts,
    dailyLogs: data.dailyLogs,
    healthLogs: data.healthLogs,
  });
  const blockers = derivePerformanceBlockers({
    errorLogs: data.errorLogs,
    topics: data.topics,
    exams: data.exams,
  });
  const open = blockers.filter((blocker) => blocker.status !== "destroyed");
  const critical = open.filter((blocker) => blocker.severity >= 7);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={tt("blockers.eyebrow")}
        title={tt("blockers.title")}
        description={tt("blockers.description")}
        actions={
          <Button asChild variant="outline">
            <Link href="/command">
              {tt("blockers.backToCommand")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title={tt("blockers.openTitle")} value={open.length} detail={tt("blockers.openDetail")} icon={ShieldCheck} tone={open.length ? "rose" : "emerald"} />
        <MetricCard title={tt("blockers.criticalTitle")} value={critical.length} detail={tt("blockers.criticalDetail")} icon={AlertTriangle} tone={critical.length ? "danger" : "emerald"} />
        <MetricCard
          title={tt("blockers.promotedTitle")}
          value={command.winningMove.kind === "error_review" ? tt("common.yes") : tt("common.no")}
          detail={command.winningMove.kind === "error_review" ? tt("blockers.promotedDetailActive") : tt("blockers.promotedDetailInactive")}
          icon={Target}
          tone={command.winningMove.kind === "error_review" ? "gold" : "cyan"}
        />
      </div>

      <GlassCard className="mt-5">
        <SectionHeader title={tt("blockers.enemyListTitle")} description={tt("blockers.enemyListDescription")} icon={ShieldCheck} />
        <div className="mt-5 grid gap-3">
          {blockers.length > 0 ? blockers.map((blocker) => (
            <div key={blocker.id} className="rounded-2xl border border-border/70 bg-bg-elevated/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{blocker.label}</p>
                    <Badge variant={blocker.status === "destroyed" ? "success" : blocker.severity >= 7 ? "danger" : "warning"}>
                      {localizeBlockerStatus(blocker, tt)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{localizeBlockerAction(blocker, tt)}</p>
                </div>
                <div className="grid min-w-[150px] grid-cols-2 gap-2 text-right">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{tt("blockers.severity")}</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-text-primary">{blocker.severity.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{tt("blockers.recurrence")}</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-text-primary">{blocker.recurrenceCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-emerald/25 bg-emerald-bg/20 p-5">
              <CheckCircle2 className="h-6 w-6 text-emerald" />
              <p className="mt-3 text-sm font-semibold text-text-primary">{tt("blockers.noBlockersTitle")}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {tt("blockers.noBlockersDescription")}
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </AppShell>
  );
}
