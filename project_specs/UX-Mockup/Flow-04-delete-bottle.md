---

## Flow 04: Delete a Bottle (Cellar Mode)

**Trigger:** Alex taps the "Delete" button on the edit page, intending to permanently remove a fully-consumed bottle.
**User Stories:** US-3.1, US-3.2
**Journey:** JRN-01.3

```
[On /bottles/[id]/edit — Alex taps "Delete" button]
         │
         ▼
[window.confirm("Delete this bottle?")]
         │
         ├── Cancel ──▶ [Dialog closes — user stays on edit page]
         │               [No API call made — record unchanged]
         │
         └── OK ────▶ [DELETE /api/bottles/[id]]
                               │
                               ├── 204 ──▶ [Redirect to /]
                               │           [Bottle no longer in list]
                               │
                               ├── 404 ──▶ [Inline error on edit page]
                               │           "This bottle could not be deleted."
                               │
                               └── 500 ──▶ [Inline error on edit page]
                                           "Something went wrong. Please try again."
```

**Steps:**
1. "Delete" button is visually separated from the Save button — placed below the form, styled as a destructive secondary action (red text, no background fill, or outlined in red).
2. On tap: browser-native `window.confirm("Delete this bottle?")` fires. No custom modal.
3. Cancel in dialog: no network call, no state change, user stays on edit page.
4. OK in dialog: `DELETE /api/bottles/[id]` fires. Delete button disables on click.
5. On 204: redirect to `/`. Bottle is absent from the list.
6. On 404/500: inline error rendered on edit page.

**Visual hierarchy of buttons (edit page, bottom of form):**
```
[ Save  ← Gold primary ]

[ Delete ← Red text, secondary style, visually separated by spacing ]

[ Cancel ← Plain text link ]
```

**Exit points:** `/` (delete confirmed) | Edit page (dialog cancelled or error)
