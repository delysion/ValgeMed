"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOSDevice && !standalone) {
      setShowBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  }

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-border bg-bg-elevated/95 backdrop-blur-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-ring">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Installa ValgeMed</p>
            {isIOS ? (
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Tocca <span className="inline-flex items-center align-middle"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-1.5v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6H16.5z"/></svg></span> poi <strong>Aggiungi alla schermata Home</strong>
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-secondary">
                Aggiungi l&apos;icona alla tua schermata Home
              </p>
            )}
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <div className="mt-3 ml-13">
            <Button size="sm" onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4" />
              Installa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}