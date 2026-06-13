---
phase: cellarlite-full-implementation-next-js-1
plan: 03
type: execute
wave: 2
depends_on: [1]
files_modified:
  - app/api/bottles/[id]/route.ts
autonomous: true

features:
  implements: ["F5"]
  depends_on: ["F6"]
  enables: ["F2", "F3"]

must_haves:
  truths:
    - "GET /api/bottles/[id] returns 200 with bottle object when id exists"
    - "GET /api/bottles/[id] returns 404 {\"error\":\"Not found\"} when id is not in DB"
    - "GET /api/bottles/[id] returns 404 {\"error\":\"Not found\"} when id is not a valid positive integer (e.g. 'abc', '0', '-1')"
    - "PUT /api/bottles/[id] returns 200 with updated bottle when all fields valid"
    - "PUT /api/bottles/[id] returns 404 when id not found or invalid"
    - "PUT /api/bottles/[id] returns 422 {\"error\":\"Name is required\"} when name blank"
    - "PUT /api/bottles/[id] returns 422 {\"error\":\"Quantity cannot be negative\"} when quantity < 0"
    - "PUT /api/bottles/[id] allows quantity=0 (finished bottle)"
    - "PUT /api/bottles/[id] performs full replacement — absent optional fields stored as NULL"
    - "DELETE /api/bottles/[id] returns 204 with empty body when id exists"
    - "DELETE /api/bottles/[id] returns 404 {\"error\":\"Not found\"} when id not found or invalid"
  artifacts:
    - path: "app/api/bottles/[id]/route.ts"
      provides: "GET, PUT, DELETE handlers for single bottle"
      exports: ["GET", "PUT", "DELETE"]
      min_lines: 80
  key_links:
    - from: "app/api/bottles/[id]/route.ts"
      to: "lib/db.ts"
      via: "import pool from '@/lib/db'"
      pattern: "import pool from"
    - from: "app/api/bottles/[id]/route.ts"
      to: "PostgreSQL bottles table"
      via: "pool.query parameterised SQL"
      pattern: "pool\\.query"

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
    - artifact: "app/api/bottles/[id]/route.ts"
      exports: ["GET", "PUT", "DELETE"]
      shape: |
        GET  /api/bottles/:id  → 200 Bottle | 404 {"error":"Not found"} | 500
        PUT  /api/bottles/:id  → 200 Bottle | 400 | 404 | 422 | 500
        DELETE /api/bottles/:id → 204 (empty) | 404 {"error":"Not found"} | 500
      verify: "grep -n 'export async function GET' app/api/bottles/\\[id\\]/route.ts && grep -n 'export async function PUT' app/api/bottles/\\[id\\]/route.ts && grep -n 'export async function DELETE' app/api/bottles/\\[id\\]/route.ts && echo CONTRACT_OK"
---

<objective>
Implement the three single-bottle REST API endpoints: GET /api/bottles/[id], PUT /api/bottles/[id], and DELETE /api/bottles/[id] in a single Next.js App Router Route Handler file.

Purpose: These endpoints back the edit page (F2) and delete flow (F3). Wave 3 frontend tasks require all three to be correct and available.

Output:
- `app/api/bottles/[id]/route.ts` — exports `GET`, `PUT`, `DELETE` named async functions with full validation, parameterised SQL, and correct HTTP status codes per TechArch §4 and FRD §F05.
</objective>

<feature_dependencies>
Implements: F5: REST API — specifically GET /api/bottles/[id] (F05-REQ-04), PUT /api/bottles/[id] (F05-REQ-05), DELETE /api/bottles/[id] (F05-REQ-06)
Depends on: F6: Database Auto-Migration (lib/db.ts Pool singleton, bottles table from wave 1 plan 01)
Enables: F2: Edit Bottle Page (reads GET, submits PUT), F3: Delete Bottle (submits DELETE)
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
  <name>Task 1: Create app/api/bottles/[id]/route.ts — GET, PUT, DELETE single bottle</name>
  <files>
    app/api/bottles/[id]/route.ts
  </files>
  <action>
Create `app/api/bottles/[id]/route.ts` — the Next.js App Router Route Handler for GET, PUT, and DELETE on a single bottle.

**Directory:** Create `app/api/bottles/[id]/` if it doesn't exist. The bracket in the directory name is literal: `[id]`.

**Imports required:**
```typescript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
```

---

### ID Validation Helper

All three handlers need this check (from TechArch §4 Validation Rules Summary):

```typescript
// id path param must parse as a positive integer via parseInt(id, 10).
// NaN, 0, or negative → 404 Not found.
function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0) return null;
  return n;
}
```

