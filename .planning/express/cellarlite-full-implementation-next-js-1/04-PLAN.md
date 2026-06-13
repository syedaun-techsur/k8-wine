---
phase: cellarlite-full-implementation-next-js-1
plan: 04
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - app/page.tsx
  - app/layout.tsx
  - styles/globals.css
  - app/components/SearchInput.tsx
autonomous: true

features:
  implements: ["F0", "F4", "F7"]
  depends_on: ["F5", "F6"]
  enables: ["F1", "F2", "F3"]

must_haves:
  truths:
    - "GET / renders the bottle list (server-rendered, no client-side loading spinner on initial load)"
    - "Each bottle row shows: name (bold), vintage, varietal, quantity, location"
    - "Each bottle row is a link to /bottles/[id]/edit with min-height 56px tap target"
    - "When the cellar is empty: 'No bottles yet' message + gold 'Add your first bottle' button → /bottles/new"
    - "When search has no matches: 'No bottles match \\'<term>\\'' message (distinct from empty cellar)"
    - "Search input is always visible at top of list page, pre-filled with current ?q= value on load"
    - "Typing in search debounces ≤500ms and calls router.replace('/?q=<term>') — URL-driven, no full page reload"
    - "Clearing search and navigating to / restores the full list"
    - "Nav bar shows 'My Cellar' (links to /) and '+ Add' button (links to /bottles/new) — no dead links"
    - "App renders without horizontal scroll at 375px; all interactive elements ≥44×44px tap target"
    - "App loads inside an iframe (no X-Frame-Options: DENY, no frame-ancestors 'none')"
  artifacts:
    - path: "app/page.tsx"
      provides: "Bottle List Page — server component, fetches bottles, renders rows and empty/search states"
      exports: ["default (async Server Component)"]
    - path: "app/layout.tsx"
      provides: "Root layout — viewport meta, globals.css, nav bar"
      exports: ["default (RootLayout)"]
    - path: "styles/globals.css"
      provides: "CSS custom properties (brand palette), mobile-first layout, nav, bottle row, empty state, search input styles"
      contains: "--color-accent: #FBCA5C"
    - path: "app/components/SearchInput.tsx"
      provides: "Client component — debounced search input, router.replace on change"
      exports: ["default (SearchInput)"]
  key_links:
    - from: "app/page.tsx"
      to: "GET /api/bottles"
      via: "direct pool.query or fetch('/api/bottles')"
      pattern: "pool\\.query|fetch.*api/bottles"
    - from: "app/page.tsx"
      to: "app/components/SearchInput.tsx"
      via: "<SearchInput defaultValue={q} /> prop"
      pattern: "<SearchInput"
    - from: "app/components/SearchInput.tsx"
      to: "URL ?q= param"
      via: "useRouter + router.replace"
      pattern: "router\\.replace"
    - from: "app/layout.tsx"
      to: "styles/globals.css"
      via: "import '@/styles/globals.css'"
      pattern: "import.*globals\\.css"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "lib/db.ts"
      exports: ["default (pg.Pool)"]
      verify: "grep -n 'export default pool' lib/db.ts && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "next.config.mjs"
      exports: ["headers() — X-Frame-Options: SAMEORIGIN"]
      verify: "grep -n 'SAMEORIGIN' next.config.mjs && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "app/api/bottles/route.ts"
      exports: ["GET"]
      verify: "grep -n 'export async function GET' app/api/bottles/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "types/bottle.ts"
      exports: ["Bottle"]
      verify: "grep -n 'interface Bottle' types/bottle.ts && echo CONTRACT_OK"
  provides:
    - artifact: "app/layout.tsx"
      exports: ["default (RootLayout)", "globals.css import", "nav bar HTML"]
      shape: |
        export default function RootLayout({ children }: { children: React.ReactNode })
        Renders: <html><body><nav>My Cellar + Add</nav>{children}</body></html>
        Imports: '@/styles/globals.css'
      verify: "grep -n 'export default function RootLayout' app/layout.tsx && echo CONTRACT_OK"
    - artifact: "app/page.tsx"
      exports: ["default (async Server Component — Bottle List Page)"]
      shape: |
        export default async function Home({ searchParams }: { searchParams: { q?: string } })
        Reads searchParams.q, queries DB, renders bottle rows or empty/search-empty state
      verify: "grep -n 'export default async function Home' app/page.tsx && echo CONTRACT_OK"
    - artifact: "app/components/SearchInput.tsx"
      exports: ["default (SearchInput)"]
      shape: |
        'use client'
        export default function SearchInput({ defaultValue }: { defaultValue?: string })
        useRouter + useCallback debounce → router.replace('/?q=<term>', { scroll: false })
      verify: "grep -n \"'use client'\" app/components/SearchInput.tsx && grep -n 'router.replace' app/components/SearchInput.tsx && echo CONTRACT_OK"
    - artifact: "styles/globals.css"
      exports: ["CSS custom properties: --color-accent, --color-text, --color-surface, etc."]
      shape: |
        :root { --color-accent: #FBCA5C; --color-text: #0A0A0A; --color-surface: #FFFFFF; ... }
      verify: "grep -n 'color-accent.*#FBCA5C' styles/globals.css && echo CONTRACT_OK"
---

<objective>
Build the Bottle List page (`/`) and the client-side search input component — the primary daily-use screen of CellarLite.

Purpose: This is the app's landing experience (F0) plus name-search filtering (F4). The page is server-rendered using the pg Pool from wave 1 — no client-side data waterfall on first load. Search state lives in the URL (?q=), is pre-populated on load, and debounces ≤500ms before calling router.replace. The root layout, nav bar, and global CSS palette are also established in this plan so all wave 3 pages share consistent brand styles.

Output:
- `app/layout.tsx` — root layout with viewport meta, globals.css, nav bar ("My Cellar" + "+ Add")
- `app/page.tsx` — server component: fetches bottles from DB, renders rows, empty state, search-empty state
- `app/components/SearchInput.tsx` — "use client" debounced search input using router.replace
- `styles/globals.css` — CSS custom properties, mobile-first layout, nav, bottle row, empty/search-empty state styles
</objective>

<feature_dependencies>
Implements: F0: Bottle List Page (`/`) — server-rendered list with all 5 fields, empty state, add bottle CTA
             F4: Search / Filter by Name — ?q= URL-driven, debounced client input, ILIKE via server component re-render
             F7: Brand & Mobile-First UI — TechSur palette, 375px mobile-first, tap targets ≥44px, iframe-safe headers
Depends on: F6: Database Auto-Migration (lib/db.ts Pool singleton from plan 01), F5: REST API types (types/bottle.ts from plan 02)
Enables: F1: Add Bottle Page, F2: Edit Bottle Page, F3: Delete Bottle (share layout.tsx and globals.css)
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/express/cellarlite-full-implementation-next-js-1/01-PLAN.md
@.planning/express/cellarlite-full-implementation-next-js-1/02-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Root layout, global CSS, and nav bar</name>
  <files>
    app/layout.tsx
    styles/globals.css
  </files>
  <action>
Create the root layout and global CSS that all pages share. Create `app/` and `styles/` directories if not present.

---

**1. `styles/globals.css`**

Implement all CSS custom properties and base styles from UX-Mockup-CellarLite.md Brand Tokens, Pattern J (Nav Bar), Pattern D (Bottle Row), Pattern H (Search Input), Pattern A (Gold Primary Button), and F07-REQ-01 through F07-REQ-08 in the RTM.

CRITICAL constraints:
- NO external CSS framework (no @import of Bootstrap, Tailwind CDN etc.) — F07-REQ-08
- Mobile-first base styles targeting 375px — F07-REQ-03
- All interactive elements: min-height/min-width 44px — F07-REQ-04
- Font-size 16px on all inputs (prevents iOS auto-zoom) — UX Pattern E
- Content max-width container for ≥640px — F07-REQ-02

```css
/* styles/globals.css */
/* CellarLite — TechSur brand palette, mobile-first CSS */
/* NO external CSS framework — plain CSS per F07-REQ-08 */

/* ── Brand tokens ──────────────────────────────────────────── */
:root {
  --color-accent:       #FBCA5C;   /* Gold — primary buttons, focus rings, key links */
  --color-accent-hover: #E8B540;   /* Gold darkened for hover/active */
  --color-text:         #0A0A0A;   /* Near-black — all body and label text */
  --color-surface:      #FFFFFF;   /* Page background, card surfaces */
  --color-error:        #D93025;   /* Inline error text and border */
  --color-muted:        #6B7280;   /* Secondary/metadata text */
  --color-border:       #E5E7EB;   /* Card borders, input borders */
  --color-destructive:  #B91C1C;   /* Delete button text */
}

/* ── Reset / base ──────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  overflow-x: hidden;  /* prevent horizontal scroll at 375px */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── Layout container ──────────────────────────────────────── */
/* Mobile-first: full-width base; cap at 600px on ≥640px */
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

/* ── Navigation bar — Pattern J ────────────────────────────── */
/* Height: 56px; white bg; border-bottom; logo left, Add right */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  height: 56px;
  display: flex;
  align-items: center;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
}

@media (min-width: 640px) {
  .nav-inner {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

.nav-logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  line-height: 1;
}

.nav-logo:hover {
  opacity: 0.85;
}

/* Nav Add button — gold pill; min-height 36px inside 56px bar */
.nav-add {
  display: inline-flex;
  align-items: center;
  background: var(--color-accent);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  text-decoration: none;
  min-height: 36px;
  white-space: nowrap;
}

.nav-add:hover {
  background: var(--color-accent-hover);
}

.nav-add:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ── Page content area ─────────────────────────────────────── */
.page-content {
  padding: 16px 0;
}

/* ── Search input — Pattern H ──────────────────────────────── */
/* Always visible at top of list page; height 44px; off-white bg */
.search-wrap {
  margin-bottom: 8px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
  pointer-events: none;
  font-size: 14px;
  line-height: 1;
}

.search-input {
  width: 100%;
  height: 44px;
  background: #F9FAFB;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0 12px 0 36px;
  font-size: 16px;     /* 16px critical: prevents iOS auto-zoom */
  color: var(--color-text);
  appearance: none;
  -webkit-appearance: none;
}

.search-input:focus {
  outline: none;
  border: 2px solid var(--color-accent);
}

.search-input::placeholder {
  color: var(--color-muted);
}

/* ── Bottle list ───────────────────────────────────────────── */
.bottle-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ── Bottle row — Pattern D ────────────────────────────────── */
/* Block anchor; min-height 56px; two-line mobile layout */
.bottle-row {
  display: block;
  min-height: 56px;
  padding: 12px 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.1s ease;
}

.bottle-row:hover {
  background: #FAFAFA;
  border-left: 3px solid var(--color-accent);
  padding-left: 13px;  /* compensate for 3px border */
}

.bottle-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.bottle-row:active {
  background: #FFF8E7;
}

/* Bottle name — 16px bold */
.bottle-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  display: block;
  margin-bottom: 2px;
}

/* Bottle metadata — 13px muted */
.bottle-meta {
  font-size: 13px;
  color: var(--color-muted);
  display: block;
}

@media (min-width: 640px) {
  /* Desktop: inline meta right-aligned */
  .bottle-row-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bottle-meta {
    font-size: 14px;
    text-align: right;
  }
}

/* ── Empty state (no bottles) ──────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--color-muted);
  margin-bottom: 24px;
  max-width: 260px;
}

/* ── Gold primary CTA button — Pattern A ──────────────────── */
/* Height 48px; full-width; gold bg; near-black text */
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
  text-decoration: none;
  text-align: center;
  line-height: 48px;
  padding: 0 16px;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-primary:active {
  background: #D4A030;
  transform: scale(0.98);
}

.btn-primary:disabled,
.btn-primary[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 640px) {
  .btn-primary.empty-cta {
    max-width: 320px;
    margin: 0 auto;
  }
}

/* ── Search-empty state ────────────────────────────────────── */
.search-empty {
  padding: 32px 16px;
  text-align: center;
}

.search-empty-msg {
  font-size: 15px;
  color: var(--color-muted);
  margin-bottom: 20px;
}

/* ── Form inputs — Pattern E (used by later wave pages) ────── */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 48px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 12px;
  font-size: 16px;   /* critical: prevents iOS auto-zoom */
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border: 2px solid var(--color-accent);
}

.form-input.error {
  border: 2px solid var(--color-error);
}

/* ── Inline error — Pattern F ──────────────────────────────── */
.form-error {
  font-size: 13px;
  color: var(--color-error);
  margin-top: 4px;
}

/* ── Error banner — Pattern G ──────────────────────────────── */
.error-banner {
  background: #FFF1F0;
  border-left: 4px solid var(--color-error);
  padding: 12px 16px;
  font-size: 14px;
  color: #991B1B;
  border-radius: 0 4px 4px 0;
  margin-bottom: 16px;
}

/* ── Secondary / Cancel link — Pattern C ───────────────────── */
.btn-cancel {
  display: block;
  text-align: center;
  font-size: 14px;
  color: var(--color-muted);
  text-decoration: none;
  padding: 10px 16px;
  min-height: 44px;
  line-height: 24px;
}

.btn-cancel:hover {
  text-decoration: underline;
}

/* ── Destructive button — Pattern B (edit page) ─────────────── */
.btn-destructive {
  display: block;
  width: 100%;
  height: 44px;
  background: transparent;
  border: 1px solid var(--color-destructive);
  border-radius: 6px;
  color: var(--color-destructive);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  line-height: 42px;
  padding: 0 16px;
}

.btn-destructive:hover {
  background: #FEF2F2;
}

.btn-destructive:focus-visible {
  outline: 2px solid var(--color-destructive);
  outline-offset: 2px;
}

.btn-destructive:active {
  background: #FEE2E2;
}

.btn-destructive:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Divider (save/delete separator on edit page) ────────────── */
.section-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

/* ── Form page layout (add / edit pages) ─────────────────────── */
.form-page {
  padding: 24px 16px;
}

@media (min-width: 640px) {
  .form-page {
    max-width: 480px;
    margin: 0 auto;
    padding: 32px 24px;
  }
}

.form-page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
}

/* ── Responsive: Vintage + Qty side-by-side at ≥480px ───────── */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 480px) {
  .form-row-2 {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
```

---

**2. `app/layout.tsx`**

Root layout with viewport meta, globals.css import, and nav bar. From UX-Mockup-CellarLite.md Pattern J and F07-REQ specifications.

CRITICAL constraints (from PROJECT.md and RTM §4 F7):
- Viewport meta tag: `content="width=device-width, initial-scale=1"` — required for 375px mobile layout
- Import globals.css here so all pages inherit brand styles
- Nav: "My Cellar" logo (links to `/`) + "+ Add" / "+ Add bottle" button (links to `/bottles/new`) — NO other nav links
- No dead links in nav — both routes are real routes in this app
- Do NOT emit X-Frame-Options: DENY or SAMEORIGIN via headers here — that's handled in next.config.mjs

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CellarLite — My Wine Cellar',
  description: 'Personal wine cellar tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Navigation bar — Pattern J: 56px bar, logo left, Add right */}
        <nav className="nav" aria-label="Main navigation">
          <div className="nav-inner">
            {/* "My Cellar" wordmark — links to / */}
            <Link href="/" className="nav-logo">
              My Cellar
            </Link>
            {/* "+ Add" pill button — links to /bottles/new */}
            {/* Mobile: short label; ≥480px: full label via CSS */}
            <Link href="/bottles/new" className="nav-add" aria-label="Add a new bottle">
              <span className="nav-add-short">+ Add</span>
              <span className="nav-add-full"> bottle</span>
            </Link>
          </div>
        </nav>

        {/* Page content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
```

Add the responsive nav label CSS to globals.css (append after the .nav-add rule):
```css
/* Short label always visible; full label hidden on mobile, shown at ≥480px */
.nav-add-full {
  display: none;
}
@media (min-width: 480px) {
  .nav-add-full {
    display: inline;
  }
}
```

After writing these files, verify the `app/` directory exists and `styles/` directory is accessible at the project root.
  </action>
  <verify>
```bash
grep -n 'color-accent.*#FBCA5C' styles/globals.css && echo "ACCENT CSS OK"
grep -n 'overflow-x.*hidden' styles/globals.css && echo "NO HSCROLL OK"
grep -n 'export default function RootLayout' app/layout.tsx && echo "LAYOUT EXPORT OK"
grep -n 'My Cellar' app/layout.tsx && echo "NAV LOGO OK"
grep -n '/bottles/new' app/layout.tsx && echo "NAV ADD LINK OK"
grep -n 'globals.css' app/layout.tsx && echo "CSS IMPORT OK"
grep -n 'width=device-width' app/layout.tsx && echo "VIEWPORT META OK"
grep 'DENY' next.config.mjs 2>/dev/null && echo "WARNING: DENY header found" || echo "NO DENY HEADER OK"
```
  </verify>
  <done>
- `styles/globals.css` defines all CSS custom properties: --color-accent #FBCA5C, --color-text #0A0A0A, --color-surface #FFFFFF, --color-muted #6B7280, --color-border #E5E7EB, --color-error #D93025, --color-destructive #B91C1C
- `styles/globals.css` has mobile-first layout, .nav (56px), .bottle-row (min-height 56px, ≥44px tap target), .search-input (44px h, 16px font), .btn-primary (48px h, gold), .btn-destructive, .form-input (48px h, 16px font)
- `styles/globals.css` has no external CSS @import
- `app/layout.tsx` exports default RootLayout with viewport meta, globals.css import, nav ("My Cellar" → `/`, "+ Add" → `/bottles/new`)
- Both nav links point to real routes — no dead links
  </done>
</task>

<task type="auto">
  <name>Task 2: Bottle List page (server component) + SearchInput client component</name>
  <files>
    app/page.tsx
    app/components/SearchInput.tsx
  </files>
  <action>
Create the home page server component and the debounced search client component.

Create `app/components/` directory if not present.

---

**1. `app/components/SearchInput.tsx`**

Client component for the debounced search input. Per F04-REQ-02: debounce ≤500ms, uses `router.replace` (not `push`), keeps search state in URL.

CRITICAL: must be `'use client'` — it uses `useRouter`, `useCallback`, `useRef`.

```typescript
// app/components/SearchInput.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface SearchInputProps {
  defaultValue?: string;
}

/**
 * Debounced search input — F04-REQ-02.
 * On change: waits ≤500ms then calls router.replace('/?q=<term>', { scroll: false }).
 * Uses router.replace (not push) so the back button skips intermediate search states.
 * defaultValue pre-fills the input from the current ?q= URL param (F04-REQ-01).
 */
export default function SearchInput({ defaultValue = '' }: SearchInputProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Clear existing debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Debounce: wait 400ms (within ≤500ms spec) then update URL
      timerRef.current = setTimeout(() => {
        const q = value.trim();
        if (q.length > 0) {
          // router.replace — not push — so back button skips search intermediate states
          router.replace(`/?q=${encodeURIComponent(q)}`, { scroll: false });
        } else {
          // Empty search → restore full list (remove ?q=)
          router.replace('/', { scroll: false });
        }
      }, 400);
    },
    [router]
  );

  return (
    <div className="search-wrap">
      {/* Search icon */}
      <span className="search-icon" aria-hidden="true">🔍</span>
      {/* Pattern H: type="search" in GET form — works without JS, enhanced by JS onChange */}
      <input
        type="search"
        name="q"
        className="search-input"
        placeholder="Search bottles..."
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-label="Search bottles by name"
        autoComplete="off"
      />
    </div>
  );
}
```

---

**2. `app/page.tsx`**

Server Component — fetches bottles directly via the pg Pool (or via the API). Per F00-REQ-01: execute `SELECT * FROM bottles ORDER BY created_at DESC` on every page load with no client waterfall.

Implementation notes:
- Query the DB directly using `pool` from `lib/db.ts` (not a client-side fetch) — this is a Server Component
- Accept `searchParams.q` from the Next.js App Router page props
- When `q` is non-empty: run `SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC` with `$1 = '%' + q.trim() + '%'` (parameterised — never interpolated)
- Render three states:
  1. Normal list: bottle rows as `<a>` links to `/bottles/[id]/edit`
  2. Empty cellar (no bottles, no q): "No bottles yet" + gold Add button
  3. Search empty (no bottles, q present): "No bottles match '<q>'" + Add button
- Each row shows: name (bold), vintage · varietal on second line (muted), Qty + location on second line (muted). Use dash `—` when optional fields are null/empty
- `<SearchInput>` client component is rendered inside this server component with `defaultValue={q}`

```typescript
// app/page.tsx
import Link from 'next/link';
import pool from '@/lib/db';
import type { Bottle } from '@/types/bottle';
import SearchInput from '@/app/components/SearchInput';

