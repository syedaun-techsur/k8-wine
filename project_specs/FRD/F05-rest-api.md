---

## F05: REST API

**Priority:** P0 — Critical (all UI depends on API)
**Routes:** `/api/health`, `/api/bottles`, `/api/bottles/[id]`
**PRD Reference:** F5

---

**Description:** A complete RESTful JSON API that backs all UI interactions and is independently usable for scripting or future integrations. Implemented as Next.js App Router Route Handlers (`app/api/.../route.ts`). All endpoints return `Content-Type: application/json`, use standard HTTP status codes, and require no authentication headers.

---

**Terminology:**

- **Route Handler:** Next.js App Router file at `app/api/.../route.ts` exporting named async functions (`GET`, `POST`, `PUT`, `DELETE`).
- **Liveness probe:** K8s mechanism that calls `GET /api/health` to determine if the container is alive.
- **204 No Content:** Successful response with no response body (used for DELETE).
- **422 Unprocessable Entity:** Validation failure — request was well-formed JSON but failed business rules.

---

**Sub-features:**

- Health check endpoint (`GET /api/health`)
- List bottles (`GET /api/bottles`)
- Create bottle (`POST /api/bottles`)
- Get single bottle (`GET /api/bottles/[id]`)
- Update bottle (`PUT /api/bottles/[id]`)
- Delete bottle (`DELETE /api/bottles/[id]`)

---

**Process (per endpoint):**

### GET /api/health
1. Return `200 {"status":"ok"}` immediately.
2. No database call required (liveness check only).

### GET /api/bottles
1. Read optional `q` from URL search params.
2. If `q` absent or blank: `SELECT * FROM bottles ORDER BY created_at DESC`.
3. If `q` non-empty: `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `'%' + q.trim() + '%'`.
4. Return `200` with JSON array of bottle objects.

### POST /api/bottles
1. Parse JSON request body.
2. Validate fields (see Validation section below).
3. On validation failure: return `422 {"error":"<message>"}`.
4. Execute `INSERT INTO bottles (name, vintage, varietal, quantity, location) VALUES ($1, $2, $3, $4, $5) RETURNING *`.
5. Return `201` with the created bottle object.

### GET /api/bottles/[id]
1. Parse `id` from URL path. If not a valid positive integer → `404 {"error":"Not found"}`.
2. Execute `SELECT * FROM bottles WHERE id = $1`.
3. If no row returned → `404 {"error":"Not found"}`.
4. Return `200` with bottle object.

### PUT /api/bottles/[id]
1. Parse `id` from URL path. If not valid positive integer → `404 {"error":"Not found"}`.
2. Parse JSON request body.
3. Validate fields (same rules as POST, except `quantity` may be `0`).
4. On validation failure: return `422 {"error":"<message>"}`.
5. Execute `UPDATE bottles SET name=$1, vintage=$2, varietal=$3, quantity=$4, location=$5 WHERE id=$6 RETURNING *`.
6. If no row returned (id not found) → `404 {"error":"Not found"}`.
7. Return `200` with updated bottle object.

### DELETE /api/bottles/[id]
1. Parse `id` from URL path. If not valid positive integer → `404 {"error":"Not found"}`.
2. Execute `DELETE FROM bottles WHERE id = $1 RETURNING id`.
3. If no row returned → `404 {"error":"Not found"}`.
4. Return `204` with no response body.

---

**Inputs — POST /api/bottles (request body):**

- `name` (string, **required**): Non-empty after trim. Max 255 chars.
- `vintage` (integer | null, optional): Year in `[1800, currentYear+1]`.
- `varietal` (string | null, optional): Max 255 chars.
- `quantity` (integer, optional): ≥ 1. Defaults to `1`.
- `location` (string | null, optional): Max 500 chars.

**Inputs — PUT /api/bottles/[id] (request body):**

Same as POST except `quantity` may be `0` (record a "finished" bottle).

---

**Outputs — bottle object shape (all read endpoints):**

```json
{
  "id": 42,
  "name": "Château Margaux",
  "vintage": 2018,
  "varietal": "Bordeaux Blend",
  "quantity": 3,
  "location": "Rack A, shelf 2",
  "created_at": "2026-06-13T10:00:00.000Z"
}
```

- `vintage`, `varietal`, `location` are `null` when not set.
- `created_at` is ISO 8601 UTC string.

---

**Validation Rules (server-side, all mutating endpoints):**

- `name`: Required; `typeof === 'string'`; `trim().length > 0`; max 255.
- `vintage`: If present and non-null: must be integer; `Number.isInteger(v) && v >= 1800 && v <= currentYear + 1`.
- `varietal`: If present and non-null: must be string; max 255.
- `quantity` (POST): If present: must be integer ≥ 1.
- `quantity` (PUT): If present: must be integer ≥ 0.
- `location`: If present and non-null: must be string; max 500.
- Extra fields in request body are ignored (no strict schema enforcement beyond listed fields).

---

**Error States:**

| Scenario | HTTP Status | Body |
|----------|-------------|------|
| `name` missing or blank | 422 | `{"error":"Name is required"}` |
| `vintage` non-integer | 422 | `{"error":"Vintage must be a valid year"}` |
| `vintage` out of range | 422 | `{"error":"Vintage must be between 1800 and YYYY"}` |
| `quantity` < 1 (POST) | 422 | `{"error":"Quantity must be at least 1"}` |
| `quantity` < 0 (PUT) | 422 | `{"error":"Quantity cannot be negative"}` |
| ID not found | 404 | `{"error":"Not found"}` |
| ID not a valid integer | 404 | `{"error":"Not found"}` |
| Invalid JSON body | 400 | `{"error":"Invalid JSON"}` |
| Database / unexpected error | 500 | `{"error":"Internal server error"}` |

---

**API Surface (this feature):** This feature **is** the API — full spec in `Y1-api.md`.

**Schema Surface (this feature):** All endpoints read/write `bottles` table — see `Y0-schema.md`.

---
