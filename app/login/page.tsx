import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getOwnerSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getOwnerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(168,216,255,0.12),transparent_32rem),var(--background)] px-4">
      <LoginForm />
    </main>
  );
}
