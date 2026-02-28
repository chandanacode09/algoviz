// Segment Tree — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ──────────────────────────────────────────────────────────
// Source array: [1, 3, 5, 7, 9, 11]
// Segment tree for range-sum queries:
//
// Tree structure (each node stores sum of its range):
//              36 [0-5]
//            /         \
//        9 [0-2]       27 [3-5]
//       /     \        /      \
//    4 [0-1]  5[2]  16 [3-4]  11[5]
//   /   \           /    \
//  1[0]  3[1]     7[3]  9[4]
//
// We'll build this bottom-up, then query sum(1..4)
// ──────────────────────────────────────────────────────────

// Source array at y=480
const arr = layout.array([1, 3, 5, 7, 9, 11], { y: 480, prefix: "a" });

// Segment tree — use unique values via string labels so nodeId works
// We use string values like "36[0-5]" but that makes nodeId complex.
// Instead, use distinct numeric values and add labels as overlays.
// Actually, the tree just needs distinct values for nodeId().
// Internal sums: 4, 9, 16, 27, 36 are all distinct from leaves.
// Leaves: 1, 3, 5, 7, 9, 11 — all distinct.
// But 9 appears twice (leaf and internal node sum [0-2]).
// Use string values to make them unique.

const segTree = layout.tree({
  value: "36",
  left: {
    value: "9",
    left: {
      value: "4",
      left: { value: "1" },
      right: { value: "3" },
    },
    right: { value: "5" },
  },
  right: {
    value: "27",
    left: {
      value: "16",
      left: { value: "7" },
      right: { value: "9*" },
    },
    right: { value: "11" },
  },
}, { y: 40, levelSpacing: 80 });

const title = titleLabel("Segment Tree: Build & Range Query");
const status = statusLabel("");

const rangeLabel = label("Source array: [1, 3, 5, 7, 9, 11]", 500, 450, {
  id: "lrange", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Source array [1, 3, 5, 7, 9, 11] and an empty segment tree",
  "initialization",
  {
    narration: 'A <span class="highlight">Segment Tree</span> is a special binary tree that lets us ' +
      'quickly answer <span class="highlight">range queries</span> like "what is the sum of elements from index 1 to 4?" ' +
      'Each node stores the <span class="warn">sum of a range</span> of the source array.',
    phase: "setup",
  },
  ops.setText(status.id, "Source: [1, 3, 5, 7, 9, 11] — build a segment tree for range sums")
));

// ─── Teach: what each node stores ───
steps.push(teach(
  "Each node stores the sum of a range of the array",
  'Think of it like a <span class="highlight">tournament bracket</span>. ' +
    'The <span class="highlight">leaves</span> hold the original array values. ' +
    'Each <span class="warn">internal node</span> stores the sum of its two children. ' +
    'The <span class="highlight">root</span> stores the total sum of the entire array. ' +
    'We build it <span class="highlight">bottom-up</span>: leaves first, then parents.',
  ops.setText(status.id, "Leaves = array values, internal = sum of children"),
  ops.setText("lrange", "Each node = sum of its range")
));

// ─── Build: leaves ───
steps.push(annotatedStep(
  "Step 1: Leaves hold the original array values",
  "explanation",
  {
    narration: 'The <span class="highlight">6 leaves</span> of our segment tree correspond to the 6 array elements. ' +
      'Leaf for index 0 holds <span class="highlight">1</span>, ' +
      'index 1 holds <span class="highlight">3</span>, and so on. ' +
      'These are the starting point for building the tree.',
    phase: "main-loop",
  },
  ops.highlight(segTree.nodeId("1"), "$primary"),
  ops.highlight(segTree.nodeId("3"), "$primary"),
  ops.highlight(segTree.nodeId("5"), "$primary"),
  ops.highlight(segTree.nodeId("7"), "$primary"),
  ops.highlight(segTree.nodeId("9*"), "$primary"),
  ops.highlight(segTree.nodeId("11"), "$primary"),
  ops.highlight(arr.ids, "$primary"),
  ops.setText(status.id, "Leaves = [1, 3, 5, 7, 9, 11]")
));

