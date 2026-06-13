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
