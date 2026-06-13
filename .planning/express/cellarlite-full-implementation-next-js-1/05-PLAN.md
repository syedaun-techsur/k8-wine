---
phase: cellarlite-full-implementation-next-js-1
plan: 05
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - app/bottles/new/page.tsx
  - app/bottles/[id]/edit/page.tsx
autonomous: true

features:
  implements: ["F1", "F2", "F3"]
  depends_on: ["F5", "F6"]
  enables: []

must_haves:
  truths:
    - "Navigating to /bottles/new renders a form with five labeled fields (Name*, Vintage, Varietal, Quantity, Location)"
    - "Submitting the add form with only Name filled creates a bottle and redirects to /"
    - "Submitting the add form with Name blank shows inline 'Name is required' without a network request"
    - "Navigating to /bottles/[id]/edit shows a pre-populated form with all five fields from the DB"
    - "Navigating to /bottles/99999/edit shows 'Bottle not found' and a link to / without crashing"
    - "Saving the edit form with a valid name sends PUT /api/bottles/[id] and redirects to /"
    - "Clearing name on edit page and saving shows inline 'Name is required' without a network request"
    - "Delete button on edit page triggers window.confirm('Delete this bottle?'); OK sends DELETE and redirects to /"
    - "Cancel on confirm dialog stays on edit page; no DELETE call made"
    - "Cancel link on both pages navigates to / without any API call"
  artifacts:
    - path: "app/bottles/new/page.tsx"
      provides: "Add Bottle Client Component — form with 5 fields, POST /api/bottles, redirect to /"
      exports: ["default NewBottlePage"]
      min_lines: 80
    - path: "app/bottles/[id]/edit/page.tsx"
      provides: "Edit/Delete Bottle Client Component — pre-populated form, PUT + DELETE /api/bottles/[id], redirect to /"
      exports: ["default EditBottlePage"]
      min_lines: 120
  key_links:
    - from: "app/bottles/new/page.tsx"
      to: "POST /api/bottles"
      via: "fetch('/api/bottles', { method: 'POST', body: JSON.stringify(fields) })"
      pattern: "fetch.*api/bottles.*POST"
    - from: "app/bottles/[id]/edit/page.tsx"
      to: "GET /api/bottles/[id]"
      via: "fetch(`/api/bottles/${id}`) on mount (useEffect)"
      pattern: "fetch.*api/bottles.*id"
    - from: "app/bottles/[id]/edit/page.tsx"
      to: "PUT /api/bottles/[id]"
      via: "fetch(`/api/bottles/${id}`, { method: 'PUT', body: JSON.stringify(fields) })"
      pattern: "fetch.*api/bottles.*PUT"
    - from: "app/bottles/[id]/edit/page.tsx"
      to: "DELETE /api/bottles/[id]"
      via: "fetch(`/api/bottles/${id}`, { method: 'DELETE' }) after window.confirm"
      pattern: "fetch.*api/bottles.*DELETE"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "next.config.mjs"
      exports: ["headers() — X-Frame-Options: SAMEORIGIN"]
      verify: "grep -n 'SAMEORIGIN' next.config.mjs && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "app/api/bottles/route.ts"
      exports: ["GET", "POST"]
      verify: "grep -n 'export async function POST' app/api/bottles/route.ts && echo CONTRACT_OK"
    - from_plan: "03"
      artifact: "app/api/bottles/[id]/route.ts"
      exports: ["GET", "PUT", "DELETE"]
      verify: "grep -n 'export async function GET' app/api/bottles/\\[id\\]/route.ts && grep -n 'export async function PUT' app/api/bottles/\\[id\\]/route.ts && grep -n 'export async function DELETE' app/api/bottles/\\[id\\]/route.ts && echo CONTRACT_OK"
  provides:
    - artifact: "app/bottles/new/page.tsx"
      exports: ["default NewBottlePage"]
      shape: |
        'use client'
        Client Component — form for adding a new bottle.
        Fields: name (required, autofocus), vintage (number), varietal (text), quantity (number, default 1), location (text).
        On submit: POST /api/bottles → 201 → router.push('/').
        On blank name: inline error "Name is required", no fetch.
        Cancel: <a href="/">.
      verify: "grep -n 'export default' app/bottles/new/page.tsx && echo CONTRACT_OK"
    - artifact: "app/bottles/[id]/edit/page.tsx"
      exports: ["default EditBottlePage"]
      shape: |
        'use client'
        Client Component — pre-populated form for editing/deleting a bottle.
        On mount: GET /api/bottles/[id] → pre-fill fields; if 404 show not-found state.
        Save: PUT /api/bottles/[id] → 200 → router.push('/').
        Delete: window.confirm → DELETE /api/bottles/[id] → 204 → router.push('/').
        Cancel: <a href="/">.
      verify: "grep -n 'export default' app/bottles/\\[id\\]/edit/page.tsx && echo CONTRACT_OK"
