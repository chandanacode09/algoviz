// Edit Distance (Levenshtein) — DP with matrix visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const s1 = "cat";
const s2 = "cut";
const rows = s1.length + 1;
const cols = s2.length + 1;

// Initialize DP table
const dpValues = Array.from({ length: rows }, () => Array(cols).fill(0));
// Base cases: first row and first column
for (let i = 0; i <= s1.length; i++) dpValues[i][0] = i;
for (let j = 0; j <= s2.length; j++) dpValues[0][j] = j;

const initDisplay = Array.from({ length: rows }, () => Array(cols).fill(""));
// Pre-fill the display for base cases so we can show them
const m = layout.matrix(rows, cols, {
  values: initDisplay,
  cellWidth: 60,
  cellHeight: 60,
  gap: 4,
  y: 140,
});

const title = titleLabel("Edit Distance (Levenshtein)");
const status = statusLabel("");

// Row headers (s1 chars) and column headers (s2 chars)
const headerLabels = [];
for (let c = 0; c < cols; c++) {
  const ch = c === 0 ? "∅" : s2[c - 1];
  headerLabels.push(label(ch, m.actors[c].x + 30, m.actors[c].y - 22, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}
for (let r = 0; r < rows; r++) {
  const ch = r === 0 ? "∅" : s1[r - 1];
  headerLabels.push(label(ch, m.actors[r * cols].x - 22, m.actors[r * cols].y + 30, {
    fontSize: 16, fontWeight: "bold", fill: "$text",
  }));
}

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Edit Distance: transform "${s1}" into "${s2}"`,
  "initialization",
  {
    narration: '<span class="highlight">Edit Distance</span> measures the minimum number of single-character edits ' +
      '(insert, delete, replace) needed to transform one string into another. ' +
      `We build a ${rows}x${cols} DP table where dp[i][j] = min edits to convert ` +
      `"${s1}[0..i-1]" into "${s2}[0..j-1]".`,
    phase: "setup",
  },
  ops.setText(status.id, `Edit Distance: "${s1}" → "${s2}"`)
));

// ─── Base cases: first row ───
const baseCaseRowActions = [];
for (let j = 0; j <= s2.length; j++) {
  baseCaseRowActions.push(ops.setValue(m.id(0, j), j));
  baseCaseRowActions.push(ops.highlight(m.id(0, j), "$primary"));
}
steps.push(teach(
  "Base case: first row = cost of inserting j characters",
  'Base case row: to convert the <span class="highlight">empty string ""</span> into the first j characters of "' + s2 + '", ' +
    'we need exactly <span class="warn">j insertions</span>. So dp[0][j] = j.',
  ...baseCaseRowActions,
  ops.setText(status.id, "Base case: dp[0][j] = j (insert j chars)")
));

// Reset row highlights
const resetRowActions = [];
for (let j = 0; j <= s2.length; j++) {
  resetRowActions.push(ops.reset(m.id(0, j)));
}
steps.push(step("Reset row highlights", ...resetRowActions));

// ─── Base cases: first column ───
const baseCaseColActions = [];
for (let i = 0; i <= s1.length; i++) {
  baseCaseColActions.push(ops.setValue(m.id(i, 0), i));
  baseCaseColActions.push(ops.highlight(m.id(i, 0), "$primary"));
}
steps.push(teach(
  "Base case: first column = cost of deleting i characters",
  'Base case column: to convert the first i characters of "' + s1 + '" into <span class="highlight">""</span>, ' +
    'we need exactly <span class="warn">i deletions</span>. So dp[i][0] = i.',
  ...baseCaseColActions,
  ops.setText(status.id, "Base case: dp[i][0] = i (delete i chars)")
));

// Reset column highlights
const resetColActions = [];
for (let i = 0; i <= s1.length; i++) {
  resetColActions.push(ops.reset(m.id(i, 0)));
}
steps.push(step("Reset column highlights", ...resetColActions));

// ─── Main DP loop ───
steps.push(teach(
  "Fill each cell by choosing the minimum of 3 operations",
  'For each cell dp[i][j], we consider three operations: ' +
    '<span class="highlight">Replace</span> (dp[i-1][j-1] + cost), ' +
    '<span class="warn">Delete</span> (dp[i-1][j] + 1), and ' +
    '<span class="success">Insert</span> (dp[i][j-1] + 1). ' +
    'If characters match, replace cost is 0; otherwise 1. We pick the minimum.',
  ops.setText(status.id, "For each cell: min(replace, delete, insert)")
));

for (let i = 1; i < rows; i++) {
  for (let j = 1; j < cols; j++) {
    const charI = s1[i - 1];
    const charJ = s2[j - 1];
    const match = charI === charJ;
    const replaceCost = match ? 0 : 1;

    const diag = dpValues[i - 1][j - 1] + replaceCost; // replace (or match)
    const up = dpValues[i - 1][j] + 1;                  // delete
    const left = dpValues[i][j - 1] + 1;                // insert
    const best = Math.min(diag, up, left);
    dpValues[i][j] = best;

    // Determine which operation was chosen
    let opName = "replace";
    let opColor = "$warning";
    if (best === diag && match) { opName = "match (free)"; opColor = "$success"; }
    else if (best === diag) { opName = "replace"; opColor = "$warning"; }
    else if (best === up) { opName = "delete"; opColor = "$danger"; }
    else { opName = "insert"; opColor = "$primary"; }

    // Highlight the three source cells
    steps.push(teach(
      `dp[${i}][${j}]: '${charI}' vs '${charJ}' — ${match ? "match" : "no match"}. ` +
        `diag=${diag}, up=${up}, left=${left} → min=${best} (${opName})`,
      `Comparing <span class="highlight">'${charI}'</span> vs <span class="highlight">'${charJ}'</span>: ` +
        (match
          ? `they <span class="success">match</span>, so replace cost = 0. `
          : `they <span class="danger">differ</span>, so replace cost = 1. `) +
        `Diagonal (replace): ${dpValues[i-1][j-1]}+${replaceCost}=${diag}. ` +
        `Up (delete): ${dpValues[i-1][j]}+1=${up}. ` +
        `Left (insert): ${dpValues[i][j-1]}+1=${left}. ` +
        `Minimum = <span class="success">${best}</span> via <span class="highlight">${opName}</span>.`,
      ops.highlight(m.id(i, j), "$warning"),
      ops.highlight(m.id(i - 1, j - 1), "$secondary"),
      ops.highlight(m.id(i - 1, j), "$danger"),
      ops.highlight(m.id(i, j - 1), "$primary"),
      ops.setText(status.id, `dp[${i}][${j}]: min(${diag}, ${up}, ${left}) = ${best} (${opName})`)
    ));

    // Write value and reset highlights
    steps.push(step(`Set dp[${i}][${j}] = ${best}`,
      ops.setValue(m.id(i, j), best),
      ops.highlight(m.id(i, j), opColor),
      ops.reset(m.id(i - 1, j - 1)),
      ops.reset(m.id(i - 1, j)),
      ops.reset(m.id(i, j - 1)),
    ));

    steps.push(step(`Reset dp[${i}][${j}]`,
      ops.reset(m.id(i, j))
    ));
  }
}

// ─── Final answer ───
const answer = dpValues[rows - 1][cols - 1];
steps.push(annotatedStep(
  `Edit distance("${s1}", "${s2}") = ${answer}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> dp[${rows-1}][${cols-1}] = <span class="success">${answer}</span>. ` +
      `It takes <span class="highlight">${answer} edit${answer !== 1 ? "s" : ""}</span> ` +
      `to transform "${s1}" into "${s2}". ` +
      'Time complexity: <span class="highlight">O(m*n)</span>, space: <span class="highlight">O(m*n)</span>.',
    phase: "cleanup",
  },
  ops.highlight(m.id(rows - 1, cols - 1), "$success"),
  ops.setText(status.id, `Edit Distance("${s1}", "${s2}") = ${answer}`)
));

const v = viz(
  {
    algorithm: "edit_distance",
    title: "Edit Distance (Levenshtein)",
    description: "Compute the minimum number of insertions, deletions, and replacements to transform one string into another.",
    category: "dynamic-programming",
    difficulty: "intermediate",
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    input: `s1="${s1}", s2="${s2}"`,
  },
  [m, title, status, ...headerLabels],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
