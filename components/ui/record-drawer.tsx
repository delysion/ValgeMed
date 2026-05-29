"use client";

import type React from "react";
import { Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fmtDate, humanize } from "@/lib/labels";
import type { Topic, Hypothesis, LiteratureGap, Manuscript, ReviewItem, ProfessionalContact, TartuNote, TimeBlock, HealthLog, LanguageProgress, ReputationEvent, Opportunity, LifeAdminItem, PortfolioItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type RecordType = "topic" | "review" | "hypothesis" | "literature-gap" | "manuscript" | "contact" | "tartu-note" | "time-block" | "health-log" | "language-progress" | "reputation-event" | "opportunity" | "life-admin" | "portfolio-item";

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
  record: Topic | ReviewItem | Hypothesis | LiteratureGap | Manuscript | ProfessionalContact | TartuNote | TimeBlock | HealthLog | LanguageProgress | ReputationEvent | Opportunity | LifeAdminItem | PortfolioItem | null;
  type: RecordType;
  editBasePath?: string;
  context?: RecordContext;
}

function typeLabel(type: RecordType) {
  switch (type) {
    case "topic": return "Topic";
    case "review": return "Review Record";
    case "hypothesis": return "Hypothesis";
    case "literature-gap": return "Literature Gap";
    case "manuscript": return "Manuscript";
    case "contact": return "Network Contact";
    case "tartu-note": return "Tartu Note";
    case "time-block": return "Time Block";
    case "health-log": return "Health Log";
    case "language-progress": return "Language Progress";
    case "reputation-event": return "Reputation Event";
    case "opportunity": return "Opportunity";
    case "life-admin": return "Life Admin Item";
    case "portfolio-item": return "Portfolio Item";
  }
}

function MetricTile({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "danger" | "success" | "warning" }) {
  const toneClass =
    tone === "danger" ? "border-rose/30 bg-rose-bg/30 text-rose" :
    tone === "success" ? "border-emerald/30 bg-emerald-bg/30 text-emerald" :
    tone === "warning" ? "border-gold/30 bg-gold-bg/30 text-gold" :
    "border-border/50 bg-bg-elevated/40 text-text-primary";

  return (
    <div className={cn("min-w-0 rounded-lg border px-3 py-2", toneClass)}>
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 truncate font-mono text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">{title}</span>
      <div className="flex-1 border-t border-border/40" />
    </div>
  );
}

function RichText({ children, muted = false }: { children?: string | null; muted?: boolean }) {
  if (!children) {
    return <p className="text-sm text-text-muted">No details recorded yet.</p>;
  }

  return (
    <p className={cn("whitespace-pre-wrap break-words text-sm leading-6", muted ? "text-text-secondary" : "text-text-primary")}>
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
        <span key={label} className="inline-flex max-w-full items-center gap-2 rounded-md border border-border/50 bg-bg-elevated/60 px-2.5 py-1 text-[11px]">
          <span className="shrink-0 text-text-muted">{label}</span>
          <span className="min-w-0 truncate font-medium text-text-primary">{value}</span>
        </span>
      ))}
    </div>
  );
}

