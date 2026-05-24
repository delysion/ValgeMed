# ValgeMed — User Manual

> A quiet command system for serious medical students.

---

## Table of Contents

1. [What ValgeMed Is](#1-what-valgemed-is)
2. [Getting Started](#2-getting-started)
3. [The Command Page](#3-the-command-page)
4. [Core Modules](#4-core-modules)
5. [The Scoring Engine](#5-the-scoring-engine)
6. [Daily Flow](#6-daily-flow)
7. [Weekly & Strategic Review](#7-weekly--strategic-review)
8. [Exporting Your Data](#8-exporting-your-data)
9. [Setting Up Local AI (Ollama)](#9-setting-up-local-ai-ollama)
10. [Tips & Best Practices](#10-tips--best-practices)
11. [Keyboard & Navigation](#11-keyboard--navigation)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What ValgeMed Is

ValgeMed is a **private command console** for medical students. It is not a study planner, a flashcard app, a habit tracker, or a motivational tool. It is a system that helps you:

- **Know what to do next** — every time you open it, it tells you the most important action.
- **Track everything that matters** — study hours, exam readiness, error history, energy, burnout risk, reputation, opportunities.
- **Destroy errors systematically** — every mistake becomes a permanent lesson.
- **Protect your energy** — because burnout is the real enemy.
- **Build your professional trajectory** — from Tartu to the clinic.

### Core Philosophy

- **Scores are signals, not judgements.** A low score produces a next action, not shame.
- **The system works for you, not the other way around.** You decide what matters.
- **Everything is private.** No data leaves your control unless you explicitly export it.

---

## 2. Getting Started

### Creating an Account

1. Go to the login page.
2. Choose either **Google Sign-In** or **Email + Password**.
3. After signing up, your account is **pending approval** by the administrator.
4. Once approved, you can access the full app.
5. On your first login, start by creating your first **Subject** and **Daily Log**.

### First Steps

1. **Open `/command`** — this is your home base. It shows what to do next.
2. **Add today's Daily Log** — sleep, energy, stress, study minutes.
3. **Create your first Subject** (e.g., "Cardiology", "Anatomy").
4. **Create Exams and Topics** under each subject.
5. **Add one Review Item** — something you want to remember.
6. **Log one Error** — a mistake you made. The system will help you destroy it.

---

## 3. The Command Page

The **Command Page** (`/command`) is the first thing you see after logging in. It answers one question:

> **What should I do right now?**

It shows:

- **Next Best Action** — a specific, actionable suggestion based on your data.
- **Today's Daily Log** — quick entry for sleep, energy, stress, study time.
- **Elite Index** — your composite strategic score.
- **Risk Alerts** — burnout risk, overdue reviews, weak topics.
- **Quick Links** — one-click access to reviews, errors, exams.

### Using the Command Page

1. Fill your Daily Log first (takes 10 seconds).
2. Read the Next Best Action.
3. Click the suggested module and start working.
4. When you finish a study session, log your method, focus, and energy.

---

## 4. Core Modules

### 4.1 Subjects, Exams & Topics (`/subjects`, `/exams`, `/topics`)

Organise your curriculum hierarchically:

- **Subject** — the broad domain (e.g., "Pathology").
- **Exam** — a specific exam (e.g., "Pathology Midterm").
- **Topic** — a focused area (e.g., "Inflammation").

For each exam, you can set a target date, track readiness, and generate a battle plan.

### 4.2 Study Sessions (`/study-sessions`)

Log every study session with:

- Duration and method (reading, flashcards, practice questions, group study).
- Focus level and energy level.
- Topics covered.
- Output quality (how well did you understand?).

Over time, this data powers your **Study Efficiency** score and helps identify what methods work best for you.

### 4.3 Reviews & Spaced Repetition (`/reviews`)

The review system uses a simple, explainable cadence:

- **Tomorrow** — first review.
- **+3 days** — second review.
- **+7 days** — third review.
- **+14 days** — fourth review.
- **+30 days** — fifth review.
- If confidence is very low, it resets to tomorrow.

Each review item has:

- **Question** — what you need to recall.
- **Answer** — the correct response.
- **Confidence** — high / medium / low.
- **Subject & Topic** — for context.
- **Tags** — for filtering.

### 4.4 Error Log (`/errors`)

This is one of the most important modules. Every error you make should be logged with:

- **Cause** — what led to the mistake.
- **Correction** — what the right answer is.
- **Prevention Rule** — what to do next time to avoid it.
- **Retest Date** — when to test yourself on this error.

The goal is **Error Destruction**: every error moves through stages — identified → corrected → prevented → destroyed.

### 4.5 Daily Log (`/daily-log`)

A quick daily check-in:

- Sleep hours and quality.
- Energy level (1-10).
- Stress level (1-10).
- Study minutes and active/passive split.
- Mood and notes.

This powers your **Energy Integrity** and **Burnout Risk** scores.

### 4.6 Goals (`/goals`)

Set short-term and long-term goals:

- Monthly study targets.
- Exam score goals.
- Habit-building goals (e.g., "review errors daily").
- Strategic goals (e.g., "get a research position").

Goals can be linked to subjects, exams, or personal development.

### 4.7 Identity / Aura (`/identity`)

Track your professional identity:

- Standards you hold yourself to.
- Discipline metrics.
- Boundaries.
- Professional image goals.
- Ambition statements.

### 4.8 Health & Energy (`/health`)

Beyond the daily log, track:

- Sleep patterns.
- Exercise and movement.
- Nutrition quality.
- Recovery days.
- Fatigue trends.

### 4.9 Tartu & Estonia (`/tartu`)

Specific to studying at the University of Tartu:

- Language progress (Estonian).
- Academic culture notes.
- Document management.
- Local routines.

### 4.10 Reputation (`/reputation`)

Track your professional reputation:

- Reliability evidence.
- Good questions asked.
- Useful work delivered.
- Follow-ups completed.
- Portfolio evidence.

### 4.11 Opportunities (`/opportunities`)

Track career opportunities:

- Research positions.
- Shadowing.
- Mentorship.
- Scholarships.
- Volunteering.
- Clinical exposure.

### 4.12 Network (`/network`)

Manage professional contacts:

- Name, role, institution.
- Meeting notes.
- Follow-up reminders.

### 4.13 Research (`/research`)

Organise your research work:

- Literature notes.
- Hypotheses tracking.
- Manuscript drafts and status.

### 4.14 Life Admin (`/life-admin`)

Track administrative tasks:

- Document deadlines.
- Application timelines.
- Bureaucratic tasks.

### 4.15 Portfolio (`/portfolio`)

Build your professional portfolio:

- Achievements.
- Projects.
- Publications.
- Presentations.

### 4.16 Strategic Review (`/strategic-review`)

A periodic (weekly/monthly) review of your entire trajectory. It helps you step back and assess:

- Are you moving toward your long-term goals?
- What needs to change?
- What is working?

---

## 5. The Scoring Engine

Every score in ValgeMed is **local, deterministic, and explainable**. You can always see what factors contribute to a score and how they are weighted.

### Scores

| Score | What It Measures |
|-------|-----------------|
| **Elite Index** | Composite strategic score — your overall trajectory. |
| **Exam Readiness** | How prepared you are for each exam. |
| **Study Efficiency** | How effectively you use study time. |
| **Burnout Risk** | How close you are to burnout (higher = more risk). |
| **Time Leverage** | How well you invest your time. |
| **Medical Mastery** | Depth and breadth of medical knowledge. |
| **Error Destruction** | How systematically you eliminate errors. |
| **Energy Integrity** | Sleep, recovery, and energy management. |
| **Estonia Integration** | Adaptation to Estonian academic life. |
| **Reputation Capital** | Professional reputation growth. |
| **Opportunity Capture** | How well you pursue opportunities. |

Each score page shows:
- The current value and trend.
- Contributing factors with weights.
- A caution note explaining limitations.
- A suggested next action if the score is low.

---

## 6. Daily Flow

### Ideal daily routine (under 60 seconds for logging)

1. **Open `/command`**.
2. **Fill today's Daily Log** — sleep, energy, stress, study minutes.
3. **Read the Next Best Action**.
4. **Start working** on the suggested module.
5. **At the end of a session**, log method, focus, energy, and output quality.

### End of day

1. Log any errors you made.
2. Add review items for new material.
3. Check tomorrow's suggested actions.

---

## 7. Weekly & Strategic Review

### Weekly (`/dashboard`)

Every week, review:

- Study volume and efficiency trends.
- Exam readiness changes.
- Error destruction progress.
- Energy and burnout trends.
- Goal progress.

### Strategic (`/strategic-review`)

Every month or quarter, do a deeper review:

- Are your goals still correct?
- What is your Elite Index trend?
- What strategic adjustments are needed?

---

## 8. Exporting Your Data

You can export your data as **JSON** or **CSV** from the Settings page.

Available exports:

- Study data (subjects, exams, sessions, reviews).
- Goals and tasks.
- Identity and life modules.
- Elite index and scores.

Exports are one-file downloads with section separation.

---

## 9. Setting Up Local AI (Ollama)

ValgeMed can work with a **local AI** running on your PC via [Ollama](https://ollama.ai). This keeps all data on your machine — no cloud calls.

### Step 1: Install Ollama

**Windows:**
1. Download from [ollama.ai](https://ollama.ai/download)
2. Run the installer.
3. Ollama runs as a background service.

**macOS / Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Pull a Medical Model

```bash
# Lightweight model (good for most laptops)
ollama pull llama3.2:3b

# Larger model (better quality, needs more RAM)
ollama pull llama3.2:8b

# Or a medical-specific model (if available)
ollama pull meditron
```

### Step 3: Verify Ollama is Running

Open your browser and go to: `http://localhost:11434`

You should see: `Ollama is running`

### Step 4: Configure ValgeMed for AI

In ValgeMed, go to **Settings → AI** and set:

- **AI Provider:** `Ollama (Local)`
- **Model:** The model you pulled (e.g., `llama3.2:3b`)
- **Endpoint:** `http://localhost:11434`

### Step 5: Using AI

Once configured, the `/ai` page becomes an **AI Command Studio** where you can:

- Ask questions about your study data.
- Get explanations of medical concepts.
- Generate summaries of your progress.
- Brainstorm study strategies.

All requests go to your local Ollama instance. Nothing leaves your PC.

### Troubleshooting Ollama

| Problem | Solution |
|---------|----------|
| Ollama not running | Open terminal, run `ollama serve` |
| Connection refused | Check Ollama is installed and running |
| Model not found | Run `ollama pull <model-name>` |
| Slow responses | Use a smaller model (3b instead of 8b) |
| High RAM usage | Close other applications, use 3b model |

---

## 10. Tips & Best Practices

### Start Small

Don't try to fill every module on day one. Start with:

1. Daily Log.
2. One subject with exams and topics.
3. Error log (when you make a mistake).
4. Reviews (when you learn something new).

### Be Consistent

- **Log every study session.** Even 10 minutes. This gives you accurate data.
- **Log every error.** The error destruction system is most powerful when complete.
- **Fill your daily log.** It takes 10 seconds and powers your energy and burnout scores.

### Trust the Scores, But Question Them

The scoring engine is a tool, not an oracle. If a score seems wrong, look at the contributing factors. You might have forgotten to log something, or the weight might not match your priorities.

### Use the Command Page

The Next Best Action is computed from your actual data. If you don't know what to do, start there.

### Review Weekly

The weekly dashboard helps you see patterns you might miss day-to-day. Is your energy dropping? Are you neglecting errors? Is exam readiness flat?

### Protect Your Energy

ValgeMed tracks burnout risk for a reason. If your Burnout Risk score is high, the system will suggest recovery — and you should listen.

### Export Regularly

Keep backups of your data. Export JSON periodically (Settings → Export).

---

## 11. Keyboard & Navigation

### Desktop Layout

- **Left sidebar:** Main navigation (all modules).
- **Top bar:** Theme toggle, language selector, export, logout.
- **Main area:** Content of the current module.

### Mobile Layout

- **Hamburger menu** (top left): Opens navigation drawer.
- **Top bar:** Same controls as desktop, in compact form.

### Keyboard

- Navigation is click-based. No keyboard shortcuts are implemented yet.

---

## 12. Troubleshooting

### Login Issues

| Problem | Solution |
|---------|----------|
| Can't log in | Check your email/password or use Google sign-in. |
| Account pending approval | Wait for admin approval. Check `/pending-approval` for status. |
| Forgot password | Click "Forgot password?" on the login form. A reset link will be sent to your email if SMTP is configured in Supabase. |

### Data Issues

| Problem | Solution |
|---------|----------|
| Scores seem wrong | Check contributing factors on the score page. You may need to log more data. |
| Missing data | Check you are logged into the correct account. Export are per-account. |
| Old data not appearing | Check date filters if available. Some views show only recent data. |

### Technical Issues

| Problem | Solution |
|---------|----------|
| Page not loading | Check your internet connection. Try refreshing. |
| Error 500 | The server encountered an error. Try again in a few minutes. |
| Changes not saving | Check your connection. Try refreshing and re-entering the data. |
| Language not switching | Clear cookies and refresh. The language is stored in a cookie. |

### Getting Help

If you encounter issues not covered here, contact the administrator.
