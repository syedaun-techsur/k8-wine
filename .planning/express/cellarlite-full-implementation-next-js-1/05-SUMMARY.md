---
phase: cellarlite-full-implementation-next-js-1
plan: "05"
subsystem: ui-mutation-forms
tags: [next-js, react, client-component, forms, validation, mobile-first]

dependency_graph:
  requires:
    - "01: next.config.mjs — X-Frame-Options SAMEORIGIN header"
    - "02: app/api/bottles/route.ts — GET, POST handlers"
    - "03: app/api/bottles/[id]/route.ts — GET, PUT, DELETE handlers"
  provides:
    - "app/bottles/new/page.tsx — Add Bottle Client Component (F1)"
    - "app/bottles/[id]/edit/page.tsx — Edit/Delete Bottle Client Component (F2, F3)"
  affects:
    - "Wave 4 E2E tests (F1, F2, F3 user flows)"

tech_stack:
  added: []
  patterns:
    - "React useState for form state management"
    - "React useEffect for data fetch on mount (edit page)"
    - "useRouter from next/navigation for programmatic redirect"
    - "useParams from next/navigation for dynamic route id extraction"
    - "noValidate + client-side validation pattern (no browser default UI)"
    - "Inline style objects with TypeScript const assertions"

key_files:
  created:
    - path: "app/bottles/new/page.tsx"
      description: "'use client' Add Bottle form — 5 fields, POST /api/bottles, redirect to / on 201"
      lines: 262
    - path: "app/bottles/[id]/edit/page.tsx"
      description: "'use client' Edit/Delete form — prefill from GET, PUT on save, DELETE with confirm, not-found state"
      lines: 336
  modified: []

decisions:
  - "Client-side validation only (no HTML5 required attribute) — noValidate on form prevents browser default error bubbles; inline nameError state provides accessible WCAG-compliant inline errors via role=alert"
  - "useParams() for id extraction (App Router) instead of page props — consistent with Next.js 13+ App Router pattern, avoids legacy getServerSideProps"
  - "isNaN + numId <= 0 guard before fetch on edit page — catches non-integer route segments (e.g. /bottles/abc/edit) without making a network request"
  - "Full-replacement PUT semantics — all 5 fields always sent, null for optional empty fields, matches FRD F02-REQ-04"
  - "window.confirm guard for delete — synchronous browser dialog prevents accidental deletion; no custom modal needed per spec"
  - "Inline styles throughout — consistent with existing codebase patterns from plans 01-04; no Tailwind/CSS modules added"

metrics:
  duration: "~8 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 05: Add & Edit/Delete Bottle Pages Summary

## One-liner

Mobile-first Client Component forms for adding and editing/deleting bottles — POST/PUT/DELETE API integration with inline validation, not-found handling, and gold/red TechSur brand styling.

## What Was Built

### Task 1: Add Bottle page (`app/bottles/new/page.tsx`)

- **`'use client'` directive** — form interactivity requires client-side JS
- **Five labeled form fields** with explicit `<label htmlFor="...">` elements (WCAG compliant):
  - Name* (required, `autoFocus`, red border on validation error)
  - Vintage (number, min 1800, max 2027)
  - Varietal (text)
  - Quantity (number, min 1, **default value `1`**)
  - Location (text)
- **Client validation**: blank Name → inline "Name is required" error (`role="alert"`), no fetch call made
- **Submit flow**: POST `/api/bottles` → 201 → `router.push('/')` | 422 → server error banner | other → generic error
- **Gold save button**: `background: #FBCA5C`, `color: #0A0A0A`, 48px height, full-width, disabled during submit
- **Cancel**: plain `<a href="/">` link (no button, no JS)
- **Input sizing**: `height: 48px`, `fontSize: 16px` on all inputs (prevents iOS auto-zoom)
- **No `X-Frame-Options`** emitted from component — handled globally by `next.config.mjs`

### Task 2: Edit/Delete Bottle page (`app/bottles/[id]/edit/page.tsx`)

