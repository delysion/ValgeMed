"use client";

import { useCallback, useState } from "react";
import { Wifi, WifiOff, RefreshCw, Copy, Check, Cpu, Cloud } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOllamaStatus } from "@/components/ollama-status";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function AiStatusCard() {
  const { t, locale } = useTranslation();
  const { status, checking, checkStatus } = useOllamaStatus();
  const [copied, setCopied] = useState(false);

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("ollama serve");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const isOnline = status?.online ?? false;
  const provider = status?.provider || "AI";
  const model = status?.model;

  return (
    <GlassCard tone={isOnline ? "emerald" : "gold"}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          isOnline ? "bg-emerald/10 text-emerald border border-emerald/20" : "bg-gold/10 text-gold border border-gold/20"
        )}>
          {isOnline ? <Cloud className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {isOnline ? `${provider} Online` : "AI Offline"}
            </h3>
            <Badge variant={isOnline ? "success" : "warning"} className="text-xs">
              {isOnline ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {isOnline && model && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="gap-1 text-xs">
                <Cpu className="h-3 w-3" />
                {model}
              </Badge>
            </div>
          )}

          {!isOnline && status !== null && (
            <div className="mt-3">
              <p className="text-sm text-text-secondary">
                {locale === "et"
                  ? "AI pole seadistatud. Lisa oma API võti Seadetes (Settings → AI Settings) või käivita Ollama."
                  : "AI not configured. Add your API key in Settings → AI Settings, or start Ollama locally."}
              </p>
            </div>
          )}

          {isOnline && (
            <p className="mt-2 text-xs text-text-muted">
              {locale === "et"
                ? "AI tööriistad on saadaval. Vali allpool olev tööriist."
                : "AI tools are ready. Select a tool below to get started."}
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={checkStatus} disabled={checking} className="gap-1.5 shrink-0">
          <RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />
          {checking ? (locale === "et" ? "Kontrollin..." : "Checking...") : (locale === "et" ? "Kontrolli" : "Refresh")}
        </Button>
      </div>
    </GlassCard>
  );
}
