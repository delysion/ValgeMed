# ValgeMed UI/UX Optimization — Topics, Exams, Command

## Status
- Draft → Implementation

---

## 1. Overview

Transform three command-center pages into a world-class elite performance cockpit. Every pixel earns its place through information hierarchy, scannable density, and decisive visual weight. The goal: a user sees the most important information in under 2 seconds and knows exactly what to do next.

---

## 2. Visual Language

### 2.1 Density Architecture
Pages operate on a **3-tier density system**:

| Tier | Content | Visual Weight |
|------|---------|---------------|
| **Hero** | Primary score, winning move, critical alert | Full-width, high-contrast, dominant |
| **Context** | Supporting metrics, grouped stats | Mid-size cards, medium contrast |
| **Detail** | List items, forms, metadata | Compact, subdued, scannable |

### 2.2 Color Strategy
Each page gets a **primary accent** based on its function:
- **Topics**: Cyan (knowledge, mastery)
- **Exams**: Gold (deadlines, urgency)
- **Command**: Violet (strategic intelligence)

Tone-based cards (GlassCard `tone` prop) provide semantic coloring throughout.

### 2.3 Typography Scale
| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Hero metric | 3.5–4rem | 800 | Big numbers, scores |
| Section heading | 1.25–1.5rem | 700 | Card titles |
| Subheading | 0.875–1rem | 600 | Labels, badgable |
| Body | 0.8125rem | 400 | Descriptions |
| Caption | 0.6875rem | 500 | Metadata, timestamps |

### 2.4 Spacing Rhythm
- **8px base grid** throughout
- Hero sections: 32–48px padding
- Card internals: 20–24px padding
- List items: 12–16px padding
- Tight metadata rows: 8–10px gap

---

## 3. Topics Page

### 3.1 Layout Transformation
**Current**: 420px sidebar (form) + grid of topic cards

**Optimized**:
```
┌─────────────────────────────────────────────────────────┐
│ Page Header: "Topics" + count badge                    │
├────────────────────┬────────────────────────────────────┤
│ New/Edit Form       │ Filter Bar (compact, horizontal)  │
│ (380px sticky)      ├────────────────────────────────────┤
│                    │ Topic Cards Grid                   │
│ - Subject select    │ (3-col, tight spacing)            │
│ - Title            │ ┌──────┐ ┌──────┐ ┌──────┐        │
│ - Confidence       │ │      │ │      │ │      │        │
│ - Priority         │ └──────┘ └──────┘ └──────┘        │
│ - Status           │                                    │
│ - Linked Exam      │                                    │
└────────────────────┴────────────────────────────────────┘
```

**Key changes**:
1. Form width reduced to 380px, made sticky with max-height scroll
2. Filter bar moved above grid, compact single-line
3. Topic cards: tighter internal layout, 3 columns on xl
4. Empty state: elegant centered message with icon

### 3.2 Topic Card Design
```
┌────────────────────────────────────────────┐
│ [Subject]              [Mastery Badge]     │
│ Topic Title                               │
│ Linked: Exam Name                         │
├────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓░░░ Confidence    ▓▓▓░░░░░░ Priority│
├────────────────────────────────────────────┤
│ Next: Mar 15    │    Errors: 3            │
├────────────────────────────────────────────┤
│ [Suggested Action]    [👁] [✏] [🗑]       │
└────────────────────────────────────────────┘
```

**Improvements**:
1. Left accent border (3px) colored by mastery level
2. Confidence/priority as inline progress bars (not MomentumBar)
3. Bottom action row with clear hierarchy
4. Click anywhere on card to open detail drawer
5. Hover: subtle lift + border color intensification

### 3.3 TopicsGrid Component
- Input: `compact` prop to reduce card padding
- Color-coded left border by mastery level
- Inline progress bars instead of MomentumBar for space efficiency
- Hover state: `translateY(-2px)` + border glow

---

## 4. Exams Page

### 4.1 Layout Transformation
**Current**: 420px form + 2-column grid of exam cards

