import { AppShell, PageHeader } from "@/components/app-shell";
import { TopicForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTopicAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string; status?: string; priority?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.topics.find((topic) => topic.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const filteredTopics = data.topics.filter((topic) => {
    if (params.subject && topic.subjectId !== params.subject) return false;
    if (params.status && topic.status !== params.status) return false;
    if (params.priority && topic.priority < Number(params.priority)) return false;
    return true;
  });

  return (
    <AppShell session={session}>
      <PageHeader title="Topics" description="Active recall, confidence e prossima review per ogni blocco." />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <TopicForm topic={editing} subjects={data.subjects} exams={data.exams} />
        <Card>
          <CardHeader>
            <CardTitle>Topic table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="grid gap-2 md:grid-cols-4">
              <select name="subject" defaultValue={params.subject ?? ""} className="h-9 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white">
                <option value="">Tutte le materie</option>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id} className="bg-[#11151c]">{subject.name}</option>
                ))}
              </select>
              <select name="status" defaultValue={params.status ?? ""} className="h-9 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white">
                <option value="">Tutti gli status</option>
                {["not_started", "first_exposure", "understood", "recalled", "practiced", "error_corrected", "consolidated", "exam_ready"].map((status) => (
                  <option key={status} value={status} className="bg-[#11151c]">{humanize(status)}</option>
                ))}
              </select>
              <input name="priority" type="number" min={0} max={10} defaultValue={params.priority ?? ""} placeholder="Min priority" className="h-9 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white" />
              <Button type="submit" variant="outline">Filtra</Button>
            </form>
            <ResourceTable
              rows={filteredTopics}
              editBasePath="/topics"
              deleteAction={deleteTopicAction}
              columns={[
                {
                  header: "Topic",
                  render: (topic) => (
                    <div>
                      <div className="font-medium text-white">{topic.title}</div>
                      <div className="text-xs text-muted">{subjectById.get(topic.subjectId)?.name ?? "-"}</div>
                    </div>
                  ),
                },
                { header: "Status", render: (topic) => humanize(topic.status) },
                { header: "Priority", render: (topic) => <Badge>{topic.priority}/10</Badge> },
                { header: "Confidence", render: (topic) => <Badge variant={topic.confidence <= 3 ? "danger" : "muted"}>{topic.confidence}/10</Badge> },
                { header: "Next review", render: (topic) => fmtDate(topic.nextReviewAt) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
