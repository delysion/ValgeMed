# Mobile UX Overhaul — Design Spec

> **For agentic workers:** Bottom tab bar + enhanced drawer + simplified mobile header + touch refinements.

**Goal:** Bring mobile navigation to industry-standard UX with a bottom tab bar, streamlined header, and touch-friendly interactions — while keeping all desktop UI intact.

**Architecture:** Three files: new `mobile-nav.tsx` (bottom tab bar), new `mobile-drawer.tsx` (full-screen navigation for "More" tab), modified `app-shell.tsx` (responsive switching, simplified header on mobile). Most page content already responsive — only minor Tailwind touch-ups needed.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui Sheet, Lucide icons.

---

## Components

### `components/mobile-nav.tsx` [NEW]
- Fixed bottom bar, visible only on `< lg` breakpoint
- 4 tabs: Command, Studio, Goals, More
- Each tab: Lucide icon + short label, active state = primary color + glow
- `h-14` (56px), dark glass background matching theme
- Hide/show on scroll direction (down = hide, up = show)
- Tabs link to their primary route (Command → `/command`, Studio → `/study`, Goals → `/goals`)
- "More" tab opens MobileDrawer

### `components/mobile-drawer.tsx` [NEW]
- Full-screen sheet (slide from left), same as current Navigation but enhanced
- Reuses the existing `sections` data structure from Navigation
- Sections always expanded (no accordion collapse on mobile)
- Larger touch targets: `py-3` instead of `py-2.5`
- Includes at bottom: ThemeToggle, LanguageSelector, Logout
- AdminPendingBadge included for admin users
- Close on navigation

### `components/app-shell.tsx` [MODIFIED]
- Import and render `<MobileNav />` below `<main>` on mobile
- Mobile header: hamburger (left) + page title (center), `h-12` (48px)
- Desktop header: keep current full header (owner name, theme, language, export, logout)
- `lg:` breakpoint switches between mobile and desktop layout
- Bottom bar hidden when sidebar visible (`lg:`)

---

## Behavior

- `< lg` (mobile): Bottom tab bar visible, mobile header compact
- `>= lg` (desktop): Sidebar visible, full header, no bottom bar
- Scroll down on mobile → bottom bar hides (intersection observer pattern)
- Scroll up → bottom bar reappears
- Tap "More" or hamburger → MobileDrawer opens
- MobileDrawer closes on navigation or tap-away

---

## Touch Refinements

- All interactive elements in nav/drawer: `min-h-[44px]` (iOS HIG minimum)
- `active:scale-[0.97]` press effect on tab items
- Tab bar items: `gap-1` icon+label, `text-[10px]` label, `h-5 w-5` icon
- Focus/hover states work with touch

---

## File Changes

| File | Action |
|------|--------|
| `components/mobile-nav.tsx` | Create |
| `components/mobile-drawer.tsx` | Create |
| `components/app-shell.tsx` | Modify (add imports, mobile header, bottom bar) |

No page content files need changes — existing responsive grids handle mobile layout.
