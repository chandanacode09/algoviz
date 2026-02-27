#!/bin/bash
# HTML Preview Generator — renders a JSON file to HTML
# Usage: ./scripts/preview.sh <input.json> [output.html]
set -e

cd "$(dirname "$0")/.."

if [ -z "$1" ]; then
  echo "Usage: ./scripts/preview.sh <input.json> [output.html]"
  echo ""
  echo "Examples:"
  echo "  ./scripts/preview.sh examples/bubble-sort.json"
  echo "  ./scripts/preview.sh examples/phase0/quicksort.json output/preview.html"
  exit 1
fi

INPUT="$1"
OUTPUT="${2:-output/preview-$(basename "$1" .json).html}"

if [ ! -f "$INPUT" ]; then
  echo "Error: File not found: $INPUT"
  exit 1
fi

echo "=== Validating $INPUT ==="
node dist/src/cli/index.js validate "$INPUT" --fix

echo ""
echo "=== Rendering to $OUTPUT ==="
mkdir -p "$(dirname "$OUTPUT")"
node dist/src/cli/index.js render "$INPUT" -o "$OUTPUT" --fix

echo ""
echo "=== Preview ready: $OUTPUT ==="
echo "Open with: open $OUTPUT"
