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
