"use client";

import { useState } from "react";
import { Edit3, Eye } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  TartuNote,
  TimeBlock,
  HealthLog,
  LanguageProgress,
  ReputationEvent,
  Opportunity,
  LifeAdminItem,
  PortfolioItem,
} from "@/lib/db/schema";
import { fmtDate, humanize } from "@/lib/labels";
import { cn } from "@/lib/utils";

type TartuNoteListProps = {
  notes: TartuNote[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function TartuNoteList({ notes, editBasePath, deleteAction, labels }: TartuNoteListProps) {
  const [selected, setSelected] = useState<TartuNote | null>(null);

  if (notes.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <article
            key={note.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(note)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{note.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(note.category)}</Badge>
                <Badge variant={note.status === "done" ? "success" : "muted"} className="text-[10px]">{humanize(note.status)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">{note.priority}/10</span>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(note)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${note.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={note.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="tartu-note" editBasePath={editBasePath} />
    </>
  );
}

type TimeBlockListProps = {
  blocks: TimeBlock[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function TimeBlockList({ blocks, editBasePath, deleteAction, labels }: TimeBlockListProps) {
  const [selected, setSelected] = useState<TimeBlock | null>(null);

  if (blocks.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <article
            key={block.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(block)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{block.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{fmtDate(block.date)}</Badge>
                <Badge variant="muted" className="text-[10px]">{humanize(block.blockType)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">{block.actualMinutes}/{block.plannedMinutes}m</span>
                <Badge>{block.leverageScore}/10</Badge>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(block)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${block.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={block.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="time-block" editBasePath={editBasePath} />
    </>
  );
}

type HealthLogListProps = {
  logs: HealthLog[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function HealthLogList({ logs, editBasePath, deleteAction, labels }: HealthLogListProps) {
  const [selected, setSelected] = useState<HealthLog | null>(null);

  if (logs.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {logs.map((log) => (
          <article
            key={log.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(log)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{fmtDate(log.date)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">Sleep: {log.sleepQuality ?? "-"}</Badge>
                <Badge variant={(log.cognitiveFatigue ?? 0) >= 7 ? "danger" : "muted"} className="text-[10px]">Fatigue: {log.cognitiveFatigue ?? "-"}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant={(log.recoveryQuality ?? 0) >= 6 ? "success" : "muted"} className="text-[10px]">Recovery: {log.recoveryQuality ?? "-"}</Badge>
                <Badge variant={(log.energyIntegrityScore ?? 0) >= 6 ? "success" : "danger"} className="text-[10px]">Energy: {(log.energyIntegrityScore ?? 0).toFixed(1)}</Badge>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(log)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${log.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={log.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="health-log" editBasePath={editBasePath} />
    </>
  );
}

type LanguageProgressListProps = {
  items: LanguageProgress[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function LanguageProgressList({ items, editBasePath, deleteAction, labels }: LanguageProgressListProps) {
  const [selected, setSelected] = useState<LanguageProgress | null>(null);

  if (items.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(item)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(item.language)}</Badge>
                <Badge variant="muted" className="text-[10px]">{item.minutes}m</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant={item.confidence >= 6 ? "success" : "muted"}>{item.confidence}/10</Badge>
                <span className="text-xs text-text-secondary">{fmtDate(item.nextPracticeAt)}</span>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(item)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={item.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="language-progress" editBasePath={editBasePath} />
    </>
  );
}

type ReputationEventListProps = {
  events: ReputationEvent[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function ReputationEventList({ events, editBasePath, deleteAction, labels }: ReputationEventListProps) {
  const [selected, setSelected] = useState<ReputationEvent | null>(null);

  if (events.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(event)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{event.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(event.eventType)}</Badge>
                <Badge variant="muted" className="text-[10px]">{fmtDate(event.eventDate)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant={event.impact >= 7 ? "success" : "default"}>{event.impact}/10</Badge>
                <Badge variant="default">{humanize(event.status)}</Badge>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(event)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${event.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={event.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="reputation-event" editBasePath={editBasePath} />
    </>
  );
}

type OpportunityListProps = {
  opportunities: Opportunity[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function OpportunityList({ opportunities, editBasePath, deleteAction, labels }: OpportunityListProps) {
  const [selected, setSelected] = useState<Opportunity | null>(null);

  if (opportunities.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((op) => (
          <article
            key={op.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(op)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{op.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(op.opportunityType)}</Badge>
                <Badge variant="muted" className="text-[10px]">{fmtDate(op.deadline)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant={op.strategicUpside >= 7 ? "success" : "default"}>{op.strategicUpside}/10</Badge>
                <Badge variant="default">{humanize(op.status)}</Badge>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(op)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${op.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={op.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="opportunity" editBasePath={editBasePath} />
    </>
  );
}

type LifeAdminItemListProps = {
  items: LifeAdminItem[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function LifeAdminItemList({ items, editBasePath, deleteAction, labels }: LifeAdminItemListProps) {
  const [selected, setSelected] = useState<LifeAdminItem | null>(null);

  if (items.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(item)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(item.category)}</Badge>
                <Badge variant={item.status === "done" ? "success" : "muted"} className="text-[10px]">{humanize(item.status)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">{fmtDate(item.dueAt)}</span>
                <span className="text-xs text-text-secondary">{item.priority}/10</span>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(item)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={item.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="life-admin" editBasePath={editBasePath} />
    </>
  );
}

type PortfolioItemListProps = {
  items: PortfolioItem[];
  editBasePath: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    emptyTitle: string;
    emptyBody: string;
    open: string;
    edit: string;
    delete: string;
  };
};

export function PortfolioItemList({ items, editBasePath, deleteAction, labels }: PortfolioItemListProps) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  if (items.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className={cn(
              "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setSelected(item)}
              aria-label={labels.open}
            >
              <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">{humanize(item.itemType)}</Badge>
                <Badge variant="muted" className="text-[10px]">{fmtDate(item.date)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant={item.strategicValue >= 7 ? "success" : "default"}>{item.strategicValue}/10</Badge>
                <Badge variant="default">{humanize(item.status)}</Badge>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(item)} aria-label={labels.open}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                  <Edit3 className="h-4 w-4" />
                </a>
              </Button>
              <DeleteButton action={deleteAction} id={item.id} label={labels.delete} />
            </div>
          </article>
        ))}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="portfolio-item" editBasePath={editBasePath} />
    </>
  );
}
