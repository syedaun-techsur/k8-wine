---
phase: cellarlite-full-implementation-next-js-1
plan: "01"
subsystem: database-foundation
tags: [database, migration, postgresql, next.js, typescript, npm-scripts]
dependency_graph:
  requires: []
  provides:
    - lib/db.ts (pg.Pool singleton)
    - scripts/migrate.mjs (idempotent DDL runner)
    - package.json (npm scripts: migrate, dev, start, build)
    - next.config.mjs (iframe-safe X-Frame-Options: SAMEORIGIN)
    - tsconfig.json (Next.js 14 App Router TypeScript config)
  affects:
    - All wave 2 API routes (import lib/db.ts)
    - K8s pod startup (npm start runs migrate first)
    - Next.js runtime (next.config.mjs headers)
tech_stack:
  added:
    - next@^14.2.0
    - react@^18.3.0
    - react-dom@^18.3.0
    - pg@^8.12.0
    - typescript@^5.4.0
  patterns:
    - ESM migration script (scripts/migrate.mjs)
    - pg.Pool module-level singleton (lib/db.ts)
    - Idempotent DDL via CREATE TABLE IF NOT EXISTS
    - Pre-boot migration via npm scripts chaining
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.mjs
    - scripts/migrate.mjs
    - lib/db.ts
    - package-lock.json
  modified: []
decisions:
  - "Used pg.Pool singleton in lib/db.ts instead of per-request connections — avoids connection exhaustion in Next.js serverless environment"
  - "DATABASE_URL as sole connection source — no individual POSTGRES_* vars — simplifies K8s secret management"
  - "X-Frame-Options: SAMEORIGIN (not DENY) — app must render inside K8s sandbox iframe"
  - "next.config.mjs as .mjs (not .ts) — Next.js 14 cannot parse TypeScript config"
  - "Migration chained via npm scripts (npm run migrate && next dev) — ensures DB schema exists before server accepts requests"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-06-15"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 01: Project Scaffold and Database Foundation Summary

**One-liner:** Next.js 14 project scaffold with idempotent PostgreSQL migration via pg.Client ESM script, pg.Pool singleton, iframe-safe SAMEORIGIN headers, and pre-boot npm script chaining.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Project scaffold — package.json, tsconfig.json, next.config.mjs | `35fdaee` | package.json, tsconfig.json, next.config.mjs, package-lock.json |
| 2 | Database foundation — scripts/migrate.mjs and lib/db.ts | `a1a683c` | scripts/migrate.mjs, lib/db.ts |

## What Was Built

### Task 1: Project Scaffold

**`package.json`** — CellarLite project manifest with exact npm scripts:
- `migrate`: `node scripts/migrate.mjs` — runs the ESM DDL migration
- `dev`: `npm run migrate && next dev -p 3000` — ensures schema exists before dev server
- `start`: `npm run migrate && next start -p 3000` — ensures schema exists before production server
- `build`: `next build`

Dependencies: next@^14.2.0, react@^18.3.0, react-dom@^18.3.0, pg@^8.12.0 + TypeScript dev dependencies.

**`tsconfig.json`** — Next.js 14 App Router TypeScript configuration with strict mode, bundler module resolution, path alias `@/*`, and incremental compilation.

**`next.config.mjs`** — ESM Next.js configuration:
- `async headers()` returns `X-Frame-Options: SAMEORIGIN` for all routes
- Critical: SAMEORIGIN (not DENY) — allows iframe embedding from same origin for K8s sandbox preview
- ESM format (`.mjs`) — required for Next.js 14

### Task 2: Database Foundation

**`scripts/migrate.mjs`** — Idempotent ESM migration runner:
- Checks `DATABASE_URL` → exits 1 with stderr if absent
- Connects via `pg.Client` → exits 1 with stderr on connection failure
- Executes exact DDL: `CREATE TABLE IF NOT EXISTS bottles (id SERIAL PRIMARY KEY, name TEXT NOT NULL, vintage INTEGER, varietal TEXT, quantity INTEGER NOT NULL DEFAULT 1, location TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
- DDL failure → stderr `"ERROR: Migration failed: <message>"` + exit 1
- Success → stdout `"Migration complete."` + exit 0
- Idempotent: `CREATE TABLE IF NOT EXISTS` makes repeated runs safe

**`lib/db.ts`** — pg.Pool singleton:
- Module-level singleton: one pool per Node.js process, shared across all Next.js route handlers
- `connectionString: process.env.DATABASE_URL` — no hard-coded credentials
- `export default pool` — consumed by all wave 2 API routes

## Verification Results

All success criteria confirmed:

- ✅ `scripts/migrate.mjs` is valid ESM with exact DDL (all 7 columns verified)
- ✅ Missing `DATABASE_URL` → exit 1 + stderr error
- ✅ With live DB → exit 0 + "Migration complete."
- ✅ Running twice both succeed (idempotent)
- ✅ `lib/db.ts` exports default `pg.Pool` singleton using `DATABASE_URL`
- ✅ `package.json` scripts: migrate, dev, start, build — all correct
- ✅ `next.config.mjs` is `.mjs` format, sets `X-Frame-Options: SAMEORIGIN`
- ✅ No hard-coded credentials; `DATABASE_URL` is sole connection source
- ✅ No Docker files created

## Integration Contracts Provided

| Artifact | Export | Shape |
|----------|--------|-------|
| `lib/db.ts` | `default pool` | `new Pool({ connectionString: process.env.DATABASE_URL })` |
| `scripts/migrate.mjs` | idempotent migration (exits 0) | ESM, pg.Client, CREATE TABLE IF NOT EXISTS bottles |
| `package.json` | npm scripts | migrate, dev (with migrate prefix), start (with migrate prefix), build |
| `next.config.mjs` | `headers()` | X-Frame-Options: SAMEORIGIN for all routes |

## Deviations from Plan

None — plan executed exactly as written.

## Live Database Verification

A PostgreSQL database was available at `postgres://postgres:devpass@localhost:5432/app`. The migration ran successfully against the live database:
- First run: exit 0, "Migration complete."
- Second run: exit 0, "Migration complete." (idempotency confirmed)
- The `bottles` table was created with all 7 columns per the DDL specification.

## Self-Check: PASSED

All created files verified to exist:
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.mjs
- ✅ scripts/migrate.mjs
- ✅ lib/db.ts

All commits verified to exist:
- ✅ 35fdaee — Task 1: project scaffold
- ✅ a1a683c — Task 2: database foundation
