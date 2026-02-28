// BFS Shortest Path — find shortest path in unweighted graph
// Level-by-level expansion, track parent pointers, highlight final path
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// Build graph with 7 nodes
const g = layout.graph(
  [
    { id: "A", value: "A" },
    { id: "B", value: "B" },
    { id: "C", value: "C" },
    { id: "D", value: "D" },
    { id: "E", value: "E" },
    { id: "F", value: "F" },
    { id: "G", value: "G" },
  ],
  [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
    { from: "B", to: "E" },
    { from: "C", to: "E" },
    { from: "C", to: "F" },
    { from: "D", to: "G" },
    { from: "E", to: "G" },
  ],
  { directed: false }
);

const title = titleLabel("BFS Shortest Path");
const status = statusLabel("Find shortest path from A to G");
const queueLabel = label("Queue: []", 500, 530, { id: "qlbl", fontSize: 14, fill: "$text" });
const distLabel = label("Distances: A=0", 500, 555, { id: "dlbl", fontSize: 14, fill: "$text" });

const steps = [];

// Edge lookup helper
function findEdge(from, to) {
  try { return g.edgeId(from, to); } catch (e) {
    try { return g.edgeId(to, from); } catch (e2) { return null; }
  }
}

// Adjacency list
const adj = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "E", "F"],
  D: ["B", "G"],
  E: ["B", "C", "G"],
  F: ["C"],
  G: ["D", "E"],
};

const source = "A";
const target = "G";

// ─── Setup ───
steps.push(annotatedStep(
  `BFS to find shortest path from ${source} to ${target}`,
  "initialization",
  {
    narration: '<span class="highlight">BFS (Breadth-First Search)</span> explores nodes level by level. ' +
      'In an <span class="warn">unweighted graph</span>, BFS guarantees finding the ' +
      '<span class="success">shortest path</span> because it visits all nodes at distance d ' +
      'before any node at distance d+1. We track <span class="highlight">parent pointers</span> to reconstruct the path.',
    phase: "setup",
  },
  ops.highlight(g.nodeId(source), "$primary"),
  ops.setText(status.id, `BFS from ${source} to ${target}`)
));

// ─── BFS simulation ───
const dist = {};
const parent = {};
const visited = new Set();
const queue = [source];
dist[source] = 0;
parent[source] = null;
visited.add(source);

steps.push(teach(
  "Initialize: enqueue source A with distance 0",
  `Start BFS from <span class="highlight">${source}</span>. ` +
    `Set distance[${source}] = 0, parent[${source}] = null. ` +
    `Enqueue <span class="warn">${source}</span>.`,
  ops.highlight(g.nodeId(source), "$primary"),
  ops.setText("qlbl", `Queue: [${source}]`),
  ops.setText("dlbl", `Distances: ${source}=0`),
  ops.setText(status.id, `Enqueue ${source} (dist=0)`)
));

let foundTarget = false;

