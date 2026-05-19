import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading",
  fullScreen = false,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  if (fullScreen) {
    return (
      <div className={cn("grid min-h-screen place-items-center", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-2">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", className)}>
      <Loader2 className="h-4 w-4 animate-spin text-muted" />
      <p className="text-xs text-muted-2">{label}</p>
    </div>
  );
}
