---
phase: cellarlite-full-implementation-next-js-1
plan: "02"
subsystem: api-routes
tags: [api, health, bottles, typescript, next-js, rest]
dependency_graph:
  requires: ["01 (lib/db.ts Pool singleton, scripts/migrate.mjs bottles DDL)"]
  provides: ["app/api/health/route.ts (GET /api/health)", "app/api/bottles/route.ts (GET + POST /api/bottles)", "types/bottle.ts (shared interfaces)"]
  affects: ["03 (individual bottle routes consume types/bottle.ts and pool)", "04+ (frontend pages consume all three artifacts)"]
tech_stack:
  added: []
  patterns: ["Next.js Route Handlers (app/ dir)", "parameterised pg queries ($N placeholders)", "ILIKE search with 500-char cap", "server-side validation before DB touch"]
key_files:
  created:
    - types/bottle.ts
    - app/api/health/route.ts
    - app/api/bottles/route.ts
  modified: []
decisions:
  - "Import path for pool is ../../lib/db from app/api/bottles/ (two directory levels up)"
  - "POST quantity=0 returns 422 (>= 1 required); PUT allows 0 (in plan 03)"
  - "blank varietal/location strings stored as null via .trim() || null"
  - "q search param capped at 500 chars per FRD F04-REQ-08 before SQL"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-15T23:48:51Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 02: Health + Bottles Collection API Summary

**One-liner:** Health check endpoint (no DB) and bottles collection REST routes (GET list/ILIKE search, POST create with full validation) using pg Pool from plan 01.

---

## What Was Built

### Task 1: TypeScript Interfaces + Health Endpoint
- **`types/bottle.ts`** — Shared TypeScript interfaces for the entire API surface:
  - `Bottle` (7 fields: id, name, vintage, varietal, quantity, location, created_at)
  - `CreateBottleRequest` (POST body: name required, vintage/varietal/quantity/location optional)
  - `UpdateBottleRequest` (PUT body: same fields but quantity allows 0 for finished bottles)
  - `ApiError` (standard error response shape `{error: string}`)
  - `HealthResponse` (`{status: 'ok'}`)
- **`app/api/health/route.ts`** — GET /api/health handler:
  - Returns `200 {"status":"ok"}` immediately
  - Zero database calls — pure liveness probe for K8s

### Task 2: Bottles Collection Routes (GET + POST)
- **`app/api/bottles/route.ts`** — Two route handlers:
  - **GET /api/bottles** — Returns all bottles ordered by `created_at DESC`
  - **GET /api/bottles?q=term** — Parameterised ILIKE filter (`$1 = '%term%'`), q capped at 500 chars
  - **POST /api/bottles** — Full server-side validation before any SQL:
    - `400` for malformed JSON
    - `422` for blank/missing name, vintage out of [1800, currentYear+1], quantity < 1
    - `201` with RETURNING * Bottle object on success
    - `500` for unexpected DB errors

---

## File Paths Created

| File | Purpose |
|------|---------|
| `types/bottle.ts` | Shared TypeScript interfaces (Bottle, CreateBottleRequest, UpdateBottleRequest, ApiError, HealthResponse) |
| `app/api/health/route.ts` | GET /api/health → 200 {status:'ok'}, no DB |
| `app/api/bottles/route.ts` | GET /api/bottles (list + ILIKE search) + POST /api/bottles (create with validation) |

---

## Key Implementation Decisions

1. **Import paths:** Pool imported as `../../lib/db` from `app/api/bottles/` (two levels up to project root `lib/`); types imported as `../../types/bottle`

2. **POST quantity validation:** POST requires `quantity >= 1` (returns 422 for 0). PUT (plan 03) allows `quantity >= 0` to represent finished bottles — per FRD F02 note.

3. **Null handling for optional strings:** `varietal` and `location` blank strings are coerced to `null` via `(value?.trim() || null) ?? null` before INSERT — consistent with DB schema defaults.

4. **Search term capping:** `?q=` parameter trimmed and sliced to 500 chars before SQL — parameterised ILIKE, never string interpolation.

5. **Error shape consistency:** All error responses use `{ error: '<message>' }` with exact FRD F05 strings (`"Name is required"`, `"Quantity must be at least 1"`, `"Invalid JSON"`, `"Internal server error"`).

6. **No DB in health route:** `app/api/health/route.ts` has zero imports from `lib/db` — verified by absence of `pool|db|query` patterns.

---

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | f9a6819 | feat(cellarlite-full-implementation-next-js-1-02): add TypeScript interfaces and health endpoint |
| Task 2 | 77b44b6 | feat(cellarlite-full-implementation-next-js-1-02): implement bottles collection API routes |

---

## Deviations from Plan

**None** — plan executed exactly as written. All verification checks passed. Both route files created at exact paths specified. All validation error messages match FRD F05 exact strings.

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `types/bottle.ts` exists | ✅ FOUND |
| `app/api/health/route.ts` exists | ✅ FOUND |
| `app/api/bottles/route.ts` exists | ✅ FOUND |
| Commit f9a6819 exists | ✅ FOUND |
| Commit 77b44b6 exists | ✅ FOUND |

---

## Wave 3 Consumption

Wave 3 (frontend) can now consume:
- `GET /api/health` — K8s liveness probe (no dependencies, always available)
- `GET /api/bottles` — list page server-side data fetch (returns Bottle[])
- `GET /api/bottles?q=term` — search/filter UI (F04)
- `POST /api/bottles` — add-bottle form submission (F01)
- `types/bottle.ts` → `import type { Bottle, CreateBottleRequest } from '../../types/bottle'`
