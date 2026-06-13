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
---

## F00: Bottle List Page

**Priority:** P0 — Critical (MVP landing experience)
**Route:** `GET /` (Next.js App Router page)
**PRD Reference:** F0

---

**Description:** The home page is the user's primary daily-use screen. It server-renders the complete wine collection as a scrollable, mobile-friendly list. Each row shows the bottle's name, vintage, varietal, current quantity, and storage location. When the collection is empty a friendly empty-state message and a prominent "Add bottle" call-to-action are displayed. A search input at the top allows filtering by name (see F04 for search behaviour).

---

**Terminology:**

- **Empty state:** The UI shown when `bottles` table has zero rows (or zero rows match the active search term).
- **Bottle card/row:** The visual unit representing one bottle record in the list.
- **CTA:** Call-to-action button ("Add bottle") that navigates to `/bottles/new`.

---

**Sub-features:**

- Server-side data fetch on every page load
- Bottle list rendering (full collection)
- Empty-state rendering
- Per-row navigation to edit page
- "Add bottle" navigation button
- Search input (UI shell — logic specified in F04)

---

**Process:**

1. Browser requests `GET /`.
2. Next.js Server Component runs; it executes `SELECT * FROM bottles ORDER BY created_at DESC` (optionally filtered — see F04).
3. If rows returned → render list of bottle cards/rows.
4. If zero rows (no active search) → render empty-state UI: message "No bottles yet" + "Add bottle" button.
5. If zero rows (active search term present) → render search-empty state: message "No bottles match '<term>'" (see F04).
6. Page is returned as fully server-rendered HTML; no client-side data fetch required on initial load.
7. Each bottle row is rendered as an anchor (`<a>`) pointing to `/bottles/[id]/edit`.
8. "Add bottle" button (present always, but prominent in empty state) links to `/bottles/new`.

---

**Inputs:**

- `q` (string, optional, URL query param): Search/filter term — passed through to the SQL query (see F04).

---

**Outputs:**

- HTML page containing:
  - Page title: "My Cellar" (or equivalent brand heading)
  - Search input pre-populated with current `?q=` value
  - "Add bottle" button / link
  - List of bottle cards, each displaying: `name`, `vintage` (blank if null), `varietal` (blank if null), `quantity`, `location` (blank if null)
  - OR empty-state message if no bottles

---

**Validation:**

- No user input validated on this page (read-only list).
- `q` parameter is sanitised before SQL use (parameterised query — `$1` placeholder, not string interpolation).
- If `id` values in DB are non-integer for any reason, page must not crash — handled by DB constraint (SERIAL PK).

---

**Error States:**

| Scenario | Behaviour | HTTP Code | Notes |
|----------|-----------|-----------|-------|
| Database connection failure | Render error page / Next.js error boundary with message "Unable to load cellar. Please try again." | 500 | Server Component throws; Next.js `error.tsx` catches |
| `DATABASE_URL` not set | App fails at startup (migration exits non-zero) — this page is never reached | N/A | Handled by F06 |
| No bottles (empty collection) | Render empty-state UI — not an error | 200 | |
| No bottles matching search | Render search-empty UI — not an error | 200 | See F04 |

---

**API Surface (this feature):** Internally calls `GET /api/bottles` query logic directly via shared DB helper (server-side). No client-side API call on initial load. See `Y1-api.md §GET /api/bottles`.

**Schema Surface (this feature):** Reads from table `bottles` — see `Y0-schema.md`.

---
---

## F01: Add Bottle Page

**Priority:** P0 — Critical (MVP create flow)
**Route:** `GET /bottles/new` (page) + `POST /api/bottles` (action)
**PRD Reference:** F1

---

**Description:** A form page that lets the user add a new bottle to their collection. Only the bottle name is required; all other fields are optional. On successful submission the server creates the record and the user is redirected to the list page. On validation failure or server error, an inline error message is displayed without losing the user's entered data.

---

**Terminology:**

- **Inline error:** An error message rendered directly on the form page (not a separate error page) that preserves all field values.
- **Redirect-on-success:** After a successful POST, the browser is redirected to `/` (HTTP 302 or Next.js `redirect()`).

---

**Sub-features:**

- Add-bottle form rendering
- Client-side name validation (before submit)
- Server-side field validation and record creation
- Success redirect to list page
- Inline error display on failure
- Cancel navigation back to list

---

**Process:**

1. Browser navigates to `GET /bottles/new`.
2. Next.js renders the add-bottle form (Server or Client Component; form fields empty/default).
3. User fills in fields; at minimum provides `name`.
4. **Client-side validation:** Before form submit fires, JavaScript checks that `name` is not blank (trimmed). If blank, display inline error "Name is required" and abort submit.
5. Form submits to `POST /api/bottles` with JSON body.
6. **Server-side validation:** API validates `name` not blank, `vintage` is integer or absent, `quantity` is integer ≥ 1 or absent.
7. On validation failure → API returns `422`; page displays inline error from response body without clearing fields.
8. On success → API returns `201` with created record; client redirects to `/`.
9. If user clicks "Cancel" at any point → navigate to `/` without submitting.

