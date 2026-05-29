"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { previewDeleteAction, confirmDeleteAction, type DeleteCandidate } from "@/lib/actions/delete-record";

interface NaturalDeleteProps {
  className?: string;
}

export function NaturalDelete({ className }: NaturalDeleteProps) {
  const { locale } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [input, setInput] = useState("");
  const [candidate, setCandidate] = useState<DeleteCandidate | null>(null);
  const [candidates, setCandidates] = useState<DeleteCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const handlePreview = () => {
    if (!input.trim()) return;

    setError(null);
    setSuccessMsg(null);
    setCandidate(null);
    setSearchDone(false);

    startTransition(async () => {
      const executeRes = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "natural_delete", input, locale }),
      });
      const executeData = await executeRes.json();
      if (!executeData.success) {
        setError(executeData.error || (locale === "et" ? "AI viga" : "AI error"));
        setSearchDone(true);
        return;
      }

      const result = await previewDeleteAction(executeData.result, locale);

      if (result.tooAmbiguous) {
        setError(result.error || (locale === "et" ? "Päring on ebapiisav" : "Query too vague"));
        setSearchDone(true);
        return;
      }

      if (result.notFound) {
        setError(locale === "et" ? "Kirjet ei leitud" : "Record not found");
        setSearchDone(true);
        return;
      }

      if (!result.success || (!result.candidate && (!result.candidates || result.candidates.length === 0))) {
        setError(result.error || (locale === "et" ? "Viga" : "Error"));
        setSearchDone(true);
        return;
      }

      if (result.candidates && result.candidates.length > 0) {
        setCandidates(result.candidates);
        setSelectedIds(new Set(result.candidates.map(c => c.id)));
        setCandidate(null);
      } else if (result.candidate) {
        setCandidates([]);
        setSelectedIds(new Set());
        setCandidate(result.candidate);
      }
      setSearchDone(true);
    });
  };

  const handleConfirmDelete = () => {
    if (candidates.length === 0 && !candidate) return;

    startTransition(async () => {
      let deleted = 0;
      const idsToDelete = candidates.length > 0
        ? [...selectedIds]
        : [candidate!.id];

      for (const id of idsToDelete) {
        const type = candidates.length > 0
          ? candidates.find(c => c.id === id)?.type
          : candidate!.type;
        if (!type) continue;
        const result = await confirmDeleteAction(id, type, locale);
        if (result.success) deleted++;
      }

      if (deleted > 0) {
        setSuccessMsg(deleted === 1
          ? (locale === "et" ? "Kirje kustutatud" : "Record deleted")
          : (locale === "et" ? `${deleted} kirjet kustutatud` : `${deleted} records deleted`));
        setCandidate(null);
        setCandidates([]);
        setSelectedIds(new Set());
        setInput("");
        setShowConfirm(false);
      } else {
        setError(locale === "et" ? "Kustutamine ebaõnnestus" : "Delete failed");
      }
    });
  };

  return (
    <>
      <GlassCard tone="rose" className={cn("relative", className)}>
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-xl border border-rose/25 bg-rose/10 p-2.5">
            <Trash2 className="h-5 w-5 text-rose" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text-primary">
              {locale === "et" ? "Kustuta Kirje" : "Delete Record"}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {locale === "et"
                ? "Kirjuta, mida soovid kustutada"
                : "Describe what you want to delete"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locale === "et"
              ? "Kirjuta, mida kustutada...\n\nNäide:\nkustuta eksam physiology 15. juunil\nkustuta topic mitochondria\nkustuta ülesanne submit research proposal"
              : "Write what to delete...\n\nExample:\ndelete exam physiology 15 june\ndelete topic mitochondria\ndelete task submit research proposal"
            }
            rows={3}
            className="resize-none text-sm"
          />

          <Button
            onClick={handlePreview}
            disabled={isPending || !input.trim()}
            className="w-full"
            size="sm"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {locale === "et" ? "Otsin..." : "Searching..."}</>
            ) : (
              <>{locale === "et" ? "Otsi Kirjet" : "Find Record"}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose/20 bg-rose/10 p-3 text-sm text-rose">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald/20 bg-emerald/10 p-3 text-sm text-emerald">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {candidate && searchDone && (
          <div className="mt-4 rounded-xl border border-rose/30 bg-rose/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{candidate.title}</p>
                <p className="text-xs text-text-muted mt-1">
                  {locale === "et" ? "Tüüp:" : "Type:"} {candidate.type}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirm(true)}
                className="shrink-0"
              >
                {locale === "et" ? "Kustuta" : "Delete"}
              </Button>
            </div>
          </div>
        )}

        {candidates.length > 0 && searchDone && (
          <div className="mt-4 rounded-xl border border-rose/30 bg-rose/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary">
                {locale === "et" ? `${candidates.length} kirjet leitud` : `${candidates.length} records found`}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirm(true)}
                className="shrink-0"
              >
                {locale === "et" ? `Kustuta ${selectedIds.size}` : `Delete ${selectedIds.size}`}
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {candidates.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-rose/5 rounded-lg p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(c.id);
                      else next.delete(c.id);
                      setSelectedIds(next);
                    }}
                    className="h-4 w-4 rounded border-border text-rose"
                  />
                  <span className="flex-1">{c.title}</span>
                  <span className="text-xs text-text-muted">{c.type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose">
              {locale === "et" ? "Kinnita Kustutamine" : "Confirm Deletion"}
            </DialogTitle>
            <DialogDescription className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-rose shrink-0 mt-0.5" />
              {locale === "et"
                ? "See toiming ei ole tagasivõetav. Kas oled kindel?"
                : "This action cannot be undone. Are you sure?"}
            </DialogDescription>
          </DialogHeader>

          {(candidate || candidates.length > 0) && (
            <div className="rounded-lg border border-rose/20 bg-rose/5 p-3 space-y-1 max-h-40 overflow-y-auto">
              {candidates.length > 0
                ? [...selectedIds].map(id => {
                    const c = candidates.find(x => x.id === id);
                    return c ? (
                      <p key={id} className="text-sm font-medium text-text-primary">{c.title} <span className="text-xs text-text-muted">({c.type})</span></p>
                    ) : null;
                  })
                : candidate && (
                    <p className="text-sm font-medium text-text-primary">{candidate.title}</p>
                  )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {locale === "et" ? "Tühista" : "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {locale === "et" ? "Kustutan..." : "Deleting..."}</>
              ) : (
                <>{locale === "et" ? "Kustuta" : "Delete"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}