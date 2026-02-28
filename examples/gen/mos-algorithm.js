// Mo's Algorithm — offline range query processing
// Sort queries by block ordering to minimize pointer movement
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [1, 1, 2, 1, 3, 4, 5, 2];
const n = values.length;
const blockSize = Math.floor(Math.sqrt(n)); // ~2

const arr = layout.array(values, { y: 200, prefix: "a" });

// Queries: [l, r] (inclusive), compute sum of elements
const queries = [
  { l: 1, r: 4, idx: 0 },
  { l: 0, r: 2, idx: 1 },
  { l: 5, r: 7, idx: 2 },
  { l: 3, r: 6, idx: 3 },
];

const title = titleLabel("Mo's Algorithm");
const status = statusLabel("", undefined, 550);

// Block boundary labels
const blockLabels = [];
for (let b = 0; b * blockSize < n; b++) {
  const start = b * blockSize;
  const end = Math.min(start + blockSize - 1, n - 1);
  const midIdx = Math.floor((start + end) / 2);
  const actor = arr.actors[midIdx];
  blockLabels.push(label(`Block ${b}`, actor.x + actor.width / 2, actor.y + actor.height + 22, {
    id: `blk${b}`,
    fontSize: 11,
    fill: "$muted",
  }));
}

const queryLabel = label("Queries: unsorted", 500, 100, {
  id: "qlbl", fontSize: 14, fill: "$text",
});
const windowLabel = label("Window sum: 0", 500, 420, {
  id: "wlbl", fontSize: 16, fontWeight: "bold", fill: "$primary",
});
const resultLabel = label("Results: []", 500, 460, {
  id: "rlbl", fontSize: 14, fill: "$text",
});

