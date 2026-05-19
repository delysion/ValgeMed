import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { NoteVault } from "@/components/premium/note-vault";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ edit?: string; editTartu?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.identityNotes.find((note) => note.id === params.edit);
  const editingTartu = data.tartuNotes.find((note) => note.id === params.editTartu);

  return (
    <AppShell session={session}>
      <PageHeader title="Memory Vault" description="Private knowledge base: identity notes, Tartu insights, and strategic memory." />

      <Tabs defaultValue="vault" className="space-y-5">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="vault">Vault</TabsTrigger>
          <TabsTrigger value="identity">Identity Notes</TabsTrigger>
          <TabsTrigger value="tartu">Tartu Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="vault">
          <GlassCard>
            <SectionHeader title="All Notes" description={`${data.identityNotes.length + data.tartuNotes.length} entries`} />
            <div className="mt-5">
              <NoteVault identityNotes={data.identityNotes} tartuNotes={data.tartuNotes} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="identity">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <GlassCard>
              <SectionHeader title="Add Identity Note" description="Professional standards and personal identity" />
              <div className="mt-4">
                <IdentityNoteForm note={editing} />
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
              <SectionHeader title="Add Tartu Note" description="Academic life and local integration" />
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
