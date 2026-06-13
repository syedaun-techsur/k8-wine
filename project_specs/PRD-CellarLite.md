# PRD: CellarLite
**Product Requirements Document**
**Project Acronym:** CellarLite
**Version:** 1.0
**Date:** 2026-06-13
**Status:** Active

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Technical Architecture](#4-technical-architecture)
5. [Feature Requirements](#5-feature-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Success Metrics](#7-success-metrics)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Feature Index](#9-feature-index)

---

## 1. Executive Summary

CellarLite is a personal, single-user, mobile-first wine-cellar web application that lets an individual track their bottle collection — what they have, where it is stored, and how many are left. Built on Next.js 14 (App Router) with a PostgreSQL backend accessed via raw SQL, it delivers a fast, reliable CRUD experience with zero authentication overhead. The MVP ships the essential bottle-management workflow, validated entirely through real usage.

---

## 2. Problem Statement

Wine collectors — even casual ones — struggle to keep track of their physical cellar using mental notes, spreadsheets, or generic apps that are overkill for a single person's needs.

**Core pain points:**

- No quick way to answer "Do I still have that bottle, and where is it?" without going to the physical cellar.
- Spreadsheets require a laptop and lack a mobile-friendly interface.
- Full wine-management apps (e.g., Vivino, CellarTracker) are multi-user, socially-oriented, and add cognitive overhead for a personal-use case.
- Changes to quantity or location after opening or moving bottles have no lightweight, always-available record.

**Consequence:** Bottles are forgotten, over-purchased, or under-appreciated because there is no fast, mobile-accessible, authoritative record of what is in the cellar.

---

## 3. Product Vision

**Vision Statement:**
> A single person can know exactly what bottles are in their cellar — and update that knowledge in seconds — from any device, without logging in.

**Strategic Goals:**

- Ship the fastest possible path from "I opened a bottle" to "quantity updated in my record."
- Deliver a mobile-first experience that feels native on a phone screen.
- Keep the data model and codebase minimal so the app is trivial to maintain and extend.
- Establish a stable, tested REST API foundation that future features (ratings, images, export) can build upon without breaking changes.
- Run reliably in the Pivota K8s sandbox with zero manual database setup — migrations run automatically on every server start.

---

## 4. Technical Architecture

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | Server Components + Client Components as needed |
| Language | TypeScript (app code) / JavaScript (config) | `next.config.mjs` — never `.ts` config |
| Database Driver | `pg` (node-postgres) | Raw SQL; no ORM |
| Database | PostgreSQL 16 | Co-resident container on `localhost:5432` |
| Styling | Plain CSS / CSS Modules | Mobile-first; no CSS framework |
| Hosting | Pivota K8s sandbox | App binds to `0.0.0.0:3000` |
| Config | Environment variables | `DATABASE_URL` as single source of truth |
| Migrations | Custom `migrate.mjs` script | Idempotent `CREATE TABLE IF NOT EXISTS`; auto-runs on `dev` and `start` |

**Data Model — single table:**

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

**API Surface:**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check — returns `200 {"status":"ok"}` |
| GET | `/api/bottles` | List all bottles; supports `?q=` search |
| POST | `/api/bottles` | Create a new bottle |
| GET | `/api/bottles/[id]` | Fetch a single bottle |
| PUT | `/api/bottles/[id]` | Update a bottle |
| DELETE | `/api/bottles/[id]` | Delete a bottle |

---

## 5. Feature Requirements

### F0: Bottle List Page (`/`)

**Description:** The home page displays the user's entire wine collection as a scrollable, mobile-friendly list. Each row shows the bottle name, vintage, varietal, current quantity, and storage location. When the cellar is empty, a friendly empty-state message ("No bottles yet") is shown alongside an "Add bottle" call-to-action button.

**Capabilities:**
- Fetch all bottles from `GET /api/bottles` on page load (server-rendered).
- Render each bottle as a card or list row with: name, vintage, varietal, quantity, location.
- Display empty state with message and prominent "Add bottle" button when the collection is empty.
- Each bottle row is tappable / clickable and navigates to `/bottles/[id]/edit`.
- "Add bottle" button navigates to `/bottles/new`.
- Page is responsive and usable on a 375 px wide mobile screen without horizontal scrolling.

**Priority:** P0 (Critical — MVP landing experience)

---

### F1: Add Bottle Page (`/bottles/new`)

**Description:** A form page that lets the user add a new bottle to the collection. Only the bottle name is required; vintage, varietal, quantity, and location are optional fields. On successful submission the user is redirected back to the list page.

**Capabilities:**
- Form fields: name (required, text), vintage (optional, number), varietal (optional, text), quantity (optional, number — defaults to 1), location (optional, text).
- Client-side validation: name must not be blank before submit.
- Submits via `POST /api/bottles`.
- On success: redirect to `/` (list page).
- On error: display inline error message without losing form data.
- "Cancel" link returns to `/` without saving.
- Mobile-friendly form layout with large tap targets.

**Priority:** P0 (Critical — MVP create flow)

---

### F2: Edit Bottle Page (`/bottles/[id]/edit`)

**Description:** A pre-populated form page for modifying an existing bottle's details. The most common action is decrementing quantity after opening a bottle. The page also hosts the delete action.

**Capabilities:**
- Load existing bottle data from `GET /api/bottles/[id]` and pre-populate all fields.
- Editable fields: name, vintage, varietal, quantity, location.
- Submits changes via `PUT /api/bottles/[id]`.
- On success: redirect to `/`.
- On error: display inline error message.
- "Cancel" link returns to `/` without saving.
- Mobile-friendly form layout identical in structure to the Add page.

**Priority:** P0 (Critical — MVP edit flow)

---

### F3: Delete Bottle

**Description:** From the edit page, the user can permanently remove a bottle from the collection. A browser-native confirmation dialog prevents accidental deletion.

**Capabilities:**
- "Delete" button present on `/bottles/[id]/edit`.
- Triggers `window.confirm("Delete this bottle?")` before proceeding.
- On confirmation: calls `DELETE /api/bottles/[id]`.
- On success: redirect to `/`.
- On cancellation: no action taken; user remains on edit page.

**Priority:** P0 (Critical — MVP delete flow)

---

### F4: Search / Filter by Name

**Description:** The list page supports filtering bottles by name via a query-string parameter `?q=`. A search input on the list page allows the user to type a name fragment; the filtered results update the visible list. The search is case-insensitive and matches partial names.

**Capabilities:**
- Search input rendered at the top of the list page.
- Input value is synced to `?q=` query parameter (browser URL updates on change or submit).
- `GET /api/bottles?q=<term>` performs a case-insensitive `ILIKE '%term%'` SQL filter.
- When `?q=` is empty or absent, all bottles are returned.
- Empty search results show a contextual message (e.g., "No bottles match 'rioja'") distinct from the empty-cellar state.
- Search state is preserved on page reload (URL-driven).

**Priority:** P1 (High — core usability feature)

---

### F5: REST API

**Description:** A complete RESTful JSON API backs all UI interactions and is independently usable for scripting or future integrations. All endpoints return JSON and use standard HTTP status codes.

**Capabilities:**
- `GET /api/health` → `200 {"status":"ok"}` — used by K8s liveness probes.
- `GET /api/bottles` → `200 [{...}, ...]` — returns all bottles, supports `?q=` filter.
- `POST /api/bottles` → `201 {...}` — creates bottle; requires `name`; returns created record.
- `GET /api/bottles/[id]` → `200 {...}` or `404 {"error":"Not found"}`.
- `PUT /api/bottles/[id]` → `200 {...}` or `404` — updates bottle fields.
- `DELETE /api/bottles/[id]` → `204` (no body) or `404`.
- All error responses use `{"error": "<message>"}` shape.
- No authentication headers required.

**Priority:** P0 (Critical — all UI depends on API)

---

### F6: Database Auto-Migration

**Description:** On every server start (both `dev` and `start` npm scripts), a migration script runs before Next.js boots. It creates the `bottles` table if it does not exist (idempotent). No manual database setup is ever required.

**Capabilities:**
- `migrate.mjs` script executes `CREATE TABLE IF NOT EXISTS bottles (...)`.
- Script is run via `npm run migrate`, which is chained before `next dev` and `next start` in `package.json`.
- Connects using `DATABASE_URL` environment variable.
- Exits with code 0 on success, non-zero on connection failure (causing server startup to abort with a clear error).
- Idempotent — safe to run on every start against an already-initialized database.

**Priority:** P0 (Critical — app cannot function without table)

---

### F7: Brand & Mobile-First UI

**Description:** The visual design follows the TechSur brand palette and is optimized for mobile screens first. The accent color (Gold `#FBCA5C`) is used sparingly (≤10% of any view) on near-black (`#0A0A0A`) text with white surfaces.

**Capabilities:**
- All pages render correctly at 375 px viewport width without horizontal scroll.
- Gold `#FBCA5C` used for primary buttons, active states, and key accents — not backgrounds.
- Text color `#0A0A0A` on white (`#FFFFFF`) card/surface backgrounds.
- Tap targets ≥ 44 × 44 px for all interactive elements.
- No CSS framework dependency — plain CSS or CSS Modules only.
- No `X-Frame-Options: DENY` or `frame-ancestors 'none'` headers emitted (app renders inside iframe preview).

**Priority:** P1 (High — core UX and platform requirement)

---

## 6. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | List page initial load (server-rendered) | < 1 s on localhost |
| Performance | API response time for any single endpoint | < 200 ms p95 |
| Reliability | Auto-migration idempotency | Zero failures on repeated starts |
| Reliability | Data persistence across server restarts | 100% — PostgreSQL is the source of truth |
| Compatibility | Viewport support | 375 px (mobile) through 1440 px (desktop) |
| Accessibility | Tap / click targets | ≥ 44 × 44 px |
| Accessibility | Form labels | All inputs have visible `<label>` elements |
| Security | No hard-coded credentials | `DATABASE_URL` env var only |
| Security | No iframe-blocking headers | `X-Frame-Options` and CSP `frame-ancestors` must not deny iframes |
| Maintainability | Config file format | `next.config.mjs` — not `.ts` |
| Maintainability | No ORM | Raw SQL via `pg` for transparency |
| Deployability | Server bind address | `0.0.0.0:3000` |
| Deployability | No Docker artifacts | No `Dockerfile`, no `docker-compose.yml` |

---

## 7. Success Metrics

**MVP is successful when all of the following are true:**

- **F0 renders correctly:** `GET /` returns a page that displays the bottle list (or empty state) with no JavaScript errors in the console.
- **Full CRUD works end-to-end:** A bottle can be added, viewed in the list, edited (name + quantity), and deleted — with data persisted across a server restart.
- **Search returns correct results:** `GET /api/bottles?q=test` returns only bottles whose name matches "test" (case-insensitive); an absent or empty `?q=` returns all bottles.
- **Health endpoint responds:** `GET /api/health` returns `200 {"status":"ok"}` within 200 ms.
- **Migration is idempotent:** Running `npm run migrate` twice against the same database produces no error and leaves the table intact with its data.
- **Mobile layout is usable:** All pages render without horizontal scrolling at 375 px viewport width and all interactive elements are reachable by thumb.
- **No iframe-blocking headers:** The app loads inside an iframe preview without being blocked by `X-Frame-Options` or CSP errors.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `DATABASE_URL` not set at startup | Low | High — app crashes immediately | Migration script exits with clear error message; `npm run dev` fails fast with readable output |
| `next.config.ts` accidentally used | Medium | High — Next 14 hard-errors on `.ts` config | Constraint documented; config file named `next.config.mjs` and enforced in code review |
| iframe-blocking headers introduced by Next.js defaults or middleware | Medium | High — preview breaks silently | Explicit `headers()` config in `next.config.mjs` to override any defaults; verified in integration test |
| PostgreSQL connection refused (port 5432 not ready) | Low | High — startup fails | Migration script retries or provides actionable error; K8s readiness probes handle orchestration |
| Accidental deletion (no undo) | Medium | Low — single user, personal data | `window.confirm()` guard on delete; out-of-scope: soft-delete / undo for post-MVP |
| Bundle size bloat from unneeded dependencies | Low | Low — MVP scope is narrow | No CSS framework, no ORM, minimal dependencies enforced in `package.json` |
| `SERIAL` id gaps after deletes | Low | None — cosmetic only | Accepted; no requirement for gapless IDs |

---

## 9. Feature Index

| ID | Feature | Priority | Page / Endpoint | Status |
|---|---|---|---|---|
| F0 | Bottle List Page | P0 | `/` | Planned |
| F1 | Add Bottle Page | P0 | `/bottles/new` | Planned |
| F2 | Edit Bottle Page | P0 | `/bottles/[id]/edit` | Planned |
| F3 | Delete Bottle | P0 | `/bottles/[id]/edit` (action) | Planned |
| F4 | Search / Filter by Name | P1 | `/` + `GET /api/bottles?q=` | Planned |
| F5 | REST API | P0 | `/api/bottles`, `/api/health` | Planned |
| F6 | Database Auto-Migration | P0 | `migrate.mjs` + `npm run migrate` | Planned |
| F7 | Brand & Mobile-First UI | P1 | All pages | Planned |

**Priority Key:**
- **P0** — Critical. MVP is not shippable without this.
- **P1** — High. Ships in MVP; degrades experience if missing.
- **P2** — Medium. Desirable; deferred to post-MVP if time-constrained.
- **P3** — Low. Nice-to-have; explicitly out of scope for this MVP.

**Out-of-Scope (for reference):**
Authentication, multi-user support, image uploads, tasting notes, ratings, import/export, pagination, AI recommendations, Docker/docker-compose, quantity-zero deletion nudge (suggest delete when quantity reaches 0 — post-MVP UX enhancement).

---

*Document generated: 2026-06-13 | Next: FRD-CellarLite.md, TechArch-CellarLite.md, UserStories-CellarLite.md*