**Optimized**:
```
┌─────────────────────────────────────────────────────────┐
│ Page Header: "Exams" + readiness radar summary          │
├──────────────────────┬──────────────────────────────────┤
│ New Exam Form        │ Exam Cards (2-col, larger)      │
│ (340px sticky)       │ ┌────────────────────────────┐  │
│                      │ │ [Subject Badge]             │  │
│                      │ │ Title + Format + Date      │  │
│                      │ │ ████ Readiness Bar ████   │  │
│                      │ │ [Days] [Errors] [Risk]     │  │
│                      │ │ Weak Topics: tag tag tag    │  │
│                      │ └────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────┘
```

**Key changes**:
1. Header now shows overall readiness index (average of all exams)
2. Form width reduced to 340px
3. Exam cards enlarged with better internal structure
4. Each card gets a prominent readiness ring + countdown
5. Risk badge positioned top-right, always visible

### 4.2 Exam Card Design
```
┌──────────────────────────────────────────────────────────┐
│ [Subject Badge]                           [Risk: 8.2]   │
│ Exam Title                                         │
│ Format · March 15, 2025                            │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────┐  Readiness: 6.4    ┌─────────────┐     │
│ │   (ring)    │  ▓▓▓▓▓▓░░░        │   12 days   │     │
│ │    6.4     │  Gap: +1.2        │   left      │     │
│ └─────────────┘                   └─────────────┘     │
├──────────────────────────────────────────────────────────┤
│ Open Errors: 3              │ Weak: Topic, Topic, +2  │
├──────────────────────────────────────────────────────────┤
│ [View Exam →]                      [✏] [🗑]            │
└──────────────────────────────────────────────────────────┘
```

**Improvements**:
1. Mini ScoreRing (sm size) for each card, prominently placed
2. Readiness bar inline, not as separate MomentumBar
3. Top row: subject badge + risk badge (right-aligned)
4. Bottom row: CTA button left, actions right
5. Card color accent from risk level (danger/rose vs violet)

### 4.3 Exam Detail Page ([id]/page.tsx)
**Current**: Two-column layout with some overlapping sections

