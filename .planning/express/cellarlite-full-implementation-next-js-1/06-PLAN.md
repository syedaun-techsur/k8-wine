---
phase: cellarlite-full-implementation-next-js-1
plan: 06
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - package.json
  - next.config.mjs
  - app/layout.tsx
  - styles/globals.css
autonomous: true

features:
  implements: ["F7"]
  depends_on: ["F6"]
  enables: ["F0", "F1", "F2", "F3", "F4"]

must_haves:
  truths:
    - "app/layout.tsx renders the root HTML shell with viewport meta, global CSS import, nav bar (My Cellar + Add button), and a centred container wrapping {children}"
    - "styles/globals.css defines all brand CSS custom properties: --color-accent #FBCA5C, --color-text #0A0A0A, --color-surface #FFFFFF, --color-accent-hover #E8B540, --color-error #D93025, --color-muted #6B7280, --color-border #E5E7EB, --color-destructive #B91C1C"
    - "styles/globals.css defines mobile-first base styles: inputs at 16px font-size (iOS zoom prevention), min-height 44px tap targets, gold primary button, destructive secondary button, nav bar styles"
    - "next.config.mjs is .mjs (ESM), exports X-Frame-Options: SAMEORIGIN (never DENY), does NOT include frame-blocking CSP"
    - "package.json scripts are exactly: migrate=node scripts/migrate.mjs, dev=npm run migrate && next dev -p 3000, start=npm run migrate && next start -p 3000, build=next build"
    - "Nav bar has exactly two links: My Cellar wordmark → /, Add button → /bottles/new. No other nav links."
  artifacts:
    - path: "app/layout.tsx"
      provides: "Root layout — HTML shell, nav, container, globals import"
      exports: ["default RootLayout"]
    - path: "styles/globals.css"
      provides: "Brand tokens, mobile-first base styles, component patterns"
      contains: "--color-accent"
    - path: "next.config.mjs"
      provides: "iframe-safe headers, ESM config"
      contains: "SAMEORIGIN"
    - path: "package.json"
      provides: "npm scripts"
      contains: "npm run migrate && next"
  key_links:
    - from: "app/layout.tsx"
      to: "styles/globals.css"
      via: "import '../styles/globals.css'"
      pattern: "import.*globals.css"
    - from: "app/layout.tsx"
      to: "next/font or viewport meta"
      via: "<meta name='viewport' .../>"
      pattern: "viewport"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "next.config.mjs"
      exports: ["headers() — X-Frame-Options: SAMEORIGIN"]
      verify: "grep -n 'SAMEORIGIN' next.config.mjs && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "package.json (scripts)"
      exports: ["migrate", "dev", "start", "build"]
      verify: "node -e \"const p=require('./package.json');console.log(p.scripts.migrate,p.scripts.dev)\" | grep -q 'migrate' && echo CONTRACT_OK"
  provides:
    - artifact: "app/layout.tsx"
      exports: ["default RootLayout"]
      shape: |
        export default function RootLayout({ children }: { children: React.ReactNode })
        Renders: <html><body><nav>My Cellar | + Add</nav><main>{children}</main></body></html>
        Imports: '../styles/globals.css'
        Metadata: title "CellarLite", viewport width=device-width initial-scale=1
      verify: "grep -n 'export default function RootLayout' app/layout.tsx && echo CONTRACT_OK"
    - artifact: "styles/globals.css"
      exports: ["--color-accent", "--color-text", "--color-surface", ".btn-primary", ".btn-destructive", ".form-input", ".nav", ".container"]
      shape: |
        :root { --color-accent: #FBCA5C; --color-text: #0A0A0A; --color-surface: #FFFFFF; ... }
        .btn-primary { background: var(--color-accent); color: var(--color-text); min-height: 48px; ... }
        .btn-destructive { background: transparent; border: 1px solid #B91C1C; color: #B91C1C; ... }
        .form-input { font-size: 16px; height: 48px; border: 1px solid var(--color-border); ... }
        .nav { height: 56px; background: #FFFFFF; border-bottom: 1px solid var(--color-border); }
        .container { width: 100%; padding: 0 16px; }
      verify: "grep -n 'color-accent' styles/globals.css && grep -n 'btn-primary' styles/globals.css && echo CONTRACT_OK"
---

<objective>
Implement the brand identity layer, root layout, global CSS, and confirm project configuration files for Wave 3 frontend pages to consume.

Purpose: Every Wave 3 page (list, add, edit) shares the same nav bar, brand CSS variables, and layout container. This plan establishes those shared foundations — the design system tokens and reusable CSS classes — so that Wave 3B (07-PLAN, 08-PLAN) can import and use them without defining styles inline.

Output:
- `app/layout.tsx` — root HTML shell with nav bar (My Cellar ↔ + Add), metadata (viewport, title), and globals CSS import
- `styles/globals.css` — all brand CSS custom properties, mobile-first base reset, button patterns (gold primary, destructive red), form input pattern, nav bar styles, container, error states
- `next.config.mjs` — confirmed iframe-safe (SAMEORIGIN) ESM config (carries over from wave 1 plan 01, updated here only if missing iframe-safe content)
- `package.json` — confirmed correct npm scripts (migrate, dev, start, build)
</objective>

<feature_dependencies>
Implements: F7: Brand & Mobile-First UI — CSS tokens (F07-REQ-01), mobile-first layout (F07-REQ-02, F07-REQ-03), primary button pattern (F07-REQ-04), form label support (F07-REQ-05), no-horizontal-scroll at 375px (F07-REQ-06), iframe-safe headers (F07-REQ-07), no CSS framework (F07-REQ-08), .mjs config (F07-REQ-09)
Depends on: F6: Database Auto-Migration (package.json, next.config.mjs established in wave 1)
Enables: F0: Bottle List Page (uses nav + container + brand), F1: Add Bottle Page (uses form-input, btn-primary, btn-destructive), F2: Edit Bottle Page (same), F3: Delete Bottle (btn-destructive), F4: Search/Filter (search input pattern)
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/express/cellarlite-full-implementation-next-js-1/01-PLAN.md
@.planning/express/cellarlite-full-implementation-next-js-1/02-PLAN.md
@.planning/express/cellarlite-full-implementation-next-js-1/03-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: styles/globals.css — brand tokens, mobile-first base, reusable component classes</name>
  <files>
    styles/globals.css
  </files>
  <action>
Create `styles/globals.css` implementing F7 brand palette, mobile-first base reset, and all reusable CSS component classes that pages and components will apply.

Create the `styles/` directory if it does not exist.

**Complete file content — copy verbatim, do NOT omit any section:**

```css
/* styles/globals.css
 * CellarLite — TechSur brand palette + mobile-first base styles
 * Mobile-first: base = 375 px, breakpoints enhance upward
 * NO external CSS framework (@import of Tailwind, Bootstrap, etc. prohibited)
 */

/* ── Brand tokens (F07-REQ-01, UX-Mockup Brand Tokens) ─────────────────── */
:root {
  --color-accent:       #FBCA5C;  /* Gold — primary buttons, focus rings, key links */
  --color-text:         #0A0A0A;  /* Near-black — all body and label text */
  --color-surface:      #FFFFFF;  /* Page background, card surfaces */
  --color-accent-hover: #E8B540;  /* Accent button hover/active state */
  --color-error:        #D93025;  /* Inline error text and border */
  --color-muted:        #6B7280;  /* Secondary/metadata text (vintage, varietal) */
  --color-border:       #E5E7EB;  /* Card borders, input borders */
  --color-destructive:  #B91C1C;  /* Delete button text */
}

/* ── Base reset ─────────────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  /* Prevent horizontal scroll on any viewport (US-7.1, US-7.2) */
  overflow-x: hidden;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

a {
  color: inherit;
  text-decoration: none;
}

/* ── Layout container (F07-REQ-02, UX-Mockup Global Layout Container) ───── */
/* Mobile-first: full-width; centred + capped on larger screens */
.container {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

/* ── Nav bar (Pattern J, UX-Mockup) ──────────────────────────────────────── */
/* Height: 56px; white surface; border-bottom; subtle shadow */
.nav {
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav__brand {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  /* Minimum tap target height ensured by nav height (56px) */
}

/* "+ Add" pill button in nav */
.nav__add {
  display: inline-flex;
  align-items: center;
  background: var(--color-accent);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  min-height: 36px;
  text-decoration: none;
  white-space: nowrap;
}

.nav__add:hover {
  background: var(--color-accent-hover);
}

/* ── Page main content area ─────────────────────────────────────────────── */
.page-content {
  padding: 16px 0;
}

/* ── Form input (Pattern E, UX-Mockup) ──────────────────────────────────── */
/* font-size: 16px is CRITICAL — prevents iOS auto-zoom (US-7.1) */
.form-input {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 12px;
  font-size: 16px;   /* NEVER below 16px on mobile — prevents iOS zoom */
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus {
  border: 2px solid var(--color-accent);
  /* meets WCAG 2.4.11 — not removing outline, replacing with gold border */
}

.form-input--error {
  border: 2px solid var(--color-error);
}

/* ── Form label (Pattern E, US-7.4) ────────────────────────────────────── */
/* Visible labels above inputs — NOT sr-only, NOT placeholder-only */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}

.form-label--required::after {
  content: ' *';
  color: var(--color-error);
}

/* ── Form group spacing ─────────────────────────────────────────────────── */
.form-group {
  margin-bottom: 16px;
}

/* ── Inline error message (Pattern F, UX-Mockup) ─────────────────────── */
.form-error {
  display: block;
  font-size: 13px;
  color: var(--color-error);
  margin-top: 4px;
}

/* ── Error banner (Pattern G — server/API errors) ──────────────────────── */
.error-banner {
  width: 100%;
  background: #FFF1F0;
  border-left: 4px solid var(--color-error);
  padding: 12px 16px;
  font-size: 14px;
  color: #991B1B;
  border-radius: 0 4px 4px 0;
  margin-bottom: 16px;
}

/* ── Gold primary button (Pattern A, UX-Mockup) ─────────────────────────── */
/* Used for: Save Bottle, Save Changes, Add bottle CTA in empty state */
.btn-primary {
  display: block;
  width: 100%;
  height: 48px;
  background: var(--color-accent);
  color: var(--color-text);
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  line-height: 48px;
  transition: background 0.15s ease, transform 0.1s ease;
  -webkit-appearance: none;
  appearance: none;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-primary:active {
  background: #D4A030;
  transform: scale(0.98);
}

.btn-primary:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Destructive button (Pattern B — Delete Bottle) ─────────────────────── */
.btn-destructive {
  display: block;
  width: 100%;
  height: 44px;
  background: transparent;
  border: 1px solid var(--color-destructive);
  color: var(--color-destructive);
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  line-height: 42px;
  transition: background 0.15s ease;
  -webkit-appearance: none;
  appearance: none;
}

.btn-destructive:hover {
  background: #FEF2F2;
}

.btn-destructive:active {
  background: #FEE2E2;
}

.btn-destructive:focus {
  outline: 2px solid var(--color-destructive);
  outline-offset: 2px;
}

.btn-destructive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Visual separator between Save and Delete (UX-Mockup Flow 04) */
.btn-separator {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

/* ── Cancel text link (Pattern C) ───────────────────────────────────────── */
.btn-cancel {
  display: block;
  text-align: center;
  font-size: 14px;
  color: var(--color-muted);
  padding: 8px 16px;      /* ensures ≥44px touch area with surrounding space */
  min-height: 44px;
  line-height: 28px;
  cursor: pointer;
  text-decoration: none;
}

.btn-cancel:hover {
  text-decoration: underline;
}

/* ── Bottle row / list item (Pattern D, UX-Mockup) ─────────────────────── */
.bottle-row {
  display: block;
  padding: 12px 16px;
  min-height: 56px;       /* ≥44px tap target (US-7.1); 56px for two-line content */
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  text-decoration: none;
  color: var(--color-text);
  transition: background 0.1s ease, border-left 0.1s ease;
}

.bottle-row:hover,
.bottle-row:focus {
  background: #FAFAFA;
  border-left: 3px solid var(--color-accent);
  outline: none;
}

.bottle-row:active {
  background: #FFF8E7;
}

.bottle-row__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 2px;
  /* Prevent name from overflowing on narrow screens */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottle-row__meta {
  font-size: 13px;
  color: var(--color-muted);
  margin: 0;
}

/* ── Search input (Pattern H, UX-Mockup) ─────────────────────────────────── */
.search-form {
  padding: 12px 16px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-muted);
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 12px 0 36px;  /* left pad for icon */
  font-size: 16px;          /* iOS zoom prevention */
  color: var(--color-text);
  background: #F9FAFB;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.search-input:focus {
  border: 2px solid var(--color-accent);
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 48px 16px;
}

.empty-state__icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.empty-state__heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px;
}

.empty-state__body {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0 0 24px;
}

.empty-state__cta {
  max-width: 320px;
  margin: 0 auto;
}

/* ── Page heading ─────────────────────────────────────────────────────────── */
.page-heading {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px;
}

@media (min-width: 640px) {
  .page-heading {
    font-size: 22px;
  }
}

/* ── Not-found page ───────────────────────────────────────────────────────── */
.not-found {
  text-align: center;
  padding: 48px 16px;
}

.not-found__icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.not-found__heading {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
}

.not-found__body {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0 0 24px;
}

/* ── Responsive: ≥480px — two-column field row (Vintage + Quantity) ──────── */
@media (min-width: 480px) {
  .field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
  }
}

/* ── Responsive: ≥640px — desktop list row inline layout ─────────────────── */
@media (min-width: 640px) {
  .bottle-row__meta {
    font-size: 14px;
  }
}
```

**Critical implementation notes:**
- `font-size: 16px` on all inputs is NON-NEGOTIABLE — prevents iOS auto-zoom (US-7.1)
- Gold `#FBCA5C` MUST NOT be used as a page/card background — only on interactive elements (US-7.3, UX-Mockup Design Principle 3)
- No `@import` of any external CSS framework — plain CSS only (F07-REQ-08)
- All interactive elements defined here have min-height ≥ 44px for tap targets (US-7.1, WCAG 2.5.5)
  </action>
  <verify>
```bash
# File exists
ls styles/globals.css && echo "FILE OK"

# Brand tokens present
grep -n 'color-accent.*#FBCA5C' styles/globals.css && echo "ACCENT TOKEN OK"
grep -n 'color-text.*#0A0A0A' styles/globals.css && echo "TEXT TOKEN OK"
grep -n 'color-surface.*#FFFFFF' styles/globals.css && echo "SURFACE TOKEN OK"
grep -n 'color-error.*#D93025' styles/globals.css && echo "ERROR TOKEN OK"
grep -n 'color-muted.*#6B7280' styles/globals.css && echo "MUTED TOKEN OK"
grep -n 'color-destructive.*#B91C1C' styles/globals.css && echo "DESTRUCTIVE TOKEN OK"

# Critical: 16px on inputs (iOS zoom)
grep -n 'font-size: 16px' styles/globals.css && echo "16PX INPUT OK"

# Component classes present
grep -n '\.btn-primary' styles/globals.css && echo "BTN-PRIMARY OK"
grep -n '\.btn-destructive' styles/globals.css && echo "BTN-DESTRUCTIVE OK"
grep -n '\.form-input' styles/globals.css && echo "FORM-INPUT OK"
grep -n '\.nav' styles/globals.css && echo "NAV OK"
grep -n '\.container' styles/globals.css && echo "CONTAINER OK"
grep -n '\.bottle-row' styles/globals.css && echo "BOTTLE-ROW OK"
grep -n '\.search-input' styles/globals.css && echo "SEARCH-INPUT OK"

# No external framework imports
grep -n '@import.*bootstrap\|@import.*tailwind\|@import.*bulma' styles/globals.css && echo "WARNING: external framework import found" || echo "NO EXTERNAL FRAMEWORK OK"

# Gold not used as body/card background
grep -n 'background.*#FBCA5C\|background.*FBCA5C' styles/globals.css | grep -v 'btn-primary\|nav__add\|accent' && echo "WARNING: gold used as background" || echo "GOLD USAGE OK"
```
  </verify>
  <done>
- `styles/globals.css` exists with all 8 brand CSS custom properties in `:root`
- `.form-input` and `.search-input` have `font-size: 16px` (iOS zoom prevention)
- `.btn-primary` has `background: var(--color-accent)`, `height: 48px`, disabled opacity style
- `.btn-destructive` has transparent background, `border: 1px solid var(--color-destructive)`, `color: var(--color-destructive)`
- `.bottle-row` has `min-height: 56px` (≥44px tap target)
- No `@import` of any external CSS framework
- Gold `#FBCA5C` used only on interactive elements (buttons, focus rings) — not as page/card background
- Container is mobile-first (full-width at 375px, max-width 600px centred at ≥640px)
  </done>
</task>

<task type="auto">
  <name>Task 2: app/layout.tsx — root HTML shell, nav bar, metadata, globals import</name>
  <files>
    app/layout.tsx
  </files>
  <action>
Create `app/layout.tsx` — the Next.js App Router root layout (Server Component). This is the single shared wrapper for all three pages: list (`/`), add (`/bottles/new`), edit (`/bottles/[id]/edit`).

Create the `app/` directory if it does not exist.

**Complete file content — copy verbatim:**

```tsx
// app/layout.tsx
// Root layout — Server Component (no 'use client' directive)
// Renders: HTML shell + nav bar + page content area
// Imported by: all pages automatically (Next.js App Router convention)

import type { Metadata } from 'next';
import Link from 'next/link';
import '../styles/globals.css';

// Page metadata — title shown in browser tab + SEO
export const metadata: Metadata = {
  title: 'CellarLite',
  description: 'Personal wine cellar tracker',
};

// Viewport must be exported separately from metadata in Next.js 14
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Navigation bar (Pattern J, UX-Mockup)
            Height: 56px | Two links only: My Cellar (/) and + Add (/bottles/new)
            No dead links, no footer nav (UX-Mockup Navigation Structure) */}
        <nav className="nav">
          {/* Left: wordmark — links to list page */}
          <Link href="/" className="nav__brand">
            My Cellar
          </Link>

          {/* Right: Add bottle pill button
              Mobile: "+ Add" | ≥480px: "+ Add bottle"
              (UX-Mockup Pattern J: min-height 36px inside 56px bar) */}
          <Link href="/bottles/new" className="nav__add" aria-label="Add a new bottle">
            <span aria-hidden="true">+&nbsp;</span>
            <span className="nav__add-short">Add</span>
            <span className="nav__add-long" aria-hidden="true"> bottle</span>
          </Link>
        </nav>

        {/* Page content — wrapped in container for max-width centering */}
        <main>
          <div className="container">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
```

After writing `app/layout.tsx`, add the responsive nav label CSS to `styles/globals.css` — append to the end of the file:

```css

/* ── Nav add-button label variants (mobile "Add" vs desktop "+ Add bottle") ── */
/* Mobile: show short label only */
.nav__add-long {
  display: none;
}

@media (min-width: 480px) {
  .nav__add-short {
    display: none;
  }
  .nav__add-long {
    display: inline;
  }
}
```

**Critical constraints:**
- File extension MUST be `.tsx` — not `.ts` or `.js`
- NO `'use client'` directive — this is a Server Component (root layouts cannot be client components in Next.js 14)
- `import '../styles/globals.css'` — path relative from `app/` to `styles/`
- `<html lang="en">` MUST be present (accessibility requirement)
- `viewport` exported separately from `metadata` (Next.js 14 requirement — exporting viewport inside metadata is deprecated)
- Nav has EXACTLY two links: `My Cellar` → `/` and `+ Add` → `/bottles/new`. No more, no less (UX-Mockup §Navigation Structure: "No dead links")
- The `next.config.mjs` already sets `X-Frame-Options: SAMEORIGIN` via headers() — do NOT add any `X-Frame-Options` or CSP meta tags here; doing so would be redundant and risks conflicts
  </action>
  <verify>
```bash
# File exists as .tsx
ls app/layout.tsx && echo "FILE OK"

# Server Component (no 'use client')
grep -n "'use client'" app/layout.tsx && echo "WARNING: use client found — must not be present" || echo "NO USE CLIENT OK"

# globals.css imported
grep -n "globals.css" app/layout.tsx && echo "GLOBALS IMPORT OK"

# Metadata + viewport exported
grep -n "export const metadata" app/layout.tsx && echo "METADATA EXPORT OK"
grep -n "export const viewport\|export.*viewport" app/layout.tsx && echo "VIEWPORT EXPORT OK"

# Nav structure: exactly two Link elements
grep -c "href=\"/\"" app/layout.tsx | grep -q "1" && echo "HOME LINK OK" || echo "HOME LINK COUNT: $(grep -c 'href=\"/\"' app/layout.tsx)"
grep -n "href=\"/bottles/new\"" app/layout.tsx && echo "ADD LINK OK"

# Nav brand + add classes
grep -n "nav__brand" app/layout.tsx && echo "NAV BRAND CLASS OK"
grep -n "nav__add" app/layout.tsx && echo "NAV ADD CLASS OK"

# children rendered in container
grep -n "container" app/layout.tsx && echo "CONTAINER OK"
grep -n "{children}" app/layout.tsx && echo "CHILDREN OK"

# html lang attribute
grep -n 'lang="en"' app/layout.tsx && echo "HTML LANG OK"

# Verify globals.css has nav label responsive classes
grep -n "nav__add-long" styles/globals.css && echo "NAV LABEL CSS OK"

# No X-Frame-Options meta tag (headers set in next.config.mjs)
grep -n 'X-Frame-Options\|frame-ancestors' app/layout.tsx && echo "WARNING: frame header in layout — remove it" || echo "NO FRAME HEADER IN LAYOUT OK"
```
  </verify>
  <done>
- `app/layout.tsx` exists as a Server Component (no `'use client'`)
- Exports `metadata` (title: "CellarLite") and `viewport` (device-width, initial-scale=1) separately
- Imports `'../styles/globals.css'`
- Nav bar has exactly two links: `My Cellar` → `/` (class `nav__brand`) and `+ Add / + Add bottle` → `/bottles/new` (class `nav__add`)
- `{children}` rendered inside `<div className="container">` inside `<main>`
- `<html lang="en">` present
- No `X-Frame-Options` or CSP headers in layout (those are in `next.config.mjs`)
- `styles/globals.css` has `.nav__add-long` / `.nav__add-short` responsive classes appended
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

```bash
# 1. Wave 1 config contracts still satisfied
grep -n 'SAMEORIGIN' next.config.mjs && echo "IFRAME HEADER OK"
grep -n 'export default' next.config.mjs && echo "ESM CONFIG OK"
ls next.config.ts 2>/dev/null && echo "ERROR: .ts config found" || echo "NO .ts CONFIG OK"

# 2. Package.json scripts exact
node -e "const p=require('./package.json'); const ok = p.scripts.migrate === 'node scripts/migrate.mjs' && p.scripts.dev === 'npm run migrate && next dev -p 3000' && p.scripts.start === 'npm run migrate && next start -p 3000' && p.scripts.build === 'next build'; console.log('SCRIPTS EXACT:', ok)"

# 3. Brand tokens complete in globals.css
for token in 'color-accent' 'color-text' 'color-surface' 'color-accent-hover' 'color-error' 'color-muted' 'color-border' 'color-destructive'; do
  grep -q "$token" styles/globals.css && echo "TOKEN $token: OK" || echo "TOKEN $token: MISSING"
done

# 4. Layout provides contract
grep -n 'export default function RootLayout' app/layout.tsx && echo "LAYOUT EXPORT OK"
grep -n "globals.css" app/layout.tsx && echo "CSS IMPORT OK"
grep -n 'href="/bottles/new"' app/layout.tsx && echo "ADD LINK OK"

# 5. No external CSS framework
grep -n '@import.*bootstrap\|@import.*tailwind' styles/globals.css && echo "WARNING: external framework" || echo "NO FRAMEWORK OK"

# 6. iOS zoom prevention
grep -n 'font-size: 16px' styles/globals.css | grep -E 'form-input|search-input' && echo "16PX INPUT OK"

# 7. No Docker artifacts
ls Dockerfile 2>/dev/null && echo "ERROR: Dockerfile found" || echo "NO DOCKERFILE OK"
ls docker-compose.yml 2>/dev/null && echo "ERROR: docker-compose found" || echo "NO DOCKER-COMPOSE OK"

# 8. TypeScript check (if node_modules exist)
[ -d node_modules ] && npx tsc --noEmit 2>&1 | head -10 || echo "DEPS NOT INSTALLED YET - skip TSC"
```
</verification>

<success_criteria>
- `styles/globals.css` defines all 8 CSS custom properties (--color-accent #FBCA5C, --color-text #0A0A0A, --color-surface #FFFFFF, --color-accent-hover #E8B540, --color-error #D93025, --color-muted #6B7280, --color-border #E5E7EB, --color-destructive #B91C1C)
- `.form-input` and `.search-input` have `font-size: 16px` (prevents iOS auto-zoom — non-negotiable)
- `.btn-primary` has gold background, 48px height, disabled state (opacity 0.6)
- `.btn-destructive` has transparent background, red border, red text, 44px height
- `.bottle-row` has min-height 56px (≥44px tap target)
- No `@import` of any external CSS framework anywhere in `styles/globals.css`
- `app/layout.tsx` is a Server Component (no `'use client'`), exports `metadata` and `viewport`
- `app/layout.tsx` imports `'../styles/globals.css'`
- Nav bar has exactly two links: `My Cellar → /` and `+ Add → /bottles/new`
- `{children}` wrapped in `<div className="container">` inside `<main>`
- `next.config.mjs` is `.mjs` (ESM), sets `X-Frame-Options: SAMEORIGIN` (never DENY), no `frame-ancestors 'none'`
- `package.json` scripts exact: migrate=`node scripts/migrate.mjs`, dev=`npm run migrate && next dev -p 3000`, start=`npm run migrate && next start -p 3000`, build=`next build`
- No Dockerfile, docker-compose.yml, or compose.yaml created
</success_criteria>

<output>
After completion, create `.planning/express/cellarlite-full-implementation-next-js-1/06-SUMMARY.md` with:
- What was built (globals.css, layout.tsx, config verification)
- File paths created/modified
- Key implementation decisions (CSS class naming, nav structure, responsive approach)
- Any deviations from spec (flag conflicts, do NOT silently diverge)

Wave 3B (plans 07, 08) consumes:
- `styles/globals.css` — all CSS classes (.btn-primary, .btn-destructive, .form-input, .form-label, .bottle-row, .search-input, .container, etc.)
- `app/layout.tsx` — shared nav bar and container (automatically applied to all pages by Next.js)
- Brand tokens (--color-accent, --color-text, etc.) for any inline style overrides
</output>
