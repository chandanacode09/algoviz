// Linked List Insert & Delete — educational visualization
// Demonstrates pointer manipulation for insert and delete operations
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build the initial linked list: 10 -> 20 -> 30 -> 40
const ll = layout.linkedList([10, 20, 30, 40]);
const title = titleLabel("Linked List: Insert & Delete");
const status = statusLabel("");

// Pointer to track current position
const curPtr = pointer("cur", ll.id(0), "above", { id: "pcur" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Initial linked list: 10 -> 20 -> 30 -> 40",
  "initialization",
  {
    narration: 'We have a <span class="highlight">singly linked list</span>: 10 → 20 → 30 → 40. ' +
      'Each node points to the next one. We will first <span class="warn">insert 25 at position 2</span> ' +
      '(between 20 and 30), then <span class="warn">delete the node with value 30</span>. ' +
      'The trick is rewiring the arrows (pointers) correctly!',
    phase: "setup",
  },
  ops.setText(status.id, "List: 10 → 20 → 30 → 40")
));

// ═══════════════════════════════════════════════════════════════════
// PART 1: Insert 25 at position 2 (between 20 and 30)
// ═══════════════════════════════════════════════════════════════════

steps.push(teach(
  "Goal: insert 25 at position 2 (between 20 and 30)",
  'To insert at position 2, we need to find the node <span class="highlight">just before</span> that position. ' +
    'That is node at position 1, which holds value <span class="warn">20</span>. ' +
    'We will walk the list to get there.',
  ops.setText(status.id, "Insert 25 at position 2")
));

// Walk to position 1 (node 20)
steps.push(teach(
  "Start at head (node 10), walk to position 1",
  'Start at the <span class="highlight">head</span> (node 10). We need to reach position 1. ' +
    'Move one step forward to node <span class="warn">20</span>.',
  ops.movePointer("pcur", ll.id(0)),
  ops.highlight(ll.id(0), "$primary"),
  ops.setText(status.id, "cur = node 10 (position 0)")
));

steps.push(step("Move to node 20 (position 1)",
  ops.reset(ll.id(0)),
  ops.movePointer("pcur", ll.id(1)),
  ops.highlight(ll.id(1), "$primary"),
  ops.setText(status.id, "cur = node 20 (position 1)")
));

// Create the new node 25
// Position it below and between nodes 20 and 30
const node20 = ll.actors.find(a => a.type === "node" && a.value === 20);
const node30 = ll.actors.find(a => a.type === "node" && a.value === 30);
const newNodeX = Math.round((node20.x + node30.x) / 2);
const newNodeY = node20.y + 80;

const n25id = "new25";
const eFrom20to25 = "e20to25";
const eFrom25to30 = "e25to30";

steps.push(teach(
  "Create new node with value 25",
  'We create a <span class="success">new node</span> holding value <span class="success">25</span>. ' +
    'It is not connected to anything yet — it is floating by itself. ' +
    'Next, we need to wire it into the list.',
  ops.create({ id: n25id, type: "node", x: newNodeX, y: newNodeY, value: 25, radius: 25, fill: "$success" }),
  ops.setText(status.id, "Created new node: 25")
));

// Wire: 25.next = 30 (point new node to 30)
steps.push(teach(
  "Set 25.next = 30 (new node points to 30)",
  'First, make <span class="success">25</span> point to <span class="highlight">30</span>. ' +
    'This is safe — we have not broken any existing links yet. ' +
    '<span class="warn">Important</span>: always connect the new node <span class="warn">before</span> disconnecting the old link!',
  ops.create({ id: eFrom25to30, type: "edge", source: n25id, target: ll.id(2), directed: true }),
  ops.highlight(ll.id(2), "$warning"),
  ops.setText(status.id, "25 → 30 (new link)")
));

// Wire: 20.next = 25 (disconnect 20->30, connect 20->25)
// We need to remove the old edge from 20 to 30 and create a new one from 20 to 25
steps.push(teach(
  "Set 20.next = 25 (rewire: 20 now points to 25 instead of 30)",
  'Now rewire: make <span class="warn">20</span> point to <span class="success">25</span> instead of 30. ' +
    'We <span class="warn">remove the old arrow</span> from 20→30 and <span class="success">add a new arrow</span> from 20→25. ' +
    'The list is now: 10 → 20 → 25 → 30 → 40.',
  ops.remove(ll.edgeIds[1]),
  ops.create({ id: eFrom20to25, type: "edge", source: ll.id(1), target: n25id, directed: true }),
  ops.highlight(ll.id(1), "$success"),
  ops.setText(status.id, "20 → 25 → 30 (rewired!)")
));

