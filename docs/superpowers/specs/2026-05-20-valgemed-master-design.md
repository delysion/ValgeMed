# ValgeMed — Master Design Spec

> Data: 2026-05-20 (revisione 1)
> Nome pubblico: ValgeMed — "A quiet command system for serious medical students."
> Nome interno: ELISE OS
> Fonti: PRODUCT_BIBLE.md, VISUAL_RESCUE_PLAN.md, documento fondatore
> Competenze integrate: frontend-design, web-design-guidelines, shadcn, vercel-react-best-practices, vercel-composition-patterns, next-best-practices

---

## 0. Identita

**Non stiamo costruendo:**
study planner, Notion template, flashcard clone, habit tracker, motivational app, AI chatbot generico.

**Stiamo costruendo:**
Un private command cockpit per tempo, studio, memoria, esami, active recall, error destruction, salute, energia, burnout prevention, lingua estone, integrazione Tartu, reputazione accademica, opportunita, contatti professionali, life administration, traiettoria a lungo termine.

**Formula madre:**
Capture → Diagnose → Command → Execute → Review → Compound

---

## 1. Direzione Visiva

**Dark Nordic Clinical Cockpit — default e identita principale.**

- **Background:** `#0B0B14` (graphite black)
- **Surface:** `#151528` (deep gray)
- **Elevated:** `#1E1E38` (panel gray)
- **Primary:** `#8B7BF7` (cold violet glow)
- **Secondary:** `#38D9F0` (muted blue/cyan accent)
- **Text primary:** `#F0F0F8` (ice white)
- **Text secondary:** `#A8A8C0` (cool gray)
- **Danger:** `#BE123C` (blood red — solo per rischio urgente)
- **Success:** `#4ADE9A` (muted emerald)
- **Font:** Geist Sans + Geist Mono

**Light Mode — opzione secondaria, non co-protagonista.**
Esiste, e funzionale, ma il brand e il dark cockpit. Il light mode e un alternate theme, non l'identita.

**Design Code:**
```
graphite black   →  sfondo
deep gray        →  pannelli
ice white        →  tipografia
muted blue       →  accenti secondari
cold violet      →  accenti primari
blood red        →  solo rischio urgente
```

**Cosa EVITARE:**
- generic SaaS gradients
- cheerful colors
- childish gamification
- motivational fluff
- productivity-bro aesthetic
- mascots
- purple-on-white startup look

---

## 2. Design System — Design Tokens

### 2.1 Dark Mode (default)

```css
.dark {
  --bg-page: #0B0B14;
  --bg-surface: #151528;
  --bg-subtle: #1E1E36;
  --bg-elevated: #1E1E38;
  --text-primary: #F0F0F8;
  --text-secondary: #A8A8C0;
  --text-muted: #6E6E8A;
  --text-muted-2: #3D3D58;
  --border: #2A2A48;
  --border-light: #222240;
  --border-strong: #35355A;

  --primary: #8B7BF7;
  --primary-soft: #1E1B4B;
  --primary-ring: #6E62F5;
  --primary-glow: rgba(139, 123, 247, 0.18);

  --cyan: #38D9F0;
  --cyan-bg: #0A2E3A;
  --danger: #BE123C;
  --danger-bg: #4C0519;
  --success: #4ADE9A;
  --success-bg: #064E3B;
  --warning: #FCD34D;
  --warning-bg: #451A03;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.18);
  --shadow-elevated: 0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.25);
  --shadow-premium: 0 20px 50px rgba(0,0,0,0.45);
  --shadow-hero: 0 24px 64px rgba(139,123,247,0.18);
}
```

### 2.2 Light Mode (alternate)

```css
:root {
  --bg-page: #F7F5F0;
  --bg-surface: #FEFDFB;
  --bg-subtle: #F2EFE9;
  --text-primary: #111122;
  --text-secondary: #4A4A5C;
  --text-muted: #8A8A9A;
  --primary: #5746E5;
  --primary-soft: #EDE9FE;
  /* ... invariato dall'esistente ... */
}
```

### 2.3 Tipografia — Gerarchia

