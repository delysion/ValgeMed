"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setThemeAction } from "@/lib/theme/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ theme }: { theme: "light" | "dark" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    startTransition(async () => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
      await setThemeAction(next);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "h-9 w-9 rounded-lg",
        pending && "opacity-50",
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-text-muted hover:text-text-primary" />
      ) : (
        <Moon className="h-4 w-4 text-text-muted hover:text-text-primary" />
      )}
    </Button>
  );
}
