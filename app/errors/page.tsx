import { isBefore, startOfToday } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ErrorLogForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteErrorLogAction,
  toggleErrorResolvedAction,
} from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.errorLogs.find((error) => error.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const retestDue = data.errorLogs.filter(
    (error) => !error.resolved && error.retestAt && isBefore(error.retestAt, startOfToday()),
  );

  return (
    <AppShell session={session}>
      <PageHeader title="Errors" description="Errore, causa, correzione, prevenzione, retest." />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <ErrorLogForm error={editing} subjects={data.subjects} topics={data.topics} exams={data.exams} />
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retest due</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {retestDue.length === 0 ? <p className="text-sm text-muted">Nessun retest arretrato.</p> : null}
              {retestDue.slice(0, 6).map((error) => (
                <div key={error.id} className="rounded-md border border-violet/20 bg-violet/5 p-3">
                  <div className="text-sm font-medium text-white">{error.title}</div>
                  <div className="mt-1 text-xs text-muted">{fmtDate(error.retestAt)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Error log</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceTable
                rows={data.errorLogs}
                editBasePath="/errors"
                deleteAction={deleteErrorLogAction}
                extraActions={(error) => (
                  <form action={toggleErrorResolvedAction}>
                    <input type="hidden" name="id" value={error.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Toggle resolved">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </form>
                )}
                columns={[
                  {
                    header: "Errore",
                    render: (error) => (
                      <div>
                        <div className="font-medium text-white">{error.title}</div>
                        <div className="text-xs text-muted">{subjectById.get(error.subjectId)?.name ?? "-"}</div>
                      </div>
                    ),
                  },
                  { header: "Tipo", render: (error) => humanize(error.errorType) },
                  { header: "Severity", render: (error) => <Badge variant={error.severity >= 7 ? "danger" : "muted"}>{error.severity}/10</Badge> },
                  { header: "Retest", render: (error) => fmtDate(error.retestAt) },
                  { header: "Status", render: (error) => <Badge variant={error.resolved ? "success" : "danger"}>{error.resolved ? "resolved" : "open"}</Badge> },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
