---
phase: cellarlite-full-implementation-next-js-1
plan: "02"
subsystem: api-routes
tags: [next-js, api, postgresql, typescript, rest]
dependency_graph:
  requires: [lib/db.ts (Pool singleton), scripts/migrate.mjs (bottles table DDL)]
  provides: [app/api/health/route.ts, app/api/bottles/route.ts, types/bottle.ts]
  affects: [wave-3-frontend (consumes GET/POST /api/bottles and types)]
tech_stack:
  added: []
  patterns: [Next.js App Router route handlers, parameterised SQL via pg Pool, 422/400/500 error shapes]
key_files:
  created:
    - types/bottle.ts
    - app/api/health/route.ts
    - app/api/bottles/route.ts
  modified: []
decisions:
  - Import path for pool is ../../lib/db (two levels up from app/api/bottles/)
  - varietal and location blank strings coerced to null via .trim() || null before INSERT
  - POST quantity validation enforces >=1 (PUT allows 0 — finished bottle); default is 1
  - ILIKE search term capped at 500 chars before parameterised query (FRD F04-REQ-08)
metrics:
  duration: "~10 minutes"
  completed: "2026-06-15T22:49:18Z"
  tasks_completed: 2
  files_created: 3
---

# Phase cellarlite-full-implementation-next-js-1 Plan 02: Health Endpoint and Bottles Collection API Summary

**One-liner:** Health endpoint (no DB), bottles GET/POST endpoints with parameterised ILIKE search and full server-side validation, plus shared TypeScript interfaces.

---

## What Was Built

### Task 1: TypeScript interfaces + health endpoint

**`types/bottle.ts`** — Shared TypeScript interfaces consumed by all route handlers and Next.js pages:
- `Bottle` — 7-field record shape (id, name, vintage, varietal, quantity, location, created_at)
- `CreateBottleRequest` — POST body (name required, vintage/varietal/quantity/location optional)
- `UpdateBottleRequest` — PUT body (same fields, quantity allows 0 for finished bottles)
- `ApiError` — standard error envelope `{ error: string }`
- `HealthResponse` — `{ status: 'ok' }`

**`app/api/health/route.ts`** — K8s liveness probe endpoint:
- Exports `GET` returning `200 {"status":"ok"}` immediately
- Zero database calls — safe to hit before DB is ready

### Task 2: Bottles collection route — GET (list+search) and POST (create)

**`app/api/bottles/route.ts`** — Two route handlers:

**GET /api/bottles:**
- Returns all bottle rows ordered by `created_at DESC`
- Optional `?q=` parameter: runs `WHERE name ILIKE $1` with `%term%` wrapping (fully parameterised)
- Search term capped at 500 chars before query (FRD F04-REQ-08)
- 500 on DB error

**POST /api/bottles:**
- JSON parse guard → 400 `{"error":"Invalid JSON"}` on malformed body
- Server-side validation (in order):
  - `name` — required, non-empty after trim, max 255 chars → 422 `{"error":"Name is required"}`
  - `vintage` — optional; if provided must be integer in [1800, currentYear+1] → 422
  - `varietal` — optional; max 255 chars → 422
  - `quantity` — optional integer ≥ 1; defaults to 1 → 422 `{"error":"Quantity must be at least 1"}`
  - `location` — optional; max 500 chars → 422
- INSERT via parameterised SQL `($1, $2, $3, $4, $5) RETURNING *`
- Returns `201` with created `Bottle` object on success
- 500 on DB failure

---

## File Paths Created

| File | Purpose |
|------|---------|
| `types/bottle.ts` | Shared TypeScript interfaces (Bottle, CreateBottleRequest, UpdateBottleRequest, ApiError, HealthResponse) |
| `app/api/health/route.ts` | GET /api/health — K8s liveness probe, no DB |
| `app/api/bottles/route.ts` | GET /api/bottles (list+ILIKE search) + POST /api/bottles (create) |

---

## Key Implementation Decisions

1. **Import paths** — Pool imported as `../../lib/db`, types as `../../types/bottle` (two directory levels up from `app/api/bottles/`)
2. **Null coercion** — `varietal` and `location` blank strings coerced to `null` via `(val?.trim() || null) ?? null` before INSERT, so empty strings are never stored
3. **POST quantity** — Enforces `>= 1`; `0` is a valid PUT-only value (finished bottles). POST defaults to `1` if omitted
4. **Parameterised SQL** — All queries use `$N` placeholders; no template literals in SQL strings (FRD security requirement)
5. **ILIKE cap** — Search term sliced to 500 chars before being wrapped in `%…%` and passed to parameterised query

---

## Integration Contracts

### Consumed from Plan 01
- `lib/db.ts` — `export default pool` (pg.Pool singleton)
- `scripts/migrate.mjs` — `CREATE TABLE IF NOT EXISTS bottles` DDL

### Provided to Wave 3 (Frontend)
- `GET /api/health` → `200 { "status": "ok" }` (no dependencies)
- `GET /api/bottles` → `200 Bottle[]` (newest-first)
- `GET /api/bottles?q=term` → `200 Bottle[]` (ILIKE filtered)
- `POST /api/bottles` → `201 Bottle | 400 | 422 | 500`
- `types/bottle.ts` → `Bottle`, `CreateBottleRequest`, `UpdateBottleRequest`, `ApiError`, `HealthResponse`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `164e664` | TypeScript interfaces and health endpoint |
| Task 2 | `515f0eb` | Bottles collection API endpoints |

---

## Self-Check: PASSED

- `types/bottle.ts` — FOUND ✓
- `app/api/health/route.ts` — FOUND ✓
- `app/api/bottles/route.ts` — FOUND ✓
- Commit `164e664` — FOUND ✓
- Commit `515f0eb` — FOUND ✓
