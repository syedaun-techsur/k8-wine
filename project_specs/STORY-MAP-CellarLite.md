# STORY MAP: CellarLite
**User Story Map — Journey × Detail × NaC**

| Field | Value |
|---|---|
| Product Name | CellarLite |
| Version | 1.0 |
| Date | 2026-06-13 |
| Status | Active |
| Related Artifacts | PRD-CellarLite.md · PERSONAS-CellarLite.md · JOURNEYS-CellarLite.md · JTBD-CellarLite.md · UserStories-CellarLite.md |

---

## Overview

This story map organises CellarLite's 36 user stories across two dimensions:

- **X-axis (columns):** Journey stages drawn from JOURNEYS-CellarLite.md — the sequential steps a persona takes to accomplish a real-world job.
- **Y-axis (rows):** Stories within each stage, ordered by priority (P0 above P1).

Each story carries a **Natural Acceptance Criterion (NaC)** — a testable statement derived from the intersection of a JTBD outcome and the journey stage in which the story lives. NaC are **not invented**; every NaC traces back to a specific JTBD outcome via an explicit derivation chain recorded in Section 4.

**Map entry IDs** use the convention `SM-{Epic}.{NN}` (e.g. SM-0.1). The epic number matches the UserStories epic (0–7); NN is a sequential counter within the stage.

**Release planning** groups stories by journey completeness rather than feature area: R1 delivers a shippable, end-to-end P0 workflow; R2 adds polish and the search experience.

---

## 1. Story Map Matrix

> **Journey stage columns** span two primary journeys: PER-01 (Cellar Mode write journeys) and PER-02 (Planning Mode read journeys). Because both personas are the same person, the journey stages interlock: data written in PER-01 stages is read in PER-02 stages.

### PER-01 Journey Stages (Write path — JRN-01.1 / JRN-01.2 / JRN-01.3)

