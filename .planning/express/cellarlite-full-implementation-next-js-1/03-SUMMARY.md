---
phase: cellarlite-full-implementation-next-js-1
plan: "03"
subsystem: api
tags: [rest-api, next-js, route-handler, bottles, crud]
dependency_graph:
  requires: [01-PLAN.md]
  provides: [app/api/bottles/[id]/route.ts]
  affects: [wave-3-frontend-edit-delete]
tech_stack:
  added: []
  patterns: [next-js-app-router-route-handler, parameterised-sql, full-replacement-put]
key_files:
  created:
    - app/api/bottles/[id]/route.ts
  modified: []
decisions:
  - "quantity=null in PUT body causes 500 via DB NOT NULL constraint — by spec design (edit form always sends current value per FRD §F02)"
  - "Full replacement PUT semantics: absent optional fields → NULL stored in DB"
  - "204 DELETE uses new Response(null, {status:204}) not NextResponse.json() to guarantee empty body"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-15"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 03: Single Bottle API Endpoints Summary

**One-liner:** GET/PUT/DELETE route handler for `/api/bottles/[id]` with parameterised SQL, full-replacement PUT semantics, and exact FRD error messages.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Create `app/api/bottles/[id]/route.ts` — GET, PUT, DELETE single bottle | `66aeebd` | ✅ |

## What Was Built

### `app/api/bottles/[id]/route.ts`

Next.js App Router Route Handler implementing three REST endpoints for single-bottle operations:

**GET `/api/bottles/[id]`**
- Returns 200 + bottle object when id exists in DB
- Returns 404 `{"error":"Not found"}` for invalid id (non-integer, 0, negative) or id not in DB
- Returns 500 on DB error

**PUT `/api/bottles/[id]`**
- Full column replacement semantics: absent optional fields → NULL stored in DB
- Returns 200 + updated bottle on success
- Returns 400 `{"error":"Invalid JSON"}` for malformed request body
- Returns 404 for invalid/missing id
- Returns 422 with exact FRD error messages for validation failures
- Allows `quantity=0` (finished bottle); rejects `quantity<0`
- Validates name (required, max 255), vintage (1800–currentYear+1), varietal (max 255), location (max 500)

**DELETE `/api/bottles/[id]`**
- Returns 204 empty body via `new Response(null, { status: 204 })`
- Returns 404 for invalid/missing id
- Returns 500 on DB error

### Key Implementation Details

- **`parseId` helper:** Rejects NaN, 0, and negative integers → 404 for all three handlers
- **Parameterised SQL:** All queries use `$1`…`$N` placeholders; zero string interpolation
- **Error messages:** Match FRD Cross-Feature Error Catalog exactly: `"Not found"`, `"Name is required"`, `"Quantity cannot be negative"`, `"Vintage must be a valid year"`, `"Invalid JSON"`, `"Internal server error"`
- **No directives:** No `'use client'` or `'use server'` — Route Handlers are server-side by default

## Verification Results

```
FILE EXISTS OK
GET EXPORT OK
PUT EXPORT OK
DELETE EXPORT OK
POOL IMPORT OK
GET SQL OK
PUT SQL OK
DELETE SQL OK
RETURNING OK
204 EMPTY BODY OK
3 EXPORTS OK
DB CONTRACT OK
MIGRATION CONTRACT OK
TSC: clean (no errors)
```

## Integration Contracts

### Consumed (Wave 1 → Wave 2)
- `lib/db.ts` → `export default pool` ✅ verified
- `scripts/migrate.mjs` → `CREATE TABLE IF NOT EXISTS bottles` ✅ verified

### Provided (Wave 2 → Wave 3)
- `app/api/bottles/[id]/route.ts` → exports `GET`, `PUT`, `DELETE` ✅
- Wave 3 edit page (`app/bottles/[id]/edit/page.tsx`) can now call GET to pre-populate form, PUT to save changes, DELETE to remove bottle

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `app/api/bottles/[id]/route.ts` exists: FOUND
- [x] Commit `66aeebd` exists: FOUND
- [x] TypeScript compiles cleanly: PASSED
- [x] 3 named exports (GET, PUT, DELETE): CONFIRMED
- [x] Wave 1 contracts satisfied: CONFIRMED

## Self-Check: PASSED
