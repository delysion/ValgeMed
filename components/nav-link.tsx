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
  onNavigate,
}: {
  href: string;
  label: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  t: (key: TranslationKey) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/command" && pathname?.startsWith(href + "/"));

  return (
    <Link
      href={href}
      onNavigate={onNavigate}
      aria-current={pathname === href ? "page" : isActive ? "location" : undefined}
      className={cn(
        "group flex items-center gap-3 min-h-11 rounded-control py-2.5 text-ui-body font-medium transition-colors duration-150 border-l-2 pl-[9px] pr-3",
        isActive
          ? "bg-primary-soft text-primary border-l-primary"
          : "border-l-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0",
        isActive
          ? "text-primary"
          : "text-text-muted group-hover:text-text-primary",
      )} />
      <span className="truncate">{t(label)}</span>
    </Link>
  );
}
