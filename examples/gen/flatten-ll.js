// Flatten a Multilevel Doubly Linked List
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Main list: 1 -> 2 -> 3 -> 4 (top row)
const mainLL = layout.linkedList([1, 2, 3, 4], { y: 200, gap: 150, prefix: "n" });

// Child list of node 2: 5 -> 6 (below node 2)
// Position them below node 2
const node2 = mainLL.actors.find(a => a.type === "node" && a.value === 2);
const node3 = mainLL.actors.find(a => a.type === "node" && a.value === 3);

const title = titleLabel("Flatten Multilevel Linked List");
const status = statusLabel("");
const curPtr = pointer("cur", mainLL.id(0), "above", { id: "pcur" });
const infoLabel = label("Node 2 has a child list: 5 -> 6", 500, 75, {
  id: "info", fontSize: 13, fill: "$muted",
});

const steps = [];

// Create child nodes below node 2
const child5Id = "child5";
const child6Id = "child6";
const childEdgeId = "ce56";
const childArrowId = "ca25"; // arrow from node 2 down to child 5

const child5X = node2.x;
const child5Y = node2.y + 120;
const child6X = node2.x + 150;
const child6Y = node2.y + 120;

// Setup: show the initial structure
steps.push(annotatedStep(
  "Multilevel linked list: 1 -> 2 -> 3 -> 4, node 2 has child list 5 -> 6",
  "initialization",
  {
    narration: 'A <span class="highlight">multilevel linked list</span> is a singly linked list where some nodes ' +
      'have a <span class="warn">child pointer</span> to another linked list. ' +
      'The goal is to <span class="highlight">flatten</span> it into a single-level list by weaving child lists ' +
      'into the main list. Node 2 has a child list: <span class="warn">5 -> 6</span>. ' +
      'The result should be: 1 -> 2 -> <span class="success">5 -> 6</span> -> 3 -> 4.',
    phase: "setup",
  },
  ops.setText(status.id, "Main: 1->2->3->4, Node 2 has child: 5->6")
));

// Create child nodes visually
steps.push(step(
  "Show child list: 5 -> 6 below node 2",
  ops.create({ id: child5Id, type: "node", x: child5X, y: child5Y, value: 5, radius: 25 }),
  ops.create({ id: child6Id, type: "node", x: child6X, y: child6Y, value: 6, radius: 25 }),
  ops.create({ id: childEdgeId, type: "edge", source: child5Id, target: child6Id, directed: true }),
  ops.create({ id: childArrowId, type: "edge", source: mainLL.id(1), target: child5Id, directed: true, stroke: "$warning", dashArray: "5,5" }),
  ops.highlight(child5Id, "$warning"),
  ops.highlight(child6Id, "$warning"),
  ops.setText(status.id, "Child list shown below node 2")
));

// Start flattening: traverse the main list
steps.push(teach(
  "Start traversing: cur = node 1",
  'We traverse the main list with a pointer <span class="highlight">cur</span>. ' +
    'At each node, we check if it has a <span class="warn">child list</span>. ' +
    'If yes, we weave the child list between <span class="highlight">cur</span> and <span class="highlight">cur.next</span>. ' +
    'The key is to connect the <span class="success">tail of the child list</span> to cur.next before rewiring.',
  ops.movePointer("pcur", mainLL.id(0)),
  ops.highlight(mainLL.id(0), "$primary"),
  ops.setText(status.id, "cur = node 1, no child — move on")
));

// Node 1 has no child, advance
steps.push(step(
  "Node 1 has no child, advance to node 2",
  ops.reset(mainLL.id(0)),
  ops.movePointer("pcur", mainLL.id(1)),
  ops.highlight(mainLL.id(1), "$primary"),
  ops.setText(status.id, "cur = node 2, has child list!")
));

// Node 2 has a child! Begin flattening
steps.push(teach(
  "Node 2 has a child list! Flatten it between node 2 and node 3",
  '<span class="highlight">Node 2 has a child list!</span> We need to: ' +
    '(1) Find the <span class="warn">tail</span> of the child list (node 6), ' +
    '(2) Connect <span class="success">tail (6) -> cur.next (3)</span>, ' +
    '(3) Connect <span class="success">cur (2) -> child head (5)</span>, ' +
    '(4) Remove the child pointer. This weaves 5->6 into the main list.',
  ops.highlight(mainLL.id(1), "$warning"),
  ops.highlight(child5Id, "$warning"),
  ops.highlight(child6Id, "$warning"),
  ops.setText(status.id, "Flatten child list of node 2")
));

// Step 1: Find tail of child list (node 6)
steps.push(step(
  "Find tail of child list: node 6",
  ops.highlight(child6Id, "$primary"),
  ops.setText(status.id, "Tail of child list = node 6")
));