| SM ID | Persona | Journey Stage | Journey Ref | Epic | Story ID | Story Title | NaC (derived) | Release |
|---|---|---|---|---|---|---|---|---|
| SM-6.1 | PER-01 | **Infrastructure Setup** | Pre-journey | Epic 6 (F6) | US-6.1 | Bottles Table Created Automatically on First Start | JTBD-01.2 → Any cellar-mode write succeeds on first run: `POST /api/bottles` returns 201 immediately after `npm run dev`, with no manual SQL required | R1 |
| SM-6.2 | PER-01 | **Infrastructure Setup** | Pre-journey | Epic 6 (F6) | US-6.2 | Migration Is Idempotent — Safe to Run Repeatedly | JTBD-01.2 → Server restarts never roll back a saved change: running migration twice exits 0 and leaves existing bottle records intact | R1 |
| SM-6.3 | PER-01 | **Infrastructure Setup** | Pre-journey | Epic 6 (F6) | US-6.3 | Server Fails Fast When DATABASE_URL Is Not Set | JTBD-01.2 → A misconfigured environment surfaces a clear error before Next.js boots, preventing silent data loss from a partially-started server | R1 |
| SM-6.4 | PER-02 | **Infrastructure Setup** | Pre-journey | Epic 6 (F6) | US-6.4 | Data Persists Across Server Restarts | JTBD-02.3 → Data written during a cellar visit survives a K8s pod restart: reloading `/` after a pod cycle shows the last-saved quantity, not a pre-edit value | R1 |
| SM-0.4 | PER-01 | **Trigger / Orient** | JRN-01.1 Orient, JRN-01.2 Trigger, JRN-01.3 Trigger | Epic 0 (F0) | US-0.4 | Navigate to Add Bottle from List Page | JTBD-01.3 → One tap from home to the add form: "Add bottle" button is visible on the list page in ≤ 1 tap from app open, with a 44 × 44 px target | R1 |
| SM-0.3 | PER-01 | **Trigger / Orient** | JRN-01.2 Locate, JRN-01.3 Trigger | Epic 0 (F0) | US-0.3 | Navigate to Edit Page from List Row | JTBD-01.1 → Locate-and-open a bottle in one tap: each list row is tappable with a ≥ 44 px touch target, navigating directly to `/bottles/[id]/edit` | R1 |
| SM-0.1 | PER-02 | **Trigger / Orient** | JRN-02.1 Load & Orient, JRN-02.2 Trigger | Epic 0 (F0) | US-0.1 | View Full Bottle List | JTBD-02.1 → Full bottle list visible in < 1 s with no login prompt: navigating to `/` renders all bottles (name, vintage, varietal, quantity, location) server-side without a loading spinner | R1 |
| SM-0.2 | PER-02 | **Trigger / Orient** | JRN-02.1 Load & Orient | Epic 0 (F0) | US-0.2 | View Empty-State When Cellar Has No Bottles | JTBD-02.1 → No login prompt, no blank page, even when the cellar is empty: "No bottles yet" and an "Add bottle" link are rendered server-side without a spinner | R1 |
| SM-1.1 | PER-01 | **Fill Form** | JRN-01.1 Fill Form | Epic 1 (F1) | US-1.1 | Add a New Bottle with All Fields | JTBD-01.3 → New bottle appears in the list within 45 s of starting the form: submitting name + vintage + varietal + quantity + location redirects to `/` and the entry is immediately visible | R1 |
| SM-1.2 | PER-01 | **Fill Form** | JRN-01.1 Fill Form | Epic 1 (F1) | US-1.2 | Add a Bottle with Name Only (Optional Fields Blank) | JTBD-01.3 → Capture a bottle in < 10 s when the label is in hand: submitting name-only succeeds, defaults quantity to 1, and redirects to `/` | R1 |
| SM-1.3 | PER-01 | **Fill Form** | JRN-01.1 Fill Form | Epic 1 (F1) | US-1.3 | Prevented from Submitting Without a Name | JTBD-01.3 → No nameless records created: submitting a blank name field shows "Name is required" inline, preserves all other entered values, and makes no network request | R1 |
| SM-1.4 | PER-01 | **Fill Form** | JRN-01.1 Fill Form | Epic 1 (F1) | US-1.4 | Cancel Adding a Bottle | JTBD-01.3 → Escape from the form without side-effects: clicking "Cancel" returns to `/` with no POST request made | R1 |
| SM-2.1 | PER-01 | **Edit** | JRN-01.2 Edit, JRN-01.3 Assess | Epic 2 (F2) | US-2.1 | Open Edit Page with Pre-Populated Fields | JTBD-01.1 → Edit page loads pre-populated so only the changed field needs touching: all five fields reflect current DB values when `/bottles/[id]/edit` opens | R1 |
| SM-2.2 | PER-01 | **Edit** | JRN-01.2 Edit | Epic 2 (F2) | US-2.2 | Update Bottle Quantity | JTBD-01.1 → Quantity decremented and confirmed in ≤ 30 s: changing quantity from 3 → 2 and saving redirects to `/` with the new count visible immediately, via PUT | R1 |
| SM-2.3 | PER-01 | **Edit** | JRN-01.2 Edit | Epic 2 (F2) | US-2.3 | Update Any Bottle Field | JTBD-01.1 → Any field correctable without re-entering everything: updating name or location saves via PUT, redirects to `/`, and persists across a page reload | R1 |
| SM-2.4 | PER-01 | **Edit** | JRN-01.2 Edit | Epic 2 (F2) | US-2.4 | Prevented from Saving Without a Name | JTBD-01.1 → No corrupt records created under time pressure: clearing the name and clicking Save shows "Name is required" inline and leaves the DB record unchanged | R1 |
| SM-2.5 | PER-01 | **Edit** | JRN-01.2 Edit | Epic 2 (F2) | US-2.5 | Cancel Editing a Bottle | JTBD-01.1 → Accidental taps on Edit don't corrupt data: clicking "Cancel" returns to `/` with no PUT request made and the record unchanged | R1 |
| SM-2.6 | PER-02 | **Edit** | JRN-01.3 Assess | Epic 2 (F2) | US-2.6 | Handle Navigation to Non-Existent Bottle | JTBD-02.3 → A stale bookmark never causes a crash: navigating to a non-existent or non-integer bottle ID renders "Bottle not found" with a link back to `/`, no error screen | R1 |
| SM-5.1 | PER-02 | **Submit / API** | Cross-journey infrastructure | Epic 5 (F5) | US-5.1 | Health Check Endpoint | JTBD-02.3 → Platform liveness check always responds: `GET /api/health` returns `200 {"status":"ok"}` within 200 ms with no auth header, enabling K8s probes | R1 |
| SM-5.2 | PER-02 | **Submit / API** | JRN-01.2 Confirm, JRN-02.1 Load & Orient | Epic 5 (F5) | US-5.2 | List All Bottles via API | JTBD-02.1 → API returns live data on every request so no stale snapshot ever surfaces: `GET /api/bottles` returns a JSON array with all fields; `?q=` filter is respected | R1 |
| SM-5.3 | PER-01 | **Submit / API** | JRN-01.1 Submit | Epic 5 (F5) | US-5.3 | Create a Bottle via API | JTBD-01.3 → POST succeeds and the created record is returned: `POST /api/bottles` with valid body returns 201 + created object; missing name returns 422 | R1 |
| SM-5.4 | PER-01 | **Submit / API** | JRN-01.2 Edit | Epic 5 (F5) | US-5.4 | Fetch Single Bottle via API | JTBD-01.1 → Edit page pre-populates from a live DB read: `GET /api/bottles/[id]` returns 200 + bottle object; non-existent or non-integer id returns 404 | R1 |
| SM-5.5 | PER-01 | **Submit / API** | JRN-01.2 Submit | Epic 5 (F5) | US-5.5 | Update a Bottle via API | JTBD-01.1 → PUT fires and redirect confirms the save: `PUT /api/bottles/[id]` returns 200 + updated object; negative quantity returns 422; missing id returns 404 | R1 |
| SM-5.6 | PER-01 | **Submit / API** | JRN-01.3 Initiate Delete | Epic 5 (F5) | US-5.6 | Delete a Bottle via API | JTBD-01.4 → Bottle permanently removed and absent from subsequent list: `DELETE /api/bottles/[id]` returns 204; non-existent id returns 404 | R1 |
| SM-3.1 | PER-01 | **Delete** | JRN-01.3 Initiate Delete, JRN-01.3 Confirm | Epic 3 (F3) | US-3.1 | Delete a Bottle with Confirmation | JTBD-01.4 → Spent bottle removed from list within 20 s of arriving at the edit page: Delete button triggers `window.confirm`, OK calls DELETE, redirect removes the entry from `/` | R1 |
| SM-3.2 | PER-01 | **Delete** | JRN-01.3 Confirm | Epic 3 (F3) | US-3.2 | Cancel Deletion — No Change Made | JTBD-01.4 → Accidental Delete tap has no consequence: cancelling the confirm dialog returns focus to the edit page with no DELETE request made and the record intact | R1 |
| SM-4.1 | PER-02 | **Locate / Search** | JRN-02.1 Locate, JRN-02.2 Search | Epic 4 (F4) | US-4.1 | Search Bottles by Partial Name | JTBD-02.2 → Partial name fragment filters results in real time without a page reload: typing "cay" narrows the list to matching bottles, URL updates to `?q=cay`, within 500 ms | R2 |
| SM-4.2 | PER-02 | **Locate / Search** | JRN-02.2 Search | Epic 4 (F4) | US-4.2 | Search Is Case-Insensitive | JTBD-02.2 → Search works regardless of capitalisation: "caymus", "CAYMUS", and "CaYmUs" all return the same bottle via ILIKE matching | R2 |
| SM-4.3 | PER-02 | **Locate / Search** | JRN-02.2 Review Results | Epic 4 (F4) | US-4.3 | Search Empty State — No Matching Bottles | JTBD-02.2 → No-results state is contextual, not generic: when zero bottles match, the message includes the search term (e.g., "No bottles match 'rioja'"), distinct from empty-cellar state | R2 |
| SM-4.4 | PER-02 | **Locate / Search** | JRN-02.2 Review Results | Epic 4 (F4) | US-4.4 | Clear Search Restores Full List | JTBD-02.2 → Escape from a search back to the full view is one action: clearing the input and submitting removes `?q=` and renders the full collection | R2 |
| SM-4.5 | PER-02 | **Locate / Search** | JRN-02.2 Search | Epic 4 (F4) | US-4.5 | Search State Persists on Page Reload | JTBD-02.2 → URL-driven search state survives a reload: loading `/?q=caymus` directly shows only matching bottles with the input pre-populated | R2 |
| SM-7.1 | PER-01 | **Mobile UI** | Cross-journey (all stages) | Epic 7 (F7) | US-7.1 | App Is Fully Usable on a 375 px Mobile Screen | JTBD-01.1 → All tap targets ≥ 44 × 44 px and no horizontal scroll at 375 px: every page operable one-handed, enabling the ≤ 30 s cellar-mode update | R2 |
| SM-7.2 | PER-02 | **Desktop UI** | JRN-02.2 Trigger | Epic 7 (F7) | US-7.2 | App Is Readable on Desktop at 1440 px | JTBD-02.4 → All pages readable at 1440 px with no horizontal scroll or overlapping elements: content centred, legible without zooming, identical data to mobile view | R2 |
| SM-7.3 | PER-01 | **Mobile UI** | Cross-journey (all stages) | Epic 7 (F7) | US-7.3 | Primary Buttons Use Gold Accent Color | JTBD-01.1 → Primary action on each page is immediately obvious: submit buttons use `#FBCA5C` Gold, "Add bottle" CTA uses Gold, Gold not used as a full-page background | R2 |
| SM-7.4 | PER-01 | **Mobile UI** | JRN-01.1 Fill Form, JRN-01.2 Edit | Epic 7 (F7) | US-7.4 | All Form Inputs Have Visible Labels | JTBD-01.3 → Every field is identifiable without relying on placeholder text: all `<input>` elements on `/bottles/new` and `/bottles/[id]/edit` have a visible `<label>` | R2 |
| SM-7.5 | PER-02 | **Desktop UI** | JRN-02.1 Load & Orient, JRN-02.2 Trigger | Epic 7 (F7) | US-7.5 | App Loads Inside an Iframe Without Being Blocked | JTBD-02.4 → App renders inside the Pivota K8s sandbox iframe preview without browser security errors: no `X-Frame-Options: DENY` or `frame-ancestors 'none'` headers | R2 |