---

<objective>
Build the Add Bottle page (`/bottles/new`) and the Edit/Delete Bottle page (`/bottles/[id]/edit`) as Next.js App Router Client Components with full form validation, error handling, and mobile-first TechSur brand styling.

Purpose: These are the two mutation UI surfaces of CellarLite — the write path that PER-01 (Cellar Mode) uses. Both pages consume the wave 2 API endpoints (POST, GET, PUT, DELETE) and redirect to `/` on success.

Output:
- `app/bottles/new/page.tsx` — Add Bottle Client Component (F1: US-1.1–1.4)
- `app/bottles/[id]/edit/page.tsx` — Edit/Delete Bottle Client Component (F2: US-2.1–2.6; F3: US-3.1–3.2)
</objective>

<feature_dependencies>
Implements: F1: Add Bottle Page (/bottles/new — form, POST /api/bottles, redirect, validation), F2: Edit Bottle Page (/bottles/[id]/edit — pre-populated form, PUT /api/bottles/[id], not-found handling), F3: Delete Bottle (window.confirm guard, DELETE /api/bottles/[id], redirect)
Depends on: F5: REST API — POST /api/bottles (plan 02), GET/PUT/DELETE /api/bottles/[id] (plan 03)
Enables: None (F1/F2/F3 are terminal features in the wave 3 build)
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/express/cellarlite-full-implementation-next-js-1/02-PLAN.md
@.planning/express/cellarlite-full-implementation-next-js-1/03-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Bottle page — /bottles/new</name>
  <files>
    app/bottles/new/page.tsx
  </files>
  <action>
Create `app/bottles/new/page.tsx` — the Client Component form for adding a new bottle.

Create parent directory `app/bottles/new/` if it does not exist.

**Critical constraints (from PROJECT.md and UX-Mockup):**
- Must be `'use client'` directive at top — form interactivity requires client-side JS
- No `X-Frame-Options: DENY` anywhere (handled globally by next.config.mjs from plan 01)
- Next.js config is `next.config.mjs` — do NOT create any other config files
- Use `useRouter()` from `next/navigation` to redirect to `/` on success (NOT `window.location.href`)
- Gold primary button: `background: #FBCA5C`, `color: #0A0A0A`, `height: 48px`, full-width, `border-radius: 6px`
- Form input height: `48px`, `font-size: 16px` (prevents iOS auto-zoom — NEVER below 16px on mobile)
- All inputs must have explicit visible `<label htmlFor="...">` elements (WCAG + US-7.4)
- Name input must have `autoFocus` (spec: "Name field is focused automatically on page load")
- Quantity input defaults to `1` (US-1.2: "quantity defaults to 1 when quantity field is left blank")
- Cancel must be `<a href="/">` plain link — NOT a button submit

