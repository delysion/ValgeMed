import { AppShell, PageHeader } from "@/components/app-shell";
import { ProfessionalContactForm } from "@/components/forms/life-forms";
import { ContactCard, FollowUpItem } from "@/components/premium/contact-card";
import { GlassCard } from "@/components/premium/glass-card";
import { OpportunityPipeline } from "@/components/premium/opportunity-pipeline";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.professionalContacts.find((contact) => contact.id === params.edit);

  const followUps = data.professionalContacts
    .filter((c) => c.nextFollowUpAt)
    .sort((a, b) => (a.nextFollowUpAt?.getTime() ?? 0) - (b.nextFollowUpAt?.getTime() ?? 0));

  const strongContacts = data.professionalContacts
    .filter((c) => (c.relationshipStrength ?? 0) >= 6)
    .sort((a, b) => (b.relationshipStrength ?? 0) - (a.relationshipStrength ?? 0));

  return (
    <AppShell session={session}>
      <PageHeader title={t("network.title")} description={t("network.subtitle")} />

      <Tabs defaultValue="contacts" className="space-y-5">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="contacts">{t("network.title")}</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <div>
              {editing ? (
                <ProfessionalContactForm contact={editing} />
              ) : (
                <GlassCard>
                  <SectionHeader title="Add Contact" description="Strategic network entry" />
                  <div className="mt-4">
                    <ProfessionalContactForm />
                  </div>
                </GlassCard>
              )}
            </div>

            <div className="space-y-5">
              {strongContacts.length > 0 && (
                <GlassCard>
                  <SectionHeader title="Key Contacts" description="Strongest relationships" />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {strongContacts.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                  </div>
                </GlassCard>
              )}

              <GlassCard>
                <SectionHeader title="All Contacts" description={`${data.professionalContacts.length} total`} />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.professionalContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followups">
          <GlassCard>
            <SectionHeader title="Follow-up Queue" description={`${followUps.length} pending`} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {followUps.map((contact) => (
                <FollowUpItem key={contact.id} contact={contact} />
              ))}
            </div>
            {followUps.length === 0 && (
              <p className="mt-4 text-center text-sm text-muted">No pending follow-ups.</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="pipeline">
          <GlassCard>
            <SectionHeader title="Opportunity Pipeline" description={t("opportunities.subtitle")} />
            <div className="mt-4">
              <OpportunityPipeline opportunities={data.opportunities} />
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
