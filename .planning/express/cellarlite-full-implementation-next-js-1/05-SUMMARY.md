---
phase: cellarlite-full-implementation-next-js-1
plan: "05"
subsystem: UI — Mutation Pages (Wave 3B)
tags: [next-js, react, client-component, forms, validation, mobile-first]
dependency_graph:
  requires:
    - plan: "01"
      artifact: next.config.mjs
      contract: "headers() — X-Frame-Options: SAMEORIGIN"
    - plan: "02"
      artifact: app/api/bottles/route.ts
      contract: "POST /api/bottles"
    - plan: "03"
      artifact: app/api/bottles/[id]/route.ts
      contract: "GET, PUT, DELETE /api/bottles/[id]"
  provides:
    - artifact: app/bottles/new/page.tsx
      exports: [default NewBottlePage]
    - artifact: app/bottles/[id]/edit/page.tsx
      exports: [default EditBottlePage]
  affects: []
tech_stack:
  added: []
  patterns:
    - Next.js App Router Client Components ('use client')
    - useRouter from next/navigation for redirects
    - useParams from next/navigation for dynamic route params
    - Inline style objects for mobile-first TechSur brand styling
    - Controlled form inputs with useState
    - useEffect for data fetching on mount
    - Client-side validation before fetch (no network request on invalid input)
    - window.confirm guard for destructive DELETE action
key_files:
  created:
    - app/bottles/new/page.tsx
    - app/bottles/[id]/edit/page.tsx
  modified: []
decisions:
  - "Used useParams() (App Router) instead of props.params for dynamic id extraction — avoids async params deprecation warning in Next.js 15"
  - "Quantity defaults to '1' string for new bottles (input compatibility), empty string for edit (pre-populated from API)"
  - "Not-found state triggered by both non-integer id (client-side guard) and 404 from GET — covers US-2.6 fully"
  - "Delete section visually separated with borderTop divider + 24px padding gap per UX-Mockup spec"
  - "Cancel is plain <a href='/'>  (not router.push) to avoid JavaScript dependency for navigation"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 05: Add/Edit/Delete Bottle UI Pages Summary

## One-liner

Mobile-first Add Bottle (`/bottles/new`) and Edit/Delete Bottle (`/bottles/[id]/edit`) Client Components with full form validation, error handling, not-found state, and gold/red TechSur brand buttons.

## What Was Built

### Task 1: Add Bottle Page — `/bottles/new` (commit `a25348c`)

**File:** `app/bottles/new/page.tsx`

- `'use client'` Client Component — form interactivity requires browser JS
- Five labeled form fields (WCAG-compliant `htmlFor` on every label):
  - **Name** (required, `autoFocus`, red border on error)
  - **Vintage** (number, min 1800 max 2027, optional)
  - **Varietal** (text, optional)
  - **Quantity** (number, min 1, default `"1"`, optional)
  - **Location** (text, optional)
- Client-side validation: blank Name → inline "Name is required" with no `fetch` call
- Submit flow: `POST /api/bottles` → 201 → `router.push('/')` | 422 → server error banner | other → generic error banner
- Gold Save button: `background: #FBCA5C`, `color: #0A0A0A`, `height: 48px`, full-width, `border-radius: 6px`
- All inputs: `height: 48px`, `font-size: 16px` (prevents iOS auto-zoom)
- Cancel: `<a href="/">` plain link (no JS required)
- No `X-Frame-Options` header emitted — handled globally by `next.config.mjs`

### Task 2: Edit/Delete Bottle Page — `/bottles/[id]/edit` (commit `e56bfe1`)

**File:** `app/bottles/[id]/edit/page.tsx`

- `'use client'` Client Component
- **On mount** (`useEffect`): extracts `id` from `useParams()`, validates it's a positive integer, fetches `GET /api/bottles/${id}`, pre-populates all 5 fields; non-integer id or 404 → not-found state (no crash)
- **Not-found state**: renders "Bottle not found." + description + gold "← Back to My Cellar" `<a href="/">` link — satisfies US-2.6
- **Loading state**: shows "Loading…" placeholder while fetch is in-flight
- Five labeled form fields (all pre-populated from API response)
- Quantity input has `onFocus={e => e.target.select()}` for instant replacement UX (UX-Mockup requirement)
- **Save logic**: client validates name non-blank → `PUT /api/bottles/${id}` with all 5 fields (full-replacement per FRD F02-REQ-04) → 200 → `router.push('/')` | 422 → server error banner
- **Delete logic**: `window.confirm('Delete this bottle?')` guard → if cancelled, no fetch, user stays on page → if OK, `DELETE /api/bottles/${id}` → 204 → `router.push('/')` | 404 → "This bottle could not be deleted. It may have already been removed." banner
- Gold Save button: `background: #FBCA5C`, 48px height, full-width
- Red Delete button: `background: transparent`, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px height — visually separated from Save by `borderTop: 1px solid #E5E7EB` divider with 24px gap
- Cancel: `<a href="/">` plain link below Delete button

## Key Implementation Decisions

1. **`useParams()` for route id extraction** — Used App Router's `useParams()` hook instead of accessing `params` as a prop to avoid the Next.js 15 async params deprecation warning and align with current App Router conventions.

2. **Quantity state as string** — Both pages store all form field values as strings in `useState` for input compatibility. Numeric fields are parsed to integers (or null) only at submit time. New page defaults quantity to `"1"`; edit page defaults to empty string pre-fetch, then populates from API.

3. **Two-layer not-found detection on edit page** — Client-side guards against non-integer `id` values (e.g., `/bottles/abc/edit`) before making a fetch, preventing unnecessary API calls. API 404 also triggers the not-found state, satisfying US-2.6 fully.

4. **`window.confirm` for delete guard** — Synchronous native confirm dialog used per spec (FRD F03-REQ-03). Cancel immediately returns without setting `deleting` state or making any fetch call.

5. **Cancel as `<a href="/">` (not `router.push`)** — Plain anchor for cancel navigation avoids JavaScript dependency and works even during hydration. Matches spec requirement that cancel "navigates to / without any API call."

## Deviations from Plan

None — plan executed exactly as written. The implementation exactly matches the code scaffolding provided in the plan's `<action>` blocks with all five form fields, error states, validation, and brand styling.

## Self-Check

### Files exist:
- `app/bottles/new/page.tsx` ✅
- `app/bottles/[id]/edit/page.tsx` ✅

### Commits exist:
- `a25348c` — feat: Add Bottle page /bottles/new ✅
- `e56bfe1` — feat: Edit/Delete Bottle page /bottles/[id]/edit ✅

### TypeScript: clean compile (0 errors) ✅

### Contract verifications:
- Wave 1: `X-Frame-Options: SAMEORIGIN` in `next.config.mjs` ✅
- Wave 2: `POST /api/bottles` ✅
- Wave 2: `GET, PUT, DELETE /api/bottles/[id]` ✅
- Plan 05 provides: `app/bottles/new/page.tsx` default export ✅
- Plan 05 provides: `app/bottles/[id]/edit/page.tsx` default export ✅

## Self-Check: PASSED
