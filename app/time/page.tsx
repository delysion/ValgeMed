import { AppShell, PageHeader } from "@/components/app-shell";
import { TimeBlockForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTimeBlockAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getTimeBlocks } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TimePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
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
            <ResourceTable
              rows={timeBlocks}
              editBasePath="/time"
              deleteAction={deleteTimeBlockAction}
              columns={[
                { header: t("common.title"), render: (block) => <span className="font-medium text-text-primary">{block.title}</span> },
                { header: t("common.date"), render: (block) => fmtDate(block.date) },
                { header: t("common.type"), render: (block) => humanize(block.blockType) },
                { header: t("common.minutes"), render: (block) => `${block.actualMinutes}/${block.plannedMinutes}` },
                { header: t("command.timeLeverage"), render: (block) => <Badge>{block.leverageScore}/10</Badge> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
