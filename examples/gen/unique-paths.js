// Unique Paths — DP grid counting paths from top-left to bottom-right
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

const rows = 4;
const cols = 5;

// Initialize DP table with empty values
const initValues = Array.from({ length: rows }, () => Array(cols).fill(""));
const m = layout.matrix(rows, cols, {
  values: initValues,
  cellWidth: 55,
  cellHeight: 55,
  gap: 3,
  y: 100,
  sublabels: true,
});

const title = titleLabel("Unique Paths — DP Grid");
const status = statusLabel("");

// Row/column header labels
const headerLabels = [];
for (let c = 0; c < cols; c++) {
  headerLabels.push(label(`col ${c}`, m.actors[c].x + 27, m.actors[c].y - 18, {
    fontSize: 12, fill: "$muted",
  }));
}
for (let r = 0; r < rows; r++) {
  headerLabels.push(label(`row ${r}`, m.actors[r * cols].x - 30, m.actors[r * cols].y + 27, {
    fontSize: 12, fill: "$muted",
  }));
}

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Find the number of unique paths in a ${rows}x${cols} grid`,
  "initialization",
  {
    narration: 'Imagine a robot sitting at the <span class="highlight">top-left corner</span> of a grid. ' +
      'It can only move <span class="warn">right</span> or <span class="warn">down</span>. ' +
      `How many different paths can it take to reach the <span class="success">bottom-right corner</span> of a ${rows}x${cols} grid? ` +
      'We will use <span class="highlight">dynamic programming</span> to count them!',
    phase: "setup",
  },
  ops.setText(status.id, `${rows}x${cols} grid — count paths from top-left to bottom-right`)
));

// ─── Fill first row with 1s ───
steps.push(teach(
  "Fill the first row: there is only 1 way to reach any cell in row 0 (keep going right)",
  'For every cell in the <span class="highlight">first row</span>, the robot can only arrive by ' +
    'moving right, right, right... There is exactly <span class="success">1 path</span> to each of them.',
  ops.highlight(Array.from({ length: cols }, (_, c) => m.id(0, c)), "$primary"),
  ops.setText(status.id, "Filling first row — only 1 path to each cell")
));

for (let c = 0; c < cols; c++) {
  initValues[0][c] = 1;
  steps.push(step(
    `Set dp[0][${c}] = 1`,
    ops.setValue(m.id(0, c), 1),
    ops.highlight(m.id(0, c), "$success"),
  ));
}

// Reset first row highlighting
steps.push(step(
  "First row complete",
  ops.reset(Array.from({ length: cols }, (_, c) => m.id(0, c))),
  ops.markDone(Array.from({ length: cols }, (_, c) => m.id(0, c))),
));

// ─── Fill first column with 1s ───
steps.push(teach(
  "Fill the first column: there is only 1 way to reach any cell in column 0 (keep going down)",
  'For every cell in the <span class="highlight">first column</span>, the robot can only arrive by ' +
    'moving down, down, down... There is exactly <span class="success">1 path</span> to each of them.',
  ops.highlight(Array.from({ length: rows }, (_, r) => m.id(r, 0)), "$primary"),
  ops.setText(status.id, "Filling first column — only 1 path to each cell")
));

for (let r = 1; r < rows; r++) {
  initValues[r][0] = 1;
  steps.push(step(
    `Set dp[${r}][0] = 1`,
    ops.setValue(m.id(r, 0), 1),
    ops.highlight(m.id(r, 0), "$success"),
  ));
}

// Reset first column highlighting
steps.push(step(
  "First column complete",
  ops.reset(Array.from({ length: rows - 1 }, (_, i) => m.id(i + 1, 0))),
  ops.markDone(Array.from({ length: rows - 1 }, (_, i) => m.id(i + 1, 0))),
));

// ─── Fill the rest of the grid ───
steps.push(teach(
  "Now fill the rest: dp[i][j] = dp[i-1][j] + dp[i][j-1]",
  'Here is the key idea: to reach cell (i,j), the robot must have come from ' +
    '<span class="highlight">directly above</span> (i-1, j) or ' +
    '<span class="highlight">directly left</span> (i, j-1). ' +
    'So the number of paths to (i,j) is the <span class="warn">sum</span> of paths to those two neighbors!',
  ops.setText(status.id, "Key formula: dp[i][j] = dp[i-1][j] + dp[i][j-1]")
));

for (let r = 1; r < rows; r++) {
  for (let c = 1; c < cols; c++) {
    const fromAbove = initValues[r - 1][c];
    const fromLeft = initValues[r][c - 1];
    const total = fromAbove + fromLeft;
    initValues[r][c] = total;

    // Highlight the two source cells
    steps.push(teach(
      `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${fromAbove} + ${fromLeft} = ${total}`,
      `Cell (${r},${c}): the robot can come from <span class="highlight">above</span> (${r - 1},${c}) = ${fromAbove} paths, ` +
        `or from the <span class="highlight">left</span> (${r},${c - 1}) = ${fromLeft} paths. ` +
        `Total: <span class="warn">${fromAbove} + ${fromLeft} = ${total}</span>.`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.highlight(m.id(r - 1, c), "$primary"),
      ops.highlight(m.id(r, c - 1), "$primary"),
      ops.setText(status.id, `dp[${r}][${c}] = ${fromAbove} + ${fromLeft} = ${total}`)
    ));

    // Set value and reset highlights
    steps.push(step(
      `Set dp[${r}][${c}] = ${total}`,
      ops.setValue(m.id(r, c), total),
      ops.markDone(m.id(r, c)),
      ops.reset([m.id(r - 1, c), m.id(r, c - 1)]),
      // Re-mark previously done cells that we just reset
      ...(r - 1 === 0 || c === 0 ? [ops.markDone(m.id(r - 1, c))] : []),
      ...(r === 0 || c - 1 === 0 ? [ops.markDone(m.id(r, c - 1))] : []),
    ));
  }
}

// ─── Final result ───
const answer = initValues[rows - 1][cols - 1];
steps.push(annotatedStep(
  `Answer: ${answer} unique paths from (0,0) to (${rows - 1},${cols - 1})`,
  "explanation",
  {
    narration: `<span class="success">There are ${answer} unique paths</span> from the top-left to the bottom-right ` +
      `of a ${rows}x${cols} grid! The robot can only move right or down, and dynamic programming let us ` +
      `count every possible route without actually tracing them all. ` +
      `Time: <span class="highlight">O(m*n)</span>. Space: <span class="highlight">O(m*n)</span> for the grid.`,
    phase: "cleanup",
  },
  ops.highlight(m.id(rows - 1, cols - 1), "$success"),
  ops.setText(status.id, `Answer: ${answer} unique paths in a ${rows}x${cols} grid`)
));

const v = viz(
  {
    algorithm: "unique_paths",
    title: "Unique Paths — DP Grid",
    description: "Count the number of unique paths from top-left to bottom-right in a grid, moving only right or down.",
    category: "dynamic-programming",
    difficulty: "beginner",
    complexity: { time: "O(m*n)", space: "O(m*n)" },
    input: `Grid: ${rows}x${cols}`,
  },
  [m, title, status, ...headerLabels],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
