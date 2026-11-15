"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Command, Grid3x3, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { navigationSectionForPath } from "./navigation-config";

const tabs = [
  { section: "nav.sectionCommand", label: "nav.command", href: "/command", icon: Command },
  { section: "nav.sectionStudy", label: "nav.sectionStudy", href: "/study", icon: BookOpen },
  { section: "nav.sectionPerformance", label: "nav.sectionPerformance", href: "/dashboard", icon: TrendingUp },
] as const;

const tabClass = "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-medium text-text-muted hover:text-text-primary";

export function MobileNav({ drawerOpen, onOpenDrawer }: { drawerOpen: boolean; onOpenDrawer: React.MouseEventHandler<HTMLButtonElement> }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const section = navigationSectionForPath(pathname);

  return (
    <nav aria-label={t("nav.quick")} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex h-14 items-center px-2">
        {tabs.map(({ section: group, label, href, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : section === group ? "true" : undefined}
            className={cn(tabClass, section === group && "bg-primary-soft/60 font-semibold text-primary")}>
            <Icon aria-hidden="true" className="h-5 w-5" />
            {t(label)}
          </Link>
        ))}
        <button type="button" aria-haspopup="dialog" aria-expanded={drawerOpen} onClick={onOpenDrawer} className={tabClass}>
          <Grid3x3 aria-hidden="true" className="h-5 w-5" />
          {t("common.more")}
        </button>
      </div>
    </nav>
  );
}
