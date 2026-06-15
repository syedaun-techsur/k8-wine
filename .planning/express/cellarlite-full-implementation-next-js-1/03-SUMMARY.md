---
phase: cellarlite-full-implementation-next-js-1
plan: "03"
subsystem: api
tags: [rest-api, next-js, route-handler, crud, validation]
dependency_graph:
  requires: ["01 (lib/db.ts Pool singleton, migrate.mjs)"]
  provides: ["app/api/bottles/[id]/route.ts — GET, PUT, DELETE for single bottle"]
  affects: ["Wave 3 edit page (F2) and delete flow (F3)"]
tech_stack:
  added: []
  patterns: ["Next.js App Router Route Handler", "parameterised SQL via pg Pool", "full-replacement PUT semantics"]
key_files:
  created: ["app/api/bottles/[id]/route.ts"]
  modified: ["app/api/bottles/route.ts (import path fix)"]
decisions:
  - "Used @/ path alias for imports in route handler for consistency and TypeScript resolution"
  - "204 DELETE response uses new Response(null, {status:204}) not NextResponse.json() per spec"
  - "quantity=null in PUT body passes through to DB; DB NOT NULL constraint enforces presence (spec-compliant)"
metrics:
  duration: "~2 minutes"
  completed: "2026-06-15T23:49:41Z"
  tasks_completed: 1
  files_created: 1
  files_modified: 1
---

# Phase cellarlite-full-implementation-next-js-1 Plan 03: Single Bottle REST API Summary

**One-liner:** GET/PUT/DELETE handlers for `/api/bottles/[id]` with full parameterised SQL, ID validation, and exact FRD error messages.

## What Was Built

Created `app/api/bottles/[id]/route.ts` — the Next.js App Router Route Handler implementing three endpoints:

| Endpoint | Success | Errors |
|----------|---------|--------|
| `GET /api/bottles/[id]` | 200 + Bottle object | 404 (invalid id or not in DB), 500 |
| `PUT /api/bottles/[id]` | 200 + updated Bottle (full column replacement) | 400 (bad JSON), 404 (invalid/missing id), 422 (validation), 500 |
| `DELETE /api/bottles/[id]` | 204 empty body | 404 (invalid/missing id), 500 |

### Key Implementation Details

- **`parseId` helper:** Rejects NaN, 0, and negative values — returns `null` → all three handlers return 404
- **Full replacement semantics (PUT):** Absent optional fields → stored as NULL in DB (per FRD §F05)
- **204 empty body:** Uses `new Response(null, { status: 204 })` — NOT `NextResponse.json()` to ensure empty body
- **All SQL parameterised:** `$1`…`$N` placeholders; zero string interpolation into queries
- **Exact FRD error messages:** `"Not found"`, `"Name is required"`, `"Quantity cannot be negative"`, `"Vintage must be a valid year"`, `"Invalid JSON"`, `"Internal server error"`
- **PUT allows quantity=0:** Finished bottle semantics; POST would require ≥ 1
- **No `'use client'` or `'use server'`:** Route Handlers are server-side by default in Next.js App Router

## Commits

| Task | Description | Commit |
|------|-------------|--------|
| Task 1 | Create app/api/bottles/[id]/route.ts + fix import paths | 315e478 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed relative import paths in app/api/bottles/route.ts**
- **Found during:** TypeScript compilation check (task verification step)
- **Issue:** `app/api/bottles/route.ts` used relative imports `'../../lib/db'` and `'../../types/bottle'` which resolved to incorrect paths and caused `TS2307` errors
- **Fix:** Changed imports to `@/lib/db` and `@/types/bottle` path aliases consistent with the new file
- **Files modified:** `app/api/bottles/route.ts`
- **Commit:** 315e478 (included in task 1 commit)

## Integration Contracts Satisfied

**Requires (from Plan 01):**
- ✅ `lib/db.ts` exports `default pool` (pg.Pool singleton)
- ✅ `scripts/migrate.mjs` creates `bottles` table idempotently

**Provides (for Wave 3):**
- ✅ `app/api/bottles/[id]/route.ts` exports `GET`, `PUT`, `DELETE` named async functions
- ✅ Contract shape: `GET → 200 Bottle | 404 | 500`, `PUT → 200 Bottle | 400 | 404 | 422 | 500`, `DELETE → 204 | 404 | 500`

## Self-Check: PASSED

```
app/api/bottles/[id]/route.ts — FOUND ✅
commit 315e478 — FOUND ✅
3 exports (GET, PUT, DELETE) — VERIFIED ✅
204 empty body (new Response(null)) — VERIFIED ✅
TypeScript compilation (npx tsc --noEmit) — CLEAN ✅
Wave 1 contracts (lib/db.ts, scripts/migrate.mjs) — VERIFIED ✅
```
