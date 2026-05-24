"use client";

import { BookOpen, FileText, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { IdentityNote, TartuNote } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type NoteItem = {
  id: string;
  title: string;
  content: string | null;
  category: string;
  date: Date;
  source: "identity" | "tartu";
  priority?: number | null;
  status?: string | null;
};

export function NoteVault({ identityNotes, tartuNotes }: { identityNotes: IdentityNote[]; tartuNotes: TartuNote[] }) {
  const { t } = useTranslation();
  const allNotes: NoteItem[] = [
    ...identityNotes.map((n) => ({ id: n.id, title: n.title, content: n.content, category: n.category, date: new Date(), source: "identity" as const })),
    ...tartuNotes.map((n) => ({ id: n.id, title: n.title, content: n.content, category: n.category, date: new Date(), source: "tartu" as const, priority: n.priority, status: n.status })),
  ];

  if (allNotes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <BookOpen className="mx-auto h-6 w-6 text-muted-2" />
        <p className="mt-3 text-sm text-muted">{t("noteVault.emptyTitle")}</p>
        <p className="mt-1 text-xs text-muted-2">{t("noteVault.emptyDescription")}</p>
      </div>
    );
  }

  const categories = [...new Set(allNotes.map((n) => n.category))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Search className="h-4 w-4 text-muted-2" />
        {categories.map((cat) => (
          <Badge key={cat} variant="muted" className="text-[10px]">
            <Tag className="mr-1 h-2.5 w-2.5" />
            {cat.replace(/_/g, " ")}
          </Badge>
        ))}
        <span className="ml-auto text-xs text-muted-2">{t("noteVault.notesCount", { count: allNotes.length })}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {allNotes.map((note) => (
          <div key={note.id} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                  <h4 className="truncate text-sm font-medium text-white">{note.title}</h4>
                </div>
                {note.content ? (
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-2">{note.content}</p>
                ) : null}
              </div>
              <Badge variant={note.source === "identity" ? "violet" : "default"} className="shrink-0 text-[9px]">
                {note.source}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-2">
              <span>{note.category.replace(/_/g, " ")}</span>
              {note.priority != null ? <span>{t("noteVault.priority", { value: note.priority })}</span> : null}
              {note.status ? <span className={cn("font-medium", note.status === "done" ? "text-emerald" : "text-muted")}>{note.status}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
