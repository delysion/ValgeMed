import { AppShell, PageHeader } from "@/components/app-shell";
import { LifeAdminItemForm } from "@/components/forms/life-forms";
import { LifeAdminItemList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteLifeAdminItemAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getLifeAdminItems } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function LifeAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
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
            <LifeAdminItemList
              items={lifeAdminItems}
              editBasePath="/life-admin"
              deleteAction={deleteLifeAdminItemAction}
              labels={{
                emptyTitle: t("common.emptyTitle"),
                emptyBody: t("common.emptyBody"),
                open: t("common.open"),
                edit: t("common.edit"),
                delete: t("common.delete"),
              }}
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
