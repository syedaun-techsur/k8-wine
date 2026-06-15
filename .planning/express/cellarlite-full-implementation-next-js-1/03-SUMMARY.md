---
phase: cellarlite-full-implementation-next-js-1
plan: "03"
subsystem: api
tags: [rest-api, bottles, next-js, app-router, route-handler]
dependency_graph:
  requires: [lib/db.ts (pool singleton from plan 01), scripts/migrate.mjs (bottles table from plan 01)]
  provides: [app/api/bottles/[id]/route.ts (GET/PUT/DELETE)]
  affects: [wave 3 edit page, wave 3 delete flow]
tech_stack:
  added: []
  patterns: [Next.js App Router Route Handler, parameterised SQL, full-replacement PUT semantics, 204 empty body via new Response(null)]
key_files:
  created: [app/api/bottles/[id]/route.ts]
  modified: []
decisions:
  - "quantity=null on PUT passes NULL to DB; DB NOT NULL constraint enforces requirement (FRD: edit form always sends current quantity)"
  - "204 DELETE uses new Response(null, {status:204}) not NextResponse.json() to guarantee empty body"
  - "parseId rejects NaN, 0, and negatives returning 404 (not 400) per spec"
metrics:
  duration: "< 5 minutes"
  completed: "2026-06-15"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 03: Single Bottle API Endpoints Summary

**One-liner:** GET/PUT/DELETE route handler for single bottles with full validation, parameterised SQL, and exact FRD error messages.

## What Was Built

`app/api/bottles/[id]/route.ts` — Next.js App Router Route Handler implementing three REST endpoints for single-bottle operations.

### Endpoints Implemented

| Endpoint | Success | Errors |
|----------|---------|--------|
| `GET /api/bottles/[id]` | 200 + Bottle object | 404 (invalid id or not found), 500 |
| `PUT /api/bottles/[id]` | 200 + updated Bottle | 400 (bad JSON), 404 (invalid/missing id), 422 (validation), 500 |
| `DELETE /api/bottles/[id]` | 204 empty body | 404 (invalid/missing id), 500 |

### Key Implementation Details

- **`parseId` helper:** Rejects NaN, 0, and negative values → 404 `{"error":"Not found"}` for all three handlers
- **Full replacement PUT:** All 5 editable columns always overwritten; absent optional fields stored as NULL
- **`quantity=0` allowed on PUT:** Represents a "finished bottle" — differs from POST which requires ≥ 1
- **204 empty body:** Uses `new Response(null, { status: 204 })` not `NextResponse.json()` to guarantee no response body
- **Parameterised SQL:** All queries use `$1`…`$N` placeholders — zero string interpolation

### SQL Queries

```sql
-- GET
SELECT * FROM bottles WHERE id = $1

-- PUT
UPDATE bottles
SET name = $1, vintage = $2, varietal = $3, quantity = $4, location = $5
WHERE id = $6
RETURNING *

-- DELETE
DELETE FROM bottles WHERE id = $1 RETURNING id
```

### Validation Rules (PUT)

| Field | Rule | Error message |
|-------|------|---------------|
| `name` | Required; non-empty after trim; max 255 chars | `"Name is required"` |
| `vintage` | If present: integer in [1800, currentYear+1] | `"Vintage must be a valid year"` / `"Vintage must be between 1800 and YYYY"` |
| `varietal` | If present: string; max 255 chars | `"Varietal must be 255 characters or fewer"` |
| `quantity` | If present: integer ≥ 0 | `"Quantity must be a whole number"` / `"Quantity cannot be negative"` |
| `location` | If present: string; max 500 chars | `"Location must be 500 characters or fewer"` |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Create route.ts | `6c24116` | feat(cellarlite-full-implementation-next-js-1-03): add GET/PUT/DELETE single bottle route handler |

## Integration Contracts

### Consumed (from Plan 01)
- `lib/db.ts` → `export default pool` ✅ verified
- `scripts/migrate.mjs` → `CREATE TABLE IF NOT EXISTS bottles` ✅ verified

### Provided (for Wave 3)
- `app/api/bottles/[id]/route.ts` → exports `GET`, `PUT`, `DELETE` ✅
- Wave 3 edit page (`app/bottles/[id]/edit/page.tsx`) can now call GET to pre-populate, PUT to save, DELETE to remove

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `app/api/bottles/[id]/route.ts` — FOUND ✅
- Commit `6c24116` — FOUND ✅
- 3 named exports (GET, PUT, DELETE) — VERIFIED ✅
- Wave 1 contracts satisfied — VERIFIED ✅
- TypeScript compilation — CLEAN (0 errors) ✅
