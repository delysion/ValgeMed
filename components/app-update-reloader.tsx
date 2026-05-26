"use client";

import { useEffect, useRef } from "react";

const VERSION_ENDPOINT = "/api/app-version";
const POLL_INTERVAL_MS = 60_000;

async function fetchVersion() {
  try {
    const response = await fetch(VERSION_ENDPOINT, { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as { version?: unknown };
    return typeof data.version === "string" && data.version.length > 0 ? data.version : null;
  } catch {
    return null;
  }
}

export function AppUpdateReloader() {
  const currentVersionRef = useRef<string | null>(null);
  const isReloadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      if (cancelled || isReloadingRef.current || document.visibilityState === "hidden") return;

      const version = await fetchVersion();
      if (!version || cancelled) return;

      if (!currentVersionRef.current) {
        currentVersionRef.current = version;
        return;
      }

      if (currentVersionRef.current !== version) {
        isReloadingRef.current = true;
        window.location.reload();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkVersion();
      }
    };

    void checkVersion();
    const intervalId = setInterval(checkVersion, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkVersion);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkVersion);
    };
  }, []);

  return null;
}
