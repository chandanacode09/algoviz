// Kruskal's Minimum Spanning Tree — sort globally, add greedily
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build an undirected weighted graph with 6 nodes
const g = layout.graph(
  [
    { id: "A", value: "A" },
    { id: "B", value: "B" },
    { id: "C", value: "C" },
    { id: "D", value: "D" },
    { id: "E", value: "E" },
    { id: "F", value: "F" },
  ],
  [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "B", to: "C", weight: 3 },
    { from: "B", to: "D", weight: 5 },
    { from: "C", to: "D", weight: 1 },
    { from: "C", to: "E", weight: 6 },
    { from: "D", to: "E", weight: 4 },
    { from: "D", to: "F", weight: 7 },
    { from: "E", to: "F", weight: 3 },
  ],
  { directed: false }
);

const title = titleLabel("Kruskal's Algorithm — MST");
const status = statusLabel("Build Minimum Spanning Tree");
const mstLabel = label("MST edges: (none) | Weight: 0", 500, 550, {
  id: "mst", fontSize: 14, fill: "$text",
});

const steps = [];

// --- Initialization ---
steps.push(annotatedStep(
  "Initialize: sort all edges by weight, prepare Union-Find",
  "initialization",
  {
    narration: '<span class="highlight">Kruskal\'s Algorithm</span> builds an MST by processing edges in order of weight. ' +
      'Key idea: <span class="warn">sort globally, add greedily, skip if cycle</span>. ' +
      'We use a <span class="highlight">Union-Find</span> (disjoint set) data structure to efficiently detect cycles. ' +
      'Initially, each node is its own component.',
    phase: "setup",
  },
  ops.setText(status.id, "Kruskal's: sort edges, add greedily"),
  ops.setText("mst", "MST edges: (none) | Weight: 0")
));

// All edges sorted by weight
const edges = [
  { from: "C", to: "D", w: 1 },
  { from: "A", to: "C", w: 2 },
  { from: "B", to: "C", w: 3 },
  { from: "E", to: "F", w: 3 },
  { from: "A", to: "B", w: 4 },
  { from: "D", to: "E", w: 4 },
  { from: "B", to: "D", w: 5 },
  { from: "C", to: "E", w: 6 },
  { from: "D", to: "F", w: 7 },
];

steps.push(teach(
  "Edges sorted by weight: C-D(1), A-C(2), B-C(3), E-F(3), A-B(4), D-E(4), B-D(5), C-E(6), D-F(7)",
  'All 9 edges sorted: <span class="highlight">C-D(1), A-C(2), B-C(3), E-F(3), A-B(4), D-E(4), B-D(5), C-E(6), D-F(7)</span>. ' +
    'We need V-1 = <span class="warn">5 edges</span> for the MST (6 nodes). ' +
    'Process each edge: if it connects two different components, add it. Otherwise, skip (it would create a cycle).',
  ops.setText(status.id, "9 edges sorted by weight. Need 5 for MST."),
  ops.setText("mst", "Sorted: C-D(1), A-C(2), B-C(3), E-F(3), A-B(4), D-E(4), B-D(5), C-E(6), D-F(7)")
));

