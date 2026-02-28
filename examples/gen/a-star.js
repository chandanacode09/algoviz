// A* Search Algorithm — shortest path with heuristic
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build a directed weighted graph with 6 nodes
// Each node has a heuristic h(n) estimating distance to goal F
// Positions chosen so the heuristic makes intuitive sense
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
    { from: "A", to: "B", weight: 2 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "D", weight: 3 },
    { from: "B", to: "C", weight: 2 },
    { from: "C", to: "E", weight: 3 },
    { from: "D", to: "F", weight: 5 },
    { from: "D", to: "E", weight: 1 },
    { from: "E", to: "F", weight: 2 },
  ],
  { directed: true }
);

const title = titleLabel("A* Search Algorithm");
const status = statusLabel("Find shortest path: A -> F");

// Heuristic values h(n) — estimated distance to goal F
const heuristic = { A: 7, B: 5, C: 4, D: 3, E: 2, F: 0 };

// Create heuristic labels next to each node
const hLabels = [];
const nodeNames = ["A", "B", "C", "D", "E", "F"];
for (const name of nodeNames) {
  // Find the node actor to position the label
  const nodeActorId = g.nodeId(name);
  const nodeActor = g.actors.find(a => a.id === nodeActorId);
  hLabels.push(label(`h=${heuristic[name]}`, nodeActor.x, nodeActor.y - 35, {
    fontSize: 12, fill: "$secondary",
  }));
}

const infoLabel = label("Open: {} | Closed: {}", 500, 550, {
  id: "info", fontSize: 14, fill: "$text",
});

const steps = [];

// --- Initialization ---
steps.push(annotatedStep(
  "Initialize A*: start=A, goal=F, heuristic values shown",
  "initialization",
  {
    narration: '<span class="highlight">A* Search</span> finds the shortest path using ' +
      'f(n) = g(n) + h(n), where <span class="warn">g(n)</span> is the actual cost from start ' +
      'and <span class="warn">h(n)</span> is a heuristic estimate to the goal. ' +
      'A* always expands the node with the <span class="highlight">lowest f value</span>. ' +
      'With an admissible heuristic (never overestimates), A* is optimal.',
    phase: "setup",
  },
  ops.highlight(g.nodeId("A"), "$primary"),
  ops.setText(status.id, "A*: start=A, goal=F"),
  ops.setText("info", "Open: {A(f=7)} | Closed: {}")
));

// A* simulation
// g values: actual cost from A
// f = g + h
//
// Open: {A}, g(A)=0, f(A)=0+7=7
// Expand A: neighbors B(g=2,f=2+5=7), C(g=5,f=5+4=9)
// Open: {B(f=7), C(f=9)}, Closed: {A}
//
// Expand B (f=7): neighbors D(g=2+3=5,f=5+3=8), C(g=2+2=4,f=4+4=8, better than 9!)
// Open: {C(f=8), D(f=8)}, Closed: {A, B}
//
// Expand C (f=8, tie-break alphabetically): neighbors E(g=4+3=7,f=7+2=9)
// Open: {D(f=8), E(f=9)}, Closed: {A, B, C}
//
// Expand D (f=8): neighbors F(g=5+5=10,f=10+0=10), E(g=5+1=6,f=6+2=8, better than 9!)
// Open: {E(f=8), F(f=10)}, Closed: {A, B, C, D}
//
// Expand E (f=8): neighbors F(g=6+2=8,f=8+0=8, better than 10!)
// Open: {F(f=8)}, Closed: {A, B, C, D, E}
//
// Expand F (f=8): goal reached! Path: A->B->D->E->F, cost=8

const gCost = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity };
const parent = {};
const openSet = new Set(["A"]);
const closedSet = new Set();

function fVal(n) { return gCost[n] + heuristic[n]; }
function openStr() {
  const items = [...openSet].map(n => `${n}(f=${fVal(n)})`);
  return items.join(", ");
}
function closedStr() {
  return [...closedSet].join(", ");
}

// Step 1: Expand A
steps.push(teach(
  "Expand A (f=7): lowest f in open set",
  '<span class="highlight">Expand A</span>: f(A) = g(A) + h(A) = 0 + 7 = <span class="warn">7</span>. ' +
    'A* always picks the node with the lowest f value. ' +
    'The key formula: <span class="highlight">f = actual cost + estimated remaining</span>.',
  ops.highlight(g.nodeId("A"), "$primary"),
  ops.setText(status.id, "Expanding A: f(A) = 0 + 7 = 7")
));

// Relax A's edges: A->B (g=2), A->C (g=5)
gCost["B"] = 2;
gCost["C"] = 5;
parent["B"] = "A";
parent["C"] = "A";
openSet.delete("A");
closedSet.add("A");
openSet.add("B");
openSet.add("C");

