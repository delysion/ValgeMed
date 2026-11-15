# Architecture

ValgeMed is a private, admin-approved multi-user Next.js application.

## Boundaries

- UI, server components, route handlers and server actions live in Next.js App Router.
- Authentication uses Supabase Auth with cookie-based SSR helpers.
- Approval and admin authorization are stored in the `profiles` table.
- The database is Neon Postgres accessed through Drizzle ORM.
- Private pages are gated by `proxy.ts`; mutating server actions and sensitive route handlers also require approved users.
- Export routes and AI/upload/push APIs are protected behind authentication plus approval.

## Security Notes

- Users can sign in, but cannot access private functionality until an admin approves them.
- `OWNER_USER_ID` grants owner access to the matching authenticated UUID.
- Server actions use approval-aware auth helpers to avoid bypassing the proxy through direct POST calls.
- `/api/admin/notify-pending` is an internal side-effect route and requires an internal token header.
- AI cloud providers are permitted only for explicit user-triggered actions with usage limits.
- Uploads are text extraction only; raw files are not stored by the app.
- Supabase sessions should not be authorized through editable user metadata.

## Scoring

The scoring engine is heuristic, local and explainable. Every score returns factors, weights and a caution note. Scores are strategic signals, not objective truth.

## Product Modules

- `/command` uses targeted page data and decides the next best action.
- `/elite-index` uses targeted scoring data instead of loading every table.
- `/research` is a paper-production pipeline: areas, gaps, hypotheses, manuscripts and methodology risks.
- `/timeline` and `/api/export/ical` provide calendar views/export.
- `/ai` supports explicit AI actions with guardrails; no silent background calls.
- Life/strategy modules use the same approved-user data boundary.
