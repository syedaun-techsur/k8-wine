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
ADD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":3,"location":"Rack A3"}' \
  "$BASE/api/bottles")
ADD_STATUS=$(echo "$ADD_RESPONSE" | tail -1)
ADD_RESPONSE=$(echo "$ADD_RESPONSE" | head -n -1)

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
  GET_BOTTLE_COMBINED=$(curl -s -w "\n%{http_code}" "$BASE/api/bottles/$BOTTLE_ID")
  GET_BOTTLE_STATUS=$(echo "$GET_BOTTLE_COMBINED" | tail -1)
  GET_BOTTLE=$(echo "$GET_BOTTLE_COMBINED" | head -n -1)
  uat_check "US3: GET /api/bottles/$BOTTLE_ID returns 200 (pre-populate data)" "$([ "$GET_BOTTLE_STATUS" = "200" ] && echo true || echo false)"
  uat_check "US3: Pre-populated quantity is 3" "$(echo "$GET_BOTTLE" | grep -q '"quantity":3\|"quantity": 3' && echo true || echo false)"

  # Save with quantity changed to 2 (PUT — full replacement)
  PUT_COMBINED=$(curl -s -w "\n%{http_code}" -X PUT \
    -H "Content-Type: application/json" \
    -d '{"name":"Caymus","vintage":2019,"varietal":"Cabernet Sauvignon","quantity":2,"location":"Rack A3"}' \
    "$BASE/api/bottles/$BOTTLE_ID")
  PUT_STATUS=$(echo "$PUT_COMBINED" | tail -1)
  PUT_RESPONSE=$(echo "$PUT_COMBINED" | head -n -1)
  uat_check "US3: PUT /api/bottles/$BOTTLE_ID returns 200" "$([ "$PUT_STATUS" = "200" ] && echo true || echo false)"
  uat_check "US3: Updated quantity is 2 in PUT response" "$(echo "$PUT_RESPONSE" | grep -q '"quantity":2\|"quantity": 2' && echo true || echo false)"

  # Verify quantity 2 appears in list — look up by ID for precision
  AFTER_EDIT_LIST=$(curl -s "$BASE/api/bottles")
  uat_check "US3: List shows quantity=2 after edit" "$(echo "$AFTER_EDIT_LIST" | python3 -c "
import sys, json
bottles = json.load(sys.stdin)
bottle = next((b for b in bottles if b.get('id') == $BOTTLE_ID), None)
print('true' if bottle and bottle.get('quantity') == 2 else 'false')
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
