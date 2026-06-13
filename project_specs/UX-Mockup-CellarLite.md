# UX Mockup — CellarLite

**Project:** CellarLite
**Generated:** 2026-06-13
**Based on:** UserStories-CellarLite.md, PRD-CellarLite.md, FRD-CellarLite.md, JOURNEYS-CellarLite.md, PROJECT.md

---

## Overview

CellarLite is a personal, mobile-first wine-cellar tracker. The UX is built around two modes of the same user — Alex — who alternates between **Cellar Mode** (writing: adding, editing, removing bottles, one-handed in a cold cellar) and **Planning Mode** (reading: browsing inventory quickly at a wine shop or desk).

### Design Principles

1. **Speed over features.** Every primary action completes in ≤ 30 seconds. The list page loads with no spinner, no login, no modal.
2. **Thumb-first layout.** 375 px is the primary viewport. Primary actions (Submit, Add bottle) sit in thumb reach. All tap targets ≥ 44 × 44 px.
3. **Gold is a signal, not a surface.** TechSur Gold `#FBCA5C` marks exactly one primary action per view. It never fills a background or card.
4. **Errors preserve work.** Inline errors never clear entered data. Cancel/escape paths are always one tap away.
5. **URL = state.** Search state lives in `?q=`. Reloading always reproduces the same view.
6. **No surprises.** Destructive actions (delete) require an explicit browser confirmation. Cancel always returns to the list.

### Brand Tokens

| Token | Value | Use |
|---|---|---|
| `--color-accent` | `#FBCA5C` | Primary buttons, focus rings, key links |
| `--color-text` | `#0A0A0A` | All body and label text |
| `--color-surface` | `#FFFFFF` | Page background, card surfaces |
| `--color-accent-hover` | `#E8B540` | Accent button hover/active state |
| `--color-error` | `#D93025` | Inline error text and border |
| `--color-muted` | `#6B7280` | Secondary/metadata text (vintage, varietal) |
| `--color-border` | `#E5E7EB` | Card borders, input borders |
| `--color-destructive` | `#B91C1C` | Delete button text |

### Page Inventory

| Route | Page | Primary User Stories |
|---|---|---|
| `/` | Bottle List (+ Search) | US-0.1, US-0.2, US-0.3, US-0.4, US-4.1–4.5 |
| `/bottles/new` | Add Bottle | US-1.1–1.4 |
| `/bottles/[id]/edit` | Edit Bottle + Delete | US-2.1–2.6, US-3.1–3.2 |
| `/bottles/[id]/edit` (not found) | Bottle Not Found | US-2.6 |

### Navigation Structure

```
Nav bar: [CellarLite logo / "My Cellar" wordmark]  [+ Add bottle →]
```

Only two nav links exist: **Home** (`/`) and **Add bottle** (`/bottles/new`). No dead links. No footer nav.
---

## Flow 00: Browse Bottle List (Planning Mode)

**Trigger:** Alex opens the app URL from a bookmark, browser address bar, or recent tab — typically at a wine shop or away from the cellar.
**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4
**Journey:** JRN-02.1

```
[User opens /?q= or /]
         │
         ▼
[Server renders list page]
         │
         ├── bottles exist ──▶ [List of bottle rows, newest first]
         │                              │
         │                     [Scan list for target bottle]
         │                              │
         │                     [Read name / qty / vintage inline]
         │                              │
         │                     [Decision made → user exits app]
         │
         └── table is empty ──▶ [Empty state: "No bottles yet" + Add bottle CTA]
                                          │
                                 [Tap "Add bottle" → /bottles/new]
```

**Steps:**
1. Browser navigates to `/` — server renders HTML immediately (no client waterfall).
2. If bottles exist: full list renders, newest first. Alex scans visually.
3. If empty: empty state renders with a prominent gold "Add bottle" button.
4. Alex reads quantity + vintage directly from the row — no tap-to-expand needed.
5. Alex exits the app (or taps a row to edit — see Flow 02).

**Exit points:** Off-app (decision made) | `/bottles/new` | `/bottles/[id]/edit`
---

## Flow 01: Search / Filter by Name (Planning Mode)

**Trigger:** Alex needs to find a specific wine in a large collection without scrolling.
**User Stories:** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5
**Journey:** JRN-02.2

```
[List page loads — search input visible at top]
         │
         ▼
[Alex types partial name, e.g. "gren"]
         │
         ▼
[URL updates to /?q=gren — page re-renders (server)]
         │
         ├── matches found ──▶ [Filtered list: only matching rows shown]
         │                              │
         │                     [Alex reads results → exits or edits a row]
         │
         └── no matches ──▶ [Search-empty state: "No bottles match 'gren'"]
                                       │
                               [Add bottle button still visible]
                                       │
                               [Alex clears input → full list restores]
```

**Steps:**
1. Search `<input>` is visible at the top of the list page on load (not hidden behind a button).
2. Alex types a fragment (e.g. "gren"). On change or submit, URL becomes `/?q=gren`.
3. Server re-renders: only bottles with `name ILIKE '%gren%'` appear.
4. If no results: search-empty message shows the search term ("No bottles match 'gren'"). "Add bottle" button remains visible.
5. Clearing input and submitting (or navigating to `/`) removes `?q=` and restores the full list.
6. Reloading while `?q=gren` is in the URL preserves the filtered state; input is pre-populated.

**Exit points:** Off-app | `/bottles/[id]/edit` | Clear search → full list
---