// Step 2: Connect tail (6) -> cur.next (3)
// Remove old edge from 2->3, create 6->3
const edge6to3Id = "e6to3";
steps.push(teach(
  "Connect tail (6) -> node 3 (cur.next)",
  'First, connect the <span class="success">tail of the child list (node 6)</span> to ' +
    '<span class="highlight">cur.next (node 3)</span>. This ensures node 3 and beyond remain reachable. ' +
    '<span class="warn">Always connect new links before breaking old ones</span> to avoid losing references!',
  ops.create({ id: edge6to3Id, type: "edge", source: child6Id, target: mainLL.id(2), directed: true }),
  ops.highlight(child6Id, "$success"),
  ops.highlight(mainLL.id(2), "$warning"),
  ops.setText(status.id, "Connected: 6 -> 3")
));

// Step 3: Connect cur (2) -> child head (5), remove old 2->3 edge
const edge2to5Id = "e2to5";
steps.push(teach(
  "Rewire: node 2 -> node 5 (replace 2->3 with 2->5)",
  'Now rewire: <span class="success">node 2 points to node 5</span> instead of node 3. ' +
    'We <span class="danger">remove</span> the old edge 2->3 and <span class="success">add</span> edge 2->5. ' +
    'The child list is now woven into the main list: 1 -> 2 -> 5 -> 6 -> 3 -> 4.',
  ops.remove(mainLL.edgeIds[1]),
  ops.create({ id: edge2to5Id, type: "edge", source: mainLL.id(1), target: child5Id, directed: true }),
  ops.highlight(mainLL.id(1), "$success"),
  ops.highlight(child5Id, "$success"),
  ops.setText(status.id, "Rewired: 2 -> 5 (was 2 -> 3)")
));

// Step 4: Remove old child pointer (dashed arrow)
steps.push(step(
  "Remove child pointer from node 2",
  ops.remove(childArrowId),
  ops.setText(status.id, "Child pointer removed")
));

// Move child nodes up to main row level
steps.push(step(
  "Move child nodes 5 and 6 up to main row",
  ops.update(child5Id, { y: 200 }),
  ops.update(child6Id, { y: 200 }),
  ops.highlight(child5Id, "$success"),
  ops.highlight(child6Id, "$success"),
  ops.setText(status.id, "Flattened: 1 -> 2 -> 5 -> 6 -> 3 -> 4")
));

// Continue traversal — node 5 has no child
steps.push(step(
  "Continue: cur = node 5, no child",
  ops.movePointer("pcur", child5Id),
  ops.reset(mainLL.id(1)),
  ops.highlight(child5Id, "$primary"),
  ops.setText(status.id, "cur = node 5, no child — advance")
));

// Node 6 has no child
steps.push(step(
  "cur = node 6, no child",
  ops.reset(child5Id),
  ops.movePointer("pcur", child6Id),
  ops.highlight(child6Id, "$primary"),
  ops.setText(status.id, "cur = node 6, no child — advance")
));

// Node 3 has no child
steps.push(step(
  "cur = node 3, no child",
  ops.reset(child6Id),
  ops.movePointer("pcur", mainLL.id(2)),
  ops.highlight(mainLL.id(2), "$primary"),
  ops.setText(status.id, "cur = node 3, no child — advance")
));

// Node 4 has no child, end of list
steps.push(step(
  "cur = node 4, no child — end of list",
  ops.reset(mainLL.id(2)),
  ops.movePointer("pcur", mainLL.id(3)),
  ops.highlight(mainLL.id(3), "$primary"),
  ops.setText(status.id, "cur = node 4, end of list")
));

// Final
const allNodeIds = [mainLL.id(0), mainLL.id(1), child5Id, child6Id, mainLL.id(2), mainLL.id(3)];
steps.push(annotatedStep(
  "Flattened list: 1 -> 2 -> 5 -> 6 -> 3 -> 4",
  "explanation",
  {
    narration: '<span class="success">Flattening complete!</span> The multilevel list is now a single-level list: ' +
      '<span class="success">1 -> 2 -> 5 -> 6 -> 3 -> 4</span>. ' +
      'The algorithm traverses the list once. At each node with a child: ' +
      '(1) Find the tail of the child list, (2) Connect tail to cur.next, (3) Connect cur to child head. ' +
      'For deeply nested children, we can use <span class="highlight">recursion</span>: flatten child lists first, then weave. ' +
      'Time: <span class="highlight">O(n)</span> — each node visited once. ' +
      'Space: <span class="highlight">O(1)</span> iterative, or O(d) recursive where d = max depth.',
    phase: "cleanup",
  },
  ops.markDone(allNodeIds),
  ops.setText(status.id, "Flattened: 1 -> 2 -> 5 -> 6 -> 3 -> 4")
));

const v = viz(
  {
    algorithm: "flatten_multilevel_linked_list",
    title: "Flatten Multilevel Linked List",
    description: "Flatten a multilevel linked list by weaving child lists into the main list. Node 2 has child list 5->6.",
    category: "linked-list",
    difficulty: "intermediate",
    complexity: { time: "O(n)", space: "O(1)" },
    input: "Main: [1,2,3,4], Node 2 child: [5,6]",
  },
  [mainLL, title, status, curPtr, infoLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
