"use client";

import { useState } from "react";
import { Edit3, Eye, AlertTriangle } from "lucide-react";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { DeleteButton } from "@/components/forms/delete-button";
import { getMasteryLevel, MasteryBadge, type MasteryLevel } from "@/components/premium/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTopicAction } from "@/lib/actions/resources";
import type { Topic, Subject, Exam, ErrorLog } from "@/lib/db/schema";
import { fmtDate } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface TopicsGridProps {
  topics: Topic[];
  subjects: Subject[];
  exams: Exam[];
  errorLogs: ErrorLog[];
  labels: {
    subject: string;
    linkedExam: string;
    activeRecall: string;
    errorReview: string;
    reviews: string;
    confidence: string;
    priority: string;
    nextReview: string;
    unresolved: string;
    open: string;
    edit: string;
    delete: string;
    mastery: Record<MasteryLevel, string>;
  };
}

const masteryTone = {
  dormant: "border-l-slate-500",
  awakening: "border-l-blue-500",
  building: "border-l-cyan",
  dangerous: "border-l-rose",
  examReady: "border-l-gold",
  mastered: "border-l-emerald",
};

const masteryProgressTone = {
  dormant: "bg-slate-400",
  awakening: "bg-blue-400",
  building: "bg-cyan",
  dangerous: "bg-rose",
  examReady: "bg-gold",
  mastered: "bg-emerald",
};

function InlineProgress({ value, tone, className }: { value: number; tone: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", tone)}
        style={{ width: `${value * 10}%` }}
      />
    </div>
  );
}

export function TopicsGrid({ topics, subjects, exams, errorLogs, labels }: TopicsGridProps) {
  const [selected, setSelected] = useState<Topic | null>(null);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const examById = new Map(exams.map((e) => [e.id, e]));

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-bg-surface/50 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-bg-subtle">
          <Eye className="h-6 w-6 text-text-muted" />
        </div>
        <p className="mt-4 text-sm font-medium text-text-primary">No topics yet</p>
        <p className="mt-1 text-xs text-text-secondary">Add your first topic to start tracking mastery</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => {
          const openErrors = errorLogs.filter((e) => e.topicId === topic.id && !e.resolved).length;
          const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors });
          const suggestedAction = topic.confidence <= 3 ? labels.activeRecall : openErrors > 0 ? labels.errorReview : labels.reviews;

          return (
            <div
              key={topic.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30",
                masteryTone[level]
              )}
              onClick={() => setSelected(topic)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                    {subjectById.get(topic.subjectId)?.name ?? labels.subject}
                  </p>
                  <h3 className="mt-1.5 truncate text-base font-semibold text-text-primary">{topic.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {topic.examId ? examById.get(topic.examId)?.title : labels.linkedExam}
                  </p>
                </div>
                <MasteryBadge level={level} label={labels.mastery[level]} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text-secondary">{labels.confidence}</span>
                    <span className="font-mono text-[10px] tabular-nums text-text-primary">{topic.confidence}/10</span>
                  </div>
                  <InlineProgress value={topic.confidence} tone={masteryProgressTone[level]} />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text-secondary">{labels.priority}</span>
                    <span className="font-mono text-[10px] tabular-nums text-text-primary">{topic.priority}/10</span>
                  </div>
                  <InlineProgress value={topic.priority} tone="bg-violet" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-bg-elevated/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  {openErrors > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-rose">
                      <AlertTriangle className="h-3 w-3" />
                      {openErrors}
                    </span>
                  )}
                  <span className="text-[10px] text-text-muted">
                    {labels.nextReview}: {fmtDate(topic.nextReviewAt)}
                  </span>
                </div>
                <Badge variant="ghost" size="sm">{suggestedAction}</Badge>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(topic);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {labels.open}
                </Button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={`/topics?edit=${topic.id}`}>
                      <Edit3 className="h-3 w-3" />
                    </a>
                  </Button>
                  <DeleteButton action={deleteTopicAction} id={topic.id} label={labels.delete} onClick={(e) => e.stopPropagation()} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <RecordDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        record={selected}
        type="topic"
        editBasePath="/topics"
        context={selected ? {
          subjectName: subjectById.get(selected.subjectId)?.name,
          examTitle: selected.examId ? examById.get(selected.examId)?.title : undefined,
        } : undefined}
      />
    </>
  );
}