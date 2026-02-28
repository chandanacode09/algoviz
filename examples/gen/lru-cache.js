// LRU Cache — Doubly-linked list + hash map visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// We will build the doubly-linked list and hash map dynamically
// Capacity = 3
const CAPACITY = 3;

// Positions for the linked list area (top half)
const LL_Y = 200;
const LL_START_X = 150;
const LL_GAP = 150;

// Hash map as an array (bottom half)
const hashArr = layout.array(["_", "_", "_", "_"], {
  y: 420,
  cellWidth: 80,
  cellHeight: 50,
  gap: 15,
  sublabels: true,
  prefix: "h",
});

const title = titleLabel("LRU Cache (Capacity=3)");
const status = statusLabel("");
const llLabel = label("Doubly-Linked List (Most Recent -> Least Recent)", 500, 145, {
  id: "lllbl", fontSize: 14, fill: "$text",
});
const hashLabel = label("Hash Map: key -> node", 500, 395, {
  id: "hashlbl", fontSize: 14, fill: "$text",
});
const opsLabel = label("Operations: put(1,A), put(2,B), put(3,C), get(2), put(4,D)", 500, 75, {
  id: "opslbl", fontSize: 12, fill: "$muted",
});

// We use sublabels on hash array for keys
// hashArr slots: index 0=key1, 1=key2, 2=key3, 3=key4

const steps = [];

// State tracking
const cache = new Map(); // key -> {nodeId, edgeToNextId, value}
let order = []; // front = most recent, back = least recent
let nodeCounter = 0;
let edgeCounter = 0;

function makeNodeId() { return `ln${nodeCounter++}`; }
function makeEdgeId() { return `ledge${edgeCounter++}`; }

// Setup
steps.push(annotatedStep(
  "LRU Cache: O(1) get and put using hash map + doubly-linked list",
  "initialization",
  {
    narration: 'An <span class="highlight">LRU Cache</span> (Least Recently Used) supports <span class="success">O(1)</span> ' +
      'get and put operations. It uses two data structures: ' +
      '(1) A <span class="highlight">hash map</span> for O(1) key lookup, and ' +
      '(2) A <span class="highlight">doubly-linked list</span> to track access order. ' +
      'The <span class="warn">most recently used</span> item is at the front; the ' +
      '<span class="danger">least recently used</span> is at the back. ' +
      'When capacity is exceeded, the back item (LRU) is evicted.',
    phase: "setup",
  },
  ops.setText(status.id, "LRU Cache: capacity=3, empty"),
  ops.highlight(hashArr.ids, "$default")
));

// Helper: create a visual node at a given position in the list
function createNodeVisual(key, value, position) {
  const nodeId = makeNodeId();
  const x = LL_START_X + position * LL_GAP;
  return {
    nodeId,
    actions: ops.create({ id: nodeId, type: "node", x, y: LL_Y, value: `${key}:${value}`, radius: 28, fill: "$success" }),
  };
}

// Helper: create edge between two nodes
function createEdgeVisual(sourceId, targetId) {
  const edgeId = makeEdgeId();
  return {
    edgeId,
    actions: ops.create({ id: edgeId, type: "edge", source: sourceId, target: targetId, directed: true }),
  };
}

// Helper: reposition all nodes in order and rebuild edges
function rebuildListVisual(stepDesc, extraActions) {
  const actions = [];
  // Remove all existing edges
  const allEdgeIds = [];
  for (const entry of cache.values()) {
    if (entry.edgeToNextId) {
      allEdgeIds.push(entry.edgeToNextId);
    }
  }
  for (const eid of allEdgeIds) {
    actions.push(...ops.remove(eid));
  }

  // Reposition nodes
  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    const entry = cache.get(key);
    const x = LL_START_X + i * LL_GAP;
    actions.push(...ops.update(entry.nodeId, { x }));
    entry.edgeToNextId = null;
  }

  // Create new edges
  for (let i = 0; i < order.length - 1; i++) {
    const srcEntry = cache.get(order[i]);
    const tgtEntry = cache.get(order[i + 1]);
    const edge = createEdgeVisual(srcEntry.nodeId, tgtEntry.nodeId);
    srcEntry.edgeToNextId = edge.edgeId;
    actions.push(...edge.actions);
  }

  // Update hash map
  for (let i = 0; i < 4; i++) {
    const key = i + 1;
    if (cache.has(key)) {
      actions.push(...ops.setValue(hashArr.id(i), `${key}:${cache.get(key).value}`));
      actions.push(...ops.highlight(hashArr.id(i), "$primary"));
    } else {
      actions.push(...ops.setValue(hashArr.id(i), "_"));
      actions.push(...ops.reset(hashArr.id(i)));
    }
  }

  if (extraActions) {
    actions.push(...extraActions);
  }

  steps.push(step(stepDesc, ...actions.map(a => [a])));
}

