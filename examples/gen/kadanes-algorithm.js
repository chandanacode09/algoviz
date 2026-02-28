// Kadane's Algorithm — find the maximum subarray sum
// Educational visualization with teach() and annotatedStep()
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const arr = layout.array(values);
const title = titleLabel("Kadane's Algorithm");
const status = statusLabel("");

// Labels to show currentSum and maxSum
const curSumLabel = label("currentSum: 0", 200, 470, { id: "lcur", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$primary" });
const maxSumLabel = label("maxSum: -Infinity", 600, 470, { id: "lmax", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$success" });

// Pointer to track current index
const iPtr = pointer("i", arr.id(0), "above", { id: "pi" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Kadane's Algorithm finds the subarray with the largest sum",
  "initialization",
  {
    narration: '<span class="highlight">Kadane\'s Algorithm</span> finds the contiguous subarray with the ' +
      '<span class="success">maximum sum</span>. The key idea: at each element, we decide — ' +
      'should we <span class="warn">extend</span> the current subarray, or <span class="warn">start fresh</span> from here? ' +
      'We keep two numbers: <span class="highlight">currentSum</span> (best ending here) and ' +
      '<span class="success">maxSum</span> (best we have ever seen).',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${values.join(", ")}]`)
));

// ─── Main loop ───
let currentSum = 0;
let maxSum = -Infinity;
let subarrayStart = 0;
let bestStart = 0;
let bestEnd = 0;

for (let i = 0; i < values.length; i++) {
  const val = values[i];
  const extendSum = currentSum + val;
  const restartSum = val;
  const willRestart = restartSum > extendSum;

  // Step 1: Highlight current element and show the decision
  steps.push(teach(
    `Look at arr[${i}] = ${val}. Extend (${currentSum} + ${val} = ${extendSum}) or restart (${val})?`,
    `At index <span class="highlight">${i}</span>, value = <span class="highlight">${val}</span>. ` +
      `We can <span class="warn">extend</span> the current subarray: ${currentSum} + (${val}) = <span class="warn">${extendSum}</span>. ` +
      `Or we can <span class="warn">start fresh</span> from this element: <span class="warn">${restartSum}</span>. ` +
      (willRestart
        ? `Starting fresh (${restartSum}) is better than extending (${extendSum}), so we <span class="warn">restart here</span>.`
        : `Extending (${extendSum}) is better than or equal to starting fresh (${restartSum}), so we <span class="success">keep going</span>.`),
    ops.movePointer("pi", arr.id(i)),
    ops.highlight(arr.id(i), "$warning"),
    ops.setText(status.id, `Index ${i}: extend=${extendSum}, restart=${restartSum}`)
  ));

  // Make the decision
  if (willRestart) {
    currentSum = restartSum;
    subarrayStart = i;
  } else {
    currentSum = extendSum;
  }

  // Step 2: Highlight current subarray range and update sums
  const subarrayIds = [];
  for (let k = subarrayStart; k <= i; k++) {
    subarrayIds.push(arr.id(k));
  }

  const oldMaxSum = maxSum;
  if (currentSum > maxSum) {
    maxSum = currentSum;
    bestStart = subarrayStart;
    bestEnd = i;
  }

  const isNewMax = currentSum > oldMaxSum;

  if (isNewMax) {
    steps.push(annotatedStep(
      `currentSum = ${currentSum}, new maxSum = ${maxSum}!`,
      "invariant",
      {
        narration: `<span class="success">New best found!</span> currentSum = <span class="highlight">${currentSum}</span>. ` +
          `This beats our old maxSum of <span class="warn">${oldMaxSum === -Infinity ? "-Infinity" : oldMaxSum}</span>. ` +
          `Update maxSum to <span class="success">${maxSum}</span>. ` +
          '<span class="highlight">Key invariant</span>: maxSum is always the best we have seen so far.',
        phase: "main-loop",
      },
      ops.reset(arr.ids),
      ops.highlight(subarrayIds, "$primary"),
      ops.highlight(arr.id(i), "$success"),
      ops.setText("lcur", `currentSum: ${currentSum}`),
      ops.setText("lmax", `maxSum: ${maxSum}`),
      ops.setText(status.id, `Best subarray: indices [${subarrayStart}..${i}], sum = ${maxSum}`)
    ));
  } else {
    steps.push(step(`currentSum = ${currentSum}, maxSum stays ${maxSum}`,
      ops.reset(arr.ids),
      ops.highlight(subarrayIds, "$primary"),
      ops.setText("lcur", `currentSum: ${currentSum}`),
      ops.setText("lmax", `maxSum: ${maxSum}`),
      ops.setText(status.id, `Subarray [${subarrayStart}..${i}], sum = ${currentSum}. Best so far: ${maxSum}`)
    ));
  }
}

// ─── Cleanup ───
const bestIds = [];
for (let k = bestStart; k <= bestEnd; k++) {
  bestIds.push(arr.id(k));
}

steps.push(annotatedStep(
  `Done! Maximum subarray sum = ${maxSum}, from index ${bestStart} to ${bestEnd}`,
  "explanation",
  {
    narration: `<span class="success">Algorithm complete!</span> The maximum subarray sum is ` +
      `<span class="success">${maxSum}</span>, found at indices [${bestStart}..${bestEnd}] = ` +
      `[${values.slice(bestStart, bestEnd + 1).join(", ")}]. ` +
      'Kadane\'s runs in <span class="highlight">O(n)</span> time with <span class="highlight">O(1)</span> space — ' +
      'just one pass through the array!',
    phase: "cleanup",
  },
  ops.reset(arr.ids),
  ops.markDone(bestIds),
  ops.setText(status.id, `Maximum subarray: [${values.slice(bestStart, bestEnd + 1).join(", ")}] = ${maxSum}`)
));

const v = viz(
  {
    algorithm: "kadanes_algorithm",
    title: "Kadane's Algorithm — Maximum Subarray",
    description: "Find the contiguous subarray with the largest sum using Kadane's extend-or-restart strategy.",
    category: "dynamic-programming",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: `Array: [${values.join(", ")}]`,
  },
  [arr, title, status, curSumLabel, maxSumLabel, iPtr],
  steps,
  { canvas: { height: 520 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
