"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
      <p className="text-sm text-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-gradient-to-br from-primary to-primary-ring px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}