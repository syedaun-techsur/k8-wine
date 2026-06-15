---
phase: cellarlite-full-implementation-next-js-1
plan: "05"
subsystem: UI — Mutation Pages (Wave 3B)
tags: [next.js, react, client-component, forms, validation, fetch, mobile-first]

dependency_graph:
  requires:
    - plan: "01"
      artifact: next.config.mjs
      note: X-Frame-Options SAMEORIGIN header (not duplicated in components)
    - plan: "02"
      artifact: app/api/bottles/route.ts
      note: POST /api/bottles endpoint
    - plan: "03"
      artifact: app/api/bottles/[id]/route.ts
      note: GET / PUT / DELETE /api/bottles/[id] endpoints
  provides:
    - artifact: app/bottles/new/page.tsx
      exports: [default NewBottlePage]
      consumed_by: Wave 4 E2E tests (F1)
    - artifact: app/bottles/[id]/edit/page.tsx
      exports: [default EditBottlePage]
      consumed_by: Wave 4 E2E tests (F2, F3)
  affects: []

tech_stack:
  added: []
  patterns:
    - Next.js App Router Client Components ('use client')
    - useRouter from next/navigation for redirect
    - useParams from next/navigation for dynamic segment extraction
    - useEffect for on-mount data fetching
    - Inline style objects with TypeScript const assertions (boxSizing, fontWeight)
    - Client-side validation before fetch (blank name guard)
    - window.confirm guard for destructive delete action

key_files:
  created:
    - app/bottles/new/page.tsx
    - app/bottles/[id]/edit/page.tsx
  modified: []

decisions:
  - "Used useParams() for id extraction in edit page instead of async params prop — App Router Client Components cannot receive async props; useParams() is the correct client-side approach"
  - "Quantity defaults to '1' string on add page, populated from API on edit page — stored as string for input compatibility, parsed to int on submit"
  - "Non-integer id validated in useEffect before fetch to prevent bad requests — parseInt(id, 10) isNaN check short-circuits to notFound state immediately"
  - "Cancel dialog (window.confirm returning false) implemented as early return — no state change, no fetch, user stays on page; satisfies spec requirement exactly"
  - "Delete button outside <form> element to prevent accidental form submission — placed in separate div after form close tag with visual separator"

metrics:
  duration: "~10 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 05: Add + Edit/Delete Bottle Pages Summary

**One-liner:** Client-side Add and Edit/Delete mutation pages with form validation, not-found handling, and TechSur gold/red button styling using Next.js App Router Client Components.

---

## What Was Built

### Task 1: Add Bottle Page (`/bottles/new`)

**File:** `app/bottles/new/page.tsx`

A `'use client'` Next.js Client Component providing the Add Bottle form (F1: US-1.1–1.4):

- **5 labeled fields:** Name* (autoFocus, required), Vintage (number, 1800–2027), Varietal (text), Quantity (number, min 1, default 1), Location (text)
- **Client validation:** blank name → inline `⚠ Name is required` alert, no fetch call made
- **Submit flow:** POST `/api/bottles` with JSON body → 201 → `router.push('/')` via Next.js router
- **Error handling:** 422 → server error banner at top; other errors → generic message banner
- **Save button:** Gold `#FBCA5C`, 48px height, full-width, disabled + opacity 0.6 during submit
- **Cancel:** `<a href="/">` plain link (not a button), no API call
- **Nav bar:** "← My Cellar" back link + "Add Bottle" title

### Task 2: Edit/Delete Bottle Page (`/bottles/[id]/edit`)

**File:** `app/bottles/[id]/edit/page.tsx`

A `'use client'` Next.js Client Component providing Edit (F2: US-2.1–2.6) and Delete (F3: US-3.1–3.2) flows:

- **On mount:** `useEffect` + `useParams()` to extract `id`; validates positive integer; fetches `GET /api/bottles/${id}`; populates all 5 fields
- **Not-found state (US-2.6):** non-integer id OR 404 response → renders "Bottle not found." + "← Back to My Cellar" link; no crash, no blank page
- **Loading state:** "Loading…" spinner text while fetching
- **5 labeled fields:** Name* (required), Vintage, Varietal, Quantity (onFocus select-all for instant replacement), Location
- **Save flow:** client validates name → PUT `/api/bottles/${id}` (full replacement, all 5 fields) → 200 → `router.push('/')`
- **Delete flow:** `window.confirm('Delete this bottle?')` guard → DELETE `/api/bottles/${id}` → 204 → `router.push('/')`; cancel in dialog → no fetch, stays on page
- **Delete 404 error:** "This bottle could not be deleted. It may have already been removed."
- **Save button:** Gold `#FBCA5C`, 48px, full-width; **Delete button:** transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px; visually separated from Save by 24px gap + horizontal divider
- **Cancel:** `<a href="/">` below Delete button

---

## Key Implementation Decisions

1. **`useParams()` for dynamic id** — App Router Client Components cannot receive async `params` props at runtime; `useParams()` from `next/navigation` is the correct client-side extraction method.

2. **String state for number inputs** — All numeric fields (`vintage`, `quantity`) are stored as strings in state for React controlled input compatibility, then parsed via `parseInt(..., 10)` on submit with null fallback for empty values.

3. **Pre-fetch id validation** — `parseInt(id, 10)` isNaN/<=0 check in `useEffect` short-circuits to `notFound = true` immediately without making a network request for clearly invalid ids (e.g., `/bottles/abc/edit`).

4. **Delete button outside `<form>`** — The Delete button is placed in a separate `<div>` after the `</form>` close tag. This prevents accidental form submission and allows the delete section to have its own visual separator (24px margin + border-top divider) as specified.

5. **`window.confirm` cancel = early return** — If the user clicks Cancel in the confirmation dialog, `handleDelete` returns immediately with no state changes and no fetch — the user stays on the edit page exactly as specified.

---

## Deviations from Plan

None — plan executed exactly as written. The inline code examples in the plan were used as-is. No architectural changes were needed.

**Pre-existing TypeScript errors (out of scope):** `app/api/bottles/route.ts` has `TS2307` errors for `../../lib/db` and `../../types/bottle` modules. These are from plan 02/03 and existed before this plan. The two new files (`app/bottles/new/page.tsx`, `app/bottles/[id]/edit/page.tsx`) have zero TypeScript errors.

---

## Integration Contracts Verified

| Contract | Plan | Status |
|---|---|---|
| `X-Frame-Options: SAMEORIGIN` in `next.config.mjs` | 01 | ✅ |
| `export async function POST` in `app/api/bottles/route.ts` | 02 | ✅ |
| `export async function GET` in `app/api/bottles/[id]/route.ts` | 03 | ✅ |
| `export async function PUT` in `app/api/bottles/[id]/route.ts` | 03 | ✅ |
| `export async function DELETE` in `app/api/bottles/[id]/route.ts` | 03 | ✅ |

---

## Commits

| Task | Commit | Description |
|---|---|---|
| Task 1 | `0f0adda` | feat: Add Bottle page /bottles/new |
| Task 2 | `a68e4d2` | feat: Edit/Delete Bottle page /bottles/[id]/edit |

---

## Wave 4 Consumption

Wave 4 (integration/E2E tests) consumes:
- `app/bottles/new/page.tsx` → F1 E2E tests (`/bottles/new` form flow)
- `app/bottles/[id]/edit/page.tsx` → F2/F3 E2E tests (edit pre-population, save, delete with confirm)
