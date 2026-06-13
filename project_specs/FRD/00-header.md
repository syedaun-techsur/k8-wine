# FRD: CellarLite
**Functional Requirements Document**
**Project Acronym:** CellarLite
**Version:** 1.0
**Date:** 2026-06-13
**Status:** Active
**Based on:** PRD-CellarLite.md v1.0

---

## Scope

This document specifies the detailed functional behaviour of all eight PRD features (F0–F7) for the CellarLite MVP. It covers inputs, outputs, validation rules, error handling, API contracts, and database schema sufficient for a developer to implement each feature without ambiguity. Authentication, multi-user support, image uploads, ratings, import/export, pagination, AI features, and Docker artefacts are explicitly out of scope.

---

## Conventions

- **Feature IDs:** `F00`–`F07` correspond to PRD features F0–F7 (zero-padded for sort order).
- **HTTP Methods & Status Codes:** Standard REST semantics; all API responses are `Content-Type: application/json`.
- **Error shape:** All error responses use `{ "error": "<human-readable message>" }`.
- **Nullable vs optional:** Fields marked *optional* may be omitted from request bodies; `null` and absent are treated equivalently server-side.
- **Env var:** `DATABASE_URL` is the single database connection string — never hard-coded.
- **Config file:** `next.config.mjs` (JavaScript ESM) — **never** `next.config.ts`; Next.js 14 cannot parse `.ts` config.
- **Port:** App binds to `0.0.0.0:3000`.
- **No iframe-blocking:** `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` must **not** be emitted on any response.
- **No ORM:** All database access via raw SQL through `pg` (node-postgres).

---

## Cross-Cutting Terminology

| Term | Definition |
|------|------------|
| **Bottle** | A single wine-bottle record in the `bottles` table |
| **Cellar** | The user's complete collection of bottles |
| **Vintage** | The year the grapes were harvested (integer, 4-digit year, optional) |
| **Varietal** | The grape variety or wine type, e.g. "Cabernet Sauvignon" (optional) |
| **Quantity** | Number of physical bottles of this record currently held (integer ≥ 0, default 1) |
| **Location** | Free-text storage location, e.g. "Rack A, shelf 2" (optional) |
| **DATABASE_URL** | PostgreSQL connection string injected as an environment variable |
| **migrate.mjs** | Idempotent migration script; runs before the Next.js server boots |
| **App Router** | Next.js 14 file-system routing under `app/` directory |
| **Server Component** | Next.js React component that renders on the server (no `"use client"`) |
| **Client Component** | Next.js React component with `"use client"` directive; runs in browser |
| **Route Handler** | Next.js App Router API file at `app/api/.../route.ts` |

---

## Table of Contents

| Chunk | Feature |
|-------|---------|
| [F00-bottle-list.md](F00-bottle-list.md) | F0: Bottle List Page (`/`) |
| [F01-add-bottle.md](F01-add-bottle.md) | F1: Add Bottle Page (`/bottles/new`) |
| [F02-edit-bottle.md](F02-edit-bottle.md) | F2: Edit Bottle Page (`/bottles/[id]/edit`) |
| [F03-delete-bottle.md](F03-delete-bottle.md) | F3: Delete Bottle |
| [F04-search-filter.md](F04-search-filter.md) | F4: Search / Filter by Name |
| [F05-rest-api.md](F05-rest-api.md) | F5: REST API |
| [F06-auto-migration.md](F06-auto-migration.md) | F6: Database Auto-Migration |
| [F07-brand-ui.md](F07-brand-ui.md) | F7: Brand & Mobile-First UI |
| [Y0-schema.md](Y0-schema.md) | Database Schema (DDL) |
| [Y1-api.md](Y1-api.md) | REST API Catalog |
| [Y2-errors.md](Y2-errors.md) | Cross-Feature Error Catalog |
| [Y3-integrations.md](Y3-integrations.md) | Integration Points |

---