**Optimized**:
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Exams                    [Subject] [Format]  │
│ Exam Title                                          │
│ March 15, 2025 · 42 days left                       │
├─────────────────────────────┬─────────────────────────┤
│                             │                         │
│   [LARGE SCORE RING]        │  Breakdown Stats        │
│         6.4                  │  ├ Confidence: 5.2     │
│                             │  ├ Simulation: 72%      │
│   Countdown │ Conf │ Sim    │  ├ Errors: 3 open       │
│                             │                         │
├─────────────────────────────┤  Momentum Bars          │
│ Readiness Breakdown         │  ├───────────────       │
│ ├ Component A: ████ 8.0    │  └───────────────       │
│ ├ Component B: ███░ 6.0    │                         │
└─────────────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ EXAM PLAN (gold card, full width)                      │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ Gap    │ │ Recall │ │ Sim    │ │ Recon  │           │
│ └────────┘ └────────┘ └────────┘ └────────┘           │
│ [72h Plan]     [Checklist]    [High Risk Topics]      │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ MUST DESTROY (rose)       │ │ LAST 48H ACTIONS (cyan) │
│ · Error 1 (severity 9)   │ │ · Action 1              │
│ · Error 2 (severity 7)   │ │ · Action 2              │
│ · Error 3 (severity 5)   │ │ · Action 3              │
└──────────────────────────┘ └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LINKED TOPICS (compact grid, 4 per row)                │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                           │
│ │    │ │    │ │    │ │    │                           │
│ └────┘ └────┘ └────┘ └────┘                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ QUIZ ATTEMPTS             │ │ SESSION HISTORY          │
│ + Add attempt             │ │ (compact list)          │
└──────────────────────────┘ └──────────────────────────┘
```

**Key changes**:
1. Hero section: large ScoreRing (xl size), countdown, and key metrics in one row
2. Breakdown component gets a proper structured layout, not generic grid
3. Exam Plan section gets gold accent and becomes the visual anchor
4. Must Destroy and Last 48H become side-by-side with clear visual separation
5. Topics displayed in a dense 4-col grid with mastery color coding
6. Quiz attempts: clean list with inline edit/delete actions

---

## 5. Command Page

### 5.1 Layout Transformation
**Current**: Dense, everything competes for attention

**Optimized**:
```
┌─────────────────────────────────────────────────────────┐
│ Page Header: "Command" + Elite Index + Settings links   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐│
│ │ [WINNING MOVE — HERO SECTION]                       ││
│ │                                                     ││
│ │ Badge: Today's Winning Move          [ScoreRing]   ││
│ │ Title (large)                                      ││
│ │ Reason (subtitle)                                  ││
│ │                                                     ││
│ │ [Time] [Impact] [Danger]                           ││
│ │                                                     ││
│ │ [CTA Button →]                                     ││
│ └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│ METRICS ROW (4 cards, equal weight)                    │
│ Readiness │ Gap │ Errors │ Energy                       │
├─────────────────────────────────────────────────────────┤
│ SNAPSHOT BARS (2x2 grid of MomentumBars)               │
│ Active Recall    │ Passive Study                       │
│ Critical Errors  │ Simulation                           │
├──────────────────────────┬──────────────────────────────┤
│ TOP THREATS               │ DANGEROUS CLUSTER            │
│ (list of threat cards)    │ (single blocker, prominent)  │
├──────────────────────────┴──────────────────────────────┤
│ ┌────────────────────────┐ ┌──────────────────────────┐│
│ │ NEXT ACTION             │ │ EXAM PLANS                ││
│ │ (DailyLog form)         │ │ (short list, 2-3 max)     ││
│ └────────────────────────┘ └──────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Key changes**:
1. Winning Move section becomes a true hero — full width, dominant typography
2. ScoreRing moved inside the hero, not competing with it
3. Metrics row: equal 4-column grid, not 2x2
4. Snapshot bars become a 2x2 compact grid within a glass card
5. Threats and blockers side-by-side at the same level
6. Bottom row: Next Action (form) and Exam Plans (list)

### 5.2 Winning Move Hero Design
```
┌────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░ CRITICAL BACKGROUND ░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                            │
│  ⭐ TODAY'S WINNING MOVE                    [Elite: 7.2]   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐     │
│  │ RECOVERY                                         │     │
│  │ Rest + Active Recall Tomorrow                    │     │
│  │                                                  │     │
│  │ Burnout risk detected. Protect tomorrow's        │     │
│  │ recall with light review + full recovery.       │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  ⏱ 15 min    📈 +0.8 readiness    ⚠️ -1.2 if ignored      │
│                                                            │
│  [Execute This Move →]                                     │
└────────────────────────────────────────────────────────────┘
```

**Improvements**:
1. Critical background: full-width gradient in rose/danger for recovery, cyan for active
2. Badge "TODAY'S WINNING MOVE" with star icon
3. Move title (type): large, colored by move kind
4. Reason text: medium weight, good line height
5. Three stats in a row: time, expected impact, danger
6. CTA button: full-width or large, high contrast

---

## 6. Record Drawer Detail View

### 6.1 Layout Optimization
**Current**: Sections stacked vertically with generic spacing

**Optimized**:
```
┌────────────────────────────────────────────────────────────┐
│ [Badge: Type]                            [Edit Button]   │
│ Record Title                                           │
├────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│ │ Conf  │ │ Prior  │ │ Diff  │ │ Status │              │
│ │  7/10  │ │  8/10  │ │  6/10  │ │ Recalled│              │
│ └────────┘ └────────┘ └────────┘ └────────┘              │
├────────────────────────────────────────────────────────────┤
│ CONTEXT                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │ Subject  │ │ Exam     │ │ Errors   │                   │
│ └──────────┘ └──────────┘ └──────────┘                   │
├────────────────────────────────────────────────────────────┤
│ STATUS                                                    │
│ Next review: March 15, 2025    Last studied: March 10     │
├────────────────────────────────────────────────────────────┤
│ DESCRIPTION                                               │
│ Full text content with good line height and readable     │
│ paragraph spacing...                                     │
└────────────────────────────────────────────────────────────┘
```