---

**Inputs:**

- `name` (string, **required**): Bottle name / wine label. Must not be blank after trimming.
- `vintage` (integer, optional): 4-digit harvest year. Must be between 1800 and current year + 1 if provided. Stored as `NULL` if absent.
- `varietal` (string, optional): Grape variety or wine type. Stored as `NULL` if absent or blank.
- `quantity` (integer, optional): Number of bottles. Must be ≥ 1 if provided; defaults to `1` if absent.
- `location` (string, optional): Free-text storage location. Stored as `NULL` if absent or blank.

---

**Outputs:**

- On success: `HTTP 201` from API + browser redirect to `/`.
- On validation error: Form re-rendered with all field values intact + inline error message.
- On server error: Form re-rendered with inline error "Something went wrong. Please try again."

---

**Validation Rules:**

- `name`: Required. Must be non-empty string after `trim()`. Max length 255 characters.
- `vintage`: Optional. If provided, must be integer in range `[1800, currentYear + 1]`. Reject floats (e.g. 2020.5).
- `varietal`: Optional. No format constraint. Max length 255 characters.
- `quantity`: Optional. If provided, must be integer ≥ 1. If absent, API defaults to `1`. Reject floats.
- `location`: Optional. No format constraint. Max length 500 characters.

---

**Error States:**

| Scenario | HTTP Status | Error Code / Message | UI Behaviour |
|----------|-------------|----------------------|--------------|
| `name` blank or missing | 422 | "Name is required" | Inline error below name field; fields preserved |
| `vintage` not valid integer | 422 | "Vintage must be a valid year" | Inline error below vintage field |
| `vintage` out of range | 422 | "Vintage must be between 1800 and [year]" | Inline error below vintage field |
| `quantity` < 1 | 422 | "Quantity must be at least 1" | Inline error below quantity field |
| `quantity` not integer | 422 | "Quantity must be a whole number" | Inline error below quantity field |
| Database insert fails | 500 | "Something went wrong. Please try again." | Inline error at form top; fields preserved |
| `DATABASE_URL` not set | N/A | App fails at startup — page unreachable | Handled by F06 |

---

**API Surface (this feature):** `POST /api/bottles` — see `Y1-api.md §POST /api/bottles` for full request/response schema.

**Schema Surface (this feature):** Inserts into table `bottles` — see `Y0-schema.md`.

---
---

## F02: Edit Bottle Page

**Priority:** P0 — Critical (MVP edit flow)
**Route:** `GET /bottles/[id]/edit` (page) + `PUT /api/bottles/[id]` (action)
**PRD Reference:** F2

---

**Description:** A pre-populated form page for modifying an existing bottle's details. All five editable fields (name, vintage, varietal, quantity, location) are loaded from the API and presented with their current values. The most frequent action is decrementing quantity after opening a bottle. This page also hosts the Delete action (see F03). On successful save the user is redirected to the list page.

---

**Terminology:**

- **Pre-populated form:** Form fields are filled with the bottle's current DB values before the user makes any changes.
- **Optimistic redirect:** On successful PUT, immediately redirect to `/` without re-fetching the updated record.

---

**Sub-features:**

- Load existing bottle data by ID
- Pre-populate form fields
- Save changes via PUT
- Success redirect
- Inline error display on failure
- Cancel navigation
- Host for Delete action (F03)

---

**Process:**

