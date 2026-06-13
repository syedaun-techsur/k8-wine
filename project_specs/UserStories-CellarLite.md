# User Stories: CellarLite
**Document Type:** User Stories
**Project Acronym:** CellarLite
**Version:** 1.0
**Date:** 2026-06-13
**Status:** Active
**Based on:** PRD-CellarLite.md v1.0, FRD-CellarLite.md v1.0, PERSONAS-CellarLite.md v1.0

---

## Personas

| ID | Name | Mode | Description |
|---|---|---|---|
| PER-01 | Alex (Cellar Mode) | Write — at the physical cellar | Adding, editing, removing bottles; phone in one hand, bottle in the other |
| PER-02 | Alex (Planning Mode) | Read — away from the cellar | Browsing, searching, checking quantities at a shop or restaurant |

> Both personas are the same person in different contexts. "Alex" is used throughout stories; the mode is indicated where relevant.

---

## Epic 0: Bottle List Page (F0)

_The home page is Alex's primary daily-use screen. It shows the full collection at a glance and serves as the launchpad for all CRUD actions._

### US-0.1: View Full Bottle List
**As** Alex (Planning Mode), **I want to** open the app and immediately see my entire wine collection, **so that** I can answer "what do I have?" without going to the cellar.

**Acceptance Criteria:**
- [ ] Navigating to `/` renders a page without a login screen or onboarding flow
- [ ] Each bottle in the collection is displayed as a list row or card showing: name, vintage, varietal, quantity, and location
- [ ] Bottles are ordered newest-first (by `created_at`)
- [ ] The page is server-rendered — the list is visible without a client-side loading spinner on initial load
- [ ] The page title or heading reads "My Cellar" (or equivalent brand heading)

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.2: View Empty-State When Cellar Has No Bottles
**As** Alex (Planning Mode), **I want to** see a helpful message when my cellar is empty, **so that** I know the app is working and how to add my first bottle.

**Acceptance Criteria:**
- [ ] When the `bottles` table has zero rows, the text "No bottles yet" is visible on the page
- [ ] An "Add bottle" button (or link) is visible on the page in the empty state
- [ ] Clicking the "Add bottle" button navigates to `/bottles/new`
- [ ] No bottle rows or cards are rendered in the empty state
- [ ] The empty-state message is distinct from the search-empty state (no `?q=` parameter present)

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.3: Navigate to Edit Page from List Row
**As** Alex (Cellar Mode), **I want to** tap any bottle row in the list to open its edit page, **so that** I can update its quantity or details in one tap.

**Acceptance Criteria:**
- [ ] Each bottle row in the list is tappable / clickable
- [ ] Clicking a bottle row navigates to `/bottles/[id]/edit` for that bottle
- [ ] The link target is the correct bottle `id` — not a generic route
- [ ] The tap target for each row is at least 44 px tall

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.4: Navigate to Add Bottle from List Page
**As** Alex (Cellar Mode), **I want to** tap an "Add bottle" button on the list page, **so that** I can record a new bottle without navigating manually.

**Acceptance Criteria:**
- [ ] An "Add bottle" button or link is visible on the list page regardless of whether the cellar is empty or populated
- [ ] Clicking "Add bottle" navigates to `/bottles/new`
- [ ] The button tap target is at least 44 × 44 px

**Priority:** P0 | **Feature Ref:** F0

---

## Epic 1: Add Bottle Page (F1)

_A form page at `/bottles/new` that lets Alex record a new bottle. Name is required; all other fields are optional._

### US-1.1: Add a New Bottle with All Fields
**As** Alex (Cellar Mode), **I want to** fill in a form with the bottle's name, vintage, varietal, quantity, and location and submit it, **so that** the bottle appears in my cellar list immediately.