// Union-Find simulation
const parentUF = { A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" };
function find(x) {
  while (parentUF[x] !== x) {
    parentUF[x] = parentUF[parentUF[x]]; // path compression
    x = parentUF[x];
  }
  return x;
}
function union(x, y) {
  const rx = find(x);
  const ry = find(y);
  if (rx === ry) return false;
  parentUF[rx] = ry;
  return true;
}

function getEdgeId(from, to) {
  try { return g.edgeId(from, to); } catch (e) {
    try { return g.edgeId(to, from); } catch (e2) { return null; }
  }
}

const mstEdges = [];
let totalWeight = 0;
let mstCount = 0;

for (let i = 0; i < edges.length; i++) {
  const e = edges[i];
  const edgeId = getEdgeId(e.from, e.to);

  // Check if adding this edge creates a cycle
  const rootFrom = find(e.from);
  const rootTo = find(e.to);
  const createsCycle = (rootFrom === rootTo);

  if (createsCycle) {
    // Rejected — would create a cycle
    steps.push(teach(
      `Edge ${e.from}-${e.to} (w=${e.w}): REJECTED — would create a cycle`,
      `<span class="danger">Reject</span> edge ${e.from}-${e.to} (weight ${e.w}). ` +
        `Both ${e.from} and ${e.to} are already in the <span class="highlight">same component</span> ` +
        `(root: ${rootFrom}). Adding this edge would create a <span class="warn">cycle</span>. ` +
        `Union-Find detects this in nearly O(1) time with path compression.`,
      ops.highlightEdge(edgeId, "$danger"),
      ops.highlight([g.nodeId(e.from), g.nodeId(e.to)], "$danger"),
      ops.setText(status.id, `Edge #${i + 1}: ${e.from}-${e.to}(${e.w}) — REJECTED (cycle)`)
    ));

    steps.push(step(
      `Reset rejected edge ${e.from}-${e.to}`,
      ops.resetEdge(edgeId),
      ops.reset([g.nodeId(e.from), g.nodeId(e.to)])
    ));
  } else {
    // Accepted — connects two different components
    union(e.from, e.to);
    mstCount++;
    totalWeight += e.w;
    mstEdges.push(`${e.from}-${e.to}(${e.w})`);

    steps.push(teach(
      `Edge ${e.from}-${e.to} (w=${e.w}): ACCEPTED — connects different components`,
      `<span class="success">Accept</span> edge ${e.from}-${e.to} (weight ${e.w}). ` +
        `${e.from} (root: ${rootFrom}) and ${e.to} (root: ${rootTo}) are in ` +
        `<span class="warn">different components</span>. Adding this edge is safe — no cycle. ` +
        `MST now has <span class="highlight">${mstCount}/${5} edges</span>, total weight: ${totalWeight}.`,
      ops.highlightEdge(edgeId, "$success"),
      ops.highlight([g.nodeId(e.from), g.nodeId(e.to)], "$success"),
      ops.setText(status.id, `Edge #${i + 1}: ${e.from}-${e.to}(${e.w}) — ACCEPTED`),
      ops.setText("mst", `MST: ${mstEdges.join(", ")} | Weight: ${totalWeight}`)
    ));

    // Mark nodes as part of MST
    steps.push(step(
      `${e.from}-${e.to} added to MST (${mstCount}/5 edges)`,
      ops.markDone([g.nodeId(e.from), g.nodeId(e.to)])
    ));

    // Stop early if we have V-1 edges
    if (mstCount === 5) {
      steps.push(step(
        "MST complete! All 5 edges found — remaining edges skipped.",
        ops.setText(status.id, "MST has V-1 = 5 edges — done!")
      ));
      break;
    }
  }
}

// --- Final result ---
steps.push(annotatedStep(
  `Kruskal's complete! MST weight = ${totalWeight}`,
  "explanation",
  {
    narration: `<span class="success">MST found!</span> Edges: <span class="highlight">${mstEdges.join(", ")}</span>. ` +
      `Total weight: <span class="highlight">${totalWeight}</span>. ` +
      `Kruskal's processes edges globally by weight, unlike Prim's which grows from a single node. ` +
      `Time: <span class="highlight">O(E log E)</span> dominated by sorting. ` +
      `Union-Find operations are nearly O(1) with path compression and union by rank. ` +
      `Both Kruskal's and Prim's produce the same MST (when edge weights are unique).`,
    phase: "cleanup",
  },
  ops.markDone(g.nodeIds),
  ops.setText(status.id, `Kruskal's complete! MST weight = ${totalWeight}`),
  ops.setText("mst", `MST: ${mstEdges.join(", ")} | Total: ${totalWeight}`)
));

const v = viz(
  {
    algorithm: "kruskals_mst",
    title: "Kruskal's Algorithm — Minimum Spanning Tree",
    description: "Build MST by sorting edges globally and adding greedily with Union-Find cycle detection.",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O(E log E)", space: "O(V)" },
    input: "Undirected weighted graph: 6 nodes (A-F), 9 edges",
  },
  [g, title, status, mstLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
