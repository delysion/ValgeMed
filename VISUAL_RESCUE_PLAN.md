# ELISE OS Visual Rescue Plan

> Brutally honest diagnosis and systematic recovery strategy.

---

## Skills

**Available:**
- frontend-design
- web-design-guidelines
- shadcn
- next-best-practices
- vercel-react-best-practices
- vercel-composition-patterns
- webapp-testing
- systematic-debugging
- verification-before-completion
- improve-codebase-architecture
- writing-plans
- requesting-code-review

**Missing:** None.

---

## Brutal Diagnosis

The app is **not terrible** but it is **not good enough**. It feels like a shadcn starter template with custom colors spray-painted on top. It lacks intention, polish, and emotional engagement. Light mode is especially gray and flat. Mobile is squeezed rather than designed.

---

## Top Visual Defects

1. **Flat, uninspiring light mode**: Background is warm off-white but cards are pure white with thin gray borders — looks like every default admin panel. No depth, no warmth, no premium feel.
2. **Typography is timid**: Too many `text-[9px]`, `text-[10px]` micro-labels. Hierarchy is weak. Font is Geist (good) but used without confidence.
3. **Color system is almost there but not cohesive**: Accent colors (cyan, violet, emerald, gold, rose) are used randomly without a clear system. Primary indigo is fine but lacks energy.
4. **Cards lack internal rhythm**: GlassCard has no default padding — every caller adds their own `p-6`, `mt-5`, `mt-4` inconsistently.
5. **Shadows are too subtle**: `--shadow-card` is barely visible in light mode. Cards visually float without grounding.
6. **Generic hero gradient**: The `from-primary-soft via-white to-cyan-bg/50` gradient on heroes looks like a Canva template.
7. **No visual texture or depth**: Everything is flat solid color. No subtle gradients on cards, no refined borders, no layer separation.
8. **Badge sizes are inconsistent**: Some badges use `text-[10px]`, others `text-xs`, with varying padding.

---

## Top Mobile Defects

1. **Dashboard stat row overflows**: `xl:grid-cols-5` with 5 MetricCards at 360px becomes unreadable crammed cards.
2. **Mobile nav trigger uses wrong icon**: `ClipboardList` instead of a hamburger/menu icon.
3. **Sheet sidebar is too wide**: `w-[min(90vw,300px)]` — okay but could be better.
4. **Tables likely broken on mobile**: No evidence of card-list conversion for tables at small widths.
5. **Form fields too small on mobile**: Touch targets are okay (44px buttons) but inputs feel cramped in `FieldGrid` with 4 columns on desktop shrinking to 2 on mobile.
6. **Page padding inconsistent**: `px-3` on mobile, `sm:px-5`, `lg:px-6` — creates visual jumps.
7. **Hero section too tall on mobile**: `p-6` with large title and multiple badge rows wastes precious vertical space.
8. **Focus Areas list items**: On mobile, the confidence bar + arrow create tight horizontal space.

---

## Top Light-Mode Defects

1. **Gray-on-gray fatigue**: `--text-muted: #9CA3AF` on `--bg-page: #F8F7F4` with `--bg-surface: #FFFFFF` creates a low-contrast, washed-out look.
2. **Borders are too light**: `--border: #E5E4E0` is almost invisible, making card separation weak.
3. **Primary color lacks warmth**: `#4F46E5` is a cold corporate indigo. Needs more life.
4. **No warm accent**: The palette is cool-dominant (indigo, cyan, violet). Needs a warm premium accent.
5. **Selection color too subtle**: `rgba(79, 70, 229, 0.15)` is barely visible.
6. **Empty states are cold**: Dashed border, white background, generic icon. Not inviting.
7. **Scrollbar styling is okay but invisible**: In light mode, scrollbar thumb is nearly invisible.

---

## Top UX Defects

1. **Forms feel mechanical**: Labels are all caps or tiny semibold. Placeholders are sparse. No inline examples.
2. **No loading skeletons**: Data tables and lists likely just appear or show "No data" abruptly.
3. **Empty states lack guidance**: "Nothing here yet" doesn't tell the user what to do.
4. **Login is generic**: Centered form on blank background. No visual reward, no personality.
5. **Command page is overwhelming**: Too many cards, too much information density, no clear focal point.
6. **Navigation is exhausting**: 24+ nav items in sidebar with tiny section labels. Cognitive overload.
7. **No microinteractions on buttons**: Aside from `active:scale-[0.97]`, buttons feel static.
8. **Error states are plain**: Red border + text. No icon, no helpful recovery suggestion.
9. **Italian strings in codebase**: `lib/scoring/engine.ts`, `lib/actions/resources.ts`, `lib/validators/schemas.ts`, `lib/labels.ts`, `scripts/hash-password.ts`.