**Acceptance Criteria:**
- [ ] Navigating to `/bottles/new` renders a form with fields: name, vintage, varietal, quantity, location
- [ ] Each field has a visible `<label>` above or beside it (not placeholder-only)
- [ ] Filling in name="Caymus", vintage=2019, varietal="Cabernet Sauvignon", quantity=3, location="Rack A3" and submitting the form creates the record
- [ ] After successful submission, the browser redirects to `/`
- [ ] The new bottle ("Caymus") appears in the bottle list on `/` with vintage=2019, varietal="Cabernet Sauvignon", quantity=3, location="Rack A3"

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.2: Add a Bottle with Name Only (Optional Fields Blank)
**As** Alex (Cellar Mode), **I want to** add a bottle by entering only its name and leaving all other fields blank, **so that** I can capture a bottle quickly without knowing all its details yet.

**Acceptance Criteria:**
- [ ] Submitting the form with only the name field filled (all other fields empty) succeeds
- [ ] The created bottle appears in the list with name shown and vintage, varietal, location blank/absent
- [ ] The quantity defaults to 1 when the quantity field is left blank
- [ ] Redirected to `/` after successful submission

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.3: Prevented from Submitting Without a Name
**As** Alex (Cellar Mode), **I want to** see an error if I try to submit the add-bottle form without entering a name, **so that** I don't accidentally create a nameless record.

**Acceptance Criteria:**
- [ ] Clicking submit with the name field empty (or whitespace-only) does not submit the form
- [ ] An inline error message "Name is required" is visible on the page
- [ ] All other field values entered before the failed submit are preserved in the form
- [ ] No network request is made to `POST /api/bottles` when client-side validation fails

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.4: Cancel Adding a Bottle
**As** Alex (Cellar Mode), **I want to** click a "Cancel" link on the add-bottle page to return to the list, **so that** I can abandon the form without saving anything.

**Acceptance Criteria:**
- [ ] A "Cancel" link is visible on `/bottles/new`
- [ ] Clicking "Cancel" navigates back to `/` without creating any bottle record
- [ ] No `POST /api/bottles` request is made when Cancel is clicked

**Priority:** P0 | **Feature Ref:** F1

---

## Epic 2: Edit Bottle Page (F2)

_A pre-populated form page at `/bottles/[id]/edit` for modifying an existing bottle. The most common action is decrementing quantity after opening a bottle._

### US-2.1: Open Edit Page with Pre-Populated Fields
**As** Alex (Cellar Mode), **I want to** open a bottle's edit page and see all its current details already filled in, **so that** I only need to change the field I care about.

**Acceptance Criteria:**
- [ ] Navigating to `/bottles/[id]/edit` renders a form with all five fields pre-populated: name, vintage, varietal, quantity, location
- [ ] Each pre-populated value matches the value currently stored in the database for that bottle
- [ ] Each field has a visible `<label>` above or beside it

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.2: Update Bottle Quantity
**As** Alex (Cellar Mode), **I want to** change a bottle's quantity on the edit page and save it, **so that** the list reflects the correct count after I open or move a bottle.

**Acceptance Criteria:**
- [ ] Opening the edit page for a bottle with quantity=3, changing quantity to 2, and clicking save redirects to `/`
- [ ] The bottle's row on the list page shows quantity=2 after the save
- [ ] `PUT /api/bottles/[id]` is called with the updated quantity value
- [ ] Quantity can be set to 0 (recording that the last bottle was consumed)

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.3: Update Any Bottle Field
**As** Alex (Cellar Mode), **I want to** update any combination of a bottle's fields (name, vintage, varietal, quantity, location) and save, **so that** I can correct or refine details at any time.

**Acceptance Criteria:**
- [ ] Changing the name field and saving reflects the new name in the list
- [ ] Changing the location field and saving reflects the new location in the list
- [ ] After a successful save, the browser redirects to `/`
- [ ] The updated values persist across a page reload of `/`

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.4: Prevented from Saving Without a Name
**As** Alex (Cellar Mode), **I want to** see an error if I clear the name field and try to save, **so that** I cannot corrupt a record by removing its required identifier.

**Acceptance Criteria:**
- [ ] Clearing the name field on the edit page and clicking save does not submit the form
- [ ] An inline error "Name is required" is visible on the page
- [ ] All other field values are preserved in the form after the failed validation
- [ ] The bottle record in the database is unchanged

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.5: Cancel Editing a Bottle
**As** Alex (Cellar Mode), **I want to** click "Cancel" on the edit page to return to the list without saving, **so that** I can dismiss accidental taps without corrupting my data.

