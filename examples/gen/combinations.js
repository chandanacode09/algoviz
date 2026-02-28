// Combinations (n choose k) — backtracking approach
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [1, 2, 3, 4];
const k = 2;
const arr = layout.array(values, { y: 100, prefix: "a" });

const title = titleLabel("Combinations: C(4, 2)");
const status = statusLabel("");

// Pointer for current position
const iPtr = pointer("idx", arr.id(0), "above", { id: "pi" });

// Labels
const currentLabel = label("Current: []", 160, 230, {
  id: "lcur", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$primary",
});
const resultLabel = label("Results: []", 160, 270, {
  id: "lres", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$success",
});
const depthLabel = label("Decision: ?", 160, 310, {
  id: "ldec", fontSize: 14, anchor: "start", fill: "$warning",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Generate all combinations of 2 elements from [1, 2, 3, 4]",
  "initialization",
  {
    narration: 'We want all <span class="highlight">combinations of k=2</span> elements from [1, 2, 3, 4]. ' +
      'Using <span class="warn">backtracking</span>, at each element we make a binary decision: ' +
      '<span class="highlight">include it</span> or <span class="highlight">skip it</span>. ' +
      'We process elements left to right, building combinations incrementally.',
    phase: "setup",
  },
  ops.setText(status.id, "C(4,2) = 6 combinations to find")
));

steps.push(teach(
  "Strategy: at each index, include the element or skip it",
  'For each element, we decide: <span class="highlight">include</span> it in the current combination, ' +
    'or <span class="warn">skip</span> it. If we\'ve chosen k elements, we have a valid combination. ' +
    'If we run out of elements or can\'t possibly reach k, we backtrack. ' +
    'This generates combinations in <span class="highlight">lexicographic order</span>.',
  ops.setText(status.id, "Include or skip each element — binary decision tree"),
  ops.setText("ldec", "Decision: include or skip?")
));

// We'll walk through the backtracking tree manually.
// Expected results: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]

const results = [];

// ═══════════ Start with index 0, element 1 ═══════════

// Include 1
steps.push(teach(
  "Index 0: Include 1. Current = [1]",
  'At index 0, element = <span class="highlight">1</span>. ' +
    '<span class="success">Include 1</span>. Current combination: [1]. ' +
    'Need 1 more element (k - current.length = 2 - 1 = 1).',
  ops.movePointer("pi", arr.id(0)),
  ops.highlight(arr.id(0), "$success"),
  ops.setText("lcur", "Current: [1]"),
  ops.setText("ldec", "Decision: INCLUDE 1"),
  ops.setText(status.id, "Include 1. Need 1 more.")
));

// Include 2 → [1,2] ✓
steps.push(teach(
  "Index 1: Include 2. Current = [1, 2] — complete!",
  'At index 1, element = <span class="highlight">2</span>. ' +
    '<span class="success">Include 2</span>. Current = [1, 2]. Length = k = 2. ' +
    '<span class="success">Valid combination found!</span> Record it and backtrack.',
  ops.movePointer("pi", arr.id(1)),
  ops.highlight(arr.id(1), "$success"),
  ops.setText("lcur", "Current: [1, 2]"),
  ops.setText("ldec", "Decision: INCLUDE 2"),
  ops.setText(status.id, "Found: [1, 2]")
));
results.push("[1,2]");

steps.push(annotatedStep(
  "Combination [1, 2] found! Backtrack: remove 2, skip 2, try index 2.",
  "decision",
  {
    narration: 'We found <span class="success">[1, 2]</span>. Now <span class="warn">backtrack</span>: ' +
      'remove 2 from current, and consider skipping 2 instead. ' +
      'But skipping means we move to index 2 with current = [1].',
    phase: "main-loop",
  },
  ops.reset(arr.id(1)),
  ops.setText("lres", "Results: [1,2]"),
  ops.setText("lcur", "Current: [1]"),
  ops.setText("ldec", "Backtrack: remove 2")
));

