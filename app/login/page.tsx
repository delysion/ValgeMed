import { Command, Brain, TrendingUp, Shield } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";
import { LoginForm } from "./form";

function getFeatures(t: (key: string, params?: Record<string, string | number>) => string) {
  return [
    { icon: Brain, text: t("login.feature1") },
    { icon: TrendingUp, text: t("login.feature2") },
    { icon: Shield, text: t("login.feature3") },
  ];
}

export default async function LoginPage() {
  const { t } = await getI18n();
  const features = getFeatures(t as (key: string) => string);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-page p-4 overflow-hidden">
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
            {t("app.tagline")}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm motion-stagger-1">
          <LoginForm />

          <div className="mt-4 text-center">
            <p className="text-xs text-text-muted">
              {t("login.freeForever")}
            </p>
          </div>
        </div>

        <p className="mt-5 text-center">
          <a
            href="https://gamma.app/docs/Your-Private-Performance-Command-Centre-jzo7ad5xrfm6hsv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-ring transition-colors underline underline-offset-4"
          >
            Documentation
          </a>
        </p>

        <div className="mt-8 grid gap-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-bg-surface/50 p-3 border border-border/40"
            >
              <feature.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-text-secondary">{feature.text}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-muted">
          {t("login.termsAgreement")}{" "}
          <a href="/terms-of-service" className="text-primary hover:underline">{t

("login.termsOfService")}</a>{" "}
          {t("common.or")}{" "}
          <a href="/privacy-policy" className="text-primary hover:underline">{t("login.privacyPolicy")}</a>
        </p>
      </div>
    </div>
  );
}
