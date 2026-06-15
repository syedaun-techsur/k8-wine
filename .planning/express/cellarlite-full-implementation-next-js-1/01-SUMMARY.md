---
phase: cellarlite-full-implementation-next-js-1
plan: "01"
subsystem: foundation
tags: [database, migration, next.js, postgresql, scaffold]
dependency_graph:
  requires: []
  provides:
    - lib/db.ts (pg.Pool singleton)
    - scripts/migrate.mjs (idempotent bottles DDL migration)
    - package.json (npm scripts: migrate, dev, start, build)
    - next.config.mjs (X-Frame-Options SAMEORIGIN, ESM)
  affects:
    - all wave 2 API routes (consume lib/db.ts)
    - all wave 3 UI pages (depend on bottles table from migration)
    - K8s pod startup (consume npm start → npm run migrate)
tech_stack:
  added:
    - next@14.2.x
    - react@18.3.x
    - react-dom@18.3.x
    - pg@8.12.x
    - typescript@5.4.x
    - "@types/node, @types/react, @types/react-dom, @types/pg"
  patterns:
    - ESM-first migration script (.mjs, top-level await)
    - pg.Pool module-level singleton (avoids per-request connections)
    - Idempotent DDL with CREATE TABLE IF NOT EXISTS
    - npm script chaining (migrate && next dev/start)
key_files:
  created:
    - package.json
    - package-lock.json
    - tsconfig.json
    - next.config.mjs
    - scripts/migrate.mjs
    - lib/db.ts
  modified: []
decisions:
  - "X-Frame-Options set to SAMEORIGIN (not DENY) to allow iframe embedding in K8s sandbox preview"
  - "Migration uses pg.Client (connect/query/end lifecycle) not pg.Pool to ensure clean exit"
  - "lib/db.ts uses pg.Pool singleton at module level to share connections across API route invocations"
  - "DATABASE_URL is the sole connection source — no individual POSTGRES_* vars"
metrics:
  duration: "~3 minutes"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 0
  completed_date: "2026-06-15"
---

# Phase cellarlite-full-implementation-next-js-1 Plan 01: Project Scaffold & Database Foundation Summary

## One-liner

Next.js 14 project scaffold with idempotent PostgreSQL migration (CREATE TABLE IF NOT EXISTS bottles) and pg.Pool singleton, all wired via npm scripts that auto-migrate before server boot.

## What Was Built

Wave 1 foundation for CellarLite: a complete project scaffold that any subsequent wave (API, UI) can build directly on top of without any manual database setup.

### Task 1: Project Scaffold
- **`package.json`** — npm scripts: `migrate` (node scripts/migrate.mjs), `dev` (npm run migrate && next dev -p 3000), `start` (npm run migrate && next start -p 3000), `build` (next build)
- **`tsconfig.json`** — Next.js 14 App Router TypeScript config with bundler module resolution and path aliases
- **`next.config.mjs`** — ESM format with `X-Frame-Options: SAMEORIGIN` header (allows iframe embedding in K8s sandbox; DENY would break the preview)
- **`node_modules/`** — 43 packages installed (next, react, react-dom, pg + TypeScript types)

### Task 2: Database Foundation
- **`scripts/migrate.mjs`** — ESM module with idempotent `CREATE TABLE IF NOT EXISTS bottles` DDL. Implements F6 exactly: exits 1+stderr when DATABASE_URL unset, exits 1+stderr on connection/DDL failure, exits 0+"Migration complete." on success
- **`lib/db.ts`** — pg.Pool singleton exported as default; module-level initialization avoids per-request connection overhead

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `8a5ace0` | feat: project scaffold — package.json, tsconfig.json, next.config.mjs |
| Task 2 | `0d1a49c` | feat: database foundation — scripts/migrate.mjs and lib/db.ts |

## Verification Results

All success criteria verified:

| Check | Result |
|-------|--------|
| `package.json` scripts correct | ✅ SCRIPTS OK: true |
| `next.config.mjs` is .mjs (not .ts) | ✅ CONFIG IS .mjs OK |
| X-Frame-Options value is SAMEORIGIN | ✅ FRAME HEADER OK |
| DENY not used as header value | ✅ DENY only in comments |
| `export default` (ESM) | ✅ ESM OK |
| DDL has SERIAL, TEXT NOT NULL, INTEGER, TIMESTAMPTZ | ✅ All columns OK |
| `DATABASE_URL` unset → exit 1 + stderr | ✅ ENV GUARD OK |
| `lib/db.ts` exports default pool | ✅ DB SINGLETON OK |
| `lib/db.ts` uses DATABASE_URL | ✅ DATABASE_URL OK |
| Live migration (DATABASE_URL set) → exit 0 | ✅ Migration complete. |
| No hard-coded credentials | ✅ DATABASE_URL only |
| No Dockerfile/docker-compose.yml created | ✅ Not created |

## Contract Verification

```
grep -n 'export default pool' lib/db.ts → CONTRACT_OK
grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs → CONTRACT_OK
grep -n 'SAMEORIGIN' next.config.mjs → CONTRACT_OK
```

## Deviations from Plan

None — plan executed exactly as written.

The `DATABASE_URL` was already set in the environment (postgres://postgres:devpass@localhost:5432/app), so the migration ran successfully against the live database during Task 2 verification. The exit-1 guard was confirmed by running `env -u DATABASE_URL node scripts/migrate.mjs`.

## Self-Check

### Created files exist:
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `next.config.mjs`
- ✅ `scripts/migrate.mjs`
- ✅ `lib/db.ts`

### Commits exist:
- ✅ `8a5ace0` — Task 1 scaffold
- ✅ `0d1a49c` — Task 2 database

## Self-Check: PASSED
