export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg-page p-4">
      <div className="w-full max-w-sm animate-pulse space-y-4">
        <div className="mx-auto h-10 w-32 rounded-lg bg-bg-subtle" />
        <div className="h-12 rounded-xl bg-bg-subtle" />
        <div className="h-12 rounded-xl bg-bg-subtle" />
      </div>
    </div>
  );
}
