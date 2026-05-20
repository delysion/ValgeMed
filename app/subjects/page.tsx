import Link from "next/link";

import { AppShell, PageHeader } from "@/components/app-shell";
import { SubjectForm } from "@/components/forms/entity-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceTable } from "@/components/tables/resource-table";
import { deleteSubjectAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.subjects.find((subject) => subject.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader
        title={t("nav.subjects")}
        description={t("topics.subtitle")}
      />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <SubjectForm subject={editing} t={t as (key: string) => string} />
        <Card>
          <CardHeader>
            <CardTitle>{t("nav.subjects")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.subjects}
              editBasePath="/subjects"
              deleteAction={deleteSubjectAction}
              columns={[
                {
                  header: t("common.subject"),
                  render: (subject) => (
                    <div>
                      <Link href={`/subjects/${subject.id}`} className="font-medium text-text-primary hover:text-ice">
                        {subject.name}
                      </Link>
                      <div className="text-xs text-text-secondary">{subject.code ?? "-"}</div>
                    </div>
                  ),
                },
                {
                  header: t("common.difficulty"),
                  render: (subject) => <Badge variant="muted">{subject.difficulty}/10</Badge>,
                },
                {
                  header: t("common.importance"),
                  render: (subject) => <Badge>{subject.importance}/10</Badge>,
                },
                {
                  header: t("common.progress"),
                  render: (subject) => {
                    const subjectTopics = data.topics.filter(
                      (topic) => topic.subjectId === subject.id,
                    );
                    const ready = subjectTopics.filter(
                      (topic) => topic.status === "exam_ready" || topic.status === "consolidated",
                    ).length;
                    const progress =
                      subjectTopics.length === 0
                        ? 0
                        : Math.round((ready / subjectTopics.length) * 100);

                    return `${progress}%`;
                  },
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
