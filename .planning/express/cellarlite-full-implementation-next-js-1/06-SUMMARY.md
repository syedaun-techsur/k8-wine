---
phase: cellarlite-full-implementation-next-js-1
plan: "06"
subsystem: brand-ui
tags: [css, layout, brand-tokens, mobile-first, next-js]
dependency_graph:
  requires: ["01 (next.config.mjs, package.json scripts)"]
  provides: ["styles/globals.css", "app/layout.tsx"]
  affects: ["07 (Add Bottle page)", "08 (Edit/Delete page)", "all Wave 3 pages"]
tech_stack:
  added: []
  patterns: ["CSS custom properties", "BEM-style CSS classes", "Next.js App Router Server Component", "mobile-first responsive design"]
key_files:
  created:
    - styles/globals.css
  modified:
    - app/layout.tsx
decisions:
  - "Used relative import path '../styles/globals.css' (not '@/' alias) for Next.js App Router compatibility"
  - "Exported viewport separately from metadata (Next.js 14 requirement — viewport inside metadata is deprecated)"
  - "CSS class naming uses BEM-style double underscores (nav__brand, nav__add, bottle-row__name) matching UX mockup patterns"
  - "Rewrote existing app/layout.tsx which used old class names (nav-logo, nav-add, nav-inner) to match plan's specified classes (nav__brand, nav__add)"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-15T17:32:03Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase cellarlite-full-implementation-next-js-1 Plan 06: Brand Identity Layer + Root Layout Summary

**One-liner:** Brand CSS tokens (8 custom properties) + mobile-first component classes + Next.js root layout with sticky nav, implemented in plain CSS with no external framework.

---

## What Was Built

### styles/globals.css (created)
Complete brand design system as plain CSS:

**Brand tokens (`:root`):**
- `--color-accent: #FBCA5C` — Gold for primary buttons, focus rings
- `--color-text: #0A0A0A` — Near-black for all body/label text
- `--color-surface: #FFFFFF` — Page background, card surfaces
- `--color-accent-hover: #E8B540` — Hover state for accent elements
- `--color-error: #D93025` — Inline error text and borders
- `--color-muted: #6B7280` — Secondary/metadata text
- `--color-border: #E5E7EB` — Card and input borders
- `--color-destructive: #B91C1C` — Delete button color

**Mobile-first base reset:** overflow-x hidden, 16px base font, box-sizing border-box

**Reusable component classes:**
| Class | Purpose |
|-------|---------|
| `.container` | Full-width mobile → max-width 600px centred at ≥640px |
| `.nav` | 56px sticky nav bar with border-bottom |
| `.nav__brand` | Wordmark link (left) |
| `.nav__add` | Gold pill button (right) |
| `.nav__add-short` / `.nav__add-long` | Responsive label ("Add" mobile / "+ Add bottle" ≥480px) |
| `.btn-primary` | Gold button, 48px height, disabled opacity 0.6 |
| `.btn-destructive` | Transparent button, red border/text, 44px height |
| `.btn-cancel` | Muted text link, min-height 44px |
| `.form-input` | 16px font-size (iOS zoom prevention), 48px height |
| `.form-label` | Visible label, `.form-label--required::after` for asterisk |
| `.form-group` | 16px bottom margin spacing |
| `.form-error` | Red inline error text |
| `.error-banner` | Server/API error banner |
| `.bottle-row` | List item with min-height 56px tap target |
| `.search-input` | 16px font-size, 44px height |
| `.empty-state` | Centred empty state container |
| `.field-row-2` | Two-column grid at ≥480px (Vintage + Quantity) |
| `.not-found` | 404 page layout |
| `.page-heading` | 20px/22px heading |

### app/layout.tsx (rewritten)
Next.js App Router root layout (Server Component):
- **No `'use client'`** — Server Component as required
- **`export const metadata`**: title "CellarLite", description
- **`export const viewport`**: `{ width: 'device-width', initialScale: 1 }` — exported separately per Next.js 14 requirements
- **`<html lang="en">`** — accessibility requirement
- **Nav bar**: exactly 2 links — `My Cellar → /` (`.nav__brand`) and `+ Add → /bottles/new` (`.nav__add`)
- **`{children}`** wrapped in `<div className="container">` inside `<main>`
- **Import**: `'../styles/globals.css'` (relative path, not `@/` alias)
- **No `X-Frame-Options` meta** — handled by `next.config.mjs headers()`

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `95defaa` | `feat(cellarlite-06): add styles/globals.css — brand tokens + mobile-first CSS` |
| Task 2 | `9e6af2f` | `feat(cellarlite-06): add app/layout.tsx — root HTML shell, nav bar, globals import` |

---

## Verification Results

All plan success criteria met:

- ✅ `styles/globals.css` defines all 8 CSS custom properties
- ✅ `.form-input` and `.search-input` have `font-size: 16px` (iOS auto-zoom prevention)
- ✅ `.btn-primary` has gold background (`var(--color-accent)`), 48px height, disabled opacity 0.6
- ✅ `.btn-destructive` has transparent background, red border, red text, 44px height
- ✅ `.bottle-row` has `min-height: 56px` (≥44px tap target)
- ✅ No `@import` of any external CSS framework
- ✅ `app/layout.tsx` is a Server Component (no `'use client'`)
- ✅ Exports `metadata` and `viewport` separately
- ✅ Imports `'../styles/globals.css'`
- ✅ Nav has exactly 2 links: `My Cellar → /` and `+ Add → /bottles/new`
- ✅ `{children}` wrapped in `<div className="container">` inside `<main>`
- ✅ `next.config.mjs` is `.mjs` (ESM), sets `X-Frame-Options: SAMEORIGIN` — verified unchanged
- ✅ `package.json` scripts exact (SCRIPTS EXACT: true)
- ✅ No Dockerfile, docker-compose.yml created

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Rewrote existing app/layout.tsx with outdated class names**
- **Found during:** Task 2
- **Issue:** An existing `app/layout.tsx` was present from an earlier plan (likely 04-PLAN) using class names `nav-logo`, `nav-add`, `nav-inner` (hyphenated), a manual `<meta name="viewport">` tag, the `@/` path alias for CSS import, and a different title "CellarLite — My Wine Cellar"
- **Fix:** Rewrote to match plan specification: BEM-style class names (`nav__brand`, `nav__add`), `export const viewport` (Next.js 14 pattern), relative CSS import path `'../styles/globals.css'`, title "CellarLite"
- **Files modified:** `app/layout.tsx`
- **Commit:** `9e6af2f`

---

## What Wave 3B (plans 07, 08) Consumes

- **`styles/globals.css`** — all CSS classes (`.btn-primary`, `.btn-destructive`, `.form-input`, `.form-label`, `.bottle-row`, `.search-input`, `.container`, `.empty-state`, `.field-row-2`, etc.)
- **`app/layout.tsx`** — shared nav bar and container automatically applied by Next.js App Router to all pages
- **Brand tokens** (`--color-accent`, `--color-text`, etc.) available for any inline style overrides

---

## Self-Check

```
styles/globals.css:    EXISTS ✅
app/layout.tsx:        EXISTS ✅
Commit 95defaa:        EXISTS ✅
Commit 9e6af2f:        EXISTS ✅
```

## Self-Check: PASSED
