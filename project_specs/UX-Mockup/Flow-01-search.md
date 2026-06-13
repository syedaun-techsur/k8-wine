---

## Flow 01: Search / Filter by Name (Planning Mode)

**Trigger:** Alex needs to find a specific wine in a large collection without scrolling.
**User Stories:** US-4.1, US-4.2, US-4.3, US-4.4, US-4.5
**Journey:** JRN-02.2

```
[List page loads — search input visible at top]
         │
         ▼
[Alex types partial name, e.g. "gren"]
         │
         ▼
[URL updates to /?q=gren — page re-renders (server)]
         │
         ├── matches found ──▶ [Filtered list: only matching rows shown]
         │                              │
         │                     [Alex reads results → exits or edits a row]
         │
         └── no matches ──▶ [Search-empty state: "No bottles match 'gren'"]
                                       │
                               [Add bottle button still visible]
                                       │
                               [Alex clears input → full list restores]
```

**Steps:**
1. Search `<input>` is visible at the top of the list page on load (not hidden behind a button).
2. Alex types a fragment (e.g. "gren"). On change or submit, URL becomes `/?q=gren`.
3. Server re-renders: only bottles with `name ILIKE '%gren%'` appear.
4. If no results: search-empty message shows the search term ("No bottles match 'gren'"). "Add bottle" button remains visible.
5. Clearing input and submitting (or navigating to `/`) removes `?q=` and restores the full list.
6. Reloading while `?q=gren` is in the URL preserves the filtered state; input is pre-populated.

**Exit points:** Off-app | `/bottles/[id]/edit` | Clear search → full list
