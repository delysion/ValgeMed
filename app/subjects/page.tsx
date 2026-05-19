import Link from "next/link";

import { AppShell, PageHeader } from "@/components/app-shell";
import { SubjectForm } from "@/components/forms/entity-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceTable } from "@/components/tables/resource-table";
import { deleteSubjectAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.subjects.find((subject) => subject.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader
        title="Subjects"
        description="Materie, peso strategico, difficolta percepita e progressione."
      />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <SubjectForm subject={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Materie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.subjects}
              editBasePath="/subjects"
              deleteAction={deleteSubjectAction}
              columns={[
                {
                  header: "Materia",
                  render: (subject) => (
                    <div>
                      <Link href={`/subjects/${subject.id}`} className="font-medium text-white hover:text-ice">
                        {subject.name}
                      </Link>
                      <div className="text-xs text-muted">{subject.code ?? "no code"}</div>
                    </div>
                  ),
                },
                {
                  header: "Difficulty",
                  render: (subject) => <Badge variant="muted">{subject.difficulty}/10</Badge>,
                },
                {
                  header: "Importance",
                  render: (subject) => <Badge>{subject.importance}/10</Badge>,
                },
                {
                  header: "Progress",
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
