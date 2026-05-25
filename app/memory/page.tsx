import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { NoteVault } from "@/components/premium/note-vault";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth/supabase";
import { getIdentityNotes, getTartuNotes } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ edit?: string; editTartu?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [identityNotes, tartuNotes] = await Promise.all([getIdentityNotes(), getTartuNotes()]);
  const editing = identityNotes.find((note) => note.id === params.edit);
  const editingTartu = tartuNotes.find((note) => note.id === params.editTartu);

  return (
    <AppShell user={user}>
      <PageHeader title={t("memory.title")} description={t("memory.subtitle")} />

      <Tabs defaultValue="vault" className="space-y-5">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="vault">{t("memory.vault")}</TabsTrigger>
          <TabsTrigger value="identity">{t("memory.identityNotes")}</TabsTrigger>
          <TabsTrigger value="tartu">{t("memory.tartuNotes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="vault">
          <GlassCard>
            <SectionHeader title={t("memory.allNotes")} description={`${identityNotes.length + tartuNotes.length} entries`} />
            <div className="mt-5">
              <NoteVault identityNotes={identityNotes} tartuNotes={tartuNotes} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="identity">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <GlassCard>
              <SectionHeader
                title={editing ? t("form.identityNote.editTitle") : t("memory.addIdentity")}
                description={t("memory.identityDesc")}
                action={editing ? <Button asChild variant="outline" size="sm"><Link href="/memory"><ArrowLeft className="h-4 w-4" /> {t("common.cancel")}</Link></Button> : undefined}
              />
              <div className="mt-4">
                <IdentityNoteForm note={editing} t={t as (key: string) => string} />
              </div>
            </GlassCard>
            <GlassCard>
              <NoteVault identityNotes={identityNotes} tartuNotes={[]} />
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="tartu">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <GlassCard>
              <SectionHeader
                title={editingTartu ? "Edit Tartu Note" : t("memory.addTartu")}
                description={t("memory.tartuDesc")}
                action={editingTartu ? <Button asChild variant="outline" size="sm"><Link href="/memory"><ArrowLeft className="h-4 w-4" /> {t("common.cancel")}</Link></Button> : undefined}
              />
              <div className="mt-4">
                <TartuNoteForm note={editingTartu} />
              </div>
            </GlassCard>
            <GlassCard>
              <NoteVault identityNotes={[]} tartuNotes={tartuNotes} />
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
