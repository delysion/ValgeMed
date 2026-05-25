import { AppShell, PageHeader } from "@/components/app-shell";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTartuNoteAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getTartuNotes } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TartuPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const tartuNotes = await getTartuNotes();
  const editing = tartuNotes.find((note) => note.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader title={t("tartu.title")} description={t("tartu.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <TartuNoteForm note={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("tartu.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={tartuNotes}
              editBasePath="/tartu"
              deleteAction={deleteTartuNoteAction}
              columns={[
                { header: t("common.title"), render: (note) => <span className="font-medium text-text-primary">{note.title}</span> },
                { header: t("common.category"), render: (note) => humanize(note.category) },
                { header: t("common.status"), render: (note) => <Badge variant={note.status === "done" ? "success" : "muted"}>{humanize(note.status)}</Badge> },
                { header: t("common.priority"), render: (note) => `${note.priority}/10` },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
