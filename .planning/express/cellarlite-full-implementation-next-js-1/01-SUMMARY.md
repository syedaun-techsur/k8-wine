---
phase: cellarlite-full-implementation-next-js-1
plan: "01"
subsystem: database-foundation
tags: [database, migration, pg, next.js, scaffold]

dependency_graph:
  requires: []
  provides:
    - lib/db.ts (pg.Pool singleton)
    - scripts/migrate.mjs (idempotent DDL runner)
    - package.json (npm scripts: migrate, dev, start, build)
    - next.config.mjs (iframe-safe headers, ESM config)
  affects:
    - Wave 2 backend (imports lib/db.ts for all DB operations)
    - Wave 3 frontend (depends on bottles table existing)
    - K8s pod startup (uses npm run start → migrate then next start)

tech_stack:
  added:
    - next@14.2.x (App Router)
    - pg@8.12.x (node-postgres)
    - react@18.3.x / react-dom@18.3.x
    - typescript@5.4.x + @types/*
  patterns:
    - ESM .mjs migration script (no ts-node dependency)
    - pg.Pool module-level singleton
    - Auto-migration before server boot via npm scripts

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
  - "Used pg.Client in migrate.mjs (not Pool) — script runs once and exits; Pool is for long-lived server"
  - "SAMEORIGIN not DENY for X-Frame-Options — app renders inside K8s sandbox iframe"
  - "next.config.mjs is ESM (.mjs) — Next.js 14 cannot parse .ts config"
  - "DATABASE_URL as sole connection source — no hard-coded credentials"

metrics:
  duration: "~2 minutes"
  completed: "2026-06-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 0
---

# Phase express Plan 01: Database Foundation Summary

**One-liner:** Next.js 14 + pg project scaffold with idempotent PostgreSQL migration via ESM pg.Client and pg.Pool singleton, wired into npm dev/start scripts.

## What Was Built

Wave 1 foundation for CellarLite: all configuration and database plumbing that every subsequent wave (API and UI) depends on.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Project scaffold — package.json, tsconfig.json, next.config.mjs | `89d22b6` | package.json, tsconfig.json, next.config.mjs, package-lock.json |
| 2 | Database foundation — scripts/migrate.mjs and lib/db.ts | `0b95c03` | scripts/migrate.mjs, lib/db.ts |

## Verification Results

All success criteria met:

- ✅ `scripts/migrate.mjs` is a valid ESM module with exact DDL: `CREATE TABLE IF NOT EXISTS bottles (id SERIAL PRIMARY KEY, name TEXT NOT NULL, vintage INTEGER, varietal TEXT, quantity INTEGER NOT NULL DEFAULT 1, location TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
- ✅ `scripts/migrate.mjs` exits 1 with stderr error when `DATABASE_URL` is unset
- ✅ `scripts/migrate.mjs` exits 0 and prints "Migration complete." (verified against live PostgreSQL 16)
- ✅ Running twice both exit 0 — idempotent via `CREATE TABLE IF NOT EXISTS`
- ✅ `lib/db.ts` exports default `pg.Pool` singleton using `process.env.DATABASE_URL`
- ✅ `package.json` scripts: `migrate=node scripts/migrate.mjs`, `dev=npm run migrate && next dev -p 3000`, `start=npm run migrate && next start -p 3000`, `build=next build`
- ✅ `next.config.mjs` is `.mjs` format (ESM), sets `X-Frame-Options: SAMEORIGIN` (not DENY), uses `export default`
- ✅ No hard-coded credentials anywhere
- ✅ No Dockerfile, docker-compose.yml, or compose.yaml created

## Integration Contracts Satisfied

| Artifact | Contract | Status |
|----------|----------|--------|
| `lib/db.ts` | `export default pool` (pg.Pool via DATABASE_URL) | ✅ CONTRACT_OK |
| `scripts/migrate.mjs` | `CREATE TABLE IF NOT EXISTS bottles` DDL | ✅ CONTRACT_OK |
| `package.json` | migrate/dev/start/build scripts present | ✅ CONTRACT_OK |
| `next.config.mjs` | `X-Frame-Options: SAMEORIGIN` header | ✅ CONTRACT_OK |

## Deviations from Plan

None — plan executed exactly as written.

The "DENY not present" verification from the plan produces a false positive (the word appears in an explanatory comment), but the actual header value is `SAMEORIGIN` as required.

## Self-Check: PASSED

All files exist on disk and all commits found in git history:
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.mjs
- ✅ scripts/migrate.mjs
- ✅ lib/db.ts
- ✅ Commit 89d22b6 (Task 1)
- ✅ Commit 0b95c03 (Task 2)
