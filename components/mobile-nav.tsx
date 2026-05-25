"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command, BookOpen, Target, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";

const tabs = [
  { id: "command", labelKey: "nav.command", icon: Command, paths: ["/command", "/dashboard", "/elite-index", "/strategic-review"] },
  { id: "studio", labelKey: "nav.sectionStudy", icon: BookOpen, paths: ["/subjects", "/exams", "/topics", "/study", "/reviews", "/errors", "/study-sessions", "/daily-log"] },
  { id: "goals", labelKey: "nav.goals", icon: Target, paths: ["/goals", "/memory", "/identity", "/tartu", "/time", "/health", "/language"] },
  { id: "more", labelKey: "common.more", icon: Grid3x3, paths: [] },
];

const primaryPaths = {
  command: "/command",
  studio: "/study",
  goals: "/goals",
};

export function MobileNav({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY <= lastScrollY.current || currentY < 56);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeTab = tabs.find((tab) =>
    tab.id === "more" ? false : tab.paths.some((p) => pathname === p || pathname.startsWith(p + "/")),
  )?.id ?? "";

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-gradient-to-t from-bg-page/95 to-bg-surface/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden",
        "transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "more") {
                  onOpenDrawer();
                } else {
                  router.push(primaryPaths[tab.id as keyof typeof primaryPaths]);
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] rounded-xl px-3",
                "transition-all duration-150 active:scale-[0.92]",
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary",
              )}
            >
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-ice via-primary to-violet opacity-90" />
              )}
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_2px_4px_rgba(0,180,255,0.25)]")} />
              <span className={cn(
                "text-[10px] font-medium leading-none",
                isActive && "font-semibold",
              )}>
                {t(tab.labelKey as TranslationKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
