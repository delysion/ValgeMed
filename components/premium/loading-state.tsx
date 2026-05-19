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
  const content = (
    <div className={cn("flex items-center gap-3", fullScreen ? "flex-col" : "")}>
      <div className="relative flex h-6 w-6 items-center justify-center">
        <div className="absolute h-6 w-6 animate-ping rounded-full bg-cyan/10" />
        <Loader2 className="relative h-5 w-5 animate-spin text-cyan" />
      </div>
      <p className={cn("font-medium uppercase tracking-[0.14em] text-muted", fullScreen ? "text-xs" : "text-[11px]")}>{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn("grid min-h-screen place-items-center", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("panel-lift rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl", className)}>
      {content}
    </div>
  );
}
