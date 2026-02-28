// Kosaraju's Algorithm — Strongly Connected Components
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build a directed graph with 8 nodes forming 3 SCCs:
// SCC1: {A, B, C}  — A->B->C->A
// SCC2: {D, E}     — D->E->D
// SCC3: {F, G, H}  — F->G->H->F
// Cross-edges: C->D (SCC1->SCC2), E->F (SCC2->SCC3), B->G (SCC1->SCC3)
const g = layout.graph(
  [
    { id: "A", value: "A" },
    { id: "B", value: "B" },
    { id: "C", value: "C" },
    { id: "D", value: "D" },
    { id: "E", value: "E" },
    { id: "F", value: "F" },
    { id: "G", value: "G" },
    { id: "H", value: "H" },
  ],
  [
    // SCC1: A->B->C->A
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "A" },
    // SCC2: D->E->D
    { from: "D", to: "E" },
    { from: "E", to: "D" },
    // SCC3: F->G->H->F
    { from: "F", to: "G" },
    { from: "G", to: "H" },
    { from: "H", to: "F" },
    // Cross edges
    { from: "C", to: "D" },
    { from: "E", to: "F" },
    { from: "B", to: "G" },
  ],
  { directed: true }
);

const title = titleLabel("Kosaraju's Algorithm — SCC");
const status = statusLabel("Find Strongly Connected Components");
const finishLabel = label("Finish order: []", 500, 550, {
  id: "finish", fontSize: 14, fill: "$text",
});

const steps = [];

// --- Initialization ---
steps.push(annotatedStep(
  "Initialize: find all strongly connected components",
  "initialization",
  {
    narration: '<span class="highlight">Kosaraju\'s Algorithm</span> finds all <span class="warn">Strongly Connected Components (SCCs)</span> in a directed graph. ' +
      'An SCC is a maximal set of vertices where every vertex is reachable from every other. ' +
      'It uses <span class="highlight">two DFS passes</span>: ' +
      '(1) DFS on the original graph to get finish order, ' +
      '(2) DFS on the reversed graph in reverse finish order.',
    phase: "setup",
  },
  ops.setText(status.id, "Kosaraju's: two-pass DFS for SCCs"),
  ops.setText("finish", "Finish order: []")
));

// ═══════════════════════════════════════════════════════════════════
// PASS 1: DFS on original graph, record finish order
// ═══════════════════════════════════════════════════════════════════

steps.push(teach(
  "Pass 1: DFS on original graph to compute finish order",
  '<span class="highlight">Pass 1</span>: Run DFS on the original graph. When a node finishes ' +
    '(all descendants explored), record it. The <span class="warn">finish order</span> captures the ' +
    '"depth" of each node in the DFS tree. Nodes in source SCCs finish last.',
  ops.setText(status.id, "Pass 1: DFS on original graph"),
  ops.setText("finish", "Finish order: []")
));

// Simulate DFS from A on original graph
// Adjacency: A->[B], B->[C,G], C->[A,D], D->[E], E->[D,F], F->[G], G->[H], H->[F]
// DFS from A: A->B->C->(A visited)->D->E->(D visited)->F->G->H->(F visited)
// Finish order: H,G,F,E,D,C,B,A

const visited1 = new Set();
const finishOrder = [];

// Manual DFS simulation for clear step-by-step visualization
const dfs1Steps = [
  { action: "visit", node: "A", edge: null },
  { action: "visit", node: "B", edge: ["A", "B"] },
  { action: "visit", node: "C", edge: ["B", "C"] },
  { action: "backtrack", node: "C", reason: "neighbor A already visited" },
  { action: "visit", node: "D", edge: ["C", "D"] },
  { action: "visit", node: "E", edge: ["D", "E"] },
  { action: "backtrack", node: "E", reason: "neighbor D already visited" },
  { action: "visit", node: "F", edge: ["E", "F"] },
  { action: "visit", node: "G", edge: ["F", "G"] },
  { action: "visit", node: "H", edge: ["G", "H"] },
  { action: "finish", node: "H", reason: "neighbor F already visited" },
  { action: "finish", node: "G", reason: "all neighbors explored" },
  { action: "finish", node: "F", reason: "all neighbors explored" },
  { action: "finish", node: "E", reason: "all neighbors explored" },
  { action: "finish", node: "D", reason: "all neighbors explored" },
  { action: "finish", node: "C", reason: "all neighbors explored" },
  { action: "finish", node: "B", reason: "neighbor G already visited" },
  { action: "finish", node: "A", reason: "all neighbors explored" },
];