---

## Boring / Non-Inviting Areas

1. **Login page**: Centered box, no atmosphere.
2. **Settings page**: Bare cards with icons and text. No visual interest.
3. **Form pages**: Card → form → submit. No progressive disclosure, no encouragement.
4. **Empty tables/lists**: "Nothing here yet" is not a welcoming first experience.
5. **Dashboard hero**: The gradient blobs feel like a generic SaaS template.
6. **Study session list**: Brain icon for every method. No method-specific icons.

---

## Pages/Components Needing Redesign

1. **Login page** — Needs atmosphere, depth, warmth, and a premium auth experience.
2. **Dashboard hero** — Needs better composition, hierarchy, and visual reward.
3. **MetricCard** — Needs better visual weight and mobile behavior.
4. **EmptyState** — Needs to be more inviting with clearer CTAs.
5. **AppShell / Navigation** — Needs better mobile UX and possibly collapsible desktop sections.
6. **Forms (entity-forms.tsx)** — Needs grouping, better labels, inline help, and mobile optimization.
7. **GlassCard** — Needs consistent internal padding and better depth.
8. **PageHeader** — Needs more presence and better alignment.
9. **Settings page** — Needs better card design and visual hierarchy.
10. **Command page** — Needs clearer focal points and reduced visual noise.

---

## Design System Changes Needed

1. **Color tokens**:
   - Warm up the light mode background slightly.
   - Strengthen borders for better card separation.
   - Add a warm premium accent (amber/coral) alongside indigo.
   - Improve muted text contrast.
   - Add a subtle warm tint to card backgrounds instead of pure white.

2. **Shadows**:
   - Increase `--shadow-card` visibility in light mode.
   - Add `--shadow-inner` for inset depth on inputs.

3. **Border radius**:
   - Standardize: cards `rounded-2xl` (16px), buttons `rounded-xl` (12px), inputs `rounded-lg` (8px).
   - Currently inconsistent: cards use `rounded-xl`, hero uses `rounded-2xl`.

4. **Typography**:
   - Eliminate `text-[9px]` and `text-[10px]` wherever possible. Minimum `text-xs` (12px).
   - Increase line-height on body text.
   - Use font-weight more deliberately: 500 for labels, 600 for headings, 700 for hero.

5. **Spacing**:
   - Standardize page padding: `px-4 sm:px-6 lg:px-8`.
   - Standardize card padding: `p-5 sm:p-6`.
   - Standardize section gap: `gap-6` consistently.

6. **Focus states**:
   - Improve input focus ring visibility and color.
   - Add focus-visible styles to interactive cards.

---

## Mobile Strategy

1. **Breakpoints**: Use `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px` consistently.
2. **Stat row**: At mobile, make MetricCards stack vertically with horizontal layout (icon left, text right) instead of tiny stacked cards.
3. **Tables**: Convert to card lists at `< md` whenever possible.
4. **Navigation**: Collapse to bottom sheet or hamburger. Reduce nav items shown by default; show favorites + search.
5. **Forms**: Single column on mobile. Full-width inputs. Larger tap targets.
6. **Hero**: Compact layout on mobile — smaller title, badges in a single row, reduced padding.
7. **Dashboard grid**: Stack everything at mobile. Left/right columns become single column.

---

## Interaction Strategy

1. **Hover states**: Cards lift with enhanced shadow. Buttons gain subtle background glow.
2. **Focus states**: Visible rings with primary color. Inputs get a soft glow.
3. **Active states**: Buttons scale down slightly (already present). Add tactile feedback to cards.
4. **Transitions**: Standardize to `duration-200` with `cubic-bezier(0.16, 1, 0.3, 1)` for entrances.
5. **Empty states**: Add a subtle pulse/animation to the icon to draw attention.
6. **Loading**: Add Skeleton component usage to data-heavy pages.
7. **Success feedback**: Toast or inline confirmation after form submission.

---

## Exact Files Likely to Change

### Design System
- `app/globals.css` — tokens, shadows, animations
- `components/ui/button.tsx` — variants, sizes, interactions
- `components/ui/input.tsx` — focus states, styling
- `components/ui/card.tsx` — padding, border-radius
- `components/ui/badge.tsx` — sizing consistency
- `components/ui/label.tsx` — typography

