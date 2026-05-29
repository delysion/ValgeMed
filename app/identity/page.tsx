import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { IdentityNotesList } from "@/components/identity-notes-list";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteIdentityNoteAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getIdentityNotes } from "@/lib/data/queries";
import type { IdentityNote } from "@/lib/db/schema";
import { getI18n } from "@/lib/i18n/server-i18n";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function IdentityPage({ searchParams }: { searchParams: Promise<{ editNote?: string; viewNote?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const identityNotes = await getIdentityNotes();
  const editing = identityNotes.find((note) => note.id === params.editNote);
  const selectedNote = identityNotes.find((note) => note.id === params.viewNote);

  return (
    <AppShell user={user}>
      <PageHeader title={t("nav.identity")} description={t("memory.identityDesc")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <IdentityNoteForm note={editing} t={t as (key: string) => string} />
        <GlassCard className="min-w-0">
          <SectionHeader title={t("nav.identity")} description={`${identityNotes.length} notes`} />
          {selectedNote ? <IdentityNoteDetail note={selectedNote} /> : null}
          <div className="mt-4">
            <IdentityNotesList
              identityNotes={identityNotes}
              editBasePath="/identity"
              editParam="editNote"
              viewBasePath="/identity"
              viewParam="viewNote"
              deleteAction={deleteIdentityNoteAction}
              selectedNote={selectedNote}
              labels={{
                title: t("common.title"),
                category: t("common.category"),
                content: t("common.output"),
                edit: t("common.edit"),
                delete: t("common.delete"),
                open: t("common.open"),
                empty: t("common.emptyTitle"),
              }}
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function IdentityNoteDetail({ note }: { note: IdentityNote }) {
  return (
    <div className="mt-4 rounded-2xl border border-violet/20 bg-violet-bg/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{humanize(note.category)}</p>
      <h3 className="mt-2 text-lg font-semibold text-text-primary">{note.title}</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">{note.content}</p>
    </div>
  );
}
