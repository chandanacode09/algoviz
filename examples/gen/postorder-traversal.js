// Postorder Traversal — visit left subtree, right subtree, then root
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build a binary tree with 7 nodes:
//          10
//        /    \
//       5      15
//      / \    /  \
//     3   7  12   20
const t = layout.tree({
  value: 10,
  left: {
    value: 5,
    left: { value: 3 },
    right: { value: 7 },
  },
  right: {
    value: 15,
    left: { value: 12 },
    right: { value: 20 },
  },
});

const title = titleLabel("Postorder Traversal");
const status = statusLabel("");
const orderLabel = label("Order: []", 500, 550, {
  id: "orderlbl", fontSize: 14, fill: "$text",
});

const steps = [];
const visited = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Postorder traversal visits: left subtree, right subtree, then root",
  "initialization",
  {
    narration: '<span class="highlight">Postorder Traversal</span> follows a simple rule: ' +
      'for every node, visit the <span class="warn">left child first</span>, then the ' +
      '<span class="warn">right child</span>, and finally the <span class="success">node itself</span>. ' +
      'Think of it like this: <span class="highlight">children before parent</span> — always!',
    phase: "setup",
  },
  ops.setText(status.id, "Rule: Left → Right → Root (children before parent)")
));

// Postorder for the tree above: 3, 7, 5, 12, 20, 15, 10
// We manually walk through it step-by-step

// ─── Visit node 10 (root) — go left first ───
steps.push(teach(
  "Start at root (10) — but we can't process it yet!",
  'We start at the root <span class="highlight">10</span>, but in postorder we must visit ' +
    'the <span class="warn">left subtree first</span>. So we go left to <span class="highlight">5</span>.',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "At root 10 → go left first")
));

// ─── Visit node 5 — go left first ───
steps.push(teach(
  "At node 5 — go left first to node 3",
  'At node <span class="highlight">5</span>, we again must visit the ' +
    '<span class="warn">left subtree first</span>. Go left to <span class="highlight">3</span>.',
  ops.reset(t.nodeId(10)),
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setText(status.id, "At node 5 → go left first")
));

// ─── Visit node 3 — leaf, process it ───
steps.push(teach(
  "Node 3 is a leaf — no children, so process it!",
  'Node <span class="highlight">3</span> has no children. Since there is nothing to visit first, ' +
    'we can <span class="success">process it right away</span>. This is the first node in our output!',
  ops.reset(t.nodeId(5)),
  ops.highlight(t.nodeId(3), "$warning"),
  ops.setText(status.id, "Node 3: leaf node, process it!")
));

