#!/bin/bash
# Schema-Example Validator — validates all example JSON files against schema
# Usage: ./scripts/validate-examples.sh [--fix]
set -e

cd "$(dirname "$0")/.."

FIX_FLAG=""
if [ "$1" = "--fix" ]; then
  FIX_FLAG="--fix"
  echo "=== Running with --fix (auto-normalize) ==="
fi

PASS=0
FAIL=0
TOTAL=0

echo "=== Validating Hand-Crafted Examples ==="
for f in examples/*.json; do
  TOTAL=$((TOTAL + 1))
  if node dist/src/cli/index.js validate "$f" $FIX_FLAG 2>/dev/null; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $f"
  fi
done

echo ""
echo "=== Validating Phase 0 Examples ==="
for f in examples/phase0/*.json; do
  TOTAL=$((TOTAL + 1))
  if node dist/src/cli/index.js validate "$f" $FIX_FLAG 2>/dev/null; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL: $f"
  fi
done

echo ""
echo "=== Results: $PASS/$TOTAL passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
