# ValgeMed

A private elite performance cockpit for ambitious medical and dentistry students in Estonia.

ValgeMed helps top students convert study effort into measurable exam readiness, error elimination, and sustainable high performance. It is not trying to beat AMBOSS, UWorld, Anki, Lecturio, Osmosis, or any other content platform. It sits above them as the command layer: what to do today, which error is blocking top performance, whether readiness is real, and when more study would reduce future output.

## What It Is

A private command cockpit for exam performance, active recall, error destruction, readiness gaps, energy integrity, research execution, and personal professional trajectory.

Everything should feed the Command page. The first question is always: what is the highest-leverage move now?

### What It Is Not

ValgeMed is not:

- a medical content library
- a QBank replacement
- a flashcard clone
- a public leaderboard
- a university surveillance tool
- a generic institutional dashboard
- a motivational app for average study tracking
- a mass SaaS product

No open access, no billing, no public ranking, no social comparison, no faculty analytics.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- Neon Postgres + Drizzle ORM
- Supabase Auth for login/session identity
- Zod server-side validators
- shadcn-style local UI, lucide-react, date-fns
- pnpm

## Auth

- Supabase Auth: Google OAuth + email/password
- New users require admin approval before accessing the private app
- Set the verified Supabase Auth UUID in `OWNER_USER_ID`

## Scoring Philosophy

The scoring engine is local, deterministic, and explainable. A low score produces a next action, not shame.

- Exam Readiness, Study Efficiency, Burnout Risk, Time Leverage
- Medical Mastery, Error Destruction, Energy Integrity
- Estonia Integration, Reputation Capital, Opportunity Capture
- Elite Performance Index: composite readiness, error, active recall, simulation, and energy score
- Readiness Gap: distance between current fatigue-adjusted readiness and the user's private target
- Passive Study Penalty: stronger when top performance mode is selected
- Critical Error Penalty: stronger when weakness tolerance is low or zero

## Product Layers

- **Command** - the center of the app: Today's Winning Move, exam threat, most dangerous blocker, readiness gap, energy warning, and one clear next action.
- **Elite Target Mode** - private target level, weakness tolerance, and exam strategy. This is self-mastery, not public ranking.
- **Performance Blockers** - recurring cognitive enemies such as misconception loops, active recall failure, careless mistakes, fatigue-linked accuracy drops, and old errors not retested.
- **Study OS** - subjects, exams, topics, sessions, reviews, quiz attempts, error logs.
- **Memory Engine** - active recall and spaced review using a simple local cadence.
- **Error Destruction** - every error becomes cause, correction, prevention rule, and retest.
- **Exam Performance Plans** - days remaining, readiness gap, high-risk topics, unresolved clusters, simulation status, 72h plan, recovery constraints, and final retest checklist.
- **Energy Integrity** - sleep, recovery, fatigue, food, movement.
- **Tartu / Estonia** - language, academic culture, documents, routine.
- **Reputation Capital** - reliability, good questions, useful work, follow-up, portfolio.
- **Opportunity Radar** - research, shadowing, mentorship, scholarships, volunteering, clinical exposure.
- **Research Pipeline** - research areas, literature gaps, scored hypotheses, manuscript stages, methodology risks.

## Approval Flow

1. User signs up via email/password or Google.
2. Profile is created with `approved = false`; redirected to `/pending-approval`.
3. Admin receives a push notification if configured.
4. Admin approves the user from `/admin/users`.
5. User is redirected to the app on the next polling cycle.

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Fill the required environment variables from `.env.example`.

## Database

1. Create a Neon project and copy the connection string as `DATABASE_URL`.
2. Run migrations:

```bash
pnpm db:migrate
pnpm db:seed
```

## Vercel Setup

1. Import the repository in Vercel.
2. Add all environment variables from `.env` or `.env.vercel`.
3. Enable Supabase Email auth. For local E2E, disable email confirmation or provide a service role key for test-user confirmation.
4. Deploy.

## Commands