## Flow 02: Add a New Bottle (Cellar Mode)

**Trigger:** Alex taps "Add bottle" on the list page (or types `/bottles/new` directly).
**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4
**Journey:** JRN-01.1

```
[Tap "Add bottle" on list page]
         │
         ▼
[/bottles/new — empty form renders]
         │
         ▼
[Alex fills in name (required) ± vintage, varietal, qty, location]
         │
         ▼
[Tap Submit]
         │
         ├── name is blank ──▶ [Client validation: inline error "Name is required"]
         │                              │
         │                     [Form preserved — Alex corrects name]
         │                              │
         │                     [Re-taps Submit ────────────────────────┐]
         │                                                              │
         ├── API 422 ──────▶ [Server validation error: inline message] │
         │                     [Form preserved — Alex corrects data]    │
         │                     [Re-taps Submit ─────────────────────────┤]
         │                                                              │
         └── API 201 ◀────────────────────────────────────────────────┘
                  │
                  ▼
         [Redirect to / — new bottle appears at top of list]

[Tap Cancel (any time)] ──▶ [Navigate to / — no record created]
```

**Steps:**
1. Form renders with five labeled fields: Name, Vintage, Varietal, Quantity, Location.
2. Name field is focused automatically on page load (speeds one-handed entry).
3. Client-side validation fires before any network request: name must not be blank.
4. On blank name: inline error "Name is required" appears below the name field. No network call.
5. On valid submit: `POST /api/bottles`. Button is disabled on click (prevents double-tap).
6. On 201: redirect to `/`. New bottle appears at top of list (newest-first sort).
7. On 422: inline error message shown; all field values preserved.
8. Cancel link is visible at all times; it navigates to `/` with no side effects.

**Exit points:** `/` (success or cancel) | Stays on form (validation error)
---

## Flow 03: Edit a Bottle (Cellar Mode — most common: qty decrement)

**Trigger:** Alex taps any bottle row on the list page.
**User Stories:** US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6
**Journey:** JRN-01.2

```
[Tap bottle row on list page]
         │
         ▼
[GET /bottles/[id]/edit]
         │
         ├── bottle found ──▶ [Form pre-populated with all 5 fields]
         │                              │
         │                    [Alex changes quantity (or any field)]
         │                              │
         │                    [Tap Save]
         │                              │
         │                    ├── name blank ──▶ [Inline error "Name is required"]
         │                    │                  [Form preserved]
         │                    │
         │                    ├── API 422 ──▶ [Inline error; fields preserved]
         │                    │
         │                    └── API 200 ──▶ [Redirect to /]
         │                                    [Updated value visible in list]
         │
         └── bottle not found ──▶ [Not-found page: "Bottle not found" + link to /]

[Tap Cancel (any time)] ──▶ [Navigate to / — no changes saved]
```

**Steps:**
1. Tapping any bottle row navigates to `/bottles/[id]/edit`. Row tap target ≥ 44 px tall.
2. Server fetches the bottle record; all five fields pre-populated.
3. Alex changes the quantity field — it selects all on focus for instant one-keystroke replacement.
4. Client validates name is non-blank before submitting.
5. On valid submit: `PUT /api/bottles/[id]`. Save button disabled on click.
6. On 200: redirect to `/`. Updated quantity visible immediately.
7. On not-found (page load): "Bottle not found" message + "Back to My Cellar" link. No crash.
8. Cancel link returns to `/` without saving.

**Exit points:** `/` (success or cancel) | Not-found page → `/` | Stays on form (validation error)
---

## Flow 04: Delete a Bottle (Cellar Mode)

**Trigger:** Alex taps the "Delete" button on the edit page, intending to permanently remove a fully-consumed bottle.
**User Stories:** US-3.1, US-3.2
**Journey:** JRN-01.3

```
[On /bottles/[id]/edit — Alex taps "Delete" button]
         │
         ▼
[window.confirm("Delete this bottle?")]
         │
         ├── Cancel ──▶ [Dialog closes — user stays on edit page]
         │               [No API call made — record unchanged]
         │
         └── OK ────▶ [DELETE /api/bottles/[id]]
                               │
                               ├── 204 ──▶ [Redirect to /]
                               │           [Bottle no longer in list]
                               │
                               ├── 404 ──▶ [Inline error on edit page]
                               │           "This bottle could not be deleted."
                               │
                               └── 500 ──▶ [Inline error on edit page]
                                           "Something went wrong. Please try again."
```

**Steps:**
1. "Delete" button is visually separated from the Save button — placed below the form, styled as a destructive secondary action (red text, no background fill, or outlined in red).
2. On tap: browser-native `window.confirm("Delete this bottle?")` fires. No custom modal.
3. Cancel in dialog: no network call, no state change, user stays on edit page.
4. OK in dialog: `DELETE /api/bottles/[id]` fires. Delete button disables on click.
5. On 204: redirect to `/`. Bottle is absent from the list.
6. On 404/500: inline error rendered on edit page.

**Visual hierarchy of buttons (edit page, bottom of form):**
```
[ Save  ← Gold primary ]

[ Delete ← Red text, secondary style, visually separated by spacing ]

[ Cancel ← Plain text link ]
```

**Exit points:** `/` (delete confirmed) | Edit page (dialog cancelled or error)
---

## Screen 00: Bottle List Page (`/`)

