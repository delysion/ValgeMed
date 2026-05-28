"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { importFlashcardsAction, type FlashcardImportRow } from "@/lib/actions/smart-input";
import { cn } from "@/lib/utils";

export function FlashcardCsvImport({ className }: { className?: string }) {
  const { locale, t } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<FlashcardImportRow[]>([]);
  const [result, setResult] = useState<{ success: boolean; message: string; imported?: number; skipped?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;

      const rows = parseCsv(text);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (!preview.length && !fileName) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;

      const rows = parseCsv(text);
      if (!rows.length) return;

      startTransition(async () => {
        const res = await importFlashcardsAction(rows, locale);
        setResult({
          success: res.success,
          message: res.message,
          imported: res.imported,
          skipped: res.skipped,
        });
        if (res.success) {
          setPreview([]);
          setFileName(null);
        }
      });
    };

    const input = document.getElementById("csv-import-input") as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      reader.readAsText(file);
    }
  };

  return (
    <GlassCard className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-violet" />
        <h3 className="text-lg font-semibold text-text-primary">
          {t("settings.importFlashcards")}
        </h3>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center"
      >
        <input
          id="csv-import-input"
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />
        <label htmlFor="csv-import-input" className="cursor-pointer">
          <p className="text-sm text-text-secondary">
            {fileName
              ? locale === "et"
                ? `Fail valitud: ${fileName}`
                : `File selected: ${fileName}`
              : t("settings.importFlashcardsHint")}
          </p>
          <p className="text-xs text-text-secondary mt-1 opacity-60">
            {t("settings.importFlashcardsFormat")}
          </p>
        </label>
      </div>

      {preview.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-text-secondary mb-2">
            {locale === "et" ? "Eelvaade (esimesed 5 rida):" : "Preview (first 5 rows):"}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 px-2 text-text-secondary font-medium">{t("settings.importColQuestion")}</th>
                  <th className="text-left py-1 px-2 text-text-secondary font-medium">{t("settings.importColAnswer")}</th>
                  <th className="text-left py-1 px-2 text-text-secondary font-medium">{t("settings.importColSubject")}</th>
                  <th className="text-left py-1 px-2 text-text-secondary font-medium">{t("settings.importColTopic")}</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 px-2 text-text-primary truncate max-w-[150px]">{row.question}</td>
                    <td className="py-1 px-2 text-text-primary truncate max-w-[150px]">{row.answer}</td>
                    <td className="py-1 px-2 text-text-primary truncate max-w-[100px]">{row.subject}</td>
                    <td className="py-1 px-2 text-text-primary truncate max-w-[100px]">{row.topic || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={handleImport}
            disabled={isPending}
            className="mt-4 w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isPending
              ? locale === "et" ? "Impordin..." : "Importing..."
              : t("settings.importFlashcardsButton")}
          </Button>
        </div>
      )}

      {result && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl p-4 text-sm border mt-4",
            result.success
              ? "bg-emerald/10 text-emerald border-emerald/20"
              : "bg-rose/10 text-rose border-rose/20"
          )}
        >
          {result.success ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div>
            <p className="font-medium">{result.message}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function parseCsv(text: string): FlashcardImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("question") || firstLine.includes("küsimus");
  const startIndex = hasHeader ? 1 : 0;

  const rows: FlashcardImportRow[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    const [question, answer, subject, topic] = cols.map((c) => c.trim());
    if (!question || !subject) continue;

    rows.push({ question, answer: answer ?? "", subject, topic: topic || undefined });
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }

  result.push(current);
  return result;
}
