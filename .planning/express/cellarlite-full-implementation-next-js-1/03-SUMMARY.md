---
phase: cellarlite-full-implementation-next-js-1
plan: "03"
subsystem: backend-api
tags: [rest-api, next-js, route-handler, crud, validation]
dependency_graph:
  requires:
    - plan: "01"
      artifact: lib/db.ts
      exports: [pool]
    - plan: "01"
      artifact: scripts/migrate.mjs
      exports: [bottles table DDL]
  provides:
    - artifact: app/api/bottles/[id]/route.ts
      exports: [GET, PUT, DELETE]
      consumed_by: [plan-05-edit-page, plan-06-delete-flow]
  affects:
    - wave 3 frontend plans (edit page, delete flow)
tech_stack:
  added: []
  patterns:
    - Next.js App Router Route Handler (server-side, no use client/use server)
    - PostgreSQL parameterised queries via pg.Pool
    - Full replacement PUT semantics (absent fields → NULL)
    - HTTP 204 with empty body via new Response(null, { status: 204 })
key_files:
  created:
    - app/api/bottles/[id]/route.ts
  modified: []
decisions:
  - "parseId rejects NaN, 0, and negative → 404 Not found (not 400)"
  - "PUT quantity=null defers to DB NOT NULL constraint → 500 (edit form must always send current value)"
  - "DELETE returns new Response(null, {status:204}) not NextResponse.json to ensure empty body"
  - "Full replacement semantics: all 5 columns always updated in PUT, absent fields become NULL"
metrics:
  duration_minutes: 5
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
  completed_date: "2026-06-16"
---

# Phase cellarlite-full-implementation-next-js-1 Plan 03: Single-Bottle API Summary

**One-liner:** GET/PUT/DELETE route handler for `/api/bottles/[id]` with full validation, parameterised SQL, 204 empty body on delete, and FRD-exact error messages.

## What Was Built

Single Next.js App Router Route Handler (`app/api/bottles/[id]/route.ts`) implementing all three single-bottle REST endpoints defined by FRD §F05 and TechArch §4.

### Endpoints Implemented

| Method | Path | Success | Failure |
|--------|------|---------|---------|
| GET | `/api/bottles/:id` | 200 + Bottle object | 404 (invalid id or not found), 500 |
| PUT | `/api/bottles/:id` | 200 + updated Bottle | 400 (bad JSON), 404 (invalid/not found), 422 (validation), 500 |
| DELETE | `/api/bottles/:id` | 204 empty body | 404 (invalid/not found), 500 |

### Key Implementation Details

- **`parseId` helper:** Validates id as positive integer; NaN/0/negative → 404 Not found
- **PUT full replacement:** All 5 editable columns always SET in SQL; absent optional fields → NULL
- **PUT allows quantity=0:** Finished bottles — validated as `>= 0` (POST requires `>= 1`)
- **DELETE 204:** Uses `new Response(null, { status: 204 })` — not `NextResponse.json()` — to ensure truly empty body
- **Parameterised SQL:** All queries use `$1`…`$N` placeholders; zero string interpolation into SQL

### Error Messages (FRD-exact)

| Condition | Status | Message |
|-----------|--------|---------|
| Invalid/missing id | 404 | `"Not found"` |
| Record not found in DB | 404 | `"Not found"` |
| Malformed JSON body | 400 | `"Invalid JSON"` |
| Missing/blank name | 422 | `"Name is required"` |
| Non-integer vintage | 422 | `"Vintage must be a valid year"` |
| Out-of-range vintage | 422 | `"Vintage must be between 1800 and YYYY"` |
| Non-integer quantity | 422 | `"Quantity must be a whole number"` |
| Negative quantity | 422 | `"Quantity cannot be negative"` |
| DB error | 500 | `"Internal server error"` |

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create app/api/bottles/[id]/route.ts — GET, PUT, DELETE single bottle | b5c6709 | app/api/bottles/[id]/route.ts (created, 170 lines) |

## Integration Contracts

**Consumes (wave 1):**
- `lib/db.ts` → `export default pool` (pg.Pool singleton) ✓
- `scripts/migrate.mjs` → `CREATE TABLE IF NOT EXISTS bottles` ✓

**Provides (for wave 3):**
- `app/api/bottles/[id]/route.ts` → exports `GET`, `PUT`, `DELETE` ✓

## Deviations from Plan

None — plan executed exactly as written.

**Pre-existing issue noted (out of scope):** `app/api/bottles/route.ts` (from plan 02) has TypeScript import path errors (`../../lib/db` relative path, missing `../../types/bottle` module). These are not caused by this plan's changes and are deferred to plan 02's owner.

## Self-Check

| Item | Status |
|------|--------|
| `app/api/bottles/[id]/route.ts` exists | ✓ |
| Exports GET, PUT, DELETE | ✓ |
| Commit b5c6709 exists | ✓ |
| Wave 1 contracts satisfied | ✓ |
| No TypeScript errors in our file | ✓ |
| 204 uses empty body | ✓ |
| All error messages match FRD | ✓ |
| No SQL string interpolation | ✓ |

## Self-Check: PASSED
