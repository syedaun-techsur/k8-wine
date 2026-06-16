---
phase: cellarlite-full-implementation-next-js-1
plan: "05"
subsystem: ui-forms
tags: [next-js, client-components, forms, validation, mobile-first]
dependency_graph:
  requires:
    - plan: "01"
      artifact: next.config.mjs
      exports: [headers — X-Frame-Options SAMEORIGIN]
    - plan: "02"
      artifact: app/api/bottles/route.ts
      exports: [GET, POST]
    - plan: "03"
      artifact: app/api/bottles/[id]/route.ts
      exports: [GET, PUT, DELETE]
  provides:
    - artifact: app/bottles/new/page.tsx
      exports: [default NewBottlePage]
    - artifact: app/bottles/[id]/edit/page.tsx
      exports: [default EditBottlePage]
  affects: []
tech_stack:
  added: []
  patterns:
    - Next.js App Router Client Components with 'use client'
    - useRouter from next/navigation for SPA redirect
    - useParams from next/navigation for dynamic route params
    - useEffect for on-mount data fetching
    - Controlled inputs with useState for all form fields
    - Client-side validation before any network call
    - Inline error state with role="alert" for accessibility
    - onFocus select-all for number inputs (UX-Mockup pattern)
    - window.confirm for destructive action guard
key_files:
  created:
    - app/bottles/new/page.tsx
    - app/bottles/[id]/edit/page.tsx
  modified: []
decisions:
  - "Used controlled inputs (useState per field) rather than uncontrolled refs for predictable re-render on error state"
  - "Cancel links are plain <a href='/'> to avoid any form-related behavior or JS dependency"
  - "Not-found detection: validate id as positive integer before fetch; also catch 404 from API"
  - "Gold save buttons use inline styles matching TechSur brand (#FBCA5C, 48px, full-width) per UX-Mockup"
  - "Delete button placed outside <form> in separate div to avoid accidental form submission"
  - "Pre-existing TypeScript errors in app/api/bottles/route.ts (lib/db, types/bottle missing) are out-of-scope"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 05: Add/Edit/Delete Bottle UI Pages Summary

**One-liner:** Mobile-first Next.js Client Components for Add Bottle and Edit/Delete Bottle forms with client-side validation, TechSur gold/red brand styling, and not-found state handling.

---

## What Was Built

### Task 1: Add Bottle Page — `app/bottles/new/page.tsx`

A `'use client'` Next.js App Router Client Component providing a form to add a new wine bottle to the cellar.

**Key behaviors:**
- Five labeled form fields: Name* (required, autoFocus), Vintage (number 1800-2027), Varietal (text), Quantity (number, default `1`), Location (text)
- Client-side validation: empty Name triggers inline `"Name is required"` alert without any network call
- On valid submit: `POST /api/bottles` with JSON body; 201 → `router.push('/')`
- 422 response: server error message shown in top-of-form banner (`role="alert"`)
- Other errors: generic "Something went wrong. Please try again." banner
- Save button: gold `#FBCA5C`, full-width, 48px, disabled + opacity 0.6 during request
- Cancel: `<a href="/">` plain link (no JS, no button)
- All inputs: 48px height, 16px font-size (prevents iOS auto-zoom)
- No `X-Frame-Options: DENY` — handled globally by `next.config.mjs` (plan 01)

### Task 2: Edit/Delete Bottle Page — `app/bottles/[id]/edit/page.tsx`

A `'use client'` Next.js App Router Client Component for editing and deleting an existing bottle.

**Key behaviors:**
- On mount (`useEffect`): validates `id` is a positive integer, then `GET /api/bottles/${id}`
- Pre-populates all 5 fields from API response
- Non-integer id **or** 404 from API → not-found state: "Bottle not found." + "← Back to My Cellar" link (no crash)
- Loading state: spinner text "Loading…" while fetching
- Client-side validation on save: empty Name → inline `"Name is required"`, no fetch
- Save: `PUT /api/bottles/${id}` with all 5 fields (full-replacement semantics); 200 → `router.push('/')`
- Quantity input: `onFocus={e => e.target.select()}` for instant-replacement UX on mobile
- Delete button: `type="button"`, fires `window.confirm('Delete this bottle?')`
  - Cancel in confirm: no fetch, user stays on edit page
  - OK: `DELETE /api/bottles/${id}`; 204 → `router.push('/')`; 404 → specific "already removed" message
- Save button: gold `#FBCA5C`, 48px, full-width
- Delete button: transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px height
- Visual separator (24px gap + border-top divider) between Save and Delete sections
- Cancel: `<a href="/">` below Delete button

---

## Integration Contracts Verified

| Contract | Source | Status |
|----------|--------|--------|
| `X-Frame-Options: SAMEORIGIN` in `next.config.mjs` | Plan 01 | ✅ CONTRACT_OK |
| `POST /api/bottles` exported from `app/api/bottles/route.ts` | Plan 02 | ✅ CONTRACT_OK |
| `GET /api/bottles/[id]` exported from `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |
| `PUT /api/bottles/[id]` exported from `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |
| `DELETE /api/bottles/[id]` exported from `app/api/bottles/[id]/route.ts` | Plan 03 | ✅ CONTRACT_OK |

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `091ab33` | feat: Add Bottle page /bottles/new |
| Task 2 | `3368c2b` | feat: Edit/Delete Bottle page /bottles/[id]/edit |

---

## Deviations from Plan

None — plan executed exactly as written. The pre-existing TypeScript errors in `app/api/bottles/route.ts` (missing `lib/db` and `types/bottle` modules) are out-of-scope — they are from prior plan artifacts and not caused by this plan's changes.

---

## Wave 4 Consumers

Wave 4 integration/E2E tests will consume:
- `app/bottles/new/page.tsx` — Add Bottle Client Component (F1 E2E tests for US-1.1–1.4)
- `app/bottles/[id]/edit/page.tsx` — Edit/Delete Bottle Client Component (F2/F3 E2E tests for US-2.1–2.6, US-3.1–3.2)

## Self-Check: PASSED

Files verified:
- ✅ `app/bottles/new/page.tsx` — exists, 262 lines, all verification checks pass
- ✅ `app/bottles/[id]/edit/page.tsx` — exists, 336 lines, all verification checks pass

Commits verified:
- ✅ `091ab33` — Task 1 commit exists in git log
- ✅ `3368c2b` — Task 2 commit exists in git log
