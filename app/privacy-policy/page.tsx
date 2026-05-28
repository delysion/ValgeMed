import { Command } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";

export default async function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm">
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>Effective date: May 28, 2026</p>

            <h2 className="text-base font-semibold text-text-primary">
              1. Data We Collect
            </h2>
            <p>
              ValgeMed stores and processes data you explicitly provide: study
              subjects, topics, exam records, study sessions, daily logs, and
              portfolio items. All data is stored in a secure Supabase database
              and accessed only by authenticated, approved users.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              2. Authentication
            </h2>
            <p>
              We use Supabase Auth for user authentication. Your email and
              password are handled exclusively by Supabase. We do not store
              passwords directly.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              3. Data Sharing
            </h2>
            <p>
              We do not sell, share, or transfer your personal data to third
              parties. Your data is accessible only to you and any accounts you
              explicitly authorize.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              4. AI Features
            </h2>
            <p>
              Interactions with the AI study copilot are privacy-aware and stay
              under your control. No study data is sent to external AI APIs
              unless you explicitly request it.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              5. Google Drive Integration
            </h2>
            <p>
              If you use the Google Drive Picker, your OAuth tokens are used
              solely to access files you explicitly select. We do not store or
              process your Google account data beyond the session.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              6. Cookies
            </h2>
            <p>
              We use essential cookies for session management and language
              preferences. No marketing or analytics cookies are used.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              7. Your Rights
            </h2>
            <p>
              You can export or delete your data at any time through the
              Settings page. Contact us at kyranvnx@gmail.com for any
              data-related requests.
            </p>

            <h2 className="text-base font-semibold text-text-primary">
              8. Contact
            </h2>
            <p>For privacy concerns, contact: kyranvnx@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
