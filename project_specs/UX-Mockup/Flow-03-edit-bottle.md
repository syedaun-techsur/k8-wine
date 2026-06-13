---

## Flow 03: Edit a Bottle (Cellar Mode — most common: qty decrement)

**Trigger:** Alex taps any bottle row on the list page.
**User Stories:** US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6
**Journey:** JRN-01.2

```
[Tap bottle row on list page]
         │
         ▼
[GET /bottles/[id]/edit]
         │
         ├── bottle found ──▶ [Form pre-populated with all 5 fields]
         │                              │
         │                    [Alex changes quantity (or any field)]
         │                              │
         │                    [Tap Save]
         │                              │
         │                    ├── name blank ──▶ [Inline error "Name is required"]
         │                    │                  [Form preserved]
         │                    │
         │                    ├── API 422 ──▶ [Inline error; fields preserved]
         │                    │
         │                    └── API 200 ──▶ [Redirect to /]
         │                                    [Updated value visible in list]
         │
         └── bottle not found ──▶ [Not-found page: "Bottle not found" + link to /]

[Tap Cancel (any time)] ──▶ [Navigate to / — no changes saved]
```

**Steps:**
1. Tapping any bottle row navigates to `/bottles/[id]/edit`. Row tap target ≥ 44 px tall.
2. Server fetches the bottle record; all five fields pre-populated.
3. Alex changes the quantity field — it selects all on focus for instant one-keystroke replacement.
4. Client validates name is non-blank before submitting.
5. On valid submit: `PUT /api/bottles/[id]`. Save button disabled on click.
6. On 200: redirect to `/`. Updated quantity visible immediately.
7. On not-found (page load): "Bottle not found" message + "Back to My Cellar" link. No crash.
8. Cancel link returns to `/` without saving.

**Exit points:** `/` (success or cancel) | Not-found page → `/` | Stays on form (validation error)
