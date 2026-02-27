#!/bin/bash
# Generation Tester — runs gen-test.js against example gen scripts
# Tests the full pipeline: primitives code → JSON → validate
# Usage: ./scripts/test-gen.sh [--render]
set -e

cd "$(dirname "$0")/.."

RENDER_FLAG=""
if [ "$1" = "--render" ]; then
  RENDER_FLAG="--render"
  echo "=== Running with --render (generating HTML) ==="
fi

echo "=== Building TypeScript ==="
npx tsc
echo "Build OK"
echo ""

echo "=== Running Gen Tests ==="
node gen-test.js examples/gen/*.js $RENDER_FLAG

echo ""
echo "=== Gen tests complete ==="