**Purpose:** Primary daily-use screen. Shows entire wine collection; entry point for all CRUD flows.
**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4, US-4.1–4.5
**Journeys:** JRN-01.2 (Trigger/Locate), JRN-02.1 (Load & Orient/Locate), JRN-02.2 (Trigger/Review)

---

### Layout — Mobile (375 px)

```
┌─────────────────────────────────┐  ← viewport 375 px
│  My Cellar          [+ Add]     │  ← Nav bar: h=56px. Logo left, Add right.
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Search input: full-width, h=44px
│  │ 🔍 Search bottles...     │  │    placeholder text; pre-filled when ?q= present
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Bottle row (tappable, h≥44px)
│  │ Caymus Cabernet           │  │    name: 16px bold, #0A0A0A
│  │ 2019 · Cabernet Sauvignon │  │    vintage · varietal: 13px muted (#6B7280)
│  │ Qty: 3  · Rack A3         │  │    qty · location: 13px muted
│  └───────────────────────────┘  │    border-bottom: 1px #E5E7EB
│  ┌───────────────────────────┐  │
│  │ Barolo Riserva            │  │
│  │ 2017 · Nebbiolo           │  │
│  │ Qty: 6  · Bin 12          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Unnamed White             │  │
│  │ —  · —                    │  │  ← optional fields blank: show dash or empty
│  │ Qty: 1  · —               │  │
│  └───────────────────────────┘  │
│                                 │
│    (more rows scroll down)      │
└─────────────────────────────────┘
```

---

### Layout — Mobile: Empty State (no bottles)

```
┌─────────────────────────────────┐
│  My Cellar          [+ Add]     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Search input still visible
│  │ 🔍 Search bottles...     │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│                                 │
│        🍷                       │  ← decorative icon (optional)
│   No bottles yet.               │  ← 16px, #0A0A0A
│   Add your first bottle to      │  ← 14px, muted
│   start tracking your cellar.   │
│                                 │
│  ┌───────────────────────────┐  │
│  │   + Add your first bottle │  │  ← Gold CTA button #FBCA5C, h=48px
│  └───────────────────────────┘  │    full-width, rounded
│                                 │
└─────────────────────────────────┘
```

---

### Layout — Mobile: Search Empty State (`?q=rioja`, no matches)

```
┌─────────────────────────────────┐
│  My Cellar          [+ Add]     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🔍 rioja                 │  │  ← search term pre-filled
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│                                 │
│   No bottles match "rioja".     │  ← 15px, muted; distinct from "No bottles yet"
│                                 │
│  ┌───────────────────────────┐  │
│  │   + Add bottle            │  │  ← Gold CTA still accessible
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

### Desktop Variation (≥768 px)

```
┌──────────────────────────────────────────────────────┐  max-width: 640px, centred
│  My Cellar                          [+ Add bottle]   │  ← nav bar
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │  ← search input, full container width
│  │ 🔍  Search bottles...                          │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ Caymus Cabernet           2019  Qty: 3  Rack A3 │  │  ← row layout: name left, meta right
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Barolo Riserva            2017  Qty: 6  Bin 12  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### Information Hierarchy

| Priority | Content | Placement |
|---|---|---|
| Primary | Bottle name | Left-aligned, largest text (16px bold) |
| Primary | Quantity | Visible inline on every row — never hidden |
| Secondary | Vintage · Varietal | Second line, muted text (13px) |
| Secondary | Location | Second line alongside qty, muted |
| Tertiary | `created_at` | Never displayed — sort order only |
| Navigation | "Add bottle" button | Top-right nav + prominent in empty state |
| Filter | Search input | Top of content area, always visible |

---

### States

| State | Appearance | User Feedback |
|---|---|---|
| Default (list) | White rows, near-black text, gold nav link | N/A |
| Default (empty cellar) | Icon + message + gold CTA button | "No bottles yet." |
| Search active | Input pre-filled; filtered rows | URL shows `?q=<term>` |
| Search no-results | No rows; contextual message | "No bottles match '<term>'." |
| Loading (initial) | Server-rendered — no spinner on first load | N/A (SSR) |
| DB error | Error boundary: "Unable to load cellar. Please try again." | 500 error page |

---

### Interactive Elements

| Element | Type | Behavior |
|---|---|---|
| Nav "My Cellar" logo/wordmark | Link | Navigates to `/` |
| Nav "+ Add" / "+ Add bottle" | Link/Button | Navigates to `/bottles/new` |
| Search input | `<input type="search">` wrapped in `<form method="GET" action="/">` | On submit: appends `?q=<value>` to URL; on clear+submit: removes `?q=` |
| Bottle row | `<a href="/bottles/[id]/edit">` | Navigates to edit page for that bottle |

**Note:** Search uses a plain HTML form submit (GET), not real-time JS filtering, to ensure search state lives in the URL and works without JS. A JS enhancement can update URL on input change for faster feel.
---

## Screen 01: Add Bottle Page (`/bottles/new`)

**Purpose:** Form to record a new bottle. Name required, all other fields optional. Fast one-handed entry in cellar context.
**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4
**Journey:** JRN-01.1

---

### Layout — Mobile (375 px)

