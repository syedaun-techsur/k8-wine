# JTBD: CellarLite
**Jobs-to-be-Done Document**

| Field | Value |
|---|---|
| Product Name | CellarLite |
| Version | 1.0 |
| Date | 2026-06-13 |
| Related Personas | PERSONAS-CellarLite.md |
| Related PRD | PRD-CellarLite.md |
| Status | Active |

---

## JTBD Summary Table

| JTBD-ID | Persona | Job Statement (abbreviated) | Priority |
|---|---|---|---|
| JTBD-01.1 | PER-01 (Cellar Mode) | Record a bottle change before the moment passes | P0 |
| JTBD-01.2 | PER-01 (Cellar Mode) | Confirm a save actually persisted without anxiety | P0 |
| JTBD-01.3 | PER-01 (Cellar Mode) | Add a brand-new bottle with minimal keystrokes | P0 |
| JTBD-01.4 | PER-01 (Cellar Mode) | Remove a fully-consumed bottle to keep the count clean | P0 |
| JTBD-02.1 | PER-02 (Planning Mode) | Answer "do I still have that bottle?" from anywhere | P0 |
| JTBD-02.2 | PER-02 (Planning Mode) | Find a specific bottle quickly in a growing collection | P1 |
| JTBD-02.3 | PER-02 (Planning Mode) | Trust that what the app shows reflects the real cellar | P0 |
| JTBD-02.4 | PER-02 (Planning Mode) | Review the collection on a desktop when planning ahead | P1 |

---

## PER-01: Alex — Cellar Mode

> **Context:** Standing in the cellar (cold, one hand occupied), phone in the other hand. Session lasts under 2 minutes. The job must be completable before the moment passes.

---

### JTBD-01.1: Record a Bottle Change Before the Moment Passes

**Job Statement:**
When I am standing in my cellar with a bottle in hand and just opened or moved something, I want to update that bottle's quantity or location in seconds, so I can walk away knowing the record is accurate without staying in the cold room any longer than necessary.

**Current Alternatives:**
- Intended to update a spreadsheet "later" — update never happened
- Sent a text message to self as a reminder — reminder was never acted on
- Made a mental note — forgotten by the next morning

**Hiring Criteria:**
- The edit page loads in under 2 seconds from a cold tap
- Quantity can be decremented with a single tap on the field and one digit change — no multi-step dialog
- Form submits and returns to the list in a single action (no second confirmation tap required)
- All tap targets are ≥ 44 × 44 px and reachable one-handed on a 375 px screen

**Success Measure:** Alex updates a bottle's quantity and is back on the list page within 30 seconds of opening the app.

**Related Features:** F2, F5, F7
**Priority:** P0

---

### JTBD-01.2: Confirm a Save Actually Persisted Without Anxiety

**Job Statement:**
When I submit a quantity or location change from the cellar, I want immediate visual confirmation that the record was saved, so I can leave the cellar without second-guessing whether my update was lost.

**Current Alternatives:**
- Refreshed the spreadsheet and looked for the change — sometimes the sync had not completed
- Checked the entry again on a laptop later — found it wrong, could not recall the correct value
- Accepted uncertainty and relied on a later physical inspection

**Hiring Criteria:**
- After a successful save, the list page renders the updated value immediately — no stale data visible
- If a save fails, an inline error message appears without losing the entered data
- The redirect to the list page itself serves as implicit confirmation (updated value is visible)
- Database persists data across server restarts — a page reload never rolls back a saved change

**Success Measure:** Zero instances of Alex returning to the cellar to re-verify a change that was already submitted through the app.

**Related Features:** F2, F5, F6
**Priority:** P0

---

### JTBD-01.3: Add a Brand-New Bottle with Minimal Keystrokes

**Job Statement:**
When a delivery arrives or I return from a wine shop, I want to log a new bottle — at minimum its name and quantity — before the receipt goes in the recycling, so I can preserve the key details (vintage, varietal) while they are right in front of me.

**Current Alternatives:**
- Photographed the label intending to log it later — photo was never used
- Added a row to a spreadsheet that required opening a laptop first — not done in the cellar
- Logged it in a notes app with unstructured text — impossible to query later

**Hiring Criteria:**
- Only bottle name is required; all other fields are optional so the form can be submitted in under 10 seconds if needed
- Form is accessible directly from a prominent "Add bottle" button on the list page — one tap from home
- On success, the new bottle appears immediately in the list — no manual refresh required
- Mobile keyboard does not obscure submit button on a 375 px screen

**Success Measure:** A new bottle is added from tap-open to list-redirect in under 45 seconds, including filling name, vintage, and varietal.

**Related Features:** F0, F1, F5, F7
**Priority:** P0

---

### JTBD-01.4: Remove a Fully-Consumed Bottle to Keep the Count Clean

**Job Statement:**
When the last bottle of a particular wine has been opened or given away, I want to delete it from the record entirely, so I can keep the inventory uncluttered and avoid confusion about wines I no longer have.

