// Floyd-Warshall All-Pairs Shortest Paths — distance matrix visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// 4 nodes: A(0), B(1), C(2), D(3)
const nodeNames = ["A", "B", "C", "D"];
const N = 4;
const INF = 999; // Use 999 to represent infinity (displayable in cells)

// Adjacency: direct edge weights
// A->B:3, A->C:6, B->C:1, B->D:4, C->D:2, D->A:7
const directWeights = [
  [  0,   3,   6, INF],
  [INF,   0,   1,   4],
  [INF, INF,   0,   2],
  [  7, INF, INF,   0],
];

// Build the initial display values (use "INF" string for readability)
function displayVal(v) { return v >= INF ? "INF" : String(v); }

const initDisplay = directWeights.map(row => row.map(displayVal));

const m = layout.matrix(N, N, {
  values: initDisplay,
  cellWidth: 65,
  cellHeight: 55,
  gap: 3,
  y: 100,
  sublabels: true,
});

const title = titleLabel("Floyd-Warshall Algorithm");
const status = statusLabel("All-pairs shortest paths");

// Row & column header labels
const headerLabels = [];
for (let c = 0; c < N; c++) {
  headerLabels.push(label(nodeNames[c], m.actors[c].x + 32, m.actors[c].y - 18, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}
for (let r = 0; r < N; r++) {
  headerLabels.push(label(nodeNames[r], m.actors[r * N].x - 18, m.actors[r * N].y + 27, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}

const infoLabel = label("Intermediate vertex: none", 500, 550, {
  id: "info", fontSize: 14, fill: "$text",
});

const steps = [];

// Working copy of dist matrix
const dist = directWeights.map(row => [...row]);

// --- Initialization ---
steps.push(annotatedStep(
  "Initialize distance matrix with direct edge weights",
  "initialization",
  {
    narration: '<span class="highlight">Floyd-Warshall</span> computes shortest paths between <span class="warn">all pairs</span> of vertices. ' +
      'The matrix dist[i][j] starts with direct edge weights. ' +
      'Diagonal = 0 (distance to self), INF = no direct edge. ' +
      'We will try every vertex as an <span class="highlight">intermediate</span> node.',
    phase: "setup",
  },
  ops.setText(status.id, "Initial distance matrix loaded"),
  ops.setText("info", "Intermediate vertex: none yet")
));

// Highlight diagonal as 0
const diagIds = [];
for (let i = 0; i < N; i++) diagIds.push(m.id(i, i));
steps.push(step(
  "Diagonal entries = 0 (distance from node to itself)",
  ops.highlight(diagIds, "$success"),
  ops.setText(status.id, "Diagonal: dist[i][i] = 0")
));

steps.push(step(
  "Reset highlights before main loop",
  ops.reset(diagIds)
));

// --- Main triple-nested loop ---
for (let k = 0; k < N; k++) {
  // Teach step for each intermediate vertex k
  steps.push(teach(
    `Intermediate vertex k=${k} (${nodeNames[k]}): can we shorten paths through ${nodeNames[k]}?`,
    `<span class="highlight">k = ${k} (${nodeNames[k]})</span>: For every pair (i, j), check if going through ` +
      `<span class="warn">${nodeNames[k]}</span> is shorter: ` +
      `dist[i][j] = min(dist[i][j], dist[i][${k}] + dist[${k}][j]). ` +
      (k === 0
        ? 'This is the <span class="highlight">key insight</span>: we gradually allow more intermediate vertices.'
        : `After this round, shortest paths using vertices {${nodeNames.slice(0, k + 1).join(", ")}} as intermediates are correct.`),
    ops.setText("info", `Intermediate vertex: ${nodeNames[k]} (k=${k})`),
    ops.setText(status.id, `Processing k=${k} (${nodeNames[k]})`)
  ));

  // Highlight row k and column k
  const rowKIds = [];
  const colKIds = [];
  for (let x = 0; x < N; x++) {
    rowKIds.push(m.id(k, x));
    colKIds.push(m.id(x, k));
  }

  steps.push(step(
    `Highlight row ${nodeNames[k]} and column ${nodeNames[k]} — the values we read from`,
    ops.highlight(rowKIds, "$primary"),
    ops.highlight(colKIds, "$primary")
  ));

  let updatedInThisK = false;

  for (let i = 0; i < N; i++) {
    if (i === k) continue;
    for (let j = 0; j < N; j++) {
      if (j === k || i === j) continue;

      const throughK = dist[i][k] + dist[k][j];
      const current = dist[i][j];

      if (dist[i][k] < INF && dist[k][j] < INF && throughK < current) {
        // Improvement found
        const oldStr = displayVal(current);
        dist[i][j] = throughK;
        updatedInThisK = true;

        steps.push(step(
          `dist[${nodeNames[i]}][${nodeNames[j]}]: ${oldStr} > ${displayVal(dist[i][k])}+${displayVal(dist[k][j])}=${throughK} => update to ${throughK}`,
          ops.highlight(m.id(i, j), "$warning"),
          ops.highlight(m.id(i, k), "$secondary"),
          ops.highlight(m.id(k, j), "$secondary"),
          ops.setValue(m.id(i, j), displayVal(throughK)),
          ops.setText(status.id, `dist[${nodeNames[i]}][${nodeNames[j]}] updated: ${oldStr} -> ${throughK}`)
        ));

        // Reset the cell highlighting
        steps.push(step(
          `Reset highlights for dist[${nodeNames[i]}][${nodeNames[j]}]`,
          ops.highlight(m.id(i, j), "$success"),
          ops.highlight(m.id(i, k), "$primary"),
          ops.highlight(m.id(k, j), "$primary")
        ));
      }
    }
  }

  if (!updatedInThisK) {
    steps.push(step(
      `No improvements found with intermediate vertex ${nodeNames[k]}`,
      ops.setText(status.id, `k=${k} (${nodeNames[k]}): no path improvements`)
    ));
  }

  // Reset row k / col k highlights
  const allKIds = [...new Set([...rowKIds, ...colKIds])];
  steps.push(step(
    `Done with k=${k} (${nodeNames[k]}) — reset highlights`,
    ops.reset(allKIds)
  ));

  // Mark improved cells as success for this round
  const allCellIds = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      allCellIds.push(m.id(i, j));
    }
  }
  steps.push(step(
    `Matrix after considering intermediate vertex ${nodeNames[k]}`,
    ops.reset(allCellIds),
    ops.setText(status.id, `Completed k=${k} (${nodeNames[k]})`)
  ));
}

// --- Final result ---
steps.push(teach(
  "Floyd-Warshall complete! All shortest paths found.",
  '<span class="success">Algorithm complete!</span> The matrix now contains shortest distances between all pairs. ' +
    'Floyd-Warshall runs in <span class="highlight">O(V^3)</span> time and <span class="highlight">O(V^2)</span> space. ' +
    'It works with <span class="warn">negative weights</span> (but not negative cycles). ' +
    'Key idea: dynamic programming over the set of allowed intermediate vertices. ' +
    'After considering all V vertices as intermediates, the matrix is optimal.',
  ops.markDone(allFinalCells()),
  ops.setText(status.id, "Floyd-Warshall complete!"),
  ops.setText("info", "All-pairs shortest paths computed")
));

function allFinalCells() {
  const ids = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      ids.push(m.id(i, j));
  return ids;
}

const v = viz(
  {
    algorithm: "floyd_warshall",
    title: "Floyd-Warshall Algorithm",
    description: "All-pairs shortest paths using dynamic programming over intermediate vertices on a 4-node graph.",
    category: "graph",
    difficulty: "advanced",
    complexity: { time: "O(V^3)", space: "O(V^2)" },
    input: "Directed graph with 4 nodes (A-D), distance matrix initialized with edge weights",
  },
  [m, title, status, infoLabel, ...headerLabels],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
