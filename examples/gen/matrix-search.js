// Matrix Search — O(m+n) search in a row-column sorted matrix
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

const rows = 4;
const cols = 5;

// Sorted matrix: each row sorted, first element of each row > last of previous
const values = [
  [ 1,  3,  5,  7,  9],
  [10, 12, 14, 16, 18],
  [20, 22, 24, 26, 28],
  [30, 32, 34, 36, 38],
];

const target = 24;

const m = layout.matrix(rows, cols, {
  values,
  cellWidth: 60,
  cellHeight: 55,
  gap: 3,
  y: 90,
  sublabels: true,
});

const title = titleLabel("Matrix Search — Staircase");
const status = statusLabel(`Target: ${target}`);
const infoLabel = label(`Searching for: ${target}`, 500, 550, {
  id: "info", fontSize: 14, fill: "$text",
});

const steps = [];

// --- Initialization ---
steps.push(annotatedStep(
  `Search for ${target} in a sorted 4x5 matrix`,
  "initialization",
  {
    narration: 'This matrix is <span class="highlight">fully sorted</span>: each row is sorted left-to-right, ' +
      'and the first element of each row is greater than the last element of the previous row. ' +
      'We could use binary search (O(log(m*n))), but the <span class="warn">staircase search</span> from the ' +
      '<span class="highlight">top-right corner</span> is elegant and runs in <span class="highlight">O(m+n)</span>.',
    phase: "setup",
  },
  ops.setText(status.id, `Target: ${target} — start from top-right corner`)
));

// --- Explain the approach ---
steps.push(teach(
  "Start at top-right corner (0,4) — the key insight",
  'From the <span class="highlight">top-right corner</span>, we can make a clear decision: ' +
    'if the current value is <span class="warn">greater</span> than the target, move <span class="warn">left</span> ' +
    '(eliminating the entire column). If it is <span class="warn">less</span>, move <span class="warn">down</span> ' +
    '(eliminating the entire row). This <span class="highlight">elimination</span> approach ensures we visit ' +
    'at most m+n cells.',
  ops.highlight(m.id(0, 4), "$primary"),
  ops.setText(status.id, `Start at (0,4) = ${values[0][4]}`)
));

// Simulate staircase search
let r = 0;
let c = cols - 1;
let found = false;
let stepNum = 1;

while (r < rows && c >= 0) {
  const curr = values[r][c];

  if (curr === target) {
    // Found!
    steps.push(step(
      `Step ${stepNum}: (${r},${c}) = ${curr} === ${target} — FOUND!`,
      ops.highlight(m.id(r, c), "$success"),
      ops.setText(status.id, `Found ${target} at (${r},${c})!`),
      ops.setText("info", `Target ${target} found at position (${r},${c})`)
    ));
    found = true;
    break;
  } else if (curr > target) {
    // Move left — eliminate this column
    steps.push(teach(
      `Step ${stepNum}: (${r},${c}) = ${curr} > ${target} — move LEFT`,
      `Current value <span class="warn">${curr}</span> is greater than target <span class="highlight">${target}</span>. ` +
        `Everything <span class="warn">below</span> in column ${c} is also > ${target} (column is sorted). ` +
        `Eliminate column ${c} by moving <span class="highlight">left</span>.`,
      ops.highlight(m.id(r, c), "$danger"),
      ops.setText(status.id, `(${r},${c})=${curr} > ${target} => move left`),
      ops.setText("info", `Eliminated column ${c} — all values >= ${curr}`)
    ));

    // Dim the eliminated column
    const colCells = [];
    for (let row = r; row < rows; row++) {
      colCells.push(m.id(row, c));
    }
    steps.push(step(
      `Eliminate column ${c}`,
      ops.highlight(colCells, "$muted")
    ));

    c--;
  } else {
    // Move down — eliminate this row
    steps.push(teach(
      `Step ${stepNum}: (${r},${c}) = ${curr} < ${target} — move DOWN`,
      `Current value <span class="warn">${curr}</span> is less than target <span class="highlight">${target}</span>. ` +
        `Everything to the <span class="warn">left</span> in row ${r} is also < ${target} (row is sorted). ` +
        `Eliminate row ${r} by moving <span class="highlight">down</span>.`,
      ops.highlight(m.id(r, c), "$warning"),
      ops.setText(status.id, `(${r},${c})=${curr} < ${target} => move down`),
      ops.setText("info", `Eliminated row ${r} — all values <= ${curr}`)
    ));

    // Dim the eliminated row
    const rowCells = [];
    for (let col = 0; col <= c; col++) {
      rowCells.push(m.id(r, col));
    }
    steps.push(step(
      `Eliminate row ${r}`,
      ops.highlight(rowCells, "$muted")
    ));

    r++;
  }

  stepNum++;
}

if (!found) {
  steps.push(step(
    `Target ${target} not found in the matrix`,
    ops.setText(status.id, `${target} is not in the matrix`),
    ops.setText("info", `Search complete — ${target} not found`)
  ));
}

// --- Final result ---
steps.push(annotatedStep(
  `Search complete: ${target} found at (2,2) in ${stepNum} steps`,
  "explanation",
  {
    narration: `<span class="success">Found ${target}!</span> The staircase search took only <span class="highlight">${stepNum} steps</span>. ` +
      `In the worst case, we move at most m rows down and n columns left, giving <span class="highlight">O(m+n)</span> time. ` +
      `This is better than scanning the whole matrix O(m*n), though binary search on the flattened array gives O(log(m*n)). ` +
      `The staircase approach is <span class="warn">simple to implement</span> and works on any matrix sorted by rows and columns.`,
    phase: "cleanup",
  },
  ops.markDone(m.id(2, 2)),
  ops.setText(status.id, `Done: ${target} at (2,2) in O(m+n) time`)
));

const v = viz(
  {
    algorithm: "matrix_search",
    title: "Matrix Search — Staircase Approach",
    description: "O(m+n) search in a sorted matrix using top-right corner elimination.",
    category: "searching",
    difficulty: "intermediate",
    complexity: { time: "O(m+n)", space: "O(1)" },
    input: `4x5 sorted matrix, target: ${target}`,
  },
  [m, title, status, infoLabel],
  steps
);

process.stdout.write(JSON.stringify(v, null, 2));
