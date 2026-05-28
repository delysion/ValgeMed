import { Command } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";

export default async function TermsOfServicePage() {
  const { t } = await getI18n();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-page p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/20 via-bg-page to-cyan-bg/10" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet/5 blur-[120px]" />

      <div className="relative w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
            <Command className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Terms of Service
          </h1>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm">
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>Effective date: May 28, 2026</p>

            <h2 className="text-base font-semibold text-text-primary">
              1. Acceptance
            </h2>
            <p>
              By accessing or using ValgeMed, you agree to be bound by these
              Terms of Service. If you do not agree, do not use the service.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              2. Description
            </h2>
            <p>
              ValgeMed is a private performance cockpit for medical and
              dentistry students. It provides study tracking, exam preparation
              tools, and AI-assisted study features for personal academic use
              only.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              3. Private Access
            </h2>
            <p>
              Access to ValgeMed requires an approved account. This is a private
              app intended for legitimate personal use. Misuse, unauthorized
              access, or abuse of the platform will result in immediate account
              termination.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              4. Data Ownership
            </h2>
            <p>
              You retain full ownership of all data you create on ValgeMed. We
              do not claim any rights over your study data, exam records, or any
              personal content stored through the service.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              5. Acceptable Use
            </h2>
            <p>
              You agree to use ValgeMed only for lawful personal academic
              purposes. You may not reverse-engineer the platform, attempt
              unauthorized access, or use the service to harms others or
              facilitate academic dishonesty.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              6. No Warranty
            </h2>
            <p>
              ValgeMed is provided "as is" without any warranties. We do not
              guarantee uninterrupted availability, error-free operation, or
              that the service will meet your specific requirements.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              7. Changes
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              8. Contact
            </h2>
            <p>
              For questions regarding these terms, contact: kyranvnx@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
