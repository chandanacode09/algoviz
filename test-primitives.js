#!/usr/bin/env node
/**
 * Primitives Integration Test
 *
 * Builds 3 complete visualizations from primitives and validates each.
 * Also tests individual layout/ops correctness.
 */

const {
  layout, ops, step, viz,
  titleLabel, statusLabel, pointer, label,
  resetIds,
  validate, summarize,
  renderToFile,
} = require("./dist/src/index");

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: Bubble Sort (Array Layout + Swap/Highlight/Reset Ops)
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 1: Bubble Sort from Primitives ━━━");

resetIds();

const arr = layout.array([5, 3, 8, 1]);
const bsTitle = titleLabel("Bubble Sort", "title");
const bsStatus = statusLabel("Starting: [5, 3, 8, 1]", "status");
const passLabel = label("", 500, 70, { id: "pass_label", fill: "$muted" });

// Verify layout
assert(arr.actors.length === 4, `Array has 4 cells (got ${arr.actors.length})`);
assert(arr.ids.length === 4, `Array has 4 IDs`);
assert(arr.values[0] === 5 && arr.values[3] === 1, `Values tracked correctly`);
assert(arr.actors[0].type === "cell", `First actor is a cell`);
assert(typeof arr.actors[0].x === "number", `Cell has x coordinate`);
assert(typeof arr.actors[0].y === "number", `Cell has y coordinate`);
assert(arr.actors[0].sublabel === "0", `Cell has sublabel "0"`);

// Build steps
const bsSteps = [
  // Pass 1
  step("Pass 1: Compare elements at index 0 and 1",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 5 > 3?"),
    ops.setText("pass_label", "Pass 1 of 3")
  ),
  step("5 > 3 is true — swap them",
    ops.swap(arr, 0, 1, "$danger"),
    ops.setText("status", "Swap 5 and 3 → [3, 5, 8, 1]")
  ),
  step("Compare elements at index 1 and 2",
    ops.reset([arr.id(0)]),
    ops.highlight([arr.id(1), arr.id(2)], "$warning"),
    ops.setText("status", "Compare: 5 > 8?")
  ),
  step("5 > 8 is false — no swap",
    ops.reset([arr.id(1), arr.id(2)]),
    ops.setText("status", "No. 5 ≤ 8, no swap")
  ),
  step("Compare elements at index 2 and 3",
    ops.highlight([arr.id(2), arr.id(3)], "$warning"),
    ops.setText("status", "Compare: 8 > 1?")
  ),
  step("8 > 1 is true — swap them",
    ops.swap(arr, 2, 3, "$danger"),
    ops.setText("status", "Swap 8 and 1 → [3, 5, 1, 8]")
  ),
  step("End of Pass 1. 8 is in its final position",
    ops.reset([arr.id(2)]),
    ops.markDone([arr.id(3)]),
    ops.setText("status", "Pass 1 complete: 8 is sorted")
  ),
  // Pass 2
  step("Pass 2: Compare index 0 and 1",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 3 > 5?"),
    ops.setText("pass_label", "Pass 2 of 3")
  ),
  step("3 > 5 is false — no swap",
    ops.reset([arr.id(0), arr.id(1)]),
    ops.setText("status", "No swap needed")
  ),
  step("Compare index 1 and 2",
    ops.highlight([arr.id(1), arr.id(2)], "$warning"),
    ops.setText("status", "Compare: 5 > 1?")
  ),
  step("5 > 1 is true — swap them",
    ops.swap(arr, 1, 2, "$danger"),
    ops.setText("status", "Swap 5 and 1 → [3, 1, 5, 8]")
  ),
  step("End of Pass 2",
    ops.reset([arr.id(1)]),
    ops.markDone([arr.id(2)]),
    ops.setText("status", "Pass 2 complete")
  ),
  // Pass 3
  step("Pass 3: Compare index 0 and 1",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText("status", "Compare: 3 > 1?"),
    ops.setText("pass_label", "Pass 3 of 3")
  ),
  step("3 > 1 is true — swap them",
    ops.swap(arr, 0, 1, "$danger"),
    ops.setText("status", "Swap 3 and 1 → [1, 3, 5, 8]")
  ),
  step("Array is fully sorted",
    ops.markDone([arr.id(0), arr.id(1)]),
    ops.setText("status", "Done! [1, 3, 5, 8]"),
    ops.setText("pass_label", "Complete")
  ),
];

