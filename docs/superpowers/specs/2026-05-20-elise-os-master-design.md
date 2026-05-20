# ELISE OS — Master Design Spec

> Data: 2026-05-20
> Fonti: VISUAL_RESCUE_PLAN.md, ELISE_UI_OVERHAUL_PLAN.md, UI_POLISH_PLAN.md, PRODUCT_BIBLE.md
> Competenze integrate: frontend-design, web-design-guidelines, shadcn, vercel-react-best-practices, vercel-composition-patterns, next-best-practices

---

## 1. Direzione Visiva

**Dual-mode equilibrato.** Light e dark eccellono entrambi, ciascuno ottimizzato per il proprio contesto.

**Light Mode — Warm Professional:**
- Background: `#F7F5F0` (warm off-white)
- Surface: `#FEFDFB` (cream white)
- Primary: `#5746E5` (deep indigo)
- Warm accent: `#B45309` (gold/amber)
- Spazioso, premium, clinicamente caldo
- Font: Geist Sans + Geist Mono

**Dark Mode — Nordic Clinical Console:**
- Background: `#0B0B14` (deep navy)
- Surface: `#151528` (dark indigo)
- Primary: `#8B7BF7` (indigo glow)
- Cyan accents: `#38D9F0`
- Denso, preciso, atmosferico. Terminale medico professionale.

**Font:** Geist resta. Usato con autorita: gerarchia chiara, mai `text-[9px]` o `text-[10px]`.

---

## 2. Design System — Design Tokens

### 2.1 Token aggiornati (`app/globals.css`)

**Light mode (esistente + modifiche):**
```css
--bg-page: #F7F5F0;
--bg-surface: #FEFDFB;
--bg-subtle: #F2EFE9;
--text-primary: #111122;
--text-secondary: #4A4A5C;
--text-muted: #8A8A9A;
--primary: #5746E5;
--primary-soft: #EDE9FE;
--warm: #B45309;           /* NUOVO */
--warm-bg: #FEF3C7;        /* NUOVO */
--shadow-card: 0 1px 2px rgba(17,17,34,0.05), 0 4px 12px rgba(17,17,34,0.06);
--shadow-elevated: 0 4px 8px rgba(17,17,34,0.06), 0 12px 32px rgba(17,17,34,0.08);
--shadow-premium: 0 8px 16px rgba(17,17,34,0.08), 0 24px 60px rgba(17,17,34,0.10);
--shadow-hero: 0 12px 40px rgba(87,70,229,0.10), 0 4px 16px rgba(87,70,229,0.06);
--shadow-inner: inset 0 1px 2px rgba(17,17,34,0.04);
```

**Dark mode (esistente, invariato):**
Tutti i token dark esistono gia e funzionano. Nessuna modifica strutturale necessaria.

**Nuovi token da aggiungere al `@theme inline`:**
```
--color-warm: var(--warm);
--color-warm-bg: var(--warm-bg);
--color-warm-soft: var(--warm-soft);
```

