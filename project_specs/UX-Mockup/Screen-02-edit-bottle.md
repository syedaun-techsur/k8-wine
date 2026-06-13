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
