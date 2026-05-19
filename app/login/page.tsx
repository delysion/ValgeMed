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
      {/* Atmospheric background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-violet/[0.05] blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan/[0.04] blur-[100px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(87,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(87,70,229,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
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
