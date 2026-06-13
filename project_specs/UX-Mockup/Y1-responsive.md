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
