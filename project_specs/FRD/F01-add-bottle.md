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