// Include 3 → [1,3] ✓
steps.push(teach(
  "Index 2: Include 3. Current = [1, 3] — complete!",
  'At index 2, element = <span class="highlight">3</span>. ' +
    '<span class="success">Include 3</span>. Current = [1, 3]. Length = k. ' +
    '<span class="success">Valid combination!</span>',
  ops.movePointer("pi", arr.id(2)),
  ops.highlight(arr.id(2), "$success"),
  ops.setText("lcur", "Current: [1, 3]"),
  ops.setText("ldec", "Decision: INCLUDE 3"),
  ops.setText(status.id, "Found: [1, 3]")
));
results.push("[1,3]");

steps.push(step("Combination [1, 3] found! Backtrack: try index 3.",
  ops.reset(arr.id(2)),
  ops.setText("lres", "Results: [1,2] [1,3]"),
  ops.setText("lcur", "Current: [1]"),
  ops.setText("ldec", "Backtrack: remove 3")
));

// Include 4 → [1,4] ✓
steps.push(teach(
  "Index 3: Include 4. Current = [1, 4] — complete!",
  'At index 3, element = <span class="highlight">4</span>. ' +
    '<span class="success">Include 4</span>. Current = [1, 4]. Length = k. ' +
    '<span class="success">Valid combination!</span>',
  ops.movePointer("pi", arr.id(3)),
  ops.highlight(arr.id(3), "$success"),
  ops.setText("lcur", "Current: [1, 4]"),
  ops.setText("ldec", "Decision: INCLUDE 4"),
  ops.setText(status.id, "Found: [1, 4]")
));
results.push("[1,4]");

steps.push(annotatedStep(
  "Combination [1, 4] found! No more elements. Backtrack past 1.",
  "boundary",
  {
    narration: 'We found <span class="success">[1, 4]</span>. Index 3 is the last element, so we backtrack further. ' +
      'We\'ve explored all combinations starting with 1. ' +
      '<span class="warn">Backtrack</span>: remove both 4 and 1, now try starting with 2.',
    phase: "main-loop",
  },
  ops.reset(arr.id(3)),
  ops.reset(arr.id(0)),
  ops.setText("lres", "Results: [1,2] [1,3] [1,4]"),
  ops.setText("lcur", "Current: []"),
  ops.setText("ldec", "Backtrack past 1: all combos with 1 found")
));

// ═══════════ Start with index 1, element 2 ═══════════

steps.push(teach(
  "Index 1: Include 2. Current = [2]",
  'Now starting fresh at index 1. <span class="success">Include 2</span>. Current = [2]. Need 1 more.',
  ops.movePointer("pi", arr.id(1)),
  ops.highlight(arr.id(1), "$success"),
  ops.setText("lcur", "Current: [2]"),
  ops.setText("ldec", "Decision: INCLUDE 2"),
  ops.setText(status.id, "Include 2. Need 1 more.")
));

// Include 3 → [2,3] ✓
steps.push(teach(
  "Index 2: Include 3. Current = [2, 3] — complete!",
  'At index 2, element = <span class="highlight">3</span>. ' +
    '<span class="success">Include 3</span>. Current = [2, 3]. ' +
    '<span class="success">Valid combination!</span>',
  ops.movePointer("pi", arr.id(2)),
  ops.highlight(arr.id(2), "$success"),
  ops.setText("lcur", "Current: [2, 3]"),
  ops.setText("ldec", "Decision: INCLUDE 3"),
  ops.setText(status.id, "Found: [2, 3]")
));
results.push("[2,3]");

steps.push(step("Combination [2, 3] found! Backtrack: try index 3.",
  ops.reset(arr.id(2)),
  ops.setText("lres", "Results: [1,2] [1,3] [1,4] [2,3]"),
  ops.setText("lcur", "Current: [2]"),
  ops.setText("ldec", "Backtrack: remove 3")
));

// Include 4 → [2,4] ✓
steps.push(teach(
  "Index 3: Include 4. Current = [2, 4] — complete!",
  'At index 3, element = <span class="highlight">4</span>. ' +
    '<span class="success">Include 4</span>. Current = [2, 4]. ' +
    '<span class="success">Valid combination!</span>',
  ops.movePointer("pi", arr.id(3)),
  ops.highlight(arr.id(3), "$success"),
  ops.setText("lcur", "Current: [2, 4]"),
  ops.setText("ldec", "Decision: INCLUDE 4"),
  ops.setText(status.id, "Found: [2, 4]")
));
results.push("[2,4]");

