---
phase: cellarlite-full-implementation-next-js-1
plan: "04"
subsystem: frontend-ui
tags: [next-js, react, server-component, css, search, mobile-first]
dependency_graph:
  requires: [lib/db.ts, next.config.mjs, app/api/bottles/route.ts, types/bottle.ts]
  provides: [app/layout.tsx, app/page.tsx, app/components/SearchInput.tsx, styles/globals.css]
  affects: [app/bottles/new/page.tsx, app/bottles/[id]/edit/page.tsx]
tech_stack:
  added: [styles/globals.css]
  patterns: [server-component, use-client, debounced-search, url-driven-state, parameterised-sql]
key_files:
  created:
    - styles/globals.css
    - app/components/SearchInput.tsx
    - app/page.tsx
  modified:
    - app/layout.tsx
decisions:
  - "Direct pool.query in server component (not fetch /api/bottles) — avoids client-side waterfall on initial load"
  - "router.replace not router.push for search — back button skips intermediate search states"
  - "400ms debounce (within ≤500ms spec) for responsive feel while minimising re-renders"
  - "CSS class naming follows spec exactly (.nav-logo, .nav-add, .bottle-name, .bottle-meta) not BEM"
  - "searchParams.q capped at 500 chars before DB query — defence against oversized inputs"
metrics:
  duration: ~15min
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 4
---

# Phase cellarlite-full-implementation-next-js-1 Plan 04: Bottle List Page & Root Layout Summary

**One-liner:** Server-rendered bottle list with URL-driven debounced search, TechSur brand CSS, and Next.js root layout — the daily-use landing screen of CellarLite.

## What Was Built

### Task 1: Root layout, global CSS, and nav bar

**`styles/globals.css`** — Complete CSS design system:
- Brand token custom properties: `--color-accent: #FBCA5C` (gold), `--color-text: #0A0A0A`, `--color-surface: #FFFFFF`, `--color-muted: #6B7280`, `--color-border: #E5E7EB`, `--color-error: #D93025`, `--color-destructive: #B91C1C`
- Mobile-first reset: `overflow-x: hidden` on `html, body`; 16px base font
- `.container`: full-width mobile, max 600px centred at ≥640px
- `.nav` (56px sticky bar) + `.nav-inner` + `.nav-logo` + `.nav-add` (gold pill button)
- `.nav-add-full`: hidden on mobile, shown at ≥480px (responsive label)
- `.search-wrap` + `.search-input` (44px height, 16px font-size — iOS auto-zoom prevention)
- `.bottle-list` + `.bottle-row` (min-height 56px, ≥44px tap target)
- `.bottle-name` (16px bold) + `.bottle-meta` (13px muted)
- `.empty-state` + `.empty-title` + `.empty-subtitle` + `.empty-icon`
- `.search-empty` + `.search-empty-msg`
- `.btn-primary` (48px gold, full-width), `.btn-destructive`, `.btn-cancel`
- `.form-input` (48px, 16px font), `.form-label`, `.form-error`, `.error-banner`
- `.form-page`, `.form-page-title`, `.form-row-2`, `.section-divider`
- No external CSS framework (`@import` of Tailwind/Bootstrap prohibited — F07-REQ-08)

**`app/layout.tsx`** — Root layout:
- Viewport meta: `width=device-width, initial-scale=1`
- Imports `@/styles/globals.css` (all pages inherit brand styles)
- Nav bar: "My Cellar" wordmark (→ `/`) + "+ Add [bottle]" pill (→ `/bottles/new`)
- No dead links; no X-Frame-Options DENY (handled by SAMEORIGIN in next.config.mjs)

### Task 2: Bottle List page + SearchInput component

**`app/components/SearchInput.tsx`** — Client component:
- `'use client'` directive
- 400ms debounce via `useRef<ReturnType<typeof setTimeout>>`
- `router.replace` (not `push`) so back button skips intermediate search states
- Pre-filled from `defaultValue` prop (URL ?q= value passed from server)
- Clears ?q= param when input is empty