// ─── Operation 1: put(1, A) ───
steps.push(teach(
  "put(1, A) — insert first entry",
  'Insert key <span class="success">1</span> with value <span class="success">A</span>. ' +
    'Cache is empty, so we simply create a new node and add it to the front of the list. ' +
    'We also add an entry to the <span class="highlight">hash map</span> mapping key 1 to this node.',
  ops.setText(status.id, "put(1, A) — cache is empty, add to front")
));

{
  const node = createNodeVisual(1, "A", 0);
  cache.set(1, { nodeId: node.nodeId, edgeToNextId: null, value: "A" });
  order = [1];
  steps.push(step(
    "Create node 1:A, add to hash map",
    ...node.actions.map(a => [a]),
    ops.setValue(hashArr.id(0), "1:A"),
    ops.highlight(hashArr.id(0), "$primary"),
    ops.setText(status.id, "Cache: [1:A], size=1/3")
  ));
}

// ─── Operation 2: put(2, B) ───
steps.push(teach(
  "put(2, B) — insert at front, shift existing",
  'Insert key <span class="success">2</span> with value <span class="success">B</span>. ' +
    'New entries always go to the <span class="highlight">front</span> of the list (most recently used). ' +
    'Node 1:A moves to position 2.',
  ops.setText(status.id, "put(2, B) — add to front")
));

{
  const node = createNodeVisual(2, "B", 0);
  cache.set(2, { nodeId: node.nodeId, edgeToNextId: null, value: "B" });
  order = [2, 1];
  steps.push(step(
    "Create node 2:B at front",
    ...node.actions.map(a => [a]),
    ops.setText(status.id, "Created node 2:B")
  ));
  rebuildListVisual("Reorder list: 2:B -> 1:A", [
    ...ops.setText(status.id, "Cache: [2:B -> 1:A], size=2/3"),
  ]);
}

// ─── Operation 3: put(3, C) ───
steps.push(step(
  "put(3, C) — insert at front, cache now full",
  ops.setText(status.id, "put(3, C) — add to front, cache will be full")
));

{
  const node = createNodeVisual(3, "C", 0);
  cache.set(3, { nodeId: node.nodeId, edgeToNextId: null, value: "C" });
  order = [3, 2, 1];
  steps.push(step(
    "Create node 3:C at front",
    ...node.actions.map(a => [a]),
    ops.setText(status.id, "Created node 3:C")
  ));
  rebuildListVisual("Reorder: 3:C -> 2:B -> 1:A (full)", [
    ...ops.setText(status.id, "Cache: [3:C -> 2:B -> 1:A], size=3/3 (FULL)"),
  ]);
}

// ─── Operation 4: get(2) ───
steps.push(teach(
  "get(2) — move accessed node to front",
  '<span class="highlight">get(2)</span> looks up key 2 in the hash map in O(1). ' +
    'Since key 2 exists (value=B), we return B and <span class="warn">move node 2:B to the front</span> ' +
    'of the list (it is now the most recently used). ' +
    'The order changes from [3,2,1] to [<span class="success">2</span>,3,1].',
  ops.highlight(hashArr.id(1), "$warning"),
  ops.setText(status.id, "get(2) — found! Move to front")
));

