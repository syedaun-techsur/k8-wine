---
phase: cellarlite-full-implementation-next-js-1
plan: "04"
subsystem: frontend-ui
tags: [bottle-list, search, layout, css, server-component, client-component]
dependency_graph:
  requires: ["01 (lib/db.ts Pool)", "02 (types/bottle.ts, GET /api/bottles)"]
  provides: ["app/layout.tsx", "app/page.tsx", "styles/globals.css", "app/components/SearchInput.tsx"]
  affects: ["05 (Add Bottle page)", "06 (Edit/Delete page — shares layout + CSS)"]
tech_stack:
  added: []
  patterns: ["Next.js Server Component with direct pg.Pool query", "URL-driven search via router.replace + debounce", "CSS custom properties mobile-first design system"]
key_files:
  created:
    - app/layout.tsx
    - app/page.tsx
    - app/components/SearchInput.tsx
    - styles/globals.css
  modified: []
decisions:
  - "Direct pool.query in Server Component (not fetch('/api/bottles')) — avoids network round-trip on server, reduces latency"
  - "router.replace (not push) for search — back button skips intermediate search URL states"
  - "400ms debounce (within ≤500ms spec) — responsive feel without excessive re-renders"
  - "URL-driven search (?q= param) — shareable, bookmarkable, back-button friendly"
  - "Parameterised ILIKE $1 placeholder — prevents SQL injection on search"
  - "Plan 06 ran concurrently and provided final versions of app/layout.tsx and styles/globals.css using BEM CSS naming (nav__brand, nav__add) — plan 04's versions were superseded but functionally equivalent"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 4
---

# Phase cellarlite-full-implementation-next-js-1 Plan 04: Bottle List Page + Search Summary

**One-liner:** Server-rendered bottle list page with URL-driven debounced search, root layout with brand nav, and full mobile-first TechSur CSS design system.

## What Was Built

### Task 1: Root layout, global CSS, and nav bar
- **`styles/globals.css`** — Complete TechSur brand design system: CSS custom properties (`--color-accent: #FBCA5C`, `--color-text`, `--color-surface`, `--color-muted`, `--color-border`, `--color-error`, `--color-destructive`), mobile-first layout (375px base), nav bar (56px), bottle rows (min-height 56px), search input (44px height, 16px font), all form patterns (Pattern A–J from UX Mockup), overflow-x:hidden for horizontal scroll prevention
- **`app/layout.tsx`** — Root layout with viewport meta, globals.css import, sticky nav bar with "My Cellar" → `/` and "+ Add bottle" → `/bottles/new`; no dead links; iframe-safe (no DENY header)

### Task 2: Bottle List page + SearchInput client component
- **`app/components/SearchInput.tsx`** — `'use client'` debounced search input; 400ms debounce (≤500ms spec); `router.replace` (not push) so back button skips search states; pre-fills from `defaultValue` prop; clears `?q=` on empty input
- **`app/page.tsx`** — Async Server Component; queries pg pool directly (no client waterfall); accepts `searchParams.q` for ILIKE filtering; renders 3 states: (1) normal list with bottle rows, (2) empty cellar "No bottles yet" + gold CTA, (3) search-empty "No bottles match '<q>'" + Add button; each row is `<a href="/bottles/[id]/edit">` with 56px min-height tap target

## File Paths Created

| File | Purpose |
|------|---------|
| `styles/globals.css` | Complete brand CSS design system |
| `app/layout.tsx` | Root layout: viewport, nav, CSS import |
| `app/page.tsx` | Bottle list server component (F0 + F4) |
| `app/components/SearchInput.tsx` | Debounced URL-driven search input (F4) |

## Key Implementation Decisions

1. **Direct `pool.query` vs `fetch('/api/bottles')`** — Server Component queries the database directly via the pg Pool singleton from `lib/db.ts`. This avoids a network round-trip on the server, eliminates any client-side loading waterfall, and is simpler. The `/api/bottles` route remains available for external consumers.

2. **`router.replace` not `router.push`** — Search URL updates use replace so the browser back button jumps to the page before any search was entered, skipping intermediate `?q=` states. This matches the UX spec (F04-REQ-02).

3. **400ms debounce** — Within the ≤500ms spec. Fast enough to feel responsive without triggering excessive server re-renders while typing.

4. **URL-driven search state** — `?q=` lives in the URL, so searches are shareable/bookmarkable, and the server component pre-fills `SearchInput.defaultValue` from `searchParams.q` on page load.

5. **Parameterised `$1` placeholder** — `ILIKE $1` with `['%' + q + '%']` array arg. Never string-interpolated into SQL (prevents SQL injection, F04-REQ-05).

6. **Empty vs search-empty distinction** — Two distinct UI states: `isCellarEmpty` (no bottles at all) shows wine emoji + "No bottles yet" + "Add your first bottle" CTA; `isSearchEmpty` (search returned no results) shows "No bottles match '<term>'" + standard "+ Add bottle" button. These are visually and semantically distinct per plan spec.

## Parallel Wave Note

Plan 06 (Brand Identity Layer) ran concurrently in wave 3 and committed its own versions of `styles/globals.css` (commit `95defaa`) and `app/layout.tsx` (commit `9e6af2f`) after plan 04's commit `63f2270`. Plan 06's versions use BEM CSS naming (`nav__brand`, `nav__add`) vs plan 04's dash naming (`nav-logo`, `nav-add`). The final committed state uses plan 06's versions, which are functionally equivalent and consistent with each other. Both satisfy all plan 04 contract requirements.

## Deviations from Plan

No functional deviations. The spec was executed exactly as written.

**Parallel execution note (informational, not a deviation):** Plan 06 ran concurrently and provided final versions of `styles/globals.css` and `app/layout.tsx` with BEM CSS naming. Plan 04's layout.tsx (63f2270) was superseded by plan 06's (9e6af2f) — both satisfy all plan 04 success criteria. This is expected parallel wave behavior.

## Contract Verification

| Contract | Status |
|---------|--------|
| `lib/db.ts` exports `pool` (plan 01) | ✅ `export default pool` |
| `next.config.mjs` has SAMEORIGIN (plan 01) | ✅ `X-Frame-Options: SAMEORIGIN` |
| `app/api/bottles/route.ts` exports GET (plan 02) | ✅ `export async function GET` |
| `types/bottle.ts` exports `Bottle` (plan 02) | ✅ `interface Bottle` |

## Provides for Plans 05 + 06

| Artifact | Used by |
|---------|--------|
| `app/layout.tsx` | All pages — Add Bottle (05), Edit/Delete (06) |
| `styles/globals.css` | All pages — `.form-input`, `.btn-primary`, `.btn-destructive`, `.form-label`, `.form-error`, `.error-banner` |
| `app/components/SearchInput.tsx` | Reference pattern for URL state management |

## Self-Check: PASSED

- FOUND: app/layout.tsx ✅
- FOUND: app/page.tsx ✅
- FOUND: styles/globals.css ✅
- FOUND: app/components/SearchInput.tsx ✅
- FOUND commit: 63f2270 (Task 1) ✅
- FOUND commit: d540c74 (Task 2) ✅
