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
4. On input change (or form submit): update URL to `/?q=<encoded-term>` and trigger page re-render.
   - Implementation: use a Client Component with `router.push` / `router.replace`, or a plain HTML `<form method="GET">` submitting to `/`.
   - The URL update causes the Server Component to re-fetch with the new `q`.
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
