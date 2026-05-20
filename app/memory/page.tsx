import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { NoteVault } from "@/components/premium/note-vault";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ edit?: string; editTartu?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.identityNotes.find((note) => note.id === params.edit);
  const editingTartu = data.tartuNotes.find((note) => note.id === params.editTartu);

  return (
    <AppShell session={session}>
      <PageHeader title={t("memory.title")} description={t("memory.subtitle")} />

      <Tabs defaultValue="vault" className="space-y-5">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="vault">{t("memory.vault")}</TabsTrigger>
          <TabsTrigger value="identity">{t("memory.identityNotes")}</TabsTrigger>
          <TabsTrigger value="tartu">{t("memory.tartuNotes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="vault">
          <GlassCard>
            <SectionHeader title={t("memory.allNotes")} description={`${data.identityNotes.length + data.tartuNotes.length} entries`} />
            <div className="mt-5">
              <NoteVault identityNotes={data.identityNotes} tartuNotes={[]} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="identity">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <GlassCard>
              <SectionHeader title={t("memory.addIdentity")} description={t("memory.identityDesc")} />
              <div className="mt-4">
                <IdentityNoteForm note={editing} t={t as (key: string) => string} />
              </div>
            </GlassCard>
            <GlassCard>
              <NoteVault identityNotes={data.identityNotes} tartuNotes={[]} />
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="tartu">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <GlassCard>
              <SectionHeader title={t("memory.addTartu")} description={t("memory.tartuDesc")} />
              <div className="mt-4">
                <TartuNoteForm note={editingTartu} />
              </div>
            </GlassCard>
            <GlassCard>
              <NoteVault identityNotes={[]} tartuNotes={data.tartuNotes} />
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
