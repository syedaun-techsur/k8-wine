---
phase: cellarlite-full-implementation-next-js-1
plan: "04"
subsystem: frontend-list-page
tags: [next-js, server-component, css, search, layout]
dependency_graph:
  requires: ["01 (lib/db.ts pool, next.config.mjs SAMEORIGIN)", "02 (app/api/bottles/route.ts GET, types/bottle.ts)"]
  provides: ["app/layout.tsx (RootLayout)", "styles/globals.css (brand tokens + all shared styles)", "app/page.tsx (Bottle List Page)", "app/components/SearchInput.tsx (debounced URL search)"]
  affects: ["05 (consumes layout.tsx + globals.css)", "06 (consumes layout.tsx + globals.css)"]
tech_stack:
  added: []
  patterns: ["Next.js 14 App Router Server Component", "direct pg pool query in server component", "URL-driven search state with router.replace debounce", "mobile-first plain CSS custom properties"]
key_files:
  created:
    - styles/globals.css
    - app/layout.tsx
    - app/page.tsx
    - app/components/SearchInput.tsx
  modified:
    - app/api/bottles/route.ts
decisions:
  - "Used direct pool.query in server component (not fetch('/api/bottles')) to avoid client-side waterfall on initial load"
  - "400ms debounce (within ≤500ms spec) using useRef timer ref pattern; router.replace not push so back button skips intermediate search states"
  - "Flat CSS class naming (.bottle-name, .nav-logo, .nav-add) over BEM (.bottle-row__name, .nav__brand) per plan spec"
  - "Rewrote globals.css from prior run's BEM naming to spec-compliant flat naming — existing pages use inline styles so no breakage"
  - "globals.css includes forward-looking styles for wave 3 plans 05/06: .form-input, .btn-primary, .btn-destructive, .form-label, .form-error, .error-banner"
metrics:
  duration: "~20 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase cellarlite-full-implementation-next-js-1 Plan 04: Bottle List Page, Layout, Global CSS Summary

**One-liner:** Server-rendered bottle list with URL-driven ILIKE search, TechSur brand CSS tokens, sticky nav bar, and three-state rendering (list / cellar-empty / search-empty).

## What Was Built

### Task 1: Root layout, global CSS, and nav bar

**`styles/globals.css`** — Complete brand token CSS for CellarLite:
- 8 CSS custom properties: `--color-accent: #FBCA5C` (gold), `--color-text: #0A0A0A`, `--color-surface: #FFFFFF`, `--color-muted: #6B7280`, `--color-border: #E5E7EB`, `--color-error: #D93025`, `--color-destructive: #B91C1C`, `--color-accent-hover: #E8B540`
- Mobile-first layout: `.container` (full-width → 600px max at ≥640px)
- Nav: `.nav` (sticky, 56px), `.nav-inner`, `.nav-logo`, `.nav-add`, `.nav-add-short`/`.nav-add-full` (responsive labels)
- Bottle list: `.bottle-list`, `.bottle-row` (min-height 56px, hover gold border), `.bottle-name` (16px bold), `.bottle-meta` (13px muted), `.bottle-row-inner` (flex, desktop right-aligned)
- Search: `.search-wrap`, `.search-icon`, `.search-input` (44px height, 16px font for iOS zoom prevention)
- Empty/search-empty states: `.empty-state`, `.empty-icon`, `.empty-title`, `.empty-subtitle`, `.search-empty`, `.search-empty-msg`
- Buttons: `.btn-primary` (48px gold, full-width), `.btn-destructive` (44px destructive outline), `.btn-cancel` (44px min-height)
- Form styles (wave 3 forward): `.form-group`, `.form-label`, `.form-input` (48px, 16px font), `.form-error`, `.error-banner`, `.form-page`, `.form-page-title`, `.form-row-2`
- No external CSS framework imports

**`app/layout.tsx`** — Root layout Server Component:
- Viewport exported separately from metadata per Next.js 14 requirement
- Imports `@/styles/globals.css` for all pages to inherit brand styles
- Sticky nav bar: "My Cellar" wordmark → `/` (`.nav-logo`), "+ Add bottle" → `/bottles/new` (`.nav-add`)
- Responsive nav button: `nav-add-short` ("+ Add") always visible, `nav-add-full` (" bottle") visible at ≥480px
- No X-Frame-Options DENY — iframe safety handled by `next.config.mjs` SAMEORIGIN

### Task 2: Bottle List page + SearchInput component

**`app/components/SearchInput.tsx`** — Client-side debounced search:
- `'use client'` directive — uses `useRouter`, `useCallback`, `useRef`
- 400ms debounce (within ≤500ms F04-REQ-02 spec) via `useRef` timer ref
- `router.replace` (not `push`) — back button skips intermediate search states
- Clears `?q=` param on empty input → full list restored
- Pre-filled from `defaultValue` prop (current `?q=` URL param)