### 2.2 Border Radius — Standardizzati
- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-xl` (12px)
- Inputs: `rounded-lg` (8px)

### 2.3 Tipografia — Gerarchia
- Display/Hero: `text-3xl sm:text-4xl font-bold tracking-tight`
- Heading: `text-xl sm:text-2xl font-semibold tracking-tight`
- Subheading: `text-lg font-semibold`
- Body: `text-sm leading-relaxed`
- Label: `text-xs font-medium uppercase tracking-[0.08em]`
- Caption: `text-xs text-text-muted`
- Mai `text-[9px]` o `text-[10px]`. Minimo `text-xs` (12px).
- `tabular-nums` su colonne numeriche
- `text-balance` su headings (utility gia presente)

### 2.4 Spacing — Standardizzati
- Page padding: `px-4 sm:px-6 lg:px-8`
- Card padding: `p-5 sm:p-6`
- Section gap: `gap-6`

### 2.5 Animazioni
Tutte le animazioni esistenti (`motion-premium`, `card-hover`, `skeleton-pulse`, etc.) rispettano `prefers-reduced-motion`. Da aggiungere:
- `toast-in` / `toast-out` per sonner
- `skeleton-shimmer` per shimmer effect

---

## 3. Navigazione — 4 Sezioni Collassabili

### 3.1 Struttura Sidebar
4 sezioni espandibili (accordion). Solo una aperta alla volta. Stato salvato in cookie `elise_nav`.

**Core:** Command, Dashboard, Elite Index, Strategic Review
**Study:** Subjects, Exams, Topics, Study Sessions, Reviews, Errors
**Life:** Goals, Memory, Identity, Tartu, Time, Health, Language
**Strategy:** Opportunities, Reputation, Network, Life Admin, Portfolio, AI, Settings

### 3.2 Desktop
- Sidebar fissa a sinistra, `w-64`, `border-r`
- Header con brand icon (gradient indigo-to-violet) + "ELISE OS" + "Private Console"
- Sezioni con disclosure triangle (chevron rotante)
- Active link: left accent bar (3px primary) + `bg-primary-soft/50`

### 3.3 Mobile
- Sheet drawer, attivato da hamburger button nello header
- Stessa struttura accordion della sidebar desktop
- Language selector visibile nel Sheet
- `w-[min(88vw,300px)]`

### 3.4 Skip Link
Aggiungere skip-to-main-content nascosto nel layout, primo elemento focusabile.

---

## 4. Gamification Layer

Tutti i dati guidati da metriche reali, nessun numero fittizio.

### 4.1 Score Ring
- Visualizzazione circolare animata dell'Elite Index
- Animazione `progress-fill` su mount (1200ms)
- Colore primario con glow

### 4.2 Level System (1-100)
- Livello calcolato dall'Elite Index
- XP bar con progresso verso il prossimo livello
- Posizionato nel dashboard hero

### 4.3 Daily Streak
- Counter di giorni consecutivi di attivita
- Heatmap opzionale (ultimi 30 giorni)

### 4.4 Achievement Badges
Sbloccati a milestone reali:
- Error Destroyer: 100 errori distrutti
- Iron Streak: 30 giorni consecutivi
- Polymath: 10 materie mastered
- Night Owl / Early Bird: pattern di studio
- Tartu Native: livello lingua estone

### 4.5 Mission Progress
- Percentuale completamento missioni attive
- Lista quest con stato (locked/active/completed)

### 4.6 Posizionamento
- Dashboard hero: Score Ring + Level + XP + Streak
- Command page: Mission progress + next best action
- Badge display: componente `gamification.tsx` standalone

---

## 5. Loading States — Skeleton System

### 5.1 Componente Skeleton (NUOVO)
`components/ui/skeleton.tsx`:
- Props: `className`, `variant` ("text" | "circular" | "rectangular")
- Animazione shimmer usando `skeleton-pulse` keyframe
- Usato come building block per skeleton layout

### 5.2 Skeleton Layouts
Ogni data-heavy page ottiene uno skeleton layout che rispecchia la struttura reale:
- **Dashboard:** hero skeleton + 4 metric card skeleton + 2 chart skeleton
- **Command:** greeting skeleton + card grid skeleton
- **Exam Battle Room:** header skeleton + table skeleton
- **Entity lists:** card list skeleton (3-5 items)

### 5.3 Loading States Esistenti
`components/premium/loading-state.tsx` modificato per wrappare `Skeleton` invece di mostrare solo spinner.

---

## 6. UI Components

### 6.1 Button (`components/ui/button.tsx`)
- Nuova variante `warm` (gold/amber tone)
- Hover: `shadow-sm shadow-primary/10`
- Active: `scale-[0.97]`, `transition-all duration-150`
- Focus-visible: `ring-2 ring-primary/40 ring-offset-2`
- Icon buttons: `aria-label` obbligatorio

### 6.2 Card (`components/ui/card.tsx`)
- Padding standard: `p-5 sm:p-6` su `CardContent`
- Nuova variante `premium` con `border-border/50 shadow-card`
- `CardFooter` con `pt-0`
- `card-hover` class per hover lift

### 6.3 Badge (`components/ui/badge.tsx`)
- Sizing standard: `text-xs px-2 py-0.5` per tutte le varianti
- Rimuovere sizing ad-hoc (`text-[10px]`, padding irregolari)
- Nuova variante `outline` per stato secondario

### 6.4 Input (`components/ui/input.tsx`)
- Focus ring: `ring-2 ring-primary/25` (piu morbido)
- Placeholder: `text-text-muted-2` con esempio reale
- `aria-invalid` + `border-danger` su errore
- `autocomplete` appropriato su ogni campo

### 6.5 Skeleton (NUOVO) (`components/ui/skeleton.tsx`)
- File nuovo. Building block per tutti gli skeleton layouts.

### 6.6 GlassCard (`components/premium/glass-card.tsx`)
- `p-6` come padding default
- Tone system: `tone="primary" | "warm" | "neutral"` per bordo sinistro colorato
- Hover: `shadow-elevated` + `translateY(-2px)`

### 6.7 MetricCard (`components/premium/metric-card.tsx`)
- Desktop: layout stacked attuale
- Mobile (`< sm`): layout orizzontale (icon left, value + label right)
- Prop `trend` opzionale: freccia su/giu + percentuale

### 6.8 EmptyState (`components/premium/empty-state.tsx`)
- Animazione pulse sull'icona
- Titolo + description + CTA button
- `bg-subtle` invece di `bg-surface`
- Varianti: "no-data", "no-results", "first-time" (guida onboarding)

### 6.9 SectionHeader (`components/premium/section-header.tsx`)
- Tipografia standardizzata (regole sezione 2.3)
- Icon visibility migliorata (colore non muted-2)

### 6.10 Gamification (`components/premium/gamification.tsx`)
- Aggiungere: Level display, XP bar, Streak counter, Badge grid, Mission progress
- Tutti dati da scoring engine reale

---

## 7. Dashboard & Command

### 7.1 Dashboard (`app/dashboard/page.tsx`)
**Hero section** (gradient card con primary-soft bg):
- Greeting + data
- Elite Score Ring (gamificato)
- Level + XP bar
- Streak badge
- Next Best Action con CTA

**Today section** (4 metric cards):
- Study today (minuti)
- Reviews due
- Errors to destroy
- Energy level

**Progress section** (2-colonna):
- Weekly momentum bar chart (recharts)
- Momentum bars (active ratio, energy integrity, readiness)

**Gamification section:**
- Level card con XP bar
- Missions/quests progress
- Achievements unlocked

**Sidebar destra:**
- Upcoming exams con risk badge
- Weak topics

### 7.2 Command (`app/command/page.tsx`)
- Riduzione rumore visivo
- Focal point chiaro: Next Best Action in primo piano
- Segnali secondari in collapsible panels
- Skeleton loading su mount

---

## 8. Forms & Microcopy

### 8.1 Regole Universali
Ogni form field deve avere:
- **Label** chiara e descrittiva
- **Placeholder** con esempio concreto, terminante con `...`
- **Helper text** (opzionale) che spiega perche il campo esiste
- **Error message** inline con fix suggerito, non solo descrizione del problema

### 8.2 Entity Forms (`components/forms/entity-forms.tsx`)
- Raggruppamento logico dei campi (FieldSet pattern)
- Placeholder con esempi reali: "e.g. Gross Anatomy...", "e.g. 2026-06-15..."
- Helper text contestuale
- Submit button con stato loading + testo dinamico ("Creating Subject..." / "Updating Exam...")

### 8.3 Form Fields (`components/forms/fields.tsx`)
- Full-width su mobile
- Label sempre visibile (non solo placeholder)
- Touch target >= 44px
- `autocomplete` appropriato

### 8.4 Toast Feedback
- Usare `sonner` per feedback post-submit
- Success: "Subject created" con check icon
- Error: messaggio descrittivo con azione suggerita

---

## 9. Login — Atmosfera Premium

### 9.1 Layout (`app/login/page.tsx`)
- Hero section: gradient indigo-to-violet sfumato come sfondo
- Nome app + tagline centrati
- Glass card form centrato con profondita (shadow-premium)

### 9.2 Form (`app/login/login-form.tsx`)
- Username field + Password field
- Validazione inline
- Animazione di entrata staggered (motion-stagger)
- Error state visibile con icona
- "Enter ELISE OS" button con arrow icon

---

## 10. Mobile Strategy

### 10.1 Breakpoint Reference
- `sm: 640px` — metric cards diventano horizontal
- `md: 768px` — tabelle → card-list, Sheet nav
- `lg: 1024px` — sidebar fissa
- `xl: 1280px` — max-width container 1440px
- `2xl: 1536px` — dashboard espansa

### 10.2 Regole per Componente
- **MetricCard:** layout orizzontale a `< sm`
- **Tabelle:** card-list a `< md` invece di overflow scroll
- **Form:** single column, full-width, touch target >= 44px
- **Hero:** layout compatto, titolo ridotto, badge in fila singola
- **Dashboard grid:** tutto stacked a mobile
- **Page padding:** `px-4` consistente a mobile

### 10.3 Testing Breakpoint
Ogni pagina testata a: 360, 390, 430, 768, 1024, 1280, 1440.

---

## 11. Performance (vercel-react-best-practices)

### 11.1 Eliminare Waterfalls (CRITICAL)
- `Promise.all()` per fetch parallele indipendenti
- `Suspense` boundaries su componenti data-heavy

### 11.2 Bundle Size (CRITICAL)
- `next/dynamic` per chart components (recharts)
- Import diretti, no barrel files
- `lazy()` per componenti sotto la fold

### 11.3 Client-Side
- `startTransition` per tab switches e navigation non-urgenti
- `useDeferredValue` per input di ricerca

### 11.4 Rendering
- `content-visibility: auto` per liste lunghe
- Ternary (`? :`) non `&&` per conditional rendering

---

## 12. Accessibilita (web-design-guidelines)

- **Icon buttons:** `aria-label` obbligatorio
- **Form labels:** ogni `<input>` ha `<label>` via `htmlFor`
- **Focus visible:** `focus-visible:ring-2` su ogni elemento interattivo. Mai `outline-none` senza rimpiazzo
- **Skip link:** skip-to-main-content nel layout
- **Heading hierarchy:** `h1` (app name) → `h2` (page title) → `h3` (section) → `h4` (card title)
- **`scroll-margin-top`:** su heading anchors
- **`aria-live="polite"`:** per toast e loading state changes
- **Semantic HTML:** `<button>` per azioni, `<a>`/`<Link>` per navigazione, `<table>` per dati tabulari
- **Color scheme:** `color-scheme: light/dark` gia implementato
- **`touch-action: manipulation`:** su tutti i button (previene 300ms delay mobile)
- **`overscroll-behavior: contain`:** su Sheet/Dialog

---

## 13. Struttura Codice — Ordine di Esecuzione

### Fase 1: Design System Foundation
| File | Azione |
|------|--------|
| `app/globals.css` | Aggiungere token warm, skeleton-shimmer, toast animation |
| `components/ui/skeleton.tsx` | NUOVO — skeleton component |
| `components/ui/button.tsx` | Variante warm, focus migliorato, aria-label enforcement |
| `components/ui/badge.tsx` | Sizing consistente, variante outline |
| `components/ui/card.tsx` | Padding standard, variante premium |
| `components/ui/input.tsx` | Focus morbido, placeholder style, autocomplete |

### Fase 2: Layout & Navigazione
| File | Azione |
|------|--------|
| `components/app-shell.tsx` | Sidebar collapsibile, skip link, mobile fix, page padding |
| `components/navigation.tsx` | 4 sezioni accordion, cookie persist |
| `components/nav-link.tsx` | Active state rifinito (left bar + bg) |

### Fase 3: Componenti Premium
| File | Azione |
|------|--------|
| `components/premium/glass-card.tsx` | Padding default `p-6`, tone system |
| `components/premium/metric-card.tsx` | Mobile horizontal layout, trend prop |
| `components/premium/empty-state.tsx` | Pulse animation, CTA, varianti |
| `components/premium/loading-state.tsx` | Skeleton wrapper |
| `components/premium/section-header.tsx` | Tipografia standard, icon fix |
| `components/premium/gamification.tsx` | Level, XP, streak, badge, mission |

### Fase 4: Dashboard & Command
| File | Azione |
|------|--------|
| `app/dashboard/page.tsx` | Hero redesign, gamification, mobile grid, skeleton |
| `app/command/page.tsx` | Riduzione noise, focal point, skeleton |

### Fase 5: Forms & Microcopy
| File | Azione |
|------|--------|
| `components/forms/fields.tsx` | Label, placeholder, helper, error, mobile |
| `components/forms/entity-forms.tsx` | Grouping, esempi concreti, submit loading |

### Fase 6: Login
| File | Azione |
|------|--------|
| `app/login/page.tsx` | Hero atmosphere, glass card |
| `app/login/login-form.tsx` | Username field, validation, animazione |

### Fase 7: Cleanup & Verifica
- Rimozione stringhe italiane da: `lib/scoring/engine.ts`, `lib/actions/resources.ts`, `lib/validators/schemas.ts`, `lib/labels.ts`, `scripts/hash-password.ts`
- Mobile responsive sweep su tutte le pagine
- Accessibilita sweep (aria-label, focus, heading hierarchy)
- `pnpm build && pnpm typecheck && pnpm lint && pnpm test`

---

## 14. Verifica Finale

- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Light mode: premium, warm, intentional
- [ ] Dark mode: atmospheric, readable, nordic
- [ ] Mobile (360, 390, 430): usable, no overflow
- [ ] Tablet (768): good proportions
- [ ] Desktop (1024, 1280, 1440): visually aligned
- [ ] Login: premium experience, username+password
- [ ] Dashboard: gamification hero, metric cards, charts
- [ ] Command: clear focal point, reduced noise
- [ ] Forms: helpful labels, placeholders, examples
- [ ] Empty states: guide the user
- [ ] Navigation: 4 collapsible sections, mobile Sheet
- [ ] No Italian UI strings
- [ ] Skeleton loading on data-heavy pages
- [ ] Accessibility: skip link, aria-labels, focus visible
- [ ] Theme toggle: functional, persists, no flash

---

## 15. Note sul Conflitto PRODUCT_BIBLE vs Gamification

Il PRODUCT_BIBLE specifica: *"not a gamified productivity toy."* Tuttavia, su decisione esplicita dell'owner, la gamification piena (Level, XP, Streak, Badge, Mission) viene implementata. Il compromesso di design e:
- I badge sono milestone reali, non vanity metrics
- Il level system e calcolato dall'Elite Index, non arbitrario
- Lo stile visivo resta professionale (nessuna grafica cartoon, nessun effetto "gioco")
- Il tone della UI resta clinico e nordico anche con elementi di gamification