- Display/Hero: `text-3xl sm:text-4xl font-bold tracking-tight`
- Heading: `text-xl sm:text-2xl font-semibold tracking-tight`
- Subheading: `text-lg font-semibold`
- Body: `text-sm leading-relaxed`
- Label: `text-xs font-medium uppercase tracking-[0.08em]`
- Caption: `text-xs text-text-muted`
- **Mai** `text-[9px]` o `text-[10px]`. Minimo `text-xs` (12px).
- `tabular-nums` su colonne numeriche e score
- `text-balance` su headings

### 2.4 Border Radius — Standard

- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-xl` (12px)
- Inputs: `rounded-lg` (8px)

### 2.5 Spacing — Standard

- Page padding: `px-4 sm:px-6 lg:px-8`
- Card padding: `p-5 sm:p-6`
- Section gap: `gap-6`

---

## 3. Navigazione

### 3.1 Struttura

4 sezioni collassabili. Solo una aperta alla volta. Stato salvato in cookie `valgemed_nav`.

**Command** (centro):
Command, Dashboard, Elite Index, Strategic Review

**Study:**
Subjects, Exams, Topics, Study, Reviews, Errors

**Life:**
Goals, Memory, Identity, Tartu, Time, Health, Language

**Strategy:**
Opportunities, Reputation, Network, Life Admin, Portfolio, AI, Settings

### 3.2 Desktop
- Sidebar fissa `w-64`, `border-r border-border`
- Header: brand icon (cold violet gradient) + "ValgeMed" + "Private Command"
- Active link: left accent bar (3px primary) + `bg-primary-soft/50`

### 3.3 Mobile
- Sheet drawer via hamburger button
- Stessa struttura accordion
- `w-[min(88vw,300px)]`

### 3.4 Skip Link
Skip-to-main-content nascosto, primo elemento focusabile.

---

## 4. Gamification — Segnali Strategici, Non Vanity

**RIMOSSO:** Level 1-100, XP bar, daily streak counter, achievement badge gamificati, mission progress bar.

**MANTENUTO:**
- **Elite Index Score Ring** — visualizzazione circolare animata del punteggio composito. Colore primario. Non e vanity: e un segnale diagnostico.
- **Error Destruction Counter** — "87 errors destroyed." Non e un badge: e una metrica clinica.
- **Readiness indicators** — color-coded (danger/warning/success) su exam readiness, burnout risk, energy integrity. Segnali, non ricompense.

**Principio:** Ogni elemento visivo deve rispondere a "cosa devo fare ora?" non a "quanto sono bravo?".

---

## 5. Microcopy — Tone

Il tone e: **cold, precise, elegant, non-motivational.**

Frasi guida:
- "Readiness is not confidence."
- "Fix the error before expanding the map."
- "No passive rereading today."
- "Recovery is strategic when accuracy is falling."
- "Estonia rewards quiet reliability."
- "The next move is the one that compounds."
- "This is a strategic signal, not objective truth."
- "Every error must become cause, correction, prevention rule, and retest."

---

## 6. Pagine — Struttura Completa

### 6.1 /command (LA PAGINA PIU IMPORTANTE)
Il centro dell'app. Deve rispondere: "What is the highest-return move now?"

Sezioni:
- Elite Index score ring
- Today's Command
- Next Best Action
- Highest-risk exam
- Weakness to destroy
- Energy warning
- Time leverage today
- Opportunity to capture
- Reputation move
- Language move
- Life admin risk
- Strategic Rule of the Day

Tone: sobrio, immediato, actionable. Zero clutter.

### 6.2 /dashboard
Overview strategica settimanale:
- Today's Command (cross-link a /command)
- Exam Readiness overview
- Due Reviews counter
- Open Errors counter
- Active vs Passive Study ratio
- Burnout Risk indicator
- Weekly Study Quality chart
- Weak Topics list
- Recent Activity log

### 6.3 /elite-index
Scomposizione del punteggio:
- Elise Elite Index trend chart
- Medical Mastery
- Exam Readiness
- Time Leverage
- Error Destruction
- Energy Integrity
- Estonia Integration
- Reputation Capital
- Opportunity Capture
- Disclaimer: "This is a strategic signal, not objective truth."

### 6.4 /exams + /exams/[id]
Exam Battle Room:
- Exam Command Center
- Readiness breakdown per topic
- Topics linked
- Errors linked
- Quiz attempts
- Last 7 days plan
- Last 48 hours plan
- Minimum viable pass plan
- Maximum excellence plan

### 6.5 /errors
Error Destruction table:
- Severity (high/medium/low)
- Recurrence count
- Retest date
- Resolved/Unresolved
- Cause, Correction, Prevention Rule, Retest

### 6.6 /subjects, /topics
CRUD standard per materie e argomenti.

### 6.7 /study, /study-sessions
Sessioni di studio, metodi, durata, efficienza.

### 6.8 /reviews
Active recall e spaced repetition. Cadence semplice: tomorrow, +3, +7, +14, +30.

### 6.9 /time
Time Leverage dashboard:
- Deep Work vs Passive Study vs Wasted Time
- Recovery time
- Time Blocks CRUD
- Time Leverage Score

### 6.10 /health
Energy Integrity dashboard:
- Sleep quality, durata
- Stress level
- Cognitive fatigue
- Recovery
- Movement
- Burnout Risk signal

### 6.11 /language
Estonian progress tracking:
- Medical terminology
- Speaking confidence
- Vocabulary sessions log
- Language history

### 6.12 /tartu
Tartu-specific notes e integrazione locale.

### 6.13 /goals, /memory, /identity
Goal tracking, memory vault, identity notes.

### 6.14 /opportunities
Opportunity Radar:
- Deadlines
- Value assessment
- Effort required
- Strategic upside
- Next action

### 6.15 /reputation
Reputation Capital:
- Quiet contributions
- Reliability signals
- Professor interactions
- Academic contribution log

### 6.16 /network
Professional contacts:
- Professors, senior students, doctors/dentists, mentors
- Respectful follow-up dates
- Contact notes

### 6.17 /life-admin
Life Administration:
- Documents, housing, university tasks
- Money, appointments, food/logistics
- Overdue admin risks

### 6.18 /strategic-review
Strategic reviews (weekly, monthly, semester):
- What improved
- What declined
- What to cut
- What to double
- Next elite move

### 6.19 /portfolio
Portfolio tracking:
- Exam results, projects, presentations
- Volunteering, certificates
- Clinical exposure, recommendations

### 6.20 /ai
AI Command Studio:
- Provider status indicator
- Cloud AI warning (no auto-send)
- AI Packet copy/paste (Modalita C)
- Daily Command Generator
- Semester Domination Plan
- Payload preview
- Result preview
- Save after confirmation
- 5 modalita: Online, None, Packet, LM Studio, Ollama

### 6.21 /settings
Settings + Import/Export:
- Theme toggle (dark/light)
- Language selector (EN/ET)
- Export JSON, Export CSV
- Import CSV/JSON
- Full backup
- Privacy warning

---

## 7. AI — 5 Modalita

### Modalita A — AI Online (default configurabile)
Provider: Gemini / OpenRouter / Groq. API key configurate via env vars. AI assiste, non decide. Preview obbligatoria prima del salvataggio.

### Modalita B — Senza AI (`AI_PROVIDER=none`)
Scoring e Next Best Action sono deterministici. L'app funziona completamente senza AI.

### Modalita C — AI Packet (zero API, zero installazioni)
Utente clicca "Copy for ChatGPT", incolla nel suo ChatGPT/Gemini personale, copia la risposta, incolla in ValgeMed, salva.

### Modalita D — LM Studio (locale, opzionale)
Server locale OpenAI-compatible su `http://localhost:1234/v1`.