interface HomePageProps {
  searchParams: { q?: string };
}

/**
 * Bottle List Page — F0 + F4.
 * Server Component: renders on every request; no client-side data fetch on initial load.
 * Accepts ?q= for ILIKE search filtering (F04-REQ-02 to F04-REQ-08).
 */
export default async function Home({ searchParams }: HomePageProps) {
  const rawQ = searchParams.q ?? '';
  const q = rawQ.trim().slice(0, 500);  // cap at 500 chars per F04-REQ-08

  let bottles: Bottle[] = [];
  let dbError = false;

  try {
    let result;
    if (q.length > 0) {
      // ILIKE filter — parameterised, never interpolated (F04-REQ-05, F00-REQ-08)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC',
        [`%${q}%`]
      );
    } else {
      // All bottles, newest first (F00-REQ-01)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles ORDER BY created_at DESC'
      );
    }
    bottles = result.rows;
  } catch {
    // DB error — F00-REQ-07: render error boundary message
    dbError = true;
  }

  // ── Error state (F00-REQ-07) ────────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="container page-content">
        <SearchInput defaultValue={q} />
        <div className="error-banner" role="alert">
          Unable to load cellar. Please try again.
        </div>
      </div>
    );
  }

  // ── Determine render state ──────────────────────────────────────────────────
  const isEmpty = bottles.length === 0;
  const isSearchEmpty = isEmpty && q.length > 0;
  const isCellarEmpty = isEmpty && q.length === 0;

  return (
    <div className="container page-content">
      {/* Search input — F04-REQ-01: always visible, pre-filled with current ?q= */}
      <SearchInput defaultValue={q} />

      {/* ── State 1: Cellar empty — F00-REQ-03 ────────────────────────────── */}
      {isCellarEmpty && (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🍷</div>
          <p className="empty-title">No bottles yet.</p>
          <p className="empty-subtitle">
            Add your first bottle to start tracking your cellar.
          </p>
          {/* Gold CTA button → /bottles/new (F00-REQ-06) */}
          <Link href="/bottles/new" className="btn-primary empty-cta">
            + Add your first bottle
          </Link>
        </div>
      )}

      {/* ── State 2: Search returned no results — F00-REQ-04, F04-REQ-06 ──── */}
      {isSearchEmpty && (
        <div className="search-empty">
          {/* Message includes the search term — US-4.3 */}
          <p className="search-empty-msg">No bottles match &ldquo;{q}&rdquo;.</p>
          {/* Add bottle still accessible — US-4.3 acceptance criterion */}
          <Link href="/bottles/new" className="btn-primary">
            + Add bottle
          </Link>
        </div>
      )}

      {/* ── State 3: Normal list — F00-REQ-02, F00-REQ-05 ─────────────────── */}
      {!isEmpty && (
        <ul className="bottle-list" aria-label="Wine collection">
          {bottles.map((bottle) => {
            // Build metadata line: vintage · varietal · Qty N · location
            // Show dash for null optional fields
            const vintage = bottle.vintage ?? null;
            const varietal = bottle.varietal ?? null;
            const location = bottle.location ?? null;

            // Line 2: "2019 · Cabernet Sauvignon" or "— · —" etc.
            const vintagePart = vintage ? String(vintage) : '—';
            const varietalPart = varietal || '—';
            const locationPart = location || '—';

            return (
              // F00-REQ-05: each row is <a> → /bottles/[id]/edit
              // Pattern D: min-height 56px, full-width tap target ≥44px
              <li key={bottle.id}>
                <a
                  href={`/bottles/${bottle.id}/edit`}
                  className="bottle-row"
                  aria-label={`Edit ${bottle.name}`}
                >
                  <div className="bottle-row-inner">
                    {/* Primary: bottle name — 16px bold */}
                    <span className="bottle-name">{bottle.name}</span>
                    {/* Secondary: vintage · varietal · qty · location — 13px muted */}
                    <span className="bottle-meta">
                      {vintagePart} · {varietalPart} &nbsp;|&nbsp; Qty: {bottle.quantity} · {locationPart}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add bottle button always visible in non-empty list — F00-REQ-06, US-0.4 */}
      {!isEmpty && (
        <div style={{ paddingTop: '16px' }}>
          <Link href="/bottles/new" className="btn-primary">
            + Add bottle
          </Link>
        </div>
      )}
    </div>
  );
}
```

**Import path note:** `pool` is at `lib/db.ts` — import as `'@/lib/db'` (tsconfig paths has `"@/*": ["./*"]` from plan 01).
`SearchInput` is at `app/components/SearchInput.tsx` — import as `'@/app/components/SearchInput'`.
`Bottle` interface is at `types/bottle.ts` — import as `'@/types/bottle'`.

Verify all three import paths resolve correctly.
  </action>
  <verify>
```bash
grep -n "'use client'" app/components/SearchInput.tsx && echo "CLIENT DIRECTIVE OK"
grep -n "router.replace" app/components/SearchInput.tsx && echo "ROUTER REPLACE OK"
grep -n "export default function SearchInput" app/components/SearchInput.tsx && echo "SEARCHINPUT EXPORT OK"
grep -n "export default async function Home" app/page.tsx && echo "PAGE EXPORT OK"
grep -n "SELECT \* FROM bottles ORDER BY created_at DESC" app/page.tsx && echo "LIST QUERY OK"
grep -n "ILIKE \\\$1" app/page.tsx && echo "ILIKE PARAMETERISED OK"
grep -n "No bottles yet" app/page.tsx && echo "EMPTY STATE MSG OK"
grep -n "No bottles match" app/page.tsx && echo "SEARCH EMPTY MSG OK"
grep -n "import pool from" app/page.tsx && echo "POOL IMPORT OK"
grep -n "SearchInput" app/page.tsx && echo "SEARCHINPUT USED OK"
grep -n "/bottles/new" app/page.tsx && echo "ADD LINK OK"
grep -n "bottles/\[id\]\|/edit" app/page.tsx && echo "EDIT LINK OK"
```
  </verify>
  <done>
- `app/components/SearchInput.tsx` is a `'use client'` component exporting `SearchInput({ defaultValue })`; uses `router.replace` (not push) with 400ms debounce (≤500ms spec); clears `?q=` on empty input
- `app/page.tsx` is an async Server Component exporting `Home({ searchParams })`; queries pg pool directly; renders three states: normal list, cellar-empty ("No bottles yet" + gold CTA), search-empty ("No bottles match '<q>'" + Add button)
- Each bottle row is `<a href="/bottles/[id]/edit">` with class `bottle-row` (min-height 56px, ≥44px tap target)
- All bottle rows display: name (bold), vintage, varietal, quantity, location
- `SearchInput` receives `defaultValue={q}` so input is pre-filled on page load (US-4.5)
- SQL uses parameterised `$1` placeholder — no string interpolation
- "Add bottle" link always present (nav + page body) — both point to `/bottles/new`
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

```bash
# Contract checks — wave 1 artifacts consumed
grep -n 'export default pool' lib/db.ts && echo "CONTRACT: lib/db.ts OK"
grep -n 'SAMEORIGIN' next.config.mjs && echo "CONTRACT: iframe header OK"

# Contract checks — wave 2 artifacts consumed
grep -n 'export async function GET' app/api/bottles/route.ts && echo "CONTRACT: bottles GET OK"
grep -n 'interface Bottle' types/bottle.ts && echo "CONTRACT: Bottle type OK"

# Wave 3 provides
grep -n 'export default function RootLayout' app/layout.tsx && echo "LAYOUT OK"
grep -n 'export default async function Home' app/page.tsx && echo "HOME PAGE OK"
grep -n "export default function SearchInput" app/components/SearchInput.tsx && echo "SEARCHINPUT OK"
grep -n 'color-accent.*#FBCA5C' styles/globals.css && echo "BRAND TOKEN OK"

# No dead links in nav
grep -n "href=\"/\"" app/layout.tsx && echo "NAV HOME OK"
grep -n "href=\"/bottles/new\"" app/layout.tsx && echo "NAV ADD OK"

# Search is URL-driven
grep -n "router.replace" app/components/SearchInput.tsx && echo "URL DRIVEN SEARCH OK"

# No X-Frame-Options: DENY
grep 'DENY' next.config.mjs && echo "ERROR: DENY header" || echo "NO DENY OK"

# No external CSS framework
grep -i 'bootstrap\|tailwind\|materialize\|foundation' styles/globals.css && echo "WARNING: CSS framework import" || echo "NO CSS FRAMEWORK OK"

# Mobile: font-size 16px on inputs (iOS zoom prevention)
grep -n 'font-size.*16px' styles/globals.css && echo "INPUT FONT 16px OK"

# Tap target sizes
grep -n 'min-height.*44\|min-height.*48\|min-height.*56' styles/globals.css && echo "TAP TARGETS OK"
```
</verification>

<success_criteria>
- `app/layout.tsx` renders root HTML with viewport meta, globals.css import, nav bar: "My Cellar" (→ `/`) and "+ Add" / "+ Add bottle" (→ `/bottles/new`) — no other nav links, no dead links
- `styles/globals.css` defines brand tokens --color-accent #FBCA5C, --color-text #0A0A0A, --color-surface #FFFFFF; all interactive elements have ≥44px min-height; font-size 16px on all inputs; no external CSS framework @import
- `app/page.tsx` server-renders the bottle list from PostgreSQL with no client-side loading spinner; three states: list (name, vintage, varietal, qty, location per row), cellar-empty ("No bottles yet" + gold CTA), search-empty ("No bottles match '<q>'" + Add button)
- Each bottle row is an `<a>` link to `/bottles/[id]/edit` with min-height 56px tap target
- `app/components/SearchInput.tsx` is `'use client'`; debounces ≤500ms; uses `router.replace` (not push); pre-filled from `defaultValue` prop; clears ?q= on empty input
- App renders without horizontal scroll at 375px (overflow-x: hidden on html/body; no fixed-width elements wider than 100vw)
- No X-Frame-Options: DENY or frame-ancestors 'none' anywhere — app is iframe-safe (handled by SAMEORIGIN in next.config.mjs from plan 01)
- next.config.mjs is .mjs format (verified by plan 01 — not regenerated here)
</success_criteria>

<output>
After completion, create `.planning/express/cellarlite-full-implementation-next-js-1/04-SUMMARY.md` with:
- What was built (layout, globals.css, list page, search component)
- File paths created
- Key implementation decisions (direct pool query vs fetch, router.replace debounce timing, CSS class naming, empty/search-empty state distinction)
- Any deviations from spec (flag conflicts, do NOT silently diverge)

Wave 3 continuation (plans 05, 06) consumes:
- `app/layout.tsx` — shared by Add Bottle and Edit Bottle pages
- `styles/globals.css` — shared form styles (.form-input, .btn-primary, .btn-destructive, .form-label, .form-error, .error-banner)
- `app/components/SearchInput.tsx` — search state pattern (reference only; add/edit pages don't use search)
</output>
