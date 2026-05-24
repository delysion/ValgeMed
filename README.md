# ValgeMed

A quiet command system for serious medical students.

ValgeMed is a private console for study, exams, memory, active recall, errors, energy, burnout prevention, Tartu integration, opportunities, reputation, portfolio, and long-term academic trajectory.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- Neon Postgres + Drizzle ORM
- Zod server-side validators
- shadcn-style local UI, lucide-react, date-fns
- npm

## Auth

- Supabase Auth (Google OAuth + Email/password)
- New users require admin approval before accessing the app
- Admin is set via `OWNER_EMAIL` env var

## Local Setup

```bash
npm install
cp .env.example .env
```

Fill in the required environment variables (see `.env.example` for all keys).

Run locally:

```bash
npm run dev
```

## Database Setup

1. Create a Neon project and copy the connection string as `DATABASE_URL`.
2. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Vercel Setup

1. Import the repository in Vercel.
2. Add all environment variables from `.env` (including Supabase, Neon, VAPID keys).
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
4. Enable Email auth provider in Supabase Dashboard (`Authentication → Providers → Email`, disable "Confirm email").
5. Deploy.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Bilingual UI

ValgeMed supports English (`en`) as default and Estonian (`et`). Language is persisted in a cookie and can be changed from the top bar, navigation drawer, or Settings.

## Privacy

- No personal data is sent to third-party AI services by default.
- JSON and CSV exports are available in Settings.
- All private pages and exports require authentication + approval.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.

## Approval Flow

1. User signs up via email/password or Google.
2. Profile is created with `approved = false`.
3. User is redirected to `/pending-approval`.
4. Admin receives a push notification (if browser push is configured).
5. Admin approves the user from `/admin/users`.
6. User is automatically redirected to the app on the next polling cycle.

## Features

- Subjects, exams, topics, study sessions, review items, error logs, daily logs, goals, identity notes.
- Tartu notes, time blocks, health logs, language progress, reputation, opportunities, contacts, life admin, portfolio, strategic reviews.
- Responsive AppShell with sidebar, mobile drawer, top bar, language selector.
- `/command` as primary private command page.
- `/dashboard` as weekly strategic overview.
- Scoring engine: Exam Readiness, Study Efficiency, Burnout Risk, Time Leverage, Elite Index, and more.
- Gamification: Elite Index, mastery badges, study quests, achievements, streak, momentum.
- Export JSON/CSV for study, goals, identity, life, and elite modules.

## Limitations

- Spaced repetition uses a simple cadence: tomorrow, +3, +7, +14, +30 days.
- No Anki import/export.
- No file upload, calendar integration, or semantic search.
- AI features are not implemented in the current version.

## Roadmap

Tracked in `TODO.md`.
