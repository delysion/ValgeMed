# Mobile UX Refinement — Spring 2026

## Goal
Elevate ValgeMed's mobile experience with balanced visual polish and functional UX improvements across the tab bar, navigation drawer, mobile header, and global interactions.

## Changes

### 1. Tab Bar (`components/mobile-nav.tsx`)
- **Spring-like show/hide**: CSS cubic-bezier `(0.22, 1, 0.36, 1)` over 400ms replaces the default ease. This bezier (overshoot-free spring approximation) gives a buttery slide feel without adding framer-motion.
- **Active tab indicator**: A gradient pill `(from-ice via-primary to-violet)` sits above the active tab, giving clear visual context without relying solely on icon color.
- **Active icon glow**: `drop-shadow-[0_2px_4px_rgba(0,180,255,0.25)]` on the active icon adds a subtle ice-blue glow.
- **Tap feedback**: `active:scale-[0.92]` on tab buttons for immediate tactile response.
- **Larger touch targets**: `min-w-[60px] min-h-[48px]` per tab, exceeding the 44px minimum.

### 2. Navigation Drawer (`components/mobile-drawer.tsx`)
- **Slide-in spring**: Panel uses `translate-x` with `cubic-bezier(0.22, 1, 0.36, 1)` over 400ms. Drawer stays in DOM (no conditional render) so both enter/exit animations play smoothly.
- **Stagger entrance**: Each nav item gets an increasing `transition-delay` via inline `style` (180ms base + section offset + item offset). Items start `-translate-x-3 opacity-0` and slide in on open.
- **Backdrop animation**: Full-screen backdrop fades in/out over 300ms with blur-sm.
- **User display name**: `displayName` prop renders below the app name in the drawer header (instead of always showing tagline), providing personal context.
- **Theme label removed**: Cleaner layout without redundant "Theme" label next to the toggle.
- **Consistent tap**: All interactive items use `active:scale-[0.96]` or `active:scale-[0.92]`.

### 3. Mobile Header (`components/app-shell.tsx`)
- **Dynamic page title**: Header shows the current page's translated name (via `pageTitleKeys` mapping → `t()`) instead of always displaying "ValgeMed". Falls back to app name for unmatched routes.
- **Compact layout**: Reduced from `h-12` to `h-11`, narrower padding (`px-3` instead of `px-4`), smaller menu button (h-8/w-8), smaller logo (h-6/w-6). Maximizes content space on mobile.
- **Cleaner imports**: Removed unused `dictionaries` and `en` imports.
- **Drawer receives display name**: `displayName` prop passed through to `MobileDrawer`.

### 4. Global Polish (`app/globals.css`)
- **View Transitions**: CSS `@view-transition { navigation: auto }` enables cross-document view transitions. `::view-transition-old(root)` fades out, `::view-transition-new(root)` fades in — a subtle 200-300ms crossfade between page navigations.
- **Utility classes**: `tap-sm` (scale 0.97), `tap-md` (scale 0.95), `card-lift` (hover lift + active reset) for consistent interaction patterns across the app.

## Files Modified
| File | Change |
|------|--------|
| `components/mobile-nav.tsx` | Spring bezier, active indicator, glow, bigger touch targets |
| `components/mobile-drawer.tsx` | Slide/stagger animation, display name, cleaner section/items |
| `components/app-shell.tsx` | Dynamic title, compact header, `displayName` pass-through, unused import cleanup |
| `app/globals.css` | View transitions, tap-md/tap-sm/card-lift utilities |
| `components/export-buttons.tsx` | `locale === "et"` → `t("export.zip")` / `t("export.failed")` |
| `lib/i18n/dictionaries/en.ts` | Added `export.zip`, `export.failed` keys |
| `lib/i18n/dictionaries/et.ts` | Added `export.zip`, `export.failed` keys |

## Future Opportunities
- Pull-to-refresh for data pages
- Toast/snackbar system for action feedback
- Badge counts on tab bar items (unread reviews, overdue items)
- Bottom sheet for "more" tab actions instead of always opening drawer