### Modalita E — Ollama (locale, opzionale)
`ollama pull llama3.2` + `ollama serve`. Endpoint configurabile.

**Principio:** Nessun dato personale inviato automaticamente al cloud. Ogni pacchetto AI deve essere esplicito, revisionabile e minimo.

---

## 8. Loading States — Skeleton System

### 8.1 Componente Skeleton (NUOVO)
`components/ui/skeleton.tsx`:
- Props: `className`, `variant` ("text" | "circular" | "rectangular")
- Animazione shimmer usando `skeleton-pulse` keyframe

### 8.2 Skeleton Layouts
- **Command:** greeting skeleton + score ring skeleton + card grid skeleton
- **Dashboard:** hero skeleton + metric card skeleton + chart skeleton
- **Exam Battle Room:** header skeleton + table/card skeleton
- **Entity lists:** card list skeleton (3-5 items)

---

## 9. UI Components

### 9.1 Button
- Varianti: default, destructive, outline, ghost, muted
- Hover: `shadow-sm shadow-primary/10`
- Active: `scale-[0.97]`, `transition-all duration-150`
- Focus-visible: `ring-2 ring-primary/40 ring-offset-2 ring-offset-bg-page`
- Icon buttons: `aria-label` obbligatorio

### 9.2 Card
- Padding standard: `p-5 sm:p-6` su `CardContent`
- Variante `premium` con `border-border/50 shadow-card`
- `card-hover` class per hover lift (`translateY(-3px)` + `shadow-elevated`)

