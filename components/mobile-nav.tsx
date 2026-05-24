"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command, BookOpen, Target, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "command", label: "Command", icon: Command, paths: ["/command", "/dashboard", "/elite-index", "/strategic-review"] },
  { id: "studio", label: "Studio", icon: BookOpen, paths: ["/subjects", "/exams", "/topics", "/study", "/reviews", "/errors", "/study-sessions", "/daily-log"] },
  { id: "goals", label: "Goals", icon: Target, paths: ["/goals", "/memory", "/identity", "/tartu", "/time", "/health", "/language"] },
  { id: "more", label: "Altro", icon: Grid3x3, paths: [] },
];

const primaryPaths = {
  command: "/command",
  studio: "/study",
  goals: "/goals",
};

export function MobileNav({ onOpenDrawer }: { onOpenDrawer: () => void }) {
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
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-gradient-to-t from-bg-page/95 to-bg-surface/95 backdrop-blur-xl transition-transform duration-300 pb-[env(safe-area-inset-bottom)] lg:hidden",
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
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl px-3 transition-all duration-150 active:scale-[0.97]",
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
