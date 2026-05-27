# Elite Performance Mode

ValgeMed is a private performance cockpit for ambitious medical and dentistry students in Estonia. It is built for students who already have learning resources and need a sharper command layer above them.

## ValgeMed Is Not

- a medical content library
- a QBank replacement
- a public leaderboard
- a university surveillance tool
- a mass SaaS dashboard
- a social ranking system
- a generic motivational tracker

## ValgeMed Is

- a private performance cockpit
- an error-destruction system
- an exam-readiness engine
- a cognitive overtraining guard
- a command layer above Anki, AMBOSS, UWorld, Lecturio, Osmosis, lectures, notes, and local study materials

## Command-First Rule

Every major feature should feed the Command page. The Command page must answer:

1. What is Today's Winning Move?
2. What is the current exam threat?
3. What is the most dangerous open error cluster?
4. What is the readiness gap to the user's private target?
5. Is burnout or fatigue making more study harmful?
6. What is the one clear next action?

If a feature cannot improve one of those answers, it should be questioned.

## Elite Target Mode

Elite Target Mode is private and user-scoped. It never creates public rank, social comparison, or faculty analytics.

- `targetLevel`: `pass`, `strong`, `top_10`, `top_5`, `top_1`
- `weaknessTolerance`: `normal`, `low`, `zero`
- `examStrategy`: `conserve`, `balanced`, `push`, `kill_errors`, `simulate`

The mode changes deterministic scoring:

- `top_1` penalizes passive reading harder.
- `zero` weakness tolerance promotes unresolved critical errors.
- `simulate` promotes exam-format simulation near exams.
- high burnout risk overrides study and recommends recovery.

## Performance Blockers

The "Enemy List" means cognitive enemies, not people. Examples:

- recurring misconception
- topic confusion
- passive recognition but active recall failure
- question-format failure
- accuracy drop after fatigue
- avoided topic
- repeated careless mistake
- old error not retested

Each blocker should have severity, recurrence, last seen, required action, and status.

## Exam Performance Plan

Exam plans must be deterministic before AI is used. Each plan should expose:

- days remaining
- readiness and readiness gap
- high-risk topics
- unresolved error clusters
- active recall coverage
- simulation status
- 72h pre-exam plan
- recovery constraints
- final retest checklist

## Burnout As Performance Control

Burnout is not framed as weakness. It is a performance protection signal.

When fatigue, stress, sleep, or energy indicate high risk, ValgeMed should lower intensity and recommend recovery, light review, or short active recall. The explicit warning is:

> More study right now may reduce tomorrow's performance.

## Privacy Rules

- Private pages require authenticated and approved users.
- Every user-owned record must be scoped by `userId`.
- Create/update operations must verify linked `subjectId`, `topicId`, and `examId` belong to the current user.
- Exports must not include other users' data.
- AI calls must be explicit user actions and cap-limited.
- BYOK API keys must not be stored in plaintext.