// ─── Build: level 2 (4, 16) ───
steps.push(teach(
  "Step 2: Build parents — node 4 = 1+3 (range [0,1]), node 16 = 7+9 (range [3,4])",
  'Now we build the next level up. ' +
    'Node covering range [0,1]: <span class="highlight">1 + 3 = 4</span>. ' +
    'Node covering range [3,4]: <span class="highlight">7 + 9 = 16</span>. ' +
    'Node 5 covers just index [2] and node 11 covers just index [5] — they are already set.',
  ops.reset(segTree.nodeId("1")),
  ops.reset(segTree.nodeId("3")),
  ops.reset(segTree.nodeId("7")),
  ops.reset(segTree.nodeId("9*")),
  ops.reset(segTree.nodeId("5")),
  ops.reset(segTree.nodeId("11")),
  ops.reset(arr.ids),
  ops.highlight(segTree.nodeId("4"), "$warning"),
  ops.highlight(segTree.nodeId("16"), "$warning"),
  ops.setText(status.id, "4 = 1+3 (range [0,1]), 16 = 7+9 (range [3,4])")
));

// ─── Build: level 1 (9, 27) ───
steps.push(teach(
  "Step 3: Node 9 = 4+5 (range [0,2]), node 27 = 16+11 (range [3,5])",
  'Going up another level: ' +
    'Node covering range [0,2]: <span class="highlight">4 + 5 = 9</span>. ' +
    'Node covering range [3,5]: <span class="highlight">16 + 11 = 27</span>.',
  ops.reset(segTree.nodeId("4")),
  ops.reset(segTree.nodeId("16")),
  ops.highlight(segTree.nodeId("9"), "$warning"),
  ops.highlight(segTree.nodeId("27"), "$warning"),
  ops.setText(status.id, "9 = 4+5 (range [0,2]), 27 = 16+11 (range [3,5])")
));

// ─── Build: root (36) ───
steps.push(teach(
  "Step 4: Root = 9+27 = 36 (entire range [0,5])",
  'Finally, the root: <span class="highlight">9 + 27 = 36</span>. ' +
    'The root stores the <span class="success">total sum</span> of the entire array: ' +
    '1+3+5+7+9+11 = <span class="success">36</span>. The tree is complete!',
  ops.reset(segTree.nodeId("9")),
  ops.reset(segTree.nodeId("27")),
  ops.highlight(segTree.nodeId("36"), "$success"),
  ops.setText(status.id, "Root = 36 = sum of entire array [0..5]"),
  ops.setText("lrange", "Tree built! Root = total sum = 36")
));

// ─── Now demonstrate a range query: sum(1..4) ───
steps.push(annotatedStep(
  "Now query: what is the sum of elements from index 1 to index 4?",
  "explanation",
  {
    narration: 'Let us query <span class="highlight">sum(1..4)</span>: the sum of arr[1]+arr[2]+arr[3]+arr[4] = 3+5+7+9 = 24. ' +
      'Instead of adding all 4 elements one by one, the segment tree finds the answer ' +
      'by visiting just a <span class="highlight">few nodes</span> — O(log n) instead of O(n)!',
    phase: "main-loop",
  },
  ops.reset(segTree.nodeId("36")),
  ops.highlight(arr.id(1), "$warning"),
  ops.highlight(arr.id(2), "$warning"),
  ops.highlight(arr.id(3), "$warning"),
  ops.highlight(arr.id(4), "$warning"),
  ops.setText(status.id, "Query: sum(1..4) = arr[1]+arr[2]+arr[3]+arr[4] = ?"),
  ops.setText("lrange", "Query range: index 1 to 4 (highlighted in array)")
));

// ─── Query traversal: start at root ───
steps.push(teach(
  "Start at root (range [0,5]). Query [1,4] partially overlaps — go to both children",
  'The root covers [0,5], but we only want [1,4]. ' +
    'This is a <span class="warn">partial overlap</span>, so we cannot use this node directly. ' +
    'We go to <span class="highlight">both children</span> and ask each one.',
  ops.highlight(segTree.nodeId("36"), "$warning"),
  ops.setText(status.id, "Root [0,5]: partial overlap with [1,4] → recurse both sides")
));

// ─── Query: left child [0,2] ───
steps.push(teach(
  "Left child covers [0,2]. Query [1,4] partially overlaps — keep going",
  'Left child stores sum of [0,2] = <span class="highlight">9</span>. ' +
    'Our query [1,4] partially overlaps [0,2] — we need [1,2] but not [0]. ' +
    'So we go deeper into this subtree.',
  ops.reset(segTree.nodeId("36")),
  ops.highlight(segTree.nodeId("9"), "$warning"),
  ops.setText(status.id, "Node [0,2]=9: partial overlap with [1,4] → recurse")
));

