"use client";

import { useState } from "react";
import { Edit3, Eye, AlertTriangle, CheckCircle2, Clock, Zap, Target, ShieldCheck, Sparkles, Activity } from "lucide-react";

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

function GlowOrb({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn("absolute -inset-20 rounded-full blur-[80px] opacity-15 pointer-events-none", className)}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  );
}

function AnimatedProgress({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", tone)}
        style={{ width: `${value * 10}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}

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
        {notes.map((note) => {
          const isHighPriority = note.priority >= 7;
          const isDone = note.status === "done";
          const glowColor = isDone ? "#58C8A0" : isHighPriority ? "#E0A848" : "#98A8E8";

          return (
            <article
              key={note.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighPriority && "border-l-[3px] border-l-gold",
                isDone && "opacity-70"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(note)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{note.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{humanize(note.category)}</Badge>
                  <Badge variant={isDone ? "success" : "muted"} size="sm">{humanize(note.status)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-text-secondary">{note.priority}/10</span>
                  {isHighPriority && !isDone && (
                    <span className="flex items-center gap-1 text-[10px] text-gold">
                      <AlertTriangle className="h-3 w-3" />
                      High
                    </span>
                  )}
                </div>
              </button>

              <div className="relative mt-4 flex items-center justify-end gap-2 border-t border-border/50 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary"
                  onClick={() => setSelected(note)}
                  aria-label={labels.open}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary"
                >
                  <a href={`${editBasePath}?edit=${note.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton
                  action={deleteAction}
                  id={note.id}
                  label={labels.delete}
                  className="rounded-lg"
                />
              </div>
            </article>
          );
        })}
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
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => {
          const isOverdelivered = block.actualMinutes >= block.plannedMinutes;
          const isHighLeverage = block.leverageScore >= 7;
          const isHighEnergy = block.energyCost >= 7;
          const glowColor = isOverdelivered ? "#58C8A0" : isHighLeverage ? "#E0A848" : "#98A8E8";

          return (
            <article
              key={block.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighLeverage && "border-l-[3px] border-l-gold",
                isHighEnergy && "border-l-[3px] border-l-rose"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(block)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{block.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{fmtDate(block.date)}</Badge>
                  <Badge variant="muted" size="sm">{humanize(block.blockType)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={cn("text-xs font-medium", isOverdelivered ? "text-emerald" : "text-text-secondary")}>
                    {block.actualMinutes}/{block.plannedMinutes}m
                  </span>
                  <Badge variant={isHighLeverage ? "gold" : "default"} size="sm">{block.leverageScore}/10</Badge>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-2 border-t border-border px-4 pb-4 pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(block)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${block.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={block.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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
        {logs.map((log) => {
          const isGoodRecovery = (log.recoveryQuality ?? 0) >= 6;
          const isHighFatigue = (log.cognitiveFatigue ?? 0) >= 7;
          const isGoodEnergy = (log.energyIntegrityScore ?? 0) >= 6;
          const glowColor = isGoodEnergy ? "#58C8A0" : isHighFatigue ? "#E07888" : "#98A8E8";

          return (
            <article
              key={log.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighFatigue && "border-l-[3px] border-l-rose",
                isGoodEnergy && "border-l-[3px] border-l-emerald"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(log)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{fmtDate(log.date)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">Sleep: {log.sleepQuality ?? "-"}</Badge>
                  <Badge variant={isHighFatigue ? "danger" : "muted"} size="sm">Fatigue: {log.cognitiveFatigue ?? "-"}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={isGoodRecovery ? "success" : "muted"} size="sm">Recovery: {log.recoveryQuality ?? "-"}</Badge>
                  <Badge variant={isGoodEnergy ? "success" : "danger"} size="sm">Energy: {(log.energyIntegrityScore ?? 0).toFixed(1)}</Badge>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(log)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${log.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={log.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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
        {items.map((item) => {
          const isGoodConfidence = item.confidence >= 6;
          const glowColor = isGoodConfidence ? "#58C8A0" : "#98A8E8";

          return (
            <article
              key={item.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isGoodConfidence && "border-l-[3px] border-l-emerald"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(item)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{humanize(item.language)}</Badge>
                  <Badge variant="muted" size="sm">{item.minutes}m</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={isGoodConfidence ? "success" : "muted"} size="sm">{item.confidence}/10</Badge>
                  <span className="text-xs text-text-secondary">{fmtDate(item.nextPracticeAt)}</span>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(item)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={item.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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
        {events.map((event) => {
          const isHighImpact = event.impact >= 7;
          const isDone = event.status === "done";
          const glowColor = isHighImpact ? "#E0A848" : isDone ? "#58C8A0" : "#98A8E8";

          return (
            <article
              key={event.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighImpact && "border-l-[3px] border-l-gold",
                isDone && "opacity-70"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(event)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{event.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{humanize(event.eventType)}</Badge>
                  <Badge variant="muted" size="sm">{fmtDate(event.eventDate)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={isHighImpact ? "gold" : "default"} size="sm">{event.impact}/10</Badge>
                  <Badge variant={isDone ? "success" : "default"} size="sm">{humanize(event.status)}</Badge>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(event)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${event.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={event.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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
        {opportunities.map((op) => {
          const isHighUpside = op.strategicUpside >= 7;
          const isWon = op.status === "won";
          const isApplied = op.status === "applied";
          const glowColor = isWon ? "#58C8A0" : isHighUpside ? "#E0A848" : isApplied ? "#98A8E8" : "#58C8A0";

          return (
            <article
              key={op.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighUpside && "border-l-[3px] border-l-gold",
                isWon && "border-l-[3px] border-l-emerald"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(op)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{op.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{humanize(op.opportunityType)}</Badge>
                  <Badge variant="muted" size="sm">{fmtDate(op.deadline)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={isHighUpside ? "gold" : "default"} size="sm">{op.strategicUpside}/10</Badge>
                  <Badge variant={isWon ? "success" : isApplied ? "warning" : "default"} size="sm">{humanize(op.status)}</Badge>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(op)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${op.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={op.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isHighPriority = item.priority >= 7;
          const isDone = item.status === "done";
          const isOverdue = item.dueAt && item.dueAt < new Date() && !isDone;
          const glowColor = isOverdue ? "#E07888" : isHighPriority ? "#E0A848" : isDone ? "#58C8A0" : "#98A8E8";

          return (
            <article
              key={item.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isOverdue && "border-l-[3px] border-l-rose",
                isHighPriority && !isOverdue && "border-l-[3px] border-l-gold",
                isDone && "opacity-70"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative flex flex-1 flex-col p-5 text-left"
                onClick={() => setSelected(item)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-base font-semibold text-text-primary">{item.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="muted" size="sm">{humanize(item.category)}</Badge>
                  <Badge variant={isDone ? "success" : "muted"} size="sm">{humanize(item.status)}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={cn("text-xs font-medium", isOverdue ? "text-rose" : "text-text-secondary")}>
                    {fmtDate(item.dueAt)}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">{item.priority}/10</span>
                </div>
                {isOverdue && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-bg/20 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-rose" />
                    <span className="text-xs font-medium text-rose">Overdue</span>
                  </div>
                )}
              </button>

              <div className="relative mt-4 flex items-center justify-end gap-2 border-t border-border/50 px-5 pb-5 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary"
                  onClick={() => setSelected(item)}
                  aria-label={labels.open}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary"
                >
                  <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton
                  action={deleteAction}
                  id={item.id}
                  label={labels.delete}
                  className="rounded-lg"
                />
              </div>
            </article>
          );
        })}
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
        {items.map((item) => {
          const isHighValue = item.strategicValue >= 7;
          const isActive = item.status === "active";
          const glowColor = isHighValue ? "#E0A848" : isActive ? "#58C8A0" : "#98A8E8";

          return (
            <article
              key={item.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                isHighValue && "border-l-[3px] border-l-gold",
                isActive && "border-l-[3px] border-l-emerald"
              )}
            >
              <GlowOrb color={glowColor} />

              <button
                type="button"
                className="relative block w-full text-left"
                onClick={() => setSelected(item)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" size="sm">{humanize(item.itemType)}</Badge>
                  <Badge variant="muted" size="sm">{fmtDate(item.date)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={isHighValue ? "gold" : "default"} size="sm">{item.strategicValue}/10</Badge>
                  <Badge variant={isActive ? "success" : "default"} size="sm">{humanize(item.status)}</Badge>
                </div>
              </button>

              <div className="relative mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelected(item)} aria-label={labels.open}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <a href={`${editBasePath}?edit=${item.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={item.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
      </div>

      <RecordDrawer open={selected !== null} onClose={() => setSelected(null)} record={selected} type="portfolio-item" editBasePath={editBasePath} />
    </>
  );
}