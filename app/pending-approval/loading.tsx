import { Hourglass } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
          <Hourglass className="h-8 w-8 text-white" />
        </div>
        <div className="h-7 w-56 animate-pulse rounded-lg bg-bg-subtle mx-auto mb-2" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-bg-subtle mx-auto" />
      </div>
    </div>
  );
}
