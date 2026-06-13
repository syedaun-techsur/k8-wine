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
