// Word Search — DFS backtracking on a character grid
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// 3x4 character grid
const grid = [
  ["C", "A", "T", "S"],
  ["O", "D", "E", "P"],
  ["B", "E", "X", "Q"],
];
const rows = 3;
const cols = 4;
const word = "CODE";

const m = layout.matrix(rows, cols, {
  values: grid,
  cellWidth: 70,
  cellHeight: 70,
  gap: 4,
  y: 100,
  sublabels: true,
});

const title = titleLabel("Word Search — Backtracking DFS");
const status = statusLabel("");
const wordLabel = label(`Searching for: "${word}"`, 500, 75, {
  id: "wordlbl", fontSize: 15, fill: "$text",
});
const progressLabel = label("Found: ", 500, 520, {
  id: "progress", fontSize: 14, fill: "$text",
});

const steps = [];

// Setup
steps.push(annotatedStep(
  `Search for "${word}" in a ${rows}x${cols} character grid using DFS`,
  "initialization",
  {
    narration: `We search for the word <span class="highlight">"${word}"</span> in a ${rows}x${cols} grid. ` +
      'Starting from each cell, we try to match the word character by character using ' +
      '<span class="highlight">DFS with backtracking</span>. ' +
      'We can move in <span class="warn">4 directions</span> (up, down, left, right). ' +
      'Each cell can only be used <span class="danger">once</span> per path.',
    phase: "setup",
  },
  ops.setText(status.id, `Find "${word}" in the grid using DFS`)
));

// DFS search
const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const dirNames = ["up", "down", "left", "right"];
let found = false;
let teachCount = 0;

function dfs(r, c, idx, path) {
  if (found) return;

  // Out of bounds
  if (r < 0 || r >= rows || c < 0 || c >= cols) return;
  // Already visited
  if (visited[r][c]) return;
  // Character mismatch
  if (grid[r][c] !== word[idx]) {
    steps.push(step(
      `(${r},${c}) = '${grid[r][c]}' !== '${word[idx]}' — mismatch`,
      ops.highlight(m.id(r, c), "$danger"),
      ops.setText(status.id, `'${grid[r][c]}' at (${r},${c}) does not match '${word[idx]}'`)
    ));
    steps.push(step(
      `Reset (${r},${c})`,
      ops.reset(m.id(r, c))
    ));
    return;
  }

  // Match found for this character
  visited[r][c] = true;
  path.push([r, c]);
  const matchedSoFar = word.substring(0, idx + 1);

  if (teachCount < 4) {
    steps.push(teach(
      `(${r},${c}) = '${grid[r][c]}' matches '${word[idx]}' — matched "${matchedSoFar}"`,
      `Cell <span class="highlight">(${r},${c})</span> contains <span class="success">'${grid[r][c]}'</span>, ` +
        `matching character ${idx} of "${word}". ` +
        `Path so far: <span class="success">${matchedSoFar}</span>. ` +
        (idx < word.length - 1
          ? `We mark it visited and explore neighbors for <span class="warn">'${word[idx + 1]}'</span>. ` +
            'If no neighbor matches, we <span class="danger">backtrack</span> and unmark this cell.'
          : '<span class="success">This completes the word!</span>'),
      ops.highlight(m.id(r, c), "$success"),
      ops.setText(status.id, `Matched: "${matchedSoFar}"`),
      ops.setText("progress", `Found: ${matchedSoFar}`)
    ));
    teachCount++;
  } else {
    steps.push(step(
      `(${r},${c}) = '${grid[r][c]}' matches — "${matchedSoFar}"`,
      ops.highlight(m.id(r, c), "$success"),
      ops.setText(status.id, `Matched: "${matchedSoFar}"`),
      ops.setText("progress", `Found: ${matchedSoFar}`)
    ));
  }

  // Complete word found
  if (idx === word.length - 1) {
    found = true;
    return;
  }

  // Try all 4 directions
  for (let d = 0; d < 4; d++) {
    if (found) return;
    const nr = r + directions[d][0];
    const nc = c + directions[d][1];

    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
      steps.push(step(
        `From (${r},${c}) try ${dirNames[d]} to (${nr},${nc})`,
        ops.highlight(m.id(r, c), "$warning"),
        ops.setText(status.id, `Exploring ${dirNames[d]} from (${r},${c}) to (${nr},${nc})`)
      ));
    }

    dfs(nr, nc, idx + 1, path);
  }

  if (!found) {
    // Backtrack
    visited[r][c] = false;
    path.pop();
    const remaining = path.length > 0 ? word.substring(0, path.length) : "";

    steps.push(teach(
      `Backtrack from (${r},${c}) — no valid neighbor for '${word[idx + 1]}'`,
      `<span class="danger">Dead end!</span> No unvisited neighbor of (${r},${c}) matches ` +
        `<span class="warn">'${word[idx + 1]}'</span>. ` +
        'We <span class="danger">unmark</span> this cell and return to the previous cell. ' +
        'The DFS continues exploring other directions from the caller.',
      ops.highlight(m.id(r, c), "$danger"),
      ops.setText(status.id, `Backtrack from (${r},${c})`),
      ops.setText("progress", `Found: ${remaining}`)
    ));

    steps.push(step(
      `Reset (${r},${c}) after backtrack`,
      ops.reset(m.id(r, c))
    ));
  }
}

