import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { getOwnerSession } from "@/lib/auth/session";
import { getI18n } from "@/lib/i18n/server";

export default async function LoginPage() {
  const session = await getOwnerSession();

  if (session) {
    redirect("/command");
  }

  const { t, locale } = await getI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-page px-4 py-10">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-gradient-to-tl from-violet/6 to-transparent blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan/5 blur-[80px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(87,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(87,70,229,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_75%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <LoginForm
          locale={locale}
          copy={{
            title: t("login.title"),
            subtitle: t("login.subtitle"),
            username: t("login.username"),
            password: t("login.password"),
            submit: t("login.submit"),
            pending: t("login.pending"),
            language: t("language.label"),
          }}
        />
      </div>
    </main>
  );
}