```
┌─────────────────────────────────┐
│  ← My Cellar       Add Bottle   │  ← Nav: back arrow/link left; page title centred or right
├─────────────────────────────────┤
│                                 │
│  Name *                         │  ← visible <label>, 14px #0A0A0A
│  ┌───────────────────────────┐  │
│  │                           │  │  ← <input type="text"> h=48px, autofocus
│  └───────────────────────────┘  │  border: 1px #E5E7EB; focus: 2px #FBCA5C outline
│                                 │
│  Vintage                        │  ← no asterisk — optional
│  ┌───────────────────────────┐  │
│  │                           │  │  ← <input type="number"> min=1800 max=2027
│  └───────────────────────────┘  │
│                                 │
│  Varietal                       │
│  ┌───────────────────────────┐  │
│  │                           │  │  ← <input type="text">
│  └───────────────────────────┘  │
│                                 │
│  Quantity                       │
│  ┌───────────────────────────┐  │
│  │  1                        │  │  ← <input type="number"> min=1, default 1
│  └───────────────────────────┘  │
│                                 │
│  Location                       │
│  ┌───────────────────────────┐  │
│  │                           │  │  ← <input type="text">
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Save Bottle         │  │  ← Primary submit: bg #FBCA5C, #0A0A0A text
│  └───────────────────────────┘  │    h=48px, full-width, rounded
│                                 │
│       Cancel                    │  ← Plain text link, centred, 14px muted
│                                 │    navigates to / — NO submit
└─────────────────────────────────┘
```

---

### Layout — Validation Error State

```
┌─────────────────────────────────┐
│  ← My Cellar       Add Bottle   │
├─────────────────────────────────┤
│                                 │
│  Name *                         │
│  ┌───────────────────────────┐  │
│  │                           │  │  ← border: 2px solid #D93025 (error red)
│  └───────────────────────────┘  │
│  ⚠ Name is required             │  ← 13px #D93025, below the field
│                                 │
│  Vintage                        │
│  ┌───────────────────────────┐  │  ← other fields retain entered values
│  │ 2019                      │  │
│  └───────────────────────────┘  │
│                                 │
│  …(remaining fields intact)…   │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Save Bottle         │  │  ← re-enabled after error
│  └───────────────────────────┘  │
│                                 │
│       Cancel                    │
└─────────────────────────────────┘
```

---

### Layout — Server Error State (API 422 / 500)

