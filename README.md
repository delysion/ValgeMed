# ValgeMed

A quiet command system for serious medical students.

ValgeMed is not a SaaS. It has no public registration, billing, social features, scraping, email integration, or automatic AI cloud workflow. It is a private console for study, exams, memory, active recall, errors, energy, burnout prevention, Tartu integration, opportunities, reputation, portfolio, and long-term academic trajectory.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- Neon Postgres + Drizzle ORM
- Zod server-side validators
- shadcn-style local UI, TanStack Table, Recharts, lucide-react, date-fns
- pnpm

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm auth:hash "choose-a-long-private-password"
```

Paste the generated value into `APP_PASSWORD_HASH` in `.env`.

Generate a session secret:

```bash
openssl rand -base64 32
```

Required environment variables:

```bash
DATABASE_URL=
OWNER_EMAIL=
APP_PASSWORD_HASH=
SESSION_SECRET=
```

Run locally:

```bash
pnpm dev
```

## Neon Setup

1. Create a Neon project.
2. Copy the Postgres connection string.
3. Set it as `DATABASE_URL`.
4. Run migrations and seed data:

```bash
pnpm db:migrate
pnpm db:seed
```

## Vercel Setup

1. Import the repository in Vercel.
2. Add the environment variables:
   - `DATABASE_URL`
   - `OWNER_EMAIL`
   - `APP_PASSWORD_HASH`
   - `SESSION_SECRET`
3. Run `pnpm db:migrate` before first use.
4. Deploy.

The session cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm test
```

## Private Auth

- There is no user registration.
- The only entry point is `/login`.
- The password is never stored in plain text.
- Generate `APP_PASSWORD_HASH` with:

```bash
pnpm auth:hash "password"
```

If `APP_PASSWORD_HASH` or `SESSION_SECRET` are missing, login shows a clear configuration error.

## Bilingual UI

ValgeMed supports:

- English (`en`) as the default language.
- Estonian (`et`) as the secondary language.

The i18n structure lives in:

```text
lib/i18n/
  config.ts
  actions.ts
  server.ts
  useTranslation.tsx
  dictionaries/
    en.ts
    et.ts
```

Language can be changed from:

- the desktop top bar,
- the mobile navigation drawer,
- the Settings page.

The selected language is persisted in the `valgemed_language` cookie and mirrored to `localStorage` as a fallback. Server-rendered pages read the cookie first, so protected routes render in the selected language without a client-side flash.

## AI Governance

The `/ai` page is an optional AI Command Studio. In v1 it is a privacy-conscious packet preview, not an automatic AI integration.

AI packet payloads include:

```json
{
  "language": "en"
}
```

The prompt rule is:

```text
Respond in the selected UI language. Keep medical terminology precise. Do not invent facts.
```

Medical and scientific terminology may remain in English or Latin where appropriate.

## Privacy

- No automatic AI cloud calls in v1.
- No personal data is sent to AI services by default.
- JSON and CSV exports are available in Settings and protected API routes.
- All private pages and exports require the owner session.
- Neon Postgres is configured through `DATABASE_URL`.

## Implemented

- Drizzle schema and migrations.
- Seed script with realistic demo data.
- Single-user login and logout.
- CRUD for subjects, exams, topics, study sessions, review items, error logs, daily logs, goals, tasks, and identity notes.
- Local modules for Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, contacts, life admin items, portfolio items, and strategic reviews.
- Premium AppShell with responsive sidebar, mobile drawer, top bar, and language selector.
- `/command` as the primary private command page.
- `/dashboard` as weekly strategic overview.
- `/elite-index` with central score, history, components, and ethical suggestions.
- `/exams` and `/exams/[id]` as exam cards and Exam Battle Room.
- `/topics`, `/errors`, `/study`, `/health`, `/language`, `/opportunities`, `/reputation`, `/portfolio`, and `/ai` redesigned around state, risk, progress, and next move.
- Local scoring engine: Exam Readiness, Study Efficiency, Burnout Risk, Time Leverage, Medical Mastery, Error Destruction, Energy Integrity, Estonia Integration, Reputation Capital, Opportunity Capture, and Elite Index.
- Non-AI next best action engine.
- Elegant gamification: Elise Elite Index, mastery badges, study quests, achievements, command streak, momentum, and error destruction states.
- Export JSON/CSV for study, goals, identity, life, and elite modules.
- Minimal tests for scoring, validators, and scheduling.

## Known Limits

- Some low-level CRUD form labels are still legacy server component copy and should be moved fully into the i18n dictionaries in a follow-up.
- Spaced repetition uses a simple explainable cadence: tomorrow, +3, +7, +14, +30 days, with tomorrow again for very low confidence.
- Scoring weights are versioned constants in `lib/scoring/engine.ts`; Settings shows them, but full persistence is not implemented yet.
- CSV export is one file with table sections.
- No file upload, exam import, calendar integration, PDF notes, push notifications, or semantic search.
- No local or cloud AI execution is implemented in v1.

## Future Roadmap

The future roadmap is tracked in `TODO.md`.
