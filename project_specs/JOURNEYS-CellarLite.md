# JOURNEYS: CellarLite
**User Journey Maps**

| Field | Value |
|---|---|
| Product Name | CellarLite |
| Version | 1.0 |
| Date | 2026-06-13 |
| Related Personas | PERSONAS-CellarLite.md (PER-01, PER-02) |
| Related JTBD | JTBD-CellarLite.md |
| Related PRD | PRD-CellarLite.md |
| Status | Active |

---

## Journey Index

| JRN-ID | Persona | Scenario | Key JTBD | Stages |
|---|---|---|---|---|
| JRN-01.1 | PER-01 (Cellar Mode) | Adding a new bottle from a delivery | JTBD-01.3 | 5 |
| JRN-01.2 | PER-01 (Cellar Mode) | Decrementing quantity after opening a bottle | JTBD-01.1, JTBD-01.2 | 5 |
| JRN-01.3 | PER-01 (Cellar Mode) | Deleting a fully-consumed bottle | JTBD-01.4 | 5 |
| JRN-02.1 | PER-02 (Planning Mode) | Browsing the cellar inventory from a wine shop | JTBD-02.1, JTBD-02.3 | 4 |
| JRN-02.2 | PER-02 (Planning Mode) | Searching for a specific bottle by name fragment | JTBD-02.2 | 4 |

---

## PER-01 Journeys — Alex in Cellar Mode

---

### JRN-01.1: Adding a New Bottle from a Delivery

**Persona:** PER-01 (Alex — Cellar Mode)

**Scenario:** Alex has just returned from a wine merchant with a mixed case. Standing at the cellar entrance with the box open, phone in one hand and a bottle in the other, Alex wants to log the new acquisition before the details are forgotten — especially the vintage and varietal printed on the label right in front of them. The session must complete before the box gets put away and the label disappears.

**Related Jobs:** JTBD-01.3 (Add a brand-new bottle with minimal keystrokes)

### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Pulls out phone with a bottle in the other hand; opens the CellarLite URL or bookmark | Browser / home screen bookmark | "I need to log this before I forget the vintage — I'll do it now while the label is right here." | Slightly rushed, purposeful | No dedicated home-screen shortcut yet; has to find the URL | PWA-style "Add to Home Screen" prompt reduces next-session friction |
| **Orient** | Sees the bottle list; locates and taps "Add bottle" button | F0 — Bottle List Page (`/`) | "Good, it loaded fast. Now where's the add button?" | Focused | If the list is long, the Add button may scroll out of view | Pin "Add bottle" as a sticky button at top or bottom of list |
| **Fill Form** | Types bottle name from label; enters vintage (year), varietal; leaves location blank for now | F1 — Add Bottle Page (`/bottles/new`) | "Name and vintage are the most important. I can fill location later." | Concentrated, one thumb typing | Mobile keyboard may obscure the Submit button on small screens | Auto-scroll form to keep Submit visible when keyboard is open |
| **Submit** | Taps Submit; waits for redirect | F1 — Add Bottle Page → F5 REST API (`POST /api/bottles`) | "Did it save? I only tapped once — please don't make me confirm again." | Anxious for a half-second | Any network hiccup here loses entered data | Optimistic redirect on success; inline error + data preserved on failure |
| **Confirm** | Lands on list page; scans to find the new bottle at the top or in the list | F0 — Bottle List Page (`/`) | "There it is — name and vintage correct. Done." | Relieved, satisfied | New bottle may not be visually prominent among existing entries | Sort new entries first or briefly highlight the newly added row |

### Key Moments
- **Decision Point — Fill Form stage:** Alex decides whether to fill only required fields (name) or invest 10 more seconds for vintage + varietal while the label is in hand. If the form is slow or confusing, Alex submits with name only and loses structured data permanently.
- **Risk of Abandonment — Submit stage:** Any error without data preservation forces re-entry. This is the single highest-risk moment; a failed save in a cold cellar with a bottle in hand is the scenario that drove the original spreadsheet abandonment.
- **Delight Opportunity — Confirm stage:** Seeing the new bottle appear instantly in the list, with the correct name and vintage, is the core trust-building moment. A subtle visual highlight ("just added") would reinforce that the save worked without requiring a second action.

### Success Outcome
A new bottle is logged — including name, vintage, and varietal — from first tap to list redirect in under 45 seconds. The entry appears immediately in the list without a manual refresh. (JTBD-01.3 success measure)

### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F7 (Mobile-First UI) |
| Orient | F0 (Bottle List Page) |
| Fill Form | F1 (Add Bottle Page), F7 (Mobile-First UI) |
| Submit | F1 (Add Bottle Page), F5 (REST API) |
| Confirm | F0 (Bottle List Page), F6 (Database Auto-Migration) |

---

### JRN-01.2: Decrementing Quantity After Opening a Bottle

**Persona:** PER-01 (Alex — Cellar Mode)

**Scenario:** Alex has just opened a bottle of Rioja for dinner. Before returning upstairs, Alex wants to decrement the quantity from 3 to 2 — the highest-frequency action in the app (multiple times per week). The cellar is cold. Both hands are partially occupied. The update must complete in under 30 seconds or it will be deferred and likely forgotten entirely, allowing the count to drift.

**Related Jobs:** JTBD-01.1 (Record a bottle change before the moment passes), JTBD-01.2 (Confirm a save actually persisted without anxiety)

### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Opens app from bookmark or recent browser tab; list page loads | F0 — Bottle List Page (`/`) | "Quick — update the Rioja before I go back upstairs." | Slightly impatient, focused | If the last session left a search active, the target bottle may not be visible | Clear search state on load, or persist a useful default |
| **Locate** | Scans the list to find the Rioja entry; taps the row | F0 — Bottle List Page (`/`) | "Third row — there it is. Tap." | Focused | In a large cellar, scanning is slow without search; must scroll | Prominent search input on list page to skip scrolling |
| **Edit** | Edit page loads pre-populated; taps quantity field, changes 3 → 2 | F2 — Edit Bottle Page (`/bottles/[id]/edit`) | "Quantity is pre-filled — I just need to change this one digit." | Relieved the page pre-filled; mildly concentrated | Quantity field may require clearing before re-entering; number pad behavior varies by browser | Use `<input type="number">` with select-on-focus for instant digit replacement |
| **Submit** | Taps Save; form submits via PUT; redirect fires | F2 — Edit Bottle Page → F5 REST API (`PUT /api/bottles/[id]`) | "One tap. Please just work." | Briefly anxious | Any lag here feels like failure; no feedback during the API call | Show a subtle loading state or disable button on submit to prevent double-tap |
| **Confirm** | Lands on list page; sees Rioja showing quantity 2 | F0 — Bottle List Page (`/`) | "Quantity updated. I can go back upstairs." | Relieved, trusting | If the list is stale or shows the old value, trust is immediately broken | Ensure server-rendered list always reflects the latest DB state — no client cache |

### Key Moments
- **Decision Point — Trigger stage:** If the app takes more than 2 seconds to load, Alex may decide to "do it later" — the moment passes, the count drifts. Load speed is the primary conversion metric for this journey.
- **Risk of Abandonment — Locate stage:** If the bottle isn't visible immediately (search state left over, or list too long to scan), Alex will either give up or spend 15+ seconds scrolling — both outcomes degrade trust.
- **Delight Opportunity — Edit stage:** A quantity field that selects its contents on tap lets Alex retype in one motion rather than clearing first. This micro-interaction saves 2–3 seconds and feels polished.

### Success Outcome
Alex decrements a bottle's quantity and is back on the list page — seeing the correct updated count — within 30 seconds of opening the app. Zero second confirmation taps required. (JTBD-01.1 success measure)

### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F0 (Bottle List Page), F7 (Mobile-First UI) |
| Locate | F0 (Bottle List Page), F4 (Search) |
| Edit | F2 (Edit Bottle Page), F7 (Mobile-First UI) |
| Submit | F2 (Edit Bottle Page), F5 (REST API) |
| Confirm | F0 (Bottle List Page), F6 (Database Auto-Migration) |

---

### JRN-01.3: Deleting a Fully-Consumed Bottle

**Persona:** PER-01 (Alex — Cellar Mode)

**Scenario:** Alex has opened the last bottle of a particular Chardonnay. There are no more in stock. Rather than leaving a quantity-0 ghost entry in the list, Alex wants to delete the record entirely to keep the inventory clean and accurate. This is a less frequent action than decrementing (occasional, not weekly), but must be straightforward and protected against accidental triggering.

**Related Jobs:** JTBD-01.4 (Remove a fully-consumed bottle to keep the count clean)

### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Opens app; locates the Chardonnay row in the list; taps to open its edit page | F0 — Bottle List Page (`/`) | "Last bottle opened. Time to remove it from the list." | Matter-of-fact, slightly decisive | Must find the bottle first — same locate friction as JRN-01.2 | Consistent navigation pattern (tap row → edit page) keeps muscle memory intact |
| **Assess** | Edit page loads; sees quantity field showing 1 (or 0); decides to delete rather than set to 0 | F2 — Edit Bottle Page (`/bottles/[id]/edit`) | "I could set quantity to 0, but that leaves a ghost entry. Better to delete it." | Deliberate | No visual nudge toward delete when quantity is 0 or 1 | If quantity field is set to 0 on save, suggest deletion ("Remove this bottle?") |
| **Initiate Delete** | Taps "Delete" button on the edit page | F3 — Delete Bottle (`/bottles/[id]/edit`) | "Where's the delete button? Hope I don't tap Save by mistake." | Cautious | Delete button must be visually distinct from Save to prevent accidents | Style Delete as a secondary/destructive action (e.g., red text, lower on page) |
| **Confirm** | Native browser `confirm()` dialog appears; taps OK | F3 — Delete Bottle (browser dialog) | "Yes, I'm sure — delete it." | Briefly hesitant, then committed | Browser confirm dialogs are visually inconsistent across devices; no "undo" option | Native confirm is sufficient for MVP; soft-delete / undo is a post-MVP enhancement |
| **Verify** | Redirected to list page; Chardonnay entry is gone | F0 — Bottle List Page (`/`) | "Gone. List looks cleaner now." | Satisfied, relieved | If the entry is still visible (stale render), Alex may tap Delete again, risking a 404 | Server-render the post-delete list fresh; never serve a cached version |

### Key Moments
- **Decision Point — Assess stage:** Alex consciously chooses delete over "set to 0." This is the point where a zero-quantity save could be an alternative — but it leaves clutter. A product nudge here (subtle "Remove this bottle?" suggestion when qty is 1) could improve the flow.
- **Risk of Abandonment — Initiate Delete stage:** If the Delete button is hard to find, or too close to Save, Alex may abandon the task to avoid accidental submission. Button placement and visual hierarchy are critical.
- **Delight Opportunity — Verify stage:** The cleaner list after deletion is intrinsically satisfying. An optional "Bottle removed" toast (non-blocking) would reinforce the action without adding friction.

### Success Outcome
Alex deletes a spent bottle and sees the cleaned-up list within 20 seconds of arriving at the edit page. The native confirm dialog prevents any accidental deletions. (JTBD-01.4 success measure)

### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F0 (Bottle List Page) |
| Assess | F2 (Edit Bottle Page) |
| Initiate Delete | F3 (Delete Bottle) |
| Confirm | F3 (Delete Bottle — browser dialog) |
| Verify | F0 (Bottle List Page), F5 (REST API) |

---

## PER-02 Journeys — Alex in Planning Mode

---

### JRN-02.1: Browsing the Cellar Inventory at a Wine Shop

**Persona:** PER-02 (Alex — Planning Mode)

**Scenario:** Alex is standing in a wine shop, considering buying another bottle of the Barolo that's been aging in the cellar. Before spending €45, Alex wants to confirm how many are already in stock and whether any are approaching peak drinking age. Phone is out, connection is standard mobile data, and the shop assistant is waiting. The lookup must be instant.

**Related Jobs:** JTBD-02.1 (Answer "do I still have that bottle?" from anywhere), JTBD-02.3 (Trust that what the app shows reflects the real cellar)

### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Reaches for phone in the wine shop; navigates to the CellarLite URL | Browser — mobile | "Do I still have that Barolo? Let me check before I buy another one." | Slightly pressured (shop assistant nearby) | No offline mode; depends on mobile data signal | Ensure sub-1s load on standard mobile connection (server-side render is key) |
| **Load & Orient** | List page loads immediately — no login prompt, no onboarding screen; all bottles visible | F0 — Bottle List Page (`/`) | "Good — it loaded straight away. Now let me find the Barolo." | Relieved, focused | If load takes >1s, anxiety spikes (assistant is watching) | Server-render the full list; no client-side waterfall for initial data |
| **Locate** | Scans list visually for "Barolo"; reads quantity and vintage columns | F0 — Bottle List Page (`/`) | "Three bottles, 2019 vintage. I have plenty — I don't need another." | Confident | In a 40+ bottle cellar, visual scanning takes 10–15 seconds | Search input (F4) is the escape valve; visible enough to be discovered without prompting |
| **Decide & Exit** | Puts phone away; makes purchase decision | — (off-app) | "Three is enough. I'll skip this one." | Confident, satisfied | None at this stage | A reliable, accurate list *is* the delight — no additional feature needed |

