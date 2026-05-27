<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from older Next.js versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ValgeMed Repo Guidance

## Product Philosophy

ValgeMed is a private elite performance cockpit for ambitious medical and dentistry students in Estonia.

It is not a medical content library, QBank replacement, public leaderboard, university surveillance tool, institutional SaaS dashboard, or social ranking product.

Everything should feed the Command page:

- Today's Winning Move
- current exam threat
- most dangerous open error cluster
- readiness gap to the private target
- burnout or energy warning
- one clear next action

Keep the tone minimal, sharp, serious, and private. Avoid childish gamification, public ranking, institutional analytics, and motivational-guru copy.

## Commands

Run the narrowest useful verification first, then broaden:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Database changes require:

```bash
pnpm db:generate
pnpm db:migrate
```

## Test Expectations

Add or update tests when touching:

- deterministic scoring
- next-best-action behavior
- Elite Target Mode
- burnout or recovery override logic
- exam readiness and simulation rules
- user ownership/security rules
- export behavior
- smart input parsing

## Privacy And Ownership Rules

- Private app pages must require an authenticated and approved user.
- All user-owned records must be scoped by `userId`.
- Any create/update using `subjectId`, `topicId`, or `examId` must verify the referenced record belongs to the current user.
- Admin views must avoid exposing unnecessary user data.
- Exports must only include the current user's records unless the route is explicitly admin-only.
- Do not store external AI API keys in plaintext.

## Deterministic Scoring Rules

Scoring must be explainable. Prefer functions that return:

```ts
{
  score: number;
  label: string;
  reasons: string[];
  penalties: string[];
  recommendedAction: string;
}
```

AI may assist, but the core exam plan, readiness gap, blockers, and next action must work without AI.

## No Public Ranking

Rank Mode means a private self-selected performance target. Never implement public leaderboards, social ranking between students, or faculty-style surveillance analytics.