for (const s of dfs1Steps) {
  if (s.action === "visit") {
    visited1.add(s.node);
    const edgeActions = s.edge ? [ops.highlightEdge(g.edgeId(s.edge[0], s.edge[1]), "$primary")] : [];
    steps.push(step(
      `Pass 1: Visit ${s.node}${s.edge ? ` via ${s.edge[0]}->${s.edge[1]}` : " (start)"}`,
      ops.highlight(g.nodeId(s.node), "$primary"),
      ...edgeActions,
      ops.setText(status.id, `Pass 1 DFS: visiting ${s.node}`)
    ));
  } else if (s.action === "backtrack") {
    steps.push(step(
      `Pass 1: At ${s.node} — ${s.reason}`,
      ops.setText(status.id, `Pass 1: ${s.node} — ${s.reason}`)
    ));
  } else if (s.action === "finish") {
    finishOrder.push(s.node);
    steps.push(step(
      `Pass 1: ${s.node} finishes (${s.reason}) — finish order: [${finishOrder.join(", ")}]`,
      ops.highlight(g.nodeId(s.node), "$muted"),
      ops.setText(status.id, `Pass 1: ${s.node} finished`),
      ops.setText("finish", `Finish order: [${finishOrder.join(", ")}]`)
    ));
  }
}

// Reset all nodes between passes
steps.push(teach(
  "Pass 1 complete! Finish order recorded. Now reverse the graph.",
  '<span class="success">Pass 1 done!</span> Finish order: <span class="highlight">[' + finishOrder.join(", ") + ']</span>. ' +
    'Now we <span class="warn">reverse all edges</span> conceptually and run DFS in <span class="highlight">reverse finish order</span> ' +
    '(right to left: A, B, C, D, E, F, G, H). Why? Reversing edges means a node can only reach ' +
    'nodes in its own SCC from the source SCC. The reverse finish order ensures we start from source SCCs.',
  ops.reset(g.nodeIds),
  ops.resetEdge(g.edgeIds),
  ops.setText(status.id, "Pass 1 done. Reverse finish order: [A, B, C, D, E, F, G, H]")
));

// ═══════════════════════════════════════════════════════════════════
// PASS 2: DFS on reversed graph in reverse finish order
// ═══════════════════════════════════════════════════════════════════

steps.push(teach(
  "Pass 2: DFS on reversed graph in reverse finish order",
  '<span class="highlight">Pass 2</span>: Process nodes in reverse finish order: <span class="warn">[A, B, C, D, E, F, G, H]</span>. ' +
    'For each unvisited node, run DFS on the <span class="highlight">reversed graph</span>. ' +
    'All nodes reached in one DFS form a single SCC. ' +
    'Reversed edges: B->A, C->B, A->C, E->D, D->E, G->F, H->G, F->H, D->C, F->E, G->B.',
  ops.setText(status.id, "Pass 2: DFS on reversed graph"),
  ops.setText("finish", "Reverse finish order: [A, B, C, D, E, F, G, H]")
));

// Reverse finish order: A, B, C, D, E, F, G, H
// Reversed adjacency:
// A->[C], B->[A,G], C->[B,D], D->[E,C], E->[D,F], F->[H,E], G->[F,B], H->[G]
// DFS from A on reversed: A->C->B->(A visited) => SCC1 = {A, C, B} = {A, B, C}
// DFS from D on reversed: D->E->(D visited) => actually D->[E,C(visited)], E->[D(visited),F(unvisited)]...
// Let me redo: D->E->F? No. Reversed edges from D: who points to D originally? E->D means reversed = D->E, C->D means reversed = D->C.
// So reversed adj for D: [E, C]. C is visited. So D->E. E reversed: [D, F]. D visited. E->F. F reversed: [H, E]. E visited. F->H. H reversed: [G]. H->G. G reversed: [F, B]. F visited, B visited. G done.
// Wait that gives SCC2 = {D, E, F, G, H} which is wrong.
//
// Let me reconsider. The SCCs are determined by the actual graph structure.
// Original edges: A->B, B->C, C->A (cycle), D->E, E->D (cycle), F->G, G->H, H->F (cycle)
// Cross: C->D, E->F, B->G
// SCC1={A,B,C}, SCC2={D,E}, SCC3={F,G,H} — these are correct.
//
// Reversed edges: B->A, C->B, A->C, E->D, D->E, G->F, H->G, F->H, D->C, F->E, G->B
// Reversed adjacency:
//   A: [C]          (from C->A reversed)
//   B: [A, G]       (from A->B, B->G reversed)  wait no. If original is A->B then reversed is B->A.
//   Let me list reversed properly: for each original edge u->v, add v->u
//   A->B => B->A;  B->C => C->B;  C->A => A->C;  D->E => E->D;  E->D => D->E;
//   F->G => G->F;  G->H => H->G;  H->F => F->H;  C->D => D->C;  E->F => F->E;  B->G => G->B
//   Reversed adjacency:
//   A: [C]  (from C->A reversed = A->C... no. C->A in original means in reversed: A->C. Wait.
//   Original C->A means reversed is A->C. So A's reversed adj includes C.
//   Original A->B means reversed is B->A. So B's reversed adj includes A.
//
//   A: [C]  (original C->A => reversed A gets C? No! Original C->A => reversed: A->C? No.
//   Reversed graph: for original edge u->v, we have v->u in reversed.
//   So original C->A => reversed A->C. A's outgoing in reversed = [C].
//   Original A->B => reversed B->A. B's outgoing in reversed includes A.
//
//   Reversed adjacency lists:
//   A: [C]           — from original edge C->A
//   B: [A]           — from original edge A->B
//   C: [B]           — from original edge B->C
//   D: [E, C]        — from original E->D and C->D
//   E: [D]           — from original D->E
//   F: [H, E]        — from original H->F and E->F
//   G: [F, B]        — from original F->G and B->G
//   H: [G]           — from original G->H
//
// DFS from A on reversed: A->C->B->(A already visited, B's other neighbors? B only has [A])
// B finishes, C finishes, A finishes => SCC1 = {A, B, C} ✓
//
// Next unvisited in reverse finish order: D
// DFS from D on reversed: D->E (C already visited)->D(visited). E only neighbor is D (visited).
// E finishes, D finishes => SCC2 = {D, E} ✓
//
// Next unvisited: F
// DFS from F on reversed: F->H (E visited)->G->F(visited), B(visited). G finishes. H finishes. F finishes.
// => SCC3 = {F, G, H} ✓

