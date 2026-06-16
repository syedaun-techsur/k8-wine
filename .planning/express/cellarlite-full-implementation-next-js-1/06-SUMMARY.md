---
phase: cellarlite-full-implementation-next-js-1
plan: "06"
subsystem: ui-foundation
tags: [css, layout, brand-tokens, mobile-first, next-js, wave-3]
dependency_graph:
  requires: [plan-01-next-config, plan-01-package-json]
  provides: [styles/globals.css, app/layout.tsx]
  affects: [plan-07-bottle-list, plan-08-add-edit-pages]
tech_stack:
  added: []
  patterns: [BEM-CSS, Next.js-App-Router-Server-Component, CSS-custom-properties, mobile-first]
key_files:
  created:
    - styles/globals.css
    - app/layout.tsx
  modified:
    - styles/globals.css (appended nav label responsive CSS during Task 2)
decisions:
  - "BEM CSS naming (.nav__brand, .nav__add, .bottle-row__name) for predictable class composition across Wave 3B pages"
  - "viewport exported separately from metadata per Next.js 14 requirement"
  - "nav label split into .nav__add-short (mobile) and .nav__add-long (≥480px) for responsive text without JS"
  - "font-size 16px on all inputs is non-negotiable for iOS auto-zoom prevention"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 2
---

# Phase cellarlite-full-implementation-next-js-1 Plan 06: Brand Identity & Root Layout Summary

**One-liner:** CSS design system with 8 brand tokens, mobile-first component classes, and Next.js Server Component root layout with sticky nav bar.

## What Was Built

### Task 1: styles/globals.css
Created the complete brand design system CSS file for CellarLite:

- **Brand tokens** (`:root`): All 8 CSS custom properties — `--color-accent #FBCA5C` (gold), `--color-text #0A0A0A`, `--color-surface #FFFFFF`, `--color-accent-hover #E8B540`, `--color-error #D93025`, `--color-muted #6B7280`, `--color-border #E5E7EB`, `--color-destructive #B91C1C`
- **Base reset**: `box-sizing: border-box`, `overflow-x: hidden` on html/body (no horizontal scroll at 375px)
- **`.container`**: Mobile-first full-width → max-width 600px centered at ≥640px
- **`.nav`**: 56px sticky nav bar with flex layout, white background, border-bottom, subtle shadow
- **`.btn-primary`**: Gold background, 48px height, font-size 16px, disabled opacity 0.6
- **`.btn-destructive`**: Transparent background, red border/text (`#B91C1C`), 44px height
- **`.form-input`**: `font-size: 16px` (iOS zoom prevention), 48px height, gold focus border
- **`.search-input`**: `font-size: 16px`, 44px height, icon padding, gold focus border
- **`.bottle-row`**: `min-height: 56px` (≥44px tap target), gold left-border on hover/focus
- Additional patterns: `.form-label`, `.form-group`, `.form-error`, `.error-banner`, `.btn-cancel`, `.btn-separator`, `.empty-state`, `.not-found`, `.field-row-2`, `.page-heading`
- No `@import` of any external CSS framework

### Task 2: app/layout.tsx
Created the Next.js App Router root layout as a Server Component:

- **Server Component**: No `'use client'` directive
- **Metadata**: `title: 'CellarLite'`, `description: 'Personal wine cellar tracker'`
- **Viewport**: Exported separately (`width: 'device-width', initialScale: 1`) per Next.js 14 requirement
- **Nav bar**: Exactly two links — `My Cellar` wordmark → `/` (`nav__brand`) and `+ Add / + Add bottle` → `/bottles/new` (`nav__add`)
- **Responsive nav label**: Mobile shows "Add", ≥480px shows "bottle" (`.nav__add-short` / `.nav__add-long` CSS appended to globals.css)
- **Children wrapper**: `<main><div className="container">{children}</div></main>`
- **Accessibility**: `<html lang="en">`, `aria-label` on nav Add button
- **No `X-Frame-Options` meta tag** in layout — security headers are set in `next.config.mjs`

