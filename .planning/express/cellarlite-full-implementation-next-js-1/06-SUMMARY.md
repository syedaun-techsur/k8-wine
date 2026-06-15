---
phase: cellarlite-full-implementation-next-js-1
plan: "06"
subsystem: brand-ui
tags: [css, layout, design-system, mobile-first, next-js]
dependency_graph:
  requires: [plan-01, plan-02]
  provides: [styles/globals.css, app/layout.tsx]
  affects: [app/bottles/new/page.tsx, app/bottles/[id]/edit/page.tsx, app/page.tsx]
tech_stack:
  added: []
  patterns: [BEM CSS class naming, CSS custom properties, Next.js App Router Server Component, mobile-first CSS]
key_files:
  created:
    - styles/globals.css
  modified:
    - app/layout.tsx
decisions:
  - "Used relative import '../styles/globals.css' in layout per plan spec (both @/ alias and relative path work due to tsconfig paths)"
  - "Exported viewport separately from metadata per Next.js 14 requirement"
  - "Updated nav class names from nav-logo/nav-add (prior commit) to nav__brand/nav__add BEM naming to match globals.css"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-15T22:53:57Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase cellarlite-full-implementation-next-js-1 Plan 06: Brand & Layout Foundation Summary

**One-liner:** CSS design system with 8 brand tokens, mobile-first component classes, and Next.js root layout with BEM nav bar.

## What Was Built

### styles/globals.css (created — 456 lines)
Complete brand design system and mobile-first CSS foundation:
- **8 CSS custom properties** in `:root`: `--color-accent #FBCA5C`, `--color-text #0A0A0A`, `--color-surface #FFFFFF`, `--color-accent-hover #E8B540`, `--color-error #D93025`, `--color-muted #6B7280`, `--color-border #E5E7EB`, `--color-destructive #B91C1C`
- **Base reset**: box-sizing, overflow-x: hidden, system font stack
- **Layout**: `.container` (full-width mobile, max-width 600px ≥640px)
- **Nav**: `.nav` (56px height, sticky), `.nav__brand`, `.nav__add`, `.nav__add-short`/`.nav__add-long` responsive labels
- **Forms**: `.form-input` (16px font-size, iOS zoom prevention), `.form-label`, `.form-group`, `.form-error`, `.error-banner`
- **Buttons**: `.btn-primary` (gold, 48px, disabled 0.6 opacity), `.btn-destructive` (transparent, red border, 44px), `.btn-cancel`
- **List UI**: `.bottle-row` (min-height 56px tap target), `.bottle-row__name`, `.bottle-row__meta`
- **Search**: `.search-input` (16px font-size), `.search-input-wrapper`, `.search-input-icon`
- **State/utility**: `.empty-state`, `.page-heading`, `.not-found`, `.field-row-2` (2-col grid ≥480px), `.btn-separator`
- **No external CSS framework** — plain CSS only (F07-REQ-08)

### app/layout.tsx (updated — 56 lines)
Next.js App Router root layout Server Component:
- Exports `metadata` (title: "CellarLite") and `viewport` (device-width, initial-scale: 1) separately per Next.js 14 requirement
- Imports `'../styles/globals.css'` (relative path from app/ to styles/)
- Nav bar with exactly two links: `My Cellar` → `/` (class `nav__brand`) and `+ Add / + Add bottle` → `/bottles/new` (class `nav__add`)
- `{children}` rendered in `<div className="container">` inside `<main>`
- `<html lang="en">` for accessibility
- No `'use client'` directive — pure Server Component
- No `X-Frame-Options` or CSP meta tags — those are set in `next.config.mjs`

### Config verification (no changes needed)
- `next.config.mjs`: Already correct — `.mjs` ESM, `X-Frame-Options: SAMEORIGIN`, no `.ts` config present
- `package.json` scripts: Already exact — `migrate`, `dev`, `start`, `build` all correct

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `4b27854` | feat: add styles/globals.css brand tokens and mobile-first base |
| Task 2 | `e37108c` | feat: add app/layout.tsx root layout and nav label CSS |