steps.push(step(
  "A->B: g=2, f=2+5=7 | A->C: g=5, f=5+4=9",
  ops.highlightEdge([g.edgeId("A", "B"), g.edgeId("A", "C")], "$warning"),
  ops.highlight(g.nodeId("B"), "$warning"),
  ops.highlight(g.nodeId("C"), "$warning"),
  ops.setText("info", `Open: {${openStr()}} | Closed: {${closedStr()}}`)
));

steps.push(step(
  "A done — move to closed set",
  ops.markDone(g.nodeId("A")),
  ops.resetEdge([g.edgeId("A", "B"), g.edgeId("A", "C")]),
  ops.highlight(g.nodeId("B"), "$warning"),
  ops.highlight(g.nodeId("C"), "$warning"),
  ops.setText(status.id, "A closed. Open: B(f=7), C(f=9)")
));

// Step 2: Expand B (f=7)
steps.push(teach(
  "Expand B (f=7): tied with lowest f, explore B first",
  '<span class="highlight">Expand B</span>: f(B) = g(B) + h(B) = 2 + 5 = <span class="warn">7</span>. ' +
    'Check neighbors D and C. If we find a <span class="warn">shorter path</span> to C through B, we update it.',
  ops.highlight(g.nodeId("B"), "$primary"),
  ops.reset(g.nodeId("C")),
  ops.setText(status.id, "Expanding B: f(B) = 2 + 5 = 7")
));

// B->D: g=5, f=8 | B->C: g=4, f=8 (better than previous g=5!)
gCost["D"] = 5;
gCost["C"] = 4; // improved!
parent["D"] = "B";
parent["C"] = "B";
openSet.delete("B");
closedSet.add("B");
openSet.add("D");

steps.push(step(
  "B->D: g=5, f=5+3=8 | B->C: g=4, f=4+4=8 (improved from g=5!)",
  ops.highlightEdge([g.edgeId("B", "D"), g.edgeId("B", "C")], "$warning"),
  ops.highlight(g.nodeId("D"), "$warning"),
  ops.highlight(g.nodeId("C"), "$warning"),
  ops.setText("info", `Open: {${openStr()}} | Closed: {${closedStr()}}`)
));

steps.push(step(
  "B done — move to closed set",
  ops.markDone(g.nodeId("B")),
  ops.resetEdge([g.edgeId("B", "D"), g.edgeId("B", "C")]),
  ops.reset([g.nodeId("D"), g.nodeId("C")]),
  ops.setText(status.id, "B closed. Open: C(f=8), D(f=8)")
));

// Step 3: Expand C (f=8, tie-break)
steps.push(teach(
  "Expand C (f=8): tied with D, expand C first",
  '<span class="highlight">Expand C</span>: f(C) = g(C) + h(C) = 4 + 4 = <span class="warn">8</span>. ' +
    'C was updated to g=4 (through B) instead of g=5 (direct from A). ' +
    'This shows how A* <span class="highlight">relaxes edges</span> like Dijkstra.',
  ops.highlight(g.nodeId("C"), "$primary"),
  ops.setText(status.id, "Expanding C: f(C) = 4 + 4 = 8")
));

// C->E: g=7, f=9
gCost["E"] = 7;
parent["E"] = "C";
openSet.delete("C");
closedSet.add("C");
openSet.add("E");

steps.push(step(
  "C->E: g=4+3=7, f=7+2=9",
  ops.highlightEdge(g.edgeId("C", "E"), "$warning"),
  ops.highlight(g.nodeId("E"), "$warning"),
  ops.setText("info", `Open: {${openStr()}} | Closed: {${closedStr()}}`)
));

steps.push(step(
  "C done — move to closed set",
  ops.markDone(g.nodeId("C")),
  ops.resetEdge(g.edgeId("C", "E")),
  ops.reset(g.nodeId("E")),
  ops.setText(status.id, "C closed. Open: D(f=8), E(f=9)")
));

// Step 4: Expand D (f=8)
steps.push(teach(
  "Expand D (f=8): check neighbors E and F",
  '<span class="highlight">Expand D</span>: f(D) = g(D) + h(D) = 5 + 3 = <span class="warn">8</span>. ' +
    'D can reach E (g=6, better than 7!) and F (g=10). ' +
    'The heuristic guides us toward the goal while g tracks actual cost.',
  ops.highlight(g.nodeId("D"), "$primary"),
  ops.setText(status.id, "Expanding D: f(D) = 5 + 3 = 8")
));

// D->F: g=10, f=10 | D->E: g=6, f=8 (improved from g=7!)
gCost["F"] = 10;
gCost["E"] = 6; // improved!
parent["E"] = "D";
parent["F"] = "D";
openSet.delete("D");
closedSet.add("D");
openSet.add("F");

