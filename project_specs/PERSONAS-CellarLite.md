# PERSONAS: CellarLite

| Field | Value |
|---|---|
| Product Name | CellarLite |
| Version | 1.0 |
| Date | 2026-06-13 |
| Related PRD | PRD-CellarLite.md |
| Status | Active |

---

## Overview

CellarLite is a **single-user personal app**. There is exactly one human consumer of the cellar data — the owner of the bottles. However, that one person interacts with the app in two distinct behavioral modes that drive different design priorities:

- **At the cellar (PER-01):** Physical access to bottles, making inventory changes — the primary write context.
- **Away from the cellar (PER-02):** Remote lookup and planning — the primary read context.

These are not two people. They are the same person in different situations, with different constraints (device, time pressure, connectivity) that produce meaningfully different UX requirements. Both personas must be served well for the app to deliver its core value.

---

## Persona Summary Table

| ID | Name | Mode | Primary Goal |
|---|---|---|---|
| PER-01 | Alex (Cellar Mode) | At the physical cellar — adding, editing, removing bottles | Keep the inventory accurate in real time with minimal friction |
| PER-02 | Alex (Planning Mode) | Away from cellar — browsing, searching, deciding what to buy or open | Answer "what do I have?" quickly, on any device |

---

## PER-01: Alex — Cellar Mode

**Role & Context:**
Alex is a casual-to-enthusiastic home wine collector who maintains a personal cellar of 30–150 bottles — a mix of everyday drinking wines and a few deliberate age-worthy keepers. When physically in the cellar (basement, wine fridge, storage unit), Alex has a bottle in one hand and a phone in the other. The session lasts under two minutes. The goal is simple: record what just happened — a bottle was added from a new delivery, one was pulled and consumed, or a rack was reorganized and locations changed.

In cellar mode, Alex has no patience for slow load times, multi-step flows, or forms that require a laptop. Every second spent wrestling with the UI is a second standing in a cold storage room. The single biggest frustration with the previous approach (a spreadsheet) was that it was never open when needed and never reflected what actually happened after the last visit.

**Goals:**
- Record a bottle addition (new delivery, gift, purchase) before forgetting the details — especially vintage and varietal. *(F1)*
- Decrement quantity immediately after opening a bottle so the count never drifts. *(F2)*
- Update a bottle's location after moving bottles between racks or shelves. *(F2)*
- Remove a bottle entirely when the last one is consumed or given away. *(F3)*
- Trust that the data will still be there after a server restart — no silent data loss. *(F6)*

**Pain Points:**
- Spreadsheets require a laptop; by the time Alex opens one, the moment has passed and the update is forgotten.
- Full wine apps (Vivino, CellarTracker) demand account creation and social interactions — overhead that adds friction for a personal collection.
- Generic apps lack a quantity field that maps to "bottles remaining," forcing workarounds.
- No quick confirmation that a save actually worked — anxiety about whether the change persisted.

**Technical Expertise:** Everyday smartphone user. Comfortable with standard web forms and tap interactions. Does not use command-line tools or developer workflows. Expects the app to work like a native mobile app even though it runs in a browser.

**Top Tasks:**
1. Decrement quantity after opening a bottle (multiple times per week, highest frequency)
2. Add a new bottle from a recent purchase or delivery (weekly)
3. Update a bottle's storage location after reorganizing the rack (occasional)
4. Delete a bottle that has been fully consumed (occasional)
5. Confirm the current count of a specific bottle before opening another (quick lookup, frequent)

**Success Criteria:**
- Can update a bottle's quantity in under 30 seconds from tapping the app open.
- Every change is reflected on the list page immediately after save — no stale data.
- Form submits and redirects without requiring a second confirmation tap.
- App is fully usable one-handed on a 375 px screen with no horizontal scrolling.

---

## PER-02: Alex — Planning Mode

**Role & Context:**
Away from the cellar — at a restaurant, wine shop, dinner party, or grocery store — Alex wants to consult the collection without physically inspecting it. The question is usually one of: "Do I already have a bottle of X?" or "How many of that Rioja do I have left?" or "What's the oldest thing I'm sitting on?"

In planning mode, Alex is browsing and reading, not writing. The session may happen on a phone or a desktop browser (sitting at a desk, planning a dinner menu or a purchase). Connection may be slower; interruptions are common. The key value is **instant, reliable access to the current state of the collection** — a single source of truth that replaces mental notes and "I think I have two of those" uncertainty.

Alex also uses planning mode to build a shopping list by cross-referencing what is running low before a trip to a wine merchant. In the MVP, this means scanning the list and quantities manually — no automated low-stock alert yet.

