---
phase: cellarlite-full-implementation-next-js-1
plan: "05"
subsystem: mutation-ui
tags: [next-js, react, client-components, forms, validation, mobile-first]
dependency_graph:
  requires:
    - plan: "01"
      artifact: "next.config.mjs"
      contract: "X-Frame-Options: SAMEORIGIN global header"
    - plan: "02"
      artifact: "app/api/bottles/route.ts"
      contract: "POST /api/bottles → 201"
    - plan: "03"
      artifact: "app/api/bottles/[id]/route.ts"
      contract: "GET/PUT/DELETE /api/bottles/[id]"
  provides:
    - artifact: "app/bottles/new/page.tsx"
      exports: ["default NewBottlePage"]
      consumed_by: ["wave-4 E2E tests (F1)"]
    - artifact: "app/bottles/[id]/edit/page.tsx"
      exports: ["default EditBottlePage"]
      consumed_by: ["wave-4 E2E tests (F2, F3)"]
  affects: []
tech_stack:
  added: []
  patterns:
    - "React useState for multi-field form state management"
    - "useEffect + useParams for data fetching on mount (App Router)"
    - "Client-side validation before fetch (no network call on blank name)"
    - "Inline style objects for mobile-first brand tokens (no CSS modules needed)"
    - "onFocus select-all for numeric quantity input (UX instant replacement pattern)"
    - "window.confirm guard before destructive DELETE"
key_files:
  created:
    - app/bottles/new/page.tsx
    - "app/bottles/[id]/edit/page.tsx"
  modified: []
decisions:
  - "Used id-based label htmlFor attributes (edit-name, edit-vintage, etc.) on edit page to avoid duplicate id conflicts if both pages were ever rendered simultaneously"
  - "Validate id as positive integer in useEffect before fetch to avoid spurious 400 errors from API; show notFound state immediately"
  - "quantity state initialized as '1' (string) on add page and populated from bottle data on edit page — string state avoids controlled/uncontrolled input issues with number inputs"
  - "Separate `deleting` boolean from `submitting` to allow independent disabled states for Save and Delete buttons"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-06-15"
  tasks_completed: 2
  files_created: 2
  lines_added: 598
---

# Phase cellarlite-full-implementation-next-js-1 Plan 05: Mutation UI Pages Summary

**One-liner:** Add Bottle (`/bottles/new`) and Edit/Delete Bottle (`/bottles/[id]/edit`) Client Components with form validation, not-found handling, gold/red button styling, and full CRUD API integration.

---

## What Was Built

### Task 1: Add Bottle Page — `app/bottles/new/page.tsx` (262 lines)

A `'use client'` Next.js App Router Client Component providing the Add Bottle form (F1: US-1.1–1.4):

- **Five labeled fields** (all with explicit `<label htmlFor="...">` for WCAG): Name* (required, `autoFocus`), Vintage (number, 1800–2027), Varietal (text), Quantity (number, default "1"), Location (text)
- **Client validation**: blank Name → inline "Name is required" error with red border — **no fetch call made**
- **Submit flow**: POST `/api/bottles` → 201 → `router.push('/')` (Next.js router); 422 → server error banner at top; other errors → generic error message
- **Gold primary button** (`background: #FBCA5C`, `color: #0A0A0A`, 48px height, full-width)
- **Cancel** as `<a href="/">` plain link (no button/submit)
- All inputs 48px height, 16px font-size (iOS auto-zoom prevention)
- `submitting` state disables Save button during in-flight request

### Task 2: Edit/Delete Bottle Page — `app/bottles/[id]/edit/page.tsx` (336 lines)

A `'use client'` Next.js App Router Client Component providing the Edit + Delete Bottle page (F2: US-2.1–2.6; F3: US-3.1–3.2):