### 9.3 Badge
- Sizing standard: `text-xs px-2 py-0.5` per tutte le varianti
- Varianti: default (cyan), violet, muted, danger, warning, success, outline

### 9.4 Input
- Focus ring: `ring-2 ring-primary/25`
- Placeholder: `text-text-muted-2` con esempio concreto
- `aria-invalid` + `border-danger` su errore
- `autocomplete` appropriato

### 9.5 Skeleton (NUOVO)
Vedi Sezione 8.

### 9.6 GlassCard
- `p-6` come padding default
- Tone system: `tone="primary" | "neutral"` per bordo sinistro colorato
- Hover: `shadow-elevated` + `translateY(-2px)`

### 9.7 MetricCard
- Desktop: layout stacked
- Mobile (`< sm`): layout orizzontale (icon left, value + label right)
- Prop `trend` opzionale: freccia + percentuale

### 9.8 EmptyState
- Animazione pulse sull'icona
- Titolo + description + CTA button
- `bg-subtle` invece di `bg-surface`
- Varianti: "no-data", "no-results", "first-time"

### 9.9 SectionHeader
- Tipografia standardizzata
- Icon visibility migliorata (colore non muted-2)

---

## 10. Forms & Microcopy

Ogni form field:
- Label chiara e descrittiva
- Placeholder con esempio reale, terminante con `...`
- Helper text opzionale che spiega perche il campo esiste
- Error message inline con fix suggerito
- Submit button con stato loading + testo dinamico ("Creating..." / "Saving...")

---

## 11. Mobile Strategy

- `sm:640px` — metric cards diventano horizontal
- `md:768px` — tabelle → card-list, Sheet nav
- `lg:1024px` — sidebar fissa
- `xl:1280px` — max-width 1440px

Ogni pagina testata a: 360, 390, 430, 768, 1024, 1280, 1440.

MetricCard: layout orizzontale a `< sm`. Tabelle: card-list a `< md`. Form: single column, full-width, touch target >= 44px. Hero: layout compatto. Page padding: `px-4` consistente a mobile.

---

## 12. Performance (vercel-react-best-practices)

- `Promise.all()` per fetch parallele indipendenti
- `Suspense` boundaries su data-heavy pages
- `next/dynamic` per chart components (recharts)
- Import diretti, no barrel files
- `startTransition` per navigation non-urgente
- Ternary (`? :`) non `&&` per conditional rendering
- `content-visibility: auto` per liste lunghe

---

## 13. Accessibilita

- Icon buttons: `aria-label` obbligatorio
- Form labels: `<label htmlFor>` su ogni `<input>`
- Focus visible: `focus-visible:ring-2` sempre. Mai `outline-none` senza rimpiazzo
- Skip link nel layout
- Heading hierarchy: h1 > h2 > h3 > h4
- `scroll-margin-top` su heading anchors
- `aria-live="polite"` per toast e loading changes
- Semantic HTML: `<button>`, `<a>`/`<Link>`, `<table>`
- `color-scheme: dark` su `<html>` (dark mode default)
- `touch-action: manipulation` su button
- `overscroll-behavior: contain` su Sheet/Dialog

---

## 14. Naming Convention

| Contesto | Nome |
|-----------|------|
| Titolo HTML (`<title>`) | ValgeMed |
| Brand nell'header | ValgeMed |
| Tagline | "A quiet command system for serious medical students." |
| Cookie theme | `valgemed_theme` |
| Cookie language | `valgemed_language` |
| Cookie navigation | `valgemed_nav` |
| Codice/funzioni interne | `elise_*` (non rompere compatibilita) |
| README heading | ValgeMed |

---

