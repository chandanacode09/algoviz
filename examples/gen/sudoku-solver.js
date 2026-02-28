// Sudoku Solver — Backtracking on a 4x4 mini-sudoku
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// 4x4 Sudoku: digits 1-4, 2x2 boxes
// 0 means empty cell to be solved
const puzzle = [
  [1, 0, 0, 4],
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [4, 0, 0, 1],
];

const displayValues = puzzle.map(row => row.map(v => v === 0 ? "" : String(v)));

const m = layout.matrix(4, 4, {
  values: displayValues,
  cellWidth: 70,
  cellHeight: 70,
  gap: 4,
  y: 100,
  sublabels: true,
});

const title = titleLabel("Sudoku Solver — Backtracking (4x4)");
const status = statusLabel("");
const infoLabel = label("Constraint: each row, column, and 2x2 box must contain 1-4", 500, 75, {
  id: "info", fontSize: 13, fill: "$muted",
});

const steps = [];

// Mark pre-filled cells
const prefilledIds = [];
const emptyIds = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    if (puzzle[r][c] !== 0) {
      prefilledIds.push(m.id(r, c));
    } else {
      emptyIds.push(m.id(r, c));
    }
  }
}

steps.push(annotatedStep(
  "4x4 Sudoku puzzle with pre-filled cells",
  "initialization",
  {
    narration: 'A <span class="highlight">4x4 mini-Sudoku</span> puzzle. Pre-filled cells (shown in blue) are fixed. ' +
      'Empty cells must be filled with digits <span class="warn">1-4</span> such that each ' +
      '<span class="highlight">row</span>, <span class="highlight">column</span>, and ' +
      '<span class="highlight">2x2 box</span> contains all digits exactly once. ' +
      'We solve it using <span class="highlight">backtracking</span>: try a digit, check constraints, undo if stuck.',
    phase: "setup",
  },
  ops.highlight(prefilledIds, "$primary"),
  ops.setText(status.id, "4x4 Sudoku: fill empty cells with 1-4")
));

// Sudoku constraint checking
function isValid(grid, row, col, num) {
  // Check row
  for (let c = 0; c < 4; c++) {
    if (grid[row][c] === num) return { valid: false, conflictR: row, conflictC: c, reason: "row" };
  }
  // Check column
  for (let r = 0; r < 4; r++) {
    if (grid[r][col] === num) return { valid: false, conflictR: r, conflictC: col, reason: "column" };
  }
  // Check 2x2 box
  const boxR = Math.floor(row / 2) * 2;
  const boxC = Math.floor(col / 2) * 2;
  for (let r = boxR; r < boxR + 2; r++) {
    for (let c = boxC; c < boxC + 2; c++) {
      if (grid[r][c] === num) return { valid: false, conflictR: r, conflictC: c, reason: "box" };
    }
  }
  return { valid: true };
}

// Find empty cells
function findEmpty(grid) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

// Solve with backtracking, generating steps along the way
const grid = puzzle.map(row => [...row]);
let teachCount = 0;

