export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-subtle" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-bg-subtle" />
        ))}
      </div>
    </div>
  );
}
