import { isBefore, isToday, startOfToday } from "date-fns";
import { RotateCw } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReviewItemForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteReviewItemAction,
  markReviewItemReviewedAction,
} from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.reviewItems.find((item) => item.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const today = startOfToday();
  const activeItems = data.reviewItems.filter((item) => item.isActive);
  const dueToday = activeItems.filter((item) => isToday(item.dueAt));
  const overdue = activeItems.filter((item) => isBefore(item.dueAt, today));

  return (
    <AppShell session={session}>
      <PageHeader title="Reviews" description="Spaced repetition locale con scheduling semplice e spiegabile." />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <ReviewItemForm item={editing} subjects={data.subjects} topics={data.topics} />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Due today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dueToday.length === 0 ? <p className="text-sm text-muted">Nessun item in scadenza oggi.</p> : null}
                {dueToday.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-md border border-white/10 p-3">
                    <div className="text-sm text-white">{item.question}</div>
                    <div className="mt-1 text-xs text-muted">{subjectById.get(item.subjectId)?.name ?? "-"}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Overdue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdue.length === 0 ? <p className="text-sm text-muted">Nessun arretrato.</p> : null}
                {overdue.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-md border border-red-300/20 bg-red-300/5 p-3">
                    <div className="text-sm text-white">{item.question}</div>
                    <div className="mt-1 text-xs text-muted">Due {fmtDate(item.dueAt)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Review items</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceTable
                rows={data.reviewItems}
                editBasePath="/reviews"
                deleteAction={deleteReviewItemAction}
                extraActions={(item) => (
                  <form action={markReviewItemReviewedAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      name="confidence"
                      type="number"
                      min={0}
                      max={10}
                      defaultValue={item.confidence}
                      className="h-8 w-14 rounded-md border border-white/10 bg-black/30 px-2 text-xs text-white"
                    />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Mark reviewed">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </form>
                )}
                columns={[
                  { header: "Domanda", render: (item) => <span className="line-clamp-2 text-white">{item.question}</span> },
                  { header: "Materia", render: (item) => subjectById.get(item.subjectId)?.name ?? "-" },
                  { header: "Tipo", render: (item) => humanize(item.reviewType) },
                  { header: "Due", render: (item) => fmtDate(item.dueAt) },
                  { header: "Confidence", render: (item) => <Badge>{item.confidence}/10</Badge> },
                  { header: "Interval", render: (item) => `${item.intervalDays}d` },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
