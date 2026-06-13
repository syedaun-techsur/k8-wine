---
phase: cellarlite-full-implementation-next-js-1
plan: 07
type: execute
wave: 4
depends_on: [1, 2, 3]
files_modified:
  - scripts/verify-integration.sh
  - scripts/uat.sh
autonomous: true

features:
  implements: ["F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]
  depends_on: ["F6", "F5", "F0", "F1", "F2", "F3", "F4", "F7"]
  enables: []

must_haves:
  truths:
    - "GET /api/health returns 200 {\"status\":\"ok\"}"
    - "Migration is idempotent — running npm run migrate twice exits 0 both times"
    - "All API routes return 2xx on valid requests — no 5xx on happy path"
    - "No X-Frame-Options: DENY or frame-ancestors 'none' in response headers"
    - "All nav links resolve (/ and /bottles/new return 200, not 404)"
    - "US1: GET / shows list with name/vintage/varietal/qty/location; empty state shows 'No bottles yet' + Add button"
    - "US2: Adding bottle name=Caymus, vintage=2019, varietal=Cabernet Sauvignon, qty=3, location=Rack A3 → appears in list"
    - "US3: Editing a bottle — changing quantity 3→2, saving → list shows 2"
    - "US4: Deleting a bottle from edit page → gone from list"
    - "US5: Search by partial name narrows list (ILIKE)"
    - "US6: Data survives page reload (PostgreSQL, not client storage)"
  artifacts:
    - path: "scripts/verify-integration.sh"
      provides: "Automated API + header integration checks"
      contains: "api/health"
    - path: "scripts/uat.sh"
      provides: "Full UAT scenario verification via curl/API calls"
      contains: "Caymus"
  key_links:
    - from: "scripts/verify-integration.sh"
      to: "GET /api/health"
      via: "curl http://localhost:3000/api/health"
      pattern: "api/health"
    - from: "scripts/uat.sh"
      to: "POST /api/bottles"
      via: "curl -X POST http://localhost:3000/api/bottles"
      pattern: "POST.*api/bottles"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "scripts/migrate.mjs"
      exports: ["idempotent migration — exits 0"]
      verify: "grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "next.config.mjs"
      exports: ["headers() — X-Frame-Options: SAMEORIGIN"]
      verify: "grep -n 'SAMEORIGIN' next.config.mjs && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "package.json (scripts)"
      exports: ["migrate", "dev", "start", "build"]
      verify: "node -e \"const p=require('./package.json');console.log(p.scripts.migrate,p.scripts.dev)\" | grep -q 'migrate' && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "app/api/health/route.ts"
      exports: ["GET"]
      verify: "grep -n 'export async function GET' app/api/health/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "app/api/bottles/route.ts"
      exports: ["GET", "POST"]
      verify: "grep -n 'export async function GET' app/api/bottles/route.ts && grep -n 'export async function POST' app/api/bottles/route.ts && echo CONTRACT_OK"
    - from_plan: "03"
      artifact: "app/api/bottles/[id]/route.ts"
      exports: ["GET", "PUT", "DELETE"]
      verify: "grep -n 'export async function GET' 'app/api/bottles/[id]/route.ts' && grep -n 'export async function PUT' 'app/api/bottles/[id]/route.ts' && grep -n 'export async function DELETE' 'app/api/bottles/[id]/route.ts' && echo CONTRACT_OK"
  provides:
    - artifact: "CellarLite app running on port 3000"
      exports: ["working full-stack application — all F0-F7 features verified"]
      shape: |
        npm run dev starts app on 0.0.0.0:3000
        All 6 UAT scenarios pass via API verification
        No 5xx on any valid request
        Migration idempotent (runs twice, exits 0 both times)
        X-Frame-Options: SAMEORIGIN (not DENY)
      verify: "curl -s http://localhost:3000/api/health | grep -q 'ok' && echo CONTRACT_OK"
    - artifact: "scripts/verify-integration.sh"
      exports: ["runnable integration check script"]
      shape: "bash script — exits 0 when all checks pass, 1 on any failure"
      verify: "ls scripts/verify-integration.sh && echo CONTRACT_OK"
    - artifact: "scripts/uat.sh"
      exports: ["runnable UAT scenario script"]
      shape: "bash script — exercises all 6 UAT scenarios via API calls"
      verify: "ls scripts/uat.sh && echo CONTRACT_OK"
---

<objective>
Wave 4 integration: verify the complete CellarLite application end-to-end, fix any cross-wave wiring issues, and produce two runnable verification scripts that validate all 6 UAT scenarios plus infrastructure/API checks.

Purpose: Waves 1-3 built each layer independently. Wave 4 proves the layers connect correctly — the database is reachable, the API returns correct status codes and shapes, the UI pages resolve, and the critical non-functional requirements (iframe-safe headers, migration idempotency, search persistence) hold true. Any cross-wave wiring bugs discovered during wave 4 are fixed here before the final app is considered shippable.

Output:
- `scripts/verify-integration.sh` — checks health endpoint, response headers, API status codes, migration idempotency, nav link resolution
- `scripts/uat.sh` — exercises all 6 UAT scenarios end-to-end via curl API calls and prints PASS/FAIL per scenario
- All cross-wave wiring fixes applied (import paths, missing directories, TypeScript errors, etc.)
</objective>

<feature_dependencies>
Implements: F0: Bottle List Page (US1, US5, US6 verification), F1: Add Bottle (US2 verification), F2: Edit Bottle (US3 verification), F3: Delete Bottle (US4 verification), F4: Search/Filter (US5 verification), F5: REST API (all API endpoint checks), F6: Database Auto-Migration (idempotency check, persistence check), F7: Brand & Mobile-First UI (iframe header check, no 5xx check)
Depends on: All waves 1-3 artifacts
Enables: None (terminal integration wave)
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Cross-wave wiring audit and fix</name>
  <files>
    app/page.tsx
    app/api/bottles/route.ts
    app/api/bottles/[id]/route.ts
    app/bottles/new/page.tsx
    app/bottles/[id]/edit/page.tsx
    app/layout.tsx
    lib/db.ts
    scripts/migrate.mjs
    next.config.mjs
    package.json
  </files>
  <action>
Audit all cross-wave wiring points and fix any issues found. This task checks that every import path, API URL, and configuration value is correct before writing the verification scripts.

**Step 1 — Verify the project compiles and dependencies are installed:**

```bash
# Check node_modules exist; if not, install
ls node_modules/next 2>/dev/null || npm install

# TypeScript compilation check (catches import path errors before runtime)
npx tsc --noEmit 2>&1 | head -40
```

If `tsc --noEmit` reports errors, fix them. Common wiring issues to look for and fix:

**Import path issues (most likely cross-wave wiring failures):**

1. `app/page.tsx` imports `pool` — verify the path resolves:
   - Should be `import pool from '@/lib/db'` (tsconfig has `"@/*": ["./*"]`)
   - If `@/` alias not working, fall back to `import pool from '../lib/db'`

2. `app/page.tsx` imports `SearchInput` — verify:
   - Should be `import SearchInput from '@/app/components/SearchInput'` OR `import SearchInput from './components/SearchInput'`
   - The correct relative path from `app/page.tsx` to `app/components/SearchInput.tsx` is `'./components/SearchInput'`

3. `app/api/bottles/route.ts` imports pool — verify:
   - Should be `import pool from '../../lib/db'` (from `app/api/bottles/` → two levels up)
   - OR `import pool from '@/lib/db'`

4. `app/api/bottles/[id]/route.ts` imports pool — verify:
   - Should be `import pool from '@/lib/db'` OR `import pool from '../../../lib/db'`

**Check for missing directories:**
```bash
# Verify all required directories exist
ls app/api/health/ 2>/dev/null || echo "MISSING: app/api/health/"
ls app/api/bottles/ 2>/dev/null || echo "MISSING: app/api/bottles/"
ls "app/api/bottles/[id]/" 2>/dev/null || echo "MISSING: app/api/bottles/[id]/"
ls app/bottles/new/ 2>/dev/null || echo "MISSING: app/bottles/new/"
ls "app/bottles/[id]/edit/" 2>/dev/null || echo "MISSING: app/bottles/[id]/edit/"
ls app/components/ 2>/dev/null || echo "MISSING: app/components/"
ls lib/ 2>/dev/null || echo "MISSING: lib/"
ls scripts/ 2>/dev/null || echo "MISSING: scripts/"
ls styles/ 2>/dev/null || echo "MISSING: styles/"
ls types/ 2>/dev/null || echo "MISSING: types/"
```

If any directory is missing, the corresponding wave's task failed to complete. Fix by creating the directory and the file within it per the specification in the prior plan.

**Check for duplicate layout.tsx (plans 04 and 06 both write it):**
```bash
# The layout should exist and have nav__brand + nav__add classes (from plan 06)
grep -n 'nav__brand\|nav__add\|RootLayout' app/layout.tsx 2>/dev/null | head -5
```

If `app/layout.tsx` uses inline styles (from plan 04's approach) rather than CSS classes (from plan 06's approach), the plan 06 version is canonical — ensure the class-based version is in place.

**Check globals.css import path in layout.tsx:**
```bash
grep -n "globals.css" app/layout.tsx
```
- Plan 06 specifies: `import '../styles/globals.css'` (relative from `app/`)
- Plan 04 specifies: `import '@/styles/globals.css'` (alias)
- Both work if tsconfig `@/*` alias is set. If TSC errors on `@/styles/globals.css`, use the relative path.

**Check next.config.mjs does NOT emit DENY:**
```bash
grep 'DENY' next.config.mjs && echo "ERROR: DENY found — must change to SAMEORIGIN" || echo "OK: no DENY"
grep 'SAMEORIGIN' next.config.mjs && echo "OK: SAMEORIGIN present" || echo "ERROR: SAMEORIGIN missing"
```

If `DENY` is found, edit `next.config.mjs` to replace `DENY` with `SAMEORIGIN`.

**Check package.json scripts are exact:**
```bash
node -e "
  const p = require('./package.json');
  const checks = [
    ['migrate', 'node scripts/migrate.mjs'],
    ['dev', 'npm run migrate && next dev -p 3000'],
    ['start', 'npm run migrate && next start -p 3000'],
    ['build', 'next build']
  ];
  checks.forEach(([k, v]) => {
    const ok = p.scripts[k] === v;
    console.log(ok ? 'OK' : 'WRONG', k + ':', p.scripts[k]);
  });
"
```

Fix any wrong script values by editing `package.json`.

**Check migration script exits 1 when DATABASE_URL not set:**
```bash
node scripts/migrate.mjs 2>&1; echo "Exit code: $?"
```
Should print an error mentioning DATABASE_URL and exit code 1.

**Check `lib/db.ts` pool export:**
```bash
grep -n 'export default pool' lib/db.ts && echo "OK" || echo "MISSING pool default export"
```

**Check `app/api/health/route.ts` has no DB import:**
```bash
grep 'pool\|lib/db' app/api/health/route.ts 2>/dev/null && echo "WARNING: DB import in health — remove it" || echo "OK: no DB in health"
```

**Fix 1: SearchInput import path in app/page.tsx**

The correct import path from `app/page.tsx` for the SearchInput component is:
```typescript
import SearchInput from './components/SearchInput';
```
If it currently uses `@/app/components/SearchInput`, that also works but can cause issues. The safest path is the relative one. Check and fix if needed.

**Fix 2: styles/globals.css may be written twice (plans 04 and 06)**

Plan 04 and Plan 06 both write `styles/globals.css`. The plan 06 version is the canonical one (uses BEM-style class names like `.nav`, `.nav__brand`, `.bottle-row__name`). Plan 04 uses different class names (`.nav-logo`, `.bottle-name`). 

Check which version is in place:
```bash
grep -n 'nav__brand\|nav-logo' styles/globals.css | head -3
```

`app/layout.tsx` (plan 06) uses `.nav__brand` and `.nav__add`. If `globals.css` only has `.nav-logo` (plan 04 version), there is a CSS class mismatch. Resolution:

- If `app/layout.tsx` uses `.nav__brand`: ensure `styles/globals.css` defines `.nav__brand`
- If `app/layout.tsx` uses `.nav-logo`: ensure `styles/globals.css` defines `.nav-logo`
- The two files must be consistent. If there is a mismatch, update `styles/globals.css` to match the class names used in `app/layout.tsx`.

**Fix 3: app/page.tsx uses `.bottle-row` and `.bottle-name` / `.bottle-meta` — ensure CSS classes match**

Check:
```bash
grep -n 'className.*bottle' app/page.tsx | head -5
grep -n '\.bottle-row\|\.bottle-name\|\.bottle-meta\|\.bottle-row__name\|\.bottle-row__meta' styles/globals.css | head -5
```

If `app/page.tsx` uses `.bottle-name` but `globals.css` only defines `.bottle-row__name`, either:
- Add `.bottle-name` to `globals.css` as an alias
- Or update `app/page.tsx` to use `.bottle-row__name`

The simplest fix: add to end of `styles/globals.css`:
```css
/* Aliases for page.tsx compatibility */
.bottle-name { font-size: 16px; font-weight: 700; color: var(--color-text); display: block; margin-bottom: 2px; }
.bottle-meta { font-size: 13px; color: var(--color-muted); display: block; }
```

**After all fixes, run TSC again to confirm no errors:**
```bash
npx tsc --noEmit 2>&1 | head -20 && echo "TSC CLEAN"
```
  </action>
  <verify>
```bash
# 1. TypeScript compiles cleanly
npx tsc --noEmit 2>&1 | grep -c 'error TS' | grep -q '^0$' && echo "TSC: 0 errors" || echo "TSC ERRORS: $(npx tsc --noEmit 2>&1 | grep -c 'error TS')"

# 2. All required files exist
for f in \
  "scripts/migrate.mjs" \
  "lib/db.ts" \
  "next.config.mjs" \
  "package.json" \
  "app/layout.tsx" \
  "styles/globals.css" \
  "app/page.tsx" \
  "app/components/SearchInput.tsx" \
  "app/api/health/route.ts" \
  "app/api/bottles/route.ts" \
  "app/api/bottles/[id]/route.ts" \
  "app/bottles/new/page.tsx" \
  "app/bottles/[id]/edit/page.tsx" \
  "types/bottle.ts"; do
  ls "$f" 2>/dev/null && echo "EXISTS: $f" || echo "MISSING: $f"
done

# 3. iframe-safe header
grep -n 'SAMEORIGIN' next.config.mjs && echo "IFRAME HEADER OK"
grep 'DENY' next.config.mjs && echo "ERROR: DENY found" || echo "NO DENY OK"

# 4. No DB import in health route
grep 'pool\|lib/db' app/api/health/route.ts 2>/dev/null && echo "WARNING: DB in health" || echo "HEALTH ROUTE DB-FREE OK"

# 5. Migration script exits 1 without DATABASE_URL
node scripts/migrate.mjs 2>&1 | grep -q 'DATABASE_URL' && echo "MIGRATE ENV GUARD OK" || echo "WARNING: migrate env guard may be missing"

# 6. Pool default export present
grep -n 'export default pool' lib/db.ts && echo "POOL EXPORT OK"

# 7. Package.json scripts exact
node -e "const p=require('./package.json'); const ok=p.scripts.migrate==='node scripts/migrate.mjs' && p.scripts.dev==='npm run migrate && next dev -p 3000'; console.log('SCRIPTS OK:', ok)"
```
  </verify>
  <done>
- TypeScript compiles with 0 errors (`npx tsc --noEmit` exits clean)
- All 14 required source files exist at their canonical paths
- `next.config.mjs` has `SAMEORIGIN` and no `DENY`
- `app/api/health/route.ts` has no database import
- `scripts/migrate.mjs` exits 1 and prints DATABASE_URL error when run without the env var
- `lib/db.ts` exports default pg.Pool
- `package.json` scripts are exactly: migrate=`node scripts/migrate.mjs`, dev=`npm run migrate && next dev -p 3000`, start=`npm run migrate && next start -p 3000`, build=`next build`
- CSS classes used in `app/layout.tsx` and `app/page.tsx` are defined in `styles/globals.css` (no broken class references)
  </done>
</task>

<task type="auto">
  <name>Task 2: Write and run integration verification and UAT scripts</name>
  <files>
    scripts/verify-integration.sh
    scripts/uat.sh
  </files>
  <action>
Write two bash scripts that verify all integration requirements. Then **run them against the live app** (which must be started if not already running).

---

### Step 1 — Write `scripts/verify-integration.sh`

This script checks non-functional requirements that do not require browser interaction: API response codes, response headers, migration idempotency, and nav link resolution.

```bash
#!/usr/bin/env bash
# scripts/verify-integration.sh
# CellarLite Wave 4 Integration Checks
# Run: bash scripts/verify-integration.sh
# Requires: app running at http://localhost:3000 (npm run dev in background)
# Exit 0 = all checks passed; Exit 1 = one or more failures

set -euo pipefail

BASE="http://localhost:3000"
PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== CellarLite Integration Checks ==="
echo ""

# ── F5: Health endpoint ──────────────────────────────────────────────────────
echo "[ F5: Health Endpoint ]"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/health")
HEALTH_BODY=$(curl -s "$BASE/api/health")
check "GET /api/health returns 200" "$([ "$HEALTH_STATUS" = "200" ] && echo true || echo false)"
check "GET /api/health body is {\"status\":\"ok\"}" "$(echo "$HEALTH_BODY" | grep -q '"status".*"ok"' && echo true || echo false)"
echo ""

# ── F7: No iframe-blocking headers ──────────────────────────────────────────
echo "[ F7: Iframe-Safe Headers ]"
FRAME_HEADER=$(curl -s -I "$BASE/" | grep -i 'x-frame-options' | tr -d '\r')
check "X-Frame-Options is not DENY" "$(echo "$FRAME_HEADER" | grep -qi 'DENY' && echo false || echo true)"
check "X-Frame-Options is SAMEORIGIN or absent" "$(echo "$FRAME_HEADER" | grep -qi 'SAMEORIGIN\|^$' && echo true || echo false)"
CSP_HEADER=$(curl -s -I "$BASE/" | grep -i 'content-security-policy' | tr -d '\r')
check "No frame-ancestors 'none' in CSP" "$(echo "$CSP_HEADER" | grep -qi "frame-ancestors.*none" && echo false || echo true)"
echo ""

# ── F5: No 5xx on valid API requests ────────────────────────────────────────
echo "[ F5: No 5xx on Valid Requests ]"
LIST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles")
check "GET /api/bottles returns 2xx" "$(echo "$LIST_STATUS" | grep -qE '^2' && echo true || echo false)"
check "GET /api/bottles returns valid JSON array" "$(curl -s "$BASE/api/bottles" | grep -qE '^\[' && echo true || echo false)"

# Test POST with missing name returns 422 (not 5xx)
MISSING_NAME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"vintage":2020}' \
  "$BASE/api/bottles")
check "POST /api/bottles missing name returns 422 (not 5xx)" "$([ "$MISSING_NAME_STATUS" = "422" ] && echo true || echo false)"

# Test GET non-existent bottle returns 404 (not 5xx)
NOT_FOUND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles/99999999")
check "GET /api/bottles/99999999 returns 404 (not 5xx)" "$([ "$NOT_FOUND_STATUS" = "404" ] && echo true || echo false)"
echo ""

# ── F6: Migration idempotency ────────────────────────────────────────────────
echo "[ F6: Migration Idempotency ]"
# Run migrate twice — must exit 0 both times and print "Migration complete."
MIGRATE_OUT1=$(DATABASE_URL="${DATABASE_URL:-postgres://postgres:devpass@localhost:5432/app}" node scripts/migrate.mjs 2>&1)
EXIT1=$?
MIGRATE_OUT2=$(DATABASE_URL="${DATABASE_URL:-postgres://postgres:devpass@localhost:5432/app}" node scripts/migrate.mjs 2>&1)
EXIT2=$?
check "npm run migrate exits 0 on first run" "$([ $EXIT1 -eq 0 ] && echo true || echo false)"
check "npm run migrate exits 0 on second run (idempotent)" "$([ $EXIT2 -eq 0 ] && echo true || echo false)"
check "First migration prints 'Migration complete.'" "$(echo "$MIGRATE_OUT1" | grep -q 'Migration complete' && echo true || echo false)"
check "Second migration prints 'Migration complete.'" "$(echo "$MIGRATE_OUT2" | grep -q 'Migration complete' && echo true || echo false)"
echo ""

# ── F0: Nav links resolve ────────────────────────────────────────────────────
echo "[ F0/F1: Nav Links — No 404 ]"
ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
NEW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/bottles/new")
check "GET / returns 200" "$([ "$ROOT_STATUS" = "200" ] && echo true || echo false)"
check "GET /bottles/new returns 200" "$([ "$NEW_STATUS" = "200" ] && echo true || echo false)"
echo ""

# ── F2: Non-existent edit page ───────────────────────────────────────────────
echo "[ F2: Non-Existent Bottle Edit Page ]"
NOTFOUND_EDIT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/bottles/99999/edit")
check "GET /bottles/99999/edit returns 200 (not-found page, not crash)" "$([ "$NOTFOUND_EDIT" = "200" ] && echo true || echo false)"
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "=================================="
echo "TOTAL:  $((PASS + FAIL)) checks"
echo "PASSED: $PASS"
echo "FAILED: $FAIL"
echo "=================================="

if [ $FAIL -gt 0 ]; then
  echo "INTEGRATION: FAILED ($FAIL failures)"
  exit 1
else
  echo "INTEGRATION: ALL PASSED"
  exit 0
fi
```

---

### Step 2 — Write `scripts/uat.sh`

This script exercises all 6 UAT scenarios end-to-end via the REST API. It verifies F0–F6 from the user's perspective.

```bash
#!/usr/bin/env bash
# scripts/uat.sh
# CellarLite Wave 4 UAT Scenario Verification
# Run: bash scripts/uat.sh
# Requires: app running at http://localhost:3000 (npm run dev in background)
# Covers: US1–US6 from RTM §5.4 UAT Scenario Mapping
# Exit 0 = all UAT passed; Exit 1 = one or more failures

set -euo pipefail

BASE="http://localhost:3000"
PASS=0
FAIL=0

uat_check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== CellarLite UAT Scenarios ==="
echo ""

# ── US1: View cellar ─────────────────────────────────────────────────────────
echo "[ US1: View Cellar ]"
LIST_RESPONSE=$(curl -s "$BASE/api/bottles")
LIST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles")
uat_check "US1: GET /api/bottles returns 200" "$([ "$LIST_STATUS" = "200" ] && echo true || echo false)"
uat_check "US1: Response is a JSON array" "$(echo "$LIST_RESPONSE" | grep -qE '^\[' && echo true || echo false)"

# Verify empty state works — list page renders 200 whether bottles exist or not
ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
uat_check "US1: GET / returns 200 (list page renders)" "$([ "$ROOT_STATUS" = "200" ] && echo true || echo false)"

# Empty state: if no bottles in DB, list should be empty array
BOTTLE_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "  INFO  Current bottle count: $BOTTLE_COUNT"
echo ""

# ── US2: Add a bottle ────────────────────────────────────────────────────────
echo "[ US2: Add Bottle — Caymus 2019 ]"
ADD_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":3,"location":"Rack A3"}' \
  "$BASE/api/bottles")
ADD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":3,"location":"Rack A3"}' \
  "$BASE/api/bottles")

# Extract the ID of the created bottle for subsequent tests
BOTTLE_ID=$(echo "$ADD_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

uat_check "US2: POST /api/bottles returns 201" "$([ "$ADD_STATUS" = "201" ] && echo true || echo false)"
uat_check "US2: Response contains name=Caymus" "$(echo "$ADD_RESPONSE" | grep -q '"Caymus"' && echo true || echo false)"
uat_check "US2: Response contains vintage=2019" "$(echo "$ADD_RESPONSE" | grep -q '2019' && echo true || echo false)"
uat_check "US2: Response contains varietal=Cabernet Sauvignon" "$(echo "$ADD_RESPONSE" | grep -q 'Cabernet Sauvignon' && echo true || echo false)"
uat_check "US2: Response contains quantity=3" "$(echo "$ADD_RESPONSE" | grep -q '"quantity":3\|"quantity": 3' && echo true || echo false)"
uat_check "US2: Response contains location=Rack A3" "$(echo "$ADD_RESPONSE" | grep -q 'Rack A3' && echo true || echo false)"
uat_check "US2: Response has id field" "$([ -n "$BOTTLE_ID" ] && echo true || echo false)"

# Verify bottle now appears in list
AFTER_ADD_LIST=$(curl -s "$BASE/api/bottles")
uat_check "US2: Bottle appears in GET /api/bottles after POST" "$(echo "$AFTER_ADD_LIST" | grep -q '"Caymus"' && echo true || echo false)"
echo "  INFO  Created bottle ID: $BOTTLE_ID"
echo ""

# ── US3: Edit bottle — change quantity 3→2 ───────────────────────────────────
echo "[ US3: Edit Bottle — quantity 3→2 ]"
if [ -n "$BOTTLE_ID" ]; then
  # First, verify pre-populated data is retrievable
  GET_BOTTLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles/$BOTTLE_ID")
  GET_BOTTLE=$(curl -s "$BASE/api/bottles/$BOTTLE_ID")
  uat_check "US3: GET /api/bottles/$BOTTLE_ID returns 200 (pre-populate data)" "$([ "$GET_BOTTLE_STATUS" = "200" ] && echo true || echo false)"
  uat_check "US3: Pre-populated quantity is 3" "$(echo "$GET_BOTTLE" | grep -q '"quantity":3\|"quantity": 3' && echo true || echo false)"

  # Save with quantity changed to 2 (PUT — full replacement)
  PUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
    -H "Content-Type: application/json" \
    -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":2,"location":"Rack A3"}' \
    "$BASE/api/bottles/$BOTTLE_ID")
  PUT_RESPONSE=$(curl -s -X PUT \
    -H "Content-Type: application/json" \
    -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":2,"location":"Rack A3"}' \
    "$BASE/api/bottles/$BOTTLE_ID")
  uat_check "US3: PUT /api/bottles/$BOTTLE_ID returns 200" "$([ "$PUT_STATUS" = "200" ] && echo true || echo false)"
  uat_check "US3: Updated quantity is 2 in PUT response" "$(echo "$PUT_RESPONSE" | grep -q '"quantity":2\|"quantity": 2' && echo true || echo false)"

  # Verify quantity 2 appears in list
  AFTER_EDIT_LIST=$(curl -s "$BASE/api/bottles")
  uat_check "US3: List shows quantity=2 after edit" "$(echo "$AFTER_EDIT_LIST" | python3 -c "
import sys, json
bottles = json.load(sys.stdin)
caymus = [b for b in bottles if b.get('name') == 'Caymus']
print('true' if caymus and caymus[0].get('quantity') == 2 else 'false')
" 2>/dev/null || echo "false")"
else
  echo "  SKIP  US3: No bottle ID available (US2 POST failed)"
fi
echo ""

# ── US4: Delete bottle ───────────────────────────────────────────────────────
echo "[ US4: Delete Bottle — confirm → gone from list ]"
if [ -n "$BOTTLE_ID" ]; then
  # window.confirm is browser-only; test via API (DELETE directly)
  DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/bottles/$BOTTLE_ID")
  uat_check "US4: DELETE /api/bottles/$BOTTLE_ID returns 204" "$([ "$DELETE_STATUS" = "204" ] && echo true || echo false)"

  # Verify deleted bottle is gone from list
  AFTER_DELETE_LIST=$(curl -s "$BASE/api/bottles")
  uat_check "US4: Deleted bottle absent from GET /api/bottles" "$(echo "$AFTER_DELETE_LIST" | python3 -c "
import sys, json
bottles = json.load(sys.stdin)
caymus = [b for b in bottles if b.get('id') == $BOTTLE_ID]
print('true' if not caymus else 'false')
" 2>/dev/null || echo "false")"

  # Verify 404 on subsequent GET
  AFTER_DELETE_GET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles/$BOTTLE_ID")
  uat_check "US4: GET /api/bottles/$BOTTLE_ID returns 404 after delete" "$([ "$AFTER_DELETE_GET" = "404" ] && echo true || echo false)"
else
  echo "  SKIP  US4: No bottle ID available (US2 POST failed)"
fi
echo ""

# ── US5: Search — partial name narrows list ──────────────────────────────────
echo "[ US5: Search — partial name filter ]"
# Add a fresh bottle for search testing
SEARCH_ADD=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Caymus Special Select","vintage":2018,"varietal":"Cabernet Sauvignon","quantity":1}' \
  "$BASE/api/bottles")
SEARCH_BOTTLE_ID=$(echo "$SEARCH_ADD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

# Also add a non-matching bottle
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Barolo Riserva","vintage":2016,"varietal":"Nebbiolo","quantity":2}' \
  "$BASE/api/bottles" > /dev/null

# Search by partial name "cay" (case-insensitive)
SEARCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles?q=cay")
SEARCH_RESPONSE=$(curl -s "$BASE/api/bottles?q=cay")
uat_check "US5: GET /api/bottles?q=cay returns 200" "$([ "$SEARCH_STATUS" = "200" ] && echo true || echo false)"
uat_check "US5: Search results contain 'Caymus'" "$(echo "$SEARCH_RESPONSE" | grep -qi 'caymus' && echo true || echo false)"
uat_check "US5: Search results do NOT contain 'Barolo'" "$(echo "$SEARCH_RESPONSE" | grep -qi 'barolo' && echo false || echo true)"

# Case-insensitive: uppercase "CAY"
SEARCH_UPPER=$(curl -s "$BASE/api/bottles?q=CAY")
uat_check "US5: Search is case-insensitive (CAY matches Caymus)" "$(echo "$SEARCH_UPPER" | grep -qi 'caymus' && echo true || echo false)"

# Empty search restores full list
SEARCH_EMPTY=$(curl -s "$BASE/api/bottles?q=")
SEARCH_EMPTY_COUNT=$(echo "$SEARCH_EMPTY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
uat_check "US5: Empty ?q= returns all bottles" "$([ "$SEARCH_EMPTY_COUNT" -gt 0 ] && echo true || echo false)"

# Clean up search test bottles
[ -n "$SEARCH_BOTTLE_ID" ] && curl -s -X DELETE "$BASE/api/bottles/$SEARCH_BOTTLE_ID" > /dev/null || true
echo ""

# ── US6: Persistence — data survives page reload ──────────────────────────────
echo "[ US6: Persistence — data survives reload ]"
# Add a bottle, then re-fetch the list to verify it's in PostgreSQL (not ephemeral)
PERSIST_ADD=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Persistence Test Bottle","vintage":2020,"varietal":"Pinot Noir","quantity":1}' \
  "$BASE/api/bottles")
PERSIST_ID=$(echo "$PERSIST_ADD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

# Re-fetch list (simulates page reload)
PERSIST_LIST=$(curl -s "$BASE/api/bottles")
uat_check "US6: Bottle persists in GET /api/bottles (survives re-fetch)" "$(echo "$PERSIST_LIST" | grep -q 'Persistence Test Bottle' && echo true || echo false)"

# Re-fetch single bottle by ID
if [ -n "$PERSIST_ID" ]; then
  PERSIST_GET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/bottles/$PERSIST_ID")
  uat_check "US6: GET /api/bottles/$PERSIST_ID still returns 200 (PostgreSQL persisted)" "$([ "$PERSIST_GET" = "200" ] && echo true || echo false)"
  # Clean up
  curl -s -X DELETE "$BASE/api/bottles/$PERSIST_ID" > /dev/null || true
fi
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "=================================="
echo "TOTAL:  $((PASS + FAIL)) checks"
echo "PASSED: $PASS"
echo "FAILED: $FAIL"
echo "=================================="

if [ $FAIL -gt 0 ]; then
  echo "UAT: FAILED ($FAIL failures)"
  exit 1
else
  echo "UAT: ALL PASSED"
  exit 0
fi
```

---

### Step 3 — Make scripts executable and run them

**First, start the app if not already running:**

Check if app is running:
```bash
curl -s http://localhost:3000/api/health 2>/dev/null | grep -q 'ok' && echo "APP ALREADY RUNNING" || echo "APP NOT RUNNING — need to start"
```

If the app is NOT running, start it in the background:
```bash
# Start app in background (migrate + next dev)
DATABASE_URL="postgres://postgres:devpass@localhost:5432/app" npm run dev &
APP_PID=$!
echo "App PID: $APP_PID"
# Wait for it to be ready (up to 60 seconds)
for i in $(seq 1 30); do
  curl -s http://localhost:3000/api/health 2>/dev/null | grep -q 'ok' && echo "APP READY" && break
  echo "Waiting for app... ($i/30)"
  sleep 2
done
```

**Then run the verification scripts:**

```bash
chmod +x scripts/verify-integration.sh scripts/uat.sh

# Run integration checks
echo "=== Running Integration Verification ==="
bash scripts/verify-integration.sh

# Run UAT scenarios
echo ""
echo "=== Running UAT Scenarios ==="
bash scripts/uat.sh
```

**If any checks fail, diagnose and fix:**

Common failures and fixes:

1. **Health endpoint 5xx** — app failed to start; check npm run dev output for errors
2. **Migration fails** — PostgreSQL not ready; check `psql $DATABASE_URL -c '\l'`
3. **POST /api/bottles returns 500** — check that `lib/db.ts` pool uses correct DATABASE_URL
4. **X-Frame-Options: DENY** — fix `next.config.mjs` to use SAMEORIGIN
5. **GET / returns 404** — `app/page.tsx` or `app/layout.tsx` missing; check wave 3 files
6. **Search returns 5xx** — check `app/api/bottles/route.ts` ILIKE query and pool import
7. **TSC errors on imports** — fix import paths per Task 1 instructions

After fixing any issue, re-run the failing script to confirm resolution.
  </action>
  <verify>
```bash
# Scripts exist and are executable
ls scripts/verify-integration.sh && echo "VERIFY SCRIPT EXISTS"
ls scripts/uat.sh && echo "UAT SCRIPT EXISTS"

# Scripts contain required checks
grep -q 'api/health' scripts/verify-integration.sh && echo "HEALTH CHECK PRESENT"
grep -q 'SAMEORIGIN\|DENY\|X-Frame' scripts/verify-integration.sh && echo "HEADER CHECK PRESENT"
grep -q 'idempotent\|migrate.*twice\|EXIT2' scripts/verify-integration.sh && echo "IDEMPOTENCY CHECK PRESENT"
grep -q 'Caymus' scripts/uat.sh && echo "US2 CAYMUS CHECK PRESENT"
grep -q 'quantity.*2\|US3' scripts/uat.sh && echo "US3 QUANTITY EDIT PRESENT"
grep -q 'DELETE\|US4' scripts/uat.sh && echo "US4 DELETE CHECK PRESENT"
grep -q 'q=cay\|US5' scripts/uat.sh && echo "US5 SEARCH CHECK PRESENT"
grep -q 'Persistence\|US6' scripts/uat.sh && echo "US6 PERSISTENCE CHECK PRESENT"

# Run integration verification (app must be running)
echo ""
echo "--- Running Integration Verification ---"
bash scripts/verify-integration.sh && echo "INTEGRATION: ALL PASSED" || echo "INTEGRATION: SOME FAILURES (see output above)"

# Run UAT scenarios (app must be running)
echo ""
echo "--- Running UAT Scenarios ---"
bash scripts/uat.sh && echo "UAT: ALL PASSED" || echo "UAT: SOME FAILURES (see output above)"
```
  </verify>
  <done>
- `scripts/verify-integration.sh` exists and covers: health endpoint (200 + body), iframe-safe headers (no DENY, no frame-ancestors 'none'), no 5xx on valid API requests, migration idempotency (runs twice, exits 0 both times), nav link resolution (/ and /bottles/new return 200), non-existent edit page returns 200 (not-found rendering)
- `scripts/uat.sh` exists and covers all 6 UAT scenarios:
  - US1: GET /api/bottles returns 200 + JSON array; GET / returns 200
  - US2: POST creates Caymus 2019 Cabernet Sauvignon qty=3 location=Rack A3; appears in list
  - US3: PUT changes quantity 3→2; list reflects new quantity
  - US4: DELETE removes bottle; absent from subsequent GET /api/bottles; 404 on single fetch
  - US5: GET /api/bottles?q=cay returns only matching bottles (Caymus); case-insensitive; empty q returns all
  - US6: Bottle persists in re-fetch (PostgreSQL, not ephemeral)
- Both scripts are runnable and produce PASS/FAIL output per check
- If app is running: both scripts exit 0 (all checks pass)
  </done>
</task>

</tasks>

<verification>
Final integration state — all requirements from the constraints list:

```bash
# 1. Health endpoint
curl -s http://localhost:3000/api/health | grep -q '"status":"ok"' && echo "HEALTH OK"

# 2. Migration idempotency
DATABASE_URL="postgres://postgres:devpass@localhost:5432/app" node scripts/migrate.mjs && \
DATABASE_URL="postgres://postgres:devpass@localhost:5432/app" node scripts/migrate.mjs && \
echo "MIGRATION IDEMPOTENT OK"

# 3. No 5xx on valid API requests
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bottles | grep -q '200' && echo "GET BOTTLES 200 OK"

# 4. No iframe-blocking headers
curl -s -I http://localhost:3000/ | grep -i 'x-frame-options' | grep -qi 'DENY' && echo "ERROR: DENY header" || echo "NO DENY HEADER OK"

# 5. Nav links resolve
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q '200' && echo "/ OK"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bottles/new | grep -q '200' && echo "/bottles/new OK"

# 6. Run full UAT scenarios
bash scripts/uat.sh

# 7. Run full integration checks
bash scripts/verify-integration.sh
```
</verification>

<success_criteria>
Integration wave complete when all of the following are true:

**Infrastructure (F6):**
- `npm run migrate` exits 0 and prints "Migration complete." on first run
- `npm run migrate` exits 0 on second run — idempotent
- `npm run migrate` (without DATABASE_URL) exits 1 and prints error mentioning DATABASE_URL

**API (F5):**
- `GET /api/health` → `200 {"status":"ok"}` within 200ms
- `GET /api/bottles` → `200` with JSON array
- `POST /api/bottles` with valid body → `201` with created record
- `POST /api/bottles` with missing name → `422 {"error":"Name is required"}`
- `GET /api/bottles/99999` → `404 {"error":"Not found"}`
- `PUT /api/bottles/[id]` with valid body → `200` with updated record
- `DELETE /api/bottles/[id]` → `204` empty body

**UI pages (F0–F3):**
- `GET /` → `200` (list page renders server-side)
- `GET /bottles/new` → `200` (add form renders)
- `GET /bottles/[id]/edit` → `200` (edit form renders, pre-populated)
- `GET /bottles/99999/edit` → `200` (not-found state, no crash)

**Headers (F7):**
- `X-Frame-Options` is `SAMEORIGIN` or absent — never `DENY`
- No `Content-Security-Policy: frame-ancestors 'none'`

**UAT Scenarios (all 6 pass):**
- US1: View cellar — list + empty state
- US2: Add Caymus 2019 → appears in list
- US3: Edit quantity 3→2 → list shows 2
- US4: Delete bottle → gone from list
- US5: Search "cay" → Caymus shown; Barolo not shown; case-insensitive
- US6: Data survives re-fetch (PostgreSQL persistence)

**Scripts:**
- `bash scripts/verify-integration.sh` exits 0 (all checks pass)
- `bash scripts/uat.sh` exits 0 (all UAT scenarios pass)
</success_criteria>

<output>
After completion, create `.planning/express/cellarlite-full-implementation-next-js-1/07-SUMMARY.md` with:
- Integration check results (pass/fail counts from both scripts)
- Any cross-wave wiring issues found and fixed
- Final confirmed state: app running on port 3000, all 6 UAT scenarios passing
- Any remaining known issues or deferred items

Wave 4 is the terminal wave — the final deliverable is a working CellarLite application on port 3000 with all F0–F7 features verified.
</output>
