---
phase: cellarlite-full-implementation-next-js-1
plan: "02"
subsystem: api-routes
tags: [next-js, api-routes, typescript, postgresql, health-check, bottles]
dependency_graph:
  requires:
    - "01: lib/db.ts (pg.Pool singleton)"
    - "01: scripts/migrate.mjs (bottles table DDL)"
  provides:
    - "app/api/health/route.ts (GET /api/health)"
    - "app/api/bottles/route.ts (GET /api/bottles, POST /api/bottles)"
    - "types/bottle.ts (Bottle, CreateBottleRequest, UpdateBottleRequest, ApiError, HealthResponse)"
  affects:
    - "Wave 3 frontend pages (consume GET /api/bottles, POST /api/bottles)"
    - "K8s liveness probe (consumes GET /api/health)"
tech_stack:
  added: []
  patterns:
    - "Next.js App Router route handlers (app/api/**/route.ts)"
    - "Parameterised SQL via pg.Pool"
    - "422 validation pattern before DB touch"
key_files:
  created:
    - "types/bottle.ts"
    - "app/api/health/route.ts"
    - "app/api/bottles/route.ts"
  modified: []
decisions:
  - "Import path for pool is ../../lib/db (two levels up from app/api/bottles/)"
  - "quantity defaults to 1 on POST; POST rejects quantity=0 (422); PUT allows quantity=0"
  - "varietal and location blank strings normalized to null via .trim() || null"
  - "search term q capped at 500 chars before ILIKE query per FRD F04-REQ-08"
  - "Single quotes used throughout (TypeScript convention); validation message grep uses single quotes"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 3
---

# Phase cellarlite-full-implementation-next-js-1 Plan 02: Health Check + Bottles Collection API Summary

## One-liner

GET /api/health (no-DB liveness probe) and GET+POST /api/bottles (ILIKE search, full validation, parameterised SQL) with shared TypeScript interfaces.

## What Was Built

### 1. `types/bottle.ts`
Shared TypeScript interfaces consumed by all route handlers and pages:
- `Bottle` — 7 fields matching TechArch schema: `id`, `name`, `vintage`, `varietal`, `quantity`, `location`, `created_at`
- `CreateBottleRequest` — POST body with required `name` and optional fields
- `UpdateBottleRequest` — PUT body (quantity allows 0 for finished bottles)
- `ApiError` — standard `{ error: string }` shape for all error responses
- `HealthResponse` — `{ status: 'ok' }` shape

### 2. `app/api/health/route.ts`
- `GET /api/health` → `200 { "status": "ok" }`
- No database call — pure liveness probe for K8s
- Single import: `NextResponse` from `next/server`

### 3. `app/api/bottles/route.ts`
**GET /api/bottles:**
- Returns all bottles ordered by `created_at DESC`
- Optional `?q=` parameter runs parameterised `ILIKE '%term%'` name filter
- `q` capped at 500 characters before query (FRD F04-REQ-08)
- Returns `200` with `Bottle[]`

**POST /api/bottles:**
- Parses JSON body; malformed JSON → `400 { "error": "Invalid JSON" }`
- Validates `name`: required, non-empty after trim, max 255 chars → `422 { "error": "Name is required" }`
- Validates `vintage`: if provided, integer in [1800, currentYear+1] → `422`
- Validates `varietal`: if provided, string max 255 chars → `422`
- Validates `quantity`: defaults to 1; must be integer >= 1 → `422 { "error": "Quantity must be at least 1" }`
- Validates `location`: if provided, string max 500 chars → `422`
- Inserts via parameterised SQL `INSERT INTO bottles (...) VALUES ($1,$2,$3,$4,$5) RETURNING *`
- Returns `201` with created `Bottle` object
- DB failure → `500 { "error": "Internal server error" }`

## File Paths Created

| File | Purpose |
|------|---------|
| `types/bottle.ts` | Shared TypeScript interfaces |
| `app/api/health/route.ts` | K8s liveness probe endpoint |
| `app/api/bottles/route.ts` | Bottles collection CRUD (GET list/search + POST create) |

## Key Implementation Decisions

1. **Import paths**: `../../lib/db` and `../../types/bottle` from `app/api/bottles/` — two directory levels up
2. **POST quantity rule**: defaults to 1; rejects 0 with 422 (PUT allows 0 for finished bottles — that's plan 03)
3. **Null normalization**: `varietal` and `location` empty strings stored as `null` via `(value?.trim() || null) ?? null`
4. **Search safety**: `q` parameter trimmed and capped at 500 chars before ILIKE; always parameterised as `$1`
5. **No string interpolation in SQL**: all SQL uses `$N` placeholders throughout

## Integration Contracts Verified

| Contract | Status |
|----------|--------|
| `lib/db.ts` exports `default pool` (wave 1) | ✅ CONTRACT_OK |
| `scripts/migrate.mjs` has `CREATE TABLE IF NOT EXISTS bottles` (wave 1) | ✅ CONTRACT_OK |
| `app/api/health/route.ts` exports `GET` | ✅ |
| `app/api/bottles/route.ts` exports `GET` and `POST` | ✅ |
| `types/bottle.ts` exports all required interfaces | ✅ |
| Health endpoint has no DB import | ✅ |
| No Dockerfile or docker-compose artifacts | ✅ |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `eb8c9b8` | feat: add TypeScript interfaces and health endpoint |
| Task 2 | `b010b83` | feat: add bottles collection API route |

## Deviations from Plan

None — plan executed exactly as written. All file contents match the TechArch spec verbatim.

## Wave 3 Consumption

Wave 3 (frontend) can now consume:
- `GET /api/health` — K8s liveness probe (no dependencies)
- `GET /api/bottles` — list page server-side data fetch
- `GET /api/bottles?q=term` — search/filter (F04)
- `POST /api/bottles` — add-bottle form submission (F01)
- `types/bottle.ts` — shared `Bottle` interface for pages and components

## Self-Check: PASSED

- [x] `types/bottle.ts` exists and exports all 5 interfaces
- [x] `app/api/health/route.ts` exists with GET export, no DB import
- [x] `app/api/bottles/route.ts` exists with GET and POST exports
- [x] Commit `eb8c9b8` exists (Task 1)
- [x] Commit `b010b83` exists (Task 2)
