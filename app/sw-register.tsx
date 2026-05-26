"use client";

import { useEffect } from "react";

async function unregisterDevelopmentServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => {
      if (new URL(registration.scope).origin === window.location.origin) {
        return registration.unregister();
      }
      return Promise.resolve(false);
    }),
  );

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith("valgemed-"))
        .map((key) => caches.delete(key)),
    );
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      unregisterDevelopmentServiceWorkers().catch((err) =>
        console.warn("SW development cleanup failed:", err),
      );
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        const hasActiveController = Boolean(navigator.serviceWorker.controller);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (hasActiveController && newWorker.state === "activated") {
              window.location.reload();
            }
          });
        });
      })
      .catch((err) => console.warn("SW registration failed:", err));
  }, []);

  return null;
}
