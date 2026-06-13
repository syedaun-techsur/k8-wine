---
phase: cellarlite-full-implementation-next-js-1
plan: 02
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/api/health/route.ts
  - app/api/bottles/route.ts
  - types/bottle.ts
autonomous: true

features:
  implements: ["F5"]
  depends_on: ["F6"]
  enables: ["F0", "F1", "F2", "F3", "F4"]

must_haves:
  truths:
    - "GET /api/health returns 200 {\"status\":\"ok\"} with no database call"
    - "GET /api/bottles returns 200 with a JSON array of all bottles (newest first)"
    - "GET /api/bottles?q=term returns only bottles whose name ILIKE '%term%'"
    - "POST /api/bottles with valid body returns 201 with the created bottle object including id and created_at"
    - "POST /api/bottles with blank/missing name returns 422 {\"error\":\"Name is required\"}"
    - "POST /api/bottles with quantity=0 returns 422 {\"error\":\"Quantity must be at least 1\"}"
    - "POST /api/bottles with malformed JSON returns 400 {\"error\":\"Invalid JSON\"}"
    - "All responses are Content-Type: application/json; error shape is {\"error\":\"<message>\"}"
  artifacts:
    - path: "app/api/health/route.ts"
      provides: "GET /api/health — K8s liveness probe"
      exports: ["GET"]
    - path: "app/api/bottles/route.ts"
      provides: "GET /api/bottles (list+search) and POST /api/bottles (create)"
      exports: ["GET", "POST"]
    - path: "types/bottle.ts"
      provides: "TypeScript interfaces: Bottle, CreateBottleRequest, ApiError, HealthResponse"
      exports: ["Bottle", "CreateBottleRequest", "ApiError", "HealthResponse"]
  key_links:
    - from: "app/api/bottles/route.ts"
      to: "lib/db.ts"
      via: "import pool from '../../lib/db'"
      pattern: "import pool from"
    - from: "app/api/bottles/route.ts"
      to: "PostgreSQL bottles table"
      via: "pool.query parameterised SQL"
      pattern: "pool\\.query"
    - from: "app/api/health/route.ts"
      to: "NextResponse.json"
      via: "NextResponse.json({ status: 'ok' })"
      pattern: "status.*ok"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "lib/db.ts"
      exports: ["default (pg.Pool)"]
      verify: "grep -n 'export default pool' lib/db.ts && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "scripts/migrate.mjs"
      exports: ["idempotent migration — exits 0"]
      verify: "grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo CONTRACT_OK"
  provides:
    - artifact: "app/api/health/route.ts"
      exports: ["GET"]
      shape: |
        export async function GET(): Promise<NextResponse>
        Response: 200 { "status": "ok" }
      verify: "grep -n 'export async function GET' app/api/health/route.ts && echo CONTRACT_OK"
    - artifact: "app/api/bottles/route.ts"
      exports: ["GET", "POST"]
      shape: |
        GET  /api/bottles          → 200 Bottle[]
        GET  /api/bottles?q=term   → 200 Bottle[] (ILIKE filter)
        POST /api/bottles          → 201 Bottle | 400 | 422 | 500
      verify: "grep -n 'export async function GET' app/api/bottles/route.ts && grep -n 'export async function POST' app/api/bottles/route.ts && echo CONTRACT_OK"
    - artifact: "types/bottle.ts"
      exports: ["Bottle", "CreateBottleRequest", "ApiError", "HealthResponse"]
      shape: |
        interface Bottle { id: number; name: string; vintage: number | null; varietal: string | null; quantity: number; location: string | null; created_at: string; }
        interface CreateBottleRequest { name: string; vintage?: number | null; varietal?: string | null; quantity?: number; location?: string | null; }
        interface ApiError { error: string; }
        interface HealthResponse { status: 'ok'; }
      verify: "grep -n 'interface Bottle' types/bottle.ts && grep -n 'interface CreateBottleRequest' types/bottle.ts && echo CONTRACT_OK"
---

<objective>
Implement the health-check endpoint and the bottles collection API endpoints (GET list+search, POST create).

Purpose: Wave 3 (frontend) needs working API routes to fetch data and submit forms. The health endpoint is required by the K8s liveness probe immediately on deploy. This plan covers the two route files that handle three of the six F5 REST API endpoints — the remaining three (GET/PUT/DELETE /api/bottles/[id]) are in plan 03.