**Acceptance Criteria:**
- [ ] A "Cancel" link is visible on `/bottles/[id]/edit`
- [ ] Clicking "Cancel" navigates to `/` without making a `PUT /api/bottles/[id]` request
- [ ] The bottle record in the database is unchanged after clicking Cancel

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.6: Handle Navigation to Non-Existent Bottle
**As** Alex (Planning Mode), **I want to** see a clear message if I navigate to an edit URL for a bottle that no longer exists, **so that** the app does not crash or show a blank page.

**Acceptance Criteria:**
- [ ] Navigating to `/bottles/99999/edit` (non-existent id) renders a "Bottle not found" message
- [ ] A link back to `/` is visible on the not-found page
- [ ] The page does not throw an unhandled error or show a Next.js crash screen
- [ ] Navigating to `/bottles/abc/edit` (non-integer id) also renders the "Bottle not found" message

**Priority:** P0 | **Feature Ref:** F2

---

## Epic 3: Delete Bottle (F3)

_Permanent removal of a bottle from the collection, triggered from the edit page with a browser confirmation dialog to prevent accidents._

### US-3.1: Delete a Bottle with Confirmation
**As** Alex (Cellar Mode), **I want to** tap a "Delete" button on the edit page, confirm the dialog, and have the bottle permanently removed, **so that** my inventory stays accurate when a bottle is fully consumed or given away.

**Acceptance Criteria:**
- [ ] A "Delete" button is visible on `/bottles/[id]/edit`
- [ ] Clicking "Delete" triggers a `window.confirm("Delete this bottle?")` dialog
- [ ] Clicking "OK" in the dialog calls `DELETE /api/bottles/[id]`
- [ ] After successful deletion, the browser redirects to `/`
- [ ] The deleted bottle no longer appears in the list on `/`
- [ ] The deleted bottle's record is permanently removed — it does not reappear on page reload

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.2: Cancel Deletion — No Change Made
**As** Alex (Cellar Mode), **I want to** click "Cancel" in the delete confirmation dialog and stay on the edit page, **so that** an accidental tap on "Delete" does not destroy my data.

**Acceptance Criteria:**
- [ ] Clicking "Cancel" in the `window.confirm` dialog leaves the user on the edit page
- [ ] No `DELETE /api/bottles/[id]` request is made when the dialog is cancelled
- [ ] The bottle record remains unchanged in the database
- [ ] The bottle still appears in the list when navigating to `/`

**Priority:** P0 | **Feature Ref:** F3

---

## Epic 4: Search / Filter by Name (F4)

_The list page supports filtering bottles by name via a `?q=` URL query parameter. Search is case-insensitive and matches partial names._

### US-4.1: Search Bottles by Partial Name
**As** Alex (Planning Mode), **I want to** type a partial name in the search input on the list page and see only matching bottles, **so that** I can quickly find a specific wine in a large collection.

**Acceptance Criteria:**
- [ ] A search input is rendered at the top of the list page (`/`)
- [ ] Typing a partial name (e.g. "cay") and submitting (or triggering the search) narrows the list to bottles whose name contains "cay" (case-insensitive)
- [ ] Bottles whose names do not contain the search term are not shown
- [ ] The URL updates to include `?q=<term>` when a search is active
- [ ] The search input is pre-populated with the current `?q=` value on page load

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.2: Search Is Case-Insensitive
**As** Alex (Planning Mode), **I want to** find bottles regardless of how I capitalise the search term, **so that** typing "CAYMUS", "caymus", or "Caymus" all return the same results.

**Acceptance Criteria:**
- [ ] Searching for "caymus" returns a bottle named "Caymus"
- [ ] Searching for "CAYMUS" returns the same bottle
- [ ] Searching for "CaYmUs" returns the same bottle
- [ ] The matching is performed via `ILIKE '%term%'` — not exact match

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.3: Search Empty State — No Matching Bottles
**As** Alex (Planning Mode), **I want to** see a contextual "no results" message when my search returns nothing, **so that** I know the filter is working and no bottles match that name.