---

## 2. Journey-Stage Summary

> High-level view of which stories serve each stage across journeys.

| Journey Stage | Journey Refs | Story Count | R1 | R2 |
|---|---|---|---|---|
| Infrastructure Setup | Pre-journey (F6) | 4 | US-6.1, US-6.2, US-6.3, US-6.4 | — |
| Trigger / Orient | JRN-01.1 Orient · JRN-01.2 Trigger · JRN-02.1 Load & Orient · JRN-02.2 Trigger | 4 | US-0.1, US-0.2, US-0.3, US-0.4 | — |
| Fill Form | JRN-01.1 Fill Form | 4 | US-1.1, US-1.2, US-1.3, US-1.4 | — |
| Edit | JRN-01.2 Edit · JRN-01.3 Assess | 6 | US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6 | — |
| Submit / API | JRN-01.1 Submit · JRN-01.2 Submit · JRN-01.3 Verify | 6 | US-5.1, US-5.2, US-5.3, US-5.4, US-5.5, US-5.6 | — |
| Delete | JRN-01.3 Initiate Delete · Confirm | 2 | US-3.1, US-3.2 | — |
| Locate / Search | JRN-02.1 Locate · JRN-02.2 Search · Review Results | 5 | — | US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 |
| Mobile UI | Cross-journey (PER-01 write path) | 3 | — | US-7.1, US-7.3, US-7.4 |
| Desktop UI | JRN-02.2 Trigger · JRN-02.1 Load & Orient | 2 | — | US-7.2, US-7.5 |
| **Total** | | **36** | **26** | **10** |

