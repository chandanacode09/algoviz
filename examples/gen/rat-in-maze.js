// Rat in a Maze — Backtracking DFS path-finding visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// Maze: 1 = open, 0 = wall
const maze = [
  [1, 0, 0, 0],
  [1, 1, 0, 1],
  [0, 1, 0, 0],
  [1, 1, 1, 1],
];
const rows = 4;
const cols = 4;

// Display values: "." for open, "#" for wall
const displayValues = maze.map(row => row.map(v => v === 1 ? "." : "#"));

const m = layout.matrix(rows, cols, {
  values: displayValues,
  cellWidth: 60,
  cellHeight: 60,
  gap: 4,
  y: 100,
  sublabels: true,
});

const title = titleLabel("Rat in a Maze — Backtracking");
const status = statusLabel("");
const pathLabel = label("Path: []", 500, 550, {
  id: "pathlbl", fontSize: 14, fill: "$text",
});

const steps = [];

// Mark walls initially
const wallIds = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (maze[r][c] === 0) {
      wallIds.push(m.id(r, c));
    }
  }
}

// ─── Setup ───
steps.push(annotatedStep(
  "Find a path from top-left (0,0) to bottom-right (3,3) using backtracking",
  "initialization",
  {
    narration: 'The <span class="highlight">Rat in a Maze</span> problem: find a path from the top-left corner to ' +
      'the bottom-right corner. The rat can move <span class="warn">down</span> or <span class="warn">right</span>. ' +
      'Cells marked "#" are walls. We use <span class="highlight">DFS with backtracking</span> to explore paths, ' +
      'marking dead ends in <span class="danger">red</span> and the solution path in <span class="success">green</span>.',
    phase: "setup",
  },
  ops.highlight(wallIds, "$muted"),
  ops.setText(status.id, "4x4 maze: find path from (0,0) to (3,3)")
));

// DFS backtracking simulation
// Directions: down (1,0), right (0,1)
const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
const path = [];

