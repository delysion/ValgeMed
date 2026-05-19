import { format, isToday, isTomorrow } from "date-fns";
import { BookOpen, Clock, RotateCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ReviewItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function RevisionQueue({ items }: { items: ReviewItem[] }) {
  const active = items.filter((item) => item.isActive);
  const due = active.filter((item) => item.dueAt <= new Date());
  const overdue = due.filter((item) => item.dueAt < new Date() && !isToday(item.dueAt));
  const today = due.filter((item) => isToday(item.dueAt));
  const upcoming = active.filter((item) => item.dueAt > new Date()).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()).slice(0, 5);

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center">
        <BookOpen className="mx-auto h-6 w-6 text-text-muted" />
        <p className="mt-3 text-sm text-text-secondary">No review items yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose">
            <Clock className="h-3.5 w-3.5" />
            Overdue ({overdue.length})
          </h4>
          <div className="space-y-1.5">
            {overdue.map((item) => (
              <ReviewRow key={item.id} item={item} overdue />
            ))}
          </div>
        </div>
      )}

      {today.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan">
            <BookOpen className="h-3.5 w-3.5" />
            Due today ({today.length})
          </h4>
          <div className="space-y-1.5">
            {today.map((item) => (
              <ReviewRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Upcoming</h4>
          <div className="space-y-1.5">
            {upcoming.map((item) => (
              <ReviewRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ item, overdue = false }: { item: ReviewItem; overdue?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border p-3 transition hover:shadow-sm",
      overdue ? "border-rose/20 bg-rose-bg" : "border-border bg-white",
    )}>
      <RotateCw className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-primary">{item.question ?? "Review item"}</p>
        <p className="text-[11px] text-text-muted">{item.reviewType.replace("_", " ")} · reviewed {item.timesReviewed ?? 0}x</p>
      </div>
      <Badge variant={overdue ? "danger" : isToday(item.dueAt) ? "default" : isTomorrow(item.dueAt) ? "warning" : "muted"} className="shrink-0 text-[10px]">
        {format(item.dueAt, "d MMM")}
      </Badge>
    </div>
  );
}
