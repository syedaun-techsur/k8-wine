---
phase: cellarlite-full-implementation-next-js-1
plan: "06"
subsystem: frontend-foundation
tags: [css, layout, brand-tokens, mobile-first, next-js]
dependency_graph:
  requires: [01, 02]
  provides: [styles/globals.css, app/layout.tsx]
  affects: [07, 08]
tech_stack:
  added: []
  patterns: [CSS custom properties, BEM-style class naming, mobile-first breakpoints, Next.js App Router Server Components]
key_files:
  created:
    - styles/globals.css
    - app/layout.tsx
  modified:
    - styles/globals.css (Task 2 appended responsive nav label classes)
decisions:
  - "Viewport exported separately from metadata as per Next.js 14 requirement"
  - "Nav uses responsive label spans (.nav__add-short / .nav__add-long) for mobile/desktop text variants"
  - "No CSS framework — plain CSS custom properties only"
  - "Pre-existing TypeScript errors in app/api/ (unrelated modules) are out of scope and deferred"
metrics:
  duration: ~1 minute
  completed: "2026-06-15"
  tasks_completed: 2
  files_modified: 2
---

# Phase cellarlite-full-implementation-next-js-1 Plan 06: Brand Identity Layer & Root Layout Summary

**One-liner:** Brand CSS tokens (8 custom properties), mobile-first component classes, and Next.js App Router root layout with sticky nav bar using plain CSS with no external framework.

## What Was Built

### Task 1: styles/globals.css
Created the complete brand design system as a single plain CSS file:

- **8 brand CSS custom properties** in `:root`: `--color-accent #FBCA5C` (gold), `--color-text #0A0A0A`, `--color-surface #FFFFFF`, `--color-accent-hover #E8B540`, `--color-error #D93025`, `--color-muted #6B7280`, `--color-border #E5E7EB`, `--color-destructive #B91C1C`
- **Mobile-first base reset**: `overflow-x: hidden` on html/body, `box-sizing: border-box` universal
- **`.container`**: Full-width at 375px, max-width 600px centred at ≥640px
- **`.nav`**: 56px sticky nav bar, white surface, border-bottom + subtle shadow
- **`.btn-primary`**: Gold background (`var(--color-accent)`), 48px height, disabled opacity 0.6
- **`.btn-destructive`**: Transparent background, red border/text, 44px height
- **`.form-input`**: `font-size: 16px` (iOS zoom prevention), 48px height, gold focus border
- **`.search-input`**: `font-size: 16px`, 44px height, icon-padded layout
- **`.bottle-row`**: `min-height: 56px` tap target, hover border-left accent
- Additional patterns: `.form-label`, `.form-group`, `.form-error`, `.error-banner`, `.btn-cancel`, `.empty-state`, `.page-heading`, `.not-found`, `.field-row-2`

### Task 2: app/layout.tsx + globals.css responsive nav labels
Created the Next.js App Router root layout as a Server Component:

- **No `'use client'`** — pure Server Component
- **`export const metadata`**: title "CellarLite", description
- **`export const viewport`**: `{ width: 'device-width', initialScale: 1 }` (exported separately per Next.js 14 requirement)
- **`import '../styles/globals.css'`** — relative path from app/ to styles/
- **Nav bar**: exactly two links — `My Cellar` → `/` (`.nav__brand`) and `+ Add` → `/bottles/new` (`.nav__add`)
- **`{children}`** rendered inside `<div className="container">` inside `<main>`
- **`<html lang="en">`** for accessibility
- **Appended to globals.css**: `.nav__add-long { display: none }` / `@media (min-width: 480px)` toggle for responsive "Add" vs "Add bottle" label

## Config Verification

Both pre-existing config files confirmed correct — no changes needed:

- **`next.config.mjs`**: `.mjs` ESM format, `X-Frame-Options: SAMEORIGIN` in headers (never DENY), no frame-blocking CSP
- **`package.json`** scripts: `migrate=node scripts/migrate.mjs`, `dev=npm run migrate && next dev -p 3000`, `start=npm run migrate && next start -p 3000`, `build=next build`

## Key Implementation Decisions

1. **BEM-style CSS naming**: `.block__element--modifier` pattern (e.g., `.bottle-row__name`, `.form-input--error`) for clear component scoping without a framework
2. **Responsive nav labels**: Used `<span className="nav__add-short">` / `<span className="nav__add-long">` with CSS show/hide to avoid JavaScript-based responsive logic in a Server Component
3. **`viewport` export separation**: Next.js 14 deprecates viewport in `metadata` object — exported as its own const to avoid console warnings
4. **Font-size 16px on all inputs**: Non-negotiable for iOS zoom prevention — applied to `.form-input`, `.search-input`, and `.html`/`body` base

## Deviations from Plan

None — plan executed exactly as written.

Pre-existing TypeScript errors in `app/api/bottles/route.ts` (missing `../../lib/db` and `../../types/bottle` modules) are out of scope for this plan and deferred to the relevant plan that implements those modules.

## Self-Check

### Files exist:
- ✅ `styles/globals.css` — created
- ✅ `app/layout.tsx` — created

### Commits:
- ✅ `be9816b` — feat(cellarlite-full-implementation-next-js-1-06): add brand CSS tokens and mobile-first base styles
- ✅ `d1f905b` — feat(cellarlite-full-implementation-next-js-1-06): add root layout with nav bar and responsive nav labels

## Self-Check: PASSED

## Wave 3B Consumption

Plans 07 and 08 (bottle list, add/edit pages) consume:
- `styles/globals.css` — all CSS classes (`.btn-primary`, `.btn-destructive`, `.form-input`, `.form-label`, `.bottle-row`, `.search-input`, `.container`, `.empty-state`, etc.)
- `app/layout.tsx` — shared nav bar and container (automatically applied by Next.js App Router)
- Brand tokens (`--color-accent`, `--color-text`, etc.) for any inline style overrides
