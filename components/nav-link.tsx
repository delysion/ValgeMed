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
  featured = false,
}: {
  href: string;
  label: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  t: (key: TranslationKey) => string;
  featured?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/command" && pathname?.startsWith(href + "/"));

  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-white shadow-sm shadow-primary/20"
          : featured
            ? "border border-primary/20 bg-primary-soft text-primary shadow-sm hover:bg-primary-soft/70 hover:shadow-md"
            : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
        "active:scale-[0.98]",
      )}
    >
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
        isActive
          ? "text-white"
          : featured
            ? "text-primary"
            : "text-text-muted group-hover:text-text-primary",
      )} />
      <span className="truncate">{t(label)}</span>
      {featured && !isActive && (
        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}
