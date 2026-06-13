---

## Flow 00: Browse Bottle List (Planning Mode)

**Trigger:** Alex opens the app URL from a bookmark, browser address bar, or recent tab — typically at a wine shop or away from the cellar.
**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4
**Journey:** JRN-02.1

```
[User opens /?q= or /]
         │
         ▼
[Server renders list page]
         │
         ├── bottles exist ──▶ [List of bottle rows, newest first]
         │                              │
         │                     [Scan list for target bottle]
         │                              │
         │                     [Read name / qty / vintage inline]
         │                              │
         │                     [Decision made → user exits app]
         │
         └── table is empty ──▶ [Empty state: "No bottles yet" + Add bottle CTA]
                                          │
                                 [Tap "Add bottle" → /bottles/new]
```

**Steps:**
1. Browser navigates to `/` — server renders HTML immediately (no client waterfall).
2. If bottles exist: full list renders, newest first. Alex scans visually.
3. If empty: empty state renders with a prominent gold "Add bottle" button.
4. Alex reads quantity + vintage directly from the row — no tap-to-expand needed.
5. Alex exits the app (or taps a row to edit — see Flow 02).

**Exit points:** Off-app (decision made) | `/bottles/new` | `/bottles/[id]/edit`