visited.push(3);
steps.push(step("Mark node 3 as processed",
  ops.markDone(t.nodeId(3)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Back to 5, now go right to 7 ───
steps.push(teach(
  "Back at node 5 — left done, now go right to node 7",
  'We are back at <span class="highlight">5</span>. The left subtree (3) is done. ' +
    'Now visit the <span class="warn">right subtree</span>: node <span class="highlight">7</span>.',
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setText(status.id, "At node 5 → left done, go right")
));

// ─── Visit node 7 — leaf, process it ───
steps.push(teach(
  "Node 7 is a leaf — process it!",
  'Node <span class="highlight">7</span> is also a leaf with no children. ' +
    '<span class="success">Process it!</span>',
  ops.reset(t.nodeId(5)),
  ops.highlight(t.nodeId(7), "$warning"),
  ops.setText(status.id, "Node 7: leaf node, process it!")
));

visited.push(7);
steps.push(step("Mark node 7 as processed",
  ops.markDone(t.nodeId(7)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Now process node 5 — both children done ───
steps.push(teach(
  "Both children of 5 are done — now process node 5!",
  'Node <span class="highlight">5</span> has both children processed (3 and 7). ' +
    'Now it is the parent\'s turn. <span class="success">Children before parent</span> — ' +
    'so we process <span class="success">5</span> now!',
  ops.highlight(t.nodeId(5), "$warning"),
  ops.setText(status.id, "Node 5: both children done, process parent!")
));

visited.push(5);
steps.push(step("Mark node 5 as processed",
  ops.markDone(t.nodeId(5)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Back at root 10, left subtree done, go right to 15 ───
steps.push(teach(
  "Back at root 10 — left subtree done, now go right to 15",
  'The entire left subtree of <span class="highlight">10</span> is processed. ' +
    'Now visit the <span class="warn">right subtree</span>, starting at <span class="highlight">15</span>.',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "At root 10 → left done, go right")
));

// ─── Visit node 15 — go left first to 12 ───
steps.push(teach(
  "At node 15 — go left first to node 12",
  'At node <span class="highlight">15</span>, we follow the rule: ' +
    '<span class="warn">left subtree first</span>. Go to <span class="highlight">12</span>.',
  ops.reset(t.nodeId(10)),
  ops.highlight(t.nodeId(15), "$warning"),
  ops.setText(status.id, "At node 15 → go left first")
));

// ─── Visit node 12 — leaf, process it ───
steps.push(teach(
  "Node 12 is a leaf — process it!",
  'Node <span class="highlight">12</span> is a leaf. <span class="success">Process it!</span>',
  ops.reset(t.nodeId(15)),
  ops.highlight(t.nodeId(12), "$warning"),
  ops.setText(status.id, "Node 12: leaf node, process it!")
));

visited.push(12);
steps.push(step("Mark node 12 as processed",
  ops.markDone(t.nodeId(12)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Back to 15, now go right to 20 ───
steps.push(teach(
  "Back at node 15 — left done, now go right to node 20",
  'Back at <span class="highlight">15</span>. Left subtree (12) is done. ' +
    'Now visit the <span class="warn">right subtree</span>: node <span class="highlight">20</span>.',
  ops.highlight(t.nodeId(15), "$warning"),
  ops.setText(status.id, "At node 15 → left done, go right")
));

// ─── Visit node 20 — leaf, process it ───
steps.push(teach(
  "Node 20 is a leaf — process it!",
  'Node <span class="highlight">20</span> is a leaf. <span class="success">Process it!</span>',
  ops.reset(t.nodeId(15)),
  ops.highlight(t.nodeId(20), "$warning"),
  ops.setText(status.id, "Node 20: leaf node, process it!")
));

visited.push(20);
steps.push(step("Mark node 20 as processed",
  ops.markDone(t.nodeId(20)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Now process node 15 — both children done ───
steps.push(teach(
  "Both children of 15 are done — process node 15!",
  'Node <span class="highlight">15</span> has both children processed (12 and 20). ' +
    '<span class="success">Children before parent</span> — process <span class="success">15</span>!',
  ops.highlight(t.nodeId(15), "$warning"),
  ops.setText(status.id, "Node 15: both children done, process parent!")
));

visited.push(15);
steps.push(step("Mark node 15 as processed",
  ops.markDone(t.nodeId(15)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Finally process the root 10 ───
steps.push(teach(
  "Both subtrees done — finally process the root (10)!",
  'Both the left subtree [3, 7, 5] and right subtree [12, 20, 15] are fully processed. ' +
    'The root <span class="highlight">10</span> is the very last node — ' +
    '<span class="success">children always come before their parent!</span>',
  ops.highlight(t.nodeId(10), "$warning"),
  ops.setText(status.id, "Root 10: all children done, process root last!")
));

visited.push(10);
steps.push(step("Mark root 10 as processed",
  ops.markDone(t.nodeId(10)),
  ops.setText("orderlbl", `Order: [${visited.join(", ")}]`),
  ops.setText(status.id, `Processed: [${visited.join(", ")}]`)
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Postorder traversal complete! Order: 3, 7, 5, 12, 20, 15, 10",
  "explanation",
  {
    narration: '<span class="success">Postorder traversal complete!</span> ' +
      'Final order: <span class="highlight">3, 7, 5, 12, 20, 15, 10</span>. ' +
      'Notice how the root (10) is always <span class="warn">last</span>. ' +
      'Every parent comes after its children. ' +
      'Postorder is useful for deleting trees (delete children before parent) ' +
      'and evaluating expression trees (compute operands before the operator). ' +
      'Time: <span class="highlight">O(n)</span> — we visit every node exactly once.',
    phase: "cleanup",
  },
  ops.setText(status.id, "Done! Order: 3, 7, 5, 12, 20, 15, 10")
));

const v = viz(
  {
    algorithm: "postorder_traversal",
    title: "Postorder Traversal — Children Before Parent",
    description: "Step-by-step postorder traversal of a binary tree: visit left subtree, right subtree, then root.",
    category: "tree",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(h)" },
    input: "Binary tree: [10, 5, 15, 3, 7, 12, 20]",
  },
  [t, title, status, orderLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