**Goals:**
- Answer "do I still have that bottle, and how many?" without going to the cellar. *(F0, F4)*
- Browse the full collection to recall what is available for an upcoming dinner. *(F0)*
- Search by name or varietal fragment to check a specific bottle quickly. *(F4)*
- View the collection on a desktop browser when planning ahead at a desk. *(F7)*
- Trust that what is displayed reflects reality — not a stale snapshot. *(F5, F6)*

**Pain Points:**
- Mental notes about the cellar are unreliable — "I think I have two of those" is not good enough at a wine shop checkout.
- Spreadsheets shared via email or cloud sync are not reliably up-to-date; edits made in cellar mode may not have synced.
- No way to search quickly in a large flat list without scrolling through dozens of rows.
- Full wine apps surface community reviews, social feeds, and market prices — noise for someone who only wants their own inventory.

**Technical Expertise:** Comfortable with browser-based web apps on both mobile and desktop. Uses search inputs and URL-based navigation naturally. Does not need or want advanced filters, pagination controls, or sortable columns at MVP.

**Top Tasks:**
1. Scan the full bottle list to get an overview of what's available (several times per week)
2. Search by name fragment to check if a specific bottle is in stock (frequent, triggered by real-world context)
3. Check the quantity of a specific bottle before deciding whether to buy more (before a shopping trip)
4. Review storage locations to plan what to pull for an upcoming occasion (before a dinner)

**Success Criteria:**
- Full bottle list loads in under 1 second on a standard mobile connection.
- Search returns correct results for a partial name in real time (no page reload required).
- No login screen, no onboarding flow — the list is immediately visible on first visit.
- App renders correctly and is readable on a desktop browser at 1440 px as well as 375 px.

---

## Persona Relationships

| | PER-01 (Cellar Mode) | PER-02 (Planning Mode) |
|---|---|---|
| **PER-01 (Cellar Mode)** | — | Writes data that PER-02 reads; accuracy in cellar mode is the foundation of trust in planning mode |
| **PER-02 (Planning Mode)** | Identifies gaps (low quantities, missing bottles) that trigger PER-01 actions | — |

**Key insight:** These modes are tightly coupled. If PER-01 skips an update (friction too high), PER-02 loses trust in the data entirely. The most important UX investment is reducing PER-01 write friction — everything downstream depends on it.

---

## Feature-Persona Matrix

| Feature | Description | PER-01 (Cellar Mode) | PER-02 (Planning Mode) |
|---|---|---|---|
| **F0** | Bottle List Page (`/`) | Secondary — confirms save landed | **Primary** — core browsing experience |
| **F1** | Add Bottle Page (`/bottles/new`) | **Primary** — main write action | None — rarely adds bottles while browsing |
| **F2** | Edit Bottle Page (`/bottles/[id]/edit`) | **Primary** — quantity and location updates | Secondary — occasional detail review |
| **F3** | Delete Bottle | **Primary** — end-of-life inventory management | None |
| **F4** | Search / Filter by Name | Secondary — useful for large cellars | **Primary** — core lookup pattern |
| **F5** | REST API | Secondary — powers the UI used in cellar mode | Secondary — powers the UI used in planning mode |
| **F6** | Database Auto-Migration | **Primary** — zero-setup reliability is a trust prerequisite | Secondary — reliability underpins data trust |
| **F7** | Brand & Mobile-First UI | **Primary** — must work one-handed on 375 px screen | Secondary — desktop layout is a nice-to-have |

**Matrix Key:**
- **Primary** — this feature directly serves this persona's core tasks; must be excellent for this mode
- **Secondary** — this feature is used by this persona but is not their primary driver
- **None** — this persona does not meaningfully interact with this feature

---

## Design Implications

1. **Speed over completeness (PER-01).** Every additional tap on the write path is a potential drop-off. The edit page must be the fastest possible route from "I just opened a bottle" to "quantity saved."

2. **Trust through reliability (both).** A single instance of stale data or a failed save destroys the app's core value proposition. F6 (auto-migration) and F5 (REST API) are infrastructure for trust, not just technical requirements.

3. **Search is the power move for larger cellars (PER-02).** Once the cellar exceeds ~40 bottles, scrolling becomes impractical. F4 search must be prominent on the list page, not hidden.

4. **No login is a feature, not a gap.** For a personal app, zero-authentication is a deliberate reduction in friction — especially for PER-01 who is standing in a cold room.

5. **Desktop is a second-class citizen in MVP, but must not break.** PER-02 occasionally uses a laptop. The layout does not need to be optimized for 1440 px, but must not render broken or unreadable at that width.

---

*Document generated: 2026-06-13 | Derived from: PRD-CellarLite.md (Section 2 Problem Statement, Section 5 Features, Section 7 Success Metrics)*
*Next: FRD-CellarLite.md, UserStories-CellarLite.md*