**`app/page.tsx`** — Bottle List Server Component:
- Async Server Component — queries pg pool directly on every request, no client waterfall
- Accepts `searchParams.q` from Next.js App Router page props
- Three render states:
  1. **Normal list**: bottle rows as `<a href="/bottles/[id]/edit">` with `.bottle-row` class (min-height 56px)
  2. **Cellar empty** (no bottles, no search): "No bottles yet." + `.empty-subtitle` + gold `+ Add your first bottle` CTA
  3. **Search empty** (no results, `?q=` present): `No bottles match "<term>".` + `+ Add bottle` button
- Each row displays: name (bold `.bottle-name`), vintage · varietal | Qty: N · location (`.bottle-meta`), dash `—` for null fields
- Parameterised ILIKE query (`$1 = '%' + q + '%'`) — no string interpolation
- Input capped at 500 chars per F04-REQ-08
- DB error → `.error-banner` with "Unable to load cellar. Please try again."
- `+ Add bottle` link visible below non-empty list (US-0.4)

## File Paths Created

| File | Purpose |
|------|---------|
| `styles/globals.css` | Brand token CSS, mobile-first layout, all shared component styles |
| `app/layout.tsx` | Root layout with nav bar and globals.css import |
| `app/page.tsx` | Bottle List page — server-rendered, 3 states |
| `app/components/SearchInput.tsx` | Debounced client-side search input |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken relative imports in bottles API route**
- **Found during:** Task 2 (TypeScript compile check)
- **Issue:** `app/api/bottles/route.ts` used relative imports (`../../lib/db`, `../../types/bottle`) which TypeScript couldn't resolve from the `app/api/bottles/` directory
- **Fix:** Changed to `@/lib/db` and `@/types/bottle` (tsconfig `@/*` path alias)
- **Files modified:** `app/api/bottles/route.ts`
- **Commit:** f8a9bc3

**2. [Rule 1 - Bug] Rewrote globals.css from BEM to spec-compliant flat class names**
- **Found during:** Task 1 (discovery of prior run's globals.css using BEM naming)
- **Issue:** A prior execution (plan 06) had written globals.css with BEM names (`.bottle-row__name`, `.nav__brand`) while this plan spec requires flat names (`.bottle-name`, `.nav-logo`) that layout.tsx and page.tsx depend on
- **Fix:** Replaced globals.css entirely with spec-compliant flat naming; existing pages (new/edit) use inline styles so no breakage
- **Files modified:** `styles/globals.css`
- **Commit:** dadf9ce

**3. [Rule 1 - Bug] Fixed layout.tsx class names overwritten by prior plan 06 run**
- **Found during:** Task 2 (verification of nav class names)
- **Issue:** A prior plan 06 run had overwritten layout.tsx with BEM names (`nav__brand`, `nav__add`) after plan 04's initial commit
- **Fix:** Rewrote layout.tsx with spec-compliant flat naming matching globals.css
- **Files modified:** `app/layout.tsx`
- **Commit:** f8a9bc3

## Integration Contracts Verified

| Contract | Artifact | Status |
|----------|----------|--------|
| Plan 01 | `lib/db.ts` exports `pool` | ✅ `export default pool` found |
| Plan 01 | `next.config.mjs` X-Frame-Options SAMEORIGIN | ✅ Found, no DENY |
| Plan 02 | `app/api/bottles/route.ts` exports GET | ✅ `export async function GET` found |
| Plan 02 | `types/bottle.ts` exports Bottle | ✅ `interface Bottle` found |

## Wave 3 Continuation

Plans 05 and 06 can consume:
- `app/layout.tsx` — provides nav bar and globals.css to all pages automatically
- `styles/globals.css` — `.form-input`, `.btn-primary`, `.btn-destructive`, `.form-label`, `.form-error`, `.error-banner`, `.form-page`, `.form-page-title` ready for Add/Edit forms

## Self-Check: PASSED

Files exist:
- `styles/globals.css` ✅
- `app/layout.tsx` ✅
- `app/page.tsx` ✅
- `app/components/SearchInput.tsx` ✅

Commits:
- `950beed` feat(cellarlite-04): root layout, global CSS brand tokens, and nav bar ✅
- `dadf9ce` feat(cellarlite-04): rewrite globals.css with spec-compliant flat class names ✅
- `f8a9bc3` feat(cellarlite-04): Bottle List page, SearchInput component, layout class name fix ✅

TypeScript: `npx tsc --noEmit` → clean (0 errors) ✅
