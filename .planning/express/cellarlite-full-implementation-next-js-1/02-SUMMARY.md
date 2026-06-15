---
phase: cellarlite-full-implementation-next-js-1
plan: "02"
subsystem: api-layer
tags: [api, typescript, next-js, health-check, bottles, rest, postgresql]
dependency_graph:
  requires:
    - lib/db.ts (pg.Pool singleton — from plan 01)
    - scripts/migrate.mjs (bottles DDL — from plan 01)
  provides:
    - app/api/health/route.ts (GET /api/health — K8s liveness probe)
    - app/api/bottles/route.ts (GET /api/bottles list+search, POST /api/bottles create)
    - types/bottle.ts (shared TypeScript interfaces)
  affects:
    - Wave 3 frontend (consumes all three routes and Bottle interface)
    - Plan 03 (single-bottle routes reuse same types/bottle.ts interfaces)
tech_stack:
  added: []
  patterns:
    - Next.js App Router route handlers (export async function GET/POST)
    - pg.Pool parameterised queries with $N placeholders
    - Server-side validation before any SQL execution
    - ILIKE search with 500-char cap (FRD F04-REQ-08)
key_files:
  created:
    - types/bottle.ts
    - app/api/health/route.ts
    - app/api/bottles/route.ts
  modified: []
decisions:
  - "Import paths use ../../lib/db and ../../types/bottle from app/api/bottles/ (two levels up)"
  - "POST quantity validation uses >= 1 (not >= 0; zero is PUT-only per FRD F02)"
  - "Blank varietal/location strings coerced to null via .trim() || null before INSERT"
  - "ILIKE search uses parameterised $1 placeholder — never template literal interpolation"
  - "TypeScript single-quote string literals produce identical JSON output to double-quote"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-15T19:14:27Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 02: Health + Bottles Collection API Summary

**One-liner:** Health check endpoint and bottles collection API (GET list+ILIKE search, POST create) with full server-side validation using parameterised pg queries.

## What Was Built

### Task 1: TypeScript interfaces + health endpoint

**`types/bottle.ts`** — Shared TypeScript interfaces consumed by all route handlers and pages:
- `Bottle` — 7-field record (id, name, vintage, varietal, quantity, location, created_at)
- `CreateBottleRequest` — POST body shape (name required, optional vintage/varietal/quantity/location)
- `UpdateBottleRequest` — PUT body shape (same fields; quantity >= 0 allowed)
- `ApiError` — Standard `{ error: string }` shape for all error responses
- `HealthResponse` — `{ status: 'ok' }` shape

**`app/api/health/route.ts`** — K8s liveness probe:
- `GET /api/health` → `200 { "status": "ok" }` immediately
- Zero database calls — safe for liveness probe at high frequency

**Commit:** `d111743`

### Task 2: Bottles collection route — GET (list+search) + POST (create)

**`app/api/bottles/route.ts`** — Two route handlers:

**GET /api/bottles:**
- Returns all bottles ordered `created_at DESC` (newest-first)
- Optional `?q=term` parameter applies `WHERE name ILIKE $1` with `'%term%'` (parameterised, capped at 500 chars per FRD F04-REQ-08)
- Returns `200 Bottle[]` on success; `500 { error: 'Internal server error' }` on DB failure

**POST /api/bottles:**
- Full server-side validation before any SQL:
  - Malformed JSON → `400 { error: 'Invalid JSON' }`
  - Missing/blank name → `422 { error: 'Name is required' }`
  - Name > 255 chars → `422 { error: 'Name must be 255 characters or fewer' }`
  - Vintage out of [1800, currentYear+1] → `422 { error: 'Vintage must be between 1800 and <year>' }`
  - Non-integer vintage → `422 { error: 'Vintage must be a valid year' }`
  - Varietal > 255 chars → `422 { error: 'Varietal must be 255 characters or fewer' }`
  - Quantity < 1 → `422 { error: 'Quantity must be at least 1' }`
  - Non-integer quantity → `422 { error: 'Quantity must be a whole number' }`
  - Location > 500 chars → `422 { error: 'Location must be 500 characters or fewer' }`
- INSERT with parameterised `$1–$5` placeholders + `RETURNING *`
- Returns `201 Bottle` on success; `500` on DB failure
- `quantity` defaults to `1` when omitted
- Blank `varietal`/`location` strings coerced to `null` via `.trim() || null`

**Commit:** `ef53bf0`

## Key Implementation Decisions

1. **Import paths:** From `app/api/bottles/`, two levels up to project root — `../../lib/db` and `../../types/bottle`. This follows Next.js App Router conventions.

2. **POST quantity constraint `>= 1` (not `>= 0`):** POST creates new bottles that must exist in inventory. Zero is only meaningful for PUT (marking a bottle as finished). Per FRD F02 note.

3. **Null coercion for optional strings:** `(varietal?.trim() || null) ?? null` — blank strings become `null` in DB rather than empty string. Consistent with FRD field semantics.

4. **Parameterised ILIKE:** `WHERE name ILIKE $1` with `['%' + q + '%']` — never template literal interpolation. Satisfies FRD security requirement.

5. **500-char search cap:** `rawQ.trim().slice(0, 500)` prevents excessively long ILIKE patterns (FRD F04-REQ-08).

6. **Single-quote string literals:** TypeScript code uses single-quote style for error strings (e.g., `'Name is required'`). These compile to identical JSON output as double-quoted — no functional difference.

## Contract Verification

| Contract | Status |
|----------|--------|
| `lib/db.ts` exports `pool` (from plan 01) | ✅ FOUND |
| `scripts/migrate.mjs` creates `bottles` table (from plan 01) | ✅ FOUND |
| `app/api/health/route.ts` exports `GET` | ✅ FOUND |
| `app/api/bottles/route.ts` exports `GET` | ✅ FOUND |
| `app/api/bottles/route.ts` exports `POST` | ✅ FOUND |
| `types/bottle.ts` exports `Bottle` interface | ✅ FOUND |
| `types/bottle.ts` exports `CreateBottleRequest` | ✅ FOUND |
| Health route has no DB import | ✅ CONFIRMED |
| Bottles route imports pool from `../../lib/db` | ✅ CONFIRMED |
| All SQL uses parameterised `$N` placeholders | ✅ CONFIRMED |
| No Dockerfile or docker-compose created | ✅ CONFIRMED |

## Deviations from Plan

None — plan executed exactly as written. All interfaces, SQL patterns, error messages, and validation rules implemented verbatim from TechArch §2/§3/§4 and FRD F04/F05.

## Self-Check: PASSED

All three files exist on disk:
- `FOUND: types/bottle.ts`
- `FOUND: app/api/health/route.ts`
- `FOUND: app/api/bottles/route.ts`

Both commits verified in git log:
- `d111743` — Task 1: TypeScript interfaces + health endpoint
- `ef53bf0` — Task 2: bottles collection route GET+POST

## What Wave 3 Can Now Consume

- `GET /api/health` — K8s liveness probe (no dependencies)
- `GET /api/bottles` — List page server-side data fetch returning `Bottle[]`
- `GET /api/bottles?q=term` — Search/filter (F04) with parameterised ILIKE
- `POST /api/bottles` — Add-bottle form submission (F01) returning created `Bottle`
- `types/bottle.ts` — Shared `Bottle` interface for pages and components
