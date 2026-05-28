import { AppShell, PageHeader } from "@/components/app-shell";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { TartuNoteList } from "@/components/life/life-lists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTartuNoteAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getTartuNotes } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function TartuPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
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
            <TartuNoteList
              notes={tartuNotes}
              editBasePath="/tartu"
              deleteAction={deleteTartuNoteAction}
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