```
┌─────────────────────────────────┐
│  ← My Cellar       Add Bottle   │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ ⚠ Something went wrong.  │  │  ← full-width error banner at top of form
│  │   Please try again.       │  │    bg: light red tint, border: #D93025
│  └───────────────────────────┘  │
│                                 │
│  Name *                         │
│  ┌───────────────────────────┐  │  ← all field values retained
│  │ Caymus Cabernet           │  │
│  └───────────────────────────┘  │
│  …(remaining fields intact)…   │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Save Bottle         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

### Desktop Variation (≥768 px)

```
┌──────────────────────────────────────────┐  max-width: 480px, centred
│  ← My Cellar              Add Bottle     │
├──────────────────────────────────────────┤
│  Name *                                  │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Vintage          Quantity               │  ← Two short fields on one row at ≥480px
│  ┌─────────────┐  ┌─────────────────┐   │    (optional responsive enhancement)
│  │             │  │  1              │   │
│  └─────────────┘  └─────────────────┘   │
│                                          │
│  Varietal                                │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Location                                │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │          Save Bottle             │    │
│  └──────────────────────────────────┘    │
│              Cancel                      │
└──────────────────────────────────────────┘
```

---

### Information Hierarchy

| Priority | Content | Placement |
|---|---|---|
| Primary | Name field (required) | Top of form, autofocused |
| Primary | Save button | Bottom of form, gold, full-width |
| Secondary | Vintage, Varietal, Quantity, Location | Below Name, in logical order |
| Tertiary | Cancel link | Below Save button, subdued |
| Error | Inline error below failing field | Directly below the input |
| Error | Server error banner | Top of form content area |

---

### States

| State | Appearance | User Feedback |
|---|---|---|
| Default | Empty form, Name autofocused | N/A |
| Submitting | Save button disabled, slightly dimmed | Prevents double-tap |
| Name validation error | Name field red border + "Name is required" below | Inline, no field cleared |
| Server error | Error banner at top; all fields retained | "Something went wrong." |
| Success | Redirect to `/` | New bottle appears in list |

---

### Interactive Elements

| Element | Type | Behavior |
|---|---|---|
| Name input | `<input type="text" required autofocus>` | Focused on page load |
| Vintage input | `<input type="number" min="1800" max="2027">` | Optional; numeric keyboard on mobile |
| Varietal input | `<input type="text">` | Optional |
| Quantity input | `<input type="number" min="1" value="1">` | Default 1; ≥1 on add |
| Location input | `<input type="text">` | Optional |
| Save Bottle button | `<button type="submit">` | Triggers client validation then POST |
| Cancel link | `<a href="/">` | Navigates to list; no form submit |
---

## Screen 02: Edit Bottle Page (`/bottles/[id]/edit`)

**Purpose:** Pre-populated form to modify an existing bottle. Most common action: decrement quantity. Also hosts the Delete action.
**User Stories:** US-2.1–2.6, US-3.1, US-3.2
**Journey:** JRN-01.2 (Edit/Submit), JRN-01.3 (Assess/Initiate Delete)

---

### Layout — Mobile (375 px): Populated Form

```
┌─────────────────────────────────┐
│  ← My Cellar        Edit Bottle │  ← Nav: back link left; page title right/centred
├─────────────────────────────────┤
│                                 │
│  Name *                         │
│  ┌───────────────────────────┐  │
│  │ Caymus Cabernet           │  │  ← pre-filled from DB; all 5 fields shown
│  └───────────────────────────┘  │
│                                 │
│  Vintage                        │
│  ┌───────────────────────────┐  │
│  │ 2019                      │  │
│  └───────────────────────────┘  │
│                                 │
│  Varietal                       │
│  ┌───────────────────────────┐  │
│  │ Cabernet Sauvignon        │  │
│  └───────────────────────────┘  │
│                                 │
│  Quantity                       │
│  ┌───────────────────────────┐  │
│  │ 3                         │  │  ← selects-all on tap: instant replacement
│  └───────────────────────────┘  │
│                                 │
│  Location                       │
│  ┌───────────────────────────┐  │
│  │ Rack A3                   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Save Changes        │  │  ← Primary: bg #FBCA5C, h=48px, full-width
│  └───────────────────────────┘  │
│                                 │
│  ─────────────────────────────  │  ← visual separator (8px gap + thin rule)
│                                 │
│  ┌───────────────────────────┐  │
│  │       Delete Bottle       │  │  ← Destructive secondary: color #B91C1C,
│  └───────────────────────────┘  │    border: 1px solid #B91C1C, bg transparent
│                                 │    h=44px, full-width
│       Cancel                    │  ← plain text link, centred, below delete
└─────────────────────────────────┘
```

**Button visual distance:** Save and Delete are separated by a ≥24px gap and a thin divider line to prevent accidental taps. Cancel is below Delete, not between them.

---

### Layout — Quantity Focus (most common action)

```
│  Quantity                       │
│  ┌───────────────────────────┐  │  ← tap this field
│  │ ▌3                        │  │  ← value selected on focus (select-all)
│  └───────────────────────────┘  │  Alex types "2" → replaces "3" instantly
```

Quantity input uses `onFocus: select all` behavior so the user types the new value in one motion (no backspace needed). On mobile this shows the numeric keypad.

---

### Layout — Not-Found State (`/bottles/99999/edit`)

```
┌─────────────────────────────────┐
│  ← My Cellar                    │
├─────────────────────────────────┤
│                                 │
│   🚫                            │  ← optional icon
│   Bottle not found.             │  ← 16px bold
│   This bottle may have been     │  ← 14px muted
│   removed or the link is        │
│   incorrect.                    │
│                                 │
│  ┌───────────────────────────┐  │
│  │   ← Back to My Cellar    │  │  ← Link to /; styled as secondary button
│  └───────────────────────────┘  │    or plain underlined text link
│                                 │
└─────────────────────────────────┘
```

Applies to: non-existent `id`, non-integer `id` (e.g. `/bottles/abc/edit`). No crash, no blank page.

---

### Layout — Validation Error State

```
│  Name *                         │
│  ┌───────────────────────────┐  │
│  │                           │  │  ← border 2px #D93025 (name was cleared)
│  └───────────────────────────┘  │
│  ⚠ Name is required             │  ← 13px #D93025
│                                 │
│  …other fields: values intact…  │
│                                 │
│  ┌───────────────────────────┐  │
│  │       Save Changes        │  │  ← re-enabled; record in DB is unchanged
│  └───────────────────────────┘  │
```

---

### Layout — Delete Error State (inline, after API error)

```
│  ┌───────────────────────────┐  │
│  │ ⚠ This bottle could not  │  │  ← error banner at top of form
│  │   be deleted. It may have │  │    bg light red, border #D93025
│  │   already been removed.   │  │
│  └───────────────────────────┘  │
│                                 │
│  …form content intact…          │
```

---

### Desktop Variation (≥768 px)

Same structure as Add Bottle desktop layout — max-width 480px, centred. Vintage + Quantity on one row.

---

### Information Hierarchy

| Priority | Content | Placement |
|---|---|---|
| Primary | Quantity field | Fourth field; visually prominent for quick edit |
| Primary | Name field | Top of form (required) |
| Primary | Save Changes button | Below form, gold, full-width |
| Secondary | Vintage, Varietal, Location | Remaining fields, standard order |
| Destructive | Delete Bottle button | Below separator, red outline, clear distance from Save |
| Tertiary | Cancel link | Below Delete, least visible |
| Error | Inline error per field | Below field |
| Error | Delete/server error banner | Top of form content area |

---

### States

| State | Appearance | User Feedback |
|---|---|---|
| Default (loaded) | All 5 fields pre-populated | N/A |
| Quantity focused | Field value selected (all) | Numeric keyboard, easy replacement |
| Submitting (Save) | Save button disabled | Prevents double-tap |
| Save validation error | Red field border + inline message | "Name is required" |
| Save server error | Error banner at top; fields intact | "Something went wrong." |
| Delete confirming | `window.confirm` dialog open | Native browser dialog |
| Delete submitting | Delete button disabled | N/A |
| Delete error | Inline error banner | "This bottle could not be deleted." |
| Not found | Not-found message + back link | No form rendered |
| Success (save) | Redirect to `/` | Updated value visible in list |
| Success (delete) | Redirect to `/` | Bottle absent from list |

---

### Interactive Elements

| Element | Type | Behavior |
|---|---|---|
| All 5 inputs | `<input>` with `<label>` | Pre-filled; editable |
| Quantity input | `<input type="number" min="0">` | `selectAll` on focus; min=0 (edit allows 0) |
| Save Changes button | `<button type="submit">` | Client validates name → PUT request |
| Delete Bottle button | `<button type="button">` | `window.confirm` → DELETE request |
| Cancel link | `<a href="/">` | Navigate to list; no submit |
| "Back to My Cellar" (not-found) | `<a href="/">` | Navigate to list |
---

## Interaction Patterns

### Pattern A: Gold Primary Button

**When to use:** Exactly one primary action per screen. Used for "Save Bottle", "Save Changes", and the "Add bottle" CTA in empty state.

**Specification:**
- Background: `#FBCA5C`
- Text: `#0A0A0A` (near-black for contrast)
- Height: 48px (≥44px minimum, 48px preferred)
- Width: 100% of container (full-width on mobile)
- Border-radius: 6–8px
- Font-weight: 600
- Hover: background `#E8B540` (darkened gold)
- Active: `#D4A030` + slight scale-down `scale(0.98)`
- Focus: 2px solid `#FBCA5C` outline offset 2px
- Disabled (submitting): `opacity: 0.6`, `cursor: not-allowed`