Output:
- `app/api/health/route.ts` — GET /api/health → 200 {"status":"ok"}, no DB
- `app/api/bottles/route.ts` — GET /api/bottles (ILIKE search via ?q=) + POST /api/bottles (create with full validation)
- `types/bottle.ts` — shared TypeScript interfaces consumed by all route handlers and pages
</objective>

<feature_dependencies>
Implements: F5: REST API — specifically GET /api/health, GET /api/bottles, POST /api/bottles
Depends on: F6: Database Auto-Migration (lib/db.ts Pool singleton + bottles table DDL from wave 1)
Enables: F0: Bottle List Page, F1: Add Bottle Page, F4: Search/Filter by Name
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/express/cellarlite-full-implementation-next-js-1/01-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: TypeScript interfaces + health endpoint</name>
  <files>
    types/bottle.ts
    app/api/health/route.ts
  </files>
  <action>
Create the shared TypeScript interfaces and the health-check route handler.

**1. `types/bottle.ts`**

Exact interfaces from TechArch §4 TypeScript Interfaces — copy verbatim, do NOT rename fields:

```typescript
// types/bottle.ts

/** A single bottle record as returned by the API. */
export interface Bottle {
  id: number;
  name: string;
  vintage: number | null;
  varietal: string | null;
  quantity: number;
  location: string | null;
  created_at: string;       // ISO 8601 UTC string, e.g. "2026-06-13T10:00:00.000Z"
}

/** Body for POST /api/bottles */
export interface CreateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 1; defaults to 1
  location?: string | null; // Optional; max 500 chars
}

/** Body for PUT /api/bottles/[id] */
export interface UpdateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 0 (0 = finished bottle)
  location?: string | null; // Optional; max 500 chars
}

/** Standard error response shape for all API error codes */
export interface ApiError {
  error: string;
}

/** GET /api/health response */
export interface HealthResponse {
  status: 'ok';
}
```

**2. `app/api/health/route.ts`**

From TechArch §2 Backend Components "app/api/health/route.ts — Health Check":
- Returns `200 {"status":"ok"}` immediately
- NO database call — liveness probe only
- From TechArch exact implementation:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

Create parent directories `app/api/health/` and `types/` if not already present.
  </action>
  <verify>
```bash
grep -n 'interface Bottle' types/bottle.ts && echo "Bottle interface OK"
grep -n 'interface CreateBottleRequest' types/bottle.ts && echo "CreateBottleRequest OK"
grep -n 'interface UpdateBottleRequest' types/bottle.ts && echo "UpdateBottleRequest OK"
grep -n 'export async function GET' app/api/health/route.ts && echo "Health GET export OK"
grep -n "status.*ok" app/api/health/route.ts && echo "Health status:ok OK"
grep -n 'pool\|db\|query' app/api/health/route.ts 2>/dev/null && echo "WARNING: DB import in health route — must not exist" || echo "No DB call in health route OK"
```
  </verify>
  <done>
- `types/bottle.ts` exports: Bottle, CreateBottleRequest, UpdateBottleRequest, ApiError, HealthResponse with exact field names from TechArch (id, name, vintage, varietal, quantity, location, created_at)
- `app/api/health/route.ts` exports `GET` that returns `NextResponse.json({ status: 'ok' })` with no database import
  </done>
</task>

<task type="auto">
  <name>Task 2: Bottles collection route — GET (list+search) and POST (create)</name>
  <files>
    app/api/bottles/route.ts
  </files>
  <action>
Create `app/api/bottles/route.ts` implementing GET /api/bottles (list + ILIKE search) and POST /api/bottles (create with full validation).

Create parent directory `app/api/bottles/` if not already present.

**Full implementation (from FRD F05, TechArch §4 API Design, RTM §4 F5):**

