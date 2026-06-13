---

## REST API Catalog

**Base path:** `/api`
**Format:** All requests and responses use `Content-Type: application/json`
**Authentication:** None required
**Implementation:** Next.js App Router Route Handlers (`app/api/.../route.ts`)

---

### GET /api/health

**Purpose:** Kubernetes liveness probe. Confirms the Next.js process is running.

**Request:**
- Method: `GET`
- Path: `/api/health`
- Query params: none
- Body: none

**Response — 200 OK:**
```json
{ "status": "ok" }
```

**Notes:** No database call. Always returns 200 while the process is alive.

---

### GET /api/bottles

**Purpose:** List all bottles. Supports optional name search.

**Request:**
- Method: `GET`
- Path: `/api/bottles`
- Query params:
  - `q` (string, optional): Case-insensitive partial name filter. Absent or empty = return all.

**Response — 200 OK:**
```json
[
  {
    "id": 1,
    "name": "Château Margaux",
    "vintage": 2018,
    "varietal": "Bordeaux Blend",
    "quantity": 3,
    "location": "Rack A, shelf 2",
    "created_at": "2026-06-13T10:00:00.000Z"
  }
]
```
Returns empty array `[]` when no bottles exist or no bottles match the search.

**SQL (no filter):** `SELECT * FROM bottles ORDER BY created_at DESC`
**SQL (with filter):** `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `$1 = '%q%'`

**Error responses:**
- `500 {"error":"Internal server error"}` — database failure

---

### POST /api/bottles

**Purpose:** Create a new bottle record.

**Request:**
- Method: `POST`
- Path: `/api/bottles`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "name": "Château Margaux",
  "vintage": 2018,
  "varietal": "Bordeaux Blend",
  "quantity": 3,
  "location": "Rack A, shelf 2"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | **Yes** | Non-empty after trim. Max 255 chars. |
| `vintage` | integer \| null | No | Year in `[1800, currentYear+1]`. |
| `varietal` | string \| null | No | Max 255 chars. |
| `quantity` | integer | No | ≥ 1. Defaults to `1` if absent. |
| `location` | string \| null | No | Max 500 chars. |

**Response — 201 Created:**
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

**Error responses:**
- `400 {"error":"Invalid JSON"}` — malformed request body
- `422 {"error":"Name is required"}` — name blank/missing
- `422 {"error":"Vintage must be a valid year"}` — vintage not integer
- `422 {"error":"Vintage must be between 1800 and YYYY"}` — vintage out of range
- `422 {"error":"Quantity must be at least 1"}` — quantity < 1
- `500 {"error":"Internal server error"}` — database failure

---

### GET /api/bottles/[id]

**Purpose:** Fetch a single bottle by primary key.

**Request:**
- Method: `GET`
- Path: `/api/bottles/:id` (e.g. `/api/bottles/42`)
- Path params: `id` — positive integer

**Response — 200 OK:**
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

**Error responses:**
- `404 {"error":"Not found"}` — id not in DB, or id not a valid integer
- `500 {"error":"Internal server error"}` — database failure

---

### PUT /api/bottles/[id]

**Purpose:** Update an existing bottle's fields (full replacement of all editable fields).

**Request:**
- Method: `PUT`
- Path: `/api/bottles/:id`
- Headers: `Content-Type: application/json`
- Body: same shape as POST, with `quantity` allowed to be `0`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | **Yes** | Non-empty after trim. Max 255 chars. |
| `vintage` | integer \| null | No | Year in `[1800, currentYear+1]`. |
| `varietal` | string \| null | No | Max 255 chars. |
| `quantity` | integer | No | ≥ **0** (PUT allows finished bottles). Preserved at current DB value if absent. |
| `location` | string \| null | No | Max 500 chars. |

**Response — 200 OK:** Updated bottle object (same shape as GET response).

**Error responses:**
- `400 {"error":"Invalid JSON"}` — malformed body
- `404 {"error":"Not found"}` — id not found or invalid
- `422 {"error":"Name is required"}` — name blank
- `422 {"error":"Vintage must be a valid year"}` — invalid vintage
- `422 {"error":"Quantity cannot be negative"}` — quantity < 0
- `500 {"error":"Internal server error"}` — database failure

---

### DELETE /api/bottles/[id]

**Purpose:** Permanently delete a bottle record.

**Request:**
- Method: `DELETE`
- Path: `/api/bottles/:id`
- Body: none

**Response — 204 No Content:** Empty body.

**Error responses:**
- `404 {"error":"Not found"}` — id not found or invalid
- `500 {"error":"Internal server error"}` — database failure

---

### Common Response Headers

All API route handlers must **not** set `X-Frame-Options: DENY`. They should emit no CSP header with `frame-ancestors 'none'`. Next.js defaults are overridden in `next.config.mjs` (see F07).

---
