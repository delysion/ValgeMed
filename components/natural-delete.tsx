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
      console.log("[DEBUG delete] executeData:", JSON.stringify(executeData));
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

      if (!result.success || !result.candidate) {
        setError(result.error || (locale === "et" ? "Viga" : "Error"));
        setSearchDone(true);
        return;
      }

      setCandidate(result.candidate);
      setSearchDone(true);
    });
  };

  const handleConfirmDelete = () => {
    if (!candidate) return;

    startTransition(async () => {
      const result = await confirmDeleteAction(candidate.id, candidate.type, locale);

      if (result.success) {
        setSuccessMsg(result.message);
        setCandidate(null);
        setInput("");
        setShowConfirm(false);
      } else {
        setError(result.message);
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

          {candidate && (
            <div className="rounded-lg border border-rose/20 bg-rose/5 p-3">
              <p className="text-sm font-medium text-text-primary">{candidate.title}</p>
              <p className="text-xs text-text-muted mt-1">{candidate.type}</p>
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