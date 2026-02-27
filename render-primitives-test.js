#!/usr/bin/env node
/**
 * Render a primitive-built visualization to HTML and JSON
 * to verify end-to-end artifact pipeline.
 */

const fs = require("fs");
const path = require("path");
const {
  layout, ops, step, viz,
  titleLabel, statusLabel, pointer,
  resetIds, renderToFile,
} = require("./dist/src/index");

// Build bubble sort from primitives
resetIds();

const arr = layout.array([5, 3, 8, 1]);
const title = titleLabel("Bubble Sort (Primitives)", "title");
const status = statusLabel("Starting: [5, 3, 8, 1]", "status");

const steps = [
  step("Compare arr[0]=5 and arr[1]=3",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 5 > 3?")
  ),
  step("5 > 3 → swap",
    ops.swap(arr, 0, 1, "$danger"),
    ops.setText("status", "Swap → [3, 5, 8, 1]")
  ),
  step("Compare arr[1]=5 and arr[2]=8",
    ops.reset([arr.id(0)]),
    ops.highlight([arr.id(1), arr.id(2)], "$warning"),
    ops.setText("status", "Compare: 5 > 8?")
  ),
  step("5 ≤ 8 — no swap",
    ops.reset([arr.id(1), arr.id(2)]),
    ops.setText("status", "No swap needed")
  ),
  step("Compare arr[2]=8 and arr[3]=1",
    ops.highlight([arr.id(2), arr.id(3)], "$warning"),
    ops.setText("status", "Compare: 8 > 1?")
  ),
  step("8 > 1 → swap",
    ops.swap(arr, 2, 3, "$danger"),
    ops.setText("status", "Swap → [3, 5, 1, 8]")
  ),
  step("Pass 1 complete. 8 sorted.",
    ops.reset([arr.id(2)]),
    ops.markDone([arr.id(3)]),
    ops.setText("status", "Pass 1 done")
  ),
  step("Compare arr[0]=3 and arr[1]=5",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 3 > 5?")
  ),
  step("3 ≤ 5 — no swap",
    ops.reset([arr.id(0), arr.id(1)]),
    ops.setText("status", "No swap needed")
  ),
  step("Compare arr[1]=5 and arr[2]=1",
    ops.highlight([arr.id(1), arr.id(2)], "$warning"),
    ops.setText("status", "Compare: 5 > 1?")
  ),
  step("5 > 1 → swap",
    ops.swap(arr, 1, 2, "$danger"),
    ops.setText("status", "Swap → [3, 1, 5, 8]")
  ),
  step("Pass 2 complete. 5 sorted.",
    ops.reset([arr.id(1)]),
    ops.markDone([arr.id(2)]),
    ops.setText("status", "Pass 2 done")
  ),
  step("Compare arr[0]=3 and arr[1]=1",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 3 > 1?")
  ),
  step("3 > 1 → swap",
    ops.swap(arr, 0, 1, "$danger"),
    ops.setText("status", "Swap → [1, 3, 5, 8]")
  ),
  step("Array fully sorted!",
    ops.markDone([arr.id(0), arr.id(1)]),
    ops.setText("status", "Done! [1, 3, 5, 8]")
  ),
];

const v = viz(
  {
    algorithm: "bubble_sort",
    title: "Bubble Sort (Primitives)",
    category: "sorting",
    difficulty: "beginner",
    complexity: { time: "O(n²)", space: "O(1)" },
    input: "Array: [5, 3, 8, 1]",
  },
  [arr, title, status],
  steps,
  { canvas: { width: 1000, height: 400 } }
);

// Save JSON
const jsonPath = path.join(__dirname, "output", "primitives-bubble-sort.json");
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(v, null, 2) + "\n");
console.log(`✓ JSON: ${jsonPath}`);

// Render HTML
const htmlPath = path.join(__dirname, "output", "primitives-bubble-sort.html");
renderToFile(v, htmlPath);
const size = (fs.statSync(htmlPath).size / 1024).toFixed(1);
console.log(`✓ HTML: ${htmlPath} (${size} KB)`);
