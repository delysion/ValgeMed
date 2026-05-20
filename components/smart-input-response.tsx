"use client";

import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";

interface SmartInputResponseProps {
  message: string;
  success: boolean;
  details?: {
    subject?: string;
    topic?: string;
    durationMinutes?: number;
    itemsCreated?: number;
  };
  onDismiss: () => void;
  dismissLabel: string;
}

export function SmartInputResponse({ message, success, details, onDismiss, dismissLabel }: SmartInputResponseProps) {
  return (
    <GlassCard tone={success ? "emerald" : "rose"} className="animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{message}</p>
          {details && success && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {details.subject && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
                  <Sparkles className="h-3 w-3" />
                  {details.subject}
                </span>
              )}
              {details.topic && (
                <span className="inline-flex items-center gap-1 rounded-md bg-violet/10 px-2 py-0.5 text-xs font-medium text-violet">
                  {details.topic}
                </span>
              )}
              {details.durationMinutes && (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan">
                  {details.durationMinutes} min
                </span>
              )}
              {details.itemsCreated && details.itemsCreated > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                  {details.itemsCreated} flashcards
                </span>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          {dismissLabel}
        </Button>
      </div>
    </GlassCard>
  );
}