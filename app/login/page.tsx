import { redirect } from "next/navigation";
import { Command } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/command");
  }

  async function loginWithGoogle() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-page p-4 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/20 via-bg-page to-cyan-bg/10" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-cyan/5 blur-[80px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center motion-premium">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
            <Command className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">ValgeMed</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            A quiet command system for serious medical students.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm motion-stagger-1">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Multi-user system. Sign in with your Google account.
        </p>
      </div>
    </div>
  );
}
