// Interpolation Search — educational visualization with teach() and annotatedStep()
// Smart probe placement based on value distribution
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const inputValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const target = 70;
const n = inputValues.length;

// ─── Layout ───
const arr = layout.array(inputValues, { y: 250, prefix: "c", cellWidth: 60 });
const title = titleLabel("Interpolation Search");
const status = statusLabel("");
const formulaLabel = label("", 500, 170, { fontSize: 14, fontWeight: "bold", fill: "$primary", id: "formula" });
const loPtr = pointer("lo", arr.id(0), "below", { id: "plo" });
const hiPtr = pointer("hi", arr.id(n - 1), "below", { id: "phi" });
const probePtr = pointer("probe", arr.id(0), "above", { id: "pprobe" });

const steps = [];

// ─── Introduction ───
steps.push(annotatedStep(
  "Introduction: Interpolation Search guesses where the target is",
  "initialization",
  {
    narration: '<span class="highlight">Interpolation Search</span> is like looking up a name in a phone book. ' +
      'If you are looking for "Smith", you don\'t open to the middle — you open near the end, ' +
      'because S is near the end of the alphabet. Similarly, this algorithm ' +
      '<span class="warn">estimates where the target should be</span> based on the values at the boundaries. ' +
      'It works best on <span class="success">uniformly distributed</span> data like our array [10, 20, 30, ..., 100].',
    phase: "setup",
  },
  ops.setText(status.id, `Searching for ${target} in [${inputValues.join(", ")}]`)
));

steps.push(teach(
  "The interpolation formula",
  'Binary search always picks the <span class="warn">middle</span>. Interpolation search is smarter: ' +
    'it uses this formula: <span class="highlight">probe = lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) * (hi - lo)</span>. ' +
    'This estimates where the target would be if values are evenly spaced. ' +
    'On uniform data, it finds the answer in <span class="success">O(log log n)</span> time — ' +
    'much faster than binary search\'s O(log n)!',
  ops.highlight(arr.ids, "$primary")
));

steps.push(step("Reset highlights",
  ops.reset(arr.ids)
));

// ─── Search loop ───
let lo = 0;
let hi = n - 1;
let iteration = 0;
let found = false;
let foundIdx = -1;

steps.push(annotatedStep(
  `Initialize: lo = 0, hi = ${hi}`,
  "invariant",
  {
    narration: `We start with <span class="highlight">lo = 0</span> (value ${inputValues[0]}) and ` +
      `<span class="highlight">hi = ${hi}</span> (value ${inputValues[hi]}). ` +
      `The target ${target} must be somewhere between these bounds.`,
    phase: "main-loop",
  },
  ops.highlight(arr.id(lo), "$primary"),
  ops.highlight(arr.id(hi), "$primary"),
  ops.movePointer("plo", arr.id(lo)),
  ops.movePointer("phi", arr.id(hi)),
  ops.setText(status.id, `lo = ${lo} (${inputValues[lo]}), hi = ${hi} (${inputValues[hi]})`)
));

steps.push(step("Reset boundary highlights",
  ops.reset([arr.id(lo), arr.id(hi)])
));