**Acceptance Criteria:**
- [ ] When a search term is active and zero bottles match, the message displayed contains the search term (e.g., "No bottles match 'rioja'")
- [ ] The search-empty message is distinct from the cellar-empty message ("No bottles yet")
- [ ] The "Add bottle" button remains accessible even in the search-empty state

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.4: Clear Search Restores Full List
**As** Alex (Planning Mode), **I want to** clear the search term to return to viewing my full collection, **so that** I can browse everything after narrowing down to a subset.

**Acceptance Criteria:**
- [ ] Clearing the search input and submitting (or navigating to `/`) removes the `?q=` parameter from the URL
- [ ] The full bottle list is rendered when `?q=` is absent or empty
- [ ] Navigating directly to `/` (no query string) always shows the full collection

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.5: Search State Persists on Page Reload
**As** Alex (Planning Mode), **I want to** reload the page and see my search results still filtered, **so that** I don't lose my search context if I accidentally refresh.

**Acceptance Criteria:**
- [ ] Loading `/?q=caymus` directly in the browser shows only bottles matching "caymus"
- [ ] Reloading the page while `?q=caymus` is in the URL preserves the filtered list
- [ ] The search input on reload is pre-populated with "caymus"

**Priority:** P1 | **Feature Ref:** F4

---

## Epic 5: REST API (F5)

_The JSON API that backs all UI interactions. Independently usable for scripting or future integrations._

### US-5.1: Health Check Endpoint
**As** Alex (Planning Mode), **I want to** the app's health endpoint to respond correctly, **so that** the Kubernetes platform can confirm the server is running.

**Acceptance Criteria:**
- [ ] `GET /api/health` returns HTTP status 200
- [ ] The response body is `{"status":"ok"}`
- [ ] The response `Content-Type` is `application/json`
- [ ] The response is returned within 200 ms
- [ ] No authentication header is required

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.2: List All Bottles via API
**As** Alex (Planning Mode), **I want to** fetch the full bottle list from the API, **so that** the list page can display accurate data on every load.

**Acceptance Criteria:**
- [ ] `GET /api/bottles` returns HTTP status 200
- [ ] The response body is a JSON array of bottle objects
- [ ] Each bottle object includes: `id`, `name`, `vintage`, `varietal`, `quantity`, `location`, `created_at`
- [ ] When no bottles exist, the response is `[]` (empty array), not 404
- [ ] `GET /api/bottles?q=caymus` returns only bottles whose name matches "caymus" (ILIKE)

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.3: Create a Bottle via API
**As** Alex (Cellar Mode), **I want to** post a new bottle to the API and receive the created record, **so that** the add-bottle form can save data reliably.

**Acceptance Criteria:**
- [ ] `POST /api/bottles` with body `{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":3,"location":"Rack A3"}` returns HTTP status 201
- [ ] The response body is the created bottle object including `id` and `created_at`
- [ ] The created bottle appears in subsequent `GET /api/bottles` responses
- [ ] `POST /api/bottles` with a missing `name` returns HTTP status 422 and body `{"error":"Name is required"}`
- [ ] `POST /api/bottles` with `quantity=0` returns HTTP status 422 and body `{"error":"Quantity must be at least 1"}`

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.4: Fetch Single Bottle via API
**As** Alex (Cellar Mode), **I want to** fetch a specific bottle by its ID from the API, **so that** the edit page can pre-populate the form with current values.

**Acceptance Criteria:**
- [ ] `GET /api/bottles/[id]` for an existing bottle returns HTTP status 200 and the bottle object
- [ ] `GET /api/bottles/99999` (non-existent id) returns HTTP status 404 and body `{"error":"Not found"}`
- [ ] `GET /api/bottles/abc` (non-integer id) returns HTTP status 404 and body `{"error":"Not found"}`

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.5: Update a Bottle via API
**As** Alex (Cellar Mode), **I want to** send an updated bottle to the API and receive the modified record, **so that** the edit form saves changes reliably.

