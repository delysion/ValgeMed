import { AppShell, PageHeader } from "@/components/app-shell";
import { ProfessionalContactForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProfessionalContactAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.professionalContacts.find((contact) => contact.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title={t("network.title")} description={t("network.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <ProfessionalContactForm contact={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("network.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.professionalContacts}
              editBasePath="/network"
              deleteAction={deleteProfessionalContactAction}
              columns={[
                { header: t("common.title"), render: (contact) => <span className="font-medium text-white">{contact.name}</span> },
                { header: t("common.type"), render: (contact) => contact.role ?? "-" },
                { header: t("reputation.trust"), render: (contact) => contact.institution ?? "-" },
                { header: t("reputation.reliability"), render: (contact) => <Badge>{contact.relationshipStrength}/10</Badge> },
                { header: t("common.nextAction"), render: (contact) => fmtDate(contact.nextFollowUpAt) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
