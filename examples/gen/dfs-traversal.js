// DFS Traversal on a Graph — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// Build a graph with 7 nodes and edges
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
    { from: "C", to: "F" },
    { from: "D", to: "G" },
    { from: "E", to: "G" },
  ],
  { directed: false }
);

const title = titleLabel("Depth-First Search (DFS)");
const status = statusLabel("Starting DFS from node A");
const stackLabel = label("Stack: []", 500, 550, {
  id: "stacklbl", fontSize: 14, fill: "$text",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Initialize DFS: start from node A, all nodes unvisited",
  "initialization",
  {
    narration: '<span class="highlight">Depth-First Search (DFS)</span> explores as far as possible along ' +
      'each branch before backtracking. We use a <span class="warn">stack</span> (explicit or via recursion) ' +
      'to track which node to visit next. Starting from <span class="highlight">A</span>.',
    phase: "setup",
  },
  ops.setText(status.id, "DFS from node A — using explicit stack"),
  ops.setText("stacklbl", "Stack: [A]")
));

// Simulate DFS from A
// Adjacency: A->[B,C], B->[A,D,E], C->[A,F], D->[B,G], E->[B,G], F->[C], G->[D,E]
// DFS order (stack-based, push neighbors in reverse): A, B, D, G, E, C, F

const visited = new Set();
const dfsOrder = [];

// We simulate the exact DFS traversal manually for clear narration
// Stack: [A]
// Pop A, visit A, push C, B (reverse alphabetical so B is on top)
// Stack: [C, B]
// Pop B, visit B, push E, D
// Stack: [C, E, D]
// Pop D, visit D, push G
// Stack: [C, E, G]
// Pop G, visit G (neighbors D already visited, E not visited but we check)
// Stack: [C, E]
// Pop E, visit E (neighbors B visited, G visited)
// Stack: [C]
// Pop C, visit C, push F
// Stack: [F]
// Pop F, visit F
// Stack: []

const dfsSteps = [
  { node: "A", stackAfter: ["C", "B"], neighbors: ["B", "C"], pushed: ["C", "B"] },
  { node: "B", stackAfter: ["C", "E", "D"], neighbors: ["A", "D", "E"], pushed: ["E", "D"], edgeFrom: "A" },
  { node: "D", stackAfter: ["C", "E", "G"], neighbors: ["B", "G"], pushed: ["G"], edgeFrom: "B" },
  { node: "G", stackAfter: ["C", "E"], neighbors: ["D", "E"], pushed: [], edgeFrom: "D" },
  { node: "E", stackAfter: ["C"], neighbors: ["B", "G"], pushed: [], edgeFrom: "B" },
  { node: "C", stackAfter: ["F"], neighbors: ["A", "F"], pushed: ["F"], edgeFrom: "A" },
  { node: "F", stackAfter: [], neighbors: ["C"], pushed: [], edgeFrom: "C" },
];

// Edge lookup helper: find edge between two nodes (undirected, so try both directions)
function findEdge(from, to) {
  try { return g.edgeId(from, to); } catch (e) {
    try { return g.edgeId(to, from); } catch (e2) { return null; }
  }
}

for (let idx = 0; idx < dfsSteps.length; idx++) {
  const s = dfsSteps[idx];
  const stackStr = s.stackAfter.length > 0 ? s.stackAfter.join(", ") : "empty";

  // Highlight current node being popped from stack
  const edgeId = s.edgeFrom ? findEdge(s.edgeFrom, s.node) : null;

  steps.push(teach(
    `Pop ${s.node} from stack — visit it`,
    `Pop <span class="highlight">${s.node}</span> from the stack. ` +
      (s.edgeFrom
        ? `We reached ${s.node} via edge ${s.edgeFrom}-${s.node}. `
        : `This is our starting node. `) +
      `Mark it as <span class="success">visited</span>.`,
    ops.highlight(g.nodeId(s.node), "$primary"),
    ...(edgeId ? [ops.highlightEdge(edgeId, "$primary")] : []),
    ops.setText(status.id, `Visiting: ${s.node}`),
  ));

  // Check neighbors and push unvisited ones
  visited.add(s.node);
  const unvisitedNeighbors = s.neighbors.filter(n => !visited.has(n));
  const alreadyVisited = s.neighbors.filter(n => visited.has(n));

  if (s.pushed.length > 0) {
    steps.push(teach(
      `${s.node}'s unvisited neighbors: [${unvisitedNeighbors.join(", ")}] — push to stack`,
      `Neighbors of <span class="highlight">${s.node}</span>: [${s.neighbors.join(", ")}]. ` +
        (alreadyVisited.length > 0
          ? `Already visited: <span class="success">${alreadyVisited.join(", ")}</span>. `
          : '') +
        `Push unvisited [<span class="warn">${s.pushed.join(", ")}</span>] onto the stack.`,
      ops.highlight(s.pushed.map(n => g.nodeId(n)), "$warning"),
      ops.setText("stacklbl", `Stack: [${s.stackAfter.join(", ")}]`)
    ));
  } else {
    steps.push(teach(
      `${s.node} has no unvisited neighbors`,
      `All neighbors of <span class="highlight">${s.node}</span> [${s.neighbors.join(", ")}] are already ` +
        `<span class="success">visited</span>. Nothing to push. <span class="warn">Backtrack</span> by popping the next item from the stack.`,
      ops.setText("stacklbl", `Stack: [${stackStr}]`)
    ));
  }

  // Mark node as done (visited)
  steps.push(step(`Mark ${s.node} as visited (done)`,
    ops.markDone(g.nodeId(s.node)),
    ...(edgeId ? [ops.highlightEdge(edgeId, "$success")] : []),
    ops.reset(s.pushed.map(n => g.nodeId(n))),
  ));

  dfsOrder.push(s.node);
}

// ─── Cleanup ───
steps.push(annotatedStep(
  "DFS traversal complete! All 7 nodes visited.",
  "explanation",
  {
    narration: `<span class="success">DFS complete!</span> Traversal order: <span class="highlight">${dfsOrder.join(" -> ")}</span>. ` +
      `DFS visits all reachable nodes using a stack. ` +
      `Time: <span class="highlight">O(V + E)</span> where V = vertices, E = edges. ` +
      `Space: <span class="highlight">O(V)</span> for the visited set and stack. ` +
      `DFS is useful for cycle detection, topological sorting, and connected components.`,
    phase: "cleanup",
  },
  ops.markDone(g.nodeIds),
  ops.setText(status.id, `DFS order: ${dfsOrder.join(" -> ")}`),
  ops.setText("stacklbl", "Stack: [] (empty)")
));

const v = viz(
  {
    algorithm: "dfs",
    title: "Depth-First Search (DFS)",
    description: "Stack-based DFS traversal on an undirected graph, showing node visits, edge exploration, and backtracking.",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O(V + E)", space: "O(V)" },
    input: "Undirected graph: 7 nodes (A-G), 7 edges. Start: A",
  },
  [g, title, status, stackLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
