---
phase: cellarlite-full-implementation-next-js-1
plan: "01"
subsystem: foundation
tags: [database, migration, nextjs, typescript, postgresql]
dependency_graph:
  requires: []
  provides: [lib/db.ts, scripts/migrate.mjs, package.json, next.config.mjs, tsconfig.json]
  affects: [all wave 2 API routes, all wave 3 UI pages]
tech_stack:
  added: [next@14.2.x, react@18.3.x, react-dom@18.3.x, pg@8.12.x, typescript@5.4.x]
  patterns: [ESM migration script, pg.Pool singleton, idempotent DDL, npm script chaining]
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.mjs
    - scripts/migrate.mjs
    - lib/db.ts
  modified: []
decisions:
  - "X-Frame-Options set to SAMEORIGIN (not DENY) to allow iframe embedding in K8s sandbox"
  - "Migration script uses pg.Client (not Pool) for single-shot migration; Pool used only in lib/db.ts for app runtime"
  - "scripts/migrate.mjs is ESM (.mjs) to avoid TypeScript compilation dependency at migration time"
  - "DATABASE_URL is sole connection source — no POSTGRES_* vars in application code"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-15"
  tasks_completed: 2
  files_created: 5
---

# Phase cellarlite-full-implementation-next-js-1 Plan 01: Project Scaffold & Database Foundation Summary

**One-liner:** Next.js 14 project scaffold with idempotent pg.Client migration script and pg.Pool singleton, wired via npm script chaining so DB auto-migrates on every `dev`/`start`.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Project scaffold — package.json, tsconfig.json, next.config.mjs | `46bbef1` | package.json, tsconfig.json, next.config.mjs, package-lock.json |
| 2 | Database foundation — scripts/migrate.mjs and lib/db.ts | `5ba1f58` | scripts/migrate.mjs, lib/db.ts |

## What Was Built

### Task 1: Project Scaffold
- **`package.json`**: Defines `migrate`, `dev`, `start`, `build` npm scripts. `dev` and `start` both chain `npm run migrate &&` before Next.js so the DB is always ready before the server accepts requests.
- **`tsconfig.json`**: Next.js 14 App Router TypeScript configuration with strict mode, ESNext modules, bundler resolution.
- **`next.config.mjs`**: ESM config setting `X-Frame-Options: SAMEORIGIN` (critically NOT DENY) to allow iframe embedding in the Pivota K8s sandbox preview.
- **`npm install`**: Installed next@14.2.x, react@18.3.x, react-dom@18.3.x, pg@8.12.x and TypeScript dev deps.

### Task 2: Database Foundation
- **`scripts/migrate.mjs`**: ESM migration script that:
  - Guards on `DATABASE_URL` presence — exits 1 with stderr error if missing
  - Connects via `pg.Client` and runs `CREATE TABLE IF NOT EXISTS bottles (...)` with exact DDL from TechArch §3
  - Exits 0 printing `"Migration complete."` on success; idempotent via `IF NOT EXISTS`
  - Verified: ran successfully against live PostgreSQL; ran twice both exit 0
- **`lib/db.ts`**: `pg.Pool` singleton exported as default, initialized from `process.env.DATABASE_URL`. Module-level singleton avoids per-request connection overhead.

## Verification Results

| Check | Result |
|-------|--------|
| `next.config.mjs` is `.mjs` format | ✅ PASS |
| No `next.config.ts` present | ✅ PASS |
| npm scripts correct (migrate/dev/start/build) | ✅ PASS |
| `X-Frame-Options: SAMEORIGIN` in next.config.mjs | ✅ PASS |
| `DENY` not used as header value | ✅ PASS |
| DATABASE_URL guard: exits 1 when unset | ✅ PASS |
| `lib/db.ts` exports default pool | ✅ PASS |
| DDL contains all required columns (SERIAL, TEXT NOT NULL, INTEGER, TIMESTAMPTZ) | ✅ PASS |
| Migration ran successfully against live PostgreSQL | ✅ PASS |
| Migration idempotent (ran twice, both exit 0) | ✅ PASS |

## Integration Contracts Fulfilled

| Contract | Verified |
|----------|---------|
| `lib/db.ts` exports `default pool` (pg.Pool via DATABASE_URL) | ✅ `grep -n 'export default pool' lib/db.ts` |
| `scripts/migrate.mjs` contains `CREATE TABLE IF NOT EXISTS bottles` | ✅ `grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs` |
| `package.json` scripts: migrate=`node scripts/migrate.mjs`, dev/start include `npm run migrate && next` | ✅ Node.js script check passes |
| `next.config.mjs` contains `SAMEORIGIN` | ✅ `grep -n 'SAMEORIGIN' next.config.mjs` |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `package.json` exists: ✅
- `tsconfig.json` exists: ✅  
- `next.config.mjs` exists: ✅
- `scripts/migrate.mjs` exists: ✅
- `lib/db.ts` exists: ✅
- Commit `46bbef1` exists: ✅
- Commit `5ba1f58` exists: ✅
