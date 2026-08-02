# Personas
## Overview

| Field | Value |
|-------|-------|
| **Product Name** | Overview |
| **Date** | 2026-08-02 |
| **Related PRD** | PRD-CellarLite.md |

---

## Persona Summary

| ID | Name | Role | Primary Goal |
|----|------|------|-------------|
| PER-01 | Alex — Cellar Mode | At the physical cellar — adding, editing, removing bottles | Record a bottle addition (new delivery, gift, purchase) before forgetting the details — especially vintage and varietal. *(F1)* |
| PER-02 | Alex — Planning Mode | Away from cellar — browsing, searching, deciding what to buy or open | Answer "do I still have that bottle, and how many?" without going to the cellar. *(F0, F4)* |
| PER-03 | marcus | sys admin |  |

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

## PER-03: marcus

**Role & Context:**
best worker ever

**Goals:**

**Pain Points:**

**Technical Expertise:** Intermediate

**Top Tasks:**

**Success Criteria:**

---

## Persona Relationships

| Persona | Interacts With | Nature of Interaction |
|---------|---------------|----------------------|
| **PER-01 (Cellar Mode)** | — | Writes data that PER-02 reads; accuracy in cellar mode is the foundation of trust in planning mode |
| **PER-02 (Planning Mode)** | Identifies gaps (low quantities, missing bottles) that trigger PER-01 actions | — |

---

## Feature-Persona Matrix

| Feature | PER-01 | PER-02 | PER-03 |
|---------|--------|--------|--------|
| **F0** | -- | -- | -- |
| **F1** | -- | -- | -- |
| **F2** | -- | -- | -- |
| **F3** | -- | -- | -- |
| **F4** | -- | -- | -- |
| **F5** | -- | -- | -- |
| **F6** | -- | -- | -- |
| **F7** | -- | -- | -- |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-02*