**Form fields from UX-Mockup Screen 01:**
- Name: `<input type="text" id="name" required autoFocus>` — required, label shows asterisk (*
- Vintage: `<input type="number" id="vintage" min="1800" max="2027">` — optional
- Varietal: `<input type="text" id="varietal">` — optional
- Quantity: `<input type="number" id="quantity" min="1" defaultValue={1}>` — optional, default 1
- Location: `<input type="text" id="location">` — optional

**Form state to manage (useState):**
- `name`, `vintage`, `varietal`, `quantity` (string default "1"), `location`
- `nameError: string` — inline field error
- `serverError: string` — top-of-form banner error
- `submitting: boolean` — disables Save button during request

**Submit logic (from UX-Mockup Flow 02 and FRD F01-REQ-03 to F01-REQ-06):**
1. Client validation: if `name.trim() === ''` → set `nameError = 'Name is required'`, return early (NO fetch call)
2. Set `submitting = true`, clear errors
3. `fetch('/api/bottles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), vintage: vintage ? parseInt(vintage) : null, varietal: varietal.trim() || null, quantity: quantity ? parseInt(quantity) : 1, location: location.trim() || null }) })`
4. If response.status === 201: `router.push('/')`
5. If response.status === 422: parse body, set `serverError` from `body.error`
6. If other error: set `serverError = 'Something went wrong. Please try again.'`
7. Finally: set `submitting = false`

**Layout (from UX-Mockup Screen 01 and Pattern A/C/E/F/G/J):**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBottlePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [vintage, setVintage] = useState('');
  const [varietal, setVarietal] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    setServerError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          vintage: vintage ? parseInt(vintage, 10) : null,
          varietal: varietal.trim() || null,
          quantity: quantity ? parseInt(quantity, 10) : 1,
          location: location.trim() || null,
        }),
      });
      if (res.status === 201) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (res.status === 422) {
        setServerError(data.error ?? 'Validation error');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Nav bar — Pattern J */}
      <nav style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>
          ← My Cellar
        </a>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Add Bottle</span>
      </nav>

      {/* Form container */}
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {/* Server error banner — Pattern G */}
        {serverError && (
          <div role="alert" style={{
            background: '#FFF1F0',
            borderLeft: '4px solid #D93025',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#991B1B',
          }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name field — required */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Name *
            </label>
            <input
              id="name"
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: nameError ? '2px solid #D93025' : '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
            {nameError && (
              <p role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#D93025' }}>⚠ {nameError}</p>
            )}
          </div>

          {/* Vintage field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="vintage" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Vintage
            </label>
            <input
              id="vintage"
              type="number"
              min="1800"
              max="2027"
              value={vintage}
              onChange={e => setVintage(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Varietal field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="varietal" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Varietal
            </label>
            <input
              id="varietal"
              type="text"
              value={varietal}
              onChange={e => setVarietal(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quantity field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="quantity" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Location field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="location" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Save button — Pattern A: Gold primary */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '48px',
              background: '#FBCA5C',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              marginBottom: '16px',
            }}
          >
            Save Bottle
          </button>

          {/* Cancel link — Pattern C */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#6B7280',
                textDecoration: 'none',
                minHeight: '44px',
                lineHeight: '28px',
              }}
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Important:** The inline styles above implement the complete UX-Mockup spec. Do NOT add `X-Frame-Options` headers in this component — that is handled globally by `next.config.mjs` (wave 1 plan 01).
  </action>
  <verify>
```bash
grep -n "'use client'" app/bottles/new/page.tsx && echo "CLIENT DIRECTIVE OK"
grep -n 'export default' app/bottles/new/page.tsx && echo "DEFAULT EXPORT OK"
grep -n 'autoFocus\|autofocus' app/bottles/new/page.tsx && echo "AUTOFOCUS OK"
grep -n "htmlFor.*name" app/bottles/new/page.tsx && echo "NAME LABEL OK"
grep -n "htmlFor.*vintage" app/bottles/new/page.tsx && echo "VINTAGE LABEL OK"
grep -n "htmlFor.*varietal" app/bottles/new/page.tsx && echo "VARIETAL LABEL OK"
grep -n "htmlFor.*quantity" app/bottles/new/page.tsx && echo "QUANTITY LABEL OK"
grep -n "htmlFor.*location" app/bottles/new/page.tsx && echo "LOCATION LABEL OK"
grep -n "Name is required" app/bottles/new/page.tsx && echo "NAME VALIDATION OK"
grep -n "router.push" app/bottles/new/page.tsx && echo "ROUTER PUSH OK"
grep -n "FBCA5C" app/bottles/new/page.tsx && echo "GOLD BUTTON OK"
grep -n "href=\"/\"" app/bottles/new/page.tsx && echo "CANCEL LINK OK"
grep -n "method.*POST\|POST.*method" app/bottles/new/page.tsx && echo "POST METHOD OK"
```
  </verify>
  <done>
- `app/bottles/new/page.tsx` exists with `'use client'` directive
- Exports `default NewBottlePage` (or equivalent default export)
- All five form fields rendered with explicit visible `<label htmlFor="...">` elements
- Name input has `autoFocus`; quantity defaults to `1`
- Client validation: blank name → inline "Name is required" with no fetch call
- On 201: `router.push('/')` (Next.js router, not window.location)
- On 422: server error banner shown at top of form
- Save button uses `background: #FBCA5C` (gold), disabled during submit
- Cancel is `<a href="/">` plain link
- No `X-Frame-Options` header emitted from this component
  </done>
</task>

<task type="auto">
  <name>Task 2: Edit/Delete Bottle page — /bottles/[id]/edit</name>
  <files>
    app/bottles/[id]/edit/page.tsx
  </files>
  <action>
Create `app/bottles/[id]/edit/page.tsx` — the Client Component for editing and deleting an existing bottle.

Create parent directory `app/bottles/[id]/edit/` if it does not exist. The bracket in the directory name is literal: `[id]`.

**Critical constraints (same as Task 1, plus):**
- Must handle not-found: if GET /api/bottles/[id] returns 404 OR id is non-integer → render "Bottle not found" state with `<a href="/">Back to My Cellar</a>` — no crash, no blank page (US-2.6)
- Quantity input uses `onFocus` to select-all (UX-Mockup: "selects-all on tap: instant replacement")
- PUT uses full-replacement semantics — always send all 5 fields (FRD F02-REQ-04)
- Delete button: `type="button"` (not submit), fires `window.confirm('Delete this bottle?')`, then DELETE if OK
- DELETE success: `router.push('/')`
- Delete button styled as destructive secondary — Pattern B: transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, height 44px
- Visual separator between Save and Delete buttons: `margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 24px`
- Cancel is `<a href="/">` below Delete button

**State to manage:**
- `name`, `vintage`, `varietal`, `quantity`, `location` — form fields (strings for input compatibility)
- `loading: boolean` — while fetching initial bottle data
- `notFound: boolean` — if GET returns 404 or id invalid
- `nameError: string` — inline name validation error
- `serverError: string` — top banner for save/delete API errors
- `submitting: boolean` — disables Save button during PUT
- `deleting: boolean` — disables Delete button during DELETE

**On mount (useEffect):** Extract `id` from `useParams()` (Next.js App Router). Fetch `GET /api/bottles/${id}`. On 200: populate state fields. On 404 or non-integer id: set `notFound = true`.

**Save logic (PUT — FRD F02-REQ-03 to F02-REQ-07):**
1. Client validation: if `name.trim() === ''` → set `nameError = 'Name is required'`, return
2. Set `submitting = true`, clear errors
3. `fetch('/api/bottles/${id}', { method: 'PUT', ... body: all 5 fields })` — full replacement
4. 200 → `router.push('/')`
5. 422 → set `serverError` from response body
6. Other → `serverError = 'Something went wrong. Please try again.'`

**Delete logic (FRD F03-REQ-02 to F03-REQ-07):**
1. `window.confirm('Delete this bottle?')` — if false (Cancel), return immediately, no fetch
2. Set `deleting = true`
3. `fetch('/api/bottles/${id}', { method: 'DELETE' })`
4. 204 → `router.push('/')`
5. 404 → `serverError = 'This bottle could not be deleted. It may have already been removed.'`
6. Other → `serverError = 'Something went wrong. Please try again.'`
7. Finally: `deleting = false`

**Full implementation:**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBottlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState('');
  const [vintage, setVintage] = useState('');
  const [varietal, setVarietal] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Validate id is a positive integer before fetching
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/bottles/${id}`)
      .then(async res => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const bottle = await res.json();
        setName(bottle.name ?? '');
        setVintage(bottle.vintage != null ? String(bottle.vintage) : '');
        setVarietal(bottle.varietal ?? '');
        setQuantity(bottle.quantity != null ? String(bottle.quantity) : '1');
        setLocation(bottle.location ?? '');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    setServerError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bottles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          vintage: vintage ? parseInt(vintage, 10) : null,
          varietal: varietal.trim() || null,
          quantity: quantity !== '' ? parseInt(quantity, 10) : null,
          location: location.trim() || null,
        }),
      });
      if (res.status === 200) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (res.status === 422) {
        setServerError(data.error ?? 'Validation error');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this bottle?')) return;
    setDeleting(true);
    setServerError('');
    try {
      const res = await fetch(`/api/bottles/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        router.push('/');
        return;
      }
      if (res.status === 404) {
        setServerError('This bottle could not be deleted. It may have already been removed.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    height: '48px',
    fontSize: '16px',
    padding: '0 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    color: '#0A0A0A',
    background: '#FFFFFF',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500 as const,
    color: '#0A0A0A',
    marginBottom: '4px',
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <nav style={{ height: '56px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>← My Cellar</a>
        </nav>
        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280' }}>Loading…</div>
      </div>
    );
  }

  // Not found state (US-2.6) — non-integer id OR 404 from API
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <nav style={{ height: '56px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>← My Cellar</a>
        </nav>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>Bottle not found.</p>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>This bottle may have been removed or the link is incorrect.</p>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#FBCA5C',
            color: '#0A0A0A',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
          }}>
            ← Back to My Cellar
          </a>
        </div>
      </div>
    );
  }

  // Edit form
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Nav bar — Pattern J */}
      <nav style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>← My Cellar</a>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Edit Bottle</span>
      </nav>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {/* Server error banner — Pattern G */}
        {serverError && (
          <div role="alert" style={{
            background: '#FFF1F0',
            borderLeft: '4px solid #D93025',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#991B1B',
          }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-name" style={labelStyle}>Name *</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ ...inputStyle, border: nameError ? '2px solid #D93025' : '1px solid #E5E7EB' }}
            />
            {nameError && (
              <p role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#D93025' }}>⚠ {nameError}</p>
            )}
          </div>

          {/* Vintage field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-vintage" style={labelStyle}>Vintage</label>
            <input
              id="edit-vintage"
              type="number"
              min="1800"
              max="2027"
              value={vintage}
              onChange={e => setVintage(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Varietal field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-varietal" style={labelStyle}>Varietal</label>
            <input
              id="edit-varietal"
              type="text"
              value={varietal}
              onChange={e => setVarietal(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Quantity field — select-all on focus (UX-Mockup Pattern) */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-quantity" style={labelStyle}>Quantity</label>
            <input
              id="edit-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              onFocus={e => e.target.select()}
              style={inputStyle}
            />
          </div>

          {/* Location field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="edit-location" style={labelStyle}>Location</label>
            <input
              id="edit-location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Save Changes button — Pattern A: Gold primary */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '48px',
              background: '#FBCA5C',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Save Changes
          </button>
        </form>

        {/* Delete section — visually separated from Save (UX-Mockup: ≥24px gap + divider) */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
          {/* Delete button — Pattern B: Destructive secondary */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              width: '100%',
              height: '44px',
              background: 'transparent',
              color: '#B91C1C',
              border: '1px solid #B91C1C',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.5 : 1,
              marginBottom: '16px',
            }}
          >
            Delete Bottle
          </button>

          {/* Cancel link — Pattern C: below Delete */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#6B7280',
                textDecoration: 'none',
                minHeight: '44px',
                lineHeight: '28px',
              }}
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```
  </action>
  <verify>
```bash
grep -n "'use client'" app/bottles/\[id\]/edit/page.tsx && echo "CLIENT DIRECTIVE OK"
grep -n 'export default' app/bottles/\[id\]/edit/page.tsx && echo "DEFAULT EXPORT OK"
grep -n 'htmlFor.*edit-name\|htmlFor="name"' app/bottles/\[id\]/edit/page.tsx && echo "NAME LABEL OK"
grep -n 'htmlFor.*edit-vintage\|htmlFor="vintage"' app/bottles/\[id\]/edit/page.tsx && echo "VINTAGE LABEL OK"
grep -n 'htmlFor.*edit-quantity\|htmlFor="quantity"' app/bottles/\[id\]/edit/page.tsx && echo "QUANTITY LABEL OK"
grep -n "onFocus.*select\|selectAll\|e\.target\.select" app/bottles/\[id\]/edit/page.tsx && echo "SELECT-ALL ON FOCUS OK"
grep -n "notFound\|not.*found\|Bottle not found" app/bottles/\[id\]/edit/page.tsx && echo "NOT FOUND STATE OK"
grep -n "window.confirm" app/bottles/\[id\]/edit/page.tsx && echo "WINDOW CONFIRM OK"
grep -n "Delete this bottle" app/bottles/\[id\]/edit/page.tsx && echo "CONFIRM MESSAGE OK"
grep -n "method.*DELETE\|DELETE.*method" app/bottles/\[id\]/edit/page.tsx && echo "DELETE METHOD OK"
grep -n "method.*PUT\|PUT.*method" app/bottles/\[id\]/edit/page.tsx && echo "PUT METHOD OK"
grep -n "router.push" app/bottles/\[id\]/edit/page.tsx && echo "ROUTER PUSH OK"
grep -n "FBCA5C" app/bottles/\[id\]/edit/page.tsx && echo "GOLD SAVE BUTTON OK"
grep -n "B91C1C" app/bottles/\[id\]/edit/page.tsx && echo "RED DELETE BUTTON OK"
grep -n "Name is required" app/bottles/\[id\]/edit/page.tsx && echo "CLIENT VALIDATION OK"
grep -n "Back to My Cellar\|href=\"/\"" app/bottles/\[id\]/edit/page.tsx && echo "BACK LINK OK"
```
  </verify>
  <done>
- `app/bottles/[id]/edit/page.tsx` exists with `'use client'` directive
- Exports default component
- On mount: fetches `GET /api/bottles/[id]`; populates all 5 fields; non-integer id or 404 → not-found state
- Not-found state renders "Bottle not found." message + "Back to My Cellar" link to `/`; no crash
- All five fields have explicit visible `<label htmlFor="...">` elements
- Quantity input has `onFocus={e => e.target.select()}` for instant replacement (UX-Mockup requirement)
- Save button: client validates name non-blank → PUT with all 5 fields → 200 → `router.push('/')`
- Delete button: `type="button"`, fires `window.confirm('Delete this bottle?')`, then DELETE → 204 → `router.push('/')`
- Cancel dialog: no fetch made, user stays on edit page
- Delete error (404): inline banner "This bottle could not be deleted. It may have already been removed."
- Save button: gold `#FBCA5C`, full-width, 48px, disabled during submit
- Delete button: transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px, visually separated from Save by divider
- Cancel is `<a href="/">` below Delete
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

```bash
# Wave 1 contracts still satisfied
grep -n 'SAMEORIGIN' next.config.mjs && echo "IFRAME HEADER OK"

# Wave 2 contracts consumed
grep -n 'export async function POST' app/api/bottles/route.ts && echo "CONTRACT: POST bottles OK"
grep -n 'export async function GET' app/api/bottles/\[id\]/route.ts && echo "CONTRACT: GET bottle OK"
grep -n 'export async function PUT' app/api/bottles/\[id\]/route.ts && echo "CONTRACT: PUT bottle OK"
grep -n 'export async function DELETE' app/api/bottles/\[id\]/route.ts && echo "CONTRACT: DELETE bottle OK"

# Wave 3B provides
grep -n 'export default' app/bottles/new/page.tsx && echo "PLAN 05 PROVIDES: new page OK"
grep -n 'export default' app/bottles/\[id\]/edit/page.tsx && echo "PLAN 05 PROVIDES: edit page OK"

# Client directives
grep -n "'use client'" app/bottles/new/page.tsx && echo "NEW PAGE CLIENT OK"
grep -n "'use client'" app/bottles/\[id\]/edit/page.tsx && echo "EDIT PAGE CLIENT OK"

# All 5 labels on add page
for field in name vintage varietal quantity location; do
  grep -q "htmlFor.*$field" app/bottles/new/page.tsx && echo "ADD LABEL $field: OK" || echo "ADD LABEL $field: MISSING"
done

# Not-found handling
grep -q 'notFound\|Bottle not found' app/bottles/\[id\]/edit/page.tsx && echo "NOT FOUND HANDLING OK"

# Delete confirm
grep -q "window.confirm.*Delete this bottle" app/bottles/\[id\]/edit/page.tsx && echo "DELETE CONFIRM OK"

# Gold buttons
grep -q 'FBCA5C' app/bottles/new/page.tsx && echo "ADD GOLD BUTTON OK"
grep -q 'FBCA5C' app/bottles/\[id\]/edit/page.tsx && echo "EDIT GOLD BUTTON OK"

# Red destructive delete button
grep -q 'B91C1C' app/bottles/\[id\]/edit/page.tsx && echo "DELETE RED BUTTON OK"

# No X-Frame-Options DENY in any component file
grep -r 'X-Frame-Options.*DENY\|frame-ancestors.*none' app/bottles/ 2>/dev/null && echo "WARNING: iframe-blocking header found" || echo "NO IFRAME BLOCKING OK"

# TypeScript compile check (no DB needed)
npx tsc --noEmit 2>&1 | head -20
```
</verification>

<success_criteria>
- `app/bottles/new/page.tsx` is a `'use client'` component with 5 labeled fields, autofocus on Name, default quantity 1, gold Save button, Cancel link
- Add form: blank name → inline "Name is required" (no fetch); valid submit → POST /api/bottles → 201 → router.push('/')
- `app/bottles/[id]/edit/page.tsx` is a `'use client'` component that fetches GET /api/bottles/[id] on mount and pre-populates all 5 fields
- Edit page: non-integer id or 404 → "Bottle not found" + "Back to My Cellar" link; no crash
- Edit form: blank name → inline "Name is required" (no fetch); valid submit → PUT /api/bottles/[id] (all 5 fields) → 200 → router.push('/')
- Quantity input on edit page has `onFocus` select-all behavior
- Delete button: `type="button"`, `window.confirm('Delete this bottle?')` guard, DELETE /api/bottles/[id] → 204 → router.push('/')
- Cancel in confirm dialog: no API call, user stays on edit page
- Delete button: transparent bg, `border: 1px solid #B91C1C`, `color: #B91C1C`, 44px height, visually separated from Save by ≥24px gap + divider
- Gold save buttons: `background: #FBCA5C`, `color: #0A0A0A`, 48px height, full-width
- No `X-Frame-Options: DENY` or `frame-ancestors: none` emitted from any component
- Cancel links are `<a href="/">` plain text links on both pages
</success_criteria>

<output>
After completion, create `.planning/express/cellarlite-full-implementation-next-js-1/05-SUMMARY.md` with:
- What was built (add page, edit page, delete flow)
- File paths created
- Key implementation decisions (client-side validation approach, error state handling, not-found detection)
- Any deviations from spec (flag conflicts, do NOT silently diverge)

Wave 4 (integration) consumes:
- `app/bottles/new/page.tsx` — Add Bottle Client Component (F1 E2E tests)
- `app/bottles/[id]/edit/page.tsx` — Edit/Delete Bottle Client Component (F2/F3 E2E tests)
</output>
