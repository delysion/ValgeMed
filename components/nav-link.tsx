"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
  t,
}: {
  href: string;
  label: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  t: (key: TranslationKey) => string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/command" && pathname?.startsWith(href + "/"));

  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px] pl-[9px] pr-3",
        isActive
          ? "bg-gradient-to-r from-primary-soft/60 to-primary-soft/20 text-primary border-l-primary shadow-sm shadow-primary/10"
          : "border-l-transparent text-text-secondary hover:bg-gradient-to-r hover:from-bg-subtle/60 hover:to-bg-subtle/20 hover:text-text-primary",
        "active:scale-[0.98]",
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
        isActive
          ? "text-primary drop-shadow-sm"
          : "text-text-muted group-hover:text-text-primary",
      )} />
      <span className="truncate">{t(label)}</span>
    </Link>
  );
}
