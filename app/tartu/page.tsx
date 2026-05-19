import { AppShell, PageHeader } from "@/components/app-shell";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTartuNoteAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TartuPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.tartuNotes.find((note) => note.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Tartu / Estonia" description="Lingua, routine, cultura accademica, documenti e adattamento a Tartu." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <TartuNoteForm note={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Tartu notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.tartuNotes}
              editBasePath="/tartu"
              deleteAction={deleteTartuNoteAction}
              columns={[
                { header: "Titolo", render: (note) => <span className="font-medium text-white">{note.title}</span> },
                { header: "Categoria", render: (note) => humanize(note.category) },
                { header: "Status", render: (note) => <Badge variant={note.status === "done" ? "success" : "muted"}>{humanize(note.status)}</Badge> },
                { header: "Priorita", render: (note) => `${note.priority}/10` },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
