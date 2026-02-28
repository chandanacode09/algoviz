// Prim's Minimum Spanning Tree — greedy MST construction
const {
  layout, ops, step, teach, viz,
  titleLabel, statusLabel, label,
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
    { from: "A", to: "C", weight: 3 },
    { from: "B", to: "C", weight: 1 },
    { from: "B", to: "D", weight: 2 },
    { from: "C", to: "D", weight: 4 },
    { from: "C", to: "E", weight: 5 },
    { from: "D", to: "E", weight: 7 },
    { from: "D", to: "F", weight: 6 },
    { from: "E", to: "F", weight: 3 },
  ],
  { directed: false }
);

const title = titleLabel("Prim's Algorithm — MST");
const status = statusLabel("Build Minimum Spanning Tree");
const mstLabel = label("MST edges: (none)", 500, 550, {
  id: "mst", fontSize: 14, fill: "$text",
});

const steps = [];
const mstEdges = [];
const inTree = new Set();
let totalWeight = 0;

// --- Initialization ---
steps.push(teach(
  "Initialize: start MST from node A",
  '<span class="highlight">Prim\'s Algorithm</span> grows a Minimum Spanning Tree one edge at a time. ' +
    'At each step, we pick the <span class="warn">cheapest edge</span> connecting a tree node to a non-tree node. ' +
    'This is a <span class="highlight">greedy</span> approach: locally optimal choices lead to a globally optimal MST.',
  ops.highlight(g.nodeId("A"), "$success"),
  ops.setText(status.id, "Start: add A to the MST"),
  ops.setText("mst", "MST edges: (none) | Weight: 0")
));

inTree.add("A");

// Simulate Prim's algorithm manually
// Tree: {A}
// Frontier edges: A-B(4), A-C(3)
// Pick A-C(3)

const primSteps = [
  { from: "A", to: "C", w: 3, frontier: ["A-B(4)", "A-C(3)"], pick: "A-C(3)" },
  { from: "B", to: "C", w: 1, frontier: ["A-B(4)", "B-C(1)", "C-D(4)", "C-E(5)"], pick: "B-C(1)" },
  { from: "B", to: "D", w: 2, frontier: ["A-B(4)", "B-D(2)", "C-D(4)", "C-E(5)"], pick: "B-D(2)" },
  { from: "A", to: "B", w: 4, frontier: ["A-B(4)", "C-E(5)", "D-E(7)", "D-F(6)"], pick: "A-B(4)" },
  { from: "E", to: "F", w: 3, frontier: ["C-E(5)", "D-E(7)", "D-F(6)"], pick: "C-E(5)" },
];

// Correct simulation:
// Tree={A}. Frontier: A-B(4), A-C(3). Pick A-C(3). Add C.
// Tree={A,C}. Frontier: A-B(4), B-C(1), C-D(4), C-E(5). Pick B-C(1). Add B.
// Tree={A,C,B}. Frontier: B-D(2), C-D(4), C-E(5). Pick B-D(2). Add D.
// Tree={A,C,B,D}. Frontier: C-E(5), D-E(7), D-F(6). Pick C-E(5). Add E.
// Tree={A,C,B,D,E}. Frontier: D-F(6), E-F(3). Pick E-F(3). Add F.

const correctSteps = [
  {
    addNode: "C", edge: ["A", "C"], w: 3,
    frontierEdges: [["A", "B"], ["A", "C"]],
    frontierDesc: "A-B(4), A-C(3)",
    reason: "A-C has weight 3 (cheapest)",
  },
  {
    addNode: "B", edge: ["B", "C"], w: 1,
    frontierEdges: [["A", "B"], ["B", "C"], ["C", "D"], ["C", "E"]],
    frontierDesc: "A-B(4), B-C(1), C-D(4), C-E(5)",
    reason: "B-C has weight 1 (cheapest)",
  },
  {
    addNode: "D", edge: ["B", "D"], w: 2,
    frontierEdges: [["B", "D"], ["C", "D"], ["C", "E"]],
    frontierDesc: "B-D(2), C-D(4), C-E(5)",
    reason: "B-D has weight 2 (cheapest)",
  },
  {
    addNode: "E", edge: ["C", "E"], w: 5,
    frontierEdges: [["C", "E"], ["D", "E"], ["D", "F"]],
    frontierDesc: "C-E(5), D-E(7), D-F(6)",
    reason: "C-E has weight 5 (cheapest)",
  },
  {
    addNode: "F", edge: ["E", "F"], w: 3,
    frontierEdges: [["D", "F"], ["E", "F"]],
    frontierDesc: "D-F(6), E-F(3)",
    reason: "E-F has weight 3 (cheapest)",
  },
];

for (let i = 0; i < correctSteps.length; i++) {
  const s = correctSteps[i];

  // Highlight frontier edges in yellow
  const frontierEdgeIds = s.frontierEdges.map(([f, t]) => g.edgeId(f, t));

  steps.push(teach(
    `Frontier edges: ${s.frontierDesc}`,
    `Edges connecting <span class="success">tree nodes</span> to <span class="warn">non-tree nodes</span>: ` +
      `<span class="warn">${s.frontierDesc}</span>. ` +
      `The greedy choice: pick the edge with <span class="highlight">minimum weight</span>.`,
    ops.highlightEdge(frontierEdgeIds, "$warning"),
    ops.setText(status.id, `Frontier: ${s.frontierDesc}`)
  ));

  // Pick the cheapest edge
  const pickedEdgeId = g.edgeId(s.edge[0], s.edge[1]);
  totalWeight += s.w;
  mstEdges.push(`${s.edge[0]}-${s.edge[1]}(${s.w})`);

  steps.push(step(
    `Pick ${s.edge[0]}-${s.edge[1]} (weight ${s.w}) — add ${s.addNode} to MST`,
    ops.highlightEdge(pickedEdgeId, "$success"),
    ops.resetEdge(frontierEdgeIds.filter(eid => eid !== pickedEdgeId)),
    ops.highlight(g.nodeId(s.addNode), "$success"),
    ops.setText(status.id, `Add edge ${s.edge[0]}-${s.edge[1]}(${s.w}), node ${s.addNode} joins MST`),
    ops.setText("mst", `MST: ${mstEdges.join(", ")} | Weight: ${totalWeight}`)
  ));

  inTree.add(s.addNode);

  // Mark MST node as done
  steps.push(step(
    `${s.addNode} is now in the MST`,
    ops.markDone(g.nodeId(s.addNode))
  ));
}

// --- Final result ---
steps.push(teach(
  "Prim's algorithm complete! MST found with total weight 14.",
  '<span class="success">MST complete!</span> Total weight: <span class="highlight">14</span>. ' +
    'The <span class="highlight">greedy choice property</span> guarantees this works: ' +
    'at each step, the cheapest edge crossing the cut (tree vs non-tree) must be in some MST. ' +
    'This is the <span class="warn">cut property</span> of MSTs. ' +
    'Time complexity: <span class="highlight">O(E log V)</span> with a priority queue.',
  ops.markDone(g.nodeIds),
  ops.setText(status.id, "Prim's complete! MST weight = 14"),
  ops.setText("mst", "MST: A-C(3), B-C(1), B-D(2), C-E(5), E-F(3) | Total: 14")
));

const v = viz(
  {
    algorithm: "prims_mst",
    title: "Prim's Algorithm — Minimum Spanning Tree",
    description: "Grow an MST greedily by always picking the cheapest edge from tree to non-tree.",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O(E log V)", space: "O(V)" },
    input: "Undirected weighted graph: 6 nodes (A-F), 9 edges. Start: A",
  },
  [g, title, status, mstLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
