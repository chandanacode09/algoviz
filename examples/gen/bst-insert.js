// BST Insertion — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds, nextId,
} = require("algoviz");

resetIds();

// Build an initial BST:
//        10
//       /  \
//      5    15
//     / \     \
//    3   7     20
const t = layout.tree({
  value: 10,
  left: {
    value: 5,
    left: { value: 3 },
    right: { value: 7 },
  },
  right: {
    value: 15,
    right: { value: 20 },
  },
});

const title = titleLabel("BST Insertion");
const status = statusLabel("");

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Initial BST with 6 nodes. We will insert values: 12, 1, 8",
  "initialization",
  {
    narration: 'A <span class="highlight">Binary Search Tree (BST)</span> maintains the property: ' +
      'for every node, all values in the <span class="warn">left subtree are smaller</span> and ' +
      'all values in the <span class="warn">right subtree are larger</span>. ' +
      'We will insert <span class="highlight">12, 1, and 8</span> into this tree.',
    phase: "setup",
  },
  ops.setText(status.id, "Initial BST: [3, 5, 7, 10, 15, 20]")
));

// ─── Insert 12 ───
steps.push(teach(
  "Insert 12: start at root (10)",
  'Inserting <span class="highlight">12</span>. Start at the root: <span class="warn">10</span>. ' +
    'Since 12 > 10, we go <span class="warn">right</span>.',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "Inserting 12: compare with root 10")
));

steps.push(teach(
  "Insert 12: 12 > 10, go right to 15",
  '12 > 10, move right to <span class="highlight">15</span>. ' +
    'Since 12 < 15, we go <span class="warn">left</span>. Node 15 has no left child — insert here!',
  ops.reset(t.nodeId(10)),
  ops.highlight(t.nodeId(15), "$warning"),
  ops.setText(status.id, "12 < 15, go left — empty spot found!")
));

// Create node 12 as left child of 15
// We need to position it. Node 15 is in the tree. Let's compute position.
// The tree layout places nodes. Node 15's actor: we can find it.
const node15 = t.actors.find(a => a.type === "node" && a.value === 15);
const node20 = t.actors.find(a => a.type === "node" && a.value === 20);
const newNode12X = node15.x - (node20.x - node15.x);
const newNode12Y = node15.y + 100;

const n12id = "ins12";
const e12id = "eins12";

steps.push(annotatedStep(
  "Insert 12 as left child of 15",
  "decision",
  {
    narration: '<span class="success">Found the spot!</span> Node <span class="success">12</span> becomes the ' +
      '<span class="highlight">left child of 15</span>. The BST property is maintained: 10 < 12 < 15.',
    phase: "main-loop",
  },
  ops.create({ id: n12id, type: "node", x: newNode12X, y: newNode12Y, value: 12, radius: 25, fill: "$success" }),
  ops.create({ id: e12id, type: "edge", source: t.nodeId(15), target: n12id, directed: false }),
  ops.reset(t.nodeId(15)),
  ops.setText(status.id, "Inserted 12 as left child of 15")
));

// Reset 12 to default
steps.push(step("Node 12 settled into the tree",
  ops.highlight(n12id, "$default"),
));

// ─── Insert 1 ───
steps.push(teach(
  "Insert 1: start at root (10)",
  'Inserting <span class="highlight">1</span>. Start at root: <span class="warn">10</span>. ' +
    '1 < 10, go <span class="warn">left</span>.',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "Inserting 1: compare with root 10")
));

steps.push(teach(
  "Insert 1: 1 < 10, go left to 5",
  '1 < 10, move left to <span class="highlight">5</span>. ' +
    '1 < 5, go <span class="warn">left</span> to <span class="highlight">3</span>.',
  ops.reset(t.nodeId(10)),
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setText(status.id, "1 < 5, go left")
));

steps.push(teach(
  "Insert 1: 1 < 5, go left to 3",
  '1 < 5, move left to <span class="highlight">3</span>. ' +
    '1 < 3, go <span class="warn">left</span>. Node 3 has no left child — insert here!',
  ops.reset(t.nodeId(5)),
  ops.highlight(t.nodeId(3), "$warning"),
  ops.setText(status.id, "1 < 3, go left — empty spot found!")
));