**Key changes**:
1. Metrics row at top: 4 tiles, all in one row, compact
2. Context bar: smaller, single row of chips
3. Status section: key dates inline, not as a grid
4. Description: more whitespace, better typography
5. Sections separated by subtle dividers, not borders
6. Overall: cleaner, more editorial feel

---

## 7. Component Optimizations

### 7.1 MetricCard
- **Current**: Complex with trend indicators, variable sizing
- **Optimized**:
  - Fixed height within grid
  - Icon + value + detail in single column
  - Tone-based icon background
  - Consistent padding (p-3.5 or p-4)

### 7.2 GlassCard
- **Current**: Good but with redundant border colors
- **Optimized**:
  - Left accent border (3px) based on tone
  - Consistent shadow
  - `hover` prop adds lift effect
  - `padded` prop controls internal spacing

### 7.3 MomentumBar
- **Current**: Label + bar + optional detail
- **Optimized**:
  - Compact variant (h-1 instead of h-1.5/h-2)
  - Value shown inside bar on hover
  - Gradient colors per tone

### 7.4 Badge
- **Current**: Good variety of variants
- **Optimized**:
  - Add `ghost` variant for inline use
  - Size variants: sm (compact), default, lg (prominent)

### 7.5 ScoreRing
- **Current**: Good component
- **Optimized**:
  - Add `caption` positioning option
  - Glow effect when score is high
  - Size variants: xs (inline), sm (card), lg (hero), xl (dominant)

---

## 8. Responsive Strategy

| Breakpoint | Layout Adaptation |
|------------|-------------------|
| < 640px | Single column, form above grid, simplified cards |
| 640–1024px | 2-col grid, form sidebar maintained |
| 1024–1280px | 3-col topic grid, form sidebar narrowed |
| > 1280px | Full layout with all columns |

---

## 9. Animation & Motion

- **Page load**: Staggered card entrance (80ms delay each)
- **Card hover**: `translateY(-2px)` + border glow (150ms)
- **Sheet/drawer**: Slide from right with backdrop fade
- **Score ring**: Fill animation on mount (800ms ease-out)
- **Momentum bars**: Width animation (600ms ease-out, staggered 50ms)
- **CTAs**: Scale on hover (1.02), press feedback (0.98)

---

## 10. Implementation Order

1. **GlassCard & Badge refinements** — foundation components
2. **MetricCard & ScoreRing refinements** — core display components
3. **Topics page** — form sidebar + card grid
4. **RecordDrawer detail view** — optimized layout
5. **Exams page** — card redesign + header
6. **Exam detail page** — full layout optimization
7. **Command page** — hero + metrics + sections
8. **Responsive verification** — test all breakpoints

---

## 11. Files to Modify

### Components
- `components/premium/glass-card.tsx` — tone border accents
- `components/premium/metric-card.tsx` — sizing refinements
- `components/premium/score-ring.tsx` — size variants, glow
- `components/premium/momentum-bar.tsx` — compact variant
- `components/ui/badge.tsx` — ghost variant, size options
- `components/topics-grid.tsx` — new layout, compact mode
- `components/ui/record-drawer.tsx` — detail view redesign

### Pages
- `app/topics/page.tsx` — sidebar width, grid layout
- `app/exams/page.tsx` — header, card redesign
- `app/exams/[id]/page.tsx` — full layout overhaul
- `app/command/page.tsx` — hero section, metrics row

---

## 12. Design Principles

1. **Visual hierarchy is earned** — most important = biggest + highest contrast
2. **Scannable over dense** — users should understand a card in 2 seconds
3. **Consistent spacing** — 8px grid, predictable padding
4. **Color as signal** — tone colors communicate state, not decoration
5. **Interaction feedback** — every tap/click has visible response
6. **Dark mode first** — design for dark, then adapt light
7. **Motion is purposeful** — animation communicates state change, not decoration