const sccColors = ["$primary", "$warning", "$danger"];
const sccNames = ["SCC-1", "SCC-2", "SCC-3"];
const visited2 = new Set();

// SCC 1: {A, B, C} via DFS from A on reversed graph
const scc1Steps = [
  { node: "A", from: null },
  { node: "C", from: "A" },
  { node: "B", from: "C" },
];

steps.push(step(
  "Pass 2: Start DFS from A (first in reverse finish order)",
  ops.highlight(g.nodeId("A"), sccColors[0]),
  ops.setText(status.id, "Pass 2: DFS from A on reversed graph")
));
visited2.add("A");

for (const s of scc1Steps) {
  if (s.from) {
    // In the reversed graph, the edge direction is reversed.
    // Original edge was s.node -> s.from, so we highlight that original edge.
    // Actually we need to find the original edge. Reversed edge s.from->s.node means original s.node->s.from
    // But the viewer shows original edges. Let's highlight the original edge that corresponds.
    // Reversed traversal A->C means original C->A. So highlight edge C->A.
    let edgeId;
    try { edgeId = g.edgeId(s.node, s.from); } catch (e) {
      try { edgeId = g.edgeId(s.from, s.node); } catch (e2) { edgeId = null; }
    }
    visited2.add(s.node);
    steps.push(step(
      `Pass 2: Reversed edge ${s.from}->${s.node} (original: ${s.node}->${s.from}) — visit ${s.node}`,
      ops.highlight(g.nodeId(s.node), sccColors[0]),
      ...(edgeId ? [ops.highlightEdge(edgeId, sccColors[0])] : []),
      ops.setText(status.id, `Pass 2: visiting ${s.node} (reversed DFS)`)
    ));
  }
}

steps.push(teach(
  "SCC-1 found: {A, B, C} — all reachable from A in reversed graph",
  '<span class="highlight">SCC-1 = {A, B, C}</span>. Starting from A in the reversed graph, we reached B and C. ' +
    'In the original graph, A->B->C->A forms a cycle. Every vertex can reach every other. ' +
    'This is a <span class="success">strongly connected component</span>.',
  ops.highlight([g.nodeId("A"), g.nodeId("B"), g.nodeId("C")], sccColors[0]),
  ops.setText(status.id, "SCC-1: {A, B, C}")
));

// SCC 2: {D, E} via DFS from D on reversed graph
steps.push(step(
  "Pass 2: Next unvisited in reverse finish order: D",
  ops.highlight(g.nodeId("D"), sccColors[1]),
  ops.setText(status.id, "Pass 2: DFS from D on reversed graph")
));
visited2.add("D");

// D->E in reversed (original E->D)
visited2.add("E");
let edgeDErev;
try { edgeDErev = g.edgeId("E", "D"); } catch (e) {
  try { edgeDErev = g.edgeId("D", "E"); } catch (e2) { edgeDErev = null; }
}
steps.push(step(
  "Pass 2: Reversed edge D->E (original: E->D) — visit E",
  ops.highlight(g.nodeId("E"), sccColors[1]),
  ...(edgeDErev ? [ops.highlightEdge(edgeDErev, sccColors[1])] : []),
  ops.setText(status.id, "Pass 2: visiting E (reversed DFS from D)")
));

