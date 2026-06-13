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
