// Flood Fill — BFS-based region filling on a grid
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

const rows = 5;
const cols = 5;

// Grid representing an "image" — 1 = blue region, 0 = white region
// We will flood fill the blue region (1s) starting from center (2,2)
const grid = [
  [0, 0, 1, 1, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

// Display values: "B" for blue cells (target), "W" for white cells
const displayValues = grid.map(row => row.map(v => v === 1 ? "B" : "W"));

const m = layout.matrix(rows, cols, {
  values: displayValues,
  cellWidth: 60,
  cellHeight: 60,
  gap: 3,
  y: 90,
  sublabels: true,
});

const title = titleLabel("Flood Fill Algorithm");
const status = statusLabel("Fill connected region from center");
const queueLabel = label("Queue: []", 500, 550, {
  id: "queue", fontSize: 14, fill: "$text",
});

const steps = [];

// Color the initial grid — highlight "B" cells as primary to show the shape
const blueCells = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (grid[r][c] === 1) {
      blueCells.push(m.id(r, c));
    }
  }
}

steps.push(annotatedStep(
  "Initial grid: B=blue region, W=white region",
  "initialization",
  {
    narration: 'This grid represents a simple image. <span class="highlight">B (blue)</span> cells form a connected region. ' +
      '<span class="warn">W (white)</span> cells are a different color. ' +
      'We want to <span class="highlight">flood fill</span> starting from the center cell (2,2), ' +
      'changing all connected blue cells to green (filled).',
    phase: "setup",
  },
  ops.highlight(blueCells, "$primary"),
  ops.setText(status.id, "Grid loaded — B cells are the target region")
));

// --- BFS Flood Fill from (2,2) ---
steps.push(teach(
  "Start flood fill from cell (2,2) using BFS",
  '<span class="highlight">Flood Fill</span> visits all connected cells of the same color. ' +
    'We use <span class="warn">BFS (Breadth-First Search)</span>: start at the seed cell, ' +
    'add it to a queue, then process neighbors level by level. ' +
    'An alternative is <span class="warn">DFS</span> (using a stack or recursion). ' +
    'BFS fills outward in concentric "rings", while DFS follows a single path deeply before backtracking.',
  ops.highlight(m.id(2, 2), "$warning"),
  ops.setText(status.id, "Seed: (2,2) — starting BFS flood fill"),
  ops.setText("queue", "Queue: [(2,2)]")
));

// BFS simulation
const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
const queue = [[2, 2]];
visited[2][2] = true;

const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const dirNames = ["up", "down", "left", "right"];
let fillOrder = 1;

while (queue.length > 0) {
  const [r, c] = queue.shift();
  const qStr = queue.map(([qr, qc]) => `(${qr},${qc})`).join(", ");

  // Fill current cell
  steps.push(step(
    `Dequeue (${r},${c}) — fill it (cell #${fillOrder})`,
    ops.setValue(m.id(r, c), "F"),
    ops.highlight(m.id(r, c), "$success"),
    ops.setText(status.id, `Filling (${r},${c}) — cell #${fillOrder}`),
    ops.setText("queue", `Queue: [${qStr}]`)
  ));
  fillOrder++;

  // Check neighbors
  const addedNeighbors = [];
  for (let d = 0; d < 4; d++) {
    const nr = r + directions[d][0];
    const nc = c + directions[d][1];

    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === 1) {
      visited[nr][nc] = true;
      queue.push([nr, nc]);
      addedNeighbors.push(`(${nr},${nc})`);
    }
  }

  if (addedNeighbors.length > 0) {
    const newQStr = queue.map(([qr, qc]) => `(${qr},${qc})`).join(", ");
    const neighborIds = addedNeighbors.map(s => {
      const match = s.match(/\((\d+),(\d+)\)/);
      return m.id(parseInt(match[1]), parseInt(match[2]));
    });

    steps.push(step(
      `Enqueue ${addedNeighbors.length} neighbor(s): ${addedNeighbors.join(", ")}`,
      ops.highlight(neighborIds, "$warning"),
      ops.setText("queue", `Queue: [${newQStr}]`)
    ));

    // Reset neighbor highlighting
    steps.push(step(
      "Reset neighbor highlights",
      ops.reset(neighborIds),
      ops.highlight(neighborIds, "$primary")
    ));
  }

  // Mark current cell as done
  steps.push(step(
    `(${r},${c}) done`,
    ops.markDone(m.id(r, c))
  ));
}

// --- Final result ---
const filledCount = fillOrder - 1;
steps.push(annotatedStep(
  `Flood fill complete! Filled ${filledCount} connected cells.`,
  "explanation",
  {
    narration: `<span class="success">Flood fill complete!</span> We filled <span class="highlight">${filledCount} cells</span> ` +
      `starting from (2,2). All cells connected to the seed with the same color were visited. ` +
      `BFS guarantees we explore in <span class="warn">concentric layers</span> outward from the seed. ` +
      `Time: <span class="highlight">O(m*n)</span> — each cell visited at most once. ` +
      `Space: <span class="highlight">O(m*n)</span> for the visited array and queue. ` +
      `Flood fill is used in paint bucket tools, image segmentation, and maze solving.`,
    phase: "cleanup",
  },
  ops.setText(status.id, `Flood fill done! ${filledCount} cells filled.`),
  ops.setText("queue", "Queue: [] (empty)")
));

const v = viz(
  {
    algorithm: "flood_fill",
    title: "Flood Fill Algorithm",
    description: "BFS-based flood fill on a 5x5 grid, showing connected region filling from a seed cell.",
    category: "searching",
    difficulty: "intermediate",
    complexity: { time: "O(m*n)", space: "O(m*n)" },
    input: `5x5 grid with blue/white regions. Seed: (2,2)`,
  },
  [m, title, status, queueLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
