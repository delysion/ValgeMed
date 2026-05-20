import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md bg-gradient-to-r from-bg-subtle via-bg-elevated to-bg-subtle",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