---

## 3. NaC Derivation Table

> Full traceability chain: **JTBD outcome → Journey stage → NaC → Story**

| SM ID | JTBD ID | JTBD Outcome | Journey Stage | NaC (testable) | Story ID |
|---|---|---|---|---|---|
| SM-6.1 | JTBD-01.2 | Updated value visible immediately; survives restart | Pre-journey: Infrastructure Setup | `POST /api/bottles` returns 201 on first run after `npm run dev` — no manual SQL setup required | US-6.1 |
| SM-6.2 | JTBD-01.2 | Updated value visible immediately; survives restart | Pre-journey: Infrastructure Setup | Running migration twice exits 0 both times; existing records intact after second run | US-6.2 |
| SM-6.3 | JTBD-01.2 | Updated value visible immediately; survives restart | Pre-journey: Infrastructure Setup | Missing `DATABASE_URL` causes non-zero exit and stderr message containing "DATABASE_URL"; Next.js does not start | US-6.3 |
| SM-6.4 | JTBD-02.3 | Zero silent data loss | Pre-journey: Infrastructure Setup | Given a bottle was saved and the K8s pod is restarted, when Alex reloads `/`, the saved quantity is visible — not 0 or a pre-edit value | US-6.4 |
| SM-0.4 | JTBD-01.3 | New bottle in list within 45 s | Trigger / Orient: JRN-01.1 Orient | "Add bottle" button is present on `/` in both populated and empty states; tap target ≥ 44 × 44 px; navigates to `/bottles/new` | US-0.4 |
| SM-0.3 | JTBD-01.1 | Quantity updated in ≤ 30 s | Trigger / Orient: JRN-01.2 Locate | Each list row is tappable with ≥ 44 px height and navigates to the correct `/bottles/[id]/edit` URL | US-0.3 |
| SM-0.1 | JTBD-02.1 | Full list visible in < 1 s; no login | Trigger / Orient: JRN-02.1 Load & Orient | Given a fresh browser session, navigating to `/` renders the bottle list (name, vintage, varietal, quantity, location) server-side within 1 s with no login prompt | US-0.1 |
| SM-0.2 | JTBD-02.1 | Full list visible in < 1 s; no login | Trigger / Orient: JRN-02.1 Load & Orient | When the cellar has zero bottles, `/` shows "No bottles yet" + "Add bottle" link server-side with no login prompt | US-0.2 |
| SM-1.1 | JTBD-01.3 | New bottle in list within 45 s | Fill Form: JRN-01.1 Fill Form | Submitting name + vintage + varietal + quantity + location creates the record, redirects to `/`, and the bottle is immediately visible in the list | US-1.1 |
| SM-1.2 | JTBD-01.3 | New bottle in list within 45 s | Fill Form: JRN-01.1 Fill Form | Submitting name-only succeeds (quantity defaults to 1), redirects to `/` — form completable in < 10 s if needed | US-1.2 |
| SM-1.3 | JTBD-01.3 | New bottle in list within 45 s | Fill Form: JRN-01.1 Fill Form | Submitting a blank name field shows "Name is required" inline, preserves other field values, makes no POST request | US-1.3 |
| SM-1.4 | JTBD-01.3 | New bottle in list within 45 s | Fill Form: JRN-01.1 Fill Form | Clicking "Cancel" on `/bottles/new` returns to `/` with no POST made and no record created | US-1.4 |
| SM-2.1 | JTBD-01.1 | Quantity updated in ≤ 30 s | Edit: JRN-01.2 Edit | `/bottles/[id]/edit` opens with all five fields (name, vintage, varietal, quantity, location) pre-populated from the current DB values | US-2.1 |
| SM-2.2 | JTBD-01.1 | Quantity updated in ≤ 30 s | Edit: JRN-01.2 Edit | Changing quantity from 3 to 2 and saving redirects to `/` with the new count visible; `PUT /api/bottles/[id]` is called | US-2.2 |
| SM-2.3 | JTBD-01.1 | Quantity updated in ≤ 30 s | Edit: JRN-01.2 Edit | Changing name or location and saving persists the new values on `/` across a page reload | US-2.3 |
| SM-2.4 | JTBD-01.1 | Quantity updated in ≤ 30 s | Edit: JRN-01.2 Edit | Clearing the name field and clicking Save shows "Name is required" inline; DB record is unchanged | US-2.4 |
| SM-2.5 | JTBD-01.1 | Quantity updated in ≤ 30 s | Edit: JRN-01.2 Edit | Clicking "Cancel" on the edit page returns to `/` with no PUT request and no DB change | US-2.5 |
| SM-2.6 | JTBD-02.3 | Zero silent data loss | Edit: JRN-01.3 Assess | Navigating to `/bottles/99999/edit` or `/bottles/abc/edit` renders "Bottle not found" with a `/` link; no unhandled error or crash screen | US-2.6 |
| SM-5.1 | JTBD-02.3 | Zero silent data loss | Submit / API: cross-journey | `GET /api/health` returns `200 {"status":"ok"}` in < 200 ms with no auth header; enables K8s liveness probes | US-5.1 |
| SM-5.2 | JTBD-02.1 | Full list visible in < 1 s; no login | Submit / API: JRN-02.1 Load & Orient | `GET /api/bottles` returns 200 + JSON array with all fields; `?q=caymus` returns only matching bottles (ILIKE) | US-5.2 |
| SM-5.3 | JTBD-01.3 | New bottle in list within 45 s | Submit / API: JRN-01.1 Submit | `POST /api/bottles` with valid body returns 201 + created object; missing name returns 422 `{"error":"Name is required"}`; quantity=0 returns 422 | US-5.3 |
| SM-5.4 | JTBD-01.1 | Quantity updated in ≤ 30 s | Submit / API: JRN-01.2 Edit | `GET /api/bottles/[id]` returns 200 + bottle object for existing id; non-existent or non-integer id returns 404 `{"error":"Not found"}` | US-5.4 |
| SM-5.5 | JTBD-01.1 | Quantity updated in ≤ 30 s | Submit / API: JRN-01.2 Submit | `PUT /api/bottles/[id]` returns 200 + updated object; quantity=0 allowed; quantity=-1 returns 422; missing id returns 404 | US-5.5 |
| SM-5.6 | JTBD-01.4 | Deleted bottle removed within 20 s | Submit / API: JRN-01.3 Initiate Delete | `DELETE /api/bottles/[id]` returns 204 with no body; deleted bottle absent from subsequent `GET /api/bottles`; non-existent id returns 404 | US-5.6 |
| SM-3.1 | JTBD-01.4 | Deleted bottle removed within 20 s | Delete: JRN-01.3 Initiate Delete + Confirm | Delete button on edit page triggers `window.confirm("Delete this bottle?")`; OK calls DELETE, redirects to `/`; bottle absent from list permanently | US-3.1 |
| SM-3.2 | JTBD-01.4 | Deleted bottle removed within 20 s | Delete: JRN-01.3 Confirm | Cancelling the confirm dialog stays on edit page; no DELETE request; record intact in DB and visible in list | US-3.2 |
| SM-4.1 | JTBD-02.2 | Partial search in < 10 s | Locate / Search: JRN-02.2 Search | Typing "cay" in the search input narrows the list to name-matching bottles, URL updates to `?q=cay`, within 500 ms of last keystroke, without a page reload | US-4.1 |
| SM-4.2 | JTBD-02.2 | Partial search in < 10 s | Locate / Search: JRN-02.2 Search | "caymus", "CAYMUS", "CaYmUs" all return the bottle named "Caymus" via `ILIKE '%term%'` matching | US-4.2 |
| SM-4.3 | JTBD-02.2 | Partial search in < 10 s | Locate / Search: JRN-02.2 Review Results | Zero-match search shows "No bottles match 'rioja'" — not the empty-cellar message "No bottles yet" | US-4.3 |
| SM-4.4 | JTBD-02.2 | Partial search in < 10 s | Locate / Search: JRN-02.2 Review Results | Clearing the search input and submitting removes `?q=` and renders the full collection | US-4.4 |
| SM-4.5 | JTBD-02.2 | Partial search in < 10 s | Locate / Search: JRN-02.2 Search | Loading `/?q=caymus` directly shows only matching bottles; search input pre-populated with "caymus"; filtered on page reload | US-4.5 |
| SM-7.1 | JTBD-01.1 | Quantity updated in ≤ 30 s | Mobile UI: cross-journey (all pages) | All pages render without horizontal scroll at 375 px; all buttons/links ≥ 44 × 44 px; form operable without zooming | US-7.1 |
| SM-7.2 | JTBD-02.4 | No layout issues at 1440 px | Desktop UI: JRN-02.2 Trigger | All pages render without overlapping elements at 1440 px; content centred and readable; no horizontal scrolling | US-7.2 |
| SM-7.3 | JTBD-01.1 | Quantity updated in ≤ 30 s | Mobile UI: cross-journey (all pages) | Submit buttons on add and edit forms use `#FBCA5C` Gold; "Add bottle" CTA uses Gold; Gold not used as a full-page background | US-7.3 |
| SM-7.4 | JTBD-01.3 | New bottle in list within 45 s | Mobile UI: JRN-01.1 Fill Form, JRN-01.2 Edit | Every `<input>` on `/bottles/new` and `/bottles/[id]/edit` has a visible `<label>` (not placeholder-only, not `sr-only`) | US-7.4 |
| SM-7.5 | JTBD-02.4 | No layout issues at 1440 px | Desktop UI: JRN-02.1 Load & Orient, JRN-02.2 Trigger | App loads inside an `<iframe>` without being blocked; no `X-Frame-Options: DENY`; no `frame-ancestors 'none'` CSP | US-7.5 |

