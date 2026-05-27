"use client";

import { Edit3 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate, humanize } from "@/lib/labels";
import type { Topic, Hypothesis, LiteratureGap, Manuscript } from "@/lib/db/schema";

type RecordType = "topic" | "hypothesis" | "literature-gap" | "manuscript";

interface RecordDrawerProps {
  open: boolean;
  onClose: () => void;
  record: Topic | Hypothesis | LiteratureGap | Manuscript | null;
  type: RecordType;
  editBasePath?: string;
}

function TopicDetail({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{topic.confidence}/10</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Confidence</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{topic.priority}/10</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Priority</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between rounded-lg bg-white/[0.04] px-3 py-2">
          <span className="text-text-muted">Status</span>
          <span className="text-text-primary">{humanize(topic.status)}</span>
        </div>
        <div className="flex justify-between rounded-lg bg-white/[0.04] px-3 py-2">
          <span className="text-text-muted">Next Review</span>
          <span className="text-text-primary">{fmtDate(topic.nextReviewAt)}</span>
        </div>
        {topic.examId && (
          <div className="flex justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <span className="text-text-muted">Exam ID</span>
            <span className="text-text-primary truncate">{topic.examId}</span>
          </div>
        )}
        {topic.subjectId && (
          <div className="flex justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <span className="text-text-muted">Subject ID</span>
            <span className="text-text-primary truncate">{topic.subjectId}</span>
          </div>
        )}
      </div>
      {topic.description && (
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-text-muted mb-1">Description</p>
          <p className="text-sm text-text-secondary">{topic.description}</p>
        </div>
      )}
    </div>
  );
}

function HypothesisDetail({ hypothesis }: { hypothesis: Hypothesis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{hypothesis.status}</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Status</p>
        </div>
        {hypothesis.totalScore !== null && (
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-text-muted">{hypothesis.totalScore}/10</p>
            <p className="mt-0.5 text-sm font-medium text-text-primary">Paper Potential</p>
          </div>
        )}
      </div>
      {hypothesis.output && (
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <p className="text-xs text-text-muted">Target Output</p>
          <p className="text-sm text-text-primary">{hypothesis.output}</p>
        </div>
      )}
      {hypothesis.notes && (
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-text-muted mb-1">Notes</p>
          <p className="text-sm text-text-secondary">{hypothesis.notes}</p>
        </div>
      )}
    </div>
  );
}

function LiteratureGapDetail({ gap }: { gap: LiteratureGap }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{gap.priority}/10</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Priority</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{gap.status}</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Status</p>
        </div>
      </div>
      {gap.researchAreaId && (
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <p className="text-xs text-text-muted">Research Area ID</p>
          <p className="text-sm text-text-primary truncate">{gap.researchAreaId}</p>
        </div>
      )}
      {gap.publishableForStudent && (
        <Badge variant="default" className="w-fit">Publishable for student</Badge>
      )}
      {gap.description && (
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-text-muted mb-1">Description</p>
          <p className="text-sm text-text-secondary">{gap.description}</p>
        </div>
      )}
    </div>
  );
}

function ManuscriptDetail({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-text-muted">{manuscript.stage.replace(/_/g, " ")}</p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">Stage</p>
        </div>
        {manuscript.deadline && (
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-text-muted">{fmtDate(manuscript.deadline)}</p>
            <p className="mt-0.5 text-sm font-medium text-text-primary">Deadline</p>
          </div>
        )}
      </div>
      {manuscript.journal && (
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <p className="text-xs text-text-muted">Journal</p>
          <p className="text-sm text-text-primary">{manuscript.journal}</p>
        </div>
      )}
      {manuscript.hypothesisId && (
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <p className="text-xs text-text-muted">Hypothesis ID</p>
          <p className="text-sm text-text-primary truncate">{manuscript.hypothesisId}</p>
        </div>
      )}
      {manuscript.notes && (
        <div className="rounded-xl border border-border/50 p-3">
          <p className="text-xs text-text-muted mb-1">Notes</p>
          <p className="text-sm text-text-secondary">{manuscript.notes}</p>
        </div>
      )}
    </div>
  );
}

export function RecordDrawer({ open, onClose, record, type, editBasePath }: RecordDrawerProps) {
  if (!record) return null;

  const title = "title" in record ? record.title : "question" in record ? record.question : "Record";
  const editHref = editBasePath ? `${editBasePath}?${type === "topic" ? "edit" : type === "hypothesis" ? "editHypothesis" : type === "literature-gap" ? "editGap" : "editManuscript"}=${record.id}` : "#";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">{title}</SheetTitle>
            {editBasePath && (
              <Button asChild variant="ghost" size="sm">
                <a href={editHref}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </a>
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {type === "topic" && <TopicDetail topic={record as Topic} />}
          {type === "hypothesis" && <HypothesisDetail hypothesis={record as Hypothesis} />}
          {type === "literature-gap" && <LiteratureGapDetail gap={record as LiteratureGap} />}
          {type === "manuscript" && <ManuscriptDetail manuscript={record as Manuscript} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}