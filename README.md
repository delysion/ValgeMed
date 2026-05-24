# ValgeMed

A quiet command system for serious medical students.

ValgeMed is not a SaaS. It is a private console for study, memory, errors, energy, identity, and strategic progression toward becoming a precise, calm, resilient clinician.

## What It Is

A private command cockpit for time, study, memory, exams, active recall, error destruction, health, energy, burnout prevention, Estonian language, Tartu integration, academic reputation, medical research, opportunities, professional contacts, life administration, and long-term trajectory.

It does not replace existing tools — it orchestrates them.

### What It Is Not

Not a study planner, Notion template, flashcard clone, habit tracker, motivational app, or AI chatbot. No public registration, no billing, no social features, no scraping.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- Neon Postgres + Drizzle ORM
- Zod server-side validators
- shadcn-style local UI, lucide-react, date-fns
- npm

## Auth

- Supabase Auth (Google OAuth + email/password)
- New users require admin approval before accessing the app
- Admin is set via `OWNER_EMAIL` env var

## Scoring Philosophy

The scoring engine is local and deterministic. Every score shows factors, weights, and a caution note. A low score produces a next action, not shame.

- Exam Readiness, Study Efficiency, Burnout Risk, Time Leverage
- Medical Mastery, Error Destruction, Energy Integrity
- Estonia Integration, Reputation Capital, Opportunity Capture
- **Elite Index** — composite strategic score

## Product Layers

- **Command** — one page that answers what to do next today.
- **Study OS** — subjects, exams, topics, sessions, reviews, quiz attempts, error logs.
- **Memory Engine** — active recall and spaced review using a simple local cadence.
- **Error Destruction** — every error becomes cause, correction, prevention rule, and retest.
- **Exam Battle Plans** — readiness, risk, weak topics, errors, simulations, last 7 days view.
- **Energy Integrity** — sleep, recovery, fatigue, food, movement.
- **Tartu / Estonia** — language, academic culture, documents, routine.
- **Reputation Capital** — reliability, good questions, useful work, follow-up, portfolio.
- **Opportunity Radar** — research, shadowing, mentorship, scholarships, volunteering, clinical exposure.

## Approval Flow

1. User signs up via email/password or Google.
2. Profile is created with `approved = false`; redirected to `/pending-approval`.
3. Admin receives a push notification (if configured).
4. Admin approves the user from `/admin/users`.
5. User is automatically redirected to the app on the next polling cycle.

## Local Setup

```bash
npm install
cp .env.example .env
```

Fill in the required environment variables (see `.env.example`). Then:

```bash
npm run dev
```

## Database

1. Create a Neon project and copy the connection string as `DATABASE_URL`.
2. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Vercel Setup

1. Import the repository in Vercel.
2. Add all environment variables from `.env` (Supabase, Neon, VAPID keys).
3. Enable Email auth in Supabase Dashboard (`Authentication → Providers → Email`, disable "Confirm email").
4. Deploy.

## Commands

```bash
npm run dev          # development
npm run build        # production build
npm run lint         # linting
npm run db:generate  # generate Drizzle migrations
npm run db:migrate   # apply migrations
npm run db:seed      # seed demo data
```

## Bilingual UI

English (`en`) as default, Estonian (`et`) as secondary. Language is persisted in a cookie and can be changed from the top bar, navigation drawer, or Settings.

## Implemented

- Drizzle schema, migrations, seed script with realistic demo data.
- CRUD for all study entities: subjects, exams, topics, study sessions, review items, error logs, daily logs, goals, tasks, identity notes.
- Local modules for Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, contacts, life admin, portfolio, strategic reviews.
- Responsive AppShell with sidebar, mobile drawer, top bar, language selector.
- `/command` as primary private command page, `/dashboard` as weekly overview, `/elite-index` with expanded scoring.
- Scoring engine with local non-AI next-best-action engine.
- Gamification: Elite Index, mastery badges, study quests, achievements, streak, momentum, error destruction states.
- Export JSON/CSV for study, goals, identity, life, and elite modules.

## Privacy

- No automatic AI cloud calls in the current version.
- No personal data is sent to AI services by default.
- JSON and CSV exports are protected behind authentication + approval.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Neon Postgres is configured through `DATABASE_URL`.

## Limitations

- Some low-level CRUD form labels are still legacy server component copy and should be moved into i18n dictionaries.
- Spaced repetition uses a simple explainable cadence (not SM-2).
- Scoring weights are versioned constants; Settings shows them but full persistence is not implemented.
- CSV export is one file with table sections.
- No file upload, exam import, calendar integration, PDF notes, or semantic search.
- No local or cloud AI execution is implemented.

## Roadmap

Tracked in `TODO.md`.
