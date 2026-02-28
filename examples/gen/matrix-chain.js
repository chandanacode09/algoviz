// Matrix Chain Multiplication — DP with diagonal filling
// Find optimal parenthesization to minimize scalar multiplications
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// Matrix dimensions: p = [10, 30, 5, 60]
// Matrices: A1=10x30, A2=30x5, A3=5x60
const p = [10, 30, 5, 60];
const n = p.length - 1; // 3 matrices

// DP table: n x n (upper triangular)
const dpInit = Array.from({ length: n }, () => Array(n).fill(""));
// dp[i][j] = min cost to multiply matrices i..j (0-indexed)

const m = layout.matrix(n, n, {
  values: dpInit,
  cellWidth: 80,
  cellHeight: 55,
  gap: 4,
  y: 140,
  sublabels: true,
});

const title = titleLabel("Matrix Chain Multiplication");
const status = statusLabel("");

// Column headers (matrix range labels)
const headers = [];
for (let c = 0; c < n; c++) {
  const actor = m.actors[c];
  headers.push(label(`M${c + 1}`, actor.x + 40, actor.y - 20, {
    fontSize: 14, fontWeight: "bold", fill: "$text",
  }));
}
// Row headers
for (let r = 0; r < n; r++) {
  const actor = m.actors[r * n];
  headers.push(label(`M${r + 1}`, actor.x - 25, actor.y + 27, {
    fontSize: 14, fontWeight: "bold", fill: "$text",
  }));
}

// Dimension info label
const dimLabel = label(
  `Dims: ${p.map((d, i) => i < n ? `M${i+1}=${p[i]}x${p[i+1]}` : "").filter(Boolean).join(", ")}`,
  500, 100,
  { id: "dlbl", fontSize: 14, fill: "$text" }
);

const splitLabel = label("", 500, 420, {
  id: "slbl", fontSize: 14, fill: "$text",
});

const steps = [];

// DP table
const dp = Array.from({ length: n }, () => Array(n).fill(Infinity));
const split = Array.from({ length: n }, () => Array(n).fill(-1));

// ─── Setup ───
steps.push(annotatedStep(
  "Matrix Chain Multiplication: find the optimal parenthesization",
  "initialization",
  {
    narration: 'Given matrices with dimensions [<span class="highlight">' + p.join(", ") + '</span>], ' +
      `we have ${n} matrices: ` +
      p.slice(0, n).map((d, i) => `M${i+1}=${p[i]}x${p[i+1]}`).join(", ") + ". " +
      'The goal: find the <span class="success">parenthesization that minimizes</span> the total ' +
      'number of scalar multiplications. We fill an upper-triangular DP table ' +
      '<span class="warn">diagonally</span>: first chains of length 1, then 2, then 3.',
    phase: "setup",
  },
  ops.setText(status.id, `Dimensions: [${p.join(", ")}] — ${n} matrices`)
));

// ─── Base case: chain length 1 ───
steps.push(teach(
  "Base case: single matrix chains cost 0 (diagonal)",
  'A single matrix requires <span class="success">no multiplications</span>. ' +
    'Set dp[i][i] = 0 for all i. These are the <span class="highlight">main diagonal</span> entries.',
  ops.setText(status.id, "Base case: dp[i][i] = 0 (no cost for single matrix)")
));

for (let i = 0; i < n; i++) {
  dp[i][i] = 0;
  steps.push(step(`dp[${i}][${i}] = 0 (matrix M${i + 1} alone)`,
    ops.setValue(m.id(i, i), 0),
    ops.markDone(m.id(i, i)),
    ops.setText(status.id, `dp[${i}][${i}] = 0`)
  ));
}

// Mark cells below diagonal as unused
for (let i = 1; i < n; i++) {
  for (let j = 0; j < i; j++) {
    steps.push(step(`Mark dp[${i}][${j}] as unused`,
      ops.setValue(m.id(i, j), "-"),
      ops.highlight(m.id(i, j), "$muted")
    ));
  }
}

