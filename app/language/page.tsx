import { AppShell, PageHeader } from "@/components/app-shell";
import { LanguageProgressForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteLanguageProgressAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function LanguagePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.languageProgress.find((item) => item.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Language Layer" description="Estonian medical terminology, Latin terminology e inglese accademico." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <LanguageProgressForm item={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Language progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.languageProgress}
              editBasePath="/language"
              deleteAction={deleteLanguageProgressAction}
              columns={[
                { header: "Item", render: (item) => <span className="font-medium text-white">{item.title}</span> },
                { header: "Lingua", render: (item) => humanize(item.language) },
                { header: "Min", render: (item) => item.minutes },
                { header: "Confidence", render: (item) => <Badge>{item.confidence}/10</Badge> },
                { header: "Next", render: (item) => fmtDate(item.nextPracticeAt) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
