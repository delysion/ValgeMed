import {
  CheckSquare,
  ListTodo,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { LifeAdminItemForm } from "@/components/forms/life-forms";
import { LifeAdminItemList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { deleteLifeAdminItemAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getLifeAdminItems } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function LifeAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
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
  const overdueItems = lifeAdminItems.filter((item) => item.dueAt && item.dueAt < new Date() && item.status !== "done");

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("life.title")}
        description={tt("life.subtitle")}
        actions={
          overdueItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-rose/30 bg-rose-bg/30 px-4 py-2">
              <AlertTriangle className="h-4 w-4 text-rose" />
              <span className="text-xs font-medium text-rose">{overdueItems.length} overdue</span>
            </div>
          )
        }
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

        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <GlassCard tone="neutral" padded>
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet/10">
                  <ListTodo className="h-4 w-4 text-violet" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{editing ? "Edit Life Admin" : "New Life Admin"}</h3>
                  <p className="text-xs text-text-muted">{tt("life.subtitle")}</p>
                </div>
              </div>
              <LifeAdminItemForm item={editing} />
            </GlassCard>
          </div>

          <GlassCard tone="default" padded={false}>
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-text-muted" />
                <h3 className="text-base font-semibold text-text-primary">{tt("life.title")}</h3>
              </div>
              <span className="text-xs text-text-muted">{totalItems} items</span>
            </div>

            {lifeAdminItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-bg-subtle">
                  <CheckSquare className="h-6 w-6 text-text-muted" />
                </div>
                <p className="mt-4 text-sm font-medium text-text-primary">No life admin items yet</p>
                <p className="mt-1 text-xs text-text-secondary">Add your first item to start tracking</p>
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