const lPtr = pointer("L", arr.id(0), "above", { id: "pl" });
const rPtr = pointer("R", arr.id(0), "below", { id: "pr" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Mo's Algorithm: process range queries efficiently by sorting them",
  "initialization",
  {
    narration: '<span class="highlight">Mo\'s Algorithm</span> answers multiple <span class="warn">range queries</span> ' +
      'offline by sorting them cleverly. The key idea: divide the array into ' +
      `<span class="highlight">blocks of size sqrt(n) = ${blockSize}</span>. ` +
      'Sort queries by (block of L, then R). This minimizes how much the L and R pointers move. ' +
      'Total pointer movement: <span class="highlight">O((n + q) * sqrt(n))</span>.',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${values.join(", ")}], ${queries.length} queries, block size = ${blockSize}`)
));

// Show original queries
const origQueryStr = queries.map(q => `[${q.l},${q.r}]`).join(", ");
steps.push(teach(
  `Original queries: ${origQueryStr}`,
  `We have ${queries.length} queries: <span class="highlight">${origQueryStr}</span>. ` +
    'Each asks for the sum of elements in a range [L, R]. ' +
    'Before processing, we <span class="warn">sort by Mo\'s ordering</span>.',
  ops.setText("qlbl", `Queries (unsorted): ${origQueryStr}`),
  ops.setText(status.id, "Step 1: Sort queries by Mo's block ordering")
));

// Sort queries by Mo's ordering
const sortedQueries = [...queries].sort((a, b) => {
  const blockA = Math.floor(a.l / blockSize);
  const blockB = Math.floor(b.l / blockSize);
  if (blockA !== blockB) return blockA - blockB;
  return blockA % 2 === 0 ? a.r - b.r : b.r - a.r;
});

const sortedStr = sortedQueries.map(q => `[${q.l},${q.r}]`).join(", ");
steps.push(teach(
  `Sorted queries: ${sortedStr}`,
  `After sorting by (block of L, then R): <span class="success">${sortedStr}</span>. ` +
    'Queries with L in the same block are grouped together, and R is sorted within each group. ' +
    'This ensures the <span class="highlight">R pointer mostly moves forward</span> within a block.',
  ops.setText("qlbl", `Queries (sorted): ${sortedStr}`),
  ops.setText(status.id, `Sorted: ${sortedStr}`)
));

// ─── Process queries ───
let curL = 0;
let curR = -1;
let curSum = 0;
const results = Array(queries.length).fill(0);

for (let qi = 0; qi < sortedQueries.length; qi++) {
  const q = sortedQueries[qi];

  steps.push(teach(
    `Query ${qi + 1}: sum of [${q.l}..${q.r}]`,
    `Processing query <span class="highlight">[${q.l}, ${q.r}]</span> (original index ${q.idx}). ` +
      `Current window: [${curL}, ${curR}]. ` +
      `We need to <span class="warn">expand or contract</span> the window to match [${q.l}, ${q.r}].`,
    ops.reset(arr.ids),
    ops.setText("wlbl", `Window sum: ${curSum}`),
    ops.setText(status.id, `Query [${q.l},${q.r}]: adjust window from [${curL},${curR}]`)
  ));

  // Expand R to the right
  while (curR < q.r) {
    curR++;
    curSum += values[curR];
    steps.push(step(`Expand R to ${curR}: add arr[${curR}]=${values[curR]}, sum=${curSum}`,
      ops.movePointer("pr", arr.id(curR)),
      ops.highlight(arr.id(curR), "$success"),
      ops.setText("wlbl", `Window sum: ${curSum}`),
      ops.setText(status.id, `R -> ${curR}: +${values[curR]}, sum=${curSum}`)
    ));
  }

  // Shrink R from the right
  while (curR > q.r) {
    curSum -= values[curR];
    steps.push(step(`Shrink R from ${curR}: remove arr[${curR}]=${values[curR]}, sum=${curSum}`,
      ops.highlight(arr.id(curR), "$danger"),
      ops.setText("wlbl", `Window sum: ${curSum}`),
      ops.setText(status.id, `R <- ${curR}: -${values[curR]}, sum=${curSum}`)
    ));
    curR--;
    steps.push(step(`R now at ${curR}`,
      ops.movePointer("pr", arr.id(curR)),
      ops.reset(arr.id(curR + 1))
    ));
  }

  // Expand L to the left
  while (curL > q.l) {
    curL--;
    curSum += values[curL];
    steps.push(step(`Expand L to ${curL}: add arr[${curL}]=${values[curL]}, sum=${curSum}`,
      ops.movePointer("pl", arr.id(curL)),
      ops.highlight(arr.id(curL), "$success"),
      ops.setText("wlbl", `Window sum: ${curSum}`),
      ops.setText(status.id, `L <- ${curL}: +${values[curL]}, sum=${curSum}`)
    ));
  }

  // Shrink L from the left
  while (curL < q.l) {
    curSum -= values[curL];
    steps.push(step(`Shrink L from ${curL}: remove arr[${curL}]=${values[curL]}, sum=${curSum}`,
      ops.highlight(arr.id(curL), "$danger"),
      ops.setText("wlbl", `Window sum: ${curSum}`),
      ops.setText(status.id, `L -> ${curL}: -${values[curL]}, sum=${curSum}`)
    ));
    curL++;
    steps.push(step(`L now at ${curL}`,
      ops.movePointer("pl", arr.id(curL)),
      ops.reset(arr.id(curL - 1))
    ));
  }

  // Highlight the current window
  const windowIds = [];
  for (let i = curL; i <= curR; i++) {
    windowIds.push(arr.id(i));
  }

  results[q.idx] = curSum;

  const resultsSoFar = results.map((r, i) => {
    const found = sortedQueries.slice(0, qi + 1).find(sq => sq.idx === i);
    return found ? `[${queries[i].l},${queries[i].r}]=${r}` : "?";
  });

  steps.push(teach(
    `Query [${q.l},${q.r}] answer = ${curSum}`,
    `Window [${q.l}, ${q.r}] has sum = <span class="success">${curSum}</span>. ` +
      `Store this as the answer for original query ${q.idx}.`,
    ops.highlight(windowIds, "$primary"),
    ops.movePointer("pl", arr.id(curL)),
    ops.movePointer("pr", arr.id(curR)),
    ops.setText("wlbl", `Window [${q.l},${q.r}] sum: ${curSum}`),
    ops.setText("rlbl", `Results: [${resultsSoFar.join(", ")}]`),
    ops.setText(status.id, `Answer for [${q.l},${q.r}] = ${curSum}`)
  ));
}

// ─── Final result ───
const finalResults = queries.map((q, i) => `[${q.l},${q.r}]=${results[i]}`).join(", ");

steps.push(annotatedStep(
  `All queries answered: ${finalResults}`,
  "explanation",
  {
    narration: `<span class="success">All queries processed!</span> Results: ${finalResults}. ` +
      'By sorting queries with Mo\'s ordering, we minimized pointer movement. ' +
      `Block size: sqrt(${n}) = ${blockSize}. ` +
      'Total time: <span class="highlight">O((n + q) * sqrt(n))</span>. ' +
      'This is much better than answering each query independently in O(n) each.',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText("rlbl", `Results: [${results.join(", ")}]`),
  ops.setText(status.id, `All done: ${finalResults}`)
));

const v = viz(
  {
    algorithm: "mos_algorithm",
    title: "Mo's Algorithm",
    description: "Answer offline range queries efficiently by sorting queries to minimize pointer movement.",
    category: "other",
    difficulty: "advanced",
    complexity: { time: "O((n+q)*sqrt(n))", space: "O(n)" },
    input: `Array: [${values.join(", ")}], ${queries.length} range queries`,
  },
  [arr, title, status, queryLabel, windowLabel, resultLabel, lPtr, rPtr, ...blockLabels],
  steps,
  { canvas: { height: 550 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
