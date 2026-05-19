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
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <LoginForm
        locale={locale}
        copy={{
          title: t("login.title"),
          subtitle: t("login.subtitle"),
          password: t("login.password"),
          submit: t("login.submit"),
          pending: t("login.pending"),
          language: t("language.label"),
        }}
      />
    </main>
  );
}