---

## 4. Release Planning

### R1 — "Core Workflow" (MVP Shippable)
**Theme:** End-to-end CRUD with reliable persistence — every P0 story. A user can open the app, view their cellar, add a new bottle, edit its quantity, and delete it. Data survives restarts.

**Stories in R1 (26):** US-0.1, US-0.2, US-0.3, US-0.4, US-1.1, US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6, US-3.1, US-3.2, US-5.1, US-5.2, US-5.3, US-5.4, US-5.5, US-5.6, US-6.1, US-6.2, US-6.3, US-6.4

| Journey | Stage | R1 Stories Delivered |
|---|---|---|
| JRN-01.1 (Add bottle) | Trigger → Fill Form → Submit → Confirm | US-0.4, US-1.1, US-1.2, US-1.3, US-1.4, US-5.3 |
| JRN-01.2 (Decrement qty) | Trigger → Locate → Edit → Submit → Confirm | US-0.3, US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-5.4, US-5.5 |
| JRN-01.3 (Delete) | Trigger → Assess → Initiate → Confirm → Verify | US-3.1, US-3.2, US-5.6 |
| JRN-02.1 (Browse at shop) | Trigger → Load & Orient → Locate → Decide | US-0.1, US-0.2, US-5.2 |
| Infrastructure | Pre-journey | US-5.1, US-6.1, US-6.2, US-6.3, US-6.4 |

