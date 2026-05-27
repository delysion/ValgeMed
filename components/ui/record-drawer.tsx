"use client";

import type React from "react";
import { Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fmtDate, humanize } from "@/lib/labels";
import type { Topic, Hypothesis, LiteratureGap, Manuscript, ReviewItem } from "@/lib/db/schema";

type RecordType = "topic" | "review" | "hypothesis" | "literature-gap" | "manuscript";

interface RecordContext {
  subjectName?: string;
  topicTitle?: string;
  examTitle?: string;
  researchAreaName?: string;
  hypothesisQuestion?: string;
}

interface RecordDrawerProps {
  open: boolean;
  onClose: () => void;
  record: Topic | ReviewItem | Hypothesis | LiteratureGap | Manuscript | null;
  type: RecordType;
  editBasePath?: string;
  context?: RecordContext;
}

function typeLabel(type: RecordType) {
  switch (type) {
    case "topic":
      return "Topic";
    case "review":
      return "Review Record";
    case "hypothesis":
      return "Hypothesis";
    case "literature-gap":
      return "Literature Gap";
    case "manuscript":
      return "Manuscript";
  }
}

function MetricTile({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "danger" | "success" | "warning" }) {
  const toneClass =
    tone === "danger" ? "border-rose/25 bg-rose-bg/20 text-rose" :
    tone === "success" ? "border-emerald/25 bg-emerald-bg/20 text-emerald" :
    tone === "warning" ? "border-gold/25 bg-gold-bg/20 text-gold" :
    "border-border/70 bg-bg-elevated/60 text-text-primary";

  return (
    <div className={`min-w-0 rounded-lg border px-3 py-2.5 ${toneClass}`}>
      <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 truncate font-mono text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 rounded-lg border border-border/50 bg-bg-elevated/35 px-3 py-2 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="min-w-0 break-words text-text-primary">{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border/60 bg-bg-surface/70 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function RichText({ children, muted = false }: { children?: string | null; muted?: boolean }) {
  if (!children) {
    return <p className="text-sm text-text-muted">No details recorded yet.</p>;
  }

  return (
    <p className={`whitespace-pre-wrap break-words text-sm leading-6 ${muted ? "text-text-secondary" : "text-text-primary"}`}>
      {children}
    </p>
  );
}

function ContextBar({ context }: { context?: RecordContext }) {
  const items = [
    ["Subject", context?.subjectName],
    ["Topic", context?.topicTitle],
    ["Exam", context?.examTitle],
    ["Research Area", context?.researchAreaName],
    ["Hypothesis", context?.hypothesisQuestion],
  ].filter(([, value]) => value);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, value]) => (
        <span key={label} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border/60 bg-bg-elevated/60 px-2.5 py-1 text-xs text-text-secondary">
          <span className="shrink-0 text-text-muted">{label}</span>
          <span className="min-w-0 truncate text-text-primary">{value}</span>
        </span>
      ))}
    </div>
  );
}