**Acceptance Criteria:**
- [ ] `PUT /api/bottles/[id]` with an updated `quantity` returns HTTP status 200 and the updated bottle object
- [ ] The updated values are reflected in subsequent `GET /api/bottles/[id]` responses
- [ ] `PUT /api/bottles/[id]` with `quantity=0` returns HTTP status 200 (zero is allowed on edit)
- [ ] `PUT /api/bottles/[id]` with `quantity=-1` returns HTTP status 422 and body `{"error":"Quantity cannot be negative"}`
- [ ] `PUT /api/bottles/99999` returns HTTP status 404 and body `{"error":"Not found"}`

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.6: Delete a Bottle via API
**As** Alex (Cellar Mode), **I want to** delete a bottle via the API and receive a no-content response, **so that** the delete action on the edit page removes the record permanently.

**Acceptance Criteria:**
- [ ] `DELETE /api/bottles/[id]` for an existing bottle returns HTTP status 204 with no response body
- [ ] The deleted bottle no longer appears in `GET /api/bottles` after deletion
- [ ] `DELETE /api/bottles/99999` (non-existent id) returns HTTP status 404 and body `{"error":"Not found"}`

**Priority:** P0 | **Feature Ref:** F5

---

## Epic 6: Database Auto-Migration (F6)

_The migration script that creates the `bottles` table before the server starts. Runs automatically on every `npm run dev` and `npm run start`._

### US-6.1: Bottles Table Created Automatically on First Start
**As** Alex (Cellar Mode), **I want to** start the app and have the database table created automatically, **so that** I never need to run any manual SQL setup.

**Acceptance Criteria:**
- [ ] Running `npm run dev` (or `npm run start`) on a fresh database creates the `bottles` table before Next.js boots
- [ ] After the server starts, `POST /api/bottles` successfully inserts a record (confirming the table exists)
- [ ] The `migrate.mjs` script logs "Migration complete." to stdout on success
- [ ] No manual `psql` or database commands are required from the user

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.2: Migration Is Idempotent — Safe to Run Repeatedly
**As** Alex (Cellar Mode), **I want to** restart the server multiple times without errors, **so that** I can restart confidently knowing my existing bottle data will not be lost or corrupted.

**Acceptance Criteria:**
- [ ] Running `npm run migrate` twice against a database that already has the `bottles` table exits with code 0 both times
- [ ] Existing bottle records are intact after running migration a second time
- [ ] No error message is logged on the second migration run
- [ ] The migration uses `CREATE TABLE IF NOT EXISTS` (not `CREATE TABLE`)

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.3: Server Fails Fast When DATABASE_URL Is Not Set
**As** Alex (Cellar Mode), **I want to** see a clear error if the database connection is misconfigured, **so that** I know immediately why the app is not starting rather than getting a cryptic crash.

**Acceptance Criteria:**
- [ ] If `DATABASE_URL` is not set, `npm run migrate` exits with a non-zero exit code
- [ ] The error message logged to stderr includes "DATABASE_URL" to identify the problem
- [ ] `npm run dev` / `npm run start` does not launch Next.js when migration fails (the `&&` chain aborts)
- [ ] No partially-started server is left listening on port 3000

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.4: Data Persists Across Server Restarts
**As** Alex (Planning Mode), **I want to** reload the app or restart the server and see all my previously added bottles still in the list, **so that** I can trust the app as my single source of truth.

**Acceptance Criteria:**
- [ ] Adding a bottle via the form, then reloading the page (`/`), shows the bottle in the list
- [ ] Adding a bottle, then navigating away and back, shows the bottle in the list
- [ ] Bottle data is stored in PostgreSQL and survives a full page reload
- [ ] The list page does not use any client-side storage (localStorage, sessionStorage) as the source of truth

**Priority:** P0 | **Feature Ref:** F6

---

## Epic 7: Brand & Mobile-First UI (F7)

_Visual design and responsive layout requirements. The app must be fully usable one-handed on a 375 px screen and must not block iframe embedding._

