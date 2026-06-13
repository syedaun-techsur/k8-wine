---

## Flow 02: Add a New Bottle (Cellar Mode)

**Trigger:** Alex taps "Add bottle" on the list page (or types `/bottles/new` directly).
**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4
**Journey:** JRN-01.1

```
[Tap "Add bottle" on list page]
         │
         ▼
[/bottles/new — empty form renders]
         │
         ▼
[Alex fills in name (required) ± vintage, varietal, qty, location]
         │
         ▼
[Tap Submit]
         │
         ├── name is blank ──▶ [Client validation: inline error "Name is required"]
         │                              │
         │                     [Form preserved — Alex corrects name]
         │                              │
         │                     [Re-taps Submit ────────────────────────┐]
         │                                                              │
         ├── API 422 ──────▶ [Server validation error: inline message] │
         │                     [Form preserved — Alex corrects data]    │
         │                     [Re-taps Submit ─────────────────────────┤]
         │                                                              │
         └── API 201 ◀────────────────────────────────────────────────┘
                  │
                  ▼
         [Redirect to / — new bottle appears at top of list]

[Tap Cancel (any time)] ──▶ [Navigate to / — no record created]
```

**Steps:**
1. Form renders with five labeled fields: Name, Vintage, Varietal, Quantity, Location.
2. Name field is focused automatically on page load (speeds one-handed entry).
3. Client-side validation fires before any network request: name must not be blank.
4. On blank name: inline error "Name is required" appears below the name field. No network call.
5. On valid submit: `POST /api/bottles`. Button is disabled on click (prevents double-tap).
6. On 201: redirect to `/`. New bottle appears at top of list (newest-first sort).
7. On 422: inline error message shown; all field values preserved.
8. Cancel link is visible at all times; it navigates to `/` with no side effects.

**Exit points:** `/` (success or cancel) | Stays on form (validation error)
