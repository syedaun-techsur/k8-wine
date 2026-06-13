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
- `quantity` (integer, optional): Updated quantity. Must be ≥ 0 (allow 0 to record "finished" bottles); defaults preserved if absent.
- `location` (string, optional): Updated location. Rules identical to F01.

> **Note on quantity:** Edit allows `quantity = 0` (bottle "finished") while Add requires `quantity ≥ 1`. This lets the user record that they've consumed the last bottle without deleting the record.

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
