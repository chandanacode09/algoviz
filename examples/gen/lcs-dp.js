// Longest Common Subsequence (DP) — generated using primitives prompt
const {
  layout, ops, step, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("../../dist/src/index");

resetIds();

const s1 = "ABCB";
const s2 = "BDCB";
const rows = s1.length + 1;
const cols = s2.length + 1;

// Initialize DP table with zeros
const initValues = Array.from({ length: rows }, () => Array(cols).fill(0));
const m = layout.matrix(rows, cols, {
  values: initValues,
  cellWidth: 55,
  cellHeight: 55,
  gap: 3,
  y: 120,
});

const title = titleLabel("LCS — Longest Common Subsequence");
const status = statusLabel("");

// Row/column headers
const headerLabels = [];
for (let c = 0; c < cols; c++) {
  const ch = c === 0 ? "∅" : s2[c - 1];
  headerLabels.push(label(ch, m.actors[c].x + 27, m.actors[c].y - 20, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}
for (let r = 0; r < rows; r++) {
  const ch = r === 0 ? "∅" : s1[r - 1];
  headerLabels.push(label(ch, m.actors[r * cols].x - 20, m.actors[r * cols].y + 27, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}

const steps = [];

steps.push(step("Initialize DP table with zeros. Rows = ∅ABCB, Cols = ∅BDCB",
  ops.setText(status.id, `LCS("${s1}", "${s2}") — filling table`)
));

// Fill the DP table
for (let i = 1; i < rows; i++) {
  for (let j = 1; j < cols; j++) {
    const charI = s1[i - 1];
    const charJ = s2[j - 1];

    if (charI === charJ) {
      const prev = initValues[i - 1][j - 1];
      initValues[i][j] = prev + 1;

      steps.push(step(`s1[${i-1}]='${charI}' == s2[${j-1}]='${charJ}': dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${prev + 1}`,
        ops.highlight(m.id(i, j), "$warning"),
        ops.highlight(m.id(i - 1, j - 1), "$primary"),
        ops.setText(status.id, `Match! '${charI}' = '${charJ}' → ${prev} + 1 = ${prev + 1}`)
      ));

      steps.push(step(`Set dp[${i}][${j}] = ${initValues[i][j]}`,
        ops.setValue(m.id(i, j), initValues[i][j]),
        ops.highlight(m.id(i, j), "$success"),
        ops.reset(m.id(i - 1, j - 1)),
      ));
    } else {
      const up = initValues[i - 1][j];
      const left = initValues[i][j - 1];
      initValues[i][j] = Math.max(up, left);

      steps.push(step(`s1[${i-1}]='${charI}' != s2[${j-1}]='${charJ}': dp[${i}][${j}] = max(dp[${i-1}][${j}], dp[${i}][${j-1}]) = max(${up}, ${left}) = ${initValues[i][j]}`,
        ops.highlight(m.id(i, j), "$warning"),
        ops.highlight([m.id(i - 1, j), m.id(i, j - 1)], "$primary"),
        ops.setText(status.id, `No match: max(↑${up}, ←${left}) = ${initValues[i][j]}`)
      ));

      steps.push(step(`Set dp[${i}][${j}] = ${initValues[i][j]}`,
        ops.setValue(m.id(i, j), initValues[i][j]),
        ops.reset([m.id(i, j), m.id(i - 1, j), m.id(i, j - 1)]),
      ));
    }
  }
}

// Highlight result
const lcsLen = initValues[rows - 1][cols - 1];
steps.push(step(`LCS length = dp[${rows-1}][${cols-1}] = ${lcsLen}`,
  ops.highlight(m.id(rows - 1, cols - 1), "$success"),
  ops.setText(status.id, `LCS("${s1}", "${s2}") = ${lcsLen} (subsequence: "BCB")`)
));

const v = viz(
  {
    algorithm: "lcs",
    title: "Longest Common Subsequence",
    category: "dynamic-programming",
    difficulty: "intermediate",
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    input: `s1="${s1}", s2="${s2}"`,
  },
  [m, title, status, ...headerLabels],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