while (queue.length > 0 && !foundTarget) {
  const current = queue.shift();
  const currentDist = dist[current];

  steps.push(teach(
    `Dequeue ${current} (distance ${currentDist})`,
    `Dequeue <span class="highlight">${current}</span> with distance <span class="warn">${currentDist}</span>. ` +
      `Explore its neighbors: [${adj[current].join(", ")}].`,
    ops.highlight(g.nodeId(current), "$primary"),
    ops.setText("qlbl", `Queue: [${queue.length > 0 ? queue.join(", ") : ""}]`),
    ops.setText(status.id, `Processing ${current} (dist=${currentDist})`)
  ));

  for (const neighbor of adj[current]) {
    if (visited.has(neighbor)) {
      continue;
    }

    visited.add(neighbor);
    dist[neighbor] = currentDist + 1;
    parent[neighbor] = current;
    queue.push(neighbor);

    const edgeId = findEdge(current, neighbor);

    const distStr = Object.entries(dist)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");

    steps.push(teach(
      `Discover ${neighbor} via ${current} (distance ${dist[neighbor]})`,
      `Neighbor <span class="success">${neighbor}</span> is unvisited. ` +
        `Set distance[${neighbor}] = ${currentDist} + 1 = <span class="warn">${dist[neighbor]}</span>. ` +
        `Set parent[${neighbor}] = <span class="highlight">${current}</span>. Enqueue ${neighbor}.`,
      ops.highlight(g.nodeId(neighbor), "$warning"),
      ...(edgeId ? [ops.highlightEdge(edgeId, "$warning")] : []),
      ops.setText("qlbl", `Queue: [${queue.join(", ")}]`),
      ops.setText("dlbl", `Distances: ${distStr}`),
      ops.setText(status.id, `Discovered ${neighbor} (dist=${dist[neighbor]}, parent=${current})`)
    ));

    if (neighbor === target) {
      foundTarget = true;
      break;
    }
  }

  // Mark current as done
  steps.push(step(`${current} fully explored`,
    ops.markDone(g.nodeId(current)),
    ops.reset(adj[current].filter(n => visited.has(n) && n !== current).map(n => g.nodeId(n))),
    ...(adj[current].filter(n => visited.has(n) && n !== current).map(n => {
      const eid = findEdge(current, n);
      return eid ? ops.resetEdge(eid) : [];
    }).flat()),
  ));

  // Re-mark already done nodes
  const doneNodes = [...visited].filter(n => !queue.includes(n) && n !== current);
  if (doneNodes.length > 0) {
    steps.push(step("Update visited nodes",
      ops.markDone(doneNodes.map(n => g.nodeId(n)))
    ));
  }
}

// ─── Reconstruct path ───
steps.push(teach(
  `Target ${target} found at distance ${dist[target]}! Reconstruct the path.`,
  `<span class="success">${target} found!</span> Distance = <span class="success">${dist[target]}</span>. ` +
    'Now trace back through <span class="highlight">parent pointers</span> to find the actual path.',
  ops.reset(g.nodeIds),
  ops.setText(status.id, `Found ${target} at distance ${dist[target]}. Tracing path...`)
));

// Build path from target back to source
const path = [];
let cur = target;
while (cur !== null) {
  path.unshift(cur);
  cur = parent[cur];
}

// Highlight the shortest path
const pathEdgeIds = [];
for (let i = 0; i < path.length - 1; i++) {
  const eid = findEdge(path[i], path[i + 1]);
  if (eid) pathEdgeIds.push(eid);
}

steps.push(annotatedStep(
  `Shortest path: ${path.join(" -> ")} (length ${path.length - 1})`,
  "explanation",
  {
    narration: `<span class="success">Shortest path found!</span> ` +
      `<span class="highlight">${path.join(" -> ")}</span> with length <span class="success">${path.length - 1}</span>. ` +
      'BFS guarantees this is the shortest path in an unweighted graph because it ' +
      'explores all nodes at distance d before any at distance d+1. ' +
      'Time: <span class="highlight">O(V + E)</span>. Space: <span class="highlight">O(V)</span>.',
    phase: "cleanup",
  },
  ops.markDone(path.map(n => g.nodeId(n))),
  ops.highlightEdge(pathEdgeIds, "$success"),
  ops.setText("qlbl", `Path: ${path.join(" -> ")}`),
  ops.setText(status.id, `Shortest path: ${path.join(" -> ")} (length ${path.length - 1})`)
));

const v = viz(
  {
    algorithm: "bfs_shortest_path",
    title: "BFS Shortest Path",
    description: "Find the shortest path in an unweighted graph using BFS level-by-level expansion.",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O(V + E)", space: "O(V)" },
    input: `Undirected graph: 7 nodes (A-G), 8 edges. Source: ${source}, Target: ${target}`,
  },
  [g, title, status, queueLabel, distLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
