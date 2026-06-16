---
phase: cellarlite-full-implementation-next-js-1
plan: "02"
subsystem: api-routes
tags: [next-js, api-routes, typescript, postgresql, rest-api]
dependency_graph:
  requires: ["01 — lib/db.ts Pool singleton, scripts/migrate.mjs bottles DDL"]
  provides: ["app/api/health/route.ts — GET /api/health", "app/api/bottles/route.ts — GET+POST /api/bottles", "types/bottle.ts — shared TypeScript interfaces"]
  affects: ["03 — bottles/[id] route imports pool and types from this plan", "wave 3 frontend pages"]
tech_stack:
  added: []
  patterns: ["Next.js Route Handlers (app/api/)", "pg Pool parameterised queries", "NextResponse.json for all responses"]
key_files:
  created:
    - types/bottle.ts
    - app/api/health/route.ts
    - app/api/bottles/route.ts
  modified: []
decisions:
  - "Import paths use ../../lib/db and ../../types/bottle (two levels up from app/api/bottles/)"
  - "Health endpoint has zero DB imports — pure K8s liveness probe"
  - "POST quantity defaults to 1 when omitted; 0 is rejected (422) — PUT-only per FRD"
  - "ILIKE search term capped at 500 chars before SQL (FRD F04-REQ-08)"
  - "Blank varietal/location strings stored as null via .trim() || null pattern"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-16"
  tasks_completed: 2
  files_created: 3
---

# Phase cellarlite-full-implementation-next-js-1 Plan 02: Health Check + Bottles Collection API Summary

## One-Liner

Health-check endpoint (no DB) and bottles collection REST API (GET list+ILIKE search, POST create with full validation) using Next.js Route Handlers and parameterised pg queries.

## What Was Built

### Task 1 — TypeScript interfaces + health endpoint

**`types/bottle.ts`** — Shared TypeScript interfaces consumed by all route handlers and pages:
- `Bottle` — 7-field record interface (id, name, vintage, varietal, quantity, location, created_at)
- `CreateBottleRequest` — POST body with name required and optional fields
- `UpdateBottleRequest` — PUT body (quantity allows 0 for finished bottles)
- `ApiError` — standard `{error: string}` error response shape
- `HealthResponse` — `{status: 'ok'}` typed response

**`app/api/health/route.ts`** — K8s liveness probe:
- Exports `GET` returning `200 {"status":"ok"}` immediately
- Zero database imports — safe for health-check polling

### Task 2 — Bottles collection route

**`app/api/bottles/route.ts`** — Full collection API:

`GET /api/bottles`:
- Returns all bottles ordered by `created_at DESC`
- Optional `?q=` performs parameterised `ILIKE '%term%'` filter on name
- Search term trimmed and capped at 500 chars before SQL

`POST /api/bottles`:
- Validates name (required, non-empty, ≤255 chars) → 422 if invalid
- Validates vintage (optional, integer in [1800, currentYear+1]) → 422 if invalid
- Validates varietal (optional, ≤255 chars) → 422 if invalid
- Validates quantity (optional, integer ≥1, defaults to 1) → 422 if 0 or negative
- Validates location (optional, ≤500 chars) → 422 if invalid
- Guards malformed JSON body → 400 `{"error":"Invalid JSON"}`
- Inserts with `RETURNING *` → returns 201 with full Bottle object
- Blank varietal/location strings stored as `null`

## File Paths Created

| File | Purpose |
|------|---------|
| `types/bottle.ts` | Shared TypeScript interfaces for all API routes and pages |
| `app/api/health/route.ts` | GET /api/health — K8s liveness probe, no DB |
| `app/api/bottles/route.ts` | GET /api/bottles (list+search) + POST /api/bottles (create) |

## Key Implementation Decisions

1. **Import paths** — `app/api/bottles/route.ts` is two directories deep from project root, so pool and types are imported via `../../lib/db` and `../../types/bottle` respectively.

2. **Health endpoint isolation** — No DB import in `app/api/health/route.ts` ensures the liveness probe can succeed even when the database is unreachable (startup, migration, outage).

3. **POST quantity minimum = 1** — The plan spec explicitly notes that `quantity=0` on POST returns 422. Only PUT allows 0 (finished bottle tracking). `undefined` quantity defaults to 1 via `?? 1`.

4. **ILIKE safety** — Search `q` parameter is parameterised as `$1` with `%${q}%`. No string interpolation in SQL. The term is also trimmed and sliced to 500 chars before the query (FRD F04-REQ-08).

5. **Null coalescing for optional string fields** — `(varietal?.trim() || null) ?? null` pattern ensures blank strings are stored as `null` rather than empty strings.

6. **All SQL uses `$N` placeholders** — No template literals in any SQL string throughout the file.

## Wave Integration

This plan provides the wave 2 API surface consumed by:
- **Wave 3 frontend** — bottle list page (GET /api/bottles), search/filter (GET ?q=), add-bottle form (POST /api/bottles)
- **Wave 3 single-bottle page** — types/bottle.ts Bottle interface
- **K8s/deployment** — GET /api/health liveness probe

## Deviations from Plan

None — plan executed exactly as written. All error messages match FRD F05 exact strings.

## Self-Check

### Files Created

- [x] `types/bottle.ts` — FOUND
- [x] `app/api/health/route.ts` — FOUND
- [x] `app/api/bottles/route.ts` — FOUND

### Commits

- [x] `7caf456` — feat(cellarlite-full-implementation-next-js-1-02): TypeScript interfaces + health endpoint
- [x] `0192600` — feat(cellarlite-full-implementation-next-js-1-02): bottles collection route GET+POST

## Self-Check: PASSED