- **On mount**: `useParams()` extracts id; validates as positive integer (non-integer → `notFound = true` without fetch); fetches `GET /api/bottles/${id}` → populates all 5 fields; 404 → `notFound = true`
- **Not-found state** (US-2.6): renders "Bottle not found." + descriptive copy + gold "← Back to My Cellar" link — no crash, no blank page
- **Loading state**: nav bar + centered "Loading…" text while fetch is in flight
- **Five labeled fields**: Name* (edit-name), Vintage (edit-vintage), Varietal (edit-varietal), Quantity (edit-quantity, `onFocus={e => e.target.select()}` for instant replacement), Location (edit-location)
- **Save**: client validates name → PUT `/api/bottles/${id}` (full replacement, all 5 fields) → 200 → `router.push('/')`
- **Delete**: `type="button"`, `window.confirm('Delete this bottle?')` guard — Cancel = no API call; OK = DELETE → 204 → `router.push('/')`; 404 → specific "already removed" message
- **Visual separation**: 24px margin-top + border-top divider between Save and Delete sections
- **Gold Save button** (`#FBCA5C`, 48px); **Red Delete button** (transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px)
- **Cancel** as `<a href="/">` below Delete button

---

## Key Implementation Decisions

1. **Separate label IDs on edit page** (`edit-name`, `edit-vintage`, etc.): Used prefixed IDs to avoid conflicts, consistent with the plan spec labels.

2. **id validation before fetch**: On edit page, non-integer or non-positive id immediately sets `notFound = true` without making a network request — avoids spurious API errors and provides instant UX.

3. **String-typed form state for number inputs**: Quantity (and Vintage) stored as strings to prevent React controlled/uncontrolled input warnings; parsed to integers only on submit.

4. **Separate `deleting` vs `submitting` booleans**: Allows Save and Delete buttons to have independent disabled states — user can't click Delete while Save is in flight and vice versa.

5. **`window.confirm` for delete guard**: Spec-mandated (FRD F03-REQ-02). Cancel path returns immediately without setting `deleting = true`, ensuring no visual state change.

6. **No X-Frame-Options in components**: Global `SAMEORIGIN` header handled by `next.config.mjs` (plan 01). No per-component headers emitted.

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `d903a07` | feat: Add Bottle page /bottles/new |
| Task 2 | `7300d48` | feat: Edit/Delete Bottle page /bottles/[id]/edit |

---

## Integration Contracts Verified

| Contract | Status |
|----------|--------|
| `next.config.mjs` — X-Frame-Options: SAMEORIGIN | ✅ OK |
| `app/api/bottles/route.ts` — POST | ✅ OK |
| `app/api/bottles/[id]/route.ts` — GET | ✅ OK |
| `app/api/bottles/[id]/route.ts` — PUT | ✅ OK |
| `app/api/bottles/[id]/route.ts` — DELETE | ✅ OK |

---

## Deviations from Plan

None — plan executed exactly as written. Both files match the full implementations provided in the plan spec.

Pre-existing TypeScript errors in `app/api/bottles/route.ts` (missing `../../lib/db` and `../../types/bottle` modules from plan 02) were present before this plan and are out of scope. Zero TypeScript errors in the new `app/bottles/` files.

---

## Wave 4 Consumption

Wave 4 (integration/E2E tests) will consume:
- `app/bottles/new/page.tsx` — F1 E2E test scenarios (US-1.1–1.4)
- `app/bottles/[id]/edit/page.tsx` — F2/F3 E2E test scenarios (US-2.1–2.6, US-3.1–3.2)

## Self-Check: PASSED

- [x] `app/bottles/new/page.tsx` exists (262 lines, `'use client'`, exports default)
- [x] `app/bottles/[id]/edit/page.tsx` exists (336 lines, `'use client'`, exports default)
- [x] Commit `d903a07` exists (Task 1)
- [x] Commit `7300d48` exists (Task 2)
- [x] All 5 labels on add page: name ✓, vintage ✓, varietal ✓, quantity ✓, location ✓
- [x] Not-found handling on edit page ✓
- [x] Delete confirm `window.confirm('Delete this bottle?')` ✓
- [x] Gold buttons `#FBCA5C` on both pages ✓
- [x] Red delete button `#B91C1C` on edit page ✓
- [x] No `X-Frame-Options: DENY` in any component ✓
