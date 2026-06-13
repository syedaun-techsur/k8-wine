# Technical Architecture: CellarLite
**Project Acronym:** CellarLite
**Version:** 1.0
**Date:** 2026-06-13
**Status:** Active
**Based on:** PRD-CellarLite.md v1.0, FRD-CellarLite.md v1.0

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Model](#3-data-model)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Integration Points](#7-integration-points)

---

## 1. Architectural Overview

### Pattern

CellarLite follows a **monolithic full-stack web application** pattern built on Next.js 14 App Router. There is no separate backend service — API Route Handlers and Server Components coexist in the same Next.js process. This pattern is deliberate: the MVP scope is narrow (single table, single user, no auth), and a monolith minimises operational complexity on the Pivota K8s sandbox.

Key architectural decisions:

| Decision | Rationale |
|----------|-----------|
| Next.js 14 App Router | Prescribed by platform; enables server-rendered pages with minimal boilerplate |
| Raw SQL via `pg` | No ORM overhead; full transparency of queries; simpler dependency tree |
| Single `bottles` table | MVP scope; no relationships needed |
| `next.config.mjs` (ESM, never `.ts`) | Next.js 14 hard-errors on `.ts` config; `.mjs` is the safe, enforced choice |
| Auto-migration on startup | Zero manual DB setup; idempotent `CREATE TABLE IF NOT EXISTS` runs before Next.js boots |
| No authentication | Single personal user; login overhead not justified for MVP |
| No Docker/compose | Platform provides PostgreSQL natively; `npm` scripts handle everything |
| `0.0.0.0:3000` bind | Required by Pivota K8s sandbox proxy |
| No iframe-blocking headers | App renders inside sandbox iframe; `X-Frame-Options: DENY` and `frame-ancestors 'none'` must not be emitted |

---

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pivota K8s Sandbox                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Next.js 14 Process (port 3000)          │  │
│  │                                                          │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │  │
│  │  │   App Router Pages  │  │   API Route Handlers     │  │  │
│  │  │   (Server Components│  │   app/api/               │  │  │
│  │  │    + Client)        │  │                          │  │  │
│  │  │                     │  │  GET  /api/health        │  │  │
│  │  │  /                  │  │  GET  /api/bottles       │  │  │
│  │  │  /bottles/new       │  │  POST /api/bottles       │  │  │
│  │  │  /bottles/[id]/edit │  │  GET  /api/bottles/[id]  │  │  │
│  │  │                     │  │  PUT  /api/bottles/[id]  │  │  │
│  │  │                     │  │  DELETE /api/bottles/[id]│  │  │
│  │  └──────────┬──────────┘  └───────────┬──────────────┘  │  │
│  │             │                          │                  │  │
│  │             └──────────┬───────────────┘                  │  │
│  │                        │                                  │  │
│  │              ┌─────────▼──────────┐                       │  │
│  │              │    lib/db.ts       │                       │  │
│  │              │  pg.Pool singleton │                       │  │
│  │              └─────────┬──────────┘                       │  │
│  │                        │ raw SQL (node-postgres)           │  │
│  └────────────────────────┼─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────▼────────────────────────────────┐  │
│  │         PostgreSQL 16   localhost:5432   db: app          │  │
│  │                                                          │  │
│  │         Table: bottles (single table, MVP)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/migrate.mjs  (runs before Next.js boots)        │  │
│  │  CREATE TABLE IF NOT EXISTS bottles (...)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Deployment Topology

```
Pivota K8s Sandbox Pod
├── Container: Next.js app
│   ├── process: node (next start / next dev)
│   ├── binds: 0.0.0.0:3000
│   ├── env: DATABASE_URL=postgres://postgres:devpass@localhost:5432/app
│   └── startup: npm run migrate && next start -p 3000
│
└── Container: PostgreSQL 16
    ├── listens: localhost:5432
    ├── database: app
    └── credentials: postgres / devpass (injected via env)
```

The two containers share the same pod network namespace, so `localhost:5432` resolves within the pod. No service discovery, no Docker networking, no Docker Compose.

---

### Request Flow

**Page Load (`GET /`):**
```
Browser → Next.js Server Component
         → lib/db.ts pool.query(SELECT * FROM bottles ...)
         → PostgreSQL returns rows
         → Server Component renders HTML
         → HTML streamed to browser
```

**API Mutation (e.g. `POST /api/bottles`):**
```
Browser fetch() → Next.js Route Handler (app/api/bottles/route.ts)
                → Validate request body
                → lib/db.ts pool.query(INSERT INTO bottles ...)
                → PostgreSQL returns new row
                → Route Handler returns JSON 201
                → Browser redirects to /
```

---

## 2. Component Architecture

### Directory Structure

```
k8-wine/
├── app/
│   ├── layout.tsx                  # Root layout — wraps all pages, global CSS import
│   ├── page.tsx                    # F00: Bottle list page (/)
│   ├── error.tsx                   # Next.js error boundary for page-level errors
│   ├── bottles/
│   │   ├── new/
│   │   │   └── page.tsx            # F01: Add bottle page (/bottles/new)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx        # F02/F03: Edit + delete bottle page
│   └── api/
│       ├── health/
│       │   └── route.ts            # GET /api/health
│       └── bottles/
│           ├── route.ts            # GET /api/bottles, POST /api/bottles
│           └── [id]/
│               └── route.ts        # GET, PUT, DELETE /api/bottles/[id]
│
├── lib/
│   └── db.ts                       # pg.Pool singleton — shared DB connection
│
├── scripts/
│   └── migrate.mjs                 # F06: Auto-migration script (ESM, runs before server)
│
├── styles/
│   └── globals.css                 # Global CSS — brand variables, resets, mobile-first base
│
├── next.config.mjs                 # Next.js config (ESM, NEVER .ts) — header overrides
├── package.json                    # npm scripts: migrate, dev, start, build
└── tsconfig.json                   # TypeScript config (app code only; config files stay .mjs)
```

---

### Backend Components

#### `lib/db.ts` — Database Pool

Responsibility: Provide a single shared `pg.Pool` instance for the entire application. All Route Handlers and Server Components import from this module.

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

**Design notes:**
- Module-level singleton avoids opening a new connection per HTTP request.
- `Pool` handles connection lifecycle, idle timeouts, and reconnection automatically.
- No transactions needed — all MVP operations are single-table, single-statement.
- `DATABASE_URL` is the single source of truth; never use individual `POSTGRES_*` vars in app code.

---

#### `app/api/health/route.ts` — Health Check

Responsibility: Respond to Kubernetes liveness probes. Returns `200 {"status":"ok"}` with no database interaction.

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

---

#### `app/api/bottles/route.ts` — Bottles Collection

Responsibility: Handle `GET /api/bottles` (list + search) and `POST /api/bottles` (create).

- `GET`: Reads optional `q` search param; runs ILIKE query if present, full-table scan otherwise.
- `POST`: Validates request body; inserts new row; returns created record with `201`.

---

#### `app/api/bottles/[id]/route.ts` — Single Bottle

Responsibility: Handle `GET`, `PUT`, `DELETE` for a specific bottle by ID.

- `GET`: Fetches single row by PK; returns `404` if not found or `id` non-integer.
- `PUT`: Validates body; updates all editable fields; returns updated record.
- `DELETE`: Hard-deletes row; returns `204 No Content`.

---

#### `scripts/migrate.mjs` — Auto-Migration

Responsibility: Run idempotent DDL before Next.js boots. Exits `0` on success, `1` on any failure (connection refused, `DATABASE_URL` missing, DDL error). Called by `npm run migrate`, which is chained before `next dev` and `next start`.

---

### Frontend Components

#### `app/layout.tsx` — Root Layout (Server Component)

Responsibility: Wrap all pages in a consistent shell — HTML `<head>`, global CSS import, max-width container centred for mobile-on-desktop display.

```typescript
// app/layout.tsx
import './globals.css'; // or '../styles/globals.css'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
```

---

#### `app/page.tsx` — Bottle List Page (Server Component)

Responsibility: Render `GET /` — the primary daily-use screen.

- Server-renders the full bottle list by querying PostgreSQL directly (via `lib/db.ts`).
- Reads `searchParams.q` and passes it to the SQL query for ILIKE filtering (F04).
- Renders empty-state ("No bottles yet") or search-empty state ("No bottles match '…'") as appropriate.
- Contains the search `<input>` (Client Component island for URL sync) and "Add bottle" link.
- Each bottle row is an `<a href="/bottles/[id]/edit">` — fully server-rendered, no client-side navigation required.

---

#### `app/bottles/new/page.tsx` — Add Bottle Page

Responsibility: Render the add-bottle form and handle submission (F01).

- Renders as a Client Component (`"use client"`) to enable client-side validation (name required check) and fetch-based form submission.
- On submit: `POST /api/bottles` with JSON body; on `201` redirect to `/`; on error display inline message.
- "Cancel" link: `<a href="/">`.

---

#### `app/bottles/[id]/edit/page.tsx` — Edit/Delete Bottle Page

Responsibility: Pre-populate form with existing bottle data; handle save (F02) and delete (F03).

- Server Component fetches the bottle on load (`GET /api/bottles/[id]` or direct DB query).
- Form rendered as a Client Component island for client-side validation and fetch submission.
- Delete button: calls `window.confirm()`; on `true` calls `DELETE /api/bottles/[id]`; on `204` redirects to `/`.
- `quantity = 0` is permitted on edit (record a finished bottle).

---

### Configuration: `next.config.mjs`

```js
// next.config.mjs  — MUST be .mjs, never .ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SAMEORIGIN allows iframe embedding from same origin (sandbox preview)
          // Never use DENY — app must render inside iframe
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Critical constraints enforced here:**
- File extension: `.mjs` — Next.js 14 cannot parse `.ts` config and will hard-error.
- `X-Frame-Options: SAMEORIGIN` (not `DENY`) — app must load inside Pivota sandbox iframe.
- No `Content-Security-Policy` with `frame-ancestors 'none'` — ever.

---

### npm Scripts (`package.json`)

```json
{
  "scripts": {
    "migrate": "node scripts/migrate.mjs",
    "dev":     "npm run migrate && next dev -p 3000",
    "start":   "npm run migrate && next start -p 3000",
    "build":   "next build"
  }
}
```

**Design notes:**
- `&&` ensures Next.js only starts if migration succeeds (exit 0). A DB connection failure aborts startup cleanly.
- `-p 3000` explicitly sets port; combined with `0.0.0.0` binding (Next.js default on Linux) satisfies the sandbox proxy requirement.
- `build` intentionally omits migration — builds may run in CI without a DB connection.

---

## 3. Data Model

### Overview

CellarLite uses a **single-table data model**. There are no relationships, no foreign keys, no joins. The `bottles` table is the entire database schema for the MVP.

---

### ER Diagram

```
┌──────────────────────────────────────────────┐
│                   bottles                    │
├─────────────┬────────────────┬───────────────┤
│ Column      │ Type           │ Constraints   │
├─────────────┼────────────────┼───────────────┤
│ id          │ SERIAL         │ PRIMARY KEY   │
│ name        │ TEXT           │ NOT NULL      │
│ vintage     │ INTEGER        │ NULL allowed  │
│ varietal    │ TEXT           │ NULL allowed  │
│ quantity    │ INTEGER        │ NOT NULL      │
│             │                │ DEFAULT 1     │
│ location    │ TEXT           │ NULL allowed  │
│ created_at  │ TIMESTAMPTZ    │ NOT NULL      │
│             │                │ DEFAULT now() │
└─────────────┴────────────────┴───────────────┘

(No foreign keys. No other tables in MVP.)
```

---

### Complete DDL

```sql
-- scripts/migrate.mjs executes this DDL before every server start.
-- CREATE TABLE IF NOT EXISTS ensures idempotency — safe to run repeatedly.

CREATE TABLE IF NOT EXISTS bottles (
  id         SERIAL        PRIMARY KEY,
  name       TEXT          NOT NULL,
  vintage    INTEGER,
  varietal   TEXT,
  quantity   INTEGER       NOT NULL DEFAULT 1,
  location   TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

**No additional indexes are created.** The implicit `btree` index on `id` (PK) is sufficient for:
- Point lookups by `id` (`GET /api/bottles/[id]`, `PUT`, `DELETE`)
- Full-table scan for list (`GET /api/bottles` — small personal collection)
- ILIKE scan on `name` (no index; acceptable for MVP collection size)

Post-MVP: add `CREATE INDEX ON bottles USING gin(name gin_trgm_ops)` if search performance becomes a concern at scale.

---

### Column Reference

| Column | PostgreSQL Type | Nullable | Default | App-Layer Constraints | Notes |
|--------|----------------|----------|---------|----------------------|-------|
| `id` | `SERIAL` (int4 auto-increment) | No | auto | — | PK; gaps after DELETE are cosmetic only |
| `name` | `TEXT` | No | — | Max 255 chars; non-empty after trim | Wine label / bottle name |
| `vintage` | `INTEGER` | Yes | `NULL` | Range `[1800, currentYear+1]` if provided | Harvest year; `NULL` when not entered |
| `varietal` | `TEXT` | Yes | `NULL` | Max 255 chars | Grape variety or wine type |
| `quantity` | `INTEGER` | No | `1` | POST: ≥ 1; PUT: ≥ 0 | Physical bottle count; 0 = finished |
| `location` | `TEXT` | Yes | `NULL` | Max 500 chars | Free-text storage location |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | Never updated after insert | UTC timestamp; set by DB default |

---

### Query Patterns

All queries use parameterised `$N` placeholders — never string interpolation.

**List all (newest first):**
```sql
SELECT * FROM bottles ORDER BY created_at DESC;
```

**Search by name (case-insensitive partial match):**
```sql
SELECT * FROM bottles
WHERE name ILIKE $1
ORDER BY created_at DESC;
-- $1 = '%' + searchTerm.trim() + '%'
```

**Fetch single bottle:**
```sql
SELECT * FROM bottles WHERE id = $1;
-- $1 = integer id
```

**Insert new bottle:**
```sql
INSERT INTO bottles (name, vintage, varietal, quantity, location)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
-- $1=name, $2=vintage|null, $3=varietal|null, $4=quantity(default 1), $5=location|null
```

**Update bottle (all editable fields, full replacement):**
```sql
UPDATE bottles
SET name = $1, vintage = $2, varietal = $3, quantity = $4, location = $5
WHERE id = $6
RETURNING *;
```

**Delete bottle:**
```sql
DELETE FROM bottles WHERE id = $1 RETURNING id;
```

---

## 4. API Design

### Base URL

`http://localhost:3000/api` (development) / `http://<sandbox-host>/api` (production)

### Conventions

- All requests and responses: `Content-Type: application/json`
- No authentication headers required
- All error responses: `{ "error": "<human-readable message>" }`
- `null` and absent fields are treated equivalently server-side for optional fields
- Implemented as Next.js App Router Route Handlers (`app/api/.../route.ts`)

---

### TypeScript Interfaces

```typescript
// ─── Domain Types ────────────────────────────────────────────────────────────

/** A single bottle record as returned by the API. */
interface Bottle {
  id: number;
  name: string;
  vintage: number | null;
  varietal: string | null;
  quantity: number;
  location: string | null;
  created_at: string;       // ISO 8601 UTC string, e.g. "2026-06-13T10:00:00.000Z"
}

// ─── Request Bodies ──────────────────────────────────────────────────────────

/** Body for POST /api/bottles */
interface CreateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 1; defaults to 1
  location?: string | null; // Optional; max 500 chars
}

/** Body for PUT /api/bottles/[id] */
interface UpdateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 0 (0 = finished bottle)
  location?: string | null; // Optional; max 500 chars
}

// ─── Response Types ──────────────────────────────────────────────────────────

/** Standard error response shape for all API error codes */
interface ApiError {
  error: string;
}

/** GET /api/health response */
interface HealthResponse {
  status: 'ok';
}
```

---

### Endpoint Reference

#### `GET /api/health`

**Purpose:** Kubernetes liveness probe. No database interaction.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/health` |
| **Auth** | None |
| **Query params** | None |
| **Request body** | None |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "status": "ok" }` | Always |

---

#### `GET /api/bottles`

**Purpose:** List all bottles; optional case-insensitive name filter.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/bottles` |
| **Auth** | None |
| **Query params** | `q` (string, optional) — partial name filter |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `Bottle[]` (may be empty array `[]`) | Success |
| 500 | `{ "error": "Internal server error" }` | DB failure |

**SQL behaviour:**
- `q` absent or blank → `SELECT * FROM bottles ORDER BY created_at DESC`
- `q` non-empty → `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `$1 = '%' + q.trim() + '%'`
- Whitespace-only `q` treated as absent
- `q` trimmed to max 500 chars before use

---

#### `POST /api/bottles`

**Purpose:** Create a new bottle record.

| | |
|---|---|
| **Method** | POST |
| **Path** | `/api/bottles` |
| **Auth** | None |
| **Headers** | `Content-Type: application/json` |
| **Request body** | `CreateBottleRequest` |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `Bottle` (the created record) | Success |
| 400 | `{ "error": "Invalid JSON" }` | Malformed request body |
| 422 | `{ "error": "Name is required" }` | `name` blank or missing |
| 422 | `{ "error": "Vintage must be a valid year" }` | `vintage` not integer |
| 422 | `{ "error": "Vintage must be between 1800 and YYYY" }` | `vintage` out of range |
| 422 | `{ "error": "Quantity must be at least 1" }` | `quantity` < 1 |
| 422 | `{ "error": "Quantity must be a whole number" }` | `quantity` not integer |
| 500 | `{ "error": "Internal server error" }` | DB failure |

**SQL:** `INSERT INTO bottles (name, vintage, varietal, quantity, location) VALUES ($1,$2,$3,$4,$5) RETURNING *`

---

#### `GET /api/bottles/[id]`

**Purpose:** Fetch a single bottle by primary key.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/bottles/:id` |
| **Auth** | None |
| **Path params** | `id` — positive integer |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `Bottle` | Found |
| 404 | `{ "error": "Not found" }` | `id` not in DB, or `id` not a valid positive integer |
| 500 | `{ "error": "Internal server error" }` | DB failure |

**SQL:** `SELECT * FROM bottles WHERE id = $1`

---

#### `PUT /api/bottles/[id]`

**Purpose:** Update all editable fields of an existing bottle (full replacement).

| | |
|---|---|
| **Method** | PUT |
| **Path** | `/api/bottles/:id` |
| **Auth** | None |
| **Headers** | `Content-Type: application/json` |
| **Path params** | `id` — positive integer |
| **Request body** | `UpdateBottleRequest` |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `Bottle` (the updated record) | Success |
| 400 | `{ "error": "Invalid JSON" }` | Malformed body |
| 404 | `{ "error": "Not found" }` | `id` not found or invalid |
| 422 | `{ "error": "Name is required" }` | `name` blank |
| 422 | `{ "error": "Vintage must be a valid year" }` | `vintage` not integer |
| 422 | `{ "error": "Vintage must be between 1800 and YYYY" }` | `vintage` out of range |
| 422 | `{ "error": "Quantity cannot be negative" }` | `quantity` < 0 |
| 422 | `{ "error": "Quantity must be a whole number" }` | `quantity` not integer |
| 500 | `{ "error": "Internal server error" }` | DB failure |

**SQL:** `UPDATE bottles SET name=$1, vintage=$2, varietal=$3, quantity=$4, location=$5 WHERE id=$6 RETURNING *`

**Note on `quantity`:** PUT allows `quantity = 0` to record a "finished" bottle. POST requires `quantity >= 1`.

---

#### `DELETE /api/bottles/[id]`

**Purpose:** Permanently hard-delete a bottle record.

| | |
|---|---|
| **Method** | DELETE |
| **Path** | `/api/bottles/:id` |
| **Auth** | None |
| **Path params** | `id` — positive integer |
| **Request body** | None |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 204 | *(empty body)* | Success |
| 404 | `{ "error": "Not found" }` | `id` not found or not a valid positive integer |
| 500 | `{ "error": "Internal server error" }` | DB failure |

**SQL:** `DELETE FROM bottles WHERE id = $1 RETURNING id`

---

### Validation Rules Summary

| Field | POST Rule | PUT Rule |
|-------|-----------|----------|
| `name` | Required; non-empty string after `trim()`; max 255 chars | Same |
| `vintage` | Optional; if provided: integer, range `[1800, currentYear+1]` | Same |
| `varietal` | Optional; if provided: string, max 255 chars | Same |
| `quantity` | Optional; if provided: integer ≥ 1; defaults to `1` | Optional; if provided: integer ≥ 0 |
| `location` | Optional; if provided: string, max 500 chars | Same |

**`id` path param (all `[id]` routes):** Must parse as a positive integer via `parseInt(id, 10)`. `NaN`, `0`, or negative → `404 Not found`. No further validation at DB layer.

---

## 5. Security Architecture

### Authentication & Authorization

CellarLite has **no authentication** by design. This is an explicit MVP decision: the app is single-user, personal, and deployed in a private K8s sandbox. All endpoints are publicly accessible without credentials or sessions.

Post-MVP path: Add NextAuth.js or a simple JWT-based auth layer if the app ever needs multi-user support or public exposure.

---

### Credential Management

| Credential | Storage | Usage |
|------------|---------|-------|
| PostgreSQL connection string | `DATABASE_URL` environment variable | Injected by K8s pod spec; read by `lib/db.ts` and `scripts/migrate.mjs` |
| PostgreSQL password | Embedded in `DATABASE_URL` | Never hard-coded in source; never committed to version control |

**Rules:**
- `DATABASE_URL` is the single source of truth for DB credentials.
- No credential may appear in `lib/db.ts`, `scripts/migrate.mjs`, or any application file.
- `DATABASE_URL` must be listed in `.gitignore`-protected `.env.local` for local development.
- Example value for documentation only: `postgres://postgres:devpass@localhost:5432/app`

---

### SQL Injection Prevention

All database queries use parameterised placeholders (`$1`, `$2`, …) via `pg`. String interpolation into SQL is strictly forbidden.

```typescript
// CORRECT — parameterised
pool.query('SELECT * FROM bottles WHERE name ILIKE $1', [`%${q}%`]);

// FORBIDDEN — string interpolation
pool.query(`SELECT * FROM bottles WHERE name ILIKE '%${q}%'`); // Never do this
```

The search term `q` is additionally trimmed and capped at 500 characters before use, preventing excessively long patterns from causing regex-like performance issues.

---

### Input Validation

All mutating API endpoints (`POST`, `PUT`) perform server-side validation before any SQL execution:

1. **JSON parse guard:** Malformed request bodies return `400 {"error":"Invalid JSON"}` before any field access.
2. **Type checks:** `name` must be a string; `vintage` must be an integer; `quantity` must be an integer.
3. **Range checks:** `vintage` in `[1800, currentYear+1]`; `quantity >= 1` (POST) or `>= 0` (PUT).
4. **Length caps:** `name` ≤ 255 chars; `varietal` ≤ 255 chars; `location` ≤ 500 chars.

Client-side validation (blank `name` check before submit) reduces unnecessary round-trips but is not a security control — server-side validation is always authoritative.

---

### HTTP Security Headers

The iframe-embedding requirement creates a deliberate relaxation of the default `X-Frame-Options` policy:

| Header | Value Set | Rationale |
|--------|-----------|-----------|
| `X-Frame-Options` | `SAMEORIGIN` | Allows embedding from same origin (K8s sandbox preview); `DENY` would block the iframe |
| CSP `frame-ancestors` | **Not set** | No `frame-ancestors 'none'` — would block the iframe preview |

This is configured in `next.config.mjs` via the `headers()` export and applies globally to all routes (`source: '/(.*)'`).

**No other security headers** (HSTS, CSP, Referrer-Policy, etc.) are configured in the MVP. Post-MVP: add a hardened CSP once iframe embedding requirements are fully understood.

---

### Data Protection

- **Persistence:** PostgreSQL is the single source of truth. Data survives container restarts as long as the PG pod's persistent volume is intact (managed by the platform).
- **No PII:** Bottle records contain only wine metadata — no personal information beyond what the single user voluntarily enters. No encryption at rest is required for MVP.
- **No soft-delete:** DELETE is permanent. The user is warned via `window.confirm()` before any deletion. No undo mechanism in MVP.

---

## 6. Technology Stack

| Layer | Technology | Version | Purpose | Notes |
|-------|-----------|---------|---------|-------|
| Frontend Framework | Next.js | 14.x (App Router) | Full-stack React framework | Server Components + Client Components; file-system routing |
| Language (app) | TypeScript | ~5.x | Type-safe application code | All `.ts`/`.tsx` files under `app/` and `lib/` |
| Language (config/scripts) | JavaScript ESM | — | Config and migration scripts | `next.config.mjs`, `scripts/migrate.mjs` — never TypeScript |
| Database Driver | pg (node-postgres) | ^8.x | Raw SQL access to PostgreSQL | No ORM; parameterised queries via `pool.query()` |
| Database | PostgreSQL | 16 | Persistent data store | Co-resident container; accessed via `localhost:5432` |
| Styling | Plain CSS / CSS Modules | — | Mobile-first UI | No CSS framework (Bootstrap, Tailwind, etc.) prohibited |
| Runtime | Node.js | ≥18.x | Server runtime for Next.js | Required by Next.js 14 |
| Package Manager | npm | — | Dependency management and scripts | `package.json` scripts chain `migrate` before `dev`/`start` |

---

### Key Dependencies (`package.json`)

**Production:**
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "pg": "^8.x"
}
```

**Development:**
```json
{
  "@types/node": "^20.x",
  "@types/react": "^18.x",
  "@types/react-dom": "^18.x",
  "@types/pg": "^8.x",
  "typescript": "^5.x"
}
```

**Explicitly excluded:**
- Any ORM (Prisma, Drizzle, Sequelize, TypeORM) — raw SQL only
- Any CSS framework (Tailwind, Bootstrap, Chakra UI) — plain CSS only
- Any auth library — no authentication in MVP
- Docker/Docker Compose — platform manages PostgreSQL natively

---

### Configuration Files

| File | Format | Purpose |
|------|--------|---------|
| `next.config.mjs` | ESM JavaScript (`.mjs`) | Next.js config; header overrides for iframe compatibility |
| `tsconfig.json` | JSON | TypeScript compiler config for app code |
| `.env.local` | dotenv | Local development environment variables (not committed) |
| `package.json` | JSON | npm scripts, dependencies |
| `scripts/migrate.mjs` | ESM JavaScript (`.mjs`) | Migration script; no TypeScript to avoid ts-node dependency |

**Critical:** `next.config.mjs` **must** remain `.mjs`. Next.js 14 cannot parse `.ts` config files and will throw a hard startup error. This is a known breaking constraint, documented in PRD risk register.

---

## 7. Integration Points

### PostgreSQL 16 (Primary Integration)

| Attribute | Value |
|-----------|-------|
| Host | `localhost` (shared pod network namespace) |
| Port | `5432` |
| Database | `app` |
| User | `postgres` |
| Password | `devpass` (injected via `DATABASE_URL`) |
| Connection string | `postgres://postgres:devpass@localhost:5432/app` |
| Driver | `pg` (node-postgres) v8.x |
| Connection method | `pg.Pool` singleton in `lib/db.ts` |
| Max connections | Pool default (10) — sufficient for single-user MVP |

**Connection lifecycle:**
1. `scripts/migrate.mjs` opens a `pg.Client` on startup, runs DDL, closes.
2. `lib/db.ts` initialises a `pg.Pool` when the module is first imported (lazy, on first request).
3. Pool maintains idle connections; no manual teardown required in MVP.

**Failure modes:**
- Connection refused → `migrate.mjs` exits 1 → `npm run dev/start` aborts (clean fail).
- Auth failure → same as above.
- Connection lost mid-request → `pool.query()` throws → Route Handler catches → `500 Internal server error`.

---

### Pivota K8s Sandbox (Deployment Platform)

| Attribute | Value |
|-----------|-------|
| Pod network | Shared namespace (Next.js + PostgreSQL containers in same pod) |
| Exposed port | `3000` |
| Bind address | `0.0.0.0` (required by sandbox proxy) |
| Environment injection | Pod spec injects `DATABASE_URL` and `POSTGRES_*` vars |
| Liveness probe | `GET /api/health` → must return `200` within timeout |
| Iframe preview | App must load inside sandbox iframe; no `X-Frame-Options: DENY` |

**No platform SDK or library** is required — the platform is transparent to the app beyond port binding and environment variables.

---

### External Services

**None.** CellarLite MVP has zero external API integrations. There are no:
- CDN or asset delivery services
- Analytics or monitoring services
- Email / notification services
- Third-party auth providers
- External DNS dependencies beyond the sandbox platform

---

### Future Integration Opportunities (Post-MVP, Out of Scope)

| Integration | Purpose | Trigger |
|-------------|---------|---------|
| Vivino / Wine API | Autofill varietal, vintage from label scan | F: Image upload + recognition |
| CellarTracker export | Import/export user's existing collection | F: Import/export |
| Authentication provider (NextAuth.js) | Multi-user support | F: Multi-tenancy |
| S3-compatible storage | Bottle label image uploads | F: Image uploads |
| Structured logging (Datadog, etc.) | Production observability | Scale trigger |

---

*Document generated: 2026-06-13 | Stack: Next.js 14 App Router + pg (node-postgres) + PostgreSQL 16*
