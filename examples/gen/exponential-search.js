// Exponential Search — doubling phase + binary search
// Find the range by doubling, then binary search within that range
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [1, 2, 3, 4, 5, 10, 20, 40, 80, 100, 200, 500];
const target = 40;

const arr = layout.array(values, { y: 250, cellWidth: 55, gap: 4 });

const title = titleLabel("Exponential Search");
const status = statusLabel("");

const boundPtr = pointer("bound", arr.id(0), "below", { id: "pbound" });
const midPtr = pointer("mid", arr.id(0), "above", { id: "pmid" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Exponential search for target ${target} in a sorted array`,
  "initialization",
  {
    narration: '<span class="highlight">Exponential Search</span> works in two phases: ' +
      '<span class="warn">Phase 1</span> — double the index (1, 2, 4, 8, ...) until we overshoot the target or reach the end. ' +
      '<span class="warn">Phase 2</span> — binary search within the identified range. ' +
      'This is efficient when the target is near the beginning: <span class="highlight">O(log i)</span> where i is the target position.',
    phase: "setup",
  },
  ops.setText(status.id, `Sorted array: [${values.join(", ")}], target: ${target}`)
));

// ─── Phase 1: Doubling ───
steps.push(teach(
  "Phase 1: Double the index to find the range containing the target",
  '<span class="warn">Doubling phase</span>: start at index 1, and keep doubling. ' +
    'At each step, if arr[bound] < target, double the bound. ' +
    'When arr[bound] >= target (or we hit the end), we know the target is between bound/2 and bound.',
  ops.movePointer("pbound", arr.id(1)),
  ops.highlight(arr.id(1), "$warning"),
  ops.setText(status.id, "Phase 1: Doubling — start at index 1")
));

// Check index 0 first
steps.push(step(`Check arr[0] = ${values[0]} vs target ${target}`,
  ops.highlight(arr.id(0), "$primary"),
  ops.setText(status.id, `arr[0] = ${values[0]} !== ${target}, proceed to doubling`)
));

steps.push(step("Reset index 0",
  ops.reset(arr.id(0))
));

let bound = 1;
while (bound < values.length && values[bound] < target) {
  steps.push(teach(
    `bound=${bound}: arr[${bound}]=${values[bound]} < ${target}, double to ${bound * 2}`,
    `At index <span class="highlight">${bound}</span>, arr[${bound}] = <span class="warn">${values[bound]}</span>. ` +
      `Since ${values[bound]} < ${target}, we haven't gone far enough. ` +
      `<span class="warn">Double the bound</span>: ${bound} * 2 = ${bound * 2}.`,
    ops.movePointer("pbound", arr.id(bound)),
    ops.highlight(arr.id(bound), "$muted"),
    ops.setText(status.id, `bound=${bound}, arr[${bound}]=${values[bound]} < ${target}, doubling...`)
  ));

  bound *= 2;
}

const rangeEnd = Math.min(bound, values.length - 1);
const rangeStart = Math.floor(bound / 2);

if (bound < values.length) {
  steps.push(teach(
    `bound=${bound}: arr[${bound}]=${values[bound]} >= ${target}. Range found: [${rangeStart}..${rangeEnd}]`,
    `At index <span class="highlight">${bound}</span>, arr[${bound}] = <span class="success">${values[bound]}</span> >= ${target}. ` +
      `The target must be in range [<span class="warn">${rangeStart}</span>..<span class="warn">${rangeEnd}</span>]. ` +
      `Now switch to <span class="highlight">binary search</span> in this range!`,
    ops.movePointer("pbound", arr.id(bound)),
    ops.highlight(arr.id(bound), "$primary"),
    ops.reset(arr.ids.slice(0, rangeStart)),
    ops.setText(status.id, `Range found: [${rangeStart}..${rangeEnd}]. Binary search next.`)
  ));
} else {
  steps.push(teach(
    `bound=${bound} exceeds array. Range: [${rangeStart}..${rangeEnd}]`,
    `Bound ${bound} exceeded the array. ` +
      `Search range: [<span class="warn">${rangeStart}</span>..<span class="warn">${rangeEnd}</span>].`,
    ops.setText(status.id, `Range: [${rangeStart}..${rangeEnd}]. Binary search next.`)
  ));
}

