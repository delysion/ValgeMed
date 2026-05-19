export default function CommandLoading() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header skeleton */}
      <div className="h-20 animate-pulse rounded-2xl bg-bg-subtle" />

      {/* Greeting skeleton */}
      <div className="h-20 animate-pulse rounded-2xl bg-bg-subtle" />

      {/* Main grid skeleton */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="h-40 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-48 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-36 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-32 animate-pulse rounded-2xl bg-bg-subtle" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-64 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-40 animate-pulse rounded-2xl bg-bg-subtle" />
          <div className="h-48 animate-pulse rounded-2xl bg-bg-subtle" />
        </div>
      </div>
    </div>
  );
}
