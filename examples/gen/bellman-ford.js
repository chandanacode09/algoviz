// Bellman-Ford Shortest Path — handles negative edge weights
const {
  layout, ops, step, teach, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// Build a directed graph with 5 nodes, including some negative weights
const g = layout.graph(
  [
    { id: "A", value: "A" },
    { id: "B", value: "B" },
    { id: "C", value: "C" },
    { id: "D", value: "D" },
    { id: "E", value: "E" },
  ],
  [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "B", to: "D", weight: 3 },
    { from: "C", to: "B", weight: -1 },
    { from: "C", to: "D", weight: 5 },
    { from: "D", to: "E", weight: 2 },
    { from: "B", to: "E", weight: -2 },
  ],
  { directed: true }
);

const title = titleLabel("Bellman-Ford Algorithm");
const status = statusLabel("Source: A");
const distLabel = label("Dist: A=0, B=inf, C=inf, D=inf, E=inf", 500, 550, {
  id: "dist", fontSize: 14, fill: "$text",
});

const steps = [];

// Edges in order for relaxation: A->B, A->C, B->D, C->B, C->D, D->E, B->E
const edges = [
  { from: "A", to: "B", w: 4 },
  { from: "A", to: "C", w: 2 },
  { from: "B", to: "D", w: 3 },
  { from: "C", to: "B", w: -1 },
  { from: "C", to: "D", w: 5 },
  { from: "D", to: "E", w: 2 },
  { from: "B", to: "E", w: -2 },
];

// --- Initialization ---
steps.push(teach(
  "Initialize: source A=0, all others infinity",
  'Bellman-Ford finds shortest paths from a source even with <span class="warn">negative edge weights</span>. ' +
    'Unlike Dijkstra, it relaxes <span class="highlight">all edges V-1 times</span>. ' +
    'This guarantees correctness because any shortest path has at most V-1 edges.',
  ops.highlight(g.nodeId("A"), "$primary"),
  ops.setText(status.id, "Initialize: source A with distance 0"),
  ops.setText("dist", "Dist: A=0, B=inf, C=inf, D=inf, E=inf")
));

// Simulate Bellman-Ford
// dist: A=0, rest=Infinity
const dist = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };

function distStr() {
  return "Dist: " + ["A", "B", "C", "D", "E"].map(n =>
    `${n}=${dist[n] === Infinity ? "inf" : dist[n]}`
  ).join(", ");
}

// V-1 = 4 passes
for (let pass = 1; pass <= 4; pass++) {
  let updated = false;

  steps.push(teach(
    `Pass ${pass} of ${4}: relax all edges`,
    `<span class="highlight">Pass ${pass}</span>: We scan every edge and try to relax it. ` +
      `If dist[u] + weight(u,v) < dist[v], we update dist[v]. ` +
      (pass === 1
        ? 'On the first pass, paths using at most <span class="warn">1 edge</span> are found.'
        : `After pass ${pass}, shortest paths using up to <span class="warn">${pass} edges</span> are correct.`),
    ops.reset(g.nodeIds),
    ops.highlight(g.nodeId("A"), "$success"),
    ops.setText(status.id, `Pass ${pass} of 4`)
  ));

  for (const e of edges) {
    const edgeId = g.edgeId(e.from, e.to);
    const newDist = dist[e.from] + e.w;
    const improved = dist[e.from] !== Infinity && newDist < dist[e.to];

    if (improved) {
      const oldDist = dist[e.to];
      dist[e.to] = newDist;
      updated = true;

      steps.push(step(
        `Relax ${e.from}->${e.to}: ${dist[e.from]}+(${e.w})=${newDist} < ${oldDist === Infinity ? "inf" : oldDist} => update to ${newDist}`,
        ops.highlightEdge(edgeId, "$warning"),
        ops.highlight(g.nodeId(e.to), "$warning"),
        ops.setText("dist", distStr()),
        ops.setText(status.id, `Pass ${pass}: relaxed ${e.from}->${e.to} (dist[${e.to}]=${newDist})`)
      ));
    } else {
      steps.push(step(
        `Edge ${e.from}->${e.to}: no improvement`,
        ops.highlightEdge(edgeId, "$muted"),
        ops.setText(status.id, `Pass ${pass}: ${e.from}->${e.to} — no improvement`)
      ));
    }

    // Reset edge after checking
    steps.push(step(
      `Reset edge ${e.from}->${e.to}`,
      ops.resetEdge(edgeId),
      ops.reset(g.nodeId(e.to))
    ));
  }

  // After each pass, mark current best distances
  steps.push(step(
    `Pass ${pass} complete`,
    ops.setText(status.id, `Pass ${pass} complete. ${updated ? "Distances updated." : "No changes — could stop early."}`),
    ops.setText("dist", distStr()),
    ops.highlight(g.nodeId("A"), "$success")
  ));

  if (!updated) break;
}

// --- Final result ---
steps.push(teach(
  "Bellman-Ford complete! All shortest paths found.",
  '<span class="success">Algorithm complete!</span> Bellman-Ford runs in <span class="highlight">O(V*E)</span> time. ' +
    'Key difference from Dijkstra: it handles <span class="warn">negative weights</span> correctly. ' +
    'Dijkstra uses a greedy approach (always pick the closest unvisited node), which fails with negative edges. ' +
    'Bellman-Ford exhaustively relaxes all edges V-1 times, guaranteeing correctness. ' +
    'It can also detect <span class="danger">negative cycles</span> by checking for further improvements after V-1 passes.',
  ops.markDone(g.nodeIds),
  ops.setText(status.id, "Bellman-Ford complete!"),
  ops.setText("dist", "Shortest: A=0, B=1, C=2, D=4, E=-1")
));

const v = viz(
  {
    algorithm: "bellman_ford",
    title: "Bellman-Ford Algorithm",
    description: "Shortest paths from source with negative edge weights, showing V-1 passes of edge relaxation.",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O(V*E)", space: "O(V)" },
    input: "Directed graph with 5 nodes, some negative edge weights. Source: A",
  },
  [g, title, status, distLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