---

### TypeScript Interfaces (from TechArch §4 TypeScript Interfaces — copy verbatim)

```typescript
interface Bottle {
  id: number;
  name: string;
  vintage: number | null;
  varietal: string | null;
  quantity: number;
  location: string | null;
  created_at: string;       // ISO 8601 UTC string
}

interface UpdateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 0 (0 = finished bottle)
  location?: string | null; // Optional; max 500 chars
}
```

---

### GET /api/bottles/[id]

From TechArch §4 endpoint reference and FRD §F05 GET /api/bottles/[id]:

**Process:**
1. Parse `id` from URL path. If not a valid positive integer → `404 {"error":"Not found"}`.
2. Execute `SELECT * FROM bottles WHERE id = $1`.
3. If no row returned → `404 {"error":"Not found"}`.
4. Return `200` with bottle object.

**SQL (exact from TechArch §3):** `SELECT * FROM bottles WHERE id = $1`

```typescript
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const result = await pool.query<Bottle>(
      'SELECT * FROM bottles WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### PUT /api/bottles/[id]

From TechArch §4 endpoint reference and FRD §F05 PUT /api/bottles/[id]:

**Process:**
1. Parse `id` from URL path. If not valid positive integer → `404 {"error":"Not found"}`.
2. Parse JSON request body. Malformed JSON → `400 {"error":"Invalid JSON"}`.
3. Validate fields — rules for PUT (from TechArch §4 Validation Rules Summary):
   - `name`: Required; non-empty string after `trim()`; max 255 chars
   - `vintage`: If present and non-null: must be integer; `Number.isInteger(v) && v >= 1800 && v <= currentYear + 1`
   - `varietal`: If present and non-null: must be string; max 255 chars
   - `quantity`: If present: must be integer ≥ **0** (PUT allows finished bottles — 0 is valid; POST requires ≥ 1)
   - `location`: If present and non-null: must be string; max 500 chars
4. On validation failure → `422 {"error":"<message>"}` with exact error messages from FRD error catalog.
5. Execute UPDATE SQL. If no row returned (id not found) → `404 {"error":"Not found"}`.
6. Return `200` with updated bottle object.

**Full replacement semantics (from FRD §F05):** PUT performs a full column replacement. Optional fields absent from the request body (or explicitly `null`) overwrite the existing DB value with `NULL`. The SQL always sets all 5 editable columns.

**SQL (exact from TechArch §3):**
```sql
UPDATE bottles
SET name = $1, vintage = $2, varietal = $3, quantity = $4, location = $5
WHERE id = $6
RETURNING *;
```

**Exact error messages (from FRD Cross-Feature Error Catalog / Validation Errors 422):**
- `name` missing or blank → `"Name is required"`
- `vintage` non-integer → `"Vintage must be a valid year"`
- `vintage` out of range → `"Vintage must be between 1800 and YYYY"` (where YYYY = `new Date().getFullYear() + 1`)
- `quantity` < 0 (PUT) → `"Quantity cannot be negative"`
- `quantity` not integer (PUT) → `"Quantity must be a whole number"`

```typescript
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: UpdateBottleRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 });
  }
  if (body.name.trim().length > 255) {
    return NextResponse.json({ error: 'Name must be 255 characters or fewer' }, { status: 422 });
  }

  // Validate vintage
  const currentYear = new Date().getFullYear();
  if (body.vintage !== undefined && body.vintage !== null) {
    if (!Number.isInteger(body.vintage)) {
      return NextResponse.json({ error: 'Vintage must be a valid year' }, { status: 422 });
    }
    if (body.vintage < 1800 || body.vintage > currentYear + 1) {
      return NextResponse.json(
        { error: `Vintage must be between 1800 and ${currentYear + 1}` },
        { status: 422 }
      );
    }
  }

  // Validate varietal
  if (body.varietal !== undefined && body.varietal !== null) {
    if (typeof body.varietal !== 'string') {
      return NextResponse.json({ error: 'Varietal must be a string' }, { status: 422 });
    }
    if (body.varietal.length > 255) {
      return NextResponse.json({ error: 'Varietal must be 255 characters or fewer' }, { status: 422 });
    }
  }

  // Validate quantity — PUT allows 0 (finished bottle), rejects negative, rejects non-integer
  if (body.quantity !== undefined && body.quantity !== null) {
    if (!Number.isInteger(body.quantity)) {
      return NextResponse.json({ error: 'Quantity must be a whole number' }, { status: 422 });
    }
    if (body.quantity < 0) {
      return NextResponse.json({ error: 'Quantity cannot be negative' }, { status: 422 });
    }
  }

  // Validate location
  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== 'string') {
      return NextResponse.json({ error: 'Location must be a string' }, { status: 422 });
    }
    if (body.location.length > 500) {
      return NextResponse.json({ error: 'Location must be 500 characters or fewer' }, { status: 422 });
    }
  }

  // Full replacement: absent optional fields → NULL
  const name = body.name.trim();
  const vintage = body.vintage ?? null;
  const varietal = (body.varietal !== undefined && body.varietal !== null && body.varietal.trim() !== '')
    ? body.varietal.trim()
    : null;
  const quantity = body.quantity ?? null;
  const location = (body.location !== undefined && body.location !== null && body.location.trim() !== '')
    ? body.location.trim()
    : null;

  try {
    const result = await pool.query<Bottle>(
      `UPDATE bottles
       SET name = $1, vintage = $2, varietal = $3, quantity = $4, location = $5
       WHERE id = $6
       RETURNING *`,
      [name, vintage, varietal, quantity, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**IMPORTANT NOTE on quantity NULL:** The `bottles.quantity` column is `NOT NULL DEFAULT 1` in the DB schema. If the PUT body sends `quantity: null` or omits `quantity`, the full-replacement semantics say "overwrite with NULL" — but the DB column is NOT NULL. This is a spec tension. Resolution per spec priority (FRD wins over ambiguity): if `quantity` is absent or null in PUT body, treat it as `null` in the SQL — PostgreSQL will raise a NOT NULL violation which is caught as a 500. The edit form must always send the current quantity value (FRD §F02 states "The edit form must always include all current field values in the request body"). So in practice, quantity will always be present. Implement as described — pass `body.quantity ?? null` and let DB enforce the constraint if violated.

---

### DELETE /api/bottles/[id]

From TechArch §4 endpoint reference and FRD §F05 DELETE /api/bottles/[id]:

**Process:**
1. Parse `id` from URL path. If not valid positive integer → `404 {"error":"Not found"}`.
2. Execute `DELETE FROM bottles WHERE id = $1 RETURNING id`.
3. If no row returned → `404 {"error":"Not found"}`.
4. Return `204` with no response body.

**SQL (exact from TechArch §3):** `DELETE FROM bottles WHERE id = $1 RETURNING id`

**CRITICAL:** 204 must have an empty body — do NOT use `NextResponse.json()` for success; return `new Response(null, { status: 204 })`.

```typescript
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const result = await pool.query(
      'DELETE FROM bottles WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

**Complete file structure:** Assemble all the above into a single file `app/api/bottles/[id]/route.ts` in this order:
1. `'use server'` — NOT needed for Route Handlers; do NOT add it
2. Imports (`NextResponse`, `pool`)
3. `parseId` helper
4. Type interfaces (`Bottle`, `UpdateBottleRequest`)
5. `export async function GET`
6. `export async function PUT`
7. `export async function DELETE`

Do NOT add `'use client'` or `'use server'` directives — Route Handlers are server-side by default in Next.js App Router.
  </action>
  <verify>
```bash
# Verify file exists
ls app/api/bottles/\[id\]/route.ts && echo "FILE EXISTS OK"

# Verify all three exports present
grep -n 'export async function GET' app/api/bottles/\[id\]/route.ts && echo "GET EXPORT OK"
grep -n 'export async function PUT' app/api/bottles/\[id\]/route.ts && echo "PUT EXPORT OK"
grep -n 'export async function DELETE' app/api/bottles/\[id\]/route.ts && echo "DELETE EXPORT OK"

# Verify imports lib/db
grep -n "import pool from" app/api/bottles/\[id\]/route.ts && echo "POOL IMPORT OK"

# Verify SQL patterns (parameterised, no string interpolation)
grep -n 'SELECT \* FROM bottles WHERE id' app/api/bottles/\[id\]/route.ts && echo "GET SQL OK"
grep -n 'UPDATE bottles' app/api/bottles/\[id\]/route.ts && echo "PUT SQL OK"
grep -n 'DELETE FROM bottles WHERE id' app/api/bottles/\[id\]/route.ts && echo "DELETE SQL OK"
grep -n 'RETURNING \*' app/api/bottles/\[id\]/route.ts && echo "RETURNING OK"

# Verify 204 returns empty body (not NextResponse.json)
grep -n 'new Response(null' app/api/bottles/\[id\]/route.ts && echo "204 EMPTY BODY OK"

# Verify no string interpolation into SQL (security check)
grep -n '\`.*\$\{' app/api/bottles/\[id\]/route.ts | grep -v '//\|error\|currentYear\|status\|message' && echo "WARNING: possible SQL injection" || echo "NO STRING INTERPOLATION IN SQL OK"

# Verify error messages match spec exactly
grep -n '"Not found"' app/api/bottles/\[id\]/route.ts && echo "NOT FOUND MSG OK"
grep -n '"Name is required"' app/api/bottles/\[id\]/route.ts && echo "NAME REQUIRED MSG OK"
grep -n '"Quantity cannot be negative"' app/api/bottles/\[id\]/route.ts && echo "QUANTITY NEG MSG OK"
grep -n '"Invalid JSON"' app/api/bottles/\[id\]/route.ts && echo "INVALID JSON MSG OK"
grep -n '"Internal server error"' app/api/bottles/\[id\]/route.ts && echo "500 MSG OK"

# Verify integration contract from wave 1 is satisfied
grep -n 'export default pool' lib/db.ts && echo "CONTRACT_OK"
```
  </verify>
  <done>
- `app/api/bottles/[id]/route.ts` exists and exports `GET`, `PUT`, `DELETE`
- `GET /api/bottles/:id`: returns 200 + bottle object when found; 404 `{"error":"Not found"}` when id invalid or not in DB; 500 on DB error
- `PUT /api/bottles/:id`: returns 200 + updated bottle on success; 400 on malformed JSON; 404 on invalid/missing id; 422 with exact spec error messages on validation failure; 500 on DB error; performs full column replacement; allows quantity=0
- `DELETE /api/bottles/:id`: returns 204 with empty body on success; 404 on invalid/missing id; 500 on DB error
- All SQL uses parameterised `$1`…`$N` placeholders — no string interpolation
- `parseId` rejects NaN, 0, and negative values → 404
- File imports `pool` from `@/lib/db` (wave 1 contract satisfied)
  </done>
</task>

</tasks>

<verification>
After task completes:

```bash
# 1. All three exports present in the route handler
grep -c 'export async function' app/api/bottles/\[id\]/route.ts | grep -q 3 && echo "3 EXPORTS OK" || echo "EXPORT COUNT: $(grep -c 'export async function' app/api/bottles/\[id\]/route.ts)"

# 2. 204 response uses empty body
grep -n 'new Response(null.*204' app/api/bottles/\[id\]/route.ts && echo "204 EMPTY BODY OK"

# 3. Wave 1 contracts still satisfied
grep -n 'export default pool' lib/db.ts && echo "DB CONTRACT OK"
grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo "MIGRATION CONTRACT OK"

# 4. Wave 2 contract provided by this plan
grep -n 'export async function GET' app/api/bottles/\[id\]/route.ts && \
grep -n 'export async function PUT' app/api/bottles/\[id\]/route.ts && \
grep -n 'export async function DELETE' app/api/bottles/\[id\]/route.ts && echo "CONTRACT_OK"

# 5. TypeScript compilation check (no DB needed)
npx tsc --noEmit 2>&1 | head -20 && echo "TSC OK"
```
</verification>

<success_criteria>
- `app/api/bottles/[id]/route.ts` exports `GET`, `PUT`, `DELETE` named async functions
- GET: 200 + Bottle | 404 (invalid id or not in DB) | 500
- PUT: 200 + updated Bottle (full replacement) | 400 (malformed JSON) | 404 (invalid id or not found) | 422 (validation) | 500; allows quantity=0; rejects quantity<0; requires name
- DELETE: 204 empty body (via `new Response(null, { status: 204 })`) | 404 | 500
- All SQL uses `$1`…`$N` parameterised placeholders — zero string interpolation
- `parseId` helper rejects NaN, 0, negative → 404 for all three handlers
- Error message strings match FRD error catalog exactly: `"Not found"`, `"Name is required"`, `"Quantity cannot be negative"`, `"Vintage must be a valid year"`, `"Invalid JSON"`, `"Internal server error"`
- Imports `pool` from `@/lib/db` (wave 1 provides contract)
- No `'use client'` or `'use server'` directive in Route Handler file
</success_criteria>

<output>
After completion, wave 2B provides:
- `app/api/bottles/[id]/route.ts` — GET/PUT/DELETE for single bottle (consumed by wave 3 edit page and delete flow)

Wave 3 (frontend) can proceed: edit page (`app/bottles/[id]/edit/page.tsx`) calls GET to pre-populate form, PUT to save changes, and DELETE to remove the bottle.
</output>
