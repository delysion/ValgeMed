import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteIdentityNoteAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function IdentityPage({ searchParams }: { searchParams: Promise<{ editNote?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.identityNotes.find((note) => note.id === params.editNote);

  return (
    <AppShell session={session}>
      <PageHeader title="Identity / Aura" description="Professional identity, standards, boundaries, ambition, image and discipline." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <IdentityNoteForm note={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Identity notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.identityNotes}
              editBasePath="/identity"
              editParam="editNote"
              deleteAction={deleteIdentityNoteAction}
              columns={[
                { header: "Titolo", render: (note) => <span className="font-medium text-white">{note.title}</span> },
                { header: "Categoria", render: (note) => humanize(note.category) },
                { header: "Contenuto", render: (note) => <span className="line-clamp-2">{note.content}</span> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
