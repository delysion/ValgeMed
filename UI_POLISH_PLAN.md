# UI Polish Plan — ELISE OS

## Current Problems

### Visual Design
- No dark mode, only light theme
- Flat, generic shadcn defaults
- Purple primary feels dated
- Card shadows are minimal (0 1px 3px)
- No visual depth/intentional layering
- PageHeader is always a white card — formulaic
- SectionHeader icon color is muted-2 on light bg (invisible)
- No background texture or atmosphere
- Geist font is clean but generic for a "premium OS"

### Mobile
- Sidebar hidden behind Sheet (OK) but no mobile-specific content optimization
- No responsive table handling
- Cards stack but lack mobile spacing
- Login page is centered card only — no visual interest on mobile

### Dark Mode
- Completely missing — no dark CSS variables at all
- All colors hardcoded for light only

### Color System
- Custom CSS vars but no dark equivalents
- `--primary-soft` (#F5F3FF) is barely visible
- `--border` (#E2E8F0) too light for premium feel
- No `--color-background`/`--color-foreground` semantic tokens
- Purple (#7C3AED) is a risky primary — can look cheap

### Forms / UX
- Labels are functional but not helpful
- Placeholders are empty/missing on most fields
- No helper text explaining *why* a field matters
- No smart defaults beyond dates
- No suggestions/chips
- Submit button always says "Save/Create X" — fine but could be more action-oriented
- Empty states exist but are static

### Login
- Password only — no username field
- `OWNER_EMAIL` exists but unused in login flow
- Login page has no visual appeal — just a card on gray
- App name displayed but no brand experience
- Error messages are basic

### Localization
- Italian error strings in session.ts, db/index.ts, seed.ts
- English and Estonian dictionaries are complete
- No Italian in UI strings (good)

### Auth
- JWT-based, bcrypt password, works fine
- Adding username validation requires env var only
- No registration — single-owner, correct

### Professional Polish
- No `loading="lazy"`/priority hints on images (none used, so fine)
- Some dashboard components use `space-y-*` instead of `gap-*` (shadcn rule)
- Redundant imports in some pages
- No keyboard navigation improvements needed beyond defaults
- No obvious performance issues

---

## Files to Change

| File | Changes |
|------|---------|
| `app/globals.css` | Add dark mode CSS variables, improve light colors, add background textures, add theme transition |
| `app/layout.tsx` | Add theme class, suppressHydrationWarning already there |
| `app/login/page.tsx` | Add username field copy, improve layout |
| `app/login/login-form.tsx` | Add username input, premium visual redesign |
| `lib/auth/constants.ts` | Add USERNAME_COOKIE? No — keep simple |
| `lib/auth/session.ts` | Fix Italian → English error messages |
| `lib/auth/actions.ts` | Add username validation against APP_USERNAME env var |
| `lib/db/index.ts` | Fix Italian → English error message |
| `scripts/seed.ts` | Fix Italian → English error message |
| `.env.example` | Add APP_USERNAME |
| `components/app-shell.tsx` | Improve sidebar premium feel, add dark mode toggle, mobile improvements |
| `components/language-selector.tsx` | Minor style updates |
| `components/ui/button.tsx` | Add subtle hover improvements |
| `components/ui/card.tsx` | Improve card with dark mode support |
| `components/ui/badge.tsx` | Improve badge styles |
| `components/ui/input.tsx` | Improve input focus/placeholder |
| `components/premium/empty-state.tsx` | Better tone + animation |
| `components/premium/loading-state.tsx` | Consistent styling |
| `components/premium/error-state.tsx` | Consistent styling |
| `components/premium/section-header.tsx` | Fix icon visibility |
| `components/premium/glass-card.tsx` | Dark mode support |
| `components/premium/metric-card.tsx` | Polish |
| `components/forms/fields.tsx` | Better fields with hints, placeholders, descriptions |
| `components/forms/entity-forms.tsx` | Better form microcopy, placeholders, descriptions |
| `components/theme-toggle.tsx` | NEW — theme switcher component |
| `lib/theme/actions.ts` | NEW — server action for theme cookie |
| `lib/i18n/dictionaries/en.ts` | Add login.username key |
| `lib/i18n/dictionaries/et.ts` | Add login.username key in Estonian |

---

## Implementation Order

1. **Phase 8: Localization cleanup** — Italian → English (quick wins)
2. **Phase 4: Colors + Dark mode** — CSS variables, dark theme, theme toggle
3. **Phase 3: Visual redesign** — Premium polish pass
4. **Phase 5: Mobile** — Responsive fixes
5. **Phase 6: Login** — Username field + better login page
6. **Phase 7: Forms** — Better microcopy, placeholders, hints
7. **Phase 9: Professional optimization** — Component cleanup

---

## Risk Areas
- Dark mode: must not break existing components using hardcoded colors
- Auth: username must not break existing password-only flow
- Forms: Placeholder changes must not affect existing functionality
- Mobile: Must not break desktop layout

---

## Verification Checklist
- [ ] No Italian strings remain in source
- [ ] Login works with username + password
- [ ] Dark mode toggle works, persists, no flash
- [ ] All pages render in light + dark mode
- [ ] Mobile layout at 390px is usable
- [ ] Forms have better placeholders/microcopy
- [ ] Build passes (`pnpm build`)
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