## Key Implementation Decisions

1. **BEM class naming**: CSS uses BEM-style double underscores (`nav__brand`, `nav__add`, `bottle-row__name`) for clear component-element relationships. This differs from the nav class names in a prior commit (`nav-logo`, `nav-add`) which were updated to match.

2. **Relative import path**: Plan specifies `'../styles/globals.css'`. Both `@/styles/globals.css` (tsconfig alias) and the relative path work; relative path is used as specified.

3. **Viewport as separate export**: Next.js 14 deprecated viewport inside `metadata`. The plan correctly specifies exporting `viewport` separately — avoids deprecation warnings.

4. **Nav label responsiveness**: `.nav__add-short` (mobile: "Add") and `.nav__add-long` (≥480px: " bottle") controlled via CSS media query — no JavaScript needed.

5. **16px font-size enforcement**: Both `.form-input` and `.search-input` explicitly set `font-size: 16px` to prevent iOS Safari auto-zoom (US-7.1 non-negotiable requirement).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated nav class names to match globals.css BEM naming**
- **Found during:** Task 2
- **Issue:** A prior commit (`950beed`) had created `app/layout.tsx` using class names `nav-logo`, `nav-add`, `nav-inner` and `@/styles/globals.css` import alias. The new `styles/globals.css` from Task 1 defines `.nav__brand` and `.nav__add` (BEM naming). Without alignment, the nav styles would not apply.
- **Fix:** Updated `app/layout.tsx` to use `nav__brand` and `nav__add` class names, changed import to `'../styles/globals.css'` relative path, removed `nav-inner` wrapper div, added `viewport` export.
- **Files modified:** `app/layout.tsx`
- **Commit:** `e37108c`

## Self-Check

### Files Exist
- [x] `styles/globals.css` — FOUND
- [x] `app/layout.tsx` — FOUND

### Commits Exist
- [x] `4b27854` — FOUND (styles/globals.css)
- [x] `e37108c` — FOUND (app/layout.tsx)

### Contract Verification
- [x] `next.config.mjs` has `SAMEORIGIN` — PASSED
- [x] `package.json` scripts exact — PASSED (SCRIPTS EXACT: true)
- [x] All 8 brand tokens present — PASSED
- [x] `export default function RootLayout` present — PASSED
- [x] globals.css import in layout — PASSED
- [x] `/bottles/new` link in nav — PASSED
- [x] No external CSS framework — PASSED
- [x] No Docker artifacts — PASSED
- [x] TypeScript: layout.tsx compiles cleanly — PASSED

## Self-Check: PASSED

## Wave 3B Consumption Guide

Wave 3B plans (07, 08) can immediately consume:

**CSS Classes (from styles/globals.css):**
- Forms: `.form-input`, `.form-label`, `.form-group`, `.form-error`, `.error-banner`, `.form-label--required`
- Buttons: `.btn-primary`, `.btn-destructive`, `.btn-cancel`, `.btn-separator`
- List: `.bottle-row`, `.bottle-row__name`, `.bottle-row__meta`
- Search: `.search-input`, `.search-input-wrapper`, `.search-input-icon`, `.search-form`
- Layout: `.container`, `.page-content`, `.page-heading`
- State: `.empty-state`, `.empty-state__icon`, `.empty-state__heading`, `.empty-state__body`, `.empty-state__cta`
- Misc: `.not-found`, `.field-row-2` (2-col grid ≥480px)

**Brand Tokens (for inline overrides):**
- `var(--color-accent)` — gold #FBCA5C
- `var(--color-text)` — near-black #0A0A0A
- `var(--color-muted)` — gray #6B7280
- `var(--color-error)` — red #D93025
- `var(--color-destructive)` — dark red #B91C1C

**App Layout (automatic via Next.js App Router):**
- All pages under `app/` automatically use `RootLayout` — nav bar and container are applied without any import needed in page files.