**Gold must not:** cover >10% of the viewport, be used as a page/card background.

---

### Pattern B: Destructive Button (Delete)

**When to use:** "Delete Bottle" on the edit page only. Never used as a primary CTA.

**Specification:**
- Background: transparent
- Border: 1px solid `#B91C1C`
- Text: `#B91C1C`
- Height: 44px
- Width: 100% of container
- Hover: bg `#FEF2F2` (very light red tint)
- Active: bg `#FEE2E2`
- Focus: 2px `#B91C1C` outline offset 2px
- Disabled: `opacity: 0.5`

**Visual separation:** ≥24px gap + 1px `#E5E7EB` horizontal rule between Save and Delete.

---

### Pattern C: Text Link (Cancel)

**When to use:** Cancel action on Add and Edit pages.

**Specification:**
- Color: `#6B7280` (muted)
- Text-decoration: underline on hover
- Height: ≥44px touch area (use `padding: 8px 16px` minimum)
- Font-size: 14px
- Positioned centred below the destructive button (Edit page) or below Save (Add page)

---

### Pattern D: Bottle Row (List Page)

**When to use:** Every bottle in the collection list.

**Specification:**
- Element: `<a href="/bottles/[id]/edit">` block-level
- Min-height: 56px (taller than 44px minimum to accommodate two lines)
- Padding: 12px 16px
- Background: `#FFFFFF`
- Border-bottom: 1px solid `#E5E7EB`
- Hover/focus: background `#FAFAFA`; left border accent `3px solid #FBCA5C`
- Active: background `#FFF8E7`
- Cursor: pointer

**Content layout (mobile — stacked):**
```
[Name — 16px bold #0A0A0A                      ]
[Vintage · Varietal — 13px #6B7280 · Qty · Loc ]
```

**Content layout (desktop ≥640px — inline):**
```
[Name — bold left                 Year Qty  Location]
```

---

### Pattern E: Form Input

**When to use:** All `<input>` fields on Add and Edit pages.

**Specification:**
- Height: 48px
- Width: 100%
- Background: `#FFFFFF`
- Border: 1px solid `#E5E7EB`
- Border-radius: 6px
- Padding: 0 12px
- Font-size: 16px (prevents iOS auto-zoom — never < 16px on mobile)
- Focus: border 2px solid `#FBCA5C`; no outline replaced — meets WCAG 2.4.11
- Error state: border 2px solid `#D93025`
- Color: `#0A0A0A`

---

### Pattern F: Inline Error Message

**When to use:** Below a specific input that failed validation.

**Specification:**
- Font-size: 13px
- Color: `#D93025`
- Prefix: "⚠ " (warning sign)
- Margin-top: 4px, below the input
- Role: `alert` (or `aria-live="polite"`) so screen readers announce it

**Error messages:**
- Name blank: "Name is required"
- Vintage invalid: "Vintage must be a valid year"
- Vintage out of range: "Vintage must be between 1800 and 2027"
- Quantity < 1 (add): "Quantity must be at least 1"
- Quantity < 0 (edit): "Quantity cannot be negative"

---

### Pattern G: Error Banner (Server/API Error)

**When to use:** Top of form when a server-side error (422, 500) occurs after submit.

**Specification:**
- Full-width banner, above first form field
- Background: `#FFF1F0`
- Border-left: 4px solid `#D93025`
- Padding: 12px 16px
- Font-size: 14px, color `#991B1B`
- Role: `alert`
- Message: "Something went wrong. Please try again." (500) or specific field error (422)

---

### Pattern H: Search Input

**When to use:** Top of the list page, for `?q=` filtering.

**Specification:**
- Element: `<input type="search">` inside `<form method="GET" action="/">`
- Height: 44px
- Width: 100%
- Background: `#F9FAFB` (slightly off-white to distinguish from bottle cards)
- Border: 1px solid `#E5E7EB`
- Border-radius: 8px
- Padding-left: 36px (for search icon)
- Search icon: 🔍 or SVG icon, 16px, `#6B7280`, absolute positioned inside input
- Font-size: 16px (prevent iOS zoom)
- Pre-filled with current `q` value on page load
- Submit: Enter key or a "Search" button (optional; search icon can be tappable)
- Clear: clicking ✕ (built-in on `type="search"`) clears input; submitting empty form restores full list

---

### Pattern I: Confirm Dialog (Delete)

**When to use:** Delete Bottle button on Edit page only.