function solve(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true; // All cells filled

  const [row, col] = empty;

  // Highlight current cell
  steps.push(step(
    `Try to fill cell (${row},${col})`,
    ops.highlight(m.id(row, col), "$warning"),
    ops.setText(status.id, `Trying cell (${row},${col})`)
  ));

  for (let num = 1; num <= 4; num++) {
    const check = isValid(grid, row, col, num);

    if (check.valid) {
      // Place the digit
      grid[row][col] = num;

      if (teachCount < 3) {
        steps.push(teach(
          `Place ${num} at (${row},${col}) — passes all constraints`,
          `Digit <span class="success">${num}</span> at <span class="highlight">(${row},${col})</span> is valid: ` +
            `no conflict in <span class="warn">row ${row}</span>, <span class="warn">column ${col}</span>, ` +
            `or the <span class="warn">2x2 box</span> starting at (${Math.floor(row / 2) * 2},${Math.floor(col / 2) * 2}). ` +
            'Each constraint is checked independently. If <span class="danger">any</span> fails, the digit is rejected.',
          ops.setValue(m.id(row, col), String(num)),
          ops.highlight(m.id(row, col), "$success"),
          ops.setText(status.id, `Placed ${num} at (${row},${col}) — valid!`)
        ));
        teachCount++;
      } else {
        steps.push(step(
          `Place ${num} at (${row},${col}) — valid`,
          ops.setValue(m.id(row, col), String(num)),
          ops.highlight(m.id(row, col), "$success"),
          ops.setText(status.id, `Placed ${num} at (${row},${col}) — valid!`)
        ));
      }

      if (solve(grid)) {
        return true;
      }

      // Backtrack
      grid[row][col] = 0;
      steps.push(teach(
        `Backtrack: remove ${num} from (${row},${col})`,
        `<span class="danger">Backtracking!</span> Digit <span class="warn">${num}</span> at (${row},${col}) ` +
          'led to a dead end further down the search. We undo the placement and try the next digit. ' +
          'This is the essence of <span class="highlight">backtracking</span>: undo and explore alternatives.',
        ops.setValue(m.id(row, col), ""),
        ops.highlight(m.id(row, col), "$danger"),
        ops.setText(status.id, `Backtrack: removed ${num} from (${row},${col})`)
      ));
    } else {
      // Conflict found
      steps.push(step(
        `Try ${num} at (${row},${col}) — conflicts in ${check.reason} with (${check.conflictR},${check.conflictC})`,
        ops.setValue(m.id(row, col), String(num)),
        ops.highlight(m.id(row, col), "$danger"),
        ops.highlight(m.id(check.conflictR, check.conflictC), "$danger"),
        ops.setText(status.id, `${num} at (${row},${col}) conflicts in ${check.reason}`)
      ));

      // Reset after showing conflict
      steps.push(step(
        `Clear ${num} from (${row},${col})`,
        ops.setValue(m.id(row, col), ""),
        ops.highlight(m.id(row, col), "$warning"),
        ops.reset(m.id(check.conflictR, check.conflictC)),
        // Re-highlight pre-filled if it was the conflict
        ...(puzzle[check.conflictR][check.conflictC] !== 0
          ? ops.highlight(m.id(check.conflictR, check.conflictC), "$primary")
          : [])
      ));
    }
  }

  // No digit works — need to backtrack further
  steps.push(step(
    `No valid digit for (${row},${col}) — backtrack further`,
    ops.highlight(m.id(row, col), "$danger"),
    ops.setText(status.id, `Dead end at (${row},${col}) — backtracking`)
  ));

  // Reset cell appearance
  steps.push(step(
    `Reset cell (${row},${col})`,
    ops.reset(m.id(row, col)),
    ops.setValue(m.id(row, col), "")
  ));

  return false;
}

solve(grid);

// Final result
const allIds = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    allIds.push(m.id(r, c));
  }
}

steps.push(annotatedStep(
  "Sudoku solved! All constraints satisfied.",
  "explanation",
  {
    narration: '<span class="success">Puzzle solved!</span> Every row, column, and 2x2 box contains the digits 1-4 exactly once. ' +
      'The backtracking algorithm systematically tried digits and undid placements that led to dead ends. ' +
      'Time complexity: <span class="highlight">O(k^n)</span> where k=4 (digits) and n=empty cells. ' +
      'Space: <span class="highlight">O(n)</span> for the recursion stack. ' +
      'For a 9x9 Sudoku the same approach works but explores a much larger search space.',
    phase: "cleanup",
  },
  ops.markDone(allIds),
  ops.setText(status.id, "Solved! All constraints satisfied.")
));

const v = viz(
  {
    algorithm: "sudoku_solver",
    title: "Sudoku Solver — Backtracking (4x4)",
    description: "Solve a 4x4 mini-Sudoku using backtracking, showing constraint checking for rows, columns, and 2x2 boxes.",
    category: "backtracking",
    difficulty: "advanced",
    complexity: { time: "O(k^n)", space: "O(n)" },
    input: "4x4 Sudoku: [[1,_,_,4],[_,_,1,_],[_,1,_,_],[4,_,_,1]]",
  },
  [m, title, status, infoLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
