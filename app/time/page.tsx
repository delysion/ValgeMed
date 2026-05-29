import { Clock, Timer, TrendingUp, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TimeBlockForm } from "@/components/forms/life-forms";
import { TimeBlockList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteTimeBlockAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getTimeBlocks } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function TimePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const timeBlocks = await getTimeBlocks();
  const editing = timeBlocks.find((block) => block.id === params.edit);

  const totalBlocks = timeBlocks.length;
  const totalMinutes = timeBlocks.reduce((acc, b) => acc + b.plannedMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);
  const avgLeverage = totalBlocks > 0
    ? Math.round(timeBlocks.reduce((acc, b) => acc + b.leverageScore, 0) / totalBlocks)
    : 0;
  const totalEnergy = timeBlocks.reduce((acc, b) => acc + b.energyCost, 0);

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("nav.time")}
        description={tt("command.timeLeverage")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Time Blocks"
            value={totalBlocks}
            icon={Timer}
            tone="cyan"
            detail="total tracked"
          />
          <MetricCard
            label="Planned Hours"
            value={totalHours}
            icon={Clock}
            tone="gold"
            detail={`${totalMinutes} minutes`}
          />
          <MetricCard
            label="Avg Leverage"
            value={avgLeverage}
            icon={TrendingUp}
            tone={avgLeverage >= 5 ? "emerald" : "gold"}
            detail="out of 10"
          />
          <MetricCard
            label="Energy Cost"
            value={totalEnergy}
            icon={Zap}
            tone={totalEnergy > 20 ? "rose" : "emerald"}
            detail="total units"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <GlassCard tone="neutral" padded>
            <SectionHeader
              title={editing ? "Edit Time Block" : "New Time Block"}
              description="Block time for deep work"
              icon={Clock}
            />
            <div className="mt-4">
              <TimeBlockForm block={editing} />
            </div>
          </GlassCard>

          <GlassCard tone="default" padded={false}>
            <div className="flex items-center justify-between p-5 pb-3">
              <SectionHeader
                title={tt("nav.time")}
                description={`${totalBlocks} blocks`}
                icon={Timer}
              />
            </div>

            {timeBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                  <Clock className="h-8 w-8 text-muted" />
                </div>
                <p className="text-muted mb-4">No time blocks yet</p>
              </div>
            ) : (
              <TimeBlockList
                blocks={timeBlocks}
                editBasePath="/time"
                deleteAction={deleteTimeBlockAction}
                labels={{
                  emptyTitle: tt("common.emptyTitle"),
                  emptyBody: tt("common.emptyBody"),
                  open: tt("common.open"),
                  edit: tt("common.edit"),
                  delete: tt("common.delete"),
                }}
              />
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
