// Dijkstra's Shortest Path — generated using primitives prompt
const {
  layout, ops, step, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("../../dist/src/index");

resetIds();

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
    { from: "B", to: "C", weight: 1 },
    { from: "C", to: "D", weight: 4 },
    { from: "C", to: "E", weight: 5 },
    { from: "D", to: "E", weight: 1 },
  ],
  { directed: true }
);

const title = titleLabel("Dijkstra's Algorithm");
const status = statusLabel("Source: A");
const distLabel = label("Distances: A=0, B=∞, C=∞, D=∞, E=∞", 500, 550, {
  id: "dist", fontSize: 14, fill: "$text",
});

const steps = [];

// Simulate Dijkstra from A
// dist: A=0, B=∞, C=∞, D=∞, E=∞
steps.push(step("Initialize: source A with distance 0, all others ∞",
  ops.highlight(g.nodeId("A"), "$primary"),
  ops.setText(status.id, "Processing node A (dist=0)"),
  ops.setText("dist", "Distances: A=0, B=∞, C=∞, D=∞, E=∞")
));

// Process A → B(4), A → C(2)
steps.push(step("From A: relax edges A→B (0+4=4) and A→C (0+2=2)",
  ops.highlightEdge([g.edgeId("A", "B"), g.edgeId("A", "C")], "$warning"),
  ops.highlight([g.nodeId("B"), g.nodeId("C")], "$warning"),
  ops.setText("dist", "Distances: A=0, B=4, C=2, D=∞, E=∞")
));

steps.push(step("A is done. Pick unvisited node with smallest distance: C (dist=2)",
  ops.markDone(g.nodeId("A")),
  ops.resetEdge([g.edgeId("A", "B"), g.edgeId("A", "C")]),
  ops.highlight(g.nodeId("C"), "$primary"),
  ops.reset(g.nodeId("B")),
  ops.setText(status.id, "Processing node C (dist=2)")
));

// Process C → B(2+1=3), C → D(2+4=6), C → E(2+5=7)
steps.push(step("From C: relax C→B (2+1=3 < 4 ✓), C→D (2+4=6), C→E (2+5=7)",
  ops.highlightEdge([g.edgeId("C", "D"), g.edgeId("C", "E"), g.edgeId("B", "C")], "$warning"),
  ops.highlight([g.nodeId("B"), g.nodeId("D"), g.nodeId("E")], "$warning"),
  ops.setText("dist", "Distances: A=0, B=3, C=2, D=6, E=7")
));

steps.push(step("C is done. Pick next: B (dist=3)",
  ops.markDone(g.nodeId("C")),
  ops.resetEdge([g.edgeId("C", "D"), g.edgeId("C", "E"), g.edgeId("B", "C")]),
  ops.highlight(g.nodeId("B"), "$primary"),
  ops.reset([g.nodeId("D"), g.nodeId("E")]),
  ops.setText(status.id, "Processing node B (dist=3)")
));

// Process B → D(3+3=6), B → C(done)
steps.push(step("From B: relax B→D (3+3=6, same as current). B→C already done.",
  ops.highlightEdge(g.edgeId("B", "D"), "$warning"),
  ops.highlight(g.nodeId("D"), "$warning"),
  ops.setText("dist", "Distances: A=0, B=3, C=2, D=6, E=7")
));

steps.push(step("B is done. Pick next: D (dist=6)",
  ops.markDone(g.nodeId("B")),
  ops.resetEdge(g.edgeId("B", "D")),
  ops.highlight(g.nodeId("D"), "$primary"),
  ops.setText(status.id, "Processing node D (dist=6)")
));

// Process D → E(6+1=7, same)
steps.push(step("From D: relax D→E (6+1=7, same as current). No improvement.",
  ops.highlightEdge(g.edgeId("D", "E"), "$warning"),
  ops.highlight(g.nodeId("E"), "$warning"),
  ops.setText("dist", "Distances: A=0, B=3, C=2, D=6, E=7")
));

steps.push(step("D is done. Pick next: E (dist=7)",
  ops.markDone(g.nodeId("D")),
  ops.resetEdge(g.edgeId("D", "E")),
  ops.highlight(g.nodeId("E"), "$primary"),
  ops.setText(status.id, "Processing node E (dist=7)")
));

steps.push(step("E has no outgoing edges. All nodes processed!",
  ops.markDone(g.nodeId("E")),
  ops.setText(status.id, "Dijkstra complete!"),
  ops.setText("dist", "Shortest: A=0, B=3, C=2, D=6, E=7")
));

const v = viz(
  {
    algorithm: "dijkstra",
    title: "Dijkstra's Algorithm",
    category: "graph",
    difficulty: "intermediate",
    complexity: { time: "O((V+E) log V)", space: "O(V)" },
    input: "Weighted directed graph, source: A",
  },
  [g, title, status, distLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
