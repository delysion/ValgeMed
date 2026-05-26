"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Connection error</h2>
        <p className="text-sm text-text-secondary mb-6">
          Could not check your account status. The page will retry automatically.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-gradient-to-br from-primary to-primary-ring px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