```bash
pnpm dev           # development
pnpm build         # production build
pnpm lint          # linting
pnpm typecheck     # TypeScript
pnpm test          # Vitest
pnpm db:generate   # generate Drizzle migrations
pnpm db:migrate    # apply migrations
pnpm db:seed       # seed demo data
```

The live Groq canary is opt-in. Set `RUN_GROQ_CANARY=1` and supply a valid
`GROQ_API_KEY` through the environment or local `.env`, then run
`pnpm test tests/curriculum-import-canary.test.ts`.

## Bilingual UI

English (`en`) as default, Estonian (`et`) as secondary. Smart input and command copy should accept English and Estonian phrasing where practical.

## Implemented

- Drizzle schema, migrations, and seed script with realistic demo data.
- CRUD for study entities: subjects, exams, topics, study sessions, reviews, quiz attempts, error logs, daily logs, goals, tasks, identity notes.
- Local modules for Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, contacts, life admin, portfolio, strategic reviews.
- Responsive AppShell with sidebar, mobile drawer, top bar, language selector.
- `/command` as primary private command page, `/dashboard` as weekly overview, `/elite-index` with expanded scoring.
- Private Elite Target Mode settings on the user profile.
- Performance Blockers page derived from recurring errors and weak topics.
- Exam Performance Plan on exam detail pages.
- Scoring engine with local non-AI next-best-action logic.
- Export JSON/CSV/ZIP for private data and iCal export for deadlines.
- Optional AI tools with usage limits, guardrails, and user/admin-controlled caps.
- Text-only upload extraction for `.txt` and `.md`; raw files are not stored by the app.

## Privacy

- AI cloud providers are allowed, but calls are explicit user actions and are rate/cap limited.
- User-owned records must be scoped by `userId`.
- Any create/update that links a subject, topic, or exam must verify that the linked record belongs to the same user.
- Personal AI API keys are encrypted before storage when a server-side encryption secret is available.
- Personal data should only be sent to AI when the user intentionally runs an AI action.
- JSON, CSV, ZIP and iCal exports are protected behind authentication + approval.
- Uploads store extracted text and metadata only, not raw files.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Neon Postgres is configured through `DATABASE_URL`.

## Limitations

- Some low-level CRUD form labels are still legacy server component copy and should be moved into i18n dictionaries.
- Spaced repetition uses a simple explainable cadence, not SM-2.
- Scoring weights are versioned constants; Settings shows them but full persistence is not implemented.
- CSV export is one file with table sections.
- PDF extraction, semantic search, and Google Calendar push sync are not implemented.
- iCal export is implemented; Google Calendar sync should wait until storage/auth hardening is complete.

## Roadmap

Tracked in `TODO.md`.

## Security rollout

- Use the Supabase Auth UUID in OWNER_USER_ID. Confirm email ownership in production and check existing Neon administrator grants for accounts promoted by the previous email rule.
- Apply the Neon migrations to a disposable branch before production. Migration 0011 validates ownership of existing relations and aborts if records link across users. Review those records before retrying.
- Supabase is used for Auth. If an older installation still has the Supabase profiles table, review and apply supabase_approval_fix.sql there to remove end-user write permissions.
- Set CRON_SECRET to enable the scheduled retry. A push provider accepting a notification is the delivery milestone. Physical device receipt depends on the client.
- Text uploads support UTF-8 .txt and .md, up to 4 MB and 20 attempts per approved user per UTC day. Split larger source files before uploading.
- The Content Security Policy permits inline Next.js scripts and styles. Verify sign-in, Google Drive, microphone, and push on a preview deployment before rolling it out.
- Schedule node scripts/backup-db.mjs with PGSERVICE set to a PostgreSQL service definition and VALGEMED_BACKUP_DIR set to a protected, encrypted backup directory. The script checks the archive index before publishing the file. Restore with pg_restore --exit-on-error --no-owner --dbname=valgemed_restore backup.dump on a fresh isolated database, then verify migrations, table counts, and owner-scoped reads. Keep backup files out of Git. Verify Neon backup retention and run a restore exercise before enabling multiuser production.