### Config Verification
Both `next.config.mjs` and `package.json` from Plan 01 were verified to meet their contracts:
- `next.config.mjs`: `.mjs` ESM format, sets `X-Frame-Options: SAMEORIGIN` (never DENY)
- `package.json` scripts exact: `migrate=node scripts/migrate.mjs`, `dev=npm run migrate && next dev -p 3000`, `start=npm run migrate && next start -p 3000`, `build=next build`

## File Paths Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `styles/globals.css` | Created | Brand tokens, mobile-first base, all CSS component classes |
| `app/layout.tsx` | Created | Root HTML shell, sticky nav, metadata, viewport, globals import |
| `styles/globals.css` | Appended | `.nav__add-short` / `.nav__add-long` responsive label CSS |

## Key Implementation Decisions

1. **BEM CSS naming convention** (`.nav__brand`, `.nav__add`, `.bottle-row__name`): Chosen for predictable, composable class names that pages can apply without defining inline styles. Wave 3B pages (07, 08) will reference these classes directly.

2. **Viewport exported separately from metadata**: Next.js 14 deprecates exporting viewport inside the `metadata` object. Separate `export const viewport` avoids build warnings and future breakage.

3. **Responsive nav label via CSS toggle** (not JS): `.nav__add-short` shown on mobile ("Add"), `.nav__add-long` shown at ≥480px (" bottle") via `display: none` / `display: inline`. No JavaScript required.

4. **`font-size: 16px` non-negotiable on inputs**: Applied to `.form-input` and `.search-input`. iOS Safari triggers auto-zoom when input font-size < 16px, breaking the mobile UX. This is enforced at the CSS level.

5. **Gold accent only on interactive elements**: `#FBCA5C` appears on `.btn-primary`, `.nav__add`, `.nav__brand` hover states, focus rings — never as a page or card background (per UX-Mockup Design Principle 3).

6. **`min-height` tap targets**: `.bottle-row` at 56px, `.btn-primary` at 48px, `.btn-destructive` at 44px, `.btn-cancel` at 44px — all meet WCAG 2.5.5 (44×44px minimum target size).

## Contracts Provided for Wave 3B

Wave 3B plans (07 — Bottle List, 08 — Add/Edit) can consume:
- `styles/globals.css`: All CSS classes listed above
- `app/layout.tsx`: Automatically applied by Next.js App Router to all pages — provides shared nav and container
- Brand tokens: `var(--color-accent)`, `var(--color-text)`, `var(--color-muted)`, etc.

## Deviations from Plan

None — plan executed exactly as written. The pre-existing TypeScript errors in `app/api/bottles/route.ts` (missing `lib/db` and `types/bottle` module declarations) are out of scope for this plan and were present before execution. Our new files (`app/layout.tsx`, `styles/globals.css`) produce zero TypeScript errors.

## Commits

| Task | Hash | Message |
|------|------|---------|
| Task 1 | `96ab843` | `feat(cellarlite-full-implementation-next-js-1-06): create styles/globals.css with brand tokens and mobile-first base` |
| Task 2 | `eb18d28` | `feat(cellarlite-full-implementation-next-js-1-06): create app/layout.tsx root layout with nav bar` |

## Self-Check: PASSED

- [x] `styles/globals.css` exists and contains all 8 brand tokens
- [x] `app/layout.tsx` exists as Server Component, exports metadata + viewport
- [x] All 8 CSS tokens present in globals.css
- [x] `.form-input` and `.search-input` have `font-size: 16px`
- [x] `.btn-primary` has `background: var(--color-accent)`, `height: 48px`, disabled opacity 0.6
- [x] `.btn-destructive` has transparent background, red border/text, 44px height
- [x] `.bottle-row` has `min-height: 56px`
- [x] No external CSS `@import`
- [x] `next.config.mjs` sets `X-Frame-Options: SAMEORIGIN`
- [x] `package.json` scripts exact match
- [x] No Dockerfile or docker-compose.yml created
- [x] Both task commits exist: `96ab843` and `eb18d28`
