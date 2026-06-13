---

## Screen 00: Bottle List Page (`/`)

**Purpose:** Primary daily-use screen. Shows entire wine collection; entry point for all CRUD flows.
**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4, US-4.1–4.5
**Journeys:** JRN-01.2 (Trigger/Locate), JRN-02.1 (Load & Orient/Locate), JRN-02.2 (Trigger/Review)

---

### Layout — Mobile (375 px)

```
┌─────────────────────────────────┐  ← viewport 375 px
│  My Cellar          [+ Add]     │  ← Nav bar: h=56px. Logo left, Add right.
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Search input: full-width, h=44px
│  │ 🔍 Search bottles...     │  │    placeholder text; pre-filled when ?q= present
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Bottle row (tappable, h≥44px)
│  │ Caymus Cabernet           │  │    name: 16px bold, #0A0A0A
│  │ 2019 · Cabernet Sauvignon │  │    vintage · varietal: 13px muted (#6B7280)
│  │ Qty: 3  · Rack A3         │  │    qty · location: 13px muted
│  └───────────────────────────┘  │    border-bottom: 1px #E5E7EB
│  ┌───────────────────────────┐  │
│  │ Barolo Riserva            │  │
│  │ 2017 · Nebbiolo           │  │
│  │ Qty: 6  · Bin 12          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Unnamed White             │  │
│  │ —  · —                    │  │  ← optional fields blank: show dash or empty
│  │ Qty: 1  · —               │  │
│  └───────────────────────────┘  │
│                                 │
│    (more rows scroll down)      │
└─────────────────────────────────┘
```

---

### Layout — Mobile: Empty State (no bottles)

```
┌─────────────────────────────────┐
│  My Cellar          [+ Add]     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │  ← Search input still visible
│  │ 🔍 Search bottles...     │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│                                 │
│        🍷                       │  ← decorative icon (optional)
│   No bottles yet.               │  ← 16px, #0A0A0A
│   Add your first bottle to      │  ← 14px, muted
│   start tracking your cellar.   │
│                                 │
│  ┌───────────────────────────┐  │
│  │   + Add your first bottle │  │  ← Gold CTA button #FBCA5C, h=48px
│  └───────────────────────────┘  │    full-width, rounded
│                                 │
└─────────────────────────────────┘
```

---

### Layout — Mobile: Search Empty State (`?q=rioja`, no matches)

```
┌─────────────────────────────────┐
│  My Cellar          [+ Add]     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🔍 rioja                 │  │  ← search term pre-filled
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│                                 │
│   No bottles match "rioja".     │  ← 15px, muted; distinct from "No bottles yet"
│                                 │
│  ┌───────────────────────────┐  │
│  │   + Add bottle            │  │  ← Gold CTA still accessible
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

### Desktop Variation (≥768 px)

```
┌──────────────────────────────────────────────────────┐  max-width: 640px, centred
│  My Cellar                          [+ Add bottle]   │  ← nav bar
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │  ← search input, full container width
│  │ 🔍  Search bottles...                          │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ Caymus Cabernet           2019  Qty: 3  Rack A3 │  │  ← row layout: name left, meta right
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Barolo Riserva            2017  Qty: 6  Bin 12  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### Information Hierarchy

| Priority | Content | Placement |
|---|---|---|
| Primary | Bottle name | Left-aligned, largest text (16px bold) |
| Primary | Quantity | Visible inline on every row — never hidden |
| Secondary | Vintage · Varietal | Second line, muted text (13px) |
| Secondary | Location | Second line alongside qty, muted |
| Tertiary | `created_at` | Never displayed — sort order only |
| Navigation | "Add bottle" button | Top-right nav + prominent in empty state |
| Filter | Search input | Top of content area, always visible |

---

### States

| State | Appearance | User Feedback |
|---|---|---|
| Default (list) | White rows, near-black text, gold nav link | N/A |
| Default (empty cellar) | Icon + message + gold CTA button | "No bottles yet." |
| Search active | Input pre-filled; filtered rows | URL shows `?q=<term>` |
| Search no-results | No rows; contextual message | "No bottles match '<term>'." |
| Loading (initial) | Server-rendered — no spinner on first load | N/A (SSR) |
| DB error | Error boundary: "Unable to load cellar. Please try again." | 500 error page |

---

### Interactive Elements

| Element | Type | Behavior |
|---|---|---|
| Nav "My Cellar" logo/wordmark | Link | Navigates to `/` |
| Nav "+ Add" / "+ Add bottle" | Link/Button | Navigates to `/bottles/new` |
| Search input | `<input type="search">` wrapped in `<form method="GET" action="/">` | On submit: appends `?q=<value>` to URL; on clear+submit: removes `?q=` |
| Bottle row | `<a href="/bottles/[id]/edit">` | Navigates to edit page for that bottle |

**Note:** Search uses a plain HTML form submit (GET), not real-time JS filtering, to ensure search state lives in the URL and works without JS. A JS enhancement can update URL on input change for faster feel.
