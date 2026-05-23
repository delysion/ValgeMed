"use client";

import { Moon, Sun } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      onToggle();
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        "h-9 w-9 rounded-lg",
        pending && "opacity-75",
        !pending && "hover:scale-105"
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to light mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-text-muted hover:text-text-primary transition-transform duration-300" />
      )}
      {pending && (
        <div className="absolute inset-0 bg-black/10 rounded-lg" />
      )}
    </Button>
  );
}