**Persona coverage:**
- PER-01 (Cellar Mode): ✅ Fully served — all write journeys complete
- PER-02 (Planning Mode): ✅ Partially served — browse + quantity-check journey complete; search deferred to R2

**JTBD addressed:**
- JTBD-01.1 ✅ · JTBD-01.2 ✅ · JTBD-01.3 ✅ · JTBD-01.4 ✅ · JTBD-02.1 ✅ · JTBD-02.3 ✅
- JTBD-02.2 ⏳ Deferred to R2 · JTBD-02.4 ⏳ Deferred to R2

**Journey completeness:** All five journeys are traversable end-to-end in R1. JRN-02.1 completes without search (locate by visual scan); JRN-02.2 is not supported until R2.

---

### R2 — "Search & Polish"
**Theme:** Elevates the read experience for PER-02 (growing cellars) and ensures mobile/desktop visual polish. All P1 stories.

**Stories in R2 (10):** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5, US-7.1, US-7.2, US-7.3, US-7.4, US-7.5

| Journey | Stage | R2 Stories Delivered |
|---|---|---|
| JRN-02.2 (Search by fragment) | Trigger → Search → Review Results → Act | US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 |
| Cross-journey (all pages — mobile) | All stages | US-7.1, US-7.3, US-7.4 |
| JRN-02.2 Trigger + JRN-02.1 Load (desktop) | Trigger / Orient | US-7.2, US-7.5 |

**Persona coverage:**
- PER-01 (Cellar Mode): ✅ Enhanced — Gold buttons and visible labels reduce cognitive load
- PER-02 (Planning Mode): ✅ Fully served — JRN-02.2 enabled by search; desktop layout verified

**JTBD addressed:**
- JTBD-02.2 ✅ · JTBD-02.4 ✅
- All JTBD from R1 remain satisfied

**Journey completeness:** JRN-02.2 (Search by name fragment) fully deliverable in R2. JRN-02.1 is further improved by the search shortcut in the Locate stage.

---

## 5. Coverage Analysis

### 5.1 Persona Coverage per Release

| Persona | R1 | R2 |
|---|---|---|
| PER-01 (Cellar Mode — write) | ✅ All write journeys complete (add, edit, delete) | ✅ Enhanced (mobile UX, Gold buttons, visible labels) |
| PER-02 (Planning Mode — read) | ✅ Browse + quantity check (JRN-02.1) | ✅ Search (JRN-02.2) + desktop layout verified |

### 5.2 JTBD Coverage per Release