// After swaps, handle values should be mutated
assert(arr.values[0] === 1, `After swaps, arr.values[0] === 1 (got ${arr.values[0]})`);
assert(arr.values[3] === 8, `After swaps, arr.values[3] === 8 (got ${arr.values[3]})`);

let bsViz;
try {
  bsViz = viz(
    {
      algorithm: "bubble_sort",
      title: "Bubble Sort",
      category: "sorting",
      difficulty: "beginner",
      complexity: { time: "O(n²)", space: "O(1)" },
      input: "Array: [5, 3, 8, 1]",
    },
    [arr, bsTitle, bsStatus, passLabel],
    bsSteps,
    { canvas: { width: 1000, height: 400 } }
  );
  assert(true, "Bubble sort viz built and validated");
} catch (e) {
  assert(false, `Bubble sort viz failed: ${e.message}`);
}

if (bsViz) {
  const s = summarize(bsViz);
  assert(s.stepCount === 15, `15 steps (got ${s.stepCount})`);
  assert(s.actorCount === 7, `7 actors (got ${s.actorCount})`);
  console.log(`  → ${s.title} | ${s.actorCount} actors | ${s.stepCount} steps | ${s.actionCount.total} actions`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: BFS Graph Traversal
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 2: BFS Graph from Primitives ━━━");

resetIds();

const g = layout.graph(
  [
    { id: "A", value: "A" },
    { id: "B", value: "B" },
    { id: "C", value: "C" },
    { id: "D", value: "D" },
    { id: "E", value: "E" },
  ],
  [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
    { from: "C", to: "E" },
    { from: "D", to: "E" },
  ],
  { directed: false }
);

const gTitle = titleLabel("BFS Traversal", "title");
const gStatus = statusLabel("Starting BFS from A", "status");

// Verify graph layout
assert(g.nodeIds.length === 5, `Graph has 5 nodes (got ${g.nodeIds.length})`);
assert(g.edgeIds.length === 5, `Graph has 5 edges (got ${g.edgeIds.length})`);
assert(typeof g.nodeId("A") === "string", `Can look up node A by input ID`);
assert(typeof g.edgeId("A", "B") === "string", `Can look up edge A→B`);

const bfsSteps = [
  step("Start BFS from node A. Add A to queue.",
    ops.highlight(g.nodeId("A"), "$primary"),
    ops.setText("status", "Queue: [A]")
  ),
  step("Dequeue A. Visit neighbors B and C.",
    ops.markDone(g.nodeId("A")),
    ops.highlightEdge(g.edgeId("A", "B"), "$primary"),
    ops.highlightEdge(g.edgeId("A", "C"), "$primary"),
    ops.highlight([g.nodeId("B"), g.nodeId("C")], "$warning"),
    ops.setText("status", "Queue: [B, C]")
  ),
  step("Dequeue B. Visit neighbor D.",
    ops.markDone(g.nodeId("B")),
    ops.resetEdge(g.edgeId("A", "B")),
    ops.highlightEdge(g.edgeId("B", "D"), "$primary"),
    ops.highlight(g.nodeId("D"), "$warning"),
    ops.setText("status", "Queue: [C, D]")
  ),
  step("Dequeue C. Visit neighbor E.",
    ops.markDone(g.nodeId("C")),
    ops.resetEdge(g.edgeId("A", "C")),
    ops.highlightEdge(g.edgeId("C", "E"), "$primary"),
    ops.highlight(g.nodeId("E"), "$warning"),
    ops.setText("status", "Queue: [D, E]")
  ),
  step("Dequeue D. E already in queue.",
    ops.markDone(g.nodeId("D")),
    ops.resetEdge([g.edgeId("B", "D"), g.edgeId("C", "E")]),
    ops.setText("status", "Queue: [E]")
  ),
  step("Dequeue E. Queue empty. BFS complete.",
    ops.markDone(g.nodeId("E")),
    ops.setText("status", "BFS complete: A → B → C → D → E")
  ),
];

let bfsViz;
try {
  bfsViz = viz(
    {
      algorithm: "bfs",
      title: "BFS Traversal",
      category: "graph",
      difficulty: "intermediate",
      complexity: { time: "O(V+E)", space: "O(V)" },
    },
    [g, gTitle, gStatus],
    bfsSteps
  );
  assert(true, "BFS viz built and validated");
} catch (e) {
  assert(false, `BFS viz failed: ${e.message}`);
}

if (bfsViz) {
  const s = summarize(bfsViz);
  assert(s.stepCount === 6, `6 steps (got ${s.stepCount})`);
  console.log(`  → ${s.title} | ${s.actorCount} actors | ${s.stepCount} steps | ${s.actionCount.total} actions`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: Binary Tree Inorder Traversal
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 3: Binary Tree Inorder from Primitives ━━━");

resetIds();

const t = layout.tree({
  value: 4,
  left: {
    value: 2,
    left: { value: 1 },
    right: { value: 3 },
  },
  right: {
    value: 6,
    left: { value: 5 },
    right: { value: 7 },
  },
});

const tTitle = titleLabel("Inorder Traversal", "title");
const tStatus = statusLabel("", "status");
const tResult = label("Result: []", 500, 550, { id: "result", fontSize: 16, fill: "$text" });

// Verify tree layout
assert(t.nodeIds.length === 7, `Tree has 7 nodes (got ${t.nodeIds.length})`);
assert(t.edgeIds.length === 6, `Tree has 6 edges (got ${t.edgeIds.length})`);
assert(typeof t.nodeId(4) === "string", `Can look up node by value 4`);
assert(typeof t.nodeId(1) === "string", `Can look up node by value 1`);

// Inorder: 1, 2, 3, 4, 5, 6, 7
const inorderSequence = [1, 2, 3, 4, 5, 6, 7];
const tSteps = [];
const visited = [];

for (let i = 0; i < inorderSequence.length; i++) {
  const val = inorderSequence[i];
  visited.push(val);
  tSteps.push(
    step(`Visit node ${val}`,
      ops.highlight(t.nodeId(val), "$warning"),
      ops.setText("status", `Visiting node ${val}`),
      ops.setText("result", `Result: [${visited.join(", ")}]`)
    )
  );
  // Mark done on next step or final
  if (i < inorderSequence.length - 1) {
    tSteps.push(
      step(`Node ${val} processed`,
        ops.markDone(t.nodeId(val))
      )
    );
  } else {
    tSteps.push(
      step("Inorder traversal complete",
        ops.markDone(t.nodeId(val)),
        ops.setText("status", "Done! [1, 2, 3, 4, 5, 6, 7]")
      )
    );
  }
}

let treeViz;
try {
  treeViz = viz(
    {
      algorithm: "inorder_traversal",
      title: "Inorder Traversal",
      category: "tree",
      difficulty: "beginner",
      complexity: { time: "O(n)", space: "O(h)" },
    },
    [t, tTitle, tStatus, tResult],
    tSteps
  );
  assert(true, "Tree viz built and validated");
} catch (e) {
  assert(false, `Tree viz failed: ${e.message}`);
}

if (treeViz) {
  const s = summarize(treeViz);
  assert(s.stepCount === 14, `14 steps (got ${s.stepCount})`);
  console.log(`  → ${s.title} | ${s.actorCount} actors | ${s.stepCount} steps | ${s.actionCount.total} actions`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: Matrix Layout (DP Table)
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 4: Matrix Layout ━━━");

resetIds();

const m = layout.matrix(3, 4, {
  values: [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 2, 2],
  ],
  sublabels: true,
});

assert(m.actors.length === 12, `Matrix has 12 cells (got ${m.actors.length})`);
assert(m.rows === 3, `3 rows`);
assert(m.cols === 4, `4 columns`);
assert(typeof m.id(1, 2) === "string", `Can look up cell at (1,2)`);
assert(m.values[1][2] === 1, `Value at (1,2) is 1`);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: Linked List Layout
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 5: Linked List Layout ━━━");

resetIds();

const ll = layout.linkedList([1, 2, 3, 4]);

assert(ll.nodeIds.length === 4, `Linked list has 4 nodes (got ${ll.nodeIds.length})`);
assert(ll.edgeIds.length === 3, `Linked list has 3 edges (got ${ll.edgeIds.length})`);
assert(ll.values[0] === 1, `First value is 1`);
assert(typeof ll.id(0) === "string", `Can access node by index`);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: Pointer Operations
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n━━━ Test 6: Pointer Operations ━━━");

resetIds();

const arr2 = layout.array([10, 20, 30]);
const ptr = pointer("i", arr2.id(0), "above");

const ptrSteps = [
  step("Initialize pointer at index 0",
    ops.highlight(arr2.id(0), "$primary"),
    ops.setText("status", "Pointer at index 0")
  ),
  step("Move pointer to index 1",
    ops.reset(arr2.id(0)),
    ops.movePointer(ptr.id, arr2.id(1)),
    ops.highlight(arr2.id(1), "$primary"),
    ops.setText("status", "Pointer at index 1")
  ),
  step("Move pointer to index 2",
    ops.reset(arr2.id(1)),
    ops.movePointer(ptr.id, arr2.id(2)),
    ops.highlight(arr2.id(2), "$primary"),
    ops.setText("status", "Pointer at index 2")
  ),
];

const pTitle = titleLabel("Pointer Test", "title");
const pStatus = statusLabel("", "status");

let ptrViz;
try {
  ptrViz = viz(
    { algorithm: "pointer_test", title: "Pointer Test" },
    [arr2, ptr, pTitle, pStatus],
    ptrSteps
  );
  assert(true, "Pointer viz built and validated");
} catch (e) {
  assert(false, `Pointer viz failed: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Test 7: Educational Step Helpers (teach, annotatedStep)
// ═══════════════════════════════════════════════════════════════════════════

console.log(`\n━━━ Test 7: Educational Step Helpers ━━━`);

const { teach, annotatedStep } = require("./dist/src/primitives");

try {
  resetIds();
  const earr = layout.array([5, 3, 8]);
  const estatus = statusLabel("");
  const etitle = titleLabel("Educational Test");

  // Test teach() — rich narration
  const t1 = teach(
    "Is 5 bigger than 3? Yes — swap!",
    'Is <span class="highlight">5</span> bigger than <span class="highlight">3</span>? Yes — <span class="warn">swap!</span>',
    ops.highlight([earr.id(0), earr.id(1)], "$warning")
  );
  assert(t1.description === "Is 5 bigger than 3? Yes — swap!", "teach() sets description");
  assert(t1.narration && t1.narration.includes('class="highlight"'), "teach() sets narration with HTML");
  assert(t1.actions.length === 2, "teach() flattens actions (2 highlight actions)");

  // Test teach() with swap detection
  const t2 = teach(
    "Swap 5 and 3",
    "Swapping...",
    ops.swap(earr, 0, 1, "$danger")
  );
  assert(t2.transition === "swap", "teach() auto-detects swap transition");

  // Test annotatedStep()
  const t3 = annotatedStep(
    "Set up pointers",
    "initialization",
    { narration: '<span class="highlight">lo=0</span>, <span class="warn">hi=2</span>', phase: "setup" },
    ops.highlight([earr.id(0)], "$primary")
  );
  assert(t3.annotation === "initialization", "annotatedStep() sets annotation");
  assert(t3.phase === "setup", "annotatedStep() sets phase");
  assert(t3.narration.includes("lo=0"), "annotatedStep() sets narration");

  // Test annotatedStep() without optional fields
  const t4 = annotatedStep(
    "Compare elements",
    "decision",
    {},
    ops.highlight([earr.id(0)], "$warning")
  );
  assert(t4.annotation === "decision", "annotatedStep() works without narration/phase");
  assert(t4.narration === undefined, "annotatedStep() omits narration when not provided");
  assert(t4.phase === undefined, "annotatedStep() omits phase when not provided");

  // Test that viz() validates educational steps
  const eduSteps = [t1, t3, t4];
  const eduViz = viz(
    { algorithm: "edu_test", title: "Educational Test", category: "sorting" },
    [earr, etitle, estatus],
    eduSteps
  );
  assert(eduViz.steps.length === 3, "viz() accepts educational steps");
  assert(eduViz.steps[0].narration !== undefined, "viz() preserves narration field");
  assert(eduViz.steps[1].annotation === "initialization", "viz() preserves annotation field");
  assert(eduViz.steps[1].phase === "setup", "viz() preserves phase field");

  console.log("  → Educational helpers work correctly");
} catch (e) {
  assert(false, `Educational helpers failed: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Test 8: Normalize — New Normalizations
// ═══════════════════════════════════════════════════════════════════════════

console.log(`\n━━━ Test 8: New Normalizations ━━━`);

const { normalize } = require("./dist/src/normalize");
const { validate: validateFn } = require("./dist/src/validate");

// Helper for minimal valid viz data
function minViz(overrides = {}) {
  return {
    version: "1.0",
    metadata: { algorithm: "test", title: "Test", ...overrides.metadata },
    actors: overrides.actors || [{ id: "c0", type: "cell", x: 100, y: 100, value: 1 }],
    steps: overrides.steps || [{ description: "Step 1", actions: [{ type: "update", target: "c0", props: { fill: "$primary" } }] }],
  };
}

// 8a: Linked-list category normalization
{
  const r = normalize(minViz({ metadata: { category: "Linked List" } }));
  assert(r.data.metadata.category === "linked-list", 'Category "Linked List" → "linked-list"');
  assert(r.fixes.length > 0, "Linked-list category fix was recorded");
}

// 8b: Generic category fallback (SORTING → sorting)
{
  const r = normalize(minViz({ metadata: { category: "SORTING" } }));
  assert(r.data.metadata.category === "sorting", 'Category "SORTING" → "sorting" via fallback');
}

// 8c: Transition hint normalization
{
  const r = normalize(minViz({
    steps: [{ description: "Step", transition: "Smooth", actions: [{ type: "update", target: "c0", props: { fill: "$primary" } }] }]
  }));
  assert(r.data.steps[0].transition === "smooth", 'Transition "Smooth" → "smooth"');
  assert(r.fixes.some(f => f.path.includes("transition")), "Transition fix was recorded");
}

// 8d: Annotation type normalization
{
  const r = normalize(minViz({
    steps: [{ description: "Step", annotation: "Invariant", actions: [{ type: "update", target: "c0", props: { fill: "$primary" } }] }]
  }));
  assert(r.data.steps[0].annotation === "invariant", 'Annotation "Invariant" → "invariant"');
}

// 8e: Annotation alias normalization
{
  const r = normalize(minViz({
    steps: [{ description: "Step", annotation: "init", actions: [{ type: "update", target: "c0", props: { fill: "$primary" } }] }]
  }));
  assert(r.data.steps[0].annotation === "initialization", 'Annotation "init" → "initialization"');
}

// 8f: String complexity passes schema validation directly
{
  const data = minViz({ metadata: { complexity: "O(n)" } });
  const vr = validateFn(data);
  assert(vr.valid === true, "String complexity passes schema validation directly");
}

// 8g: Object complexity still passes
{
  const data = minViz({ metadata: { complexity: { time: "O(n²)", space: "O(1)" } } });
  const vr = validateFn(data);
  assert(vr.valid === true, "Object complexity still passes schema validation");
}

// 8h: linked-list category passes schema validation
{
  const data = minViz({ metadata: { category: "linked-list" } });
  const vr = validateFn(data);
  assert(vr.valid === true, '"linked-list" category passes schema validation');
}

console.log("  → All new normalizations work correctly");

// ═══════════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════════

console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
