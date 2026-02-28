// Serialize & Deserialize Binary Tree (BFS) — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ──────────────────────────────────────────────────────────
// Binary tree:
//          1
//        /   \
//       2     3
//      /       \
//     4         5
//
// BFS serialization: [1, 2, 3, 4, null, null, 5]
// ──────────────────────────────────────────────────────────

const t = layout.tree({
  value: 1,
  left: {
    value: 2,
    left: { value: 4 },
  },
  right: {
    value: 3,
    right: { value: 5 },
  },
}, { y: 60, levelSpacing: 90 });

// Serialized output array below the tree
// We'll create it with blanks and fill in during serialization
const arr = layout.array(["", "", "", "", "", "", ""], {
  y: 420,
  cellWidth: 70,
  gap: 8,
  prefix: "s",
});

const title = titleLabel("Serialize & Deserialize a Binary Tree");
const status = statusLabel("");

const modeLabel = label("Mode: Serialize (BFS / level-order)", 500, 390, {
  id: "lmode", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Binary tree with 5 nodes. We will serialize it to an array using BFS.",
  "initialization",
  {
    narration: '<span class="highlight">Serialization</span> means converting a tree into a flat format (like an array or string) ' +
      'so you can save it to a file or send it over a network. ' +
      '<span class="highlight">Deserialization</span> means rebuilding the tree from that flat format. ' +
      'We will use <span class="highlight">BFS (level-order)</span> traversal.',
    phase: "setup",
  },
  ops.setText(status.id, "Tree: [1, 2, 3, 4, _, _, 5] — serialize with BFS")
));

// ─── Teach: level-order encoding ───
steps.push(teach(
  "BFS visits the tree level by level: root first, then its children, then their children",
  'In <span class="highlight">level-order (BFS)</span> encoding, we visit the tree from top to bottom, left to right. ' +
    'For each node, we write its value. For missing children, we write <span class="warn">null</span>. ' +
    'This way, we know exactly where each node belongs when we rebuild the tree. ' +
    'The array position tells us: parent of index i is at index <span class="highlight">floor((i-1)/2)</span>.',
  ops.setText(status.id, "BFS: level by level, left to right, nulls for missing nodes"),
  ops.setText("lmode", "Parent of arr[i] is at arr[floor((i-1)/2)]")
));

// ─── Serialize: Level 0 (root) ───
steps.push(annotatedStep(
  "Serialize level 0: visit root node 1, write to arr[0]",
  "explanation",
  {
    narration: 'Start BFS with a queue containing just the root. ' +
      'Dequeue node <span class="highlight">1</span>, write it to arr[0]. ' +
      'Enqueue its children: left child <span class="highlight">2</span> and right child <span class="highlight">3</span>.',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(1), "$warning"),
  ops.setValue(arr.id(0), "1"),
  ops.highlight(arr.id(0), "$warning"),
  ops.setText(status.id, "Visit node 1 → arr[0] = 1"),
  ops.setText("lmode", "Queue: [2, 3]")
));

// ─── Serialize: Level 1 (nodes 2 and 3) ───
steps.push(step(
  "Serialize level 1: visit node 2, write to arr[1]",
  ops.reset(t.nodeId(1)),
  ops.reset(arr.id(0)),
  ops.highlight(t.nodeId(2), "$warning"),
  ops.setValue(arr.id(1), "2"),
  ops.highlight(arr.id(1), "$warning"),
  ops.setText(status.id, "Visit node 2 → arr[1] = 2"),
  ops.setText("lmode", "Queue: [3, 4] (2's left child=4, no right child)")
));

steps.push(step(
  "Serialize level 1: visit node 3, write to arr[2]",
  ops.reset(t.nodeId(2)),
  ops.reset(arr.id(1)),
  ops.highlight(t.nodeId(3), "$warning"),
  ops.setValue(arr.id(2), "3"),
  ops.highlight(arr.id(2), "$warning"),
  ops.setText(status.id, "Visit node 3 → arr[2] = 3"),
  ops.setText("lmode", "Queue: [4, null, null, 5] (3 has no left, right=5)")
));

