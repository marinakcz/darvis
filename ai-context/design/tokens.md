# Darvis — Design Tokens

All values from `src/app/globals.css`. Dark theme is the default (html has `class="dark"`).

## Surface Layers (OKLCh)

| Token | CSS Variable | Dark | Light | Usage |
|-------|-------------|------|-------|-------|
| `bg-surface-0` | `--surface-0` | oklch(0.13 0 0) | oklch(0.97 0 0) | Page canvas |
| `bg-surface-1` | `--surface-1` | oklch(0.17 0 0) | oklch(1 0 0) | Card / section |
| `bg-surface-2` | `--surface-2` | oklch(0.21 0 0) | oklch(0.96 0 0) | Nested group / row |
| `bg-surface-3` | `--surface-3` | oklch(0.25 0 0) | oklch(0.93 0 0) | Hover / active |

Surfaces separate by luminance, not borders. Borders are near-invisible (`oklch(1 0 0 / 7%)`).

## shadcn Base Tokens (Dark)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | oklch(0.13 0 0) | = L0 |
| `--foreground` | oklch(0.96 0 0) | Default text |
| `--card` | oklch(0.17 0 0) | = L1 |
| `--muted` | oklch(0.21 0 0) | = L2 |
| `--muted-foreground` | oklch(0.72 0 0) | = text-secondary |
| `--primary` | oklch(0.92 0 0) | Neutral button fill |
| `--primary-foreground` | oklch(0.13 0 0) | Text on primary |
| `--secondary` | oklch(0.21 0 0) | = L2 |
| `--accent` | oklch(0.21 0 0) | = L2 |
| `--destructive` | oklch(0.60 0.12 25) | Muted red |
| `--border` | oklch(1 0 0 / 7%) | Near-invisible |
| `--input` | oklch(1 0 0 / 10%) | Input border |
| `--ring` | oklch(0.50 0 0) | Focus ring |

## Text Hierarchy

| Token | CSS Variable | Dark Value | Contrast | WCAG |
|-------|-------------|------------|----------|------|
| `text-text-primary` | `--text-primary` | oklch(0.96 0 0) | 17:1+ | AAA |
| `text-text-secondary` | `--text-secondary` | oklch(0.72 0 0) | 7:1+ | AAA |
| `text-text-tertiary` | `--text-tertiary` | oklch(0.61 0 0) | 4.7:1+ | AA |

## Status Colors (Low Chroma)

| Token | CSS Variable | Dark Value | Hue | Usage |
|-------|-------------|------------|-----|-------|
| `text-status-survey` | `--status-survey` | oklch(0.70 0.08 240) | Steel blue | Survey phase |
| `text-status-execution` | `--status-execution` | oklch(0.68 0.08 160) | Sage green | Execution phase |
| `text-status-approval` | `--status-approval` | oklch(0.72 0.07 75) | Warm sand | Offer/approval |
| `text-status-invoicing` | `--status-invoicing` | oklch(0.65 0.06 300) | Soft lavender | Invoicing |
| `text-status-notification` | `--status-notification` | oklch(0.65 0.10 25) | Muted coral | Notifications/errors |

## Action Colors

| Token | CSS Variable | Dark Value | Usage |
|-------|-------------|------------|-------|
| `bg-success` | `--success` | oklch(0.65 0.10 160) | Green CTA (ActionButton) |
| `text-success-foreground` | `--success-foreground` | oklch(0.13 0 0) | Text on success |
| `bg-warning` | `--warning` | oklch(0.72 0.08 75) | Amber alerts |
| `text-warning-foreground` | `--warning-foreground` | oklch(0.25 0 0) | Text on warning |

## Typography

| Property | Value |
|----------|-------|
| `--font-sans` | -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif |
| `--font-mono` | "SF Mono", ui-monospace, SFMono-Regular, monospace |
| `--font-heading` | = --font-sans |
| Antialiasing | `antialiased` on `<html>` |

## Radius

| Token | Value |
|-------|-------|
| `--radius` | 0.625rem (10px) |
| `--radius-sm` | 0.375rem (6px) |
| `--radius-md` | 0.5rem (8px) |
| `--radius-lg` | 0.625rem (10px) |
| `--radius-xl` | 0.875rem (14px) |
| `--radius-2xl` | 1.125rem (18px) |
| `--radius-3xl` | 1.375rem (22px) |
| `--radius-4xl` | 1.625rem (26px) |

DS components use `rounded-2xl` (Surface, ActionButton, GhostButton, Alert) and `rounded-xl` (Group).

## Animations

| Class | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| `.ios-slide-in` | translateX(30px) + opacity | 300ms | ease-out |
| `.ios-fade-in` | opacity | 200ms | ease-out |
| `.ios-sheet-content` | translateY(100%) | 300ms | ease-out |
| `.ios-sheet-backdrop` | opacity (= iosFadeIn) | 200ms | ease-out |

## Scrollbar

Hidden everywhere:
- `scrollbar-width: none` (Firefox)
- `-ms-overflow-style: none` (IE/Edge)
- `::-webkit-scrollbar { display: none }` (Chrome/Safari)

## Safe Area (iOS)

Body applies `env(safe-area-inset-*)` for all four sides. Sticky CTAs use `pb-[env(safe-area-inset-bottom)]`. PWA standalone mode disables `overscroll-behavior-y`.