function solve(r, c) {
  // Out of bounds or wall or already visited
  if (r < 0 || r >= rows || c < 0 || c >= cols || maze[r][c] === 0 || visited[r][c]) {
    return false;
  }

  // Visit this cell
  visited[r][c] = true;
  path.push([r, c]);

  steps.push(teach(
    `Visit (${r},${c}) — explore this cell`,
    `Moving to cell <span class="highlight">(${r},${c})</span>. Mark it as part of the current path. ` +
      (r === 0 && c === 0
        ? 'This is the <span class="highlight">starting cell</span>.'
        : `We arrived from the previous cell in our DFS exploration.`),
    ops.highlight(m.id(r, c), "$primary"),
    ops.setText("pathlbl", `Path: [${path.map(p => `(${p[0]},${p[1]})`).join(" -> ")}]`),
    ops.setText(status.id, `Exploring (${r},${c})`)
  ));

  // Check if we reached the destination
  if (r === rows - 1 && c === cols - 1) {
    steps.push(annotatedStep(
      `Reached destination (${r},${c})!`,
      "invariant",
      {
        narration: `<span class="success">Destination reached!</span> Cell (${r},${c}) is the bottom-right corner. ` +
          `The path from (0,0) to (${r},${c}) has ${path.length} cells. ` +
          `Backtracking successfully found a valid route through the maze!`,
        phase: "main-loop",
      },
      ops.highlight(m.id(r, c), "$success"),
      ops.setText(status.id, `Destination (${r},${c}) reached!`)
    ));
    return true;
  }

  // Try down first
  const downR = r + 1;
  const downC = c;
  if (downR < rows && maze[downR][downC] === 1 && !visited[downR][downC]) {
    steps.push(step(
      `Try moving down from (${r},${c}) to (${downR},${downC})`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.setText(status.id, `From (${r},${c}): try down to (${downR},${downC})`)
    ));

    if (solve(downR, downC)) {
      // Mark this cell as part of the solution path
      steps.push(step(
        `(${r},${c}) is part of the solution path`,
        ops.highlight(m.id(r, c), "$success"),
      ));
      return true;
    }
  } else if (downR < rows && (maze[downR][downC] === 0 || visited[downR][downC])) {
    steps.push(step(
      `Cannot move down from (${r},${c}): (${downR},${downC}) is ${maze[downR][downC] === 0 ? "a wall" : "already visited"}`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.setText(status.id, `Down from (${r},${c}) blocked`)
    ));
  }

  // Try right
  const rightR = r;
  const rightC = c + 1;
  if (rightC < cols && maze[rightR][rightC] === 1 && !visited[rightR][rightC]) {
    steps.push(step(
      `Try moving right from (${r},${c}) to (${rightR},${rightC})`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.setText(status.id, `From (${r},${c}): try right to (${rightR},${rightC})`)
    ));

    if (solve(rightR, rightC)) {
      // Mark this cell as part of the solution path
      steps.push(step(
        `(${r},${c}) is part of the solution path`,
        ops.highlight(m.id(r, c), "$success"),
      ));
      return true;
    }
  } else if (rightC < cols && (maze[rightR][rightC] === 0 || visited[rightR][rightC])) {
    steps.push(step(
      `Cannot move right from (${r},${c}): (${rightR},${rightC}) is ${maze[rightR][rightC] === 0 ? "a wall" : "already visited"}`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.setText(status.id, `Right from (${r},${c}) blocked`)
    ));
  }

  // Dead end: backtrack
  steps.push(teach(
    `Dead end at (${r},${c}) — backtrack!`,
    `<span class="danger">Dead end!</span> No valid moves from <span class="highlight">(${r},${c})</span>. ` +
      `All directions are either walls, out of bounds, or already visited. ` +
      `<span class="warn">Backtracking</span> prunes this path and tries the next option from the previous cell.`,
    ops.highlight(m.id(r, c), "$danger"),
    ops.setText(status.id, `Dead end at (${r},${c}) — backtracking`)
  ));

  path.pop();
  steps.push(step(
    `Remove (${r},${c}) from path`,
    ops.highlight(m.id(r, c), "$danger"),
    ops.setText("pathlbl", `Path: [${path.length > 0 ? path.map(p => `(${p[0]},${p[1]})`).join(" -> ") : ""}]`)
  ));

  return false;
}

solve(0, 0);

// ─── Cleanup ───
const solutionCells = path.map(p => m.id(p[0], p[1]));
steps.push(annotatedStep(
  `Solution found! Path has ${path.length} cells.`,
  "explanation",
  {
    narration: `<span class="success">Maze solved!</span> The path from (0,0) to (3,3) visits ${path.length} cells: ` +
      `<span class="success">${path.map(p => `(${p[0]},${p[1]})`).join(" -> ")}</span>. ` +
      `Backtracking systematically explored paths, pruning dead ends marked in <span class="danger">red</span>. ` +
      `Time: <span class="highlight">O(2^(n*n))</span> worst case. ` +
      `Space: <span class="highlight">O(n*n)</span> for the visited matrix and recursion stack.`,
    phase: "cleanup",
  },
  ops.markDone(solutionCells),
  ops.setText(status.id, `Solved! Path: ${path.map(p => `(${p[0]},${p[1]})`).join(" -> ")}`)
));

const v = viz(
  {
    algorithm: "rat_in_maze",
    title: "Rat in a Maze — Backtracking",
    description: "Find a path through a maze using DFS with backtracking, showing path exploration, dead ends, and pruning.",
    category: "backtracking",
    difficulty: "intermediate",
    complexity: { time: "O(2^(n*n))", space: "O(n*n)" },
    input: "4x4 maze: [[1,0,0,0],[1,1,0,1],[0,1,0,0],[1,1,1,1]]",
  },
  [m, title, status, pathLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
