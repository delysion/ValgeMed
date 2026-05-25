"use client";

import { useState, useTransition } from "react";
import { Loader2, Play, XCircle, Copy, Check, WifiOff, WandSparkles, Brain, Search, CalendarRange, FileText, FlaskConical } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
}

export function AiToolCard({
  title,
  description,
  icon: iconName,
  tool,
  tone,
  inputPlaceholder,
  onDataRequest,
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
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