// ─── Fill diagonals: chain length 2, 3, ..., n ───
for (let chainLen = 2; chainLen <= n; chainLen++) {
  steps.push(teach(
    `Fill chain length ${chainLen}: consider all chains of ${chainLen} consecutive matrices`,
    `Now consider chains of <span class="highlight">${chainLen} matrices</span>. ` +
      `For each starting index i, we compute dp[i][i+${chainLen - 1}] by trying ` +
      `every possible <span class="warn">split point k</span> and picking the minimum cost.`,
    ops.setText(status.id, `Chain length ${chainLen}: trying all split points`)
  ));

  for (let i = 0; i <= n - chainLen; i++) {
    const j = i + chainLen - 1;
    dp[i][j] = Infinity;

    // Highlight the cell we are computing
    steps.push(step(`Computing dp[${i}][${j}]: chain M${i + 1}..M${j + 1}`,
      ops.highlight(m.id(i, j), "$warning"),
      ops.setText(status.id, `dp[${i}][${j}]: multiply M${i + 1}..M${j + 1}`)
    ));

    // Try all split points
    for (let k = i; k < j; k++) {
      const cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1];
      const leftCost = dp[i][k];
      const rightCost = dp[k + 1][j];
      const multCost = p[i] * p[k + 1] * p[j + 1];

      const isBetter = cost < dp[i][j];

      steps.push(teach(
        `Split at k=${k}: cost = dp[${i}][${k}] + dp[${k + 1}][${j}] + ${p[i]}*${p[k+1]}*${p[j+1]} = ${leftCost} + ${rightCost} + ${multCost} = ${cost}`,
        `Try splitting at k=<span class="highlight">${k}</span>: ` +
          `(M${i+1}..M${k+1}) * (M${k+2}..M${j+1}). ` +
          `Left cost: dp[${i}][${k}] = <span class="warn">${leftCost}</span>. ` +
          `Right cost: dp[${k+1}][${j}] = <span class="warn">${rightCost}</span>. ` +
          `Multiply cost: ${p[i]} x ${p[k+1]} x ${p[j+1]} = <span class="warn">${multCost}</span>. ` +
          `Total: <span class="highlight">${cost}</span>.` +
          (isBetter
            ? ` <span class="success">New best!</span>`
            : ` Not better than current ${dp[i][j] === Infinity ? "none" : dp[i][j]}.`),
        ops.highlight(m.id(i, k), "$primary"),
        ops.highlight(m.id(k + 1, j), "$primary"),
        ops.highlight(m.id(i, j), isBetter ? "$success" : "$warning"),
        ops.setText("slbl", `Split k=${k}: ${leftCost} + ${rightCost} + ${multCost} = ${cost}${isBetter ? " (best!)" : ""}`),
        ops.setText(status.id, `k=${k}: cost=${cost}${isBetter ? " NEW BEST" : ""}`)
      ));

      if (isBetter) {
        dp[i][j] = cost;
        split[i][j] = k;
      }

      // Reset source cell highlights
      steps.push(step(`Reset highlights after split k=${k}`,
        ops.reset(m.id(i, k)),
        ops.reset(m.id(k + 1, j)),
        // Re-mark done cells
        ...(dp[i][k] !== Infinity && i === k ? [ops.markDone(m.id(i, k))] : []),
        ...(dp[k+1][j] !== Infinity && k + 1 === j ? [ops.markDone(m.id(k+1, j))] : []),
      ));
    }

    // Write final value
    steps.push(step(`dp[${i}][${j}] = ${dp[i][j]} (best split at k=${split[i][j]})`,
      ops.setValue(m.id(i, j), dp[i][j]),
      ops.markDone(m.id(i, j)),
      ops.setText(status.id, `dp[${i}][${j}] = ${dp[i][j]}, split at k=${split[i][j]}`)
    ));
  }
}

// ─── Final result ───
const answer = dp[0][n - 1];

// Build parenthesization string
function parenthesize(i, j) {
  if (i === j) return `M${i + 1}`;
  const k = split[i][j];
  return `(${parenthesize(i, k)} x ${parenthesize(k + 1, j)})`;
}
const optimalOrder = parenthesize(0, n - 1);

steps.push(annotatedStep(
  `Minimum multiplications: ${answer}. Optimal: ${optimalOrder}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> The minimum number of scalar multiplications is ` +
      `<span class="success">${answer}</span>. ` +
      `Optimal parenthesization: <span class="highlight">${optimalOrder}</span>. ` +
      'The DP table was filled <span class="warn">diagonally</span> — each cell depends only on ' +
      'cells in the same row to the left and same column below. ' +
      'Time: <span class="highlight">O(n^3)</span>. Space: <span class="highlight">O(n^2)</span>.',
    phase: "cleanup",
  },
  ops.highlight(m.id(0, n - 1), "$success"),
  ops.setText("slbl", `Optimal: ${optimalOrder}`),
  ops.setText(status.id, `Minimum cost: ${answer} multiplications`)
));

const v = viz(
  {
    algorithm: "matrix_chain_multiplication",
    title: "Matrix Chain Multiplication",
    description: "Find the optimal parenthesization of matrix chain multiplication using diagonal DP filling.",
    category: "dynamic-programming",
    difficulty: "advanced",
    complexity: { time: "O(n^3)", space: "O(n^2)" },
    input: `Dimensions: [${p.join(", ")}] (${n} matrices)`,
  },
  [m, title, status, dimLabel, splitLabel, ...headers],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
