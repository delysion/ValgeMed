export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton */}
      <div className="h-20 animate-pulse rounded-2xl bg-bg-subtle" />

      {/* Content skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-bg-subtle" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="h-56 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-bg-subtle" />
            <div className="h-48 animate-pulse rounded-2xl bg-bg-subtle" />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-40 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-32 animate-pulse rounded-2xl bg-bg-subtle" />
        </div>
      </div>
    </div>
  );
}