// ─── Phase 2: Binary search ───
steps.push(teach(
  `Phase 2: Binary search in range [${rangeStart}..${rangeEnd}]`,
  '<span class="warn">Binary search phase</span>: search for the target within the identified range. ' +
    'This is standard binary search — check the middle, go left or right.',
  ops.reset(arr.ids),
  ops.highlight(arr.ids.slice(rangeStart, rangeEnd + 1), "$primary"),
  ops.setText(status.id, `Binary search in [${rangeStart}..${rangeEnd}]`)
));

let lo = rangeStart;
let hi = rangeEnd;
let foundAt = -1;

while (lo <= hi) {
  const m = Math.floor((lo + hi) / 2);

  steps.push(step(`mid = (${lo} + ${hi}) / 2 = ${m}, arr[${m}] = ${values[m]}`,
    ops.reset(arr.ids),
    ops.highlight(arr.ids.slice(lo, hi + 1), "$primary"),
    ops.highlight(arr.id(m), "$warning"),
    ops.movePointer("pmid", arr.id(m)),
    ops.setText(status.id, `mid=${m}, arr[${m}]=${values[m]} vs target ${target}`)
  ));

  if (values[m] === target) {
    foundAt = m;
    steps.push(teach(
      `arr[${m}] = ${target} — found it!`,
      `<span class="success">Found!</span> arr[${m}] = ${target}. ` +
        `The target is at index <span class="success">${m}</span>.`,
      ops.highlight(arr.id(m), "$success"),
      ops.setText(status.id, `Found ${target} at index ${m}!`)
    ));
    break;
  } else if (values[m] < target) {
    steps.push(step(`arr[${m}]=${values[m]} < ${target}, search right half`,
      ops.highlight(arr.ids.slice(lo, m + 1), "$muted"),
      ops.setText(status.id, `${values[m]} < ${target}, move lo to ${m + 1}`)
    ));
    lo = m + 1;
  } else {
    steps.push(step(`arr[${m}]=${values[m]} > ${target}, search left half`,
      ops.highlight(arr.ids.slice(m, hi + 1), "$muted"),
      ops.setText(status.id, `${values[m]} > ${target}, move hi to ${m - 1}`)
    ));
    hi = m - 1;
  }
}

// ─── Result ───
steps.push(annotatedStep(
  foundAt >= 0
    ? `Target ${target} found at index ${foundAt}!`
    : `Target ${target} not found in the array.`,
  "explanation",
  {
    narration: foundAt >= 0
      ? `<span class="success">Found ${target} at index ${foundAt}!</span> ` +
        'Exponential search first narrows the range by doubling (Phase 1), ' +
        'then uses binary search within that range (Phase 2). ' +
        'Time: <span class="highlight">O(log i)</span> where i is the position of the target. ' +
        'This is better than pure binary search when the target is near the start.'
      : `<span class="danger">Not found.</span>`,
    phase: "cleanup",
  },
  ...(foundAt >= 0
    ? [ops.markDone(arr.id(foundAt))]
    : [ops.setText(status.id, "Not found")]),
  ops.setText(status.id, foundAt >= 0 ? `Result: ${target} at index ${foundAt}` : "Not found")
));

const v = viz(
  {
    algorithm: "exponential_search",
    title: "Exponential Search",
    description: "Find a target in a sorted array by doubling the search index, then binary searching within the found range.",
    category: "searching",
    difficulty: "intermediate",
    complexity: { time: "O(log i)", space: "O(1)" },
    input: `Array: [${values.join(", ")}], target: ${target}`,
  },
  [arr, title, status, boundPtr, midPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
