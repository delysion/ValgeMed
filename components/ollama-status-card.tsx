"use client";

import { useCallback, useState } from "react";
import { Wifi, WifiOff, RefreshCw, Copy, Check, Cpu } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOllamaStatus } from "@/components/ollama-status";

interface OllamaStatusCardProps {
  locale?: string;
}

export function OllamaStatusCard({ locale = "en" }: OllamaStatusCardProps) {
  const { status, checking, checkStatus } = useOllamaStatus();
  const [copied, setCopied] = useState(false);

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("ollama serve");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, []);

  const isOnline = status?.online ?? false;
  const models = status?.models ?? [];

  return (
    <GlassCard tone={isOnline ? "emerald" : "gold"}>
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          isOnline
            ? "bg-emerald/10 text-emerald border border-emerald/20"
            : "bg-gold/10 text-gold border border-gold/20"
        )}>
          {isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
        </div>

        {/* Status Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {isOnline ? "Ollama Online" : "Ollama Offline"}
            </h3>
            <Badge variant={isOnline ? "success" : "warning"} className="text-xs">
              {isOnline ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {isOnline && models.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {models.map((model) => (
                <Badge key={model} variant="outline" className="gap-1 text-xs">
                  <Cpu className="h-3 w-3" />
                  {model}
                </Badge>
              ))}
            </div>
          )}

          {!isOnline && status !== null && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-text-secondary">
                {locale === "et"
                  ? "Ollama ei tööta. Käivita see terminalis:"
                  : "Ollama is not running. Start it in your terminal:"}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-bg-subtle px-3 py-2 text-sm font-mono text-text-primary">
                  ollama serve
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCommand}
                  className="gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald" />
                      {locale === "et" ? "Kopeeritud" : "Copied"}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {locale === "et" ? "Kopeeri" : "Copy"}
                    </>
                  )}
                </Button>
              </div>
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

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={checkStatus}
          disabled={checking}
          className="gap-1.5 shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />
          {checking
            ? locale === "et" ? "Kontrollin..." : "Checking..."
            : locale === "et" ? "Kontrolli" : "Check Status"}
        </Button>
      </div>
    </GlassCard>
  );
}