// ─── Query: node [0,1] partial, node [2]=5 full match ───
steps.push(teach(
  "Node [0,1] partially overlaps — split. Node [2]=5 fully inside — use it!",
  'Node [0,1]=4 partially overlaps [1,4], so we split: ' +
    'left child [0]=1 is <span class="warn">outside</span> our range (skip it). ' +
    'Right child [1]=3 is <span class="success">fully inside</span> [1,4] — take it! ' +
    'Node [2]=5 is <span class="success">fully inside</span> [1,4] — take it too!',
  ops.reset(segTree.nodeId("9")),
  ops.highlight(segTree.nodeId("1"), "$muted"),
  ops.highlight(segTree.nodeId("3"), "$success"),
  ops.highlight(segTree.nodeId("5"), "$success"),
  ops.setText(status.id, "Take node [1]=3, take node [2]=5. Skip node [0]=1.")
));

// ─── Query: right child [3,5] ───
steps.push(teach(
  "Right child [3,5] partially overlaps [1,4]. Node [3,4]=16 is fully inside!",
  'Right child of root covers [3,5]=27. Our query [1,4] partially overlaps, so recurse. ' +
    'Left child [3,4]=<span class="success">16</span> is <span class="success">fully inside</span> [1,4] — take the whole node! ' +
    'Right child [5]=11 is <span class="warn">outside</span> [1,4] — skip it. ' +
    'This is the power of segment trees: we grab <span class="highlight">16</span> instead of checking 7 and 9 individually.',
  ops.reset(segTree.nodeId("1")),
  ops.highlight(segTree.nodeId("16"), "$success"),
  ops.highlight(segTree.nodeId("11"), "$muted"),
  ops.setText(status.id, "Take node [3,4]=16. Skip node [5]=11.")
));

// ─── Combine results ───
steps.push(annotatedStep(
  "Answer: sum(1..4) = 3 + 5 + 16 = 24. Only visited 3 nodes!",
  "invariant",
  {
    narration: 'We collected three nodes: <span class="success">3</span> (index 1), ' +
      '<span class="success">5</span> (index 2), and <span class="success">16</span> (range [3,4]). ' +
      'Total: 3 + 5 + 16 = <span class="success">24</span>. ' +
      'We only visited <span class="highlight">O(log n)</span> nodes instead of scanning all 4 elements!',
    phase: "main-loop",
  },
  ops.reset(segTree.nodeId("11")),
  ops.highlight(segTree.nodeId("3"), "$success"),
  ops.highlight(segTree.nodeId("5"), "$success"),
  ops.highlight(segTree.nodeId("16"), "$success"),
  ops.highlight(arr.id(1), "$success"),
  ops.highlight(arr.id(2), "$success"),
  ops.highlight(arr.id(3), "$success"),
  ops.highlight(arr.id(4), "$success"),
  ops.setText(status.id, "sum(1..4) = 3 + 5 + 16 = 24"),
  ops.setText("lrange", "Answer: 24 (visited only 3 tree nodes!)")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Segment tree: build in O(n), query any range in O(log n)!",
  "explanation",
  {
    narration: '<span class="success">Summary:</span> A segment tree takes <span class="highlight">O(n)</span> to build ' +
      'and answers any range query in <span class="highlight">O(log n)</span>. ' +
      'It also supports <span class="highlight">point updates</span> in O(log n) — ' +
      'just change a leaf and update all ancestors. ' +
      'Segment trees work for sums, minimums, maximums, GCDs, and more!',
    phase: "cleanup",
  },
  ops.reset(arr.ids),
  ops.markDone(segTree.nodeIds),
  ops.markDone(arr.ids),
  ops.setText(status.id, "Segment tree: O(n) build, O(log n) query and update")
));

const v = viz(
  {
    algorithm: "segment_tree",
    title: "Segment Tree: Build & Range Sum Query",
    description: "Build a segment tree from an array bottom-up, then answer a range sum query by visiting only O(log n) nodes.",
    category: "tree",
    difficulty: "advanced",
    complexity: { time: "O(n) build, O(log n) query", space: "O(n)" },
    input: "Array: [1, 3, 5, 7, 9, 11]. Query: sum(1..4)",
  },
  [segTree, arr, title, status, rangeLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