// ─── Serialize: Level 2 (node 4, null, null, node 5) ───
steps.push(step(
  "Serialize level 2: visit node 4, write to arr[3]",
  ops.reset(t.nodeId(3)),
  ops.reset(arr.id(2)),
  ops.highlight(t.nodeId(4), "$warning"),
  ops.setValue(arr.id(3), "4"),
  ops.highlight(arr.id(3), "$warning"),
  ops.setText(status.id, "Visit node 4 → arr[3] = 4"),
  ops.setText("lmode", "Queue: [null, null, 5] (4 is a leaf)")
));

steps.push(teach(
  "Node 2 had no right child: write 'null' to arr[4]",
  'Node <span class="highlight">2</span> has a left child (4) but <span class="warn">no right child</span>. ' +
    'We write <span class="warn">null</span> at arr[4] to mark the missing spot. ' +
    'This is important — without it, we would not know where to place nodes during deserialization.',
  ops.reset(t.nodeId(4)),
  ops.reset(arr.id(3)),
  ops.setValue(arr.id(4), "null"),
  ops.highlight(arr.id(4), "$muted"),
  ops.setText(status.id, "No right child for node 2 → arr[4] = null"),
  ops.setText("lmode", "Queue: [null, 5]")
));

steps.push(step(
  "Node 3 had no left child: write 'null' to arr[5]",
  ops.reset(arr.id(4)),
  ops.setValue(arr.id(5), "null"),
  ops.highlight(arr.id(5), "$muted"),
  ops.setText(status.id, "No left child for node 3 → arr[5] = null"),
  ops.setText("lmode", "Queue: [5]")
));

steps.push(step(
  "Visit node 5: write to arr[6]",
  ops.reset(arr.id(5)),
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setValue(arr.id(6), "5"),
  ops.highlight(arr.id(6), "$warning"),
  ops.setText(status.id, "Visit node 5 → arr[6] = 5"),
  ops.setText("lmode", "Queue: [] — BFS complete!")
));

// ─── Serialization complete ───
steps.push(annotatedStep(
  "Serialization complete: [1, 2, 3, 4, null, null, 5]",
  "invariant",
  {
    narration: '<span class="success">Serialization done!</span> The tree is now encoded as: ' +
      '<span class="highlight">[1, 2, 3, 4, null, null, 5]</span>. ' +
      'The nulls tell us exactly which children are missing. ' +
      'We can save this array to a file or send it anywhere.',
    phase: "main-loop",
  },
  ops.reset(t.nodeId(5)),
  ops.reset(arr.id(6)),
  ops.highlight(arr.ids, "$success"),
  ops.markDone(t.nodeIds),
  ops.setText(status.id, "Serialized: [1, 2, 3, 4, null, null, 5]"),
  ops.setText("lmode", "Serialization complete! Now let's deserialize.")
));

// ─── Deserialization: rebuild from array ───
steps.push(teach(
  "Deserialize: read the array and rebuild the tree using BFS",
  'To <span class="highlight">deserialize</span>, we read the array left to right. ' +
    'The first value is the <span class="highlight">root</span>. ' +
    'For each node, the next two values in the array are its <span class="highlight">left and right children</span>. ' +
    'If a value is <span class="warn">null</span>, that child does not exist. ' +
    'We use a queue to keep track of which node needs children next.',
  ops.reset(t.nodeIds),
  ops.reset(arr.ids),
  ops.setText(status.id, "Deserialize: read array → rebuild tree"),
  ops.setText("lmode", "Mode: Deserialize (BFS rebuild)")
));

// ─── Deserialize: root from arr[0] ───
steps.push(step(
  "Read arr[0]=1: create root node 1",
  ops.highlight(arr.id(0), "$primary"),
  ops.highlight(t.nodeId(1), "$primary"),
  ops.setText(status.id, "arr[0]=1 → create root node 1"),
  ops.setText("lmode", "Queue: [node1]. Next: read arr[1], arr[2] as children of 1")
));

// ─── Deserialize: children of root ───
steps.push(step(
  "Read arr[1]=2: create node 2 as left child of 1",
  ops.reset(arr.id(0)),
  ops.reset(t.nodeId(1)),
  ops.highlight(arr.id(1), "$primary"),
  ops.highlight(t.nodeId(2), "$primary"),
  ops.setText(status.id, "arr[1]=2 → left child of node 1"),
  ops.setText("lmode", "Queue: [node2]. Next: arr[2] = right child of 1")
));

