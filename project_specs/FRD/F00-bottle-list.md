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
