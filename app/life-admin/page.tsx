import { AppShell, PageHeader } from "@/components/app-shell";
import { LifeAdminItemForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteLifeAdminItemAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getLifeAdminItems } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function LifeAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const lifeAdminItems = await getLifeAdminItems();
  const editing = lifeAdminItems.find((item) => item.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader title={t("life.title")} description={t("life.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <LifeAdminItemForm item={editing} />
        <GlassCard>
          <SectionHeader title={t("life.title")} description={`${lifeAdminItems.length} items`} />
          <div className="mt-4">
            <ResourceTable
              rows={lifeAdminItems}
              editBasePath="/life-admin"
              deleteAction={deleteLifeAdminItemAction}
              columns={[
                { header: t("common.title"), render: (item) => <span className="font-medium text-text-primary">{item.title}</span> },
                { header: t("common.category"), render: (item) => humanize(item.category) },
                { header: t("common.date"), render: (item) => fmtDate(item.dueAt) },
                { header: t("common.status"), render: (item) => <Badge variant={item.status === "done" ? "success" : "muted"}>{humanize(item.status)}</Badge> },
                { header: t("common.priority"), render: (item) => `${item.priority}/10` },
              ]}
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
