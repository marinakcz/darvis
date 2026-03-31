# Darvis — Project-Specific Rules

Rules that apply ONLY to this project. Studio-level rules (no useEffect, shadcn/ui, Tailwind everywhere) are inherited from the root CLAUDE.md.

## Mobile/Tablet First

- Every component MUST work on 375px+ screens
- Touch targets: min 44px height (`min-h-[44px]`)
- Viewport is locked: `maximumScale: 1, userScalable: false, viewportFit: "cover"`
- Body uses `env(safe-area-inset-*)` padding for iOS notch/home indicator
- PWA mode supported (`manifest.json`, `appleWebApp`, `display-mode: standalone`)

## Custom DS over shadcn

- Prefer `@/components/ds` components (Surface, Group, Row, TapRow, ActionButton, GhostButton, Alert, Stat, SectionHeader) over raw shadcn equivalents
- DS components follow the layered surface model (L0-L3), shadcn Card/Button are fallbacks for admin or generic UI only
- Surface = L1, Group = L2 (nested), Row = key-value inside Group

## Surface Layering (Dark Theme)

- L0 `bg-surface-0` / `bg-background` = page canvas (oklch 0.13)
- L1 `bg-surface-1` / `bg-card` = card/section (oklch 0.17)
- L2 `bg-surface-2` / `bg-muted` = nested group/row (oklch 0.21)
- L3 `bg-surface-3` = hover/active state (oklch 0.25)
- Borders are near-invisible — surfaces separate by luminance, not lines

## iOS Animations

- Page transitions: `ios-slide-in` (300ms translateX) or `ios-fade-in` (200ms opacity)
- Bottom sheets: `ios-sheet-content` (300ms translateY) with `ios-sheet-backdrop` (fade)
- Scrollbars are hidden everywhere (scrollbar-width: none)
- `-webkit-overflow-scrolling: touch` enabled

## Drizzle ORM

- Schema in `src/lib/db/schema.ts`, connection in `src/lib/db/index.ts`
- Import pattern: `import { db, schema } from "@/lib/db"`
- Query operators: `import { eq, desc, ... } from "drizzle-orm"`
- Always use `export const dynamic = "force-dynamic"` on API routes that read DB
- Use `.returning()` after insert/update to get the created row

## Local Dev Default

- Default workflow: `next dev` locally
- Deploy to Vercel only for sharing with client (not continuous deploy)
- Push only finished work to GitHub

## Client-First Hydration

- Pages are `"use client"` with a `useIsMounted()` hydration guard:
  ```ts
  function useIsMounted() {
    return useSyncExternalStore(() => () => {}, () => true, () => false)
  }
  ```
- Fetch data after mount check: `if (mounted && !loaded) { ... fetch ... }`
- Show loader (Loader2 spinner) while `!mounted || loading`
- This avoids SSR/client mismatch for dynamic data

## Language

- UI text is in Czech (cs locale)
- Code (variables, comments, commits) in English
- `lang="cs"` on `<html>`