steps.push(teach(
  "SCC-2 found: {D, E} — all reachable from D in reversed graph",
  '<span class="highlight">SCC-2 = {D, E}</span>. In the reversed graph from D, we only reached E ' +
    '(C is already assigned to SCC-1). Original graph has D->E->D cycle. ' +
    '<span class="warn">Cross-edges</span> like C->D do not create larger SCCs because ' +
    'there is no path back from D to C.',
  ops.highlight([g.nodeId("D"), g.nodeId("E")], sccColors[1]),
  ops.setText(status.id, "SCC-2: {D, E}")
));

// SCC 3: {F, G, H} via DFS from F on reversed graph
steps.push(step(
  "Pass 2: Next unvisited in reverse finish order: F",
  ops.highlight(g.nodeId("F"), sccColors[2]),
  ops.setText(status.id, "Pass 2: DFS from F on reversed graph")
));
visited2.add("F");

// F->H in reversed (original H->F)
visited2.add("H");
let edgeFHrev;
try { edgeFHrev = g.edgeId("H", "F"); } catch (e) {
  try { edgeFHrev = g.edgeId("F", "H"); } catch (e2) { edgeFHrev = null; }
}
steps.push(step(
  "Pass 2: Reversed edge F->H (original: H->F) — visit H",
  ops.highlight(g.nodeId("H"), sccColors[2]),
  ...(edgeFHrev ? [ops.highlightEdge(edgeFHrev, sccColors[2])] : []),
  ops.setText(status.id, "Pass 2: visiting H (reversed DFS from F)")
));

// H->G in reversed (original G->H)
visited2.add("G");
let edgeHGrev;
try { edgeHGrev = g.edgeId("G", "H"); } catch (e) {
  try { edgeHGrev = g.edgeId("H", "G"); } catch (e2) { edgeHGrev = null; }
}
steps.push(step(
  "Pass 2: Reversed edge H->G (original: G->H) — visit G",
  ops.highlight(g.nodeId("G"), sccColors[2]),
  ...(edgeHGrev ? [ops.highlightEdge(edgeHGrev, sccColors[2])] : []),
  ops.setText(status.id, "Pass 2: visiting G (reversed DFS from F)")
));

steps.push(teach(
  "SCC-3 found: {F, G, H} — all reachable from F in reversed graph",
  '<span class="highlight">SCC-3 = {F, G, H}</span>. In the reversed graph from F, we reached H and G. ' +
    'Original graph: F->G->H->F is a cycle. ' +
    'All <span class="success">3 SCCs</span> have been identified!',
  ops.highlight([g.nodeId("F"), g.nodeId("G"), g.nodeId("H")], sccColors[2]),
  ops.setText(status.id, "SCC-3: {F, G, H}")
));

// --- Final result ---
steps.push(annotatedStep(
  "Kosaraju's algorithm complete! Found 3 SCCs.",
  "explanation",
  {
    narration: '<span class="success">All SCCs found!</span> ' +
      '<span class="highlight">SCC-1 = {A, B, C}</span>, ' +
      '<span class="warn">SCC-2 = {D, E}</span>, ' +
      '<span class="danger">SCC-3 = {F, G, H}</span>. ' +
      'Kosaraju\'s runs in <span class="highlight">O(V + E)</span> — two DFS passes. ' +
      'Why does it work? The first DFS finish order ensures that in pass 2, ' +
      'we process "source" SCCs first. Reversing edges means a source SCC node ' +
      'can only reach nodes within its own SCC, preventing leakage into other components.',
    phase: "cleanup",
  },
  ops.highlight([g.nodeId("A"), g.nodeId("B"), g.nodeId("C")], sccColors[0]),
  ops.highlight([g.nodeId("D"), g.nodeId("E")], sccColors[1]),
  ops.highlight([g.nodeId("F"), g.nodeId("G"), g.nodeId("H")], sccColors[2]),
  ops.setText(status.id, "Kosaraju complete: 3 SCCs found"),
  ops.setText("finish", "SCC-1: {A,B,C} | SCC-2: {D,E} | SCC-3: {F,G,H}")
));

const v = viz(
  {
    algorithm: "kosaraju_scc",
    title: "Kosaraju's Algorithm — Strongly Connected Components",
    description: "Two-pass DFS to find all strongly connected components in a directed graph with 8 nodes and 3 SCCs.",
    category: "graph",
    difficulty: "advanced",
    complexity: { time: "O(V + E)", space: "O(V)" },
    input: "Directed graph: 8 nodes (A-H), 11 edges, forming 3 SCCs",
  },
  [g, title, status, finishLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