// Try starting from each cell
for (let r = 0; r < rows && !found; r++) {
  for (let c = 0; c < cols && !found; c++) {
    if (grid[r][c] === word[0]) {
      steps.push(step(
        `Try starting DFS from (${r},${c}) where '${grid[r][c]}' = '${word[0]}'`,
        ops.highlight(m.id(r, c), "$warning"),
        ops.setText(status.id, `Start search from (${r},${c})`)
      ));

      dfs(r, c, 0, []);

      if (!found) {
        // Reset all cells if this start didn't work
        const allIds = [];
        for (let rr = 0; rr < rows; rr++) {
          for (let cc = 0; cc < cols; cc++) {
            allIds.push(m.id(rr, cc));
          }
        }
        steps.push(step(
          `Starting from (${r},${c}) failed — try next start`,
          ops.reset(allIds),
          ops.setText(status.id, `No path from (${r},${c}) — trying next cell`),
          ops.setText("progress", "Found: ")
        ));
      }
    }
  }
}

// Final step
if (found) {
  const pathIds = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c]) {
        pathIds.push(m.id(r, c));
      }
    }
  }
  steps.push(annotatedStep(
    `Word "${word}" found! Path highlighted in green.`,
    "explanation",
    {
      narration: `<span class="success">Word "${word}" found!</span> ` +
        'The DFS with backtracking explored the grid, matching one character at a time. ' +
        'Key ideas: (1) <span class="highlight">Mark visited cells</span> to avoid cycles, ' +
        '(2) <span class="highlight">Backtrack</span> by unmarking when a path fails, ' +
        '(3) Try all <span class="warn">4 directions</span> at each cell. ' +
        'Time: <span class="highlight">O(m*n*4^L)</span> where L=word length. ' +
        'Space: <span class="highlight">O(L)</span> for the recursion stack.',
      phase: "cleanup",
    },
    ops.markDone(pathIds),
    ops.setText(status.id, `"${word}" found!`),
    ops.setText("progress", `Found: ${word}`)
  ));
} else {
  steps.push(annotatedStep(
    `Word "${word}" not found in the grid.`,
    "explanation",
    {
      narration: `<span class="danger">Word "${word}" was not found.</span> All possible starting positions and paths were explored.`,
      phase: "cleanup",
    },
    ops.setText(status.id, `"${word}" not found`),
    ops.setText("progress", "Found: (none)")
  ));
}

const v = viz(
  {
    algorithm: "word_search",
    title: "Word Search — Backtracking DFS",
    description: `Search for the word "${word}" in a ${rows}x${cols} character grid using DFS with backtracking.`,
    category: "backtracking",
    difficulty: "intermediate",
    complexity: { time: "O(m*n*4^L)", space: "O(L)" },
    input: `${rows}x${cols} grid, word="${word}"`,
  },
  [m, title, status, wordLabel, progressLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
