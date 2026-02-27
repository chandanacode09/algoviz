#!/bin/bash
# Build & Test Runner — builds TypeScript then runs all tests
set -e

cd "$(dirname "$0")/.."

echo "=== Building TypeScript ==="
npx tsc
echo "Build OK"

echo ""
echo "=== Running Primitives Tests ==="
node test-primitives.js
echo ""

echo "=== Validating Hand-Crafted Examples ==="
node dist/src/cli/index.js validate examples/*.json
echo ""

echo "=== Validating Phase 0 Examples ==="
node dist/src/cli/index.js validate examples/phase0/*.json
echo ""

echo "=== All checks passed ==="