| JTBD ID | Job (abbreviated) | Priority | R1 | R2 |
|---|---|---|---|---|
| JTBD-01.1 | Record a bottle change before the moment passes | P0 | ✅ US-0.3, US-2.1–2.5, US-5.4, US-5.5 | — |
| JTBD-01.2 | Confirm a save actually persisted | P0 | ✅ US-6.1–6.4, US-5.2 | — |
| JTBD-01.3 | Add a brand-new bottle with minimal keystrokes | P0 | ✅ US-0.4, US-1.1–1.4, US-5.3 | US-7.4 (visible labels) |
| JTBD-01.4 | Remove a fully-consumed bottle | P0 | ✅ US-3.1, US-3.2, US-5.6 | — |
| JTBD-02.1 | Answer "do I still have that bottle?" | P0 | ✅ US-0.1, US-0.2, US-5.2 | — |
| JTBD-02.2 | Find a specific bottle quickly | P1 | ⏳ not covered | ✅ US-4.1–4.5 |
| JTBD-02.3 | Trust that the app reflects reality | P0 | ✅ US-2.6, US-5.1, US-6.4 | — |
| JTBD-02.4 | Review the collection on desktop | P1 | ⏳ not covered | ✅ US-7.2, US-7.5 |

### 5.3 Gap Analysis

**Journey stages with no mapped stories:**
- None. All nine identified stages (Infrastructure Setup, Trigger/Orient, Fill Form, Edit, Submit/API, Delete, Locate/Search, Mobile UI, Desktop UI) have at least one mapped story.

**JTBD outcomes without stories:**
- None. All eight JTBD outcomes (JTBD-01.1 through JTBD-02.4) are addressed across R1 and R2.

**Orphan stories (not mapped to any journey stage):**
- None. All 36 user stories appear in the story map matrix. Every story has been assigned to at least one journey stage and at least one NaC.

**Partial R1 coverage note:**
- JRN-02.1 "Locate" stage relies on visual scanning in R1 (no search). The F4 search shortcut arrives in R2. This is acceptable because visual scanning is viable for cellars under ~40 bottles (typical MVP user profile).

---

## 6. NaC-to-Acceptance-Criteria Alignment

> Verifies that each NaC is consistent with the acceptance criteria already written in UserStories-CellarLite.md.

