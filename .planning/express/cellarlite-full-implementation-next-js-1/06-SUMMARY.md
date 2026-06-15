---
phase: cellarlite-full-implementation-next-js-1
plan: "06"
subsystem: brand-ui
tags: [css, design-system, layout, mobile-first, next-js]

dependency_graph:
  requires: ["01-PLAN (next.config.mjs, package.json scripts)"]
  provides: ["styles/globals.css", "app/layout.tsx"]
  affects: ["07-PLAN (list page)", "08-PLAN (add/edit pages)"]

tech_stack:
  added: []
  patterns:
    - "CSS custom properties (brand tokens)"
    - "Mobile-first media queries (375px base, 480px, 640px)"
    - "Next.js App Router Server Component root layout"
    - "Viewport exported separately from metadata (Next.js 14)"

key_files:
  created:
    - styles/globals.css
    - app/layout.tsx
  modified:
    - styles/globals.css  # appended responsive nav label classes in Task 2

decisions:
  - "Used CSS custom properties (--color-accent etc.) for brand tokens — no CSS-in-JS or utility framework"
  - "Nav label responsive: .nav__add-short (mobile) / .nav__add-long (>=480px) using display:none toggle"
  - "viewport exported separately from metadata per Next.js 14 deprecation of viewport inside metadata"
  - "No X-Frame-Options in layout — already set in next.config.mjs headers()"

metrics:
  duration: "~8 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase cellarlite-full-implementation-next-js-1 Plan 06: Brand Identity Layer Summary

## One-liner
CSS design system with 8 brand tokens, mobile-first component classes, and Next.js 14 root layout with sticky nav bar (My Cellar / + Add).

## What Was Built

### Task 1: `styles/globals.css` — Brand Tokens & Mobile-First Design System
- Created `styles/` directory and `globals.css` with all 8 brand CSS custom properties in `:root`
- **Brand palette:** `--color-accent: #FBCA5C` (gold), `--color-text: #0A0A0A`, `--color-surface: #FFFFFF`, `--color-accent-hover: #E8B540`, `--color-error: #D93025`, `--color-muted: #6B7280`, `--color-border: #E5E7EB`, `--color-destructive: #B91C1C`
- **Base reset:** box-sizing border-box, overflow-x hidden (prevents horizontal scroll at 375px), 16px body font-size
- **Component classes:** `.btn-primary` (gold, 48px, disabled opacity 0.6), `.btn-destructive` (transparent, red border, 44px), `.btn-cancel`, `.btn-separator`
- **Form patterns:** `.form-input` (16px font-size — iOS zoom prevention), `.form-label`, `.form-label--required`, `.form-group`, `.form-error`, `.error-banner`
- **Layout:** `.container` (full-width mobile, max-width 600px centered at ≥640px), `.nav` (56px sticky)
- **List patterns:** `.bottle-row` (min-height 56px tap target), `.bottle-row__name`, `.bottle-row__meta`
- **Search:** `.search-input` (16px font-size, icon-padded), `.search-input-wrapper`, `.search-input-icon`
- **States:** `.empty-state`, `.not-found`, `.page-heading`, `.page-content`
- **Responsive:** `.field-row-2` (two-column grid at ≥480px), `.bottle-row__meta` size at ≥640px

### Task 2: `app/layout.tsx` — Root HTML Shell & Nav Bar
- Created Server Component root layout (no `'use client'` directive)
- Exports `metadata` (title: "CellarLite", description) and `viewport` separately (Next.js 14 requirement)
- Nav bar with exactly **two links**: `My Cellar` wordmark → `/` and `+ Add` pill → `/bottles/new`
- Responsive nav label: shows "Add" on mobile, "+ bottle" at ≥480px using `.nav__add-short`/`.nav__add-long` CSS classes
- `<html lang="en">` for accessibility
- `{children}` wrapped in `<div className="container">` inside `<main>` for consistent page width
- Appended responsive nav label CSS to `styles/globals.css`

## Configuration Verification (Pre-existing from Plan 01)

| File | Status | Key property |
|------|--------|--------------|
| `next.config.mjs` | ✅ Correct | ESM `.mjs`, `X-Frame-Options: SAMEORIGIN` |
| `package.json` scripts | ✅ Exact match | `migrate`, `dev`, `start`, `build` all correct |

## Deviations from Plan

None — plan executed exactly as written.

The `grep -n "'use client'" app/layout.tsx` check flagged a false positive on the comment `// Root layout — Server Component (no 'use client' directive)`. Verified with `grep -n "^'use client'"` that no actual `'use client'` directive exists at file start.

## Integration Contracts Provided

Wave 3B (plans 07, 08) consumes:
- **CSS classes:** `.btn-primary`, `.btn-destructive`, `.form-input`, `.form-label`, `.form-label--required`, `.form-group`, `.form-error`, `.error-banner`, `.bottle-row`, `.bottle-row__name`, `.bottle-row__meta`, `.search-input`, `.search-form`, `.container`, `.empty-state`, `.page-heading`
- **Brand tokens:** `--color-accent`, `--color-text`, `--color-surface`, `--color-muted`, `--color-border`, `--color-error`, `--color-destructive`
- **Layout:** `app/layout.tsx` automatically wraps all pages with nav bar and container (Next.js App Router convention)

## Self-Check

| Item | Status |
|------|--------|
| `styles/globals.css` exists | ✅ FOUND |
| `app/layout.tsx` exists | ✅ FOUND |
| All 8 brand tokens in `:root` | ✅ VERIFIED |
| `.form-input` font-size: 16px | ✅ VERIFIED |
| `.search-input` font-size: 16px | ✅ VERIFIED |
| `.btn-primary` gold background, 48px | ✅ VERIFIED |
| `.btn-destructive` transparent, red border, 44px | ✅ VERIFIED |
| `.bottle-row` min-height: 56px | ✅ VERIFIED |
| No `@import` external framework | ✅ VERIFIED |
| `app/layout.tsx` Server Component | ✅ VERIFIED (no `^'use client'`) |
| `metadata` + `viewport` exported separately | ✅ VERIFIED |
| Nav two links only | ✅ VERIFIED |
| `{children}` in `.container` | ✅ VERIFIED |
| `<html lang="en">` | ✅ VERIFIED |
| `next.config.mjs` SAMEORIGIN | ✅ VERIFIED |
| `package.json` scripts exact | ✅ VERIFIED |
| No Dockerfile/docker-compose | ✅ VERIFIED |
| TypeScript check (`tsc --noEmit`) | ✅ PASSED (no errors) |
| Task 1 commit | ✅ 8010a5e |
| Task 2 commit | ✅ 75f6343 |

## Self-Check: PASSED