steps.push(annotatedStep(
  "Combination [2, 4] found! No more elements. Backtrack past 2.",
  "boundary",
  {
    narration: 'Found <span class="success">[2, 4]</span>. No elements remain after index 3. ' +
      'All combinations starting with 2 are found. <span class="warn">Backtrack past 2</span>.',
    phase: "main-loop",
  },
  ops.reset(arr.id(3)),
  ops.reset(arr.id(1)),
  ops.setText("lres", "Results: [1,2] [1,3] [1,4] [2,3] [2,4]"),
  ops.setText("lcur", "Current: []"),
  ops.setText("ldec", "Backtrack past 2: all combos with 2 found")
));

// ═══════════ Start with index 2, element 3 ═══════════

steps.push(teach(
  "Index 2: Include 3. Current = [3]",
  'Starting at index 2. <span class="success">Include 3</span>. Current = [3]. Need 1 more.',
  ops.movePointer("pi", arr.id(2)),
  ops.highlight(arr.id(2), "$success"),
  ops.setText("lcur", "Current: [3]"),
  ops.setText("ldec", "Decision: INCLUDE 3"),
  ops.setText(status.id, "Include 3. Need 1 more.")
));

// Include 4 → [3,4] ✓
steps.push(teach(
  "Index 3: Include 4. Current = [3, 4] — complete!",
  'At index 3, element = <span class="highlight">4</span>. ' +
    '<span class="success">Include 4</span>. Current = [3, 4]. ' +
    '<span class="success">Valid combination — the last one!</span>',
  ops.movePointer("pi", arr.id(3)),
  ops.highlight(arr.id(3), "$success"),
  ops.setText("lcur", "Current: [3, 4]"),
  ops.setText("ldec", "Decision: INCLUDE 4"),
  ops.setText(status.id, "Found: [3, 4]")
));
results.push("[3,4]");

steps.push(annotatedStep(
  "Combination [3, 4] found! Backtrack: only index 3 (element 4) left — can't form more.",
  "boundary",
  {
    narration: 'Found <span class="success">[3, 4]</span>. If we skip 3 and start at index 3 with [4], ' +
      'we can\'t pick k=2 elements (only 1 remains). <span class="warn">Pruning</span>: ' +
      'remaining elements (1) < needed (2), so no more combinations possible.',
    phase: "main-loop",
  },
  ops.reset(arr.id(2)),
  ops.reset(arr.id(3)),
  ops.setText("lres", "Results: [1,2] [1,3] [1,4] [2,3] [2,4] [3,4]"),
  ops.setText("lcur", "Current: []"),
  ops.setText("ldec", "Pruning: not enough elements remaining")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "All 6 combinations found! C(4,2) = 6.",
  "explanation",
  {
    narration: '<span class="success">Backtracking complete!</span> We found all C(4,2) = ' +
      '<span class="success">6 combinations</span>: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]. ' +
      'At each element, the binary <span class="highlight">include/skip</span> decision creates a tree of possibilities. ' +
      '<span class="warn">Pruning</span> (skipping when not enough elements remain) avoids exploring dead ends. ' +
      'Time complexity: <span class="highlight">O(C(n,k))</span> — we generate exactly the valid combinations.',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, "All 6 combinations found. C(4,2) = 6."),
  ops.setText("ldec", ""),
  ops.setText("lcur", "")
));

const v = viz(
  {
    algorithm: "combinations",
    title: "Combinations C(n, k) — Backtracking",
    description: "Generate all combinations of k elements from an array using include/skip backtracking with pruning.",
    category: "backtracking",
    difficulty: "intermediate",
    complexity: { time: "O(C(n,k))", space: "O(k)" },
    input: "Array: [1, 2, 3, 4], k = 2",
  },
  [arr, title, status, iPtr, currentLabel, resultLabel, depthLabel],
  steps,
  { canvas: { height: 420 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
