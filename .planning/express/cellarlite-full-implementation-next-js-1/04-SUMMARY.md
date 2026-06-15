---
phase: cellarlite-full-implementation-next-js-1
plan: "04"
subsystem: frontend-ui
tags: [next-js, react, server-component, css, mobile-first, search]
dependency_graph:
  requires:
    - lib/db.ts (pool singleton — plan 01)
    - next.config.mjs (SAMEORIGIN iframe header — plan 01)
    - app/api/bottles/route.ts (GET handler — plan 02)
    - types/bottle.ts (Bottle interface — plan 02)
  provides:
    - app/layout.tsx (root layout with nav bar — consumed by all pages)
    - app/page.tsx (Bottle List page — home screen)
    - app/components/SearchInput.tsx (debounced client search)
    - styles/globals.css (brand tokens + all component CSS classes)
  affects:
    - app/bottles/new/page.tsx (consumes layout.tsx + globals.css form styles)
    - app/bottles/[id]/edit/page.tsx (consumes layout.tsx + globals.css form + destructive styles)
tech_stack:
  added: []
  patterns:
    - Server Component with direct pg pool query (no client waterfall)
    - URL-driven search state via router.replace
    - Debounced input (400ms) with useRef timer tracking
    - Three-state UI: normal list / cellar-empty / search-empty
    - CSS custom properties (design tokens) with mobile-first breakpoints
key_files:
  created:
    - app/layout.tsx
    - app/page.tsx
    - app/components/SearchInput.tsx
    - styles/globals.css
  modified: []
decisions:
  - Direct pool.query in Server Component (not fetch('/api/bottles')) — avoids client waterfall on first load
  - router.replace not push — back button skips intermediate search states
  - 400ms debounce (within ≤500ms spec) — responsive feel without excessive re-renders
  - CSS class names use kebab-case matching plan spec (nav-inner, nav-logo, nav-add, bottle-row, etc.)
  - Search input uses type="search" — works without JS, enhanced by JS onChange
  - Parameterised ILIKE $1 with '%' + q + '%' — prevents SQL injection
metrics:
  duration: "~8 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase cellarlite-04: Bottle List Page, Root Layout, Global CSS, and Search Component

**One-liner:** Server-rendered bottle list page with URL-driven debounced search, TechSur brand CSS tokens, and sticky nav bar using direct pg Pool queries and Next.js App Router.

## What Was Built

### Task 1: Root layout, global CSS, and nav bar

**`styles/globals.css`** — Complete brand design system (426 lines):
- 8 CSS custom properties: `--color-accent: #FBCA5C` (gold), `--color-text`, `--color-surface`, `--color-muted`, `--color-border`, `--color-error`, `--color-accent-hover`, `--color-destructive`
- Mobile-first base: `overflow-x: hidden` (375px no horizontal scroll), `font-size: 16px` body (iOS zoom prevention)
- `.nav` (56px sticky), `.nav-inner` (flex layout), `.nav-logo`, `.nav-add` (gold pill, min-height 36px)
- `.nav-add-full` hidden on mobile, shown at ≥480px (responsive "+ Add" / "+ Add bottle")
- `.bottle-row` (min-height 56px, Pattern D), `.bottle-name` (16px bold), `.bottle-meta` (13px muted)
- `.search-input` (44px height, 16px font — iOS zoom prevention), `.search-wrap` with icon positioning
- `.btn-primary` (48px gold CTA), `.btn-destructive` (44px red outline), `.btn-cancel` (44px min-height)
- `.form-input` (48px, 16px font), `.form-label`, `.form-error`, `.error-banner`
- `.empty-state`, `.search-empty`, `.form-page`, `.section-divider`, `.form-row-2` (2-col grid at ≥480px)
- No external CSS framework imports (F07-REQ-08 compliant)

**`app/layout.tsx`** — Root layout Server Component:
- Viewport meta tag for mobile layout
- Imports `@/styles/globals.css` for all pages
- Sticky nav bar (Pattern J): "My Cellar" wordmark → `/`, "+ Add [bottle]" pill → `/bottles/new`
- No dead links — both routes are real app routes