**Current Alternatives:**
- Left the row in the spreadsheet with a quantity of 0 — the list became cluttered with ghost entries
- Deleted the spreadsheet row but then could not remember what was there — no audit trail concern for personal use
- Never deleted entries — list grew until it was no longer useful

**Hiring Criteria:**
- Delete action is accessible directly from the edit page — no separate deletion screen required
- A single native confirmation prompt prevents accidental deletion (no custom modal needed)
- After deletion, the list page refreshes immediately without the removed entry
- If deletion fails (network error), an error message appears and the entry is preserved

**Success Measure:** Alex can delete a spent bottle and confirm its removal from the list in under 20 seconds from the edit page.

**Related Features:** F2, F3, F5
**Priority:** P0

---

## PER-02: Alex — Planning Mode

> **Context:** Away from the cellar — at a restaurant, wine shop, or desk. Browsing and reading, not writing. Device may be phone or desktop. The job is to get a reliable answer quickly, without physical access to the cellar.

---

### JTBD-02.1: Answer "Do I Still Have That Bottle?" from Anywhere

**Job Statement:**
When I am at a wine shop or restaurant and considering a purchase or order, I want to check my current inventory without going to the physical cellar, so I can make a confident decision about whether I already have that wine and how many bottles remain.

**Current Alternatives:**
- Relied on memory — often wrong, leading to duplicates or missed opportunities
- Called a family member to physically check the cellar — impractical
- Bought a second bottle "just in case" — wasted money when already well-stocked
- Consulted a stale spreadsheet last updated weeks ago — unreliable

**Hiring Criteria:**
- The full bottle list loads without login or onboarding — immediately visible on first visit
- List page renders in under 1 second on a standard mobile connection
- Each entry shows name, vintage, varietal, quantity, and location at a glance — no tap-to-expand required for core fields
- The data displayed reflects the most recent cellar-mode update — not a cached snapshot

**Success Measure:** Alex can open the app and confirm the quantity of a specific bottle within 15 seconds, without performing a search.

**Related Features:** F0, F5, F6
**Priority:** P0

---

### JTBD-02.2: Find a Specific Bottle Quickly in a Growing Collection

**Job Statement:**
When my cellar exceeds 40 bottles and I need to check a specific wine by name or varietal, I want to filter the list with a partial name fragment, so I can locate that bottle in seconds without scrolling through the entire inventory.

**Current Alternatives:**
- Scrolled through the full spreadsheet row by row — time-consuming beyond 30 entries
- Used Ctrl+F in a browser on a non-interactive page — not available on mobile
- Browsed full wine apps with community data mixed in — had to mentally filter noise to find personal inventory

**Hiring Criteria:**
- A search input is prominently displayed at the top of the list page — no navigation required to find it
- Typing a partial name (e.g., "rioja") filters results in real time without a page reload
- Search is case-insensitive and matches mid-string fragments
- When no results match, a contextual message ("No bottles match 'rioja'") distinguishes this from an empty cellar
- Search state is preserved in the URL so it can be shared or reloaded

**Success Measure:** Alex locates a specific bottle by typing a 3–5 character name fragment within 10 seconds of arriving on the list page.

**Related Features:** F0, F4, F5
**Priority:** P1

---

### JTBD-02.3: Trust That What the App Shows Reflects the Real Cellar

**Job Statement:**
When I consult my collection after a gap of several days, I want to be certain the data I see matches what is physically in the cellar, so I can rely on the app as my single source of truth instead of treating it as a rough estimate.

**Current Alternatives:**
- Maintained a separate mental model alongside the spreadsheet — mental model frequently diverged
- Distrusted cloud-synced spreadsheets that might not have received cellar-mode updates
- Double-checked by physically visiting the cellar anyway — defeated the purpose of the app

**Hiring Criteria:**
- Database persists across server restarts — a K8s pod restart never silently discards data
- Auto-migration runs on every server start so the schema is always consistent with the app version
- API returns live data on every request — no client-side caching that could serve stale results
- Any failed write surfaces an error to the user rather than silently succeeding with no actual change

**Success Measure:** Over 30 days of use, zero discrepancies between the app's bottle count and the physical cellar count attributable to data loss or silent failures.

**Related Features:** F5, F6
**Priority:** P0

---

### JTBD-02.4: Review the Collection on a Desktop When Planning Ahead

**Job Statement:**
When I am at my desk planning a dinner menu or a wine merchant order, I want to browse my full collection on a large screen in a browser, so I can cross-reference what I have against what I need without switching to my phone.

**Current Alternatives:**
- Opened the spreadsheet on a laptop — the only desktop-friendly option, but always out of date
- Zoomed into a phone-optimized app on a desktop browser — rendered broken or required horizontal scrolling
- Printed the spreadsheet before a shopping trip — immediately out of date upon any cellar change