## 15. Struttura Codice — Ordine di Esecuzione

### Fase 1: Rebrand + Identita
| File | Azione |
|------|--------|
| `app/layout.tsx` | Titolo "ValgeMed", description aggiornata |
| `app/globals.css` | Rimuovere gamification tokens, rafforzare dark tokens |
| `README.md` | Heading "ValgeMed" + nuova tagline |
| `lib/theme/config.ts` | Cookie `valgemed_theme` |
| `lib/i18n/config.ts` | Cookie `valgemed_language` |
| `lib/i18n/dictionaries/en.ts` | "ValgeMed", nuova microcopy |
| `lib/i18n/dictionaries/et.ts` | "ValgeMed", nuova microcopy |
| `components/app-shell.tsx` | Brand name "ValgeMed" |

### Fase 2: Design System Foundation
| File | Azione |
|------|--------|
| `app/globals.css` | Skeleton animation, rimozione gamification CSS |
| `components/ui/skeleton.tsx` | NUOVO |
| `components/ui/button.tsx` | Focus migliorato, rimuovere variante warm |
| `components/ui/badge.tsx` | Sizing consistente, outline variant |
| `components/ui/card.tsx` | Padding standard |
| `components/ui/input.tsx` | Focus morbido, autocomplete |

### Fase 3: Navigazione Collassabile
| File | Azione |
|------|--------|
| `components/navigation.tsx` | 4 sezioni accordion, cookie persist |
| `components/nav-link.tsx` | Active state rifinito |
| `components/app-shell.tsx` | Skip link, mobile fix, page padding |

### Fase 4: Componenti Premium
| File | Azione |
|------|--------|
| `components/premium/glass-card.tsx` | Padding default, tone system |
| `components/premium/metric-card.tsx` | Mobile horizontal, trend prop |
| `components/premium/empty-state.tsx` | Pulse animation, CTA, varianti |
| `components/premium/loading-state.tsx` | Skeleton wrapper |
| `components/premium/section-header.tsx` | Tipografia, icon fix |
| `components/premium/command-greeting.tsx` | Nuova microcopy, dark tone |

### Fase 5: Command + Dashboard
| File | Azione |
|------|--------|
| `app/command/page.tsx` | Riduzione noise, focal point, new microcopy, skeleton |
| `app/dashboard/page.tsx` | Ripulire gamification, allineare a dark cockpit, skeleton |

### Fase 6: Forms & Microcopy
| File | Azione |
|------|--------|
| `components/forms/fields.tsx` | Label, placeholder, helper, error, mobile |
| `components/forms/entity-forms.tsx` | Grouping, esempi, submit loading |
| `lib/i18n/dictionaries/en.ts` | Microcopy tone in tutti i form labels |
| `lib/i18n/dictionaries/et.ts` | Microcopy tone in estone |

### Fase 7: Cleanup & Verifica
- Rimozione stringhe italiane
- Rimozione elementi gamification (level/XP/streak/badge infantili)
- Mobile responsive sweep
- Accessibilita sweep
- `pnpm build && pnpm typecheck && pnpm lint && pnpm test`

---

## 16. Verifica Finale

- [ ] `pnpm build` passes (exit 0)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (0 errors)
- [ ] `pnpm test` passes
- [ ] Dark mode e il default, atmosferico, nordic clinical cockpit
- [ ] Light mode funziona come alternate theme
- [ ] Nome "ValgeMed" visibile in title, header, sidebar, README
- [ ] Cookie rinominati: `valgemed_theme`, `valgemed_language`, `valgemed_nav`
- [ ] Mobile (360, 390, 430): usable, no overflow
- [ ] Tablet (768): good proportions
- [ ] Desktop (1024, 1280, 1440): allineato
- [ ] Login: premium dark experience
- [ ] /command e la pagina piu importante, con focal point chiaro
- [ ] Nessun elemento gamification infantile (level, XP, streak, badge vanity)
- [ ] Elite Index score ring presente
- [ ] Error destruction counter presente
- [ ] Microcopy allineato al tone: "Readiness is not confidence." etc.
- [ ] Skeleton loading su data-heavy pages
- [ ] Skip link, aria-labels, focus visible funzionanti
- [ ] No stringhe italiane nel codice
- [ ] AI module `/ai` con 5 modalita documentate
