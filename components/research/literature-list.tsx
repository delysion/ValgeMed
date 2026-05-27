"use client";

import { useState } from "react";
import { BookOpen, Eye } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { deleteLiteratureGapAction } from "@/lib/actions/research";
import type { LiteratureGap } from "@/lib/db/schema";

interface LiteratureListProps {
  gaps: LiteratureGap[];
  areaNames: Record<string, string>;
  labels: {
    priority: string;
    status: string;
    open: string;
    edit: string;
    delete: string;
    noArea: string;
    publishable: string;
    emptyTitle: string;
    emptyBody: string;
  };
}

export function LiteratureList({ gaps, areaNames, labels }: LiteratureListProps) {
  const [selected, setSelected] = useState<LiteratureGap | null>(null);

  return (
    <>
      <div className="space-y-3">
        {gaps.length > 0 ? (
          gaps.map((gap) => (
            <div
              key={gap.id}
              onClick={() => setSelected(gap)}
              className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border/60 bg-bg-surface/50 p-4 transition-colors hover:bg-bg-subtle/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{gap.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {labels.priority}: {gap.priority}/10 / {labels.status}: {gap.status}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {areaNames[gap.researchAreaId ?? ""] ?? labels.noArea} {gap.publishableForStudent ? `/ ${labels.publishable}` : ""}
                </p>
                {gap.description && <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{gap.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(gap);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
                  aria-label={labels.open}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={`/research/literature?editGap=${gap.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
                  aria-label={labels.edit}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z" /></svg>
                </a>
                <DeleteButton action={deleteLiteratureGapAction} id={gap.id} label={labels.delete} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon={BookOpen} title={labels.emptyTitle} description={labels.emptyBody} variant="first-time" />
        )}
      </div>

      <RecordDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        record={selected}
        type="literature-gap"
        editBasePath="/research/literature"
      />
    </>
  );
}
