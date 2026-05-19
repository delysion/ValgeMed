# Elise OS — Full UI Overhaul Plan

## Current Problems
1. **Dark theme** — depressing, dead, anonymous, like a generic admin panel
2. **No gamification** — no level, XP, progress, achievements visible on dashboard
3. **Dashboard is flat** — static metric cards, no energy, no visual hierarchy
4. **Charts are dark-themed** — invisible against light, no gradients, no polish
5. **Navigation is crammed** — 25 flat links, no grouping, no visual breathing room
6. **Cards are dull** — dark overlays on dark, no shadows, no elevation
7. **Empty states are minimal** — no illustration, no onboarding framing
8. **Loading states are basic** — no skeleton, no shimmer
9. **No score/level identity** — the Elite Index score exists but isn't celebrated

## Design Direction
- **Light theme** — white (#FFFFFF) background, soft warm-gray (#FAFAF9) page bg
- **Premium but clean** — Notion + Linear + Apple Health + Duolingo HUD
- **Vibrant accents** — Purple (#7C3AED) primary, Cyan (#06B6D4) secondary, Emerald (#10B981) success
- **Subtle gradients** — hero cards, progress bars, chart fills, nav active states
- **Elevation** — soft shadows, hover lift, card hierarchy
- **Gamified** — Level, XP bar, streak, mission progress visible on dashboard

## New Color System

```
--bg-page:        #FAFAF9      (warm off-white page bg)
--bg-surface:     #FFFFFF      (card/surface)
--text-primary:   #0F172A      (near-black)
--text-secondary: #64748B      (slate-500)
--text-muted:     #94A3B8      (slate-400)
--border:         #E2E8F0      (slate-200)
--border-light:   #F1F5F9      (slate-100)

--primary:        #7C3AED      (violet-600)
--primary-soft:   #F5F3FF      (violet-50)
--primary-ring:   #A78BFA      (violet-400)

--accent-cyan:    #06B6D4      (cyan-500)
--accent-cyan-bg: #ECFEFF      (cyan-50)
--accent-emerald: #10B981      (emerald-500)
--accent-emerald-bg: #D1FAE5   (emerald-50)
--accent-amber:   #F59E0B      (amber-500)
--accent-amber-bg:#FFFBEB      (amber-50)
--accent-rose:    #F43F5E      (rose-500)
--accent-rose-bg: #FFF1F2      (rose-50)
--accent-blue:    #3B82F6      (blue-500)

--shadow-card:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-elevated: 0 10px 25px rgba(0,0,0,0.08)
--shadow-hero:    0 20px 60px rgba(124,58,237,0.15)
```

## Component Strategy

### globals.css — Full rewrite
- Replace all dark tokens with light theme
- Keep animation utilities but update color references
- Remove noise/grid overlays (dark-only effects)
- Add skeleton animation keyframes

### app-shell.tsx — OS-like navigation
- Light sidebar with subtle border-right
- Brand icon in gradient purple/cyan
- Nav sections with visual grouping
- Active link with left accent bar + soft bg
- Mobile drawer with light theme
- Top bar with user info, search, quick actions

### Dashboard (highest impact)
**Hero section** — Gradient hero card with:
- System greeting + date
- Elite Score ring (gamified)
- Level + XP bar
- Streak badge
- Next Best Action with CTA

**Today section** — 4 metric cards in a row:
- Study today (minutes)
- Reviews due
- Errors to destroy  
- Energy level

**Progress section** — 2-column grid:
- Left: Weekly momentum bar chart (recharts)
- Right: Momentum bars (active ratio, energy integrity, readiness)

**Gamification section** — Level card with:
- Current level + XP bar
- Missions/quests progress
- Achievements unlocked

**Charts row** — 2 columns:
- Exam readiness bar chart
- Active vs passive donut chart

**Sidebar** — Right column:
- Upcoming exams (risk badges)
- Weak topics
- Recent wins
- Quick actions

### Gamification Layer
- System Level (1-100) based on Elite Index score
- XP bar showing progress to next level
- Daily streak counter
- Mission completion percentage
- Achievement badges (unlocked/locked)
- All driven by real data — no fake numbers

### Charts (recharts — already installed)
- **MinutesBarChart**: gradient-filled bar, light grid, rounded
- **MetricBarChart**: per-exam readiness bars with color coding
- **MethodPieChart**: donut with legend, lighter colors
- **TrendLineChart**: study trend with gradient area

### Empty States
- Illustrated icons (lucide)
- Module name + description
- Suggested next action
- CTA button to start
- Styled as premium cards

### Loading States
- Skeleton cards with shimmer animation
- Maintain layout dimensions
- Light gray pulse

### Error States
- Card with icon, title, description
- Retry button
- Subtle red border/tint

## Files to Change

| File | Change |
|------|--------|
| `app/globals.css` | Full color system rewrite |
| `components/app-shell.tsx` | Light theme sidebar + layout |
| `app/dashboard/page.tsx` | Redesign as command center |
| `app/command/page.tsx` | Light theme alignment |
| `components/premium/glass-card.tsx` | Light theme styling |
| `components/premium/metric-card.tsx` | Light theme + hover |
| `components/premium/score-ring.tsx` | Light theme colors |
| `components/premium/momentum-bar.tsx` | Light theme gradient |
| `components/premium/command-greeting.tsx` | Light theme hero |
| `components/premium/empty-state.tsx` | Light theme + illustration |
| `components/premium/loading-state.tsx` | Skeleton + shimmer |
| `components/premium/error-state.tsx` | Light theme alignment |
| `components/premium/signal-card.tsx` | Light theme |
| `components/premium/signal-panel.tsx` | Light theme |
| `components/premium/quest-grid.tsx` | Light theme |
| `components/premium/gamification.tsx` | Add level/XP display |
| `components/premium/collapsible-panel.tsx` | Light theme |
| `components/premium/today-focus.tsx` | Light theme |
| `components/premium/weekly-command.tsx` | Light theme |
| `components/premium/revision-queue.tsx` | Light theme |
| `components/premium/exam-countdown.tsx` | Light theme |
| `components/premium/focus-timer.tsx` | Light theme |
| `components/charts/study-charts.tsx` | Light colors + gradients |
| `components/ui/button.tsx` | Light theme variants |
| `components/ui/card.tsx` | Light theme |
| `components/ui/badge.tsx` | Light theme variants |
| `components/ui/input.tsx` | Light theme |
| `components/ui/sheet.tsx` | Light theme |
| `components/ui/dialog.tsx` | Light theme |
| `components/ui/select.tsx` | Light theme |
| `app/layout.tsx` | Remove color-scheme dark |
| `app/login/page.tsx` | Light theme |
| `app/login/login-form.tsx` | Light theme |

## Risks
- Broken color references if token rename is incomplete
- Chart readability if contrast is too low
- Cards may lose depth without dark glass effect
- Existing badges/tags may need manual color updates

## Verification Checklist
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes  
- [ ] Dashboard renders with light theme
- [ ] Navigation is readable and responsive
- [ ] Charts render with light colors
- [ ] Empty states display correctly
- [ ] Loading states display correctly  
- [ ] Cards have elevation/hover
- [ ] All premium components are light-aligned
- [ ] No dead dark backgrounds remain
- [ ] Gamification elements render with real data
- [ ] Mobile responsive
