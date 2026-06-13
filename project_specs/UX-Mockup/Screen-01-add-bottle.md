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