while (lo <= hi && target >= inputValues[lo] && target <= inputValues[hi]) {
  iteration++;

  const loVal = inputValues[lo];
  const hiVal = inputValues[hi];
  const fraction = (target - loVal) / (hiVal - loVal);
  const probe = lo + Math.floor(fraction * (hi - lo));

  // Show the formula calculation
  steps.push(teach(
    `Iteration ${iteration}: Calculate probe position`,
    `<span class="highlight">Formula</span>: probe = ${lo} + ((${target} - ${loVal}) / (${hiVal} - ${loVal})) * (${hi} - ${lo}) ` +
      `= ${lo} + (${target - loVal} / ${hiVal - loVal}) * ${hi - lo} ` +
      `= ${lo} + ${(fraction * (hi - lo)).toFixed(1)} = <span class="success">${probe}</span>. ` +
      `The formula predicts the target is at index ${probe}.`,
    ops.setText("formula", `probe = ${lo} + ((${target}-${loVal})/(${hiVal}-${loVal}))*(${hi}-${lo}) = ${probe}`),
    ops.highlight(arr.id(lo), "$primary"),
    ops.highlight(arr.id(hi), "$primary"),
    ops.movePointer("plo", arr.id(lo)),
    ops.movePointer("phi", arr.id(hi)),
    ops.setText(status.id, `Calculating probe: lo=${lo}, hi=${hi}, probe=${probe}`)
  ));

  // Move probe pointer and check
  const probeVal = inputValues[probe];

  if (probeVal === target) {
    steps.push(teach(
      `arr[${probe}] = ${probeVal} === ${target}: Found it!`,
      `We check arr[${probe}] = <span class="success">${probeVal}</span>. ` +
        `That matches our target ${target}! <span class="success">Found it in just ${iteration} step${iteration > 1 ? "s" : ""}!</span> ` +
        `The interpolation formula guessed the exact position because the data is uniformly distributed.`,
      ops.highlight(arr.id(probe), "$success"),
      ops.movePointer("pprobe", arr.id(probe)),
      ops.setText(status.id, `Found ${target} at index ${probe}!`)
    ));
    found = true;
    foundIdx = probe;
    break;
  } else if (probeVal < target) {
    steps.push(teach(
      `arr[${probe}] = ${probeVal} < ${target}: search right half`,
      `arr[${probe}] = <span class="warn">${probeVal}</span>, which is less than ${target}. ` +
        `The target must be to the <span class="highlight">right</span>. ` +
        `We move lo to ${probe + 1}.`,
      ops.highlight(arr.id(probe), "$warning"),
      ops.movePointer("pprobe", arr.id(probe)),
      ops.setText(status.id, `arr[${probe}] = ${probeVal} < ${target} → move lo to ${probe + 1}`)
    ));

    // Mark the eliminated region
    const eliminatedIds = [];
    for (let k = lo; k <= probe; k++) {
      eliminatedIds.push(arr.id(k));
    }
    steps.push(step(`Eliminate indices ${lo}..${probe}`,
      ops.highlight(eliminatedIds, "$muted")
    ));

    lo = probe + 1;

    if (lo <= hi) {
      steps.push(step(`Update lo = ${lo}`,
        ops.movePointer("plo", arr.id(lo)),
        ops.reset(arr.ids)
      ));
    }
  } else {
    steps.push(teach(
      `arr[${probe}] = ${probeVal} > ${target}: search left half`,
      `arr[${probe}] = <span class="warn">${probeVal}</span>, which is greater than ${target}. ` +
        `The target must be to the <span class="highlight">left</span>. ` +
        `We move hi to ${probe - 1}.`,
      ops.highlight(arr.id(probe), "$warning"),
      ops.movePointer("pprobe", arr.id(probe)),
      ops.setText(status.id, `arr[${probe}] = ${probeVal} > ${target} → move hi to ${probe - 1}`)
    ));

    // Mark the eliminated region
    const eliminatedIds = [];
    for (let k = probe; k <= hi; k++) {
      eliminatedIds.push(arr.id(k));
    }
    steps.push(step(`Eliminate indices ${probe}..${hi}`,
      ops.highlight(eliminatedIds, "$muted")
    ));

    hi = probe - 1;

    if (lo <= hi) {
      steps.push(step(`Update hi = ${hi}`,
        ops.movePointer("phi", arr.id(hi)),
        ops.reset(arr.ids)
      ));
    }
  }
}

// ─── Final ───
steps.push(annotatedStep(
  found ? `Target ${target} found at index ${foundIdx}!` : `Target ${target} not found`,
  "explanation",
  {
    narration: found
      ? `<span class="success">Search complete!</span> Found <span class="highlight">${target}</span> at index ${foundIdx} ` +
        `in just <span class="success">${iteration} iteration${iteration > 1 ? "s" : ""}</span>. ` +
        'On uniformly distributed data like [10, 20, 30, ...], interpolation search is incredibly efficient. ' +
        'It runs in <span class="highlight">O(log log n)</span> on uniform data, compared to O(log n) for binary search. ' +
        `For ${n} elements: log(${n}) ≈ ${Math.ceil(Math.log2(n))}, but log(log(${n})) ≈ ${Math.ceil(Math.log2(Math.log2(n)))} — a big improvement!`
      : `Target ${target} was not found in the array.`,
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, found
    ? `Found ${target} at index ${foundIdx} in ${iteration} step${iteration > 1 ? "s" : ""} — O(log log n)!`
    : `${target} not in array`),
  ops.setText("formula", found
    ? `Result: ${target} at index ${foundIdx} — ${iteration} probe${iteration > 1 ? "s" : ""}`
    : "Not found")
));

const v = viz(
  {
    algorithm: "interpolation_search",
    title: "Interpolation Search",
    description: "Smart search that estimates the target position using the interpolation formula. Runs in O(log log n) on uniform data.",
    category: "searching",
    difficulty: "intermediate",
    complexity: { time: "O(log log n)", space: "O(1)" },
    input: `Array: [${inputValues.join(", ")}], Target: ${target}`,
  },
  [arr, title, status, formulaLabel, loPtr, hiPtr, probePtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
