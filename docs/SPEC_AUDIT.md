# Spec Audit

Source reviewed: `C:/Users/vnthu/Downloads/ChatGPT-Med!Dent Study OS Tartu.md`.

## Implemented From Core Spec

- Next.js App Router, TypeScript strict, Tailwind, Drizzle, Neon, Zod, Recharts, TanStack Table, lucide-react and pnpm.
- Private single-user auth with owner email, bcrypt password hash and httpOnly session cookie.
- Protected private pages and export routes.
- Core database entities, Drizzle migrations and seed script.
- CRUD for study entities required by the MVP.
- Dashboard, exam command center, scoring engine, next-best-action engine and JSON/CSV export.
- README, `.env.example`, tests and TODO.

## Implemented From Extended Spec

- `/command` as mother command page.
- `/elite-index` with expanded strategic scoring.
- Life/elite database tables: Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, professional contacts, life admin items, portfolio items and strategic reviews.
- Error recurrence count and retest-oriented error destruction.
- Product Bible and Elise Start Guide.
- Low-data mode warning on Command.
- AI governance page with AI explicitly disabled in v1.

## Deliberately Not Implemented In V1

- AI cloud providers and OpenAI API, because the original product constraint says no AI in the first version.
- Calendar integration, file upload, PDFs, semantic search, notifications, scraping and email integration.
- Import create-only, because it needs a review/deduplication UI to avoid data loss.
- Advanced spaced repetition, Anki sync and local LLM workflows. These remain in `TODO.md`.