// Create node 1 as left child of 3
const node3 = t.actors.find(a => a.type === "node" && a.value === 3);
const node7 = t.actors.find(a => a.type === "node" && a.value === 7);
const newNode1X = node3.x - (node7.x - node3.x) / 2;
const newNode1Y = node3.y + 100;

const n1id = "ins1";
const e1id = "eins1";

steps.push(annotatedStep(
  "Insert 1 as left child of 3",
  "decision",
  {
    narration: '<span class="success">Found the spot!</span> Node <span class="success">1</span> becomes the ' +
      '<span class="highlight">left child of 3</span>. The BST property is maintained: 1 < 3 < 5.',
    phase: "main-loop",
  },
  ops.create({ id: n1id, type: "node", x: newNode1X, y: newNode1Y, value: 1, radius: 25, fill: "$success" }),
  ops.create({ id: e1id, type: "edge", source: t.nodeId(3), target: n1id, directed: false }),
  ops.reset(t.nodeId(3)),
  ops.setText(status.id, "Inserted 1 as left child of 3")
));

steps.push(step("Node 1 settled into the tree",
  ops.highlight(n1id, "$default"),
));

// ─── Insert 8 ───
steps.push(teach(
  "Insert 8: start at root (10)",
  'Inserting <span class="highlight">8</span>. Start at root: <span class="warn">10</span>. ' +
    '8 < 10, go <span class="warn">left</span>.',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "Inserting 8: compare with root 10")
));

steps.push(teach(
  "Insert 8: 8 < 10, go left to 5",
  '8 < 10, move left to <span class="highlight">5</span>. ' +
    '8 > 5, go <span class="warn">right</span> to <span class="highlight">7</span>.',
  ops.reset(t.nodeId(10)),
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setText(status.id, "8 > 5, go right")
));

steps.push(teach(
  "Insert 8: 8 > 5, go right to 7",
  '8 > 5, move right to <span class="highlight">7</span>. ' +
    '8 > 7, go <span class="warn">right</span>. Node 7 has no right child — insert here!',
  ops.reset(t.nodeId(5)),
  ops.highlight(t.nodeId(7), "$warning"),
  ops.setText(status.id, "8 > 7, go right — empty spot found!")
));

// Create node 8 as right child of 7
const newNode8X = node7.x + (node7.x - node3.x) / 2;
const newNode8Y = node7.y + 100;

const n8id = "ins8";
const e8id = "eins8";

steps.push(annotatedStep(
  "Insert 8 as right child of 7",
  "decision",
  {
    narration: '<span class="success">Found the spot!</span> Node <span class="success">8</span> becomes the ' +
      '<span class="highlight">right child of 7</span>. The BST property is maintained: 5 < 7 < 8 < 10.',
    phase: "main-loop",
  },
  ops.create({ id: n8id, type: "node", x: newNode8X, y: newNode8Y, value: 8, radius: 25, fill: "$success" }),
  ops.create({ id: e8id, type: "edge", source: t.nodeId(7), target: n8id, directed: false }),
  ops.reset(t.nodeId(7)),
  ops.setText(status.id, "Inserted 8 as right child of 7")
));

steps.push(step("Node 8 settled into the tree",
  ops.highlight(n8id, "$default"),
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "All 3 values inserted! Final BST has 9 nodes.",
  "explanation",
  {
    narration: '<span class="success">All insertions complete!</span> The BST now contains 9 nodes: ' +
      '[1, 3, 5, 7, 8, 10, 12, 15, 20]. Each insertion followed a path from root to leaf, ' +
      'taking <span class="highlight">O(h)</span> time where h is the tree height. ' +
      'For a balanced BST, h = O(log n). Worst case (skewed tree): h = O(n).',
    phase: "cleanup",
  },
  ops.markDone(t.nodeIds),
  ops.markDone([n12id, n1id, n8id]),
  ops.setText(status.id, "BST complete: 9 nodes, height ≈ 4")
));

const v = viz(
  {
    algorithm: "bst_insert",
    title: "BST Insertion — Step by Step",
    description: "Inserting values into a Binary Search Tree, showing the traversal path and comparison decisions at each node.",
    category: "tree",
    difficulty: "beginner",
    complexity: { time: "O(h)", space: "O(1)" },
    input: "Initial BST: [3, 5, 7, 10, 15, 20]. Insert: 12, 1, 8",
  },
  [t, title, status],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
