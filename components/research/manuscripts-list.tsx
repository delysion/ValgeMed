"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FileText } from "lucide-react";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import type { Manuscript } from "@/lib/db/schema";
import { deleteManuscriptAction } from "@/lib/actions/research";

interface ManuscriptsListProps {
  manuscripts: Manuscript[];
  hypothesisNames: Map<string, string>;
  t: (key: any, params?: Record<string, string | number>) => string;
}

export function ManuscriptsList({ manuscripts, hypothesisNames, t }: ManuscriptsListProps) {
  const [selected, setSelected] = useState<Manuscript | null>(null);

  return (
    <>
      <div className="space-y-3">
        {manuscripts.length > 0 ? (
          manuscripts.map((manuscript) => (
            <div
              key={manuscript.id}
              onClick={() => setSelected(manuscript)}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-bg-surface/50 p-4 cursor-pointer hover:bg-bg-subtle/30 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{manuscript.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Stage: {manuscript.stage.replace(/_/g, " ")}
                  {manuscript.journal && ` · ${manuscript.journal}`}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {hypothesisNames.get(manuscript.hypothesisId ?? "") ?? "No hypothesis"}
                  {manuscript.deadline ? ` · ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(manuscript.deadline)}` : ""}
                </p>
                {manuscript.notes && <p className="mt-1 text-xs text-text-secondary line-clamp-2">{manuscript.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/research/manuscripts?editManuscript=${manuscript.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
                  aria-label={t("common.edit")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/></svg>
                </a>
                <DeleteButton action={deleteManuscriptAction} id={manuscript.id} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon={FileText} title={t("common.emptyTitle")} description={t("common.emptyBody")} variant="first-time" />
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