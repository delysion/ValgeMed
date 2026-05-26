"use client";

import { useEffect, useState, useCallback } from "react";
import { themeCookie } from "@/lib/theme/config";

function getDefaultTheme(): "light" | "dark" {
  if (document.documentElement.classList.contains("light")) {
    return "light";
  }
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  const saved = localStorage.getItem("theme");
  return (saved as "light" | "dark") || "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    queueMicrotask(() => setThemeState(getDefaultTheme()));
  }, []);

  const setTheme = useCallback((newTheme: "light" | "dark") => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    document.cookie = `${themeCookie}=${newTheme};max-age=31536000;path=/`;
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme };
}
