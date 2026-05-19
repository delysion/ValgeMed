# VISUAL DEFECTS — ROUND 2 (Fixed)

## Fixed

### 1. ALL animations broken — `no-premium` → `no-preference` ✅
`globals.css` line 171: Fixed media query from `no-premium` to `no-preference`.
Result: All animations, transitions, card hover effects, fade-ins now work.

### 2. Login card visual depth ✅
Added `bg-gradient-to-b from-bg-surface to-bg-elevated`, `ring-1 ring-black/[0.02]`, `border-border/60`.

### 3. Login placeholders ✅
Changed to "Your username" / "Your password" — cleaner.

### 4. Active nav state ✅
Created `nav-link.tsx` client component with `usePathname()`. Active items get `bg-primary text-white` styling.

### 5. Sidebar header text ✅
Increased from `text-xs` to `text-[11px]` for label, `text-sm` for app name.

### 6. Mobile Sheet close button ✅
Increased padding from `p-1.5` to `p-2`, added `rounded-lg` for better visibility.

### 7. Header shows display name ✅
`session.email.split("@")[0]` instead of raw email.

### 8. Hero gradient more visible ✅
Increased blob opacity from `/6` and `/5` to `/8`. Changed `via-bg-elevated` to `via-white`.

### 9. Focus Areas confidence bar ✅
Increased from `h-2` to `h-2.5`, added `sm:w-24` for desktop.

### 10. CollapsiblePanel badge ✅
Changed `bg-white/5` to `bg-bg-subtle` — visible in light mode.

### 11. Native select chevron ✅
Added `ChevronDown` icon with `appearance-none` and `pr-10` padding.

### 12. Weight cards visual bars ✅
Added progress bars with tone colors showing relative weight distribution.

### 13. PageHeader simplified ✅
Removed white card wrapper — now just text with proper spacing.

### 14. Shadows stronger ✅
Increased `--shadow-card` and `--shadow-elevated` values for better depth.

### 15. Loading skeletons ✅
`app/loading.tsx` and `app/command/loading.tsx` with proper skeleton layouts.

## Remaining (minor)

- Empty states could have more variety per page
- Some pages could use page-specific loading skeletons
- MetricCard mobile layout could be more refined
