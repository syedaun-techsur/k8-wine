---

## F07: Brand & Mobile-First UI

**Priority:** P1 — High (core UX and platform requirement)
**Applies to:** All pages (`/`, `/bottles/new`, `/bottles/[id]/edit`)
**PRD Reference:** F7

---

**Description:** All pages follow the TechSur brand palette and are designed mobile-first. The accent colour (Gold `#FBCA5C`) is used sparingly on interactive elements against near-black text and white surfaces. Every interactive element meets minimum tap-target sizing. No CSS framework is used. Critically, no `X-Frame-Options: DENY` or `frame-ancestors 'none'` headers are emitted, ensuring the app renders correctly inside the Pivota K8s sandbox iframe preview.

---

**Terminology:**

- **Mobile-first:** CSS is written for the smallest viewport (375 px) first; wider breakpoints are progressive enhancements via `@media (min-width: ...)`.
- **Tap target:** The touchable/clickable area of an interactive element. Must be ≥ 44 × 44 px (iOS HIG / WCAG guideline).
- **Gold accent:** `#FBCA5C` — primary brand colour used on buttons, active/focus states. Must not cover more than ~10% of any view.
- **Near-black:** `#0A0A0A` — primary text colour.
- **Surface white:** `#FFFFFF` — card and background surfaces.
- **iframe compatibility:** The app must load without being blocked by browser iframe restrictions; no `X-Frame-Options` or restrictive CSP `frame-ancestors` headers.

---

**Sub-features:**

- Brand colour palette applied globally
- Mobile-first responsive layout (375 px → 1440 px)
- Minimum 44 × 44 px tap targets on all interactive elements
- Visible `<label>` for every form input
- Plain CSS / CSS Modules (no CSS framework)
- Header override in `next.config.mjs` to remove iframe-blocking headers
- No `X-Frame-Options: DENY` header
- No `Content-Security-Policy: frame-ancestors 'none'`

---

**Process (implementation requirements):**

1. **Global CSS:** Define CSS custom properties (variables) for the brand palette:
   - `--color-accent: #FBCA5C`
   - `--color-text: #0A0A0A`
   - `--color-surface: #FFFFFF`
   - `--color-accent-hover`: a darkened version of gold for hover states
2. **Layout:** Root layout (`app/layout.tsx`) wraps all pages in a max-width container (e.g. `max-width: 480px; margin: 0 auto`) to keep mobile layout centred on larger screens.
3. **Buttons:** Primary action buttons (Submit, "Add bottle") use `background: var(--color-accent)`, `color: var(--color-text)`. Minimum size `44px × 44px` enforced via `min-height` and `padding`.
4. **Form inputs:** All `<input>` and `<select>` elements have an associated `<label>` rendered visibly above or beside the input (not placeholder-only labels).
5. **List rows/cards:** White surface, near-black text, subtle border or shadow. Entire row is clickable (`<a>` wrapping card or `cursor: pointer`).
6. **No horizontal scroll:** All content at 375 px viewport fits within the viewport. Overflow hidden where appropriate; no fixed-width elements wider than 100 vw.
7. **Header config** — `next.config.mjs` must include a `headers()` export that explicitly removes or overrides any default iframe-blocking header:

```js
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Do NOT set frame-ancestors 'none' in CSP
        ],
      },
    ];
  },
};
export default nextConfig;
```

> **Note:** `X-Frame-Options: SAMEORIGIN` (not DENY) is acceptable. Omitting the header entirely is also acceptable. The constraint is that `DENY` and `frame-ancestors 'none'` must not be emitted.

---

**Inputs:** N/A — this feature defines UI styling constraints, not data inputs.

---

**Outputs:**

- All pages render correctly at 375 px width (no horizontal scroll, no overlapping elements).
- All pages render at 1440 px width (centred, readable, not stretched).
- Primary buttons use Gold accent.
- All form fields have visible labels.
- No iframe-blocking response headers on any page or API route.

---

**Validation Rules:**

- Gold accent (`#FBCA5C`) used for: primary buttons, active/focus outlines, key links/icons only. Must not be used as full-page or card background.
- Every `<input>`, `<textarea>`, `<select>` has a corresponding `<label htmlFor="...">` that is visible (not `sr-only` unless an icon-only control).
- All buttons and links have `min-height: 44px` and `min-width: 44px` (or sufficient padding to meet the 44 × 44 px threshold).
- No `@import` of external CSS frameworks (Bootstrap, Tailwind CDN, etc.).
- `next.config.mjs` must be `.mjs` (ESM) — never `.ts` or `.js` if TypeScript syntax is used.

---

**Error States:**

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| `X-Frame-Options: DENY` emitted | App blocked in iframe preview | Explicit header override in `next.config.mjs` (see Process step 7) |
| `frame-ancestors 'none'` in CSP | App blocked in iframe preview | Never set this CSP directive in any middleware or headers config |
| Viewport overflow at 375 px | Horizontal scroll on mobile | Automated visual test or manual check at 375 px before deploy |
| Tap target < 44 px | Inaccessible on mobile | CSS `min-height`/`min-width` enforced on all interactive elements |

---

**API Surface (this feature):** None — styling only.

**Schema Surface (this feature):** None.

---