**Specification:**
- `window.confirm("Delete this bottle?")`
- Native browser dialog — no custom modal
- OK → proceed with DELETE call
- Cancel → no action, stay on edit page
- Delete button re-enabled if Cancel is chosen (or stay disabled only while request is in flight)

---

### Pattern J: Navigation Bar

**When to use:** All three pages.

**Specification:**
- Height: 56px
- Background: `#FFFFFF`
- Border-bottom: 1px solid `#E5E7EB`
- Box-shadow: subtle (0 1px 3px rgba(0,0,0,0.07))
- Left: "My Cellar" wordmark — links to `/` — 18px bold `#0A0A0A`
- Right: "+ Add" (mobile) / "+ Add bottle" (≥480px) — links to `/bottles/new`
  - Color: `#FBCA5C` background pill, `#0A0A0A` text, 14px, padding 8px 14px, radius 6px
  - Min-height: 36px (inside 56px bar — outer bar provides adequate touch area)
- No other navigation links — dead links are forbidden

**On form pages (Add, Edit):** The nav may show "← My Cellar" (back link) on the left instead of the wordmark, since the wordmark is in the page title/heading. Implementation choice — either is acceptable.
---

## Responsive Considerations

CellarLite uses a **mobile-first** CSS strategy: base styles target 375 px; breakpoints progressively enhance for larger viewports. No CSS framework. Plain CSS / CSS Modules.

---

### Breakpoint Strategy

| Breakpoint | Label | Min-width | Notes |
|---|---|---|---|
| Base | Mobile (primary) | 0px (375px target) | Single-column, full-width elements |
| Small+ | Phablet | 480px | Vintage+Quantity on one row; "Add bottle" full label |
| Medium | Tablet | 768px | Content centred; max-width applied |
| Large | Desktop | 1024px | Same layout as tablet; text slightly larger |
| XL | Wide | 1440px | Max-width clamps; centred |

---

### Global Layout Container

```css
/* Mobile-first container */
.container {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

/* Cap content width on larger screens */
@media (min-width: 640px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 24px;
  }
}
```

This prevents content from stretching edge-to-edge at 1440px (US-7.2) while remaining full-width at 375px.

---

### `/` — Bottle List Page

**375 px (base):**
- Nav: wordmark left + add button right, within 56px bar
- Search input: full-width, 44px tall
- Bottle rows: stacked two-line layout (name on line 1; vintage · varietal · qty · location on line 2)
- Row height ≥ 56px; ensures ≥44px tap target (US-0.3, US-7.1)
- No horizontal scroll: `overflow-x: hidden` on html/body; no fixed-width elements

**≥ 640px:**
- Container max-width 600px, centred
- Row layout option: name left-aligned (flex); vintage/qty/location right-aligned in a row
- Empty state: icon + text centred, CTA button max-width 320px centred

**≥ 1024px:**
- Font-size bumped +1–2px for readability
- Search input max-width 480px

---

### `/bottles/new` — Add Bottle Page

**375 px (base):**
- All fields stacked full-width
- Labels above inputs (never beside — too narrow)
- Input height 48px; font-size 16px (critical: prevents iOS auto-zoom)
- Save button full-width, 48px
- Cancel below Save, centred

**≥ 480px:**
- Vintage + Quantity placed side-by-side in a 2-column row (`display: grid; grid-template-columns: 1fr 1fr`)
- All other fields remain full-width

**≥ 640px:**
- Container max-width 480px centred
- Form reads more comfortably; labels still above inputs

---

### `/bottles/[id]/edit` — Edit Bottle Page

Identical responsive behaviour to Add Bottle Page.

**Additional note:** Delete button is always full-width and always below the Save/separator, regardless of viewport. It must never be placed beside Save (risk of accidental tap).

---

### Typography Scale

| Element | Mobile | ≥640px |
|---|---|---|
| Page heading ("My Cellar") | 20px bold | 22px bold |
| Bottle name (row) | 16px bold | 16px bold |
| Bottle metadata (row) | 13px | 14px |
| Form label | 14px medium | 14px medium |
| Form input | 16px (iOS zoom prevention) | 16px |
| Error message | 13px | 13px |
| Cancel link | 14px | 14px |
| Nav wordmark | 18px bold | 18px bold |

---

### Fixed-Width Pitfalls to Avoid (US-7.1, US-7.2)

- **Never** set `width: <px>` on inputs, buttons, or cards without `max-width: 100%`
- **Never** use `min-width` wider than `100vw` on any element
- All images (if any added later) must have `max-width: 100%`
- Nav bar items must use `flex: 0 0 auto` and `overflow: hidden` if text is long

---

### Viewport Meta Tag (required)

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

This is set in `app/layout.tsx` root layout. Without it, the 375px layout will not render correctly on mobile devices.

---

### Touch & Pointer

All interactive elements meet ≥44×44 px tap target (US-7.1, WCAG 2.5.5):

| Element | Min touch area |
|---|---|
| Bottle row | 56px tall × full width |
| Nav links | 44px tall × full width of text + padding |
| Search input | 44px tall × full width |
| Form inputs | 48px tall × full width |
| Save button | 48px tall × full width |
| Delete button | 44px tall × full width |
| Cancel link | 44px touch area via padding |
---

## Accessibility Notes

CellarLite targets WCAG 2.1 Level AA. The primary accessibility requirements derive from US-7.1 (tap targets), US-7.4 (visible labels), and the form interaction stories.

