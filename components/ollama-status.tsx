"use client";

import { useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OllamaStatus {
  online: boolean;
  models: string[];
}

const CACHE_KEY = "ollama_status_cache";
const CACHE_ONLINE_TTL = 5 * 60 * 1000;
const CACHE_OFFLINE_TTL = 2 * 60 * 1000;

function getCachedStatus(): OllamaStatus | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { status, timestamp } = JSON.parse(cached);
    const ttl = status.online ? CACHE_ONLINE_TTL : CACHE_OFFLINE_TTL;
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return status;
  } catch {
    return null;
  }
}

function setCachedStatus(status: OllamaStatus) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ status, timestamp: Date.now() }));
  } catch {
    // localStorage unavailable
  }
}

export function useOllamaStatus() {
  const [status, setStatus] = useState<OllamaStatus | null>(() => getCachedStatus());
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(() => {
    setChecking(true);
    fetch("/api/ai/status", { signal: AbortSignal.timeout(5000) })
      .then((res) => {
        if (!res.ok) throw new Error("Status check failed");
        return res.json();
      })
      .then((data: OllamaStatus) => {
        setStatus(data);
        setCachedStatus(data);
      })
      .catch(() => {
        const offline = { online: false, models: [] };
        setStatus(offline);
        setCachedStatus(offline);
      })
      .finally(() => setChecking(false));
  }, []);

  return { status, checking, checkStatus };
}

export function OllamaStatusBadge() {
  const { status, checking, checkStatus } = useOllamaStatus();

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={status?.online ? "success" : status === null ? "muted" : "danger"}
        className="gap-1.5 cursor-pointer select-none"
        onClick={checkStatus}
        title={status?.online ? "Ollama connected" : "Click to check Ollama status"}
      >
        {status?.online ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {status?.online
          ? `Ollama${status.models.length > 0 ? ` · ${status.models[0]}` : ""}`
          : status === null
            ? "Check Ollama"
            : "Ollama Offline"}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={checkStatus}
        disabled={checking}
        title="Refresh Ollama status"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />
      </Button>
    </div>
  );
}