**`app/page.tsx`** — Async server component:
- Reads `searchParams.q` (capped at 500 chars)
- Queries pg pool directly (no client-side data waterfall on initial load)
- ILIKE filter via parameterised `$1` — never string-interpolated
- Three render states:
  1. **Normal list**: `<ul class="bottle-list">` with `<a class="bottle-row" href="/bottles/[id]/edit">` rows (name bold, vintage · varietal · qty · location muted)
  2. **Cellar empty** (no bottles, no q): "No bottles yet." + gold "Add your first bottle" CTA
  3. **Search empty** (no results, q present): "No bottles match «term»." + Add button
- Error state: renders `error-banner` if DB query throws
- Add bottle button present in all non-empty states

## Key Implementation Decisions

1. **Direct `pool.query` in server component** — The plan explicitly requires no client-side data waterfall. Fetching via `fetch('/api/bottles')` would require a client component or a client-side fetch, adding a loading spinner on initial render. Direct pool query in the server component delivers HTML with data on the first response.

2. **`router.replace` not `router.push`** — Search state is ephemeral: the user doesn't want to press Back 10 times to get through search history. `replace` overwrites the current history entry so Back goes directly to the previous page.

3. **400ms debounce** — Slightly under the 500ms spec maximum; provides responsive feel while avoiding excessive re-renders on fast typing.

4. **CSS class naming** — Used spec-defined class names (`.nav-logo`, `.nav-add`, `.bottle-name`, `.bottle-meta`) rather than BEM notation to match the plan's CSS snippets exactly.

5. **`searchParams.q` capped at 500 chars** — Defence-in-depth: prevents oversized ILIKE patterns from reaching the DB even if the API layer were bypassed.

## Deviations from Plan

### Context: Prior Run Artifacts

The project had commits from a previous run (`8010a5e`, `75f6343`) that implemented `styles/globals.css` and `app/layout.tsx` with BEM class names (`.nav__brand`, `.nav__add-short`). These were overwritten with the plan-spec versions (`.nav-logo`, `.nav-add`, etc.).

The existing add/edit bottle pages (`app/bottles/new/page.tsx`, `app/bottles/[id]/edit/page.tsx`) use inline styles and are not affected by CSS class name changes.

**Tracked as:** [Rule 1 - Bug] Prior run's layout used `../styles/globals.css` relative import (incorrect for `@/` path aliases) and different class names than the plan spec. Fixed by implementing spec-compliant versions.

**No other deviations** — plan executed as specified.

## Contract Verification

All integration contracts verified:

| Contract | File | Status |
|----------|------|--------|
| `lib/db.ts` exports `default pool` | wave 1 | ✅ |
| `next.config.mjs` has `SAMEORIGIN` header | wave 1 | ✅ |
| `app/api/bottles/route.ts` exports `GET` | wave 2 | ✅ |
| `types/bottle.ts` exports `interface Bottle` | wave 2 | ✅ |
| `app/layout.tsx` exports `RootLayout` | this plan | ✅ |
| `app/page.tsx` exports `async Home` | this plan | ✅ |
| `app/components/SearchInput.tsx` exports `SearchInput` | this plan | ✅ |
| `styles/globals.css` has `--color-accent: #FBCA5C` | this plan | ✅ |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `4918ff6` | feat(cellarlite-04): root layout, global CSS, and nav bar |
| Task 2 | `0ef396b` | feat(cellarlite-04): bottle list page and debounced search component |

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `styles/globals.css` exists | ✅ FOUND |
| `app/layout.tsx` exists | ✅ FOUND |
| `app/page.tsx` exists | ✅ FOUND |
| `app/components/SearchInput.tsx` exists | ✅ FOUND |
| `04-SUMMARY.md` exists | ✅ FOUND |
| Commit `4918ff6` exists | ✅ FOUND |
| Commit `0ef396b` exists | ✅ FOUND |
