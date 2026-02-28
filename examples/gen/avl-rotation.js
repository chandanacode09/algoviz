// AVL Tree Rotation — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ──────────────────────────────────────────────────────────
// Phase 1: Build an UNBALANCED tree (left-left imbalance)
// Insert 30, 20, 10 — causes left-left case at root 30
//
// Before rotation:
//        30
//       /
//      20
//     /
//    10
//
// After right rotation at 30:
//        20
//       /  \
//      10   30
// ──────────────────────────────────────────────────────────

const treeBefore = layout.tree({
  value: 30,
  left: {
    value: 20,
    left: { value: 10 },
  },
});

const title = titleLabel("AVL Tree: Right Rotation");
const status = statusLabel("");

// Balance factor labels
const bfLabel = label("Balance factors: height(left) - height(right)", 500, 500, {
  id: "lbf", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "An unbalanced BST: we inserted 30, then 20, then 10",
  "initialization",
  {
    narration: 'We built a BST by inserting <span class="highlight">30</span>, then <span class="highlight">20</span>, then <span class="highlight">10</span>. ' +
      'Each new value went to the left, creating a "left-leaning" chain. ' +
      'This is <span class="warn">not balanced</span> — the left side is much taller than the right.',
    phase: "setup",
  },
  ops.setText(status.id, "Unbalanced BST: 30 → 20 → 10 (left chain)")
));

// ─── Explain Balance Factor ───
steps.push(teach(
  "What is a balance factor?",
  'In an AVL tree, every node has a <span class="highlight">balance factor</span>: ' +
    'the height of its left subtree minus the height of its right subtree. ' +
    'A node is <span class="success">balanced</span> if its balance factor is -1, 0, or +1. ' +
    'If the balance factor is <span class="warn">+2 or -2</span>, the tree needs fixing!',
  ops.setText("lbf", "Balance factor = height(left) - height(right)"),
  ops.setText(status.id, "AVL rule: balance factor must be -1, 0, or +1")
));

// ─── Check balance factors ───
steps.push(annotatedStep(
  "Check balance factor of node 10 (leaf): BF = 0",
  "invariant",
  {
    narration: 'Node <span class="highlight">10</span> is a leaf — no children. ' +
      'Left height = 0, right height = 0, so balance factor = <span class="success">0</span>. That is fine!',
    phase: "main-loop",
  },
  ops.highlight(treeBefore.nodeId(10), "$success"),
  ops.setText(status.id, "Node 10: BF = 0 (balanced)")
));

steps.push(annotatedStep(
  "Check balance factor of node 20: BF = +1 (left child 10, no right child)",
  "invariant",
  {
    narration: 'Node <span class="highlight">20</span> has left child 10 (height 1) and no right child (height 0). ' +
      'Balance factor = 1 - 0 = <span class="success">+1</span>. Still okay!',
    phase: "main-loop",
  },
  ops.reset(treeBefore.nodeId(10)),
  ops.highlight(treeBefore.nodeId(20), "$success"),
  ops.setText(status.id, "Node 20: BF = +1 (balanced)")
));

steps.push(annotatedStep(
  "Check balance factor of root 30: BF = +2 (IMBALANCED!)",
  "warning",
  {
    narration: 'Node <span class="warn">30</span> has left subtree height 2 and right subtree height 0. ' +
      'Balance factor = 2 - 0 = <span class="warn">+2</span>. ' +
      'That is <span class="warn">too big!</span> The AVL rule says the maximum allowed is +1. ' +
      'We need a <span class="highlight">rotation</span> to fix this!',
    phase: "main-loop",
  },
  ops.reset(treeBefore.nodeId(20)),
  ops.highlight(treeBefore.nodeId(30), "$danger"),
  ops.setText(status.id, "Node 30: BF = +2 — VIOLATION! Needs rotation"),
  ops.setText("lbf", "BF(30) = +2 — Left-Left case detected!")
));

// ─── Identify Left-Left case ───
steps.push(teach(
  "This is a Left-Left case: imbalance at 30, heavy on the left-left path",
  'The imbalance is at <span class="warn">30</span>, and the heavy side goes left to <span class="highlight">20</span>, ' +
    'then left again to <span class="highlight">10</span>. This pattern is called the <span class="highlight">Left-Left (LL) case</span>. ' +
    'The fix is a single <span class="highlight">right rotation</span> at the imbalanced node (30).',
  ops.highlight(treeBefore.nodeId(30), "$danger"),
  ops.highlight(treeBefore.nodeId(20), "$warning"),
  ops.highlight(treeBefore.nodeId(10), "$warning"),
  ops.setText(status.id, "Left-Left case → fix with RIGHT rotation at 30")
));

// ─── Explain the rotation ───
steps.push(teach(
  "Right rotation: 20 becomes the new root, 30 becomes 20's right child",
  'Here is how a <span class="highlight">right rotation</span> works: ' +
    '<span class="highlight">20</span> moves up to become the new root. ' +
    '<span class="warn">30</span> moves down to become the right child of 20. ' +
    'If 20 had a right child, it would become the left child of 30 (but here 20 has no right child). ' +
    'The result: a perfectly balanced tree!',
  ops.highlight(treeBefore.nodeId(20), "$primary"),
  ops.reset(treeBefore.nodeId(10)),
  ops.setText(status.id, "Right rotation: 20 moves up, 30 moves down")
));

