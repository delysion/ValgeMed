import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
          <span className="text-2xl font-bold text-white">404</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary mb-8 text-sm leading-relaxed">
          This page doesn&apos;t exist or has been moved. Use the navigation menu to find your way.
        </p>
        <Link
          href="/command"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-ring px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
        >
          Go to Command Center
        </Link>
      </div>
    </div>
  );
}