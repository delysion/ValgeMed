import { CheckSquare, ListTodo, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { LifeAdminItemForm } from "@/components/forms/life-forms";
import { LifeAdminItemList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteLifeAdminItemAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getLifeAdminItems } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function LifeAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const lifeAdminItems = await getLifeAdminItems();
  const editing = lifeAdminItems.find((item) => item.id === params.edit);

  const totalItems = lifeAdminItems.length;
  const todoItems = lifeAdminItems.filter((item) => item.status === "todo");
  const doneItems = lifeAdminItems.filter((item) => item.status === "done");
  const highPriorityItems = lifeAdminItems.filter((item) => item.priority >= 7);

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("life.title")}
        description={tt("life.subtitle")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Items"
            value={totalItems}
            icon={ListTodo}
            tone="cyan"
            detail="tracked"
          />
          <MetricCard
            label="To Do"
            value={todoItems.length}
            icon={Sparkles}
            tone="gold"
            detail="pending"
          />
          <MetricCard
            label="Done"
            value={doneItems.length}
            icon={CheckSquare}
            tone="emerald"
            detail="completed"
          />
          <MetricCard
            label="High Priority"
            value={highPriorityItems.length}
            icon={ShieldCheck}
            tone={highPriorityItems.length > 0 ? "rose" : "emerald"}
            detail="prio ≥ 7"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <GlassCard tone="neutral" padded>
            <SectionHeader
              title={editing ? "Edit Life Admin" : "New Life Admin"}
              description={tt("life.subtitle")}
              icon={ListTodo}
            />
            <div className="mt-4">
              <LifeAdminItemForm item={editing} />
            </div>
          </GlassCard>

          <GlassCard tone="default" padded={false}>
            <div className="flex items-center justify-between p-5 pb-3">
              <SectionHeader
                title={tt("life.title")}
                description={`${totalItems} items`}
                icon={TrendingUp}
              />
            </div>

            {lifeAdminItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                  <CheckSquare className="h-8 w-8 text-muted" />
                </div>
                <p className="text-muted mb-4">No life admin items yet</p>
              </div>
            ) : (
              <LifeAdminItemList
                items={lifeAdminItems}
                editBasePath="/life-admin"
                deleteAction={deleteLifeAdminItemAction}
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
