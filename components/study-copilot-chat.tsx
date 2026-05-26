"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, Lock, Send, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";

import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_STUDY_COPILOT_MESSAGE_CHARS,
  MAX_STUDY_COPILOT_MESSAGES,
  type StudyCopilotMessage,
} from "@/lib/ai/study-copilot";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

export function StudyCopilotChat() {
  const { t, locale } = useTranslation();
  const welcome = useMemo<StudyCopilotMessage>(() => ({
    role: "assistant",
    content: t("ai.copilotWelcome"),
  }), [t]);
  const [messages, setMessages] = useState<StudyCopilotMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const userMessage: StudyCopilotMessage = {
      role: "user",
      content: content.slice(0, MAX_STUDY_COPILOT_MESSAGE_CHARS),
    };
    const nextMessages = [...messages, userMessage].slice(-MAX_STUDY_COPILOT_MESSAGES);

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, locale }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("ai.copilotError"));
      }

      const assistantMessage: StudyCopilotMessage = {
        role: "assistant",
        content: data.message || t("ai.copilotError"),
      };
      setMessages([...nextMessages, assistantMessage].slice(-MAX_STUDY_COPILOT_MESSAGES));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ai.copilotError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <GlassCard tone="cyan" className="overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text-primary">{t("ai.copilotTitle")}</h3>
              <p className="mt-1 text-sm text-text-secondary">{t("ai.copilotDesc")}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-2.5 py-1 text-xs text-text-secondary">
              <Lock className="h-3.5 w-3.5 text-cyan" />
              {t("ai.copilotReadOnly")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-2.5 py-1 text-xs text-text-secondary">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
              {t("ai.copilotScoped")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-2.5 py-1 text-xs text-text-secondary">
              <SlidersHorizontal className="h-3.5 w-3.5 text-violet" />
              {t("ai.copilotLimited", { count: MAX_STUDY_COPILOT_MESSAGES })}
            </span>
          </div>
        </div>

        <div className="flex min-h-[22rem] w-full flex-col rounded-xl border border-border/70 bg-bg-page/70 lg:w-[min(100%,32rem)]">
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={`${message.role}-${index}`} className={cn("flex gap-2", isUser && "justify-end")}>
                  {!isUser && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl border px-3 py-2 text-sm leading-relaxed",
                      isUser
                        ? "border-primary/25 bg-primary/12 text-text-primary"
                        : "border-border bg-bg-surface text-text-secondary",
                    )}
                  >
                    {message.content}
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserRound className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-cyan" />
                {t("ai.copilotThinking")}
              </div>
            )}
          </div>

          {error && (
            <div className="mx-3 mb-2 rounded-lg border border-rose/20 bg-rose/10 px-3 py-2 text-xs text-rose" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-border/70 p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("ai.copilotPlaceholder")}
                aria-label={t("ai.copilotPlaceholder")}
                rows={2}
                maxLength={MAX_STUDY_COPILOT_MESSAGE_CHARS}
                className="min-h-12 resize-none text-sm"
              />
              <Button type="submit" size="icon" disabled={sending || !input.trim()} title={t("ai.copilotSend")} aria-label={t("ai.copilotSend")}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </GlassCard>
  );
}
