// Min-Heap Insert & Extract-Min — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build initial min-heap as a tree:
//          1
//        /   \
//       3     2
//      / \   /
//     5   7 4
const t = layout.tree({
  value: 1,
  left: {
    value: 3,
    left: { value: 5 },
    right: { value: 7 },
  },
  right: {
    value: 2,
    left: { value: 4 },
  },
});

const title = titleLabel("Min-Heap: Insert & Extract");
const status = statusLabel("");

// Label showing heap array representation
const heapArrLabel = label("Heap array: [1, 3, 2, 5, 7, 4]", 500, 500, {
  id: "lheap", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});

const steps = [];

// Heap state tracking: [1, 3, 2, 5, 7, 4]
// Node values by tree order: 1(root), 3(left), 2(right), 5(ll), 7(lr), 4(rl)

// ─── Setup ───
steps.push(annotatedStep(
  "Initial min-heap with 6 nodes. Heap property: parent <= children.",
  "initialization",
  {
    narration: 'A <span class="highlight">Min-Heap</span> is a complete binary tree where each node\'s value is ' +
      '<span class="warn">less than or equal to</span> its children. The root always holds the ' +
      '<span class="success">minimum element</span>. We will first <span class="highlight">insert 0</span>, ' +
      'then <span class="highlight">extract the minimum</span>.',
    phase: "setup",
  },
  ops.setText(status.id, "Min-Heap: [1, 3, 2, 5, 7, 4]")
));

// ═══════════════════════════════════════════════════
// INSERT(0): Add at bottom, sift up
// ═══════════════════════════════════════════════════

steps.push(teach(
  "Insert 0: add as last node (right child of node 3)",
  'To insert into a heap, we first place the new element at the <span class="highlight">next available position</span> ' +
    '(maintaining completeness). Node 3 has two children, node 2 has one child (4), so the next slot is ' +
    '<span class="warn">right child of node 2</span>.',
  ops.setText(status.id, "Insert 0: place at next available position"),
  ops.setText("lheap", "Heap array: [1, 3, 2, 5, 7, 4, 0]")
));

// Create node 0 as right child of node 2
const node2Actor = t.actors.find(a => a.type === "node" && a.value === 2);
const node4Actor = t.actors.find(a => a.type === "node" && a.value === 4);
// Position: mirror node 4 on the right side of node 2
const new0X = node2Actor.x + (node2Actor.x - node4Actor.x);
const new0Y = node4Actor.y;

const n0id = "ins0";
const e0id = "eins0";

steps.push(annotatedStep(
  "Node 0 placed as right child of 2",
  "decision",
  {
    narration: '<span class="highlight">0</span> is placed as the right child of <span class="warn">2</span>. ' +
      'But <span class="warn">0 < 2</span> — this violates the heap property! ' +
      'We need to <span class="highlight">sift up</span>: swap with the parent until the heap property is restored.',
    phase: "main-loop",
  },
  ops.create({ id: n0id, type: "node", x: new0X, y: new0Y, value: 0, radius: 25, fill: "$danger" }),
  ops.create({ id: e0id, type: "edge", source: t.nodeId(2), target: n0id, directed: false }),
  ops.setText(status.id, "0 < 2 — heap violation! Need to sift up")
));

// Sift up step 1: swap 0 and 2
steps.push(teach(
  "Sift up: swap 0 with parent 2",
  '<span class="highlight">Sift up</span>: compare 0 with its parent 2. Since <span class="warn">0 < 2</span>, ' +
    'swap them. Node 0 moves up, node 2 moves down. ' +
    'The subtree rooted at old-2\'s position now satisfies the heap property locally.',
  ops.highlight(t.nodeId(2), "$danger"),
  ops.highlight(n0id, "$warning"),
  ops.setValue(t.nodeId(2), 0),
  ops.setValue(n0id, 2),
  ops.setText(status.id, "Swap 0 ↔ 2: sifting up"),
  ops.setText("lheap", "Heap array: [1, 3, 0, 5, 7, 4, 2]")
));

// Now "0" is at the old node-2 position (right child of root)
// Check parent: 0 < 1? Yes — swap with root!
steps.push(teach(
  "Sift up: compare 0 with parent 1",
  'Now 0 is at the right child of root. Compare with parent: <span class="warn">0 < 1</span>. ' +
    'Still violates heap property! Swap again.',
  ops.reset(n0id),
  ops.highlight(t.nodeId(2), "$warning"),
  ops.highlight(t.nodeId(1), "$danger"),
  ops.setText(status.id, "0 < 1 — swap with root!")
));

// Sift up step 2: swap 0 and 1
steps.push(teach(
  "Sift up: swap 0 with root 1",
  'Swap <span class="warn">0</span> and <span class="warn">1</span>. ' +
    'Node 0 becomes the <span class="success">new root</span>! ' +
    '0 has no parent, so sift-up is complete. The heap property is restored everywhere.',
  ops.setValue(t.nodeId(1), 0),
  ops.setValue(t.nodeId(2), 1),
  ops.highlight(t.nodeId(1), "$success"),
  ops.reset(t.nodeId(2)),
  ops.setText(status.id, "Sift up complete! 0 is the new root"),
  ops.setText("lheap", "Heap array: [0, 3, 1, 5, 7, 4, 2]")
));

