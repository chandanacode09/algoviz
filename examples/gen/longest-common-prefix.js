// Longest Common Prefix — vertical scanning approach
// Scan column by column across all strings, stop when characters differ
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const strings = ["flower", "flow", "flight"];
const maxLen = Math.max(...strings.map(s => s.length));

// Create one array per string, stacked vertically
const arrays = strings.map((s, idx) => {
  const chars = s.split("");
  return layout.array(chars, {
    y: 120 + idx * 100,
    prefix: `s${idx}`,
    cellWidth: 55,
    gap: 6,
  });
});

const title = titleLabel("Longest Common Prefix");
const status = statusLabel("", undefined, 520);

// Labels for each string
const stringLabels = strings.map((s, idx) =>
  label(`"${s}"`, 100, 120 + idx * 100 + 30, {
    id: `sl${idx}`,
    fontSize: 14,
    fontWeight: "bold",
    fill: "$text",
    anchor: "end",
  })
);

// Result label
const resultLabel = label("Prefix: \"\"", 500, 470, {
  id: "result",
  fontSize: 18,
  fontWeight: "bold",
  fill: "$primary",
});

// Pointer for column scanning
const colPtr = pointer("col", arrays[0].id(0), "above", { id: "pcol" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Find the longest common prefix of ${strings.length} strings`,
  "initialization",
  {
    narration: 'The <span class="highlight">longest common prefix</span> is the longest string that is a ' +
      'prefix of all given strings. We use <span class="warn">vertical scanning</span>: ' +
      'compare characters column by column across all strings. ' +
      'As soon as a column has a mismatch or a string runs out, we stop.',
    phase: "setup",
  },
  ops.setText(status.id, `Strings: "${strings.join('", "')}"`)
));

steps.push(teach(
  "Vertical scanning: check each column position across all strings",
  'We scan <span class="highlight">column by column</span>. At each column index, ' +
    'we check if <span class="warn">all strings have the same character</span>. ' +
    'The moment they differ (or a string ends), we have our answer.',
  ops.setText(status.id, "Scanning column by column...")
));

let prefix = "";
let stopped = false;

for (let col = 0; col < maxLen && !stopped; col++) {
  // Check if all strings have the same character at this column
  const refChar = strings[0][col];

  // Highlight the column across all strings
  const colActions = [];
  for (let row = 0; row < strings.length; row++) {
    if (col < strings[row].length) {
      colActions.push(ops.highlight(arrays[row].id(col), "$warning"));
    }
  }

  steps.push(teach(
    `Column ${col}: check character '${refChar}' across all strings`,
    `Checking column <span class="highlight">${col}</span>. ` +
      `The first string has <span class="warn">'${refChar}'</span>. ` +
      `Let's see if all strings match at this position.`,
    ops.movePointer("pcol", arrays[0].id(col)),
    ...colActions,
    ops.setText(status.id, `Column ${col}: checking '${refChar}' across all strings`)
  ));

  let allMatch = true;
  for (let row = 1; row < strings.length; row++) {
    if (col >= strings[row].length || strings[row][col] !== refChar) {
      allMatch = false;
      // Show the mismatch
      const reason = col >= strings[row].length
        ? `"${strings[row]}" has only ${strings[row].length} characters`
        : `'${strings[row][col]}' !== '${refChar}'`;

      const mismatchActions = col < strings[row].length
        ? [ops.highlight(arrays[row].id(col), "$danger")]
        : [];
      steps.push(teach(
        `Mismatch at string "${strings[row]}", column ${col}: ${reason}`,
        `String <span class="danger">"${strings[row]}"</span> at column ${col}: ` +
          `<span class="danger">${reason}</span>. ` +
          `The prefix ends here. We <span class="warn">stop scanning</span>.`,
        ...mismatchActions,
        ops.setText(status.id, `Mismatch at column ${col}: ${reason}`)
      ));

      stopped = true;
      break;
    }
  }

  if (allMatch) {
    prefix += refChar;

    // Mark this column as part of the prefix
    const markActions = [];
    for (let row = 0; row < strings.length; row++) {
      markActions.push(ops.markDone(arrays[row].id(col)));
    }

    steps.push(step(`Column ${col}: all match '${refChar}' — prefix is now "${prefix}"`,
      ...markActions,
      ops.setText("result", `Prefix: "${prefix}"`),
      ops.setText(status.id, `All match '${refChar}' — prefix = "${prefix}"`)
    ));
  }
}

// ─── Final result ───
steps.push(annotatedStep(
  `Longest common prefix: "${prefix}"`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> The longest common prefix is ` +
      `<span class="success">"${prefix}"</span> (length ${prefix.length}). ` +
      'Vertical scanning checks each column across all strings simultaneously. ' +
      'Time: <span class="highlight">O(S)</span> where S = sum of all characters. ' +
      'Space: <span class="highlight">O(1)</span>.',
    phase: "cleanup",
  },
  ops.setText("result", `Prefix: "${prefix}"`),
  ops.setText(status.id, `Result: longest common prefix = "${prefix}"`)
));

const v = viz(
  {
    algorithm: "longest_common_prefix",
    title: "Longest Common Prefix",
    description: "Find the longest common prefix among an array of strings using vertical scanning.",
    category: "string",
    difficulty: "beginner",
    complexity: { time: "O(S)", space: "O(1)" },
    input: `Strings: ["${strings.join('", "')}"]`,
  },
  [
    ...arrays, title, status, ...stringLabels, resultLabel, colPtr,
  ],
  steps,
  { canvas: { height: 520 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
