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