// ─── Remove old tree and show new balanced tree ───
// We'll hide the old tree nodes and edges, then create the new balanced layout

// First, mark old nodes as being rotated
steps.push(step(
  "Performing the right rotation...",
  ops.highlight(treeBefore.nodeId(30), "$danger"),
  ops.highlight(treeBefore.nodeId(20), "$warning"),
  ops.highlight(treeBefore.nodeId(10), "$warning"),
  ops.setText(status.id, "Rotating...")
));

// Hide old tree actors
const hideOldActions = [];
for (const nid of treeBefore.nodeIds) {
  hideOldActions.push(...ops.hide(nid));
}
for (const eid of treeBefore.edgeIds) {
  hideOldActions.push(...ops.hide(eid));
}

// Create the new balanced tree manually at roughly the same positions
// Center of canvas: x=500, root at y=80
const newRoot20 = { id: "nr20", type: "node", x: 500, y: 80, value: 20, radius: 25, fill: "$success" };
const newLeft10 = { id: "nr10", type: "node", x: 268, y: 180, value: 10, radius: 25, fill: "$success" };
const newRight30 = { id: "nr30", type: "node", x: 732, y: 180, value: 30, radius: 25, fill: "$success" };
const newEdge20to10 = { id: "ne1", type: "edge", source: "nr20", target: "nr10", directed: false };
const newEdge20to30 = { id: "ne2", type: "edge", source: "nr20", target: "nr30", directed: false };

steps.push(annotatedStep(
  "After right rotation: 20 is the new root, with 10 and 30 as children",
  "explanation",
  {
    narration: '<span class="success">Rotation complete!</span> The tree is now balanced: ' +
      '<span class="success">20</span> is the root, <span class="highlight">10</span> is the left child, ' +
      'and <span class="highlight">30</span> is the right child. ' +
      'Every node now has a balance factor of <span class="success">0</span>.',
    phase: "main-loop",
  },
  ...hideOldActions,
  ops.create(newRoot20),
  ops.create(newLeft10),
  ops.create(newRight30),
  ops.create(newEdge20to10),
  ops.create(newEdge20to30),
  ops.setText(status.id, "Rotation done! Balanced tree: BF = 0 everywhere"),
  ops.setText("lbf", "BF(20)=0, BF(10)=0, BF(30)=0 — all balanced!")
));

// ─── Verify balance factors ───
steps.push(annotatedStep(
  "Verify: all balance factors are now 0",
  "invariant",
  {
    narration: 'Let us verify: <span class="highlight">10</span> is a leaf (BF=0). ' +
      '<span class="highlight">30</span> is a leaf (BF=0). ' +
      '<span class="highlight">20</span> has one child on each side, both height 1 (BF=0). ' +
      '<span class="success">Every node is balanced!</span> The AVL property is restored.',
    phase: "main-loop",
  },
  ops.highlight("nr20", "$primary"),
  ops.highlight("nr10", "$primary"),
  ops.highlight("nr30", "$primary"),
  ops.setText(status.id, "All nodes balanced: BF(10)=0, BF(20)=0, BF(30)=0")
));

// ─── Teach about 4 rotation cases ───
steps.push(teach(
  "AVL trees have 4 rotation cases: LL, RR, LR, RL",
  'AVL trees use <span class="highlight">4 types of rotations</span> to stay balanced: ' +
    '<span class="highlight">Left-Left (LL)</span> → single right rotation (what we just did). ' +
    '<span class="highlight">Right-Right (RR)</span> → single left rotation. ' +
    '<span class="highlight">Left-Right (LR)</span> → left rotation on child, then right rotation on parent. ' +
    '<span class="highlight">Right-Left (RL)</span> → right rotation on child, then left rotation on parent. ' +
    'Each rotation takes <span class="success">O(1)</span> time!',
  ops.reset("nr20"),
  ops.reset("nr10"),
  ops.reset("nr30"),
  ops.setText(status.id, "4 cases: LL→right, RR→left, LR→left+right, RL→right+left")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "AVL rotation complete! Rotations keep the tree balanced in O(log n) height.",
  "explanation",
  {
    narration: '<span class="success">Summary:</span> AVL trees are BSTs that <span class="highlight">automatically rebalance</span> ' +
      'after every insert or delete. By checking balance factors and performing rotations, ' +
      'the tree height stays at <span class="highlight">O(log n)</span>. ' +
      'This means search, insert, and delete are all <span class="success">O(log n)</span> guaranteed — ' +
      'much better than a regular BST that could become O(n) if values arrive in sorted order!',
    phase: "cleanup",
  },
  ops.markDone(["nr20", "nr10", "nr30"]),
  ops.setText(status.id, "AVL tree: O(log n) search, insert, delete — guaranteed!")
));

const v = viz(
  {
    algorithm: "avl_rotation",
    title: "AVL Tree: Right Rotation (Left-Left Case)",
    description: "Demonstrates how an AVL tree detects a left-left imbalance and fixes it with a single right rotation to restore balance.",
    category: "tree",
    difficulty: "advanced",
    complexity: { time: "O(log n)", space: "O(1)" },
    input: "Insert 30, 20, 10 into an empty BST → triggers LL imbalance at root",
  },
  [treeBefore, title, status, bfLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