steps.push(step(
  "D->E: g=5+1=6, f=6+2=8 (improved!) | D->F: g=5+5=10, f=10",
  ops.highlightEdge([g.edgeId("D", "E"), g.edgeId("D", "F")], "$warning"),
  ops.highlight(g.nodeId("E"), "$warning"),
  ops.highlight(g.nodeId("F"), "$warning"),
  ops.setText("info", `Open: {${openStr()}} | Closed: {${closedStr()}}`)
));

steps.push(step(
  "D done — move to closed set",
  ops.markDone(g.nodeId("D")),
  ops.resetEdge([g.edgeId("D", "E"), g.edgeId("D", "F")]),
  ops.reset([g.nodeId("E"), g.nodeId("F")]),
  ops.setText(status.id, "D closed. Open: E(f=8), F(f=10)")
));

// Step 5: Expand E (f=8)
steps.push(teach(
  "Expand E (f=8): almost at the goal!",
  '<span class="highlight">Expand E</span>: f(E) = g(E) + h(E) = 6 + 2 = <span class="warn">8</span>. ' +
    'E has edge to F. New g(F) = 6+2 = 8, better than 10! ' +
    'The heuristic h(E)=2 correctly estimated the remaining cost.',
  ops.highlight(g.nodeId("E"), "$primary"),
  ops.setText(status.id, "Expanding E: f(E) = 6 + 2 = 8")
));

// E->F: g=8, f=8 (improved from 10!)
gCost["F"] = 8;
parent["F"] = "E";
openSet.delete("E");
closedSet.add("E");

steps.push(step(
  "E->F: g=6+2=8, f=8+0=8 (improved from g=10!)",
  ops.highlightEdge(g.edgeId("E", "F"), "$warning"),
  ops.highlight(g.nodeId("F"), "$warning"),
  ops.setText("info", `Open: {${openStr()}} | Closed: {${closedStr()}}`)
));

steps.push(step(
  "E done — move to closed set",
  ops.markDone(g.nodeId("E")),
  ops.resetEdge(g.edgeId("E", "F")),
  ops.reset(g.nodeId("F")),
  ops.setText(status.id, "E closed. Open: F(f=8)")
));

// Step 6: Expand F — goal reached!
steps.push(teach(
  "Expand F (f=8): goal reached! Shortest path found.",
  '<span class="success">Goal F reached!</span> f(F) = g(F) + h(F) = 8 + 0 = <span class="highlight">8</span>. ' +
    'Since h(F) = 0 (we are at the goal), f = g = actual shortest path cost. ' +
    'A* is <span class="warn">optimal</span> when h is admissible (never overestimates). ' +
    'A* is also <span class="warn">optimally efficient</span>: no algorithm with the same heuristic expands fewer nodes.',
  ops.highlight(g.nodeId("F"), "$success"),
  ops.setText(status.id, "Goal F reached! Cost = 8")
));

openSet.delete("F");
closedSet.add("F");

// Trace the path: A -> B -> D -> E -> F
const path = [];
let cur = "F";
while (cur) {
  path.unshift(cur);
  cur = parent[cur];
}

// Highlight the final path
const pathEdgeIds = [];
for (let i = 0; i < path.length - 1; i++) {
  pathEdgeIds.push(g.edgeId(path[i], path[i + 1]));
}

steps.push(annotatedStep(
  `Optimal path: ${path.join(" -> ")}, total cost = 8`,
  "explanation",
  {
    narration: `<span class="success">A* complete!</span> Shortest path: <span class="highlight">${path.join(" -> ")}</span> with cost <span class="highlight">8</span>. ` +
      `A* expanded ${closedSet.size} nodes. Dijkstra would have expanded the same nodes here, ` +
      `but on larger graphs A*'s heuristic <span class="warn">dramatically prunes the search space</span>. ` +
      `Time: <span class="highlight">O(E log V)</span> with a good heuristic. ` +
      `Space: <span class="highlight">O(V)</span> for open and closed sets.`,
    phase: "cleanup",
  },
  ops.markDone(g.nodeIds),
  ops.highlightEdge(pathEdgeIds, "$success"),
  ops.setText(status.id, `A* path: ${path.join(" -> ")} (cost 8)`),
  ops.setText("info", `Path: ${path.join("->")} | Cost: 8 | Nodes expanded: ${closedSet.size}`)
));

const v = viz(
  {
    algorithm: "a_star",
    title: "A* Search Algorithm",
    description: "A* pathfinding with f=g+h on a weighted directed graph, showing open/closed sets and heuristic guidance.",
    category: "graph",
    difficulty: "advanced",
    complexity: { time: "O(E log V)", space: "O(V)" },
    input: "Directed weighted graph: 6 nodes (A-F), 8 edges. Start: A, Goal: F. Heuristic h(n) shown.",
  },
  [g, title, status, infoLabel, ...hLabels],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