```typescript
// app/api/bottles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../lib/db';
import type { Bottle, CreateBottleRequest } from '../../types/bottle';

// ─── GET /api/bottles ─────────────────────────────────────────────────────────
// Returns all bottles newest-first. Optional ?q= performs ILIKE name filter.
// SQL (no filter): SELECT * FROM bottles ORDER BY created_at DESC
// SQL (filter):    SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC
//                 $1 = '%' + q.trim() + '%'  (max 500 chars, parameterised — never interpolated)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get('q') ?? '';
    const q = rawQ.trim().slice(0, 500); // cap at 500 chars per FRD F04-REQ-08

    let result;
    if (q.length > 0) {
      // Parameterised ILIKE — never string interpolation (FRD security requirement)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC',
        [`%${q}%`]
      );
    } else {
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles ORDER BY created_at DESC'
      );
    }

    return NextResponse.json(result.rows, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/bottles ────────────────────────────────────────────────────────
// Creates a new bottle. Validates all fields server-side before any SQL.
// On success: 201 with created Bottle object.
// Error codes: 400 (bad JSON), 422 (validation), 500 (DB failure)
export async function POST(request: NextRequest): Promise<NextResponse> {
  // JSON parse guard — malformed body → 400
  let body: CreateBottleRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Validation (from FRD F05, TechArch §4 Validation Rules Summary) ─────────
  const { name, vintage, varietal, quantity, location } = body;

  // name: required, non-empty string after trim, max 255
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 });
  }
  if (name.trim().length > 255) {
    return NextResponse.json(
      { error: 'Name must be 255 characters or fewer' },
      { status: 422 }
    );
  }

  // vintage: optional; if provided must be integer in [1800, currentYear+1]
  if (vintage !== undefined && vintage !== null) {
    if (!Number.isInteger(vintage)) {
      return NextResponse.json(
        { error: 'Vintage must be a valid year' },
        { status: 422 }
      );
    }
    const maxYear = new Date().getFullYear() + 1;
    if (vintage < 1800 || vintage > maxYear) {
      return NextResponse.json(
        { error: `Vintage must be between 1800 and ${maxYear}` },
        { status: 422 }
      );
    }
  }

  // varietal: optional; max 255 chars
  if (varietal !== undefined && varietal !== null) {
    if (typeof varietal !== 'string' || varietal.length > 255) {
      return NextResponse.json(
        { error: 'Varietal must be 255 characters or fewer' },
        { status: 422 }
      );
    }
  }

  // quantity (POST): optional; if provided must be integer >= 1; defaults to 1
  // POST requires >= 1 (not 0 — that is only allowed on PUT per FRD F02 note)
  const resolvedQty = quantity ?? 1;
  if (!Number.isInteger(resolvedQty)) {
    return NextResponse.json(
      { error: 'Quantity must be a whole number' },
      { status: 422 }
    );
  }
  if (resolvedQty < 1) {
    return NextResponse.json(
      { error: 'Quantity must be at least 1' },
      { status: 422 }
    );
  }

  // location: optional; max 500 chars
  if (location !== undefined && location !== null) {
    if (typeof location !== 'string' || location.length > 500) {
      return NextResponse.json(
        { error: 'Location must be 500 characters or fewer' },
        { status: 422 }
      );
    }
  }

  // ── Insert ───────────────────────────────────────────────────────────────────
  // SQL from TechArch §3 Query Patterns "Insert new bottle" — copy verbatim:
  // INSERT INTO bottles (name, vintage, varietal, quantity, location)
  // VALUES ($1, $2, $3, $4, $5)
  // RETURNING *;
  // $1=name, $2=vintage|null, $3=varietal|null, $4=quantity(default 1), $5=location|null
  try {
    const result = await pool.query<Bottle>(
      `INSERT INTO bottles (name, vintage, varietal, quantity, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        vintage ?? null,
        (varietal?.trim() || null) ?? null,
        resolvedQty,
        (location?.trim() || null) ?? null,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Critical constraints to verify before completing:**
- Import path for pool: `../../lib/db` (from `app/api/bottles/` — two levels up to reach `lib/`)
- Import path for types: `../../types/bottle`
- `quantity` POST validation: `>= 1` (NOT `>= 0` — that is PUT-only; POST with `quantity=0` → 422)
- All SQL uses parameterised `$N` placeholders — NO string interpolation
- `q` search term is capped at 500 chars before SQL (FRD F04-REQ-08)
- `varietal` and `location` blank strings are stored as `null` (`.trim() || null`)
  </action>
  <verify>
```bash
# Export signatures present
grep -n 'export async function GET' app/api/bottles/route.ts && echo "GET export OK"
grep -n 'export async function POST' app/api/bottles/route.ts && echo "POST export OK"

# Pool import from wave 1 artifact
grep -n "import pool from" app/api/bottles/route.ts && echo "Pool import OK"

# ILIKE parameterised (not interpolated)
grep -n 'ILIKE \$1' app/api/bottles/route.ts && echo "ILIKE parameterised OK"

# INSERT uses RETURNING *
grep -n 'RETURNING \*' app/api/bottles/route.ts && echo "INSERT RETURNING OK"

# Validation: name required, quantity >= 1 for POST
grep -n 'Name is required' app/api/bottles/route.ts && echo "Name validation OK"
grep -n 'Quantity must be at least 1' app/api/bottles/route.ts && echo "Quantity>=1 validation OK"

# Invalid JSON → 400
grep -n 'Invalid JSON' app/api/bottles/route.ts && echo "JSON error 400 OK"

# No string interpolation in SQL
grep -n "ILIKE.*\`" app/api/bottles/route.ts && echo "WARNING: string interpolation in SQL" || echo "No SQL interpolation OK"
```
  </verify>
  <done>
- `app/api/bottles/route.ts` exports `GET` and `POST`
- `GET` with no `?q=` returns all bottles ordered by `created_at DESC`
- `GET` with `?q=term` runs ILIKE `'%term%'` filter (parameterised, capped at 500 chars)
- `POST` validates: name non-empty (422), vintage integer in range (422), quantity integer >= 1 (422), malformed JSON (400)
- `POST` inserts row using exact DDL params and returns `201` with created Bottle object (`RETURNING *`)
- Pool imported from `../../lib/db` (wave 1 artifact); types imported from `../../types/bottle`
- All SQL uses `$N` placeholders — no string interpolation
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

```bash
# Contract checks — wave 1 artifacts consumed
grep -n 'export default pool' lib/db.ts && echo "CONTRACT: lib/db.ts OK"
grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo "CONTRACT: migrate.mjs OK"

# Wave 2 provides
grep -n 'export async function GET' app/api/health/route.ts && echo "HEALTH GET OK"
grep -n 'export async function GET' app/api/bottles/route.ts && echo "BOTTLES GET OK"
grep -n 'export async function POST' app/api/bottles/route.ts && echo "BOTTLES POST OK"
grep -n 'interface Bottle' types/bottle.ts && echo "Bottle interface OK"
grep -n 'interface CreateBottleRequest' types/bottle.ts && echo "CreateBottleRequest OK"

# Health endpoint has no DB import
grep 'pool\|db\.ts' app/api/health/route.ts 2>/dev/null && echo "WARNING: DB in health" || echo "Health is DB-free OK"

# Bottles route uses pool (from wave 1 lib/db.ts)
grep -n 'import pool from' app/api/bottles/route.ts && echo "Pool import OK"

# Validation error messages match FRD F05 exact strings
grep -n '"Name is required"' app/api/bottles/route.ts && echo "422 name msg OK"
grep -n '"Quantity must be at least 1"' app/api/bottles/route.ts && echo "422 qty msg OK"
grep -n '"Invalid JSON"' app/api/bottles/route.ts && echo "400 json msg OK"
grep -n '"Internal server error"' app/api/bottles/route.ts && echo "500 msg OK"

# No Dockerfile or docker-compose created
ls Dockerfile 2>/dev/null && echo "ERROR: Dockerfile found" || echo "No Dockerfile OK"
ls docker-compose.yml 2>/dev/null && echo "ERROR: docker-compose found" || echo "No docker-compose OK"
```
</verification>

<success_criteria>
- `GET /api/health` returns `200 {"status":"ok"}` with no database call (verifiable by absence of pool import)
- `GET /api/bottles` returns `200` with JSON array of Bottle objects ordered newest-first
- `GET /api/bottles?q=term` returns `200` with filtered array using parameterised ILIKE (never string interpolation)
- `POST /api/bottles` with `{name:"Test"}` returns `201` with Bottle object containing `id`, `created_at`, `quantity: 1`
- `POST /api/bottles` with missing/blank name returns `422 {"error":"Name is required"}`
- `POST /api/bottles` with `{name:"Test", quantity: 0}` returns `422 {"error":"Quantity must be at least 1"}`
- `POST /api/bottles` with malformed JSON body returns `400 {"error":"Invalid JSON"}`
- `types/bottle.ts` exports interfaces: Bottle (7 fields matching TechArch), CreateBottleRequest, UpdateBottleRequest, ApiError, HealthResponse
- All SQL uses `$N` parameterised placeholders; no template literals in SQL strings
- No Dockerfile or docker-compose artefacts created
</success_criteria>

<output>
After completion, create `.planning/express/cellarlite-full-implementation-next-js-1/02-SUMMARY.md` with:
- What was built (health route, bottles collection route, type interfaces)
- File paths created
- Key implementation decisions (import paths, validation logic, null handling)
- Any deviations from spec (flag conflicts, do NOT silently diverge)

Wave 3 (frontend) consumes:
- `GET /api/health` — K8s liveness probe (no dependencies)
- `GET /api/bottles` — list page server-side data fetch
- `GET /api/bottles?q=term` — search/filter (F04)
- `POST /api/bottles` — add-bottle form submission (F01)
- `types/bottle.ts` — shared Bottle interface for pages and components
</output>