// Settle
steps.push(step("Insert complete — heap property restored",
  ops.reset(t.nodeId(1)),
  ops.highlight(n0id, "$default")
));

// ═══════════════════════════════════════════════════
// EXTRACT-MIN: Remove root, move last to root, sift down
// ═══════════════════════════════════════════════════

steps.push(annotatedStep(
  "Extract-Min: remove the root (minimum element 0)",
  "explanation",
  {
    narration: '<span class="highlight">Extract-Min</span> removes and returns the root (the smallest element). ' +
      'Step 1: Save the root value (0). Step 2: Move the <span class="warn">last element</span> to the root. ' +
      'Step 3: <span class="highlight">Sift down</span> to restore the heap property.',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(1), "$danger"),
  ops.setText(status.id, "Extract-Min: root = 0 (the minimum)")
));

// Remove last node (ins0 which currently holds value 2), move its value to root
steps.push(teach(
  "Move last element (2) to root, remove the last node",
  'The last element is <span class="highlight">2</span> (rightmost leaf on bottom level). ' +
    'Move it to the root position and <span class="warn">delete the old last node</span>. ' +
    'Now the root is 2, but <span class="warn">2 > 1</span> (left child) — heap violation!',
  ops.setValue(t.nodeId(1), 2),
  ops.highlight(t.nodeId(1), "$warning"),
  ops.remove(n0id),
  ops.remove(e0id),
  ops.setText(status.id, "Last node (2) moved to root. Heap violated!"),
  ops.setText("lheap", "Heap array: [2, 3, 1, 5, 7, 4]")
));

// Sift down step 1: compare root(2) with children 3 and 1. Swap with smaller child (1)
steps.push(teach(
  "Sift down: compare root 2 with children 3 and 1",
  '<span class="highlight">Sift down</span>: compare root <span class="warn">2</span> with its children: ' +
    'left = <span class="highlight">3</span>, right = <span class="highlight">1</span>. ' +
    'The smaller child is <span class="warn">1</span>. Since 2 > 1, swap them.',
  ops.highlight(t.nodeId(3), "$primary"),
  ops.highlight(t.nodeId(2), "$primary"),
  ops.setText(status.id, "Sift down: min child is 1 (right). Swap 2 ↔ 1")
));

// Perform the swap: root(value=2) and right-child(value=1)
// Root currently shows value 2 (was node "1" originally), right child shows value 1 (was node "2" originally)
steps.push(teach(
  "Swap 2 with 1: 1 becomes new root",
  'After swap: <span class="success">1</span> is the root, <span class="warn">2</span> moves to the right child. ' +
    'Now check 2 against its children: left = <span class="highlight">4</span>. Since <span class="success">2 < 4</span>, ' +
    'the heap property is satisfied!',
  ops.setValue(t.nodeId(1), 1),
  ops.setValue(t.nodeId(2), 2),
  ops.highlight(t.nodeId(1), "$success"),
  ops.reset(t.nodeId(3)),
  ops.reset(t.nodeId(2)),
  ops.setText(status.id, "Swap 2 ↔ 1. Check: 2 < 4 ✓ — sift down complete!"),
  ops.setText("lheap", "Heap array: [1, 3, 2, 5, 7, 4]")
));

// Check 2 vs child 4: 2 < 4, done
steps.push(annotatedStep(
  "Sift down complete: 2 has only child 4, and 2 < 4",
  "invariant",
  {
    narration: 'Node <span class="highlight">2</span> now has one child: <span class="highlight">4</span>. ' +
      'Since <span class="success">2 ≤ 4</span>, the heap property holds. ' +
      '<span class="success">Sift-down is complete!</span> The min-heap is fully restored.',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(2), "$primary"),
  ops.highlight(t.nodeId(4), "$primary"),
  ops.setText(status.id, "2 ≤ 4 — heap property holds. Done!")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Insert and Extract-Min both complete! Heap operations run in O(log n).",
  "explanation",
  {
    narration: '<span class="success">Both operations complete!</span> ' +
      '<span class="highlight">Insert</span>: place at bottom, sift up — O(log n). ' +
      '<span class="highlight">Extract-Min</span>: move last to root, sift down — O(log n). ' +
      'Both operations maintain the <span class="warn">complete binary tree</span> structure ' +
      'and restore the <span class="warn">heap property</span> via swaps along a single root-to-leaf path.',
    phase: "cleanup",
  },
  ops.reset(t.nodeIds),
  ops.markDone(t.nodeIds),
  ops.setText(status.id, "Final heap: [1, 3, 2, 5, 7, 4] — O(log n) per operation")
));

const v = viz(
  {
    algorithm: "heap_insert_extract",
    title: "Min-Heap: Insert & Extract-Min",
    description: "Insert a new element with sift-up, then extract the minimum with sift-down. Both operations maintain the heap property in O(log n) time.",
    category: "heap",
    difficulty: "beginner",
    complexity: { time: "O(log n)", space: "O(1)" },
    input: "Initial heap: [1, 3, 2, 5, 7, 4]. Insert: 0. Then extract-min.",
  },
  [t, title, status, heapArrLabel],
  steps,
  { canvas: { height: 550 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
