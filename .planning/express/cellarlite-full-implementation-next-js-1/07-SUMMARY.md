---
phase: cellarlite-full-implementation-next-js-1
plan: "07"
subsystem: integration
tags: [integration, verification, uat, wave4, scripts]
dependency_graph:
  requires: ["01", "02", "03", "04", "05", "06"]
  provides: ["working-full-stack-app", "verify-integration-sh", "uat-sh"]
  affects: []
tech_stack:
  added: []
  patterns: [bash-curl-verification, python3-json-parsing]
key_files:
  created:
    - scripts/verify-integration.sh
    - scripts/uat.sh
  modified:
    - app/api/bottles/route.ts
    - app/api/bottles/[id]/route.ts
decisions:
  - "Fixed import paths in app/api/bottles/route.ts from relative (../../lib/db, ../../types/bottle) to alias (@/lib/db, @/types/bottle) — relative paths from app/api/bottles/ resolve to app/lib/db which doesn't exist"
  - "Fixed SQL parameter mismatch in PUT handler: values array was missing location ($5), passing id as the 5th instead of 6th parameter"
  - "Fixed UAT script to use single POST for US2 (was making two identical POSTs causing duplicate Caymus entries and US3 list check to fail)"
  - "Added --max-time 15 to all curl calls to prevent script hanging on Connection: keep-alive responses"
metrics:
  duration: "~30 minutes"
  completed: "2026-06-16"
  tasks_completed: 2
  files_changed: 4
---

# Phase cellarlite-full-implementation-next-js-1 Plan 07: Wave 4 Integration Summary

**One-liner:** Complete wave 4 integration: fixed 2 cross-wave wiring bugs, wrote and verified 16 integration checks + 26 UAT scenarios all passing.

## What Was Built

Wave 4 proves all layers connect correctly. Two bash scripts verify the complete CellarLite application end-to-end:

- `scripts/verify-integration.sh` — 16 automated checks covering F5 (health endpoint, API status codes), F6 (migration idempotency), F7 (iframe-safe headers), F0/F1 (nav link resolution), F2 (non-existent edit page renders)
- `scripts/uat.sh` — 26 UAT scenario checks covering all 6 user stories (US1–US6)

## Cross-Wave Wiring Issues Found and Fixed

### Bug 1 (Rule 1 - Bug Fix): Import path error in app/api/bottles/route.ts
- **Found during:** Task 1 TypeScript audit
- **Issue:** `import pool from '../../lib/db'` and `import type {...} from '../../types/bottle'` use relative paths from `app/api/bottles/` that resolve to `app/lib/db` (which doesn't exist). TSC error: `Cannot find module '../../lib/db'`
- **Fix:** Changed to `@/lib/db` and `@/types/bottle` (alias defined in tsconfig as `"@/*": ["./*"]`)
- **Files modified:** `app/api/bottles/route.ts`
- **Commit:** db5493f

### Bug 2 (Rule 1 - Bug Fix): SQL parameter mismatch in PUT handler
- **Found during:** Task 1 code review of app/api/bottles/[id]/route.ts
- **Issue:** SQL UPDATE uses 6 parameters ($1–$6) but values array only had 5 entries — `location` ($5) was omitted, and `id` was passed as 5th argument instead of 6th. This caused `UPDATE bottles SET location = $5` to be set to the `id` value (a number), silently corrupting location data on every PUT.
- **Fix:** Added `location` to the values array in correct position: `[name, vintage, varietal, quantity, location, id]`
- **Files modified:** `app/api/bottles/[id]/route.ts`
- **Commit:** db5493f

### Bug 3 (Rule 1 - Bug Fix): UAT script duplicate POST causing US3 failure
- **Found during:** Task 2 script execution
- **Issue:** US2 section made TWO identical POST requests (once for `ADD_RESPONSE`, once for `ADD_STATUS`), creating two Caymus bottles. When US3 edited one by ID and then checked the list, the Python check found the OTHER (unedited) Caymus bottle first (newest first ordering), reporting quantity=3 instead of 2. Result: `FAIL US3: List shows quantity=2 after edit`
- **Fix:** Replaced two separate curl calls with a single request using `-w "\nHTTP_STATUS:%{http_code}"` to capture both response body and status code in one request, then parse them with `sed` and `grep`.
- **Files modified:** `scripts/uat.sh`
- **Commit:** e2a35aa

### Deviation (Rule 2 - Robustness): Added curl timeouts to all HTTP calls
- **Found during:** Task 2 script execution (script hung on CSP header grep when curl used Connection: keep-alive)
- **Fix:** Added `--max-time 10/15` to all `curl` calls in both scripts; changed multiple sequential `curl -I` calls to a single `ALL_HEADERS=$(curl -s -I --max-time 10 "$BASE/")` and grep from the captured output.
- **Files modified:** `scripts/verify-integration.sh`, `scripts/uat.sh`

## Integration Check Results

### verify-integration.sh
```
TOTAL:  16 checks
PASSED: 16
FAILED: 0
INTEGRATION: ALL PASSED
```

**Checks covered:**
- F5: Health endpoint returns 200 + `{"status":"ok"}` body
- F7: X-Frame-Options is SAMEORIGIN (not DENY); no `frame-ancestors 'none'` in CSP
- F5: GET /api/bottles returns 200 + valid JSON array
- F5: POST with missing name returns 422 (not 5xx)
- F5: GET /api/bottles/99999999 returns 404 (not 5xx)
- F6: Migration exits 0 on first run; exits 0 on second run (idempotent); prints "Migration complete." both times
- F0/F1: GET / returns 200; GET /bottles/new returns 200
- F2: GET /bottles/99999/edit returns 200 (not-found page, not crash)

### uat.sh
```
TOTAL:  26 checks
PASSED: 26
FAILED: 0
UAT: ALL PASSED
```

**Scenarios covered:**
- US1: GET /api/bottles returns 200 + JSON array; GET / returns 200
- US2: POST creates Caymus 2019 Cabernet Sauvignon qty=3 location=Rack A3 → returns 201 with all fields; appears in list
- US3: GET /api/bottles/{id} returns pre-populated qty=3; PUT changes quantity to 2; list shows qty=2
- US4: DELETE returns 204; bottle absent from GET /api/bottles; GET /api/bottles/{id} returns 404
- US5: GET /api/bottles?q=cay returns Caymus, not Barolo; case-insensitive (CAY matches); empty ?q= returns all
- US6: Added bottle persists in re-fetch + GET by ID returns 200 (PostgreSQL persistence confirmed)

## Remaining Items

All F0–F7 features verified. No known issues. Database has test data from UAT runs (Barolo Riserva + Caymus Special Select) — not cleaned up as they don't affect functionality.

## Self-Check

**Files created:**
- `scripts/verify-integration.sh` ✓ EXISTS
- `scripts/uat.sh` ✓ EXISTS

**Commits:**
- `db5493f` ✓ Cross-wave wiring fixes
- `e2a35aa` ✓ Integration verification and UAT scripts

## Self-Check: PASSED