// Settle: show the completed insertion
steps.push(annotatedStep(
  "Insert complete! List: 10 → 20 → 25 → 30 → 40",
  "explanation",
  {
    narration: '<span class="success">Insertion done!</span> The list is now 10 → 20 → 25 → 30 → 40. ' +
      'We did it in <span class="highlight">3 steps</span>: (1) walk to position before insertion, ' +
      '(2) point new node to the next node, (3) point previous node to new node. ' +
      'Insertion is <span class="highlight">O(n)</span> to find the spot, <span class="highlight">O(1)</span> to rewire.',
    phase: "main-loop",
  },
  ops.reset(ll.nodeIds),
  ops.highlight(n25id, "$default"),
  ops.reset(ll.id(2)),
  ops.setText(status.id, "List: 10 → 20 → 25 → 30 → 40")
));

// ═══════════════════════════════════════════════════════════════════
// PART 2: Delete the node with value 30
// ═══════════════════════════════════════════════════════════════════

steps.push(teach(
  "Goal: delete the node with value 30",
  'Now we want to <span class="warn">remove</span> the node holding value <span class="warn">30</span>. ' +
    'To delete a node, we need to find the node <span class="highlight">just before it</span> ' +
    'and make it skip over the one we are deleting.',
  ops.setText(status.id, "Delete node with value 30")
));

// Walk to find 30's predecessor (which is now 25)
steps.push(step("Start at head, walk to find the node before 30",
  ops.movePointer("pcur", ll.id(0)),
  ops.highlight(ll.id(0), "$primary"),
  ops.setText(status.id, "cur = 10, looking for node before 30")
));

steps.push(step("Move to node 20",
  ops.reset(ll.id(0)),
  ops.movePointer("pcur", ll.id(1)),
  ops.highlight(ll.id(1), "$primary"),
  ops.setText(status.id, "cur = 20, next is 25 (not 30 yet)")
));

steps.push(step("Move to node 25 — its next is 30!",
  ops.reset(ll.id(1)),
  ops.movePointer("pcur", n25id),
  ops.highlight(n25id, "$primary"),
  ops.setText(status.id, "cur = 25, next is 30 — found it!")
));

// Highlight node 30 as the one to delete
steps.push(teach(
  "Found it! Node 25 points to 30. We will bypass 30.",
  'Node <span class="highlight">25</span> currently points to <span class="warn">30</span>, ' +
    'and 30 points to <span class="highlight">40</span>. ' +
    'To delete 30, we make 25 point <span class="success">directly to 40</span>, skipping 30 entirely.',
  ops.highlight(ll.id(2), "$danger"),
  ops.highlight(ll.id(3), "$warning"),
  ops.setText(status.id, "Bypass: 25 will point to 40, skipping 30")
));

// Rewire: 25.next = 40 (bypass 30)
// Remove edge from 25 to 30, and edge from 30 to 40
// Create new edge from 25 to 40
const eFrom25to40 = "e25to40";

steps.push(teach(
  "Rewire: 25 now points to 40, bypassing 30",
  'We <span class="warn">remove</span> the arrow from 25→30 and the arrow from 30→40. ' +
    'Then we <span class="success">add a new arrow</span> from 25→40. ' +
    'Node 30 is now disconnected — no one points to it.',
  ops.remove(eFrom25to30),
  ops.remove(ll.edgeIds[2]),
  ops.create({ id: eFrom25to40, type: "edge", source: n25id, target: ll.id(3), directed: true }),
  ops.highlight(ll.id(2), "$danger"),
  ops.setText(status.id, "25 → 40 (30 is bypassed)")
));

// Remove node 30
steps.push(teach(
  "Remove node 30 from the list",
  'Node <span class="danger">30</span> is no longer part of the list. We remove it. ' +
    'In a real program, this is where the memory gets freed. ' +
    'The list is now: 10 → 20 → 25 → 40.',
  ops.remove(ll.id(2)),
  ops.reset(ll.id(3)),
  ops.setText(status.id, "Node 30 removed!")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Done! Final list: 10 → 20 → 25 → 40",
  "explanation",
  {
    narration: '<span class="success">All operations complete!</span> ' +
      'We inserted 25 and deleted 30. Final list: 10 → 20 → 25 → 40. ' +
      'Both insert and delete need us to <span class="highlight">find the right spot</span> (O(n) walk), ' +
      'then <span class="highlight">rewire pointers</span> (O(1)). ' +
      'The key lesson: always wire the new links <span class="warn">before</span> cutting the old ones!',
    phase: "cleanup",
  },
  ops.markDone(ll.id(0)),
  ops.markDone(ll.id(1)),
  ops.markDone(n25id),
  ops.markDone(ll.id(3)),
  ops.highlight(n25id, "$success"),
  ops.setText(status.id, "Final list: 10 → 20 → 25 → 40")
));

const v = viz(
  {
    algorithm: "linked_list_insert_delete",
    title: "Linked List — Insert & Delete",
    description: "Step-by-step insert and delete operations on a singly linked list, showing pointer rewiring.",
    category: "linked-list",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: "List: [10, 20, 30, 40]. Insert 25 at position 2, then delete 30.",
  },
  [ll, title, status, curPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