---

### Color Contrast

| Foreground | Background | Ratio | Use | Passes AA? |
|---|---|---|---|---|
| `#0A0A0A` | `#FFFFFF` | ~19.8:1 | Body text on white surface | ✅ AAA |
| `#0A0A0A` | `#FBCA5C` | ~7.1:1 | Button text on gold | ✅ AAA |
| `#6B7280` | `#FFFFFF` | ~4.6:1 | Muted metadata text | ✅ AA |
| `#D93025` | `#FFFFFF` | ~4.7:1 | Error text on white | ✅ AA |
| `#B91C1C` | `#FFFFFF` | ~5.9:1 | Delete button text | ✅ AA |
| `#B91C1C` | `#FEF2F2` | ~5.6:1 | Delete button hover | ✅ AA |
| `#991B1B` | `#FFF1F0` | ~5.4:1 | Error banner text | ✅ AA |

**Note:** Gold `#FBCA5C` on white `#FFFFFF` yields ~2.3:1 — fails AA for text. Gold must **only** be used as a button background (not text color on white, not decorative text). Gold focus rings use a 3px+ offset solid border (non-text, exempt from contrast ratio).

---

### Keyboard Navigation

**List page (`/`):**
- Tab: Nav wordmark → "+ Add" link → Search input → Bottle rows (each row is a focusable `<a>`)
- Enter on search input (form): submits search
- Enter on bottle row: navigates to edit page

**Add / Edit page:**
- Tab: Nav back link → Name → Vintage → Varietal → Quantity → Location → Save → Delete (edit only) → Cancel
- Enter: submits form (from any input)
- Escape: no built-in handler — Cancel link handles intentional navigation
- Tab on Delete (edit page): should focus Cancel next, not loop back to Save

**Not-found page:**
- Tab: Nav link → "Back to My Cellar" link
- Single action; trivial keyboard path

---

### Form Labels (US-7.4)

Every `<input>` must have an associated `<label>` that is:
- Rendered visibly in the DOM (not `display: none` or `visibility: hidden` or `sr-only`)
- Connected via `htmlFor` → `id` pairing OR wrapping the input

```tsx
// ✅ Correct
<label htmlFor="name">Name *</label>
<input id="name" type="text" name="name" />

// ✅ Also correct (wrapping)
<label>
  Vintage
  <input type="number" name="vintage" />
</label>

// ❌ Incorrect (placeholder-only — fails US-7.4)
<input type="text" placeholder="Name" />
```

Required indicator: use `*` after the label text and a legend/note "* Required" at the top of the form. Do not rely on color alone to indicate required status.

---

### ARIA & Semantic HTML

| Element | Required attribute / element |
|---|---|
| Inline error messages | `role="alert"` or `aria-live="polite"` so assistive tech announces new errors |
| Error banner (server) | `role="alert"` |
| Search input | `aria-label="Search bottles"` (if no visible label) or `<label>` |
| Bottle rows | Descriptive link text: `aria-label="Edit Caymus Cabernet, quantity 3"` — avoids generic "row" links |
| Delete button | `aria-label="Delete this bottle"` (button text is sufficient if visible) |
| Nav "My Cellar" | `aria-current="page"` when on `/` |
| Not-found heading | `<h1>Bottle not found</h1>` — semantic, not just styled text |
| Required fields | `aria-required="true"` on required inputs (in addition to HTML `required`) |
| Disabled button (submitting) | `aria-disabled="true"` and `disabled` attribute |

---

### Screen Reader Announcements

| Trigger | Expected announcement |
|---|---|
| Page loads (list) | "My Cellar, X bottles" (page title + count) |
| Search results update | "3 bottles match 'rioja'" — via `aria-live` region wrapping the result count/list |
| Inline error appears | "Name is required" — via `role="alert"` |
| Server error banner | "Something went wrong. Please try again." — via `role="alert"` |
| Not-found page | "Bottle not found" — `<h1>` announced on page load |

---

### Focus Management

| Action | Focus should move to |
|---|---|
| Page load: Add / Edit form | Name `<input>` (autofocus) |
| Validation error on submit | First invalid field (use `.focus()` in JS) |
| Server error banner appears | Error banner element (programmatic `.focus()` on `role="alert"` container) |
| Confirm dialog (delete) | Returns to Delete button if Cancel chosen |

---

### Motion & Reduced Motion

CellarLite's MVP has no animations beyond standard browser transitions. If subtle hover/active transitions are added (scale, background-color):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

---

### iframe Compatibility (US-7.5)

The app renders inside a Pivota K8s sandbox iframe. The following response headers must **not** be emitted:

- `X-Frame-Options: DENY` — blocks all iframe embedding
- `Content-Security-Policy: frame-ancestors 'none'` — blocks all iframe embedding

`X-Frame-Options: SAMEORIGIN` is acceptable (or header omitted entirely).

Configured in `next.config.mjs`:

```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ],
  }];
}
```

This is not an accessibility concern per se, but is a UX platform constraint listed alongside A11y per project requirements.

---

### Input `font-size` — iOS Zoom Prevention

All `<input>` elements must have `font-size: 16px` (minimum). iOS Safari auto-zooms the viewport when an input with `font-size < 16px` is focused. This would break the one-handed cellar use case (US-7.1).

```css
input, textarea, select {
  font-size: 16px; /* Prevents iOS auto-zoom */
}
```
