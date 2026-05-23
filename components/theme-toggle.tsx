"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        "h-9 w-9 rounded-lg",
        "light" === theme && "opacity-50",
        "dark" === theme && "opacity-50",
        "light" !== theme && "hover:scale-105",
        "dark" !== theme && "hover:scale-105"
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      )}
    </Button>
  );
}