{
  // Highlight the node being accessed
  const entry = cache.get(2);
  steps.push(step(
    "Found node 2:B, move to front of list",
    ops.highlight(entry.nodeId, "$warning"),
    ops.setText(status.id, "Moving 2:B to front")
  ));
  order = [2, 3, 1];
  rebuildListVisual("List reordered: 2:B -> 3:C -> 1:A", [
    ...ops.highlight(cache.get(2).nodeId, "$success"),
    ...ops.setText(status.id, "get(2)=B, Cache: [2:B -> 3:C -> 1:A]"),
  ]);
}

// ─── Operation 5: put(4, D) — triggers eviction ───
steps.push(teach(
  "put(4, D) — cache full, must evict LRU (key 1)",
  'Cache is at capacity (3/3). To insert key <span class="success">4</span>, we must ' +
    '<span class="danger">evict</span> the <span class="danger">least recently used</span> item. ' +
    'That is the node at the <span class="danger">back of the list</span>: node 1:A. ' +
    'We remove it from both the list and the hash map, then insert 4:D at the front.',
  ops.highlight(cache.get(1).nodeId, "$danger"),
  ops.setText(status.id, "put(4, D) — evicting LRU: key 1")
));

{
  // Remove LRU node (key 1) — remove edges first, then node
  const lruEntry = cache.get(1);
  const removeActions = [];
  // Remove edge pointing to key 1 (from key 3)
  const entry3 = cache.get(3);
  if (entry3.edgeToNextId) {
    removeActions.push(...ops.remove(entry3.edgeToNextId));
    entry3.edgeToNextId = null;
  }
  removeActions.push(...ops.remove(lruEntry.nodeId));
  removeActions.push(...ops.setValue(hashArr.id(0), "_"));
  removeActions.push(...ops.reset(hashArr.id(0)));

  steps.push(step(
    "Remove LRU node 1:A from list and hash map",
    ...removeActions.map(a => [a]),
    ops.setText(status.id, "Evicted key 1")
  ));

  cache.delete(1);
  order = order.filter(k => k !== 1);

  // Now insert key 4
  const node = createNodeVisual(4, "D", 0);
  cache.set(4, { nodeId: node.nodeId, edgeToNextId: null, value: "D" });
  order = [4, 2, 3];

  steps.push(step(
    "Insert node 4:D at front",
    ...node.actions.map(a => [a]),
    ops.setText(status.id, "Inserting 4:D at front")
  ));

  rebuildListVisual("Final: 4:D -> 2:B -> 3:C", [
    ...ops.setText(status.id, "Cache: [4:D -> 2:B -> 3:C], size=3/3"),
  ]);
}

// Final summary
const finalNodeIds = order.map(k => cache.get(k).nodeId);
steps.push(annotatedStep(
  "LRU Cache complete! O(1) get and put achieved.",
  "explanation",
  {
    narration: '<span class="success">LRU Cache operations complete!</span> ' +
      'We performed put(1,A), put(2,B), put(3,C), get(2), put(4,D). ' +
      'Key 1 was evicted because it was the <span class="danger">least recently used</span>. ' +
      'The combination of a <span class="highlight">hash map</span> (O(1) lookup) and a ' +
      '<span class="highlight">doubly-linked list</span> (O(1) insert/remove at any position) ' +
      'gives us <span class="success">O(1)</span> for both get and put. ' +
      'This is a classic <span class="highlight">design pattern</span> used in caches, databases, and OS page replacement.',
    phase: "cleanup",
  },
  ops.markDone(finalNodeIds),
  ops.setText(status.id, "Done! O(1) get and put via hash + linked list")
));

const v = viz(
  {
    algorithm: "lru_cache",
    title: "LRU Cache — Hash Map + Doubly-Linked List",
    description: "LRU Cache with capacity 3: put(1,A), put(2,B), put(3,C), get(2), put(4,D). Shows eviction of least recently used entry.",
    category: "other",
    difficulty: "advanced",
    complexity: { time: "O(1)", space: "O(capacity)" },
    input: "Capacity=3, ops: put(1,A), put(2,B), put(3,C), get(2), put(4,D)",
  },
  [hashArr, title, status, llLabel, hashLabel, opsLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