function TopicDetail({ topic, context }: { topic: Topic; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Confidence" value={`${topic.confidence}/10`} tone={topic.confidence <= 3 ? "danger" : "default"} />
        <MetricTile label="Priority" value={`${topic.priority}/10`} tone={topic.priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Difficulty" value={`${topic.difficulty}/10`} />
        <MetricTile label="Status" value={humanize(topic.status)} />
      </div>

      <SectionDivider title="Schedule" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Next review</span>
          <span className="font-medium text-text-primary">{fmtDate(topic.nextReviewAt)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Last studied</span>
          <span className="font-medium text-text-primary">{fmtDate(topic.lastStudiedAt)}</span>
        </div>
      </div>

      {topic.description && (
        <>
          <SectionDivider title="Description" />
          <RichText muted>{topic.description}</RichText>
        </>
      )}
    </div>
  );
}

function ReviewDetail({ item, context }: { item: ReviewItem; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Confidence" value={`${item.confidence}/10`} tone={item.confidence <= 3 ? "danger" : "default"} />
        <MetricTile label="Interval" value={`${item.intervalDays}d`} />
        <MetricTile label="Reviewed" value={item.timesReviewed} />
        <MetricTile label="Active" value={item.isActive ? "Yes" : "No"} tone={item.isActive ? "success" : "default"} />
      </div>

      <SectionDivider title="Question" />
      <RichText>{item.question}</RichText>

      <SectionDivider title="Answer" />
      <RichText muted>{item.answer}</RichText>

      <SectionDivider title="Schedule" />
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Type</span>
          <span className="font-medium text-text-primary">{humanize(item.reviewType)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Due</span>
          <span className="font-medium text-text-primary">{fmtDate(item.dueAt)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Last review</span>
          <span className="font-medium text-text-primary">{fmtDate(item.lastReviewedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function HypothesisDetail({ hypothesis }: { hypothesis: Hypothesis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Status" value={humanize(hypothesis.status ?? "draft")} />
        <MetricTile label="Paper Potential" value={hypothesis.totalScore !== null ? `${hypothesis.totalScore}/10` : "-"} tone={(hypothesis.totalScore ?? 0) >= 7 ? "success" : "default"} />
        <MetricTile label="Output" value={hypothesis.output ?? "-"} />
      </div>

      <SectionDivider title="Research Question" />
      <RichText>{hypothesis.question}</RichText>

      <SectionDivider title="Notes" />
      <RichText muted>{hypothesis.notes}</RichText>
    </div>
  );
}

function LiteratureGapDetail({ gap, context }: { gap: LiteratureGap; context?: RecordContext }) {
  const priority = gap.priority ?? 0;

  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Priority" value={`${priority}/10`} tone={priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Status" value={humanize(gap.status)} />
        <MetricTile label="Publishable" value={gap.publishableForStudent ? "Yes" : "No"} tone={gap.publishableForStudent ? "success" : "default"} />
      </div>

      <SectionDivider title="Gap Description" />
      <RichText muted>{gap.description}</RichText>
    </div>
  );
}

function ManuscriptDetail({ manuscript, context }: { manuscript: Manuscript; context?: RecordContext }) {
  return (
    <div className="space-y-4">
      <ContextBar context={context} />
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Stage" value={humanize(manuscript.stage)} />
        <MetricTile label="Deadline" value={fmtDate(manuscript.deadline)} tone={manuscript.deadline ? "warning" : "default"} />
        <MetricTile label="Journal" value={manuscript.journal ?? "-"} />
      </div>

      <SectionDivider title="Production Notes" />
      <RichText muted>{manuscript.notes}</RichText>
    </div>
  );
}

function ContactDetail({ contact }: { contact: ProfessionalContact }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Relationship" value={`${contact.relationshipStrength}/10`} tone={contact.relationshipStrength >= 7 ? "success" : "default"} />
        <MetricTile label="Last contact" value={fmtDate(contact.lastContactedAt)} />
        <MetricTile label="Follow-up" value={fmtDate(contact.nextFollowUpAt)} tone={contact.nextFollowUpAt ? "warning" : "default"} />
      </div>

      <SectionDivider title="Professional Context" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Role</span>
          <span className="font-medium text-text-primary">{contact.role}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Institution</span>
          <span className="font-medium text-text-primary">{contact.institution}</span>
        </div>
      </div>

      <SectionDivider title="Notes" />
      <RichText muted>{contact.notes}</RichText>
    </div>
  );
}

function TartuNoteDetail({ note }: { note: TartuNote }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Priority" value={`${note.priority}/10`} tone={note.priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Status" value={humanize(note.status)} tone={note.status === "done" ? "success" : "default"} />
        <MetricTile label="Category" value={humanize(note.category)} />
      </div>

      <SectionDivider title="Content" />
      <RichText>{note.content}</RichText>
    </div>
  );
}

function TimeBlockDetail({ block }: { block: TimeBlock }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Date" value={fmtDate(block.date)} />
        <MetricTile label="Type" value={humanize(block.blockType)} />
        <MetricTile label="Minutes" value={`${block.actualMinutes}/${block.plannedMinutes}`} tone={block.actualMinutes >= block.plannedMinutes ? "success" : "warning"} />
        <MetricTile label="Leverage" value={`${block.leverageScore}/10`} tone={block.leverageScore >= 7 ? "success" : "default"} />
      </div>

      <SectionDivider title="Details" />
      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Energy cost" value={`${block.energyCost}/10`} tone={block.energyCost >= 7 ? "danger" : "default"} />
      </div>

      <SectionDivider title="Notes" />
      <RichText muted>{block.notes}</RichText>
    </div>
  );
}

function HealthLogDetail({ log }: { log: HealthLog }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Date" value={fmtDate(log.date)} />
        <MetricTile label="Sleep" value={`${log.sleepQuality ?? "-"}/10`} tone={(log.sleepQuality ?? 0) >= 6 ? "success" : "default"} />
        <MetricTile label="Fatigue" value={`${log.cognitiveFatigue ?? "-"}/10`} tone={(log.cognitiveFatigue ?? 0) >= 7 ? "danger" : "default"} />
        <MetricTile label="Recovery" value={`${log.recoveryQuality ?? "-"}/10`} tone={(log.recoveryQuality ?? 0) >= 6 ? "success" : "default"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Food quality" value={`${log.foodQuality ?? "-"}/10`} />
        <MetricTile label="Movement" value={log.movementDone ? "Yes" : "No"} tone={log.movementDone ? "success" : "default"} />
      </div>

      <MetricTile label="Energy integrity" value={`${(log.energyIntegrityScore ?? 0).toFixed(1)}/10`} tone={(log.energyIntegrityScore ?? 0) >= 6 ? "success" : "danger"} />

      <SectionDivider title="Notes" />
      <RichText muted>{log.notes}</RichText>
    </div>
  );
}

function LanguageProgressDetail({ item }: { item: LanguageProgress }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Language" value={humanize(item.language)} />
        <MetricTile label="Confidence" value={`${item.confidence}/10`} tone={item.confidence >= 6 ? "success" : "default"} />
        <MetricTile label="Minutes" value={`${item.minutes}m`} />
        <MetricTile label="Category" value={item.category ?? "-"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Last practiced" value={fmtDate(item.lastPracticedAt)} />
        <MetricTile label="Next practice" value={fmtDate(item.nextPracticeAt)} tone={item.nextPracticeAt ? "warning" : "default"} />
      </div>

      <SectionDivider title="Notes" />
      <RichText muted>{item.notes}</RichText>
    </div>
  );
}

function ReputationEventDetail({ event }: { event: ReputationEvent }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Impact" value={`${event.impact}/10`} tone={event.impact >= 7 ? "success" : "default"} />
        <MetricTile label="Type" value={humanize(event.eventType)} />
        <MetricTile label="Status" value={humanize(event.status)} tone={event.status === "done" ? "success" : "default"} />
        <MetricTile label="Date" value={fmtDate(event.eventDate)} />
      </div>

      <SectionDivider title="Description" />
      <RichText>{event.description}</RichText>

      <SectionDivider title="Follow-up" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Follow-up date</span>
          <span className="font-medium text-text-primary">{fmtDate(event.followUpAt)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Evidence</span>
          <span className="font-medium text-text-primary truncate">{event.evidenceUrl ?? "-"}</span>
        </div>
      </div>
    </div>
  );
}

function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const effort = opportunity.effortScore ?? 0;
  const upside = opportunity.strategicUpside ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricTile label="Status" value={humanize(opportunity.status)} tone={opportunity.status === "won" ? "success" : opportunity.status === "applied" ? "warning" : "default"} />
        <MetricTile label="Value" value={`${opportunity.valueScore}/10`} tone={opportunity.valueScore >= 7 ? "success" : "default"} />
        <MetricTile label="Upside" value={`${upside}/10`} tone={upside >= 7 ? "success" : "default"} />
        <MetricTile label="Effort" value={`${effort}/10`} tone={effort >= 7 ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Type" value={humanize(opportunity.opportunityType)} />
        <MetricTile label="Deadline" value={fmtDate(opportunity.deadline)} tone={opportunity.deadline ? "warning" : "default"} />
      </div>

      <SectionDivider title="Description" />
      <RichText>{opportunity.description}</RichText>

      <SectionDivider title="Next action" />
      <RichText muted>{opportunity.nextAction}</RichText>
    </div>
  );
}

function LifeAdminItemDetail({ item }: { item: LifeAdminItem }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Priority" value={`${item.priority}/10`} tone={item.priority >= 7 ? "warning" : "default"} />
        <MetricTile label="Status" value={humanize(item.status)} tone={item.status === "done" ? "success" : "default"} />
        <MetricTile label="Category" value={humanize(item.category)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-bg-elevated/40 px-3 py-2 text-sm">
          <span className="text-text-muted">Due</span>
          <span className={cn("font-medium", item.dueAt && item.dueAt < new Date() && item.status !== "done" ? "text-rose" : "text-text-primary")}>
            {fmtDate(item.dueAt)}
          </span>
        </div>
      </div>

      <SectionDivider title="Description" />
      <RichText>{item.description}</RichText>

      {item.fileUrl && item.fileName && (
        <>
          <SectionDivider title="File" />
          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan hover:underline">
            {item.fileName}
          </a>
        </>
      )}
    </div>
  );
}

function PortfolioItemDetail({ item }: { item: PortfolioItem }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Type" value={humanize(item.itemType)} />
        <MetricTile label="Strategic value" value={`${item.strategicValue}/10`} tone={item.strategicValue >= 7 ? "success" : "default"} />
        <MetricTile label="Status" value={humanize(item.status)} tone={item.status === "active" ? "success" : "default"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Date" value={fmtDate(item.date)} />
      </div>

      <SectionDivider title="Description" />
      <RichText>{item.description}</RichText>

      {item.evidenceUrl && (
        <>
          <SectionDivider title="Evidence" />
          <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan hover:underline">
            {item.evidenceUrl}
          </a>
        </>
      )}
    </div>
  );
}

export function RecordDrawer({ open, onClose, record, type, editBasePath, context }: RecordDrawerProps) {
  if (!record) return null;

  const title = "title" in record ? record.title : "question" in record ? record.question : "name" in record ? record.name : "Record";
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
              <Badge variant="outline" size="sm">{typeLabel(type)}</Badge>
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
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {type === "topic" && <TopicDetail topic={record as Topic} context={context} />}
          {type === "review" && <ReviewDetail item={record as ReviewItem} context={context} />}
          {type === "hypothesis" && <HypothesisDetail hypothesis={record as Hypothesis} />}
          {type === "literature-gap" && <LiteratureGapDetail gap={record as LiteratureGap} context={context} />}
          {type === "manuscript" && <ManuscriptDetail manuscript={record as Manuscript} context={context} />}
          {type === "contact" && <ContactDetail contact={record as ProfessionalContact} />}
          {type === "tartu-note" && <TartuNoteDetail note={record as TartuNote} />}
          {type === "time-block" && <TimeBlockDetail block={record as TimeBlock} />}
          {type === "health-log" && <HealthLogDetail log={record as HealthLog} />}
          {type === "language-progress" && <LanguageProgressDetail item={record as LanguageProgress} />}
          {type === "reputation-event" && <ReputationEventDetail event={record as ReputationEvent} />}
          {type === "opportunity" && <OpportunityDetail opportunity={record as Opportunity} />}
          {type === "life-admin" && <LifeAdminItemDetail item={record as LifeAdminItem} />}
          {type === "portfolio-item" && <PortfolioItemDetail item={record as PortfolioItem} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}