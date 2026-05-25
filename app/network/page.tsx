import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ProfessionalContactForm } from "@/components/forms/life-forms";
import { ContactCard, FollowUpItem } from "@/components/premium/contact-card";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/glass-card";
import { OpportunityPipeline } from "@/components/premium/opportunity-pipeline";
import { SectionHeader } from "@/components/premium/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth/supabase";
import { getOpportunities, getProfessionalContacts } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [professionalContacts, opportunities] = await Promise.all([getProfessionalContacts(), getOpportunities()]);
  const editing = professionalContacts.find((contact) => contact.id === params.edit);

  const followUps = professionalContacts
    .filter((c) => c.nextFollowUpAt)
    .sort((a, b) => (a.nextFollowUpAt?.getTime() ?? 0) - (b.nextFollowUpAt?.getTime() ?? 0));

  const strongContacts = professionalContacts
    .filter((c) => (c.relationshipStrength ?? 0) >= 6)
    .sort((a, b) => (b.relationshipStrength ?? 0) - (a.relationshipStrength ?? 0));

  return (
    <AppShell user={user}>
      <PageHeader title={t("network.title")} description={t("network.subtitle")} />

      <Tabs defaultValue="contacts" className="space-y-5">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="contacts">{t("network.title")}</TabsTrigger>
          <TabsTrigger value="followups">{t("network.followupQueue")}</TabsTrigger>
          <TabsTrigger value="pipeline">{t("network.pipeline")}</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <div>
              {editing ? (
                <GlassCard>
                  <SectionHeader
                    title="Edit Contact"
                    description={t("network.contactDesc")}
                    action={<Button asChild variant="outline" size="sm"><Link href="/network"><ArrowLeft className="h-4 w-4" /> {t("common.cancel")}</Link></Button>}
                  />
                  <div className="mt-4">
                    <ProfessionalContactForm contact={editing} />
                  </div>
                </GlassCard>
              ) : (
                <GlassCard>
                  <SectionHeader title={t("network.addContact")} description={t("network.contactDesc")} />
                  <div className="mt-4">
                    <ProfessionalContactForm />
                  </div>
                </GlassCard>
              )}
            </div>

            <div className="space-y-5">
              {strongContacts.length > 0 && (
                <GlassCard>
                  <SectionHeader title={t("network.keyContacts")} description={t("network.strongRelationships")} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {strongContacts.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                  </div>
                </GlassCard>
              )}

              <GlassCard>
                <SectionHeader title={t("network.allContacts")} description={`${professionalContacts.length} ${t("network.total")}`} />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {professionalContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followups">
          <GlassCard>
            <SectionHeader title={t("network.followupQueue")} description={`${followUps.length} ${t("network.pending")}`} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {followUps.map((contact) => (
                <FollowUpItem key={contact.id} contact={contact} />
              ))}
            </div>
            {followUps.length === 0 && (
              <p className="mt-4 text-center text-sm text-muted">{t("network.noFollowups")}</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="pipeline">
          <GlassCard>
            <SectionHeader title={t("network.pipeline")} description={t("opportunities.subtitle")} />
            <div className="mt-4">
              <OpportunityPipeline opportunities={opportunities} />
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
