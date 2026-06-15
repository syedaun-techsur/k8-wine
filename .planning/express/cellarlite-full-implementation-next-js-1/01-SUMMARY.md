---
phase: cellarlite-full-implementation-next-js-1
plan: "01"
subsystem: database-foundation
tags: [database, migration, pg, next.js, typescript, scaffold]
dependency_graph:
  requires: []
  provides:
    - lib/db.ts (pg.Pool singleton)
    - scripts/migrate.mjs (idempotent DDL runner)
    - package.json (npm scripts: migrate/dev/start/build)
    - next.config.mjs (iframe-safe headers, ESM)
  affects:
    - All wave 2 API routes (import lib/db.ts)
    - All wave 3 pages (depend on bottles table existing)
    - K8s pod startup (npm run start → npm run migrate && next start -p 3000)
tech_stack:
  added:
    - next@^14.2.0
    - react@^18.3.0
    - react-dom@^18.3.0
    - pg@^8.12.0
    - typescript@^5.4.0
    - "@types/node, @types/react, @types/react-dom, @types/pg"
  patterns:
    - ESM migration script (scripts/migrate.mjs — .mjs, no ts-node)
    - pg.Pool singleton module (lib/db.ts)
    - Next.js 14 App Router tsconfig
    - next.config.mjs ESM format with async headers()
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
  - "X-Frame-Options: SAMEORIGIN (not DENY) — app renders inside K8s sandbox iframe"
  - "scripts/migrate.mjs is .mjs ESM (not .ts) — no ts-node dependency needed"
  - "pg.Pool singleton in lib/db.ts — avoids new connection per HTTP request"
  - "DATABASE_URL is sole connection source — no individual POSTGRES_* vars"
  - "migrate script auto-runs in dev/start — no manual DB setup required"
metrics:
  duration: "~3 minutes"
  completed: "2026-06-15T22:45:50Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 0
---

# Phase cellarlite-full-implementation-next-js-1 Plan 01: Project Scaffold & Database Foundation Summary

**One-liner:** Bootstrapped CellarLite with Next.js 14 ESM config, idempotent pg.Client DDL runner, and pg.Pool singleton — the complete wave-1 foundation for all API and UI layers.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Project scaffold — package.json, tsconfig.json, next.config.mjs | `6600447` | package.json, tsconfig.json, next.config.mjs, package-lock.json |
| 2 | Database foundation — scripts/migrate.mjs and lib/db.ts | `45eca45` | scripts/migrate.mjs, lib/db.ts |

## What Was Built

### Task 1: Project Scaffold

- **`package.json`** — npm scripts wired correctly:
  - `migrate`: `node scripts/migrate.mjs`
  - `dev`: `npm run migrate && next dev -p 3000`
  - `start`: `npm run migrate && next start -p 3000`
  - `build`: `next build`
  - Dependencies: next ^14.2.0, react ^18.3.0, react-dom ^18.3.0, pg ^8.12.0

- **`tsconfig.json`** — Next.js 14 App Router compatible TypeScript config with strict mode, bundler moduleResolution, JSX preserve, and `@/*` path alias.

- **`next.config.mjs`** — ESM format with `async headers()` returning `X-Frame-Options: SAMEORIGIN` for all routes. Critical: SAMEORIGIN (not DENY) so the app renders inside K8s sandbox iframes.

### Task 2: Database Foundation

- **`scripts/migrate.mjs`** — ESM migration script (no TypeScript, no ts-node):
  - Checks `DATABASE_URL`; if absent → stderr error + exit(1)
  - Connects via `pg.Client`; connection failure → stderr + exit(1)
  - Executes exact DDL: `CREATE TABLE IF NOT EXISTS bottles` with all 7 columns
  - DDL failure → `ERROR: Migration failed: <message>` + exit(1)
  - Success → `Migration complete.` + exit(0)
  - **Idempotent**: running twice both exit 0 (verified against live Postgres)

- **`lib/db.ts`** — `pg.Pool` singleton:
  ```typescript
  import { Pool } from 'pg';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export default pool;
  ```
  Module-level singleton avoids opening new connections per HTTP request.

## Verification Results

All success criteria verified:

| Check | Result |
|-------|--------|
| `scripts/migrate.mjs` exists with exact DDL | ✅ PASS |
| `migrate.mjs` exits 1 when DATABASE_URL unset | ✅ PASS |
| `migrate.mjs` exits 0 and prints "Migration complete." | ✅ PASS |
| Idempotency: runs twice both exit 0 | ✅ PASS (live DB confirmed) |
| `lib/db.ts` exports default pg.Pool singleton | ✅ PASS |
| `package.json` scripts: migrate/dev/start/build correct | ✅ PASS |
| `next.config.mjs` is .mjs ESM with SAMEORIGIN | ✅ PASS |
| No .ts config file (next.config.ts absent) | ✅ PASS |
| No hard-coded credentials | ✅ PASS |
| No Dockerfile/docker-compose | ✅ PASS |

## Decisions Made

1. **`X-Frame-Options: SAMEORIGIN`** — Not DENY. Required because the CellarLite app renders inside a K8s sandbox iframe from the same origin. DENY would block all iframe embedding.

2. **`scripts/migrate.mjs` is `.mjs`** — Pure ESM, no TypeScript, no ts-node dependency. Keeps migration dependency-free; runs with only the `pg` package.

3. **`pg.Pool` in `lib/db.ts`** — Module-level singleton avoids opening a new connection per HTTP request. Pool handles connection lifecycle, idle timeouts, and reconnection.

4. **`DATABASE_URL` as sole connection source** — No individual `POSTGRES_HOST/USER/PASSWORD` env vars. Single connection string simplifies K8s Secret management.

5. **Auto-migrate on dev/start** — `npm run dev` and `npm run start` both run `npm run migrate &&` first. No manual DB setup ever required.

## Deviations from Plan

None — plan executed exactly as written.

The `DATABASE_URL` was pre-set in the Daytona workspace environment (`postgres://postgres:devpass@localhost:5432/app`), which allowed live idempotency verification beyond the plan's minimum requirements.

## Self-Check

### Files exist:
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.mjs
- ✅ scripts/migrate.mjs
- ✅ lib/db.ts

### Commits exist:
- ✅ 6600447 — chore: project scaffold
- ✅ 45eca45 — feat: database foundation

## Self-Check: PASSED

## Integration Contracts Satisfied

| Artifact | Contract | Status |
|----------|----------|--------|
| `lib/db.ts` | Exports `default pool` (pg.Pool via DATABASE_URL) | ✅ |
| `scripts/migrate.mjs` | `CREATE TABLE IF NOT EXISTS bottles` present | ✅ |
| `package.json` | migrate/dev/start scripts with correct shapes | ✅ |
| `next.config.mjs` | `SAMEORIGIN` header, ESM `export default` | ✅ |

Wave 2 (backend API routes) can now import `lib/db.ts` and rely on the `bottles` table existing at pod startup.
