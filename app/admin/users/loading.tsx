export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-subtle" />
      <div className="h-64 animate-pulse rounded-2xl bg-bg-subtle" />
    </div>
  );
}