### Key Moments
- **Decision Point — Locate stage:** Alex finds the Barolo entry and reads quantity 3. This single data point — accurate, fast, no login — is the entire value proposition of the app. If the count is wrong (stale data), Alex loses trust and this journey never repeats.
- **Risk of Abandonment — Load & Orient stage:** A login prompt, onboarding modal, or load time exceeding 1 second breaks the flow in a live social context. These are the top conversion killers for planning-mode sessions.
- **Delight Opportunity — Load & Orient stage:** An app that opens directly to the full, accurate list — with no friction — feels genuinely useful compared to "I think I have two of those."

### Success Outcome
Alex opens the app and confirms the Barolo quantity within 15 seconds, without performing a search or encountering any login prompt. (JTBD-02.1 success measure)

### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F7 (Mobile-First UI) |
| Load & Orient | F0 (Bottle List Page), F5 (REST API), F6 (Database Auto-Migration) |
| Locate | F0 (Bottle List Page), F4 (Search) |
| Decide & Exit | — |

---

### JRN-02.2: Searching for a Specific Bottle by Name Fragment

**Persona:** PER-02 (Alex — Planning Mode)

**Scenario:** Alex is at home at a desk, planning a dinner party for the weekend. The cellar has grown to 55 bottles. Alex wants to check whether there are any Grenache-based wines available — a specific varietal the guests prefer — without scrolling through the entire list. Alex opens the app on a laptop browser and uses the search field to filter by varietal fragment.

**Related Jobs:** JTBD-02.2 (Find a specific bottle quickly in a growing collection), JTBD-02.4 (Review the collection on a desktop when planning ahead)

### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Opens CellarLite in a desktop browser tab; list of 55 bottles loads | F0 — Bottle List Page (`/`) + F7 (Brand UI — desktop) | "I need to find the Grenache wines — there's no way I'm scrolling through 55 rows." | Pragmatic, slightly impatient | Full list is long on desktop too; no column sort in MVP | Prominent search input at page top signals the correct interaction immediately |
| **Search** | Clicks the search field; types "gren" (partial fragment) | F4 — Search (`?q=gren`) | "Let's see if partial matching works — I don't want to type the full name." | Curious, slightly cautious | If search requires exact match, Alex will miss wines stored as "Grenache Blend" or "Garnacha" | Case-insensitive `ILIKE '%gren%'` covers common fragments; visible URL update confirms state |
| **Review Results** | List filters in real time to show 3 matching bottles; reads names, vintages, quantities | F0 — Bottle List Page (filtered) | "Three Grenache wines — a 2018, a 2020, and a Garnacha from Navarra. Perfect." | Satisfied, planning mode engaged | No way to open bottles side-by-side for comparison in MVP | Filtered results immediately give the planning answer; no additional feature needed at MVP |
| **Act on Information** | Notes which bottles are available; closes the tab | — (off-app) | "I'll serve the 2018 Grenache — it's the ripest. Two bottles in stock, plenty." | Confident, organised | None | The search-to-decision flow completed entirely without friction |

### Key Moments
- **Decision Point — Search stage:** Alex types a fragment and watches results update in real time. If the update requires a page reload, the planning flow is interrupted and the perceived responsiveness drops sharply. Real-time filtering (no reload) is the make-or-break UX detail for this journey.
- **Risk of Abandonment — Trigger stage:** If no search input is visible (hidden behind a button, or below the fold), Alex will start scrolling — and likely give up after 10–15 rows. Search discoverability is as important as search functionality.
- **Delight Opportunity — Review Results stage:** The URL updating to `?q=gren` means Alex can bookmark this filtered view or share it (to a future self). This small detail — URL-driven search state — turns a one-time lookup into a reusable shortcut.

### Success Outcome
Alex locates all Grenache-varietal bottles by typing a 4-character fragment within 10 seconds of arriving on the list page. The filtered list renders without a page reload, and the URL reflects the search state. (JTBD-02.2 success measure)

### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F0 (Bottle List Page), F7 (Brand & Mobile-First UI — desktop rendering) |
| Search | F4 (Search / Filter by Name), F5 (REST API `GET /api/bottles?q=`) |
| Review Results | F0 (Bottle List Page — filtered state), F4 (Search) |
| Act on Information | — |

