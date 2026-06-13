# Requirements Traceability Matrix: CellarLite
**Document Type:** Requirements Traceability Matrix (RTM)
**Project Acronym:** CellarLite
**Version:** 1.0
**Date:** 2026-06-13
**Status:** Active
**Covers:** PRD-CellarLite.md v1.0 · FRD-CellarLite.md v1.0 · TechArch-CellarLite.md v1.0 · UserStories-CellarLite.md v1.0

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements Summary](#2-requirements-summary)
3. [Traceability Matrix — PRD → FRD → TechArch → User Stories](#3-traceability-matrix--prd--frd--techarch--user-stories)
4. [Requirements Detail by Feature](#4-requirements-detail-by-feature)
5. [Test Case Coverage Matrix](#5-test-case-coverage-matrix)
6. [Change Management Log](#6-change-management-log)
7. [Approval](#7-approval)

---

## 1. Overview

This Requirements Traceability Matrix (RTM) provides complete bidirectional traceability between all CellarLite specification documents. It ensures that every requirement defined in the Product Requirements Document (PRD) is decomposed into a functional requirement (FRD), implemented via a concrete technical specification (TechArch), exercised by a user story (UserStories), and covered by at least one test case.

CellarLite is a personal, single-user, mobile-first wine-cellar web application. The MVP scope spans eight features (F0–F7): bottle list display, add/edit/delete bottle workflows, name-based search and filtering, a complete REST API, idempotent database auto-migration, and brand-compliant mobile-first UI. All features operate against a single `bottles` table in PostgreSQL 16, accessed via raw SQL through `pg` (node-postgres) and served by a Next.js 14 App Router application.

Traceability in this document operates across four levels:

- **Level 1 — Product (PRD):** Feature IDs `F0`–`F7` define the "what" — the user-visible capabilities required for the MVP to ship.
- **Level 2 — Functional (FRD):** Feature IDs `F00`–`F07` (zero-padded for sort order) specify the "how it behaves" — inputs, outputs, validation rules, API contracts, and error states with sufficient detail for a developer to implement without ambiguity.
- **Level 3 — Technical (TechArch):** Architecture specs (`SPEC-001`–`SPEC-014`) define the "how it is built" — component design, data model, API endpoint implementations, security controls, and configuration constraints.
- **Level 4 — User Stories:** Story IDs `US-0.1`–`US-7.5` define the "who uses it and what they need" — 36 acceptance-criterion-driven stories across 8 epics, mapped directly to test scenarios.

Every PRD feature maps to one or more FRD sections, which in turn map to TechArch specs, which in turn map to user stories. The matrix in Section 3 provides the central lookup table; Section 4 provides per-feature detail; Section 5 provides test coverage mapping.

---

## 2. Requirements Summary

### Functional Requirements by Feature

- **F0 — Bottle List Page (`/`):** Server-rendered home page displaying the full collection ordered newest-first. Empty-state message ("No bottles yet") and "Add bottle" CTA when collection is empty. Each bottle row is a tap target navigating to the edit page.
- **F1 — Add Bottle Page (`/bottles/new`):** Form with five fields (name required; vintage, varietal, quantity, location optional). Client-side and server-side validation. POST to `/api/bottles`. Success redirect to `/`.
- **F2 — Edit Bottle Page (`/bottles/[id]/edit`):** Pre-populated form loaded from the database. PUT to `/api/bottles/[id]`. Allows quantity=0 for finished bottles. Not-found handling for missing/invalid IDs.
- **F3 — Delete Bottle:** Hard-delete triggered from the edit page via `window.confirm()` guard. DELETE to `/api/bottles/[id]`. Returns 204 No Content on success.
- **F4 — Search / Filter by Name:** URL-driven search via `?q=` query parameter. Debounced client input (≤500 ms). PostgreSQL `ILIKE '%term%'` filter. Distinct search-empty state vs. cellar-empty state.
- **F5 — REST API:** Six endpoints — `GET /api/health`, `GET /api/bottles`, `POST /api/bottles`, `GET /api/bottles/[id]`, `PUT /api/bottles/[id]`, `DELETE /api/bottles/[id]`. JSON request/response. Standard HTTP status codes (200, 201, 204, 400, 404, 422, 500).
- **F6 — Database Auto-Migration:** `scripts/migrate.mjs` runs `CREATE TABLE IF NOT EXISTS bottles (...)` before every server start. Chained via `&&` in `npm run dev` and `npm run start`. Exits 0 on success, 1 on any failure.
- **F7 — Brand & Mobile-First UI:** TechSur palette (Gold `#FBCA5C`, near-black `#0A0A0A`, white `#FFFFFF`). Mobile-first CSS at 375 px. Tap targets ≥ 44×44 px. `X-Frame-Options: SAMEORIGIN` (never DENY). No CSS framework.

### Non-Functional Requirements Summary

- **Performance:** List page initial load < 1 s on localhost; API p95 response < 200 ms.
- **Reliability:** Migration idempotency — zero failures on repeated starts; PostgreSQL persistence across restarts.
- **Compatibility:** Viewport 375 px (mobile) through 1440 px (desktop).
- **Accessibility:** All interactive elements ≥ 44×44 px tap target; all inputs have visible `<label>` elements.
- **Security:** No hard-coded credentials; `DATABASE_URL` env var only; parameterised SQL throughout (no string interpolation); `X-Frame-Options: SAMEORIGIN`, no `frame-ancestors 'none'`.
- **Maintainability:** `next.config.mjs` (ESM, never `.ts`); raw SQL via `pg` (no ORM); single `bottles` table.
- **Deployability:** Bind to `0.0.0.0:3000`; no Docker artifacts; auto-migration on every start.

### ID Convention Reference

| Prefix | Level | Source Document | Example |
|--------|-------|----------------|---------|
| `F` | PRD Feature | PRD-CellarLite.md | F0, F1, F2 |
| `F00`–`F07` | FRD Feature | FRD-CellarLite.md | F00, F01, F07 |
| `SPEC` | TechArch Spec | TechArch-CellarLite.md | SPEC-001 |
| `US` | User Story | UserStories-CellarLite.md | US-0.1, US-5.3 |
| `TEST` | Test Case | RTM (this document) | TEST-001 |
| `NFR` | Non-Functional Req | PRD-CellarLite.md §6 | NFR-PERF-01 |

---

## 3. Traceability Matrix — PRD → FRD → TechArch → User Stories

### 3.1 Master Traceability Table

| PRD Feature | Priority | FRD Section | TechArch Spec(s) | User Stories |
|-------------|----------|-------------|-----------------|--------------|
| **F0: Bottle List Page** | P0 | F00 | SPEC-003, SPEC-005 | US-0.1, US-0.2, US-0.3, US-0.4 |
| **F1: Add Bottle Page** | P0 | F01 | SPEC-004, SPEC-006, SPEC-010 | US-1.1, US-1.2, US-1.3, US-1.4 |
| **F2: Edit Bottle Page** | P0 | F02 | SPEC-004, SPEC-007, SPEC-010 | US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6 |
| **F3: Delete Bottle** | P0 | F03 | SPEC-004, SPEC-007, SPEC-010 | US-3.1, US-3.2 |
| **F4: Search / Filter by Name** | P1 | F04 | SPEC-003, SPEC-005, SPEC-009 | US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 |
| **F5: REST API** | P0 | F05, Y1-api | SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011 | US-5.1, US-5.2, US-5.3, US-5.4, US-5.5, US-5.6 |
| **F6: Database Auto-Migration** | P0 | F06, Y0-schema | SPEC-001, SPEC-002, SPEC-012 | US-6.1, US-6.2, US-6.3, US-6.4 |
| **F7: Brand & Mobile-First UI** | P1 | F07 | SPEC-013, SPEC-014 | US-7.1, US-7.2, US-7.3, US-7.4, US-7.5 |

### 3.2 TechArch Spec Registry

The following SPEC IDs are assigned to distinct technical architecture components extracted from TechArch-CellarLite.md:

| SPEC ID | Component | TechArch Section | Implements FRD |
|---------|-----------|-----------------|----------------|
| SPEC-001 | `scripts/migrate.mjs` — Auto-migration script | §2 Backend Components | F06 |
| SPEC-002 | `lib/db.ts` — pg.Pool singleton | §2 Backend Components | F06, F05 |
| SPEC-003 | `app/page.tsx` — Bottle List Page (Server Component) | §2 Frontend Components | F00, F04 |
| SPEC-004 | `app/layout.tsx` — Root Layout (Server Component) | §2 Frontend Components | F07 |
| SPEC-005 | `app/api/bottles/route.ts` — Bottles Collection handler (GET + POST) | §2 Backend Components | F00, F01, F04, F05 |
| SPEC-006 | `app/bottles/new/page.tsx` — Add Bottle Page (Client Component) | §2 Frontend Components | F01 |
| SPEC-007 | `app/bottles/[id]/edit/page.tsx` — Edit/Delete Bottle Page | §2 Frontend Components | F02, F03 |
| SPEC-008 | `app/api/health/route.ts` — Health Check handler | §2 Backend Components | F05 |
| SPEC-009 | `app/api/bottles/[id]/route.ts` — Single Bottle handler (GET, PUT, DELETE) | §2 Backend Components | F02, F03, F04, F05 |
| SPEC-010 | API Validation Rules — server-side input validation | §4 API Design, §5 Security | F01, F02, F03, F05 |
| SPEC-011 | TypeScript Interfaces — `Bottle`, `CreateBottleRequest`, `UpdateBottleRequest`, `ApiError` | §4 API Design | F05 |
| SPEC-012 | `bottles` table DDL — single-table data model | §3 Data Model | F06 |
| SPEC-013 | `next.config.mjs` — iframe-header override + ESM config | §2 Configuration | F07 |
| SPEC-014 | `styles/globals.css` — Brand palette, mobile-first CSS, tap targets | §2 Frontend Components | F07 |

### 3.3 Reverse Traceability — User Stories → PRD → FRD → TechArch

| User Story | Title | Feature | FRD | TechArch Spec(s) |
|-----------|-------|---------|-----|-----------------|
| US-0.1 | View Full Bottle List | F0 | F00 | SPEC-003, SPEC-005 |
| US-0.2 | View Empty-State When Cellar Has No Bottles | F0 | F00 | SPEC-003 |
| US-0.3 | Navigate to Edit Page from List Row | F0 | F00 | SPEC-003, SPEC-014 |
| US-0.4 | Navigate to Add Bottle from List Page | F0 | F00 | SPEC-003, SPEC-014 |
| US-1.1 | Add a New Bottle with All Fields | F1 | F01 | SPEC-006, SPEC-005, SPEC-010 |
| US-1.2 | Add a Bottle with Name Only (Optional Fields Blank) | F1 | F01 | SPEC-006, SPEC-005, SPEC-010 |
| US-1.3 | Prevented from Submitting Without a Name | F1 | F01 | SPEC-006, SPEC-010 |
| US-1.4 | Cancel Adding a Bottle | F1 | F01 | SPEC-006 |
| US-2.1 | Open Edit Page with Pre-Populated Fields | F2 | F02 | SPEC-007, SPEC-009 |
| US-2.2 | Update Bottle Quantity | F2 | F02 | SPEC-007, SPEC-009, SPEC-010 |
| US-2.3 | Update Any Bottle Field | F2 | F02 | SPEC-007, SPEC-009, SPEC-010 |
| US-2.4 | Prevented from Saving Without a Name | F2 | F02 | SPEC-007, SPEC-010 |
| US-2.5 | Cancel Editing a Bottle | F2 | F02 | SPEC-007 |
| US-2.6 | Handle Navigation to Non-Existent Bottle | F2 | F02 | SPEC-007, SPEC-009 |
| US-3.1 | Delete a Bottle with Confirmation | F3 | F03 | SPEC-007, SPEC-009 |
| US-3.2 | Cancel Deletion — No Change Made | F3 | F03 | SPEC-007 |
| US-4.1 | Search Bottles by Partial Name | F4 | F04 | SPEC-003, SPEC-005, SPEC-009 |
| US-4.2 | Search Is Case-Insensitive | F4 | F04 | SPEC-003, SPEC-005, SPEC-009 |
| US-4.3 | Search Empty State — No Matching Bottles | F4 | F04 | SPEC-003 |
| US-4.4 | Clear Search Restores Full List | F4 | F04 | SPEC-003, SPEC-005 |
| US-4.5 | Search State Persists on Page Reload | F4 | F04 | SPEC-003 |
| US-5.1 | Health Check Endpoint | F5 | F05 | SPEC-008 |
| US-5.2 | List All Bottles via API | F5 | F05 | SPEC-005, SPEC-009, SPEC-011 |
| US-5.3 | Create a Bottle via API | F5 | F05 | SPEC-005, SPEC-010, SPEC-011 |
| US-5.4 | Fetch Single Bottle via API | F5 | F05 | SPEC-009, SPEC-011 |
| US-5.5 | Update a Bottle via API | F5 | F05 | SPEC-009, SPEC-010, SPEC-011 |
| US-5.6 | Delete a Bottle via API | F5 | F05 | SPEC-009, SPEC-011 |
| US-6.1 | Bottles Table Created Automatically on First Start | F6 | F06 | SPEC-001, SPEC-002, SPEC-012 |
| US-6.2 | Migration Is Idempotent — Safe to Run Repeatedly | F6 | F06 | SPEC-001, SPEC-012 |
| US-6.3 | Server Fails Fast When DATABASE_URL Is Not Set | F6 | F06 | SPEC-001 |
| US-6.4 | Data Persists Across Server Restarts | F6 | F06 | SPEC-001, SPEC-002, SPEC-012 |
| US-7.1 | App Is Fully Usable on a 375 px Mobile Screen | F7 | F07 | SPEC-014 |
| US-7.2 | App Is Readable on Desktop at 1440 px | F7 | F07 | SPEC-004, SPEC-014 |
| US-7.3 | Primary Buttons Use Gold Accent Color | F7 | F07 | SPEC-014 |
| US-7.4 | All Form Inputs Have Visible Labels | F7 | F07 | SPEC-006, SPEC-007, SPEC-014 |
| US-7.5 | App Loads Inside an Iframe Without Being Blocked | F7 | F07 | SPEC-013 |

---

## 4. Requirements Detail by Feature

### F0: Bottle List Page

**PRD Reference:** F0 (P0 — Critical)
**FRD Reference:** F00
**Route:** `GET /`

**FRD Requirements:**

- **F00-REQ-01:** Server Component executes `SELECT * FROM bottles ORDER BY created_at DESC` on every page load; no client-side data fetch required on initial render.
- **F00-REQ-02:** Each bottle row renders: `name`, `vintage` (blank if null), `varietal` (blank if null), `quantity`, `location` (blank if null).
- **F00-REQ-03:** When zero rows returned and no `?q=` present → render empty-state: "No bottles yet" + "Add bottle" button.
- **F00-REQ-04:** When zero rows returned and `?q=` present → render search-empty state: "No bottles match '&lt;term&gt;'" (see F04).
- **F00-REQ-05:** Each bottle row is an anchor (`<a>`) pointing to `/bottles/[id]/edit`.
- **F00-REQ-06:** "Add bottle" button always visible; links to `/bottles/new`.
- **F00-REQ-07:** Database connection failure → render error boundary with "Unable to load cellar. Please try again." (HTTP 500).
- **F00-REQ-08:** `q` parameter sanitised via parameterised query (`$1` placeholder — never string interpolation).

**TechArch Implementation:** SPEC-003 (`app/page.tsx`), SPEC-005 (`app/api/bottles/route.ts`)

**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4

---

### F1: Add Bottle Page

**PRD Reference:** F1 (P0 — Critical)
**FRD Reference:** F01
**Route:** `GET /bottles/new` (page) + `POST /api/bottles` (API action)

**FRD Requirements:**

- **F01-REQ-01:** Form fields rendered: `name` (required), `vintage` (optional), `varietal` (optional), `quantity` (optional, defaults to 1), `location` (optional). Each with a visible `<label>`.
- **F01-REQ-02:** Client-side validation: `name` must not be blank (trimmed) before submit; abort submit with inline "Name is required" if blank.
- **F01-REQ-03:** On submit → `POST /api/bottles` with JSON body containing all fields.
- **F01-REQ-04:** Server-side validation: `name` non-empty; `vintage` integer in `[1800, currentYear+1]` if provided; `quantity` integer ≥ 1 if provided.
- **F01-REQ-05:** Validation failure → API 422; form re-rendered with all field values intact + inline error from response body.
- **F01-REQ-06:** Success → API 201; browser redirects to `/`.
- **F01-REQ-07:** "Cancel" link → navigates to `/` without submitting.
- **F01-REQ-08:** Database insert failure → API 500; form displays "Something went wrong. Please try again."

**Field validation rules:**

| Field | Rule |
|-------|------|
| `name` | Required; non-empty after `trim()`; max 255 chars |
| `vintage` | Optional; integer in `[1800, currentYear+1]` if provided; reject floats |
| `varietal` | Optional; max 255 chars |
| `quantity` | Optional; integer ≥ 1 if provided; defaults to 1; reject floats |
| `location` | Optional; max 500 chars |

**TechArch Implementation:** SPEC-006 (`app/bottles/new/page.tsx`), SPEC-005 (`app/api/bottles/route.ts`), SPEC-010 (API Validation)

**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4

---

### F2: Edit Bottle Page

**PRD Reference:** F2 (P0 — Critical)
**FRD Reference:** F02
**Route:** `GET /bottles/[id]/edit` (page) + `PUT /api/bottles/[id]` (API action)

**FRD Requirements:**

- **F02-REQ-01:** Server Component fetches bottle from DB (or via `GET /api/bottles/[id]`) and pre-populates all five form fields.
- **F02-REQ-02:** If `[id]` not a valid positive integer or bottle not found → render "Bottle not found" with link to `/` (not a crash).
- **F02-REQ-03:** Client-side `name` blank check before submit (same rule as F01).
- **F02-REQ-04:** Form submits full set of all five fields to `PUT /api/bottles/[id]` (full replacement semantics).
- **F02-REQ-05:** Server-side validation same as F01 except `quantity` may be 0 (record a finished bottle).
- **F02-REQ-06:** Success → API 200; browser redirects to `/`.
- **F02-REQ-07:** Validation failure → API 422; form re-rendered with submitted values intact + inline error.
- **F02-REQ-08:** PUT missing `id` → 404; PUT DB failure → 500.

**TechArch Implementation:** SPEC-007 (`app/bottles/[id]/edit/page.tsx`), SPEC-009 (`app/api/bottles/[id]/route.ts`), SPEC-010 (API Validation)

**User Stories:** US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6

---

### F3: Delete Bottle

**PRD Reference:** F3 (P0 — Critical)
**FRD Reference:** F03
**Route:** Action on `/bottles/[id]/edit` → `DELETE /api/bottles/[id]`

**FRD Requirements:**

- **F03-REQ-01:** "Delete" button present on `/bottles/[id]/edit`.
- **F03-REQ-02:** Click triggers `window.confirm("Delete this bottle?")` — browser-native dialog; no custom modal.
- **F03-REQ-03:** If dialog cancelled → no API call made; user stays on edit page; no state changes.
- **F03-REQ-04:** If dialog confirmed → `DELETE /api/bottles/[id]`; API executes `DELETE FROM bottles WHERE id = $1`.
- **F03-REQ-05:** Success → API 204 No Content; browser redirects to `/`.
- **F03-REQ-06:** Bottle not found → API 404; inline error: "This bottle could not be deleted. It may have already been removed."
- **F03-REQ-07:** DB failure → API 500; inline error: "Something went wrong. Please try again."

**TechArch Implementation:** SPEC-007 (`app/bottles/[id]/edit/page.tsx`), SPEC-009 (`app/api/bottles/[id]/route.ts`)

**User Stories:** US-3.1, US-3.2

---

### F4: Search / Filter by Name

**PRD Reference:** F4 (P1 — High)
**FRD Reference:** F04
**Route:** `GET /?q=<term>` + `GET /api/bottles?q=<term>`

**FRD Requirements:**

- **F04-REQ-01:** Search `<input>` rendered at top of list page; pre-populated with current `?q=` value.
- **F04-REQ-02:** On input change → debounce ≤ 500 ms → `router.replace('/?q=<term>')` (not `push`).
- **F04-REQ-03:** URL update triggers Server Component re-render with new `q` value — no full page reload, no separate client-side API fetch.
- **F04-REQ-04:** `q` absent or blank → SQL: `SELECT * FROM bottles ORDER BY created_at DESC` (all rows).
- **F04-REQ-05:** `q` non-empty → SQL: `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `$1 = '%' + term + '%'`.
- **F04-REQ-06:** Zero results + `q` non-empty → search-empty state: "No bottles match '&lt;term&gt;'".
- **F04-REQ-07:** Zero results + `q` absent → cellar-empty state: "No bottles yet" (same as F00).
- **F04-REQ-08:** `q` max 500 chars; whitespace-only treated as absent; parameterised query (never interpolated).

**TechArch Implementation:** SPEC-003 (`app/page.tsx`), SPEC-005 (`app/api/bottles/route.ts`), SPEC-009 (`app/api/bottles/[id]/route.ts`)

**User Stories:** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5

---

### F5: REST API

**PRD Reference:** F5 (P0 — Critical)
**FRD Reference:** F05, Y1-api (REST API Catalog)
**Routes:** `/api/health`, `/api/bottles`, `/api/bottles/[id]`

**FRD Requirements — per endpoint:**

- **F05-REQ-01 (`GET /api/health`):** Returns `200 {"status":"ok"}` immediately; no DB call; used by K8s liveness probe.
- **F05-REQ-02 (`GET /api/bottles`):** Returns `200` with JSON array (may be empty `[]`); supports optional `?q=` ILIKE filter; 500 on DB failure.
- **F05-REQ-03 (`POST /api/bottles`):** Validates body (see F01); on success inserts row and returns `201` with created record; errors: 400 (bad JSON), 422 (validation), 500 (DB).
- **F05-REQ-04 (`GET /api/bottles/[id]`):** Parses `id` as positive integer; returns `200` with bottle or `404 {"error":"Not found"}` if id invalid or not in DB.
- **F05-REQ-05 (`PUT /api/bottles/[id]`):** Validates body (see F02, `quantity` ≥ 0); full column replacement; returns `200` with updated record; errors: 400, 404, 422, 500.
- **F05-REQ-06 (`DELETE /api/bottles/[id]`):** Parses `id`; hard-deletes row; returns `204` (empty body); `404` if not found.
- **F05-REQ-07 (Cross-cutting):** All responses `Content-Type: application/json`; all errors shape `{"error":"<message>"}`. No authentication required.
- **F05-REQ-08 (Cross-cutting):** `id` path param must parse as positive integer via `parseInt(id, 10)`; `NaN`, `0`, negative → 404.

**Response shape for all bottle read endpoints:**
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

**TechArch Implementation:** SPEC-008 (health), SPEC-005 (GET+POST /api/bottles), SPEC-009 (GET/PUT/DELETE /api/bottles/[id]), SPEC-010 (validation), SPEC-011 (TypeScript interfaces)

**User Stories:** US-5.1, US-5.2, US-5.3, US-5.4, US-5.5, US-5.6

---

### F6: Database Auto-Migration

**PRD Reference:** F6 (P0 — Critical)
**FRD Reference:** F06, Y0-schema (Database Schema)
**File:** `scripts/migrate.mjs`

**FRD Requirements:**

- **F06-REQ-01:** `migrate.mjs` is an ESM module invoked as `node scripts/migrate.mjs` before every server start.
- **F06-REQ-02:** Reads `process.env.DATABASE_URL`; if absent/empty → stderr `"ERROR: DATABASE_URL environment variable is not set"` + `process.exit(1)`.
- **F06-REQ-03:** Connects via `pg.Client` using `DATABASE_URL`; connection failure → stderr + `process.exit(1)`.
- **F06-REQ-04:** Executes `CREATE TABLE IF NOT EXISTS bottles (...)` (idempotent DDL; never `DROP`, `TRUNCATE`, or `ALTER`).
- **F06-REQ-05:** DDL failure → stderr `"ERROR: Migration failed: <pg error message>"` + `process.exit(1)`.
- **F06-REQ-06:** Success → stdout `"Migration complete."` + `process.exit(0)`.
- **F06-REQ-07:** `package.json` scripts: `"dev": "npm run migrate && next dev -p 3000"` and `"start": "npm run migrate && next start -p 3000"`; `build` does NOT run migrate.

**DDL (canonical):**
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

**TechArch Implementation:** SPEC-001 (`scripts/migrate.mjs`), SPEC-002 (`lib/db.ts`), SPEC-012 (`bottles` table DDL)

**User Stories:** US-6.1, US-6.2, US-6.3, US-6.4

---

### F7: Brand & Mobile-First UI

**PRD Reference:** F7 (P1 — High)
**FRD Reference:** F07
**Applies to:** All pages

**FRD Requirements:**

- **F07-REQ-01:** CSS custom properties defined globally: `--color-accent: #FBCA5C`, `--color-text: #0A0A0A`, `--color-surface: #FFFFFF`.
- **F07-REQ-02:** Root layout max-width container (e.g. `max-width: 480px; margin: 0 auto`) for mobile-on-desktop centering.
- **F07-REQ-03:** Mobile-first CSS — smallest viewport (375 px) base; wider breakpoints via `@media (min-width: ...)`.
- **F07-REQ-04:** Primary buttons: `background: var(--color-accent)`, `color: var(--color-text)`; `min-height: 44px`, `min-width: 44px`.
- **F07-REQ-05:** All `<input>` and `<select>` elements have an associated visible `<label htmlFor="...">` (not placeholder-only, not `sr-only`).
- **F07-REQ-06:** All pages render at 375 px without horizontal scroll; no fixed-width elements wider than 100 vw.
- **F07-REQ-07:** `next.config.mjs` exports `headers()` that sets `X-Frame-Options: SAMEORIGIN` (never `DENY`); no `frame-ancestors 'none'` CSP directive anywhere.
- **F07-REQ-08:** No external CSS framework (`@import` of Bootstrap, Tailwind CDN, etc. prohibited).
- **F07-REQ-09:** `next.config.mjs` must be `.mjs` (ESM) — never `.ts`.

**TechArch Implementation:** SPEC-013 (`next.config.mjs`), SPEC-014 (`styles/globals.css`), SPEC-004 (`app/layout.tsx`)

**User Stories:** US-7.1, US-7.2, US-7.3, US-7.4, US-7.5

---

## 5. Test Case Coverage Matrix

### 5.1 Test Cases Definition

The following test cases are derived from user story acceptance criteria. Each maps to one or more user stories and covers a distinct verifiable behaviour.

| Test ID | Test Description | Story ID(s) | Feature | Priority | Type |
|---------|-----------------|-------------|---------|----------|------|
| TEST-001 | `GET /` renders bottle list with name, vintage, varietal, quantity, location for all stored bottles | US-0.1 | F0 | P0 | Integration |
| TEST-002 | `GET /` renders "No bottles yet" and "Add bottle" button when `bottles` table is empty | US-0.2 | F0 | P0 | Integration |
| TEST-003 | Each bottle row on `/` is a link to `/bottles/[id]/edit` with correct `id` and tap target ≥ 44 px | US-0.3 | F0 | P0 | UI |
| TEST-004 | "Add bottle" button on `/` navigates to `/bottles/new` | US-0.4 | F0 | P0 | UI |
| TEST-005 | Submit add-bottle form with all 5 fields → 201 created; bottle appears on `/` with all field values | US-1.1 | F1 | P0 | E2E |
| TEST-006 | Submit add-bottle form with name only → 201 created; bottle appears with quantity=1; other fields blank | US-1.2 | F1 | P0 | E2E |
| TEST-007 | Submit add-bottle form with blank name → client-side inline "Name is required"; no POST request made | US-1.3 | F1 | P0 | UI |
| TEST-008 | Click "Cancel" on `/bottles/new` → navigates to `/`; no bottle created | US-1.4 | F1 | P0 | UI |
| TEST-009 | `/bottles/[id]/edit` pre-populates all 5 fields with current DB values | US-2.1 | F2 | P0 | Integration |
| TEST-010 | Edit page: change quantity 3→2, save → redirects to `/`; list shows quantity=2 | US-2.2 | F2 | P0 | E2E |
| TEST-011 | Edit page: change name and location, save → updated values persist after page reload | US-2.3 | F2 | P0 | E2E |
| TEST-012 | Edit page: clear name, save → inline "Name is required"; DB record unchanged | US-2.4 | F2 | P0 | UI/Integration |
| TEST-013 | Click "Cancel" on edit page → navigates to `/`; no PUT request; DB record unchanged | US-2.5 | F2 | P0 | UI |
| TEST-014 | Navigate to `/bottles/99999/edit` → "Bottle not found" message + link to `/`; no crash | US-2.6 | F2 | P0 | Integration |
| TEST-015 | Navigate to `/bottles/abc/edit` → "Bottle not found" message + link to `/` | US-2.6 | F2 | P0 | Integration |
| TEST-016 | Delete button on edit page → `window.confirm` → OK → `DELETE /api/bottles/[id]` → 204 → redirect to `/`; bottle gone from list | US-3.1 | F3 | P0 | E2E |
| TEST-017 | Delete button → `window.confirm` → Cancel → no DELETE request; user stays on edit page; bottle unchanged | US-3.2 | F3 | P0 | UI |
| TEST-018 | Search input on `/`; type "cay" → list narrows to bottles containing "cay" (case-insensitive); URL updates to `/?q=cay` | US-4.1, US-4.2 | F4 | P1 | E2E |
| TEST-019 | Search "CAYMUS", "caymus", "CaYmUs" each return same bottle "Caymus" | US-4.2 | F4 | P1 | Integration |
| TEST-020 | Search with no matching bottles → "No bottles match '&lt;term&gt;'" displayed; distinct from "No bottles yet" | US-4.3 | F4 | P1 | Integration |
| TEST-021 | Clear search input and navigate to `/` → full bottle list restored; no `?q=` in URL | US-4.4 | F4 | P1 | E2E |
| TEST-022 | Load `/?q=caymus` directly → list filtered; search input pre-populated with "caymus" | US-4.5 | F4 | P1 | Integration |
| TEST-023 | `GET /api/health` → 200 `{"status":"ok"}`, `Content-Type: application/json`, within 200 ms | US-5.1 | F5 | P0 | API |
| TEST-024 | `GET /api/bottles` → 200 with array of all bottles; `GET /api/bottles` when empty → 200 `[]` | US-5.2 | F5 | P0 | API |
| TEST-025 | `GET /api/bottles?q=caymus` → 200 with only matching bottles (ILIKE) | US-5.2 | F5 | P0 | API |
| TEST-026 | `POST /api/bottles` with all fields → 201 with created record including `id` and `created_at` | US-5.3 | F5 | P0 | API |
| TEST-027 | `POST /api/bottles` missing `name` → 422 `{"error":"Name is required"}` | US-5.3 | F5 | P0 | API |
| TEST-028 | `POST /api/bottles` with `quantity=0` → 422 `{"error":"Quantity must be at least 1"}` | US-5.3 | F5 | P0 | API |
| TEST-029 | `GET /api/bottles/[id]` existing → 200 with bottle object | US-5.4 | F5 | P0 | API |
| TEST-030 | `GET /api/bottles/99999` → 404 `{"error":"Not found"}` | US-5.4 | F5 | P0 | API |
| TEST-031 | `GET /api/bottles/abc` → 404 `{"error":"Not found"}` | US-5.4 | F5 | P0 | API |
| TEST-032 | `PUT /api/bottles/[id]` with updated quantity → 200 with updated record; subsequent GET reflects change | US-5.5 | F5 | P0 | API |
| TEST-033 | `PUT /api/bottles/[id]` with `quantity=0` → 200 (finished bottle allowed on PUT) | US-5.5 | F5 | P0 | API |
| TEST-034 | `PUT /api/bottles/[id]` with `quantity=-1` → 422 `{"error":"Quantity cannot be negative"}` | US-5.5 | F5 | P0 | API |
| TEST-035 | `PUT /api/bottles/99999` → 404 `{"error":"Not found"}` | US-5.5 | F5 | P0 | API |
| TEST-036 | `DELETE /api/bottles/[id]` existing → 204 empty body; subsequent `GET /api/bottles` omits deleted bottle | US-5.6 | F5 | P0 | API |
| TEST-037 | `DELETE /api/bottles/99999` → 404 `{"error":"Not found"}` | US-5.6 | F5 | P0 | API |
| TEST-038 | `npm run dev` on fresh DB → `bottles` table created; `POST /api/bottles` inserts successfully; "Migration complete." logged | US-6.1 | F6 | P0 | Integration |
| TEST-039 | Run `npm run migrate` twice → exits 0 both times; existing records intact; no error logged | US-6.2 | F6 | P0 | Integration |
| TEST-040 | `DATABASE_URL` unset → `npm run migrate` exits non-zero; stderr includes "DATABASE_URL"; Next.js does not start | US-6.3 | F6 | P0 | Integration |
| TEST-041 | Add bottle, reload page → bottle still in list (data persisted in PostgreSQL, not client storage) | US-6.4 | F6 | P0 | E2E |
| TEST-042 | All pages render without horizontal scroll at 375 px viewport; all interactive elements ≥ 44×44 px | US-7.1 | F7 | P1 | UI |
| TEST-043 | All pages render without overflow or overlap at 1440 px viewport; content centred | US-7.2 | F7 | P1 | UI |
| TEST-044 | Submit buttons on add/edit pages have `background: #FBCA5C`; Gold not used as full-page/card background | US-7.3 | F7 | P1 | UI |
| TEST-045 | Every `<input>` on `/bottles/new` and `/bottles/[id]/edit` has a visible associated `<label>` | US-7.4 | F7 | P1 | UI |
| TEST-046 | App loads inside `<iframe>` without browser block; response headers: no `X-Frame-Options: DENY`, no `frame-ancestors 'none'` | US-7.5 | F7 | P1 | Integration |

### 5.2 Coverage Summary by Feature

| PRD Feature | User Stories | Test Cases | P0 Tests | P1 Tests | Coverage |
|-------------|-------------|------------|----------|----------|----------|
| F0: Bottle List Page | 4 (US-0.1–0.4) | TEST-001–004 | 4 | 0 | 100% |
| F1: Add Bottle Page | 4 (US-1.1–1.4) | TEST-005–008 | 4 | 0 | 100% |
| F2: Edit Bottle Page | 6 (US-2.1–2.6) | TEST-009–015 | 7 | 0 | 100% |
| F3: Delete Bottle | 2 (US-3.1–3.2) | TEST-016–017 | 2 | 0 | 100% |
| F4: Search / Filter | 5 (US-4.1–4.5) | TEST-018–022 | 0 | 5 | 100% |
| F5: REST API | 6 (US-5.1–5.6) | TEST-023–037 | 15 | 0 | 100% |
| F6: Database Migration | 4 (US-6.1–6.4) | TEST-038–041 | 4 | 0 | 100% |
| F7: Brand & Mobile UI | 5 (US-7.1–7.5) | TEST-042–046 | 0 | 5 | 100% |
| **Totals** | **36 stories** | **46 test cases** | **36** | **10** | **100%** |

### 5.3 Test Type Distribution

| Type | Count | Description |
|------|-------|-------------|
| API | 15 | Direct HTTP endpoint tests (status codes, response bodies, error shapes) |
| E2E | 7 | Full browser flows (add → list, edit → list, delete → list, search → results) |
| Integration | 14 | Server-side rendering, DB interactions, migration, iframe headers |
| UI | 10 | Client-side validation, navigation, layout, tap targets, labels |
| **Total** | **46** | |

### 5.4 UAT Scenario Mapping (from UserStories-CellarLite.md)

| UAT Scenario | Story IDs | Test Cases |
|---|---|---|
| US1: View cellar — list with fields; empty state | US-0.1, US-0.2 | TEST-001, TEST-002 |
| US2: Add bottle — fill all fields, see in list | US-1.1 | TEST-005 |
| US3: Edit bottle — change quantity 3→2, verify list | US-2.2 | TEST-010 |
| US4: Delete bottle — confirm dialog, gone from list | US-3.1 | TEST-016 |
| US5: Search — partial name narrows list | US-4.1, US-4.2 | TEST-018, TEST-019 |
| US6: Persistence — data survives page reload | US-6.4 | TEST-041 |

---

## 6. Change Management Log

| Version | Date | Author | Change Description | Affected Items |
|---------|------|--------|--------------------|----------------|
| 1.0 | 2026-06-13 | CellarLite Team | Initial RTM creation — baseline traceability for all 8 PRD features (F0–F7), 36 user stories (US-0.1–US-7.5), 14 TechArch specs (SPEC-001–SPEC-014), 46 test cases (TEST-001–TEST-046) | All |

---

## 7. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | — | _________________ | ___________ |
| Lead Engineer | — | _________________ | ___________ |
| QA Lead | — | _________________ | ___________ |
| Tech Lead / Architect | — | _________________ | ___________ |

**Document Status:** Active — v1.0 baseline

**Sign-off Criteria:**
- [ ] All 8 PRD features (F0–F7) have at least one FRD section, one TechArch spec, and at least one user story.
- [ ] All 36 user stories are covered by at least one test case.
- [ ] All 46 test cases have a corresponding user story and PRD feature.
- [ ] No TechArch spec is orphaned (every SPEC-XXX maps to at least one FRD requirement).
- [ ] All `id` path parameter handling (invalid integer, zero, negative, non-existent) is covered by test cases (TEST-014, TEST-015, TEST-030, TEST-031, TEST-035, TEST-037).

---

*Document generated: 2026-06-13 | Based on: PRD-CellarLite.md v1.0 · FRD-CellarLite.md v1.0 · TechArch-CellarLite.md v1.0 · UserStories-CellarLite.md v1.0*
