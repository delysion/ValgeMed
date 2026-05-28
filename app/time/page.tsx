import { AppShell, PageHeader } from "@/components/app-shell";
import { TimeBlockForm } from "@/components/forms/life-forms";
import { TimeBlockList } from "@/components/life/life-lists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTimeBlockAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getTimeBlocks } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function TimePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const timeBlocks = await getTimeBlocks();
  const editing = timeBlocks.find((block) => block.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader title={t("nav.time")} description={t("command.timeLeverage")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <TimeBlockForm block={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("nav.time")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeBlockList
              blocks={timeBlocks}
              editBasePath="/time"
              deleteAction={deleteTimeBlockAction}
              labels={{
                emptyTitle: t("common.emptyTitle"),
                emptyBody: t("common.emptyBody"),
                open: t("common.open"),
                edit: t("common.edit"),
                delete: t("common.delete"),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
