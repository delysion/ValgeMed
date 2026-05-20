"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { generateFlashcardsFromTextAction } from "@/lib/actions/smart-input";
import { cn } from "@/lib/utils";

interface AiFlashcardGeneratorProps {
  initialText?: string;
  initialSubject?: string;
  initialTopic?: string;
  className?: string;
}

export function AiFlashcardGenerator({
  initialText = "",
  initialSubject = "",
  initialTopic = "",
  className,
}: AiFlashcardGeneratorProps) {
  const { locale } = useTranslation();
  const [text, setText] = useState(initialText);
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number; errorType?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!text.trim()) return;
    setResult(null);

    startTransition(async () => {
      const res = await generateFlashcardsFromTextAction(
        text.trim(),
        subject.trim() || undefined,
        topic.trim() || undefined,
        locale
      );
      setResult({
        success: res.success,
        message: res.message,
        count: res.details?.itemsCreated,
        errorType: res.messageKey,
      });
    });
  };

  return (
    <GlassCard className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-violet" />
        <h3 className="text-lg font-semibold text-text-primary">
          {locale === "et" ? "Genereeri flashcards" : "Generate Flashcards"}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            locale === "et"
              ? "Kleebi või kirjuta õppematerjal siia..."
              : "Paste or type study material here..."
          }
          rows={6}
          className="resize-none text-sm"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={locale === "et" ? "Aine (nt biokeemia)" : "Subject (e.g. Biochemistry)"}
          />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={locale === "et" ? "Teema (valikuline)" : "Topic (optional)"}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!text.trim() || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isPending
            ? locale === "et"
              ? "Genereerin..."
              : "Generating..."
            : locale === "et"
              ? "Genereeri flashcards"
              : "Generate Flashcards"}
        </Button>

        {result && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl p-4 text-sm border",
              result.success
                ? "bg-emerald/10 text-emerald border-emerald/20"
                : result.errorType === "ollamaNotRunning"
                  ? "bg-gold/10 text-gold border-gold/20"
                  : "bg-rose/10 text-rose border-rose/20"
            )}
          >
            {result.success ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : result.errorType === "ollamaNotRunning" ? (
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {result.errorType === "ollamaNotRunning" && (
                <p className="mt-1.5 text-xs opacity-80">
                  {locale === "et" 
                    ? "Käivita terminalis: ollama serve" 
                    : "Run in terminal: ollama serve"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