1. Browser navigates to `GET /bottles/[id]/edit`.
2. Next.js Server Component calls `GET /api/bottles/[id]` (or equivalent direct DB query) to fetch the bottle.
3. If bottle not found → render "Bottle not found" page (or redirect to `/` with an error toast — developer's choice, but not a crash).
4. If `[id]` is not a valid integer → treat as not found (step 3).
5. Form is rendered with all fields pre-populated from the fetched record.
6. User modifies one or more fields.
7. **Client-side validation:** `name` must not be blank (same rule as F01). Abort submit with inline error if blank.
8. Form submits to `PUT /api/bottles/[id]` with full set of fields as JSON body.
9. **Server-side validation:** Same rules as F01 (name required, vintage range, quantity ≥ 1).
10. On validation failure → API returns `422`; page displays inline error with field values preserved.
11. On success → API returns `200` with updated record; client redirects to `/`.
12. Delete button on this page is handled by F03.

---

**Inputs:**

- `id` (integer, path param, **required**): The bottle's primary key. Must be a positive integer.
- `name` (string, **required**): Updated bottle name. Must not be blank after trimming.
- `vintage` (integer, optional): Updated vintage year. Rules identical to F01.
- `varietal` (string, optional): Updated varietal. Rules identical to F01.
- `quantity` (integer, optional): Updated quantity. Must be ≥ 0 (allow 0 to record "finished" bottles). If absent from the request body, treated as `null` (full replacement — see F05 PUT semantics).
- `location` (string, optional): Updated location. Rules identical to F01.

> **Note on quantity:** Edit allows `quantity = 0` (bottle "finished") while Add requires `quantity ≥ 1`. This lets the user record that they've consumed the last bottle without deleting the record.
>
> **Full replacement:** `PUT /api/bottles/[id]` replaces all five editable fields. The edit form must always include all current field values in the request body, not only the changed ones. Absent optional fields are stored as `NULL`.

---

**Outputs:**

- On page load: Form with all fields populated from DB record.
- On successful save: `HTTP 200` from API + browser redirect to `/`.
- On validation error: Form re-rendered with submitted values intact + inline error.
- On server error: Form re-rendered with inline error "Something went wrong. Please try again."
- On bottle not found (page load): "Bottle not found" message with a link back to `/`.

---

**Validation Rules:**

- `id`: Must parse as a positive integer. Non-integer or negative → 404.
- `name`: Required. Non-empty after `trim()`. Max 255 characters.
- `vintage`: Optional. Integer in `[1800, currentYear + 1]` if provided.
- `varietal`: Optional. Max 255 characters.
- `quantity`: Optional on wire; if provided must be integer ≥ 0.
- `location`: Optional. Max 500 characters.

---

**Error States:**

| Scenario | HTTP Status | Error Code / Message | UI Behaviour |
|----------|-------------|----------------------|--------------|
| Bottle not found (page load) | 404 | "Bottle not found" | "Bottle not found" message + link to `/` |
| `id` is not an integer (page load) | 404 | "Bottle not found" | Same as above |
| `name` blank on save | 422 | "Name is required" | Inline error; fields preserved |
| `vintage` invalid | 422 | "Vintage must be a valid year" | Inline error below vintage |
| `quantity` < 0 | 422 | "Quantity cannot be negative" | Inline error below quantity |
| Bottle not found (PUT) | 404 | "Not found" | Inline error at form top |
| Database update fails | 500 | "Something went wrong. Please try again." | Inline error at form top |

---

**API Surface (this feature):**
- `GET /api/bottles/[id]` — fetch bottle for pre-population; see `Y1-api.md §GET /api/bottles/[id]`.
- `PUT /api/bottles/[id]` — save changes; see `Y1-api.md §PUT /api/bottles/[id]`.

**Schema Surface (this feature):** Reads and updates table `bottles` — see `Y0-schema.md`.

---
---

## F03: Delete Bottle

**Priority:** P0 — Critical (MVP delete flow)
**Route:** Action on `/bottles/[id]/edit` → `DELETE /api/bottles/[id]`
**PRD Reference:** F3

---

**Description:** From the edit page, the user can permanently remove a bottle record from the collection. A browser-native confirmation dialog prevents accidental deletion. On confirmation the record is hard-deleted from the database and the user is redirected to the list page. Cancelling the dialog leaves the user on the edit page with no changes made.

---

**Terminology:**

- **Hard delete:** The row is permanently removed from the `bottles` table (`DELETE FROM bottles WHERE id = $1`). There is no soft-delete or trash mechanism in MVP.
- **Native confirm dialog:** `window.confirm("Delete this bottle?")` — browser-rendered modal; no custom modal component required.

---

**Sub-features:**

- "Delete" button on edit page
- Browser confirmation dialog
- DELETE API call on confirmation
- Success redirect to list
- No-op on dialog cancellation

---

**Process:**

1. User is on `/bottles/[id]/edit`.
2. User clicks the "Delete" button.
3. Browser calls `window.confirm("Delete this bottle?")`.
4. **If user clicks Cancel in dialog:** `window.confirm` returns `false`. No API call is made. User remains on the edit page. No state changes.
5. **If user clicks OK in dialog:** `window.confirm` returns `true`. Proceed to step 6.
6. Client sends `DELETE /api/bottles/[id]`.
7. API executes `DELETE FROM bottles WHERE id = $1`.
8. On success → API returns `204 No Content`; client redirects to `/`.
9. On bottle not found → API returns `404 {"error":"Not found"}`; client displays inline error "This bottle could not be deleted. It may have already been removed."
10. On server error → API returns `500`; client displays inline error "Something went wrong. Please try again."

---

**Inputs:**

- `id` (integer, path param, **required**): The bottle's primary key. Sourced from the current page URL.

---

**Outputs:**

- On dialog cancel: No change; user stays on edit page.
- On successful delete: `HTTP 204` from API + browser redirect to `/`.
- On bottle not found: Inline error on edit page.
- On server error: Inline error on edit page.

---

**Validation Rules:**

- `id` must be a positive integer (inherited from page URL — same constraint as F02).
- No additional input to validate (no request body on DELETE).

---

**Error States:**

| Scenario | HTTP Status | Error Message | UI Behaviour |
|----------|-------------|---------------|--------------|
| User cancels confirm dialog | N/A | None | No action; user stays on edit page |
| Bottle not found in DB | 404 | "Not found" | Inline error: "This bottle could not be deleted." |
| `id` is not a valid integer | 404 | "Not found" | Inline error (same) |
| Database delete fails | 500 | "Something went wrong." | Inline error on edit page |

---

**API Surface (this feature):** `DELETE /api/bottles/[id]` — see `Y1-api.md §DELETE /api/bottles/[id]`.

**Schema Surface (this feature):** Deletes from table `bottles` — see `Y0-schema.md`.

---
---

## F04: Search / Filter by Name

**Priority:** P1 — High (core usability feature)
**Route:** `GET /?q=<term>` (list page with query param) + `GET /api/bottles?q=<term>`
**PRD Reference:** F4

---

**Description:** The list page supports filtering the displayed bottles by name via the URL query parameter `?q=`. A search input rendered at the top of the list page allows the user to type a name fragment; the list updates to show only matching bottles. The search is case-insensitive and matches partial names using PostgreSQL's `ILIKE` operator. Search state is URL-driven so it persists across page reloads and can be bookmarked or shared.

---

**Terminology:**

- **Search term:** The value of the `?q=` query parameter; used as the ILIKE filter pattern.
- **ILIKE:** PostgreSQL case-insensitive `LIKE` — `ILIKE '%term%'` matches any row where `name` contains `term` regardless of case.
- **URL-driven state:** The search term lives in the URL, not in component state, so reloading the page preserves the filter.
- **Search-empty state:** The empty UI shown when a search term is active but no bottles match (distinct from the no-bottles empty state in F00).

---

**Sub-features:**

- Search input rendered on list page
- URL sync on input change or submit
- Server-side ILIKE filtering via `?q=` param
- Search-empty state distinct from cellar-empty state
- Clear search (remove `?q=`) restores full list

---

**Process:**

1. On page load, read `q` from URL query string.
2. Render search `<input>` pre-populated with current `q` value (empty string if absent).
3. User types in search input.
4. On input change: after a debounce delay of ≤ 500 ms from the last keystroke, update the URL to `/?q=<encoded-term>` using `router.replace` and trigger a Server Component re-render.
   - Implementation: a Client Component wraps the search `<input>`, applies a `useEffect`-based debounce (or equivalent), and calls `router.replace('/?q=<term>')`.
   - `router.replace` (not `push`) is used so the search does not accumulate browser history entries.
   - The URL update causes the Server Component to re-fetch with the new `q` — no full page reload, no separate API fetch from the client.
   - Form-submit-only (Enter key / button) is **not** sufficient; results must update as the user types.
5. Server Component receives `q` from `searchParams`.
6. If `q` is absent or empty string → SQL: `SELECT * FROM bottles ORDER BY created_at DESC` (all rows).
7. If `q` has a non-empty trimmed value → SQL: `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `$1 = '%' + term + '%'`.
8. Render results:
   - Results found → render bottle list (same card/row format as F00).
   - Zero results, `q` is empty → render cellar-empty state ("No bottles yet").
   - Zero results, `q` is non-empty → render search-empty state ("No bottles match '<term>'").
9. Clearing the search input and submitting (or navigating to `/`) restores the full unfiltered list.

---

**Inputs:**

- `q` (string, optional, URL query param): Search term. Passed as `$1` to parameterised SQL — never interpolated directly.

---

**Outputs:**

- List of matching bottle cards (may be the full collection if `q` is absent/empty).
- Search-empty state message if `q` has value but no rows match: `"No bottles match '<q>'"`
- Cellar-empty state if `q` is absent and table is empty (see F00).

---

**Validation Rules:**

- `q` is treated as a plain string. No format or length constraint beyond sensible trimming before SQL use.
- SQL injection prevented by using a parameterised query (`$1` placeholder with `pg`). **Never** interpolate `q` directly into SQL string.
- Whitespace-only `q` is treated equivalently to absent `q` (return all bottles).
- Maximum query parameter length: 500 characters. Longer values are truncated to 500 before use.
- **Search trigger:** Filtering is driven by debounce on the `<input>`'s `onChange` event (≤ 500 ms delay). A form-submit-only trigger (Enter key / button click) does NOT satisfy the real-time filtering requirement.

---

**Error States:**

| Scenario | HTTP Status | Message | UI Behaviour |
|----------|-------------|---------|--------------|
| `q` present but no matches | 200 | N/A | Search-empty state: "No bottles match '<q>'" |
| `q` absent, empty collection | 200 | N/A | Cellar-empty state: "No bottles yet" (F00) |
| Database query fails during search | 500 | "Unable to load cellar." | Next.js error boundary (same as F00) |

---

**API Surface (this feature):** `GET /api/bottles?q=<term>` — see `Y1-api.md §GET /api/bottles`.

**Schema Surface (this feature):** Reads from `bottles.name` column with ILIKE filter — see `Y0-schema.md`.

---
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

> **Full replacement semantics:** The edit form always sends all five fields. The PUT handler performs a full column replacement — it does NOT merge with existing DB values. Optional fields absent from the request body (or explicitly `null`) overwrite the existing DB value with `NULL`. The UI is responsible for including current values in the payload for any field the user did not change.

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
---

## F06: Database Auto-Migration

**Priority:** P0 — Critical (app cannot function without table)
**File:** `scripts/migrate.mjs`
**PRD Reference:** F6

---

**Description:** On every server start — both development (`npm run dev`) and production (`npm run start`) — a migration script runs before Next.js boots. It creates the `bottles` table using `CREATE TABLE IF NOT EXISTS`, making the operation idempotent: safe to run repeatedly against an already-initialised database without modifying existing data. If the database connection fails, the script exits with a non-zero code so that the server process aborts with a readable error rather than starting in a broken state.

---

**Terminology:**

- **Idempotent migration:** Running the migration script any number of times against the same database produces the same final schema state with no errors and no data loss.
- **`CREATE TABLE IF NOT EXISTS`:** PostgreSQL DDL that creates the table only if it does not already exist; no-op if the table is present.
- **Exit code 0:** Script success — Next.js proceeds to start.
- **Non-zero exit code:** Script failure — `npm run dev` / `npm run start` aborts, preventing a broken server from starting.

---

**Sub-features:**

- Establish PostgreSQL connection using `DATABASE_URL`
- Execute idempotent DDL
- Log success/failure to stdout/stderr
- Exit with appropriate code
- Chain into `npm run dev` and `npm run start`

---

**Process:**

1. Script is invoked as `node scripts/migrate.mjs` (ESM module).
2. Read `process.env.DATABASE_URL`. If absent or empty → log `"ERROR: DATABASE_URL environment variable is not set"` to stderr and `process.exit(1)`.
3. Create a `pg.Client` (or `pg.Pool`) using `DATABASE_URL`.
4. Attempt to connect. If connection fails → log `"ERROR: Could not connect to database: <error message>"` to stderr and `process.exit(1)`.
5. Execute the DDL (see below).
6. If DDL execution fails → log `"ERROR: Migration failed: <error message>"` to stderr, release connection, and `process.exit(1)`.
7. Log `"Migration complete."` to stdout.
8. Release connection and `process.exit(0)`.

**DDL executed:**

```sql
CREATE TABLE IF NOT EXISTS bottles (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  vintage    INTEGER,
  varietal   TEXT,
  quantity   INTEGER NOT NULL DEFAULT 1,
  location   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`package.json` scripts (required shape):**

```json
{
  "scripts": {
    "migrate": "node scripts/migrate.mjs",
    "dev":     "npm run migrate && next dev",
    "start":   "npm run migrate && next start",
    "build":   "next build"
  }
}
```

- `build` does **not** run migrate (build may occur without a DB connection in CI).
- Both `dev` and `start` chain `migrate` first with `&&` so Next.js only starts if migration succeeds.

---

**Inputs:**

- `DATABASE_URL` (environment variable, **required**): PostgreSQL connection string, e.g. `postgres://postgres:devpass@localhost:5432/app`.

---

**Outputs:**

- Stdout: `"Migration complete."` on success.
- Stderr: Descriptive error message on any failure.
- Exit code `0` on success; non-zero (`1`) on any failure.

---

**Validation Rules:**

- `DATABASE_URL` must be a non-empty string. If absent → exit 1 before attempting connection.
- DDL must use `CREATE TABLE IF NOT EXISTS` (never `CREATE TABLE`) to ensure idempotency.
- Script must not drop, truncate, or alter existing columns — MVP has no destructive migrations.

---

**Error States:**

| Scenario | Exit Code | Log Output |
|----------|-----------|-----------|
| `DATABASE_URL` not set | 1 | `ERROR: DATABASE_URL environment variable is not set` |
| DB connection refused | 1 | `ERROR: Could not connect to database: connect ECONNREFUSED 127.0.0.1:5432` |
| DB auth failure | 1 | `ERROR: Could not connect to database: password authentication failed` |
| DDL execution error | 1 | `ERROR: Migration failed: <pg error message>` |
| Success | 0 | `Migration complete.` |

---

**API Surface (this feature):** None — migration script has no HTTP interface.

**Schema Surface (this feature):** Creates `bottles` table — see `Y0-schema.md` for full DDL.

---
---

## F07: Brand & Mobile-First UI

**Priority:** P1 — High (core UX and platform requirement)
**Applies to:** All pages (`/`, `/bottles/new`, `/bottles/[id]/edit`)
**PRD Reference:** F7

---

**Description:** All pages follow the TechSur brand palette and are designed mobile-first. The accent colour (Gold `#FBCA5C`) is used sparingly on interactive elements against near-black text and white surfaces. Every interactive element meets minimum tap-target sizing. No CSS framework is used. Critically, no `X-Frame-Options: DENY` or `frame-ancestors 'none'` headers are emitted, ensuring the app renders correctly inside the Pivota K8s sandbox iframe preview.

---

**Terminology:**

- **Mobile-first:** CSS is written for the smallest viewport (375 px) first; wider breakpoints are progressive enhancements via `@media (min-width: ...)`.
- **Tap target:** The touchable/clickable area of an interactive element. Must be ≥ 44 × 44 px (iOS HIG / WCAG guideline).
- **Gold accent:** `#FBCA5C` — primary brand colour used on buttons, active/focus states. Must not cover more than ~10% of any view.
- **Near-black:** `#0A0A0A` — primary text colour.
- **Surface white:** `#FFFFFF` — card and background surfaces.
- **iframe compatibility:** The app must load without being blocked by browser iframe restrictions; no `X-Frame-Options` or restrictive CSP `frame-ancestors` headers.

---

**Sub-features:**

- Brand colour palette applied globally
- Mobile-first responsive layout (375 px → 1440 px)
- Minimum 44 × 44 px tap targets on all interactive elements
- Visible `<label>` for every form input
- Plain CSS / CSS Modules (no CSS framework)
- Header override in `next.config.mjs` to remove iframe-blocking headers
- No `X-Frame-Options: DENY` header
- No `Content-Security-Policy: frame-ancestors 'none'`

---

**Process (implementation requirements):**

1. **Global CSS:** Define CSS custom properties (variables) for the brand palette:
   - `--color-accent: #FBCA5C`
   - `--color-text: #0A0A0A`
   - `--color-surface: #FFFFFF`
   - `--color-accent-hover`: a darkened version of gold for hover states
2. **Layout:** Root layout (`app/layout.tsx`) wraps all pages in a max-width container (e.g. `max-width: 480px; margin: 0 auto`) to keep mobile layout centred on larger screens.
3. **Buttons:** Primary action buttons (Submit, "Add bottle") use `background: var(--color-accent)`, `color: var(--color-text)`. Minimum size `44px × 44px` enforced via `min-height` and `padding`.
4. **Form inputs:** All `<input>` and `<select>` elements have an associated `<label>` rendered visibly above or beside the input (not placeholder-only labels).
5. **List rows/cards:** White surface, near-black text, subtle border or shadow. Entire row is clickable (`<a>` wrapping card or `cursor: pointer`).
6. **No horizontal scroll:** All content at 375 px viewport fits within the viewport. Overflow hidden where appropriate; no fixed-width elements wider than 100 vw.
7. **Header config** — `next.config.mjs` must include a `headers()` export that explicitly removes or overrides any default iframe-blocking header:

```js
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Do NOT set frame-ancestors 'none' in CSP
        ],
      },
    ];
  },
};
export default nextConfig;
```

> **Note:** `X-Frame-Options: SAMEORIGIN` (not DENY) is acceptable. Omitting the header entirely is also acceptable. The constraint is that `DENY` and `frame-ancestors 'none'` must not be emitted.

---

**Inputs:** N/A — this feature defines UI styling constraints, not data inputs.

---

**Outputs:**

- All pages render correctly at 375 px width (no horizontal scroll, no overlapping elements).
- All pages render at 1440 px width (centred, readable, not stretched).
- Primary buttons use Gold accent.
- All form fields have visible labels.
- No iframe-blocking response headers on any page or API route.

---

**Validation Rules:**

- Gold accent (`#FBCA5C`) used for: primary buttons, active/focus outlines, key links/icons only. Must not be used as full-page or card background.
- Every `<input>`, `<textarea>`, `<select>` has a corresponding `<label htmlFor="...">` that is visible (not `sr-only` unless an icon-only control).
- All buttons and links have `min-height: 44px` and `min-width: 44px` (or sufficient padding to meet the 44 × 44 px threshold).
- No `@import` of external CSS frameworks (Bootstrap, Tailwind CDN, etc.).
- `next.config.mjs` must be `.mjs` (ESM) — never `.ts` or `.js` if TypeScript syntax is used.

---

**Error States:**

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| `X-Frame-Options: DENY` emitted | App blocked in iframe preview | Explicit header override in `next.config.mjs` (see Process step 7) |
| `frame-ancestors 'none'` in CSP | App blocked in iframe preview | Never set this CSP directive in any middleware or headers config |
| Viewport overflow at 375 px | Horizontal scroll on mobile | Automated visual test or manual check at 375 px before deploy |
| Tap target < 44 px | Inaccessible on mobile | CSS `min-height`/`min-width` enforced on all interactive elements |

---

**API Surface (this feature):** None — styling only.

**Schema Surface (this feature):** None.

---
---

## Database Schema

**Technology:** PostgreSQL 16
**Connection:** `DATABASE_URL` environment variable (e.g. `postgres://postgres:devpass@localhost:5432/app`)
**Driver:** `pg` (node-postgres) — raw SQL, no ORM
**Migration:** `scripts/migrate.mjs` — idempotent, runs before server start

---

### Table: `bottles`

This is the **only** table in the MVP data model.

```sql
CREATE TABLE IF NOT EXISTS bottles (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  vintage    INTEGER,
  varietal   TEXT,
  quantity   INTEGER NOT NULL DEFAULT 1,
  location   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Column Definitions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Auto-incrementing integer PK. Gaps after deletes are accepted (cosmetic only). |
| `name` | `TEXT` | NOT NULL | Wine label / bottle name. Max 255 chars enforced at application layer. |
| `vintage` | `INTEGER` | NULL allowed | Harvest year (e.g. `2018`). `NULL` when not provided. Range `[1800, currentYear+1]` enforced at application layer. |
| `varietal` | `TEXT` | NULL allowed | Grape variety or wine type. `NULL` when not provided. |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT 1 | Number of physical bottles held. `0` is valid (finished). Application layer enforces ≥ 0 on updates, ≥ 1 on inserts. |
| `location` | `TEXT` | NULL allowed | Free-text storage location. `NULL` when not provided. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp in UTC. Never updated after insert. |

---

### Query Patterns

**List all bottles (default sort — newest first):**
```sql
SELECT * FROM bottles ORDER BY created_at DESC;
```

**Search by name (case-insensitive partial match):**
```sql
SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC;
-- $1 = '%' + searchTerm + '%'
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
-- $1=name, $2=vintage|null, $3=varietal|null, $4=quantity, $5=location|null
```

**Update bottle:**
```sql
UPDATE bottles
SET name=$1, vintage=$2, varietal=$3, quantity=$4, location=$5
WHERE id=$6
RETURNING *;
```

**Delete bottle:**
```sql
DELETE FROM bottles WHERE id = $1 RETURNING id;
```

---

### DB Connection Pattern (recommended)

Use a module-level pool to avoid opening a new connection per request:

```ts
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export default pool;
```

Route Handlers call `pool.query(sql, params)` directly. No transactions required for single-table MVP operations.

---

### Constraints & Invariants

- `SERIAL` PK: No application-level ID generation required.
- `quantity` can reach `0` via PUT but never goes negative (enforced at API layer, not DB constraint in MVP).
- `created_at` is set by the DB default; never passed in INSERT bodies.
- No foreign keys, no indexes beyond the implicit PK index (sufficient for MVP collection size).
- No soft-delete — DELETE is permanent.

---
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
| `quantity` | integer | No | ≥ **0** (PUT allows finished bottles). Absent or `null` → stored as `NULL` (full replacement). |
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
---

## Cross-Feature Error Catalog

This catalog lists all error states across the CellarLite application, grouped by origin. All API error responses use the shape `{"error": "<message>"}`. Page-level errors use Next.js error boundaries (`error.tsx`) or inline UI messages.

---

### HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST (bottle created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed JSON request body |
| 404 | Not Found | Bottle ID not in DB, or ID not a valid integer |
| 422 | Unprocessable Entity | Request body valid JSON but fails business validation |
| 500 | Internal Server Error | Unexpected database or server error |

---

### Validation Errors (422)

| Field | Trigger | Error Message |
|-------|---------|---------------|
| `name` | Missing or blank after trim | `"Name is required"` |
| `name` | Exceeds 255 characters | `"Name must be 255 characters or fewer"` |
| `vintage` | Provided but not an integer | `"Vintage must be a valid year"` |
| `vintage` | Integer < 1800 | `"Vintage must be between 1800 and YYYY"` |
| `vintage` | Integer > currentYear + 1 | `"Vintage must be between 1800 and YYYY"` |
| `varietal` | Exceeds 255 characters | `"Varietal must be 255 characters or fewer"` |
| `quantity` (POST) | Provided and < 1 | `"Quantity must be at least 1"` |
| `quantity` (POST) | Not an integer | `"Quantity must be a whole number"` |
| `quantity` (PUT) | Provided and < 0 | `"Quantity cannot be negative"` |
| `quantity` (PUT) | Not an integer | `"Quantity must be a whole number"` |
| `location` | Exceeds 500 characters | `"Location must be 500 characters or fewer"` |

---

### Not Found Errors (404)

| Scenario | Error Message | Affected Endpoints |
|----------|---------------|-------------------|
| `id` does not exist in DB | `"Not found"` | GET, PUT, DELETE `/api/bottles/[id]` |
| `id` in URL is not a valid positive integer | `"Not found"` | GET, PUT, DELETE `/api/bottles/[id]` |
| `id` is zero or negative | `"Not found"` | GET, PUT, DELETE `/api/bottles/[id]` |

---

### Request Errors (400)

| Scenario | Error Message | Affected Endpoints |
|----------|---------------|-------------------|
| Request body is not valid JSON | `"Invalid JSON"` | POST `/api/bottles`, PUT `/api/bottles/[id]` |
| `Content-Type` missing (body ignored) | `"Invalid JSON"` | POST `/api/bottles`, PUT `/api/bottles/[id]` |

---

### Server Errors (500)

| Scenario | Error Message | Affected Features |
|----------|---------------|------------------|
| Database query throws unexpected error | `"Internal server error"` | All API endpoints |
| Database connection lost mid-request | `"Internal server error"` | All API endpoints |
| Unhandled exception in Route Handler | `"Internal server error"` | All API endpoints |
| Server Component throws during page render | Next.js error boundary displays "Unable to load cellar." | F00 list page |

---

### Startup / Infrastructure Errors

| Scenario | Outcome | Feature |
|----------|---------|---------|
| `DATABASE_URL` not set | `migrate.mjs` exits 1; `npm run dev/start` aborts | F06 |
| PostgreSQL connection refused | `migrate.mjs` exits 1 with `connect ECONNREFUSED` message | F06 |
| PostgreSQL auth failure | `migrate.mjs` exits 1 with pg auth error message | F06 |
| `next.config.ts` used instead of `.mjs` | Next.js 14 hard-errors at startup with config parse failure | F07 / Non-functional |

---

### UI-Layer Errors (no HTTP code)

| Scenario | UI Behaviour | Feature |
|----------|-------------|---------|
| `name` blank on form submit (client-side) | Inline error "Name is required"; submit aborted | F01, F02 |
| User cancels delete confirmation | No action; user stays on edit page | F03 |
| Bottle not found on edit page load | "Bottle not found" message + link to `/` | F02 |
| Network error during form submit | Inline error "Something went wrong. Please try again." | F01, F02, F03 |

---
---

## Integration Points

This document lists all external system dependencies and integration contracts for CellarLite MVP.

---

### 1. PostgreSQL 16 Database

**Type:** Database (co-resident container)
**Connection:** `localhost:5432` via `DATABASE_URL` env var
**Driver:** `pg` (node-postgres) v8.x

| Attribute | Value |
|-----------|-------|
| Host | `localhost` (same K8s pod) |
| Port | `5432` |
| Database name | `app` (from `DATABASE_URL`) |
| Connection string | `DATABASE_URL` environment variable |
| Connection pool | `pg.Pool` with default settings |
| Max connections | Default pg pool size (10) — sufficient for MVP |

**Contract:**
- The database is assumed to be running and accessible at `localhost:5432` before `migrate.mjs` is called.
- `migrate.mjs` creates the `bottles` table if it does not exist (idempotent).
- The app assumes PostgreSQL 16 features (specifically: `ILIKE`, `TIMESTAMPTZ`, `SERIAL`, `RETURNING`).
- `DATABASE_URL` is the single source of truth; individual `POSTGRES_*` env vars are not used by the application.

**Failure handling:** If PostgreSQL is unreachable, `migrate.mjs` exits non-zero and `npm run start`/`dev` aborts. K8s readiness probes handle container orchestration retry logic.

---

### 2. Next.js 14 Runtime (App Router)

**Type:** Framework / runtime
**Version:** Next.js 14.x

| Attribute | Value |
|-----------|-------|
| Router | App Router (`app/` directory) |
| Config file | `next.config.mjs` (ESM, never `.ts`) |
| Bind address | `0.0.0.0:3000` |
| Server type | Node.js (standalone or default Next.js server) |

**Contract:**
- Config is `next.config.mjs`. Next.js 14 cannot parse `.ts` config files and will hard-error at startup.
- The `headers()` export in `next.config.mjs` overrides default security headers to allow iframe embedding (no `X-Frame-Options: DENY`, no `frame-ancestors 'none'`).
- `npm run build` builds the production bundle; `npm run start` serves it.
- `npm run dev` runs the development server with hot reload.

---

### 3. Kubernetes Sandbox (Pivota K8s)

**Type:** Hosting platform
**Role:** Runs the Next.js app as a container; provides PostgreSQL co-resident on `localhost`.

| Attribute | Value |
|-----------|-------|
| Exposed port | `3000` (app must bind `0.0.0.0:3000`) |
| Liveness probe | `GET /api/health` → expects `200 {"status":"ok"}` |
| Database injection | `DATABASE_URL` (and optionally `POSTGRES_*`) env vars |
| iframe preview | App renders inside sandbox iframe; frame-blocking headers must not be set |

**Contract:**
- The platform handles DNS, TLS termination, and proxy to port 3000 — the app does not manage these.
- No `Dockerfile`, `docker-compose.yml`, or `compose.yaml` are present in the repository. The platform manages container builds.
- K8s readiness/liveness probes call `GET /api/health`. The endpoint must return `200` quickly (< 200 ms) with no DB dependency.

---

### 4. Browser (Client)

**Type:** Web client (Safari Mobile, Chrome Mobile, Desktop browsers)
**Minimum viewport:** 375 px wide (iPhone SE)

**Contract:**
- The app is server-rendered; JavaScript is used for interactive elements only (search input URL sync, form validation, delete confirmation).
- `window.confirm()` is used for delete confirmation — works in all modern browsers; not overridable by the app.
- No service workers, no PWA manifest, no offline support in MVP.

---

### Out-of-Scope Integrations (MVP)

The following are explicitly **not** integrated in MVP:

- External wine APIs (Vivino, Wine-Searcher, etc.)
- Authentication providers (Auth0, Azure AD, etc.)
- Email / SMS notifications
- Cloud storage (image uploads)
- Analytics / telemetry
- CI/CD systems (no pipeline config in this repo)

---