### US-7.1: App Is Fully Usable on a 375 px Mobile Screen
**As** Alex (Cellar Mode), **I want to** use the app one-handed on my phone without horizontal scrolling or tiny tap targets, **so that** I can update my inventory while standing in the cellar.

**Acceptance Criteria:**
- [ ] All pages (`/`, `/bottles/new`, `/bottles/[id]/edit`) render without horizontal scroll at 375 px viewport width
- [ ] All buttons and links have a tap target of at least 44 × 44 px
- [ ] The form on add/edit pages is readable and operable at 375 px without zooming
- [ ] No fixed-width elements wider than 100 vw are present on any page

**Priority:** P1 | **Feature Ref:** F7

---

### US-7.2: App Is Readable on Desktop at 1440 px
**As** Alex (Planning Mode), **I want to** browse my collection on a desktop browser without the layout breaking, **so that** I can plan a dinner or shopping trip at my desk.

**Acceptance Criteria:**
- [ ] All pages render without overlapping elements at 1440 px viewport width
- [ ] Content is centred and readable at 1440 px (not stretched edge-to-edge)
- [ ] The layout does not require horizontal scrolling at 1440 px

**Priority:** P1 | **Feature Ref:** F7

---

### US-7.3: Primary Buttons Use Gold Accent Color
**As** Alex (Cellar Mode), **I want to** see clearly styled primary buttons, **so that** the primary action on each page is immediately obvious.

**Acceptance Criteria:**
- [ ] The submit button on the add-bottle form uses `background: #FBCA5C` (Gold)
- [ ] The submit button on the edit-bottle form uses `background: #FBCA5C`
- [ ] The "Add bottle" call-to-action button uses the Gold accent
- [ ] Gold accent (`#FBCA5C`) is not used as a full-page or card background — only on interactive elements and accents

**Priority:** P1 | **Feature Ref:** F7

---

### US-7.4: All Form Inputs Have Visible Labels
**As** Alex (Cellar Mode), **I want to** see a visible label above each form field, **so that** I know what to type in each field without relying on placeholder text.

**Acceptance Criteria:**
- [ ] Every `<input>` on `/bottles/new` has a corresponding visible `<label>` element
- [ ] Every `<input>` on `/bottles/[id]/edit` has a corresponding visible `<label>` element
- [ ] Labels are visible (not hidden with `sr-only` or equivalent)
- [ ] Placeholder-only labels are not used as a substitute for visible labels

**Priority:** P1 | **Feature Ref:** F7

---

### US-7.5: App Loads Inside an Iframe Without Being Blocked
**As** Alex (Planning Mode), **I want to** view the app inside the Pivota K8s sandbox iframe preview, **so that** I can use the preview environment without browser security errors.

**Acceptance Criteria:**
- [ ] The app loads inside an `<iframe>` without being blocked by the browser
- [ ] Response headers do not include `X-Frame-Options: DENY`
- [ ] Response headers do not include a `Content-Security-Policy` with `frame-ancestors 'none'`
- [ ] `next.config.mjs` is a `.mjs` file (ESM) — not `.ts` or a CommonJS `.js` file with TypeScript syntax

**Priority:** P1 | **Feature Ref:** F7

---

## Story Index

