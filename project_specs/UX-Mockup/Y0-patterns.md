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