steps.push(step(
  "Read arr[2]=3: create node 3 as right child of 1",
  ops.reset(arr.id(1)),
  ops.reset(t.nodeId(2)),
  ops.highlight(arr.id(2), "$primary"),
  ops.highlight(t.nodeId(3), "$primary"),
  ops.setText(status.id, "arr[2]=3 → right child of node 1"),
  ops.setText("lmode", "Queue: [node2, node3]. Next: children of node 2")
));

// ─── Deserialize: children of node 2 ───
steps.push(step(
  "Read arr[3]=4: create node 4 as left child of 2",
  ops.reset(arr.id(2)),
  ops.reset(t.nodeId(3)),
  ops.highlight(arr.id(3), "$primary"),
  ops.highlight(t.nodeId(4), "$primary"),
  ops.setText(status.id, "arr[3]=4 → left child of node 2"),
  ops.setText("lmode", "Queue: [node3, node4]. Next: arr[4] = right child of 2")
));

steps.push(step(
  "Read arr[4]=null: node 2 has no right child",
  ops.reset(arr.id(3)),
  ops.reset(t.nodeId(4)),
  ops.highlight(arr.id(4), "$muted"),
  ops.setText(status.id, "arr[4]=null → node 2 has no right child"),
  ops.setText("lmode", "Queue: [node3, node4]. Next: children of node 3")
));

// ─── Deserialize: children of node 3 ───
steps.push(step(
  "Read arr[5]=null: node 3 has no left child",
  ops.reset(arr.id(4)),
  ops.highlight(arr.id(5), "$muted"),
  ops.setText(status.id, "arr[5]=null → node 3 has no left child"),
  ops.setText("lmode", "Queue: [node4]. Next: arr[6] = right child of 3")
));

steps.push(step(
  "Read arr[6]=5: create node 5 as right child of 3",
  ops.reset(arr.id(5)),
  ops.highlight(arr.id(6), "$primary"),
  ops.highlight(t.nodeId(5), "$primary"),
  ops.setText(status.id, "arr[6]=5 → right child of node 3"),
  ops.setText("lmode", "Queue: [node4, node5]. Both are leaves — done!")
));

// ─── Deserialization complete ───
steps.push(annotatedStep(
  "Deserialization complete! The tree is perfectly reconstructed.",
  "invariant",
  {
    narration: '<span class="success">Deserialization done!</span> By reading the array in BFS order and using ' +
      'a queue to track which node needs children next, we rebuilt the exact same tree. ' +
      'The <span class="highlight">null</span> markers told us exactly which children were missing.',
    phase: "main-loop",
  },
  ops.reset(arr.id(6)),
  ops.reset(t.nodeId(5)),
  ops.highlight(t.nodeIds, "$success"),
  ops.highlight(arr.ids, "$success"),
  ops.setText(status.id, "Tree rebuilt! Matches the original perfectly."),
  ops.setText("lmode", "Deserialize complete! Tree reconstructed from array.")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Serialize/Deserialize: O(n) time and space for both directions.",
  "explanation",
  {
    narration: '<span class="success">Summary:</span> ' +
      '<span class="highlight">Serialization</span> (tree → array) uses BFS to visit each node once: <span class="success">O(n)</span>. ' +
      '<span class="highlight">Deserialization</span> (array → tree) reads each element once: <span class="success">O(n)</span>. ' +
      'The null markers preserve the tree structure so we can rebuild it exactly. ' +
      'This technique is used in databases, network protocols, and coding interviews!',
    phase: "cleanup",
  },
  ops.markDone(t.nodeIds),
  ops.markDone(arr.ids),
  ops.setText(status.id, "Serialize + Deserialize: both O(n) time and space")
));

const v = viz(
  {
    algorithm: "serialize_deserialize_tree",
    title: "Serialize & Deserialize a Binary Tree (BFS)",
    description: "Convert a binary tree to a flat array using level-order (BFS) traversal with null markers, then reconstruct the tree from the array.",
    category: "tree",
    difficulty: "intermediate",
    complexity: { time: "O(n)", space: "O(n)" },
    input: "Tree: 1(2(4,_),3(_,5)). Serialized: [1, 2, 3, 4, null, null, 5]",
  },
  [t, arr, title, status, modeLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