| SM ID | NaC Statement | UserStory AC Alignment | Status |
|---|---|---|---|
| SM-0.1 | Full list renders server-side in < 1 s with no login | US-0.1: "server-rendered — list visible without client-side loading spinner"; "no login screen or onboarding flow" | ✅ Aligned |
| SM-0.2 | "No bottles yet" shown server-side; no login | US-0.2: "When the `bottles` table has zero rows, the text 'No bottles yet' is visible" | ✅ Aligned |
| SM-0.3 | Each row tappable with ≥ 44 px target → correct edit URL | US-0.3: "tap target for each row is at least 44 px tall"; "navigates to `/bottles/[id]/edit`" | ✅ Aligned |
| SM-0.4 | "Add bottle" visible in all states, ≥ 44 × 44 px | US-0.4: "visible on the list page regardless of whether the cellar is empty or populated"; "tap target ≥ 44 × 44 px" | ✅ Aligned |
| SM-1.1 | All-fields submission → list redirect with new bottle | US-1.1: "After successful submission, the browser redirects to `/`"; new bottle visible in list | ✅ Aligned |
| SM-1.2 | Name-only submission succeeds, qty defaults to 1 | US-1.2: "quantity defaults to 1 when the quantity field is left blank" | ✅ Aligned |
| SM-1.3 | Blank name shows inline error, no POST | US-1.3: "'Name is required' is visible"; "No network request is made to `POST /api/bottles`" | ✅ Aligned |
| SM-1.4 | Cancel returns to `/` with no POST | US-1.4: "Clicking 'Cancel' navigates back to `/` without creating any bottle record" | ✅ Aligned |
| SM-2.1 | Edit page pre-populated from DB | US-2.1: "all five fields pre-populated"; "Each pre-populated value matches the value currently stored in the database" | ✅ Aligned |
| SM-2.2 | Qty change → PUT → list shows new count | US-2.2: "bottle's row on the list page shows quantity=2 after the save"; "`PUT /api/bottles/[id]` is called" | ✅ Aligned |
| SM-2.3 | Any field update persists across reload | US-2.3: "The updated values persist across a page reload of `/`" | ✅ Aligned |
| SM-2.4 | Blank name on edit shows error, DB unchanged | US-2.4: "'Name is required'"; "The bottle record in the database is unchanged" | ✅ Aligned |
| SM-2.5 | Edit cancel → no PUT, no DB change | US-2.5: "no `PUT /api/bottles/[id]` request"; "The bottle record in the database is unchanged" | ✅ Aligned |
| SM-2.6 | Non-existent ID → "Bottle not found", no crash | US-2.6: "'Bottle not found' message"; "does not throw an unhandled error" | ✅ Aligned |
| SM-3.1 | Delete → confirm → DELETE call → absent from list | US-3.1: "`window.confirm('Delete this bottle?')`"; "bottle no longer appears in the list" | ✅ Aligned |
| SM-3.2 | Cancel dialog → no DELETE, record intact | US-3.2: "No `DELETE /api/bottles/[id]` request made"; "bottle still appears in the list" | ✅ Aligned |
| SM-4.1 | Partial match filters in real time, URL updates | US-4.1: "URL updates to include `?q=<term>`"; bottles not matching are not shown | ✅ Aligned |
| SM-4.2 | Case-insensitive via ILIKE | US-4.2: "matching is performed via `ILIKE '%term%'`" | ✅ Aligned |
| SM-4.3 | No-match message includes search term | US-4.3: "message displayed contains the search term (e.g., 'No bottles match 'rioja'')" | ✅ Aligned |
| SM-4.4 | Clear input → remove `?q=` → full list | US-4.4: "removes the `?q=` parameter from the URL"; "full bottle list is rendered" | ✅ Aligned |
| SM-4.5 | Direct load of `/?q=caymus` shows filtered list | US-4.5: "Loading `/?q=caymus` directly shows only bottles matching 'caymus'" | ✅ Aligned |
| SM-5.1 | Health endpoint: 200 `{"status":"ok"}` in < 200 ms | US-5.1: "returns HTTP status 200"; "response body is `{"status":"ok"}`"; "within 200 ms" | ✅ Aligned |
| SM-5.2 | GET /api/bottles returns array; `?q=` filter works | US-5.2: "JSON array of bottle objects" with all fields; `?q=caymus` filters correctly | ✅ Aligned |
| SM-5.3 | POST returns 201 + object; missing name → 422 | US-5.3: "HTTP status 201"; 422 on missing name; 422 on quantity=0 | ✅ Aligned |
| SM-5.4 | GET /[id] returns 200 or 404 | US-5.4: 200 for existing; 404 for non-existent or non-integer id | ✅ Aligned |
| SM-5.5 | PUT returns 200; qty=-1 → 422; missing → 404 | US-5.5: 200 + updated object; qty=0 allowed; qty=-1 → 422; id 99999 → 404 | ✅ Aligned |
| SM-5.6 | DELETE returns 204; non-existent → 404 | US-5.6: "HTTP status 204 with no response body"; deleted bottle absent from subsequent GET | ✅ Aligned |
| SM-6.1 | Migration creates table on first run; logs "Migration complete." | US-6.1: "creates the `bottles` table before Next.js boots"; "logs 'Migration complete.'" | ✅ Aligned |
| SM-6.2 | Second migration run exits 0; records intact | US-6.2: "exits with code 0 both times"; "Existing bottle records are intact"; "uses `CREATE TABLE IF NOT EXISTS`" | ✅ Aligned |
| SM-6.3 | Missing DATABASE_URL → non-zero exit + stderr | US-6.3: "non-zero exit code"; "error message logged to stderr includes 'DATABASE_URL'" | ✅ Aligned |
| SM-6.4 | Data survives server restart | US-6.4: "Bottle data is stored in PostgreSQL and survives a full page reload" | ✅ Aligned |
| SM-7.1 | No horizontal scroll at 375 px; all targets ≥ 44 × 44 px | US-7.1: "All pages render without horizontal scroll at 375 px"; "tap target ≥ 44 × 44 px" | ✅ Aligned |
| SM-7.2 | No overlaps or horizontal scroll at 1440 px | US-7.2: "All pages render without overlapping elements at 1440 px"; no horizontal scrolling | ✅ Aligned |
| SM-7.3 | Submit + CTA buttons use Gold `#FBCA5C` | US-7.3: submit buttons on add and edit forms use `#FBCA5C`; CTA uses Gold | ✅ Aligned |
| SM-7.4 | All form inputs have visible `<label>` | US-7.4: "every `<input>` has a corresponding visible `<label>` element"; "not hidden with `sr-only`" | ✅ Aligned |
| SM-7.5 | No frame-blocking headers | US-7.5: "no `X-Frame-Options: DENY`"; "no `frame-ancestors 'none'`" | ✅ Aligned |

**NaC alignment result: 36 / 36 stories — all NaC verified against UserStory acceptance criteria. No misalignments found.**

---

## Validation Checklist

- [x] Every UserStory (US-0.1 through US-7.5, 36 total) appears in the story map matrix
- [x] Every mapped story has a NaC derived from a specific JTBD outcome
- [x] NaC Derivation Table (Section 3) has full JTBD → stage → NaC → story traceability for all 36 stories
- [x] Release planning defines R1 (26 P0 stories) and R2 (10 P1 stories)
- [x] Coverage analysis confirms no journey stage gaps, no JTBD gaps, no orphan stories
- [x] Each release enables at least one complete journey end-to-end
- [x] NaC-to-Acceptance-Criteria mapping (Section 6) verifies all 36 NaC against UserStory ACs
- [x] No new stories invented — only existing UserStories.md stories are mapped

---

*Document generated: 2026-06-13 | Derived from: PERSONAS-CellarLite.md · JOURNEYS-CellarLite.md · JTBD-CellarLite.md · UserStories-CellarLite.md · PRD-CellarLite.md*
*Feeds into: Sprint planning, UAT test-case derivation, increment demo preparation*