---

## Cross-Journey Patterns

### Common Pain Points (Appearing in 2+ Journeys)

| Pain Point | Journeys Affected | Shared Opportunity |
|---|---|---|
| **Locating a specific bottle in a long list** | JRN-01.2 (Locate stage), JRN-01.3 (Trigger stage), JRN-02.1 (Locate stage) | The F4 search input on the list page is the universal solution; it must be prominent enough to be discovered without instruction |
| **Trust in data freshness after a session gap** | JRN-02.1 (Load & Orient stage), JRN-02.2 (Trigger stage) | Server-side rendering with live DB reads on every request — no client-side caching — is the single architectural decision that resolves this across both planning-mode journeys |
| **Load time anxiety under time pressure** | JRN-01.2 (Trigger stage), JRN-02.1 (Trigger stage) | Sub-1s load is the shared success criterion for both personas; Next.js server rendering + a single SQL query is the correct architecture |
| **No feedback during form submission** | JRN-01.1 (Submit stage), JRN-01.2 (Submit stage) | A disabled submit button on click (prevents double-tap) + redirect-as-confirmation covers both write journeys without adding UI complexity |

### Shared Opportunities Across All Journeys

- **Bookmarkable URL as a feature:** URL-driven search state (JRN-02.2) and direct navigation to `/` (all journeys) mean the URL itself is a productivity shortcut. Encouraging "Add to Home Screen" as a one-time nudge would benefit PER-01 especially.
- **The list page is the convergence point:** Every journey starts or ends at `/`. The list page's performance, legibility, and "Add bottle" button prominence affect all 5 journeys. It is the single highest-leverage surface in the entire app.
- **Absence of authentication is a shared delight:** Both PER-01 (cold cellar, one hand occupied) and PER-02 (time pressure at a shop) benefit from the zero-login design. Any future login requirement would break both primary personas' flows.

---

## Journey-to-JTBD Traceability

| Journey | Stage | JTBD-ID | Expected Outcome |
|---|---|---|---|
| JRN-01.1 | Fill Form | JTBD-01.3 | Name field is required only; form submittable in < 10 s if needed |
| JRN-01.1 | Submit | JTBD-01.3 | POST succeeds; redirect fires; no second confirmation required |
| JRN-01.1 | Confirm | JTBD-01.3 | New bottle appears in list immediately; no manual refresh |
| JRN-01.2 | Trigger | JTBD-01.1 | List page loads in < 1 s from cold tap |
| JRN-01.2 | Edit | JTBD-01.1 | Quantity field editable in a single tap; pre-populated value visible |
| JRN-01.2 | Submit | JTBD-01.1 | PUT fires; redirect completes; total elapsed < 30 s |
| JRN-01.2 | Confirm | JTBD-01.2 | Updated quantity visible on list immediately; value survives server restart |
| JRN-01.3 | Initiate Delete | JTBD-01.4 | Delete button accessible on edit page; visually distinct from Save |
| JRN-01.3 | Confirm (dialog) | JTBD-01.4 | Native browser confirm prevents accidental deletion |
| JRN-01.3 | Verify | JTBD-01.4 | Bottle absent from list within 20 s; redirect complete |
| JRN-02.1 | Load & Orient | JTBD-02.1 | Full list renders in < 1 s; no login prompt; no onboarding |
| JRN-02.1 | Load & Orient | JTBD-02.3 | Data reflects last cellar-mode write; no stale snapshot |
| JRN-02.1 | Locate | JTBD-02.1 | Quantity and vintage visible inline; no tap-to-expand |
| JRN-02.2 | Search | JTBD-02.2 | Partial fragment returns filtered results in real time (no reload) |
| JRN-02.2 | Search | JTBD-02.2 | URL updates to `?q=<term>`; search state preserved on reload |
| JRN-02.2 | Review Results | JTBD-02.2 | No-results state shows contextual message, not generic empty-cellar message |
| JRN-02.2 | Trigger | JTBD-02.4 | All pages render correctly at 1440 px; no horizontal scroll |

---

*Document generated: 2026-06-13 | Derived from: PERSONAS-CellarLite.md, JTBD-CellarLite.md, PRD-CellarLite.md, PROJECT.md*
*Next: FRD-CellarLite.md, UserStories-CellarLite.md, STORY-MAP-CellarLite.md*