function TopicDetail({ topic, context }: { topic: Topic; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Confidence" value={`${topic.confidence}/10`} tone={topic.confidence <= 3 ? "danger" : "default"} />
        <MetricTile label="Priority" value={`${topic.priority}/10`} tone={topic.priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Difficulty" value={`${topic.difficulty}/10`} />
      </div>
      <DetailSection title="Status">
        <div className="space-y-2">
          <MetaRow label="Current stage" value={humanize(topic.status)} />
          <MetaRow label="Next review" value={fmtDate(topic.nextReviewAt)} />
          <MetaRow label="Last studied" value={fmtDate(topic.lastStudiedAt)} />
        </div>
      </DetailSection>
      <DetailSection title="Description">
        <RichText muted>{topic.description}</RichText>
      </DetailSection>
    </div>
  );
}

function ReviewDetail({ item, context }: { item: ReviewItem; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricTile label="Confidence" value={`${item.confidence}/10`} tone={item.confidence <= 3 ? "danger" : "default"} />
        <MetricTile label="Interval" value={`${item.intervalDays}d`} />
        <MetricTile label="Reviewed" value={item.timesReviewed} />
        <MetricTile label="Active" value={item.isActive ? "Yes" : "No"} tone={item.isActive ? "success" : "default"} />
      </div>
      <DetailSection title="Question">
        <RichText>{item.question}</RichText>
      </DetailSection>
      <DetailSection title="Answer">
        <RichText muted>{item.answer}</RichText>
      </DetailSection>
      <DetailSection title="Schedule">
        <div className="space-y-2">
          <MetaRow label="Type" value={humanize(item.reviewType)} />
          <MetaRow label="Due" value={fmtDate(item.dueAt)} />
          <MetaRow label="Last reviewed" value={fmtDate(item.lastReviewedAt)} />
        </div>
      </DetailSection>
    </div>
  );
}

function HypothesisDetail({ hypothesis }: { hypothesis: Hypothesis }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Status" value={humanize(hypothesis.status ?? "draft")} />
        <MetricTile label="Paper Potential" value={hypothesis.totalScore !== null ? `${hypothesis.totalScore}/10` : "-"} tone={(hypothesis.totalScore ?? 0) >= 7 ? "success" : "default"} />
        <MetricTile label="Output" value={hypothesis.output ?? "-"} />
      </div>
      <DetailSection title="Research Question">
        <RichText>{hypothesis.question}</RichText>
      </DetailSection>
      <DetailSection title="Notes">
        <RichText muted>{hypothesis.notes}</RichText>
      </DetailSection>
    </div>
  );
}

function LiteratureGapDetail({ gap, context }: { gap: LiteratureGap; context?: RecordContext }) {
  const priority = gap.priority ?? 0;

  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Priority" value={`${priority}/10`} tone={priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Status" value={humanize(gap.status)} />
        <MetricTile label="Publishable" value={gap.publishableForStudent ? "Yes" : "No"} tone={gap.publishableForStudent ? "success" : "default"} />
      </div>
      <DetailSection title="Gap Description">
        <RichText muted>{gap.description}</RichText>
      </DetailSection>
    </div>
  );
}

function ManuscriptDetail({ manuscript, context }: { manuscript: Manuscript; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Stage" value={humanize(manuscript.stage)} />
        <MetricTile label="Deadline" value={fmtDate(manuscript.deadline)} tone={manuscript.deadline ? "warning" : "default"} />
        <MetricTile label="Journal" value={manuscript.journal ?? "-"} />
      </div>
      <DetailSection title="Production Notes">
        <RichText muted>{manuscript.notes}</RichText>
      </DetailSection>
    </div>
  );
}

export function RecordDrawer({ open, onClose, record, type, editBasePath, context }: RecordDrawerProps) {
  if (!record) return null;

  const title = "title" in record ? record.title : "question" in record ? record.question : "Record";
  const editParam =
    type === "hypothesis" ? "editHypothesis" :
    type === "literature-gap" ? "editGap" :
    type === "manuscript" ? "editManuscript" :
    "edit";
  const editHref = editBasePath ? `${editBasePath}?${editParam}=${record.id}` : "#";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-[min(96vw,680px)] max-w-none flex-col gap-0 overflow-hidden overscroll-contain bg-bg-page p-0">
        <SheetHeader className="border-b border-border bg-gradient-to-br from-bg-surface via-bg-surface to-bg-elevated px-5 py-5 pr-14 sm:px-6">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="outline">{typeLabel(type)}</Badge>
              <SheetTitle className="mt-3 text-balance text-xl leading-7 sm:text-2xl">
                {title}
              </SheetTitle>
            </div>
            {editBasePath && (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <a href={editHref}>
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit
                </a>
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {type === "topic" && <TopicDetail topic={record as Topic} context={context} />}
          {type === "review" && <ReviewDetail item={record as ReviewItem} context={context} />}
          {type === "hypothesis" && <HypothesisDetail hypothesis={record as Hypothesis} />}
          {type === "literature-gap" && <LiteratureGapDetail gap={record as LiteratureGap} context={context} />}
          {type === "manuscript" && <ManuscriptDetail manuscript={record as Manuscript} context={context} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
