import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { IdentityNoteForm } from "@/components/forms/entity-forms";
import { TartuNoteForm } from "@/components/forms/life-forms";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { NoteVault } from "@/components/premium/note-vault";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getIdentityNotes, getTartuNotes } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { BookOpen, Brain, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ edit?: string; editTartu?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const [identityNotes, tartuNotes] = await Promise.all([getIdentityNotes(), getTartuNotes()]);
  const editing = identityNotes.find((note) => note.id === params.edit);
  const editingTartu = tartuNotes.find((note) => note.id === params.editTartu);

  const totalNotes = identityNotes.length + tartuNotes.length;
  const identityCategories = [...new Set(identityNotes.map((n) => n.category))].length;

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("memory.title")}
        description={tt("memory.subtitle")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Notes"
            value={totalNotes}
            icon={BookOpen}
            tone="cyan"
            detail="across all sources"
          />
          <MetricCard
            label="Identity Notes"
            value={identityNotes.length}
            icon={Brain}
            tone="violet"
            detail={`${identityCategories} categories`}
          />
          <MetricCard
            label="Tartu Notes"
            value={tartuNotes.length}
            icon={BookOpen}
            tone="emerald"
            detail="university specific"
          />
          <MetricCard
            label="Categories"
            value={identityCategories}
            icon={Sparkles}
            tone="gold"
            detail="identity types"
          />
        </div>

        <Tabs defaultValue="vault" className="space-y-5">
          <TabsList>
            <TabsTrigger value="vault">
              <BookOpen className="mr-2 h-4 w-4" />
              All Notes
            </TabsTrigger>
            <TabsTrigger value="identity">
              <Brain className="mr-2 h-4 w-4" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="tartu">
              <BookOpen className="mr-2 h-4 w-4" />
              Tartu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vault">
            <GlassCard>
              <SectionHeader
                title="Note Vault"
                description={`${totalNotes} entries`}
                icon={BookOpen}
              />
              <div className="mt-5">
                <NoteVault identityNotes={identityNotes} tartuNotes={tartuNotes} />
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="identity">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <GlassCard tone="neutral" padded>
                <SectionHeader
                  title={editing ? "Edit Identity Note" : "New Identity Note"}
                  description={tt("memory.identityDesc")}
                  action={editing ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/memory">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Cancel
                      </Link>
                    </Button>
                  ) : undefined}
                />
                <div className="mt-4">
                  <IdentityNoteForm note={editing} t={tt} />
                </div>
              </GlassCard>

              <GlassCard tone="violet">
                <SectionHeader
                  title="Identity Notes"
                  description={`${identityNotes.length} notes`}
                  icon={Brain}
                />
                <div className="mt-5">
                  {identityNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet/10 mb-4">
                        <Brain className="h-8 w-8 text-violet" />
                      </div>
                      <p className="text-muted mb-4">No identity notes yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/memory?newNote=true">
                          Create your first note
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <NoteVault identityNotes={identityNotes} tartuNotes={[]} />
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="tartu">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <GlassCard tone="neutral" padded>
                <SectionHeader
                  title={editingTartu ? "Edit Tartu Note" : "New Tartu Note"}
                  description={tt("memory.tartuDesc")}
                  action={editingTartu ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/memory">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Cancel
                      </Link>
                    </Button>
                  ) : undefined}
                />
                <div className="mt-4">
                  <TartuNoteForm note={editingTartu} />
                </div>
              </GlassCard>

              <GlassCard tone="emerald">
                <SectionHeader
                  title="Tartu Notes"
                  description={`${tartuNotes.length} notes`}
                  icon={BookOpen}
                />
                <div className="mt-5">
                  {tartuNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 mb-4">
                        <BookOpen className="h-8 w-8 text-emerald" />
                      </div>
                      <p className="text-muted mb-4">No Tartu notes yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/memory?newTartu=true">
                          Create your first note
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <NoteVault identityNotes={[]} tartuNotes={tartuNotes} />
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
