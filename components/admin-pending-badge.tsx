"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function AdminPendingBadge() {
  const [data, setData] = useState<{ count: number; isAdmin: boolean } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/pending-count");
        if (res.ok) setData(await res.json());
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!data?.isAdmin) return null;

  const isActive = pathname === "/admin/users" || pathname?.startsWith("/admin/");

  return (
    <Link
      href="/admin/users"
      prefetch
      className={cn(
        "group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px] pl-[9px] pr-3",
        isActive
          ? "bg-gradient-to-r from-primary-soft/60 to-primary-soft/20 text-primary border-l-primary shadow-sm shadow-primary/10"
          : "border-l-transparent text-text-secondary hover:bg-gradient-to-r hover:from-bg-subtle/60 hover:to-bg-subtle/20 hover:text-text-primary",
        "active:scale-[0.98]",
      )}
    >
      <Shield
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
          isActive
            ? "text-primary drop-shadow-sm"
            : "text-text-muted group-hover:text-text-primary",
        )}
      />
      <span className="truncate">Admin</span>
      {data.count > 0 && (
        <Badge variant="danger" className="ml-auto text-[10px] px-1.5 py-0">
          {data.count}
        </Badge>
      )}
    </Link>
  );
}
