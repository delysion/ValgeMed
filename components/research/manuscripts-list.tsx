"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { deleteManuscriptAction } from "@/lib/actions/research";
import type { Manuscript } from "@/lib/db/schema";

interface ManuscriptsListProps {
  manuscripts: Manuscript[];
  hypothesisNames: Record<string, string>;
  labels: {
    stage: string;
    open: string;
    edit: string;
    delete: string;
    noHypothesis: string;
    emptyTitle: string;
    emptyBody: string;
  };
}

export function ManuscriptsList({ manuscripts, hypothesisNames, labels }: ManuscriptsListProps) {
  const [selected, setSelected] = useState<Manuscript | null>(null);

  return (
    <>
      <div className="space-y-3">
        {manuscripts.length > 0 ? (
          manuscripts.map((manuscript) => (
            <div
              key={manuscript.id}
              onClick={() => setSelected(manuscript)}
              className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border/60 bg-bg-surface/50 p-4 transition-colors hover:bg-bg-subtle/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{manuscript.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {labels.stage}: {manuscript.stage.replace(/_/g, " ")}
                  {manuscript.journal && ` / ${manuscript.journal}`}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {hypothesisNames[manuscript.hypothesisId ?? ""] ?? labels.noHypothesis}
                  {manuscript.deadline ? ` / ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(manuscript.deadline)}` : ""}
                </p>
                {manuscript.notes && <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{manuscript.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(manuscript);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
                  aria-label={labels.open}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={`/research/manuscripts?editManuscript=${manuscript.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
                  aria-label={labels.edit}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z" /></svg>
                </a>
                <DeleteButton action={deleteManuscriptAction} id={manuscript.id} label={labels.delete} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon={FileText} title={labels.emptyTitle} description={labels.emptyBody} variant="first-time" />
        )}
      </div>

      <RecordDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        record={selected}
        type="manuscript"
        editBasePath="/research/manuscripts"
      />
    </>
  );
}
