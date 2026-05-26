# Product Bible

## North Star

ValgeMed is a private, admin-approved multi-user operating system for serious medical students. It is not a public SaaS, social product, or motivational toy. It is a quiet command console for study, memory, errors, energy, identity, research, life administration, and strategic progression.

The app should help each approved user become a precise, calm, resilient and ambitious future clinician: strong recall, high-quality exam preparation, low wasted effort, protected energy, and a professional identity built through repeated small decisions.

## Non-Negotiables

- Multi-user only through explicit admin approval.
- No open public access.
- No billing.
- No social features.
- AI cloud is allowed only as an explicit user action with usage limits, guardrails, and reviewable output.
- No invasive tracking.
- Authorization data lives in the database, not editable user metadata.
- Private pages, APIs, exports and mutating server actions require an approved user.
- Scores are strategic signals, not objective truths.

## Product Layers

- Command: one page that answers what to do next today.
- Study OS: subjects, exams, topics, sessions, reviews, quiz attempts and error logs.
- Memory Engine: active recall and spaced review, using a simple local cadence.
- Error Destruction: every error should become cause, correction, prevention rule and retest.
- Exam Battle Plans: readiness, risk, weak topics, errors, simulations and last 7 days view.
- Research Pipeline: research areas, literature gaps, hypotheses, manuscripts and methodology risks that help produce real paper outputs.
- Time Capital: planned vs actual time, leverage and energy cost.
- Energy Integrity: sleep quality, recovery, fatigue, food and movement.
- Tartu / Estonia: language, academic culture, documents and routine.
- Identity / Aura: standards, discipline, boundaries, ambition and professional image.
- Reputation Capital: quiet reliability, good questions, useful work, follow-up and portfolio evidence.
- Opportunity Radar: research, shadowing, mentorship, scholarships, volunteering and clinical exposure.

## Scoring Philosophy

The scoring engine is local and deterministic. Every score must show factors, weights and a caution note. A low score should produce a next action, not shame.

## AI Policy

AI can be local or cloud-backed. The product rule is not "no cloud"; it is explicit intent, minimal context, usage caps, medical guardrails, and no silent background AI calls. AI assists drafting, analysis and study organization; it must not become diagnosis, treatment advice, clinical decision support, or automatic personal-data exfiltration.

## Upload Policy

Uploads are text extraction only. The app stores extracted text and metadata in the user's private database records; it does not store raw files. PDF extraction is not implemented yet. Users should keep archival originals in their own Drive/OneDrive.

## Calendar Policy

iCal export is the current calendar integration. Google Calendar push sync should wait until auth/storage hardening and consent UX are stronger.

## UI Tone

Dark, nordic, clinical, private, dense but readable. The interface should feel like a professional console, not a startup landing page, social app, influencer habit tracker or generic gamified productivity toy.
