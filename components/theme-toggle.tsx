"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="h-9 w-9 rounded-lg"
      aria-label={t(theme === "dark" ? "theme.switchLight" : "theme.switchDark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      )}
    </Button>
  );
}