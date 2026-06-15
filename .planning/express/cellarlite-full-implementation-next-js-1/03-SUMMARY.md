---
phase: cellarlite-full-implementation-next-js-1
plan: "03"
subsystem: api
tags: [rest-api, next-js, route-handler, crud, postgresql]
dependency_graph:
  requires: [plan-01]
  provides: [GET /api/bottles/:id, PUT /api/bottles/:id, DELETE /api/bottles/:id]
  affects: [wave-3-edit-page, wave-3-delete-flow]
tech_stack:
  added: []
  patterns: [next-js-app-router-route-handler, parameterised-sql, full-replacement-put]
key_files:
  created:
    - app/api/bottles/[id]/route.ts
  modified: []
decisions:
  - "204 response uses new Response(null, { status: 204 }) not NextResponse.json() to ensure empty body"
  - "quantity null on PUT passes null to DB — DB NOT NULL constraint enforces requirement (edit form always sends current value per FRD §F02)"
  - "Full replacement semantics: absent optional fields in PUT body stored as NULL in all columns"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-15T17:27:36Z"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 03: Single Bottle REST Endpoints Summary

## One-liner

GET/PUT/DELETE route handler for single bottle with full validation, parameterised SQL, and correct HTTP status codes per FRD §F05.

## What Was Built

Implemented `app/api/bottles/[id]/route.ts` — the Next.js App Router Route Handler for single-bottle operations. This completes wave 2B of the CellarLite implementation and enables wave 3 frontend tasks (edit page and delete flow).

### Endpoints Implemented

| Endpoint | Success | Error Cases |
|----------|---------|-------------|
| `GET /api/bottles/:id` | 200 + Bottle object | 404 (invalid id or not found), 500 |
| `PUT /api/bottles/:id` | 200 + updated Bottle | 400 (malformed JSON), 404 (invalid id or not found), 422 (validation), 500 |
| `DELETE /api/bottles/:id` | 204 empty body | 404 (invalid id or not found), 500 |

### Key Implementation Details

- **`parseId` helper**: Rejects NaN, 0, and negative integers → 404 for all three handlers
- **PUT full replacement**: Absent optional fields stored as NULL (complete column overwrite semantics)
- **PUT allows quantity=0**: Finished bottles supported; only negative values rejected
- **204 empty body**: Uses `new Response(null, { status: 204 })` — never `NextResponse.json()`
- **Parameterised SQL**: All queries use `$1`…`$N` placeholders — zero string interpolation
- **Error messages**: Match FRD error catalog exactly — `"Not found"`, `"Name is required"`, `"Quantity cannot be negative"`, `"Invalid JSON"`, `"Internal server error"`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: GET/PUT/DELETE route handler | 578e643 | feat(cellarlite-full-implementation-next-js-1-03): add GET/PUT/DELETE single bottle route handler |

## Integration Contracts

### Consumed (Wave 1)
- `lib/db.ts` — `export default pool` (pg.Pool) ✅ verified
- `scripts/migrate.mjs` — `CREATE TABLE IF NOT EXISTS bottles` ✅ verified

### Provided (for Wave 3)
- `app/api/bottles/[id]/route.ts` exports `GET`, `PUT`, `DELETE` ✅
- Shape: `GET /api/bottles/:id → 200 Bottle | 404 | 500`
- Shape: `PUT /api/bottles/:id → 200 Bottle | 400 | 404 | 422 | 500`
- Shape: `DELETE /api/bottles/:id → 204 (empty) | 404 | 500`

## Deviations from Plan

None — plan executed exactly as written.

## Deferred Items

**Out-of-scope pre-existing issue** (not caused by this task):
- `app/api/bottles/route.ts` (untracked file from a prior session) uses relative import `../../lib/db` and `../../types/bottle` instead of `@/lib/db` and `@/types/bottle`. This causes 2 TypeScript errors but is unrelated to the files modified in this plan. Recommended fix in a future task: update to use `@/` path aliases.

## Self-Check

- [x] `app/api/bottles/[id]/route.ts` exists (170 lines, exceeds min_lines: 80)
- [x] Exports `GET`, `PUT`, `DELETE` named async functions
- [x] All SQL uses parameterised `$1`…`$N` — no string interpolation
- [x] `parseId` rejects NaN, 0, negative → 404
- [x] 204 response uses `new Response(null, { status: 204 })`
- [x] No TypeScript errors in the new file (`npx tsc --noEmit` shows no errors for `[id]/route.ts`)
- [x] Wave 1 integration contracts still satisfied
- [x] Commit 578e643 exists

## Self-Check: PASSED
