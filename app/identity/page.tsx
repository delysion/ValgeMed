import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteIdentityNoteAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getIdentityNotes } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function IdentityPage({ searchParams }: { searchParams: Promise<{ editNote?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const identityNotes = await getIdentityNotes();
  const editing = identityNotes.find((note) => note.id === params.editNote);

  return (
    <AppShell user={user}>
      <PageHeader title={t("nav.identity")} description={t("memory.identityDesc")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <IdentityNoteForm note={editing} t={t as (key: string) => string} />
        <GlassCard>
          <SectionHeader title={t("nav.identity")} description={`${identityNotes.length} notes`} />
          <div className="mt-4">
            <ResourceTable
              rows={identityNotes}
              editBasePath="/identity"
              editParam="editNote"
              deleteAction={deleteIdentityNoteAction}
              columns={[
                { header: t("common.title"), render: (note) => <span className="font-medium text-text-primary">{note.title}</span> },
                { header: t("common.category"), render: (note) => humanize(note.category) },
                { header: t("common.output"), render: (note) => <span className="line-clamp-2">{note.content}</span> },
              ]}
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
