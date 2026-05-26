# Spec Audit

Source reviewed: `C:/Users/vnthu/Downloads/ChatGPT-Med!Dent Study OS Tartu.md`.

This file records how the original private-console spec maps to the current app. It has been updated after the app moved from single-owner MVP to admin-approved multi-user mode.

## Implemented From Core Spec

- Next.js App Router, TypeScript strict, Tailwind, Drizzle, Neon, Zod, TanStack Table, lucide-react and pnpm.
- Supabase Auth with email/password and Google OAuth.
- Admin approval flow for every non-owner user.
- Protected private pages, APIs, server actions and export routes.
- Core database entities, Drizzle migrations and seed script.
- CRUD for study entities required by the MVP.
- Command, dashboard, exam command center, scoring engine, next-best-action engine and exports.
- README, `.env.example`, tests and TODO.

## Implemented From Extended Spec

- `/command` as mother command page.
- `/elite-index` with expanded strategic scoring.
- Life/elite database tables: Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, professional contacts, life admin items, portfolio items and strategic reviews.
- Research pipeline: areas, literature gaps, hypotheses, manuscripts and methodology risk records.
- Error recurrence count and retest-oriented error destruction.
- AI command tools with explicit user-triggered cloud/local calls, guardrails and usage limits.
- iCal export for exams, reviews, tasks, retests, contacts and opportunities.
- Text-only upload extraction for `.txt` and `.md`; raw files are not stored.

## Still Not Implemented

- PDF text extraction.
- Google Calendar push sync.
- Semantic search.
- Import review/deduplication UI.
- Advanced spaced repetition and Anki sync.
- Full authenticated E2E coverage with seeded approved users.
