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
          ? "bg-primary-soft/50 text-primary border-l-primary"
          : "border-l-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
        "active:scale-[0.98]",
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
        isActive
          ? "text-primary"
          : "text-text-muted group-hover:text-text-primary",
      )} />
      <span className="truncate">{t(label)}</span>
    </Link>
  );
}