| Story ID | Title | Persona | Priority | Feature Ref |
|---|---|---|---|---|
| US-0.1 | View Full Bottle List | PER-02 | P0 | F0 |
| US-0.2 | View Empty-State When Cellar Has No Bottles | PER-02 | P0 | F0 |
| US-0.3 | Navigate to Edit Page from List Row | PER-01 | P0 | F0 |
| US-0.4 | Navigate to Add Bottle from List Page | PER-01 | P0 | F0 |
| US-1.1 | Add a New Bottle with All Fields | PER-01 | P0 | F1 |
| US-1.2 | Add a Bottle with Name Only | PER-01 | P0 | F1 |
| US-1.3 | Prevented from Submitting Without a Name | PER-01 | P0 | F1 |
| US-1.4 | Cancel Adding a Bottle | PER-01 | P0 | F1 |
| US-2.1 | Open Edit Page with Pre-Populated Fields | PER-01 | P0 | F2 |
| US-2.2 | Update Bottle Quantity | PER-01 | P0 | F2 |
| US-2.3 | Update Any Bottle Field | PER-01 | P0 | F2 |
| US-2.4 | Prevented from Saving Without a Name | PER-01 | P0 | F2 |
| US-2.5 | Cancel Editing a Bottle | PER-01 | P0 | F2 |
| US-2.6 | Handle Navigation to Non-Existent Bottle | PER-02 | P0 | F2 |
| US-3.1 | Delete a Bottle with Confirmation | PER-01 | P0 | F3 |
| US-3.2 | Cancel Deletion — No Change Made | PER-01 | P0 | F3 |
| US-4.1 | Search Bottles by Partial Name | PER-02 | P1 | F4 |
| US-4.2 | Search Is Case-Insensitive | PER-02 | P1 | F4 |
| US-4.3 | Search Empty State — No Matching Bottles | PER-02 | P1 | F4 |
| US-4.4 | Clear Search Restores Full List | PER-02 | P1 | F4 |
| US-4.5 | Search State Persists on Page Reload | PER-02 | P1 | F4 |
| US-5.1 | Health Check Endpoint | PER-02 | P0 | F5 |
| US-5.2 | List All Bottles via API | PER-02 | P0 | F5 |
| US-5.3 | Create a Bottle via API | PER-01 | P0 | F5 |
| US-5.4 | Fetch Single Bottle via API | PER-01 | P0 | F5 |
| US-5.5 | Update a Bottle via API | PER-01 | P0 | F5 |
| US-5.6 | Delete a Bottle via API | PER-01 | P0 | F5 |
| US-6.1 | Bottles Table Created Automatically on First Start | PER-01 | P0 | F6 |
| US-6.2 | Migration Is Idempotent — Safe to Run Repeatedly | PER-01 | P0 | F6 |
| US-6.3 | Server Fails Fast When DATABASE_URL Is Not Set | PER-01 | P0 | F6 |
| US-6.4 | Data Persists Across Server Restarts | PER-02 | P0 | F6 |
| US-7.1 | App Is Fully Usable on a 375 px Mobile Screen | PER-01 | P1 | F7 |
| US-7.2 | App Is Readable on Desktop at 1440 px | PER-02 | P1 | F7 |
| US-7.3 | Primary Buttons Use Gold Accent Color | PER-01 | P1 | F7 |
| US-7.4 | All Form Inputs Have Visible Labels | PER-01 | P1 | F7 |
| US-7.5 | App Loads Inside an Iframe Without Being Blocked | PER-02 | P1 | F7 |

**Total: 36 stories across 8 epics**

---

## Priority Definitions

| Priority | Label | Definition |
|---|---|---|
| P0 | Critical | MVP is not shippable without this. All P0 stories must pass before release. |
| P1 | High | Ships in MVP; degrades experience if missing. |
| P2 | Medium | Desirable; deferred to post-MVP if time-constrained. |
| P3 | Low | Nice-to-have; explicitly out of scope for this MVP. |

**P0 stories: 26** | **P1 stories: 10** | **P2/P3 stories: 0 (none in MVP scope)**

---

## UAT Coverage Notes

These stories are designed for direct Playwright UAT automation. Key scenarios map as follows:

| UAT Scenario | Story IDs |
|---|---|
| US1: View cellar — list with fields; empty state | US-0.1, US-0.2 |
| US2: Add bottle — fill all fields, see in list | US-1.1 |
| US3: Edit bottle — change quantity 3→2, verify list | US-2.2 |
| US4: Delete bottle — confirm dialog, gone from list | US-3.1 |
| US5: Search — partial name narrows list | US-4.1, US-4.2 |
| US6: Persistence — data survives page reload | US-6.4 |

---

*Document generated: 2026-06-13 | Based on: PRD-CellarLite.md v1.0, FRD-CellarLite.md v1.0, PERSONAS-CellarLite.md v1.0*
