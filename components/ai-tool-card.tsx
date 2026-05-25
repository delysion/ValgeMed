"use client";

import { useState, useTransition } from "react";
import { Loader2, Play, XCircle, Copy, Check, WifiOff, WandSparkles, Brain, Search, CalendarRange, FileText, FlaskConical, Save } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createErrorLogAction } from "@/lib/actions/resources";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  WandSparkles,
  Brain,
  Search,
  CalendarRange,
  FileText,
  FlaskConical,
};

interface AiToolCardProps {
  title: string;
  description: string;
  icon: string;
  tool: string;
  tone: "cyan" | "violet" | "rose" | "emerald" | "gold";
  inputPlaceholder?: string;
  onDataRequest?: () => Promise<string>;
  subjects?: Array<{ id: string; name: string }>;
}

export function AiToolCard({
  title,
  description,
  icon: iconName,
  tool,
  tone,
  inputPlaceholder,
  onDataRequest,
  subjects,
}: AiToolCardProps) {
  const { t, locale } = useTranslation();
  const Icon = iconMap[iconName] || WandSparkles;
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects?.[0]?.id ?? "");

  const parsedError = tool === "error_analysis" && result ? tryParseErrorJson(result) : null;

  const handleExecute = () => {
    setExpanded(true);
    if (onDataRequest && !input.trim()) {
      startTransition(async () => {
        try {
          const data = await onDataRequest();
          setInput(data);
        } catch {
          setError(t("ai.failedToLoad"));
        }
      });
      return;
    }

    if (!input.trim()) return;

    startTransition(async () => {
      setError(null);
      setErrorType(null);
      setResult(null);
      try {
        const res = await fetch("/api/ai/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool, input: input.trim(), locale }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorType(data.errorType || "UNKNOWN");
          throw new Error(data.error || "Execution failed");
        }

        setResult(data.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Execution failed");
      }
    });
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  function tryParseErrorJson(text: string): { title: string; cause?: string; correction?: string; preventionRule?: string; severity: number } | null {
    try {
      const obj = JSON.parse(text);
      if (obj && obj.title) {
        return {
          title: obj.title,
          cause: obj.cause,
          correction: obj.correction,
          preventionRule: obj.preventionRule,
          severity: Math.max(0, Math.min(10, obj.severity ?? 5)),
        };
      }
    } catch {}
    return null;
  }

  async function handleSaveError() {
    if (!parsedError || !selectedSubject) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("subjectId", selectedSubject);
      fd.set("title", parsedError.title);
      fd.set("description", parsedError.cause || result || "");
      fd.set("cause", parsedError.cause || "");
      fd.set("correction", parsedError.correction || "");
      fd.set("preventionRule", parsedError.preventionRule || "");
      fd.set("severity", String(parsedError.severity));
      fd.set("errorType", "memory");
      fd.set("resolved", "false");
      fd.set("recurrenceCount", "0");
      await createErrorLogAction(fd);
      setSaved(true);
      setShowSaveForm(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t("ai.failedToLoad"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard tone={tone} className="transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-xl border p-2.5",
          tone === "cyan" && "border-cyan/25 bg-cyan/10 text-cyan",
          tone === "violet" && "border-violet/25 bg-violet/10 text-violet",
          tone === "rose" && "border-rose/25 bg-rose/10 text-rose",
          tone === "emerald" && "border-emerald/25 bg-emerald/10 text-emerald",
          tone === "gold" && "border-gold/25 bg-gold/10 text-gold",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <Button
          size="sm"
          variant={expanded ? "outline" : "default"}
          onClick={handleExecute}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {t("ai.run")}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder || t("ai.enterData")}
            rows={4}
            className="resize-none text-sm"
          />

          {input.trim() && !result && !error && (
            <Button
              onClick={handleExecute}
              disabled={isPending}
              size="sm"
              className="w-fit"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {t("ai.analyze")}
            </Button>
          )}

          {error && (
            <div className={cn(
              "flex items-start gap-3 rounded-xl p-4 text-sm",
              errorType === "OLLAMA_NOT_RUNNING" 
                ? "bg-gold/10 text-gold border border-gold/20"
                : "bg-rose/10 text-rose border border-rose/20"
            )}>
              {errorType === "OLLAMA_NOT_RUNNING" ? (
                <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div>
                <p className="font-medium">{error}</p>
                {errorType === "OLLAMA_NOT_RUNNING" && (
                  <p className="mt-1.5 text-xs opacity-80">
                    {t("ai.ollamaStart")}
                  </p>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="relative rounded-xl border border-border bg-bg-subtle/50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-primary flex-1 min-w-0">
                  {parsedError ? (
                    <div className="space-y-2">
                      <p className="font-semibold">{parsedError.title}</p>
                      {parsedError.cause && <p className="text-xs"><span className="font-medium">Cause:</span> {parsedError.cause}</p>}
                      {parsedError.correction && <p className="text-xs"><span className="font-medium">Correction:</span> {parsedError.correction}</p>}
                      {parsedError.preventionRule && <p className="text-xs"><span className="font-medium">Prevention:</span> {parsedError.preventionRule}</p>}
                      <p className="text-xs">Severity: {parsedError.severity}/10</p>
                    </div>
                  ) : (
                    result
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {parsedError && !saved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveForm(!showSaveForm)}
                      className="h-7 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                  )}
                  {saved && <span className="text-xs text-emerald font-medium">Saved!</span>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {showSaveForm && subjects && subjects.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-border/60 bg-bg-surface px-3 text-xs text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleSaveError} disabled={saving} className="h-9 text-xs">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                  </Button>
                </div>
              )}
              {showSaveForm && (!subjects || subjects.length === 0) && (
                <p className="mt-2 text-xs text-rose">Create a subject first to save errors.</p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