### Layout & Navigation
- `components/app-shell.tsx` — padding, mobile nav, alignment
- `components/theme-toggle.tsx` — visual refinement

### Components
- `components/premium/glass-card.tsx` — padding, depth, tone system
- `components/premium/empty-state.tsx` — inviting design, CTA
- `components/premium/metric-card.tsx` — mobile layout, visual weight
- `components/premium/section-header.tsx` — typography, spacing
- `components/premium/command-greeting.tsx` — hero refinement

### Pages
- `app/login/page.tsx` — atmosphere, layout
- `app/login/login-form.tsx` — field styling, validation UX
- `app/dashboard/page.tsx` — alignment, mobile, hierarchy
- `app/command/page.tsx` — visual noise reduction
- `app/settings/page.tsx` — card design, spacing

### Forms
- `components/forms/fields.tsx` — labels, spacing, mobile
- `components/forms/entity-forms.tsx` — grouping, helpers, placeholders

### Localization / Bugs
- `lib/scoring/engine.ts` — remove Italian
- `lib/actions/resources.ts` — remove Italian
- `lib/validators/schemas.ts` — remove Italian
- `lib/labels.ts` — remove Italian locale default
- `scripts/hash-password.ts` — remove Italian

---

## Implementation Order

### Phase 1: Design System Foundation
1. `app/globals.css` — improve light mode tokens, shadows, borders
2. `components/ui/*.tsx` — standardize radius, padding, focus states
3. `components/premium/glass-card.tsx` — add default padding, improve depth

### Phase 2: Layout & Alignment
4. `components/app-shell.tsx` — fix mobile nav icon, standardize page padding
5. `components/premium/page-shell.tsx` (create) — consistent page wrapper
6. `app/dashboard/page.tsx` — fix stat row mobile, hero mobile, alignment
7. `app/command/page.tsx` — reduce noise, improve hierarchy

### Phase 3: Mobile Rescue
8. `components/premium/metric-card.tsx` — horizontal mobile layout
9. `components/forms/fields.tsx` — full-width mobile, larger touch targets
10. All page grids — ensure clean mobile stacking

### Phase 4: Interactivity & Premium Feel
11. `components/premium/empty-state.tsx` — inviting redesign
12. `app/login/page.tsx` + `login-form.tsx` — premium auth experience
13. `components/ui/button.tsx` — enhanced hover/active states
14. Add skeleton loading to data pages

### Phase 5: Forms & UX
15. `components/forms/entity-forms.tsx` — better labels, placeholders, grouping
16. Add helper text and examples to all major forms

### Phase 6: Localization Cleanup
17. Remove all Italian strings from codebase

### Phase 7: Bug Sweep & Verification
18. Fix any console errors, hydration issues
19. Run lint, typecheck, build
20. Screenshot verification at all breakpoints

---

## Verification Checklist

- [ ] Light mode looks premium, warm, and intentional
- [ ] Dark mode looks atmospheric and readable
- [ ] Mobile (360px) is fully usable with no horizontal overflow
- [ ] Mobile (390px, 430px) looks designed, not squeezed
- [ ] Tablet (768px) has good proportions
- [ ] Desktop (1024px, 1440px) is visually aligned
- [ ] Login page feels premium and works with username+password
- [ ] Dashboard hero is compelling on all sizes
- [ ] Metric cards are readable on mobile
- [ ] Forms have helpful labels, placeholders, and examples
- [ ] Empty states guide the user
- [ ] Navigation works on mobile
- [ ] No Italian UI strings remain
- [ ] Estonian dictionary is complete
- [ ] Build passes (`pnpm build`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] No major console errors

---

## Honest Pre-Rescue Score

**Light mode:** 45/100 — functional but flat, gray, and uninspiring.
**Dark mode:** 50/100 — better atmosphere but still generic.
**Mobile:** 40/100 — usable but cramped, with overflow risks and poor hierarchy.
**Desktop:** 55/100 — aligned enough but lacks polish and visual reward.
**Forms:** 50/100 — functional but cold and mechanical.
**Login:** 50/100 — clean but generic and forgettable.
**Overall:** 48/100 — Not acceptable for a premium product.

---

## Target Post-Rescue Score

**Overall:** 85/100 — Premium, inviting, responsive, and polished.