**Hiring Criteria:**
- All pages render correctly and are readable at 1440 px desktop viewport — no horizontal scrolling, no broken layout
- Text and bottle data are legible at desktop scale — not just "not broken" but comfortable to read
- The same URL accessed on desktop and mobile shows identical, current data
- No login wall, no onboarding modal — the list is immediately visible regardless of device

**Success Measure:** Alex can open the app on a desktop browser and read the full bottle list without any layout issues or horizontal scrolling at 1440 px.

**Related Features:** F0, F4, F7
**Priority:** P1

---

## Outcome-to-Feature Traceability

| JTBD-ID | Related Feature(s) | Expected Outcome |
|---|---|---|
| JTBD-01.1 | F2, F5, F7 | Quantity or location updated within 30 seconds; redirect confirms success |
| JTBD-01.2 | F2, F5, F6 | Updated value visible immediately on list page; survives server restart |
| JTBD-01.3 | F0, F1, F5, F7 | New bottle appears in list within 45 seconds of opening the add form |
| JTBD-01.4 | F2, F3, F5 | Deleted bottle removed from list within 20 seconds; native confirm prevents accidents |
| JTBD-02.1 | F0, F5, F6 | Full list visible in < 1 s with no login; quantity confirmed within 15 s |
| JTBD-02.2 | F0, F4, F5 | Partial name search returns filtered results in < 1 s; no page reload |
| JTBD-02.3 | F5, F6 | Zero silent data loss events over 30-day usage period |
| JTBD-02.4 | F0, F4, F7 | All pages readable at 1440 px; no horizontal scrolling or layout breaks |

**Feature Coverage Check:**

| Feature | Covered by JTBD |
|---|---|
| F0 — Bottle List Page | JTBD-01.3, JTBD-02.1, JTBD-02.2, JTBD-02.4 |
| F1 — Add Bottle Page | JTBD-01.3 |
| F2 — Edit Bottle Page | JTBD-01.1, JTBD-01.2, JTBD-01.4 |
| F3 — Delete Bottle | JTBD-01.4 |
| F4 — Search / Filter | JTBD-02.2, JTBD-02.4 |
| F5 — REST API | JTBD-01.1, JTBD-01.2, JTBD-01.3, JTBD-01.4, JTBD-02.1, JTBD-02.2, JTBD-02.3 |
| F6 — Database Auto-Migration | JTBD-01.2, JTBD-02.1, JTBD-02.3 |
| F7 — Brand & Mobile-First UI | JTBD-01.1, JTBD-01.3, JTBD-02.4 |

---

## NaC Preview

> Candidate Natural Acceptance Criteria for downstream STORY-MAP refinement. These are draft testable criteria derived from each job's success measure. They will be formalized into full NaC entries in the story-mapping phase.

| JTBD-ID | Outcome | Candidate Natural Acceptance Criterion |
|---|---|---|
| JTBD-01.1 | Quantity updated in ≤ 30 s | **Given** a bottle exists, **when** Alex taps the bottle row, changes the quantity, and taps Save, **then** the list page renders with the new quantity in ≤ 30 seconds of opening the app |
| JTBD-01.2 | Updated value visible immediately; survives restart | **Given** a quantity was just saved, **when** the server is restarted and the list page is reloaded, **then** the updated quantity is still displayed — not the pre-edit value |
| JTBD-01.3 | New bottle in list within 45 s | **Given** Alex is on the list page, **when** they tap "Add bottle," fill name + vintage + varietal, and submit, **then** the new bottle appears in the list within 45 seconds of starting the form |
| JTBD-01.4 | Deleted bottle removed within 20 s | **Given** Alex is on an edit page, **when** they tap Delete, confirm the native dialog, **then** the bottle no longer appears in the list and the redirect completes within 20 seconds |
| JTBD-02.1 | Full list visible in < 1 s; no login | **Given** a fresh browser session with no cookies, **when** Alex navigates to `/`, **then** the bottle list (or empty state) renders within 1 second and no login prompt is shown |
| JTBD-02.2 | Partial search returns filtered results | **Given** the cellar has bottles including one named "Rioja Reserva," **when** Alex types "rioja" in the search field, **then** only matching bottles are shown without a page reload, within 500 ms of the last keystroke |
| JTBD-02.3 | Zero silent data loss | **Given** a bottle's quantity was updated and confirmed in the list, **when** the K8s pod is restarted and Alex reloads the list page, **then** the quantity reflects the last-saved value — not the pre-edit value or zero |
| JTBD-02.4 | No layout issues at 1440 px | **Given** a desktop browser at 1440 px viewport width, **when** Alex loads `/`, **then** all bottle data is visible without horizontal scrolling and all text is readable without zooming |

---

*Document generated: 2026-06-13 | Derived from: PERSONAS-CellarLite.md, PRD-CellarLite.md, PROJECT.md*
*Next: FRD-CellarLite.md, UserStories-CellarLite.md, STORY-MAP-CellarLite.md*