- **`'use client'` directive** with `useParams()` for App Router `id` extraction
- **On mount (`useEffect`)**: validates `id` is positive integer, then `GET /api/bottles/${id}` → pre-fills all 5 fields
- **Not-found state** (US-2.6): non-integer id OR API 404 → renders "Bottle not found." + "← Back to My Cellar" gold link; no crash, no blank page
- **Loading state**: shows "Loading…" while awaiting initial GET response
- **Five labeled form fields** (same as Add page, prefilled from API response)
- **Quantity `onFocus={e => e.target.select()}`** — instant replacement UX per UX-Mockup spec
- **Save flow**: client validates name → PUT `/api/bottles/${id}` with all 5 fields (full replacement) → 200 → `router.push('/')` | 422 → banner | other → generic error
- **Delete flow**: `window.confirm('Delete this bottle?')` guard → DELETE `/api/bottles/${id}` → 204 → `router.push('/')` | 404 → "already removed" message | Cancel → no fetch, stays on page
- **Gold save button**: `#FBCA5C`, 48px, full-width
- **Red delete button**: transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px height, visually separated from Save by `marginTop: 24px; borderTop: 1px solid #E5E7EB; paddingTop: 24px`
- **Cancel**: plain `<a href="/">` below Delete button

## Key Implementation Decisions

1. **`noValidate` + client state** — form uses `noValidate` to suppress browser-native validation UI; custom `nameError` state renders accessible inline errors via `role="alert"`. This gives full control over error styling per TechSur brand spec.

2. **`useParams()` for route id** — Next.js App Router pattern; extracts `id` from URL without prop drilling or server components.

3. **Integer guard before fetch** — `parseInt(id, 10)` + `isNaN` check prevents unnecessary network requests for non-numeric routes like `/bottles/abc/edit`, rendering the not-found state immediately.

4. **Full-replacement PUT** — All 5 fields always sent in PUT body (null for empty optionals). Matches FRD F02-REQ-04 and avoids partial-update ambiguity.

5. **`window.confirm` for delete guard** — Synchronous browser confirm dialog, no custom modal. Per spec requirement (US-3.1); cancel stays on page with zero API calls.

6. **Inline styles** — Consistent with codebase established in plans 01-04. No additional styling dependencies introduced.

## Contracts Verified

| Contract | Source | Status |
|----------|--------|--------|
| `X-Frame-Options: SAMEORIGIN` in `next.config.mjs` | Plan 01 | ✅ CONTRACT_OK |
| `export async function POST` in `app/api/bottles/route.ts` | Plan 02 | ✅ CONTRACT_OK |
| `export async function GET` in `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |
| `export async function PUT` in `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |
| `export async function DELETE` in `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |

## Deviations from Plan

**None** — plan executed exactly as written.

The TypeScript compiler reported pre-existing errors in `app/api/bottles/route.ts` (missing `lib/db` and `types/bottle` module declarations from plans 02/03). These are out of scope for plan 05 and were not introduced by this plan's changes. The two new files (`app/bottles/new/page.tsx` and `app/bottles/[id]/edit/page.tsx`) have zero TypeScript errors.

## Commits

| Task | Hash | Description |
|------|------|-------------|
| Task 1 | `684fc8a` | feat(cellarlite-full-implementation-next-js-1-05): Add Bottle page /bottles/new |
| Task 2 | `b545f0d` | feat(cellarlite-full-implementation-next-js-1-05): Edit/Delete Bottle page /bottles/[id]/edit |

## Wave 4 Consumers

- `app/bottles/new/page.tsx` — consumed by F1 E2E tests (add bottle flow)
- `app/bottles/[id]/edit/page.tsx` — consumed by F2 E2E tests (edit bottle) and F3 E2E tests (delete bottle)

## Self-Check: PASSED

- [x] `app/bottles/new/page.tsx` exists — 262 lines
- [x] `app/bottles/[id]/edit/page.tsx` exists — 336 lines
- [x] Task 1 commit `684fc8a` exists in git log
- [x] Task 2 commit `b545f0d` exists in git log
- [x] All verification checks passed (CLIENT DIRECTIVE OK, DEFAULT EXPORT OK, all 5 labels, AUTOFOCUS OK, NAME VALIDATION OK, ROUTER PUSH OK, GOLD BUTTON OK, CANCEL LINK OK, POST METHOD OK, PUT METHOD OK, DELETE METHOD OK, WINDOW CONFIRM OK, NOT FOUND STATE OK, SELECT-ALL ON FOCUS OK, NO IFRAME BLOCKING OK)
