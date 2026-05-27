"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== "undefined" && window.__deferredInstallPrompt) {
      const prompt = window.__deferredInstallPrompt;
      window.__deferredInstallPrompt = null;
      return prompt;
    }
    return null;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swActive, setSwActive] = useState(false);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      queueMicrotask(() => setIsStandalone(true));
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    queueMicrotask(() => {
      setIsStandalone(standalone);
      setIsIOS(isIOSDevice);
      if (isIOSDevice) setDeferredPrompt({} as BeforeInstallPromptEvent);
    });

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(() => setSwActive(true));
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const canInstall = !isStandalone && (deferredPrompt !== null || swActive);

  return { canInstall, isIOS, isStandalone, deferredPrompt };
}

export function InstallAppButton() {
  const pathname = usePathname();
  const { canInstall, isIOS, deferredPrompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed || pathname !== "/login") return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDismissed(true);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-border bg-bg-elevated/95 backdrop-blur-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-ring">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Install ValgeMed</p>
            {isIOS ? (
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Tap <span className="inline-flex items-center align-middle"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-1.5v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6H16.5z"/></svg></span> then <strong>Add to Home Screen</strong>
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-secondary">Add ValgeMed to your Home Screen</p>
            )}
          </div>
          <button onClick={() => setDismissed(true)} className="shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <div className="mt-3">
            <Button size="sm" onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4" /> Install
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InstallMenuItem() {
  const { canInstall, isIOS } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => { if (isIOS) return; }}
      className="flex w-full items-center gap-3 min-h-[44px] rounded-xl py-2.5 pl-[9px] pr-3 text-sm font-medium text-text-secondary hover:bg-bg-subtle/60 hover:text-text-primary transition-all duration-200 active:scale-[0.96]"
    >
      <Download className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">Install App</span>
      {isIOS && <span className="text-[10px] text-text-muted ml-auto">Share → Add to Home Screen</span>}
    </button>
  );
}