### Task 2: Bottle List page + SearchInput client component

**`app/components/SearchInput.tsx`** — Debounced client search:
- `'use client'` directive for router access
- `useRef` timer for 400ms debounce (≤500ms spec)
- `router.replace` (not push) — back button skips intermediate search states
- Empty input → `router.replace('/')` removes `?q=` param
- `defaultValue` prop pre-fills from current URL `?q=` value
- `type="search"` input — works without JS, enhanced by onChange

**`app/page.tsx`** — Async Server Component:
- Reads `searchParams.q`, trims, caps at 500 chars
- Direct `pool.query()` — no client-side data waterfall on initial load
- Three render states:
  1. **Normal list**: `<ul class="bottle-list">` with `<a href="/bottles/[id]/edit" class="bottle-row">` rows
  2. **Cellar empty** (no bottles, no `q`): "No bottles yet." + "Add your first bottle" gold CTA
  3. **Search empty** (no bottles, `q` present): "No bottles match '<q>'." + Add button
- Each row shows: name (bold), vintage `·` varietal `|` Qty `·` location (dash `—` for null fields)
- ILIKE search: parameterised `$1 = '%' + q + '%'` — no string interpolation (SQL injection safe)
- DB error fallback: renders error banner with SearchInput still visible
- "Add bottle" button always shown when list has bottles (F00-REQ-06)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] styles/globals.css class name consistency**
- **Found during:** Task 1 — previous run had created `styles/globals.css` with BEM-style class names (`.nav__brand`, `.nav__add`, `.nav__add-long`, `.bottle-row__name`) while plan spec requires kebab-case (`.nav-logo`, `.nav-inner`, `.nav-add`, `.nav-add-full`, `.bottle-name`)
- **Issue:** The existing `globals.css` (438 lines from `be9816b`) used different class naming conventions than the plan spec. `app/layout.tsx` was committed with plan-spec class names, causing style mismatch
- **Fix:** Rewrote `styles/globals.css` with the plan-spec class names — all markup in `layout.tsx`, `page.tsx`, and `SearchInput.tsx` use matching kebab-case class names
- **Files modified:** `styles/globals.css`
- **Commit:** b199ff8 (amend on previous doc commit)

### Notes on Execution Context

The project had a previous run (`run1-complete` tag at `0145ef0`) with different CSS class naming conventions. This plan 04 execution establishes the authoritative class names per spec. Plans 05 and 06 (Add Bottle, Edit/Delete Bottle pages) should use the CSS classes defined in this `globals.css`.

## Pre-existing Issues (Out of Scope)

- `app/api/bottles/route.ts` uses relative imports (`../../lib/db`) instead of `@/lib/db` aliases — pre-existing from prior run, not caused by this plan's changes. Logged for deferred fix.

## Self-Check

### Created files exist:
- [x] `styles/globals.css` — exists (verified)
- [x] `app/layout.tsx` — exists (verified)
- [x] `app/page.tsx` — exists (verified)
- [x] `app/components/SearchInput.tsx` — exists (verified)

### Commits exist:
- [x] `8ff2296` — feat(cellarlite-04): root layout, global CSS, and nav bar
- [x] `3c032ab` — feat(cellarlite-04): Bottle List page and SearchInput client component

### Contract verifications pass:
- [x] `lib/db.ts` exports `default pool`
- [x] `next.config.mjs` has `X-Frame-Options: SAMEORIGIN` (no DENY)
- [x] `app/api/bottles/route.ts` exports `GET`
- [x] `types/bottle.ts` defines `interface Bottle`
- [x] `styles/globals.css` has `--color-accent: #FBCA5C`
- [x] `app/layout.tsx` exports `RootLayout`
- [x] `app/page.tsx` exports async `Home`
- [x] `app/components/SearchInput.tsx` has `'use client'` + `router.replace`

## Self-Check: PASSED
