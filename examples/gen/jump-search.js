// Jump Search — educational visualization with teach() and annotatedStep()
// Two-phase search: jump in blocks, then linear scan
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const inputValues = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const target = 55;
const n = inputValues.length;
const blockSize = Math.floor(Math.sqrt(n)); // sqrt(12) = 3

// ─── Layout ───
const arr = layout.array(inputValues, { y: 250, prefix: "c", cellWidth: 55 });
const title = titleLabel("Jump Search");
const status = statusLabel("");
const infoLabel = label(`Target: ${target} | Block size: ${blockSize}`, 500, 170, {
  fontSize: 16, fontWeight: "bold", fill: "$text", id: "info"
});
const jumpPtr = pointer("jump", arr.id(0), "above", { id: "pjump" });

const steps = [];

// ─── Introduction ───
steps.push(annotatedStep(
  "Introduction: Jump Search uses two phases to find a value",
  "initialization",
  {
    narration: '<span class="highlight">Jump Search</span> works on sorted arrays. ' +
      'Instead of checking every element (linear search) or splitting in half (binary search), ' +
      'it <span class="warn">jumps ahead in fixed-size blocks</span>. ' +
      `Our array has ${n} elements, so we use a block size of sqrt(${n}) = <span class="highlight">${blockSize}</span>. ` +
      'Phase 1: Jump by blocks until we overshoot. Phase 2: Go back and search within the block.',
    phase: "setup",
  },
  ops.setText(status.id, `Searching for ${target} in [${inputValues.join(", ")}] | Block size = ${blockSize}`)
));

steps.push(teach(
  "Why use block size = sqrt(n)?",
  `If we jump in blocks of size <span class="highlight">b</span>, we make at most <span class="warn">n/b jumps</span> in phase 1, ` +
    `then check at most <span class="warn">b elements</span> in phase 2. Total work: n/b + b. ` +
    `This is minimized when b = sqrt(n). For ${n} elements, sqrt(${n}) ≈ ${blockSize}. ` +
    `So we check at most ${Math.ceil(n / blockSize)} + ${blockSize} = ${Math.ceil(n / blockSize) + blockSize} elements instead of all ${n}!`,
  ops.highlight(arr.ids, "$primary")
));

steps.push(step("Reset highlights",
  ops.reset(arr.ids)
));

// ─── Phase 1: Jump in blocks ───
steps.push(annotatedStep(
  "Phase 1: Jump forward in blocks of 3",
  "invariant",
  {
    narration: '<span class="highlight">Phase 1</span>: We jump forward by ' + blockSize + ' positions each time. ' +
      'At each landing spot, we check: is the value here >= our target (' + target + ')? ' +
      'If yes, our target must be in the block we just jumped over. If no, keep jumping!',
    phase: "main-loop",
  },
  ops.setText(status.id, "Phase 1: Jumping in blocks of " + blockSize),
  ops.movePointer("pjump", arr.id(0))
));

let prev = 0;
let curr = blockSize;
let found = false;

// Jump phase
while (curr < n && inputValues[curr] < target) {
  // Show the jump
  steps.push(teach(
    `Jump to index ${curr}: arr[${curr}] = ${inputValues[curr]}`,
    `Jump to index <span class="highlight">${curr}</span>: value is <span class="warn">${inputValues[curr]}</span>. ` +
      `Is ${inputValues[curr]} >= ${target}? <span class="warn">No</span> (${inputValues[curr]} < ${target}), so we keep jumping.`,
    ops.highlight(arr.id(curr), "$warning"),
    ops.movePointer("pjump", arr.id(curr)),
    ops.setText(status.id, `arr[${curr}] = ${inputValues[curr]} < ${target} → keep jumping`)
  ));

  // Highlight the skipped block
  const blockIds = [];
  for (let k = prev; k < curr; k++) {
    blockIds.push(arr.id(k));
  }
  steps.push(step(`Block [${prev}..${curr - 1}] skipped — all values too small`,
    ops.highlight(blockIds, "$muted"),
    ops.reset(arr.id(curr))
  ));

  prev = curr;
  curr += blockSize;
}

// Clamp curr to last index
if (curr >= n) {
  curr = n - 1;
}

// Check landing spot
if (inputValues[curr] >= target) {
  steps.push(teach(
    `Jump to index ${curr}: arr[${curr}] = ${inputValues[curr]} >= ${target}`,
    `Jump to index <span class="highlight">${curr}</span>: value is <span class="success">${inputValues[curr]}</span>. ` +
      `Is ${inputValues[curr]} >= ${target}? <span class="success">Yes!</span> ` +
      `Our target must be somewhere in the block from index ${prev} to ${curr}.`,
    ops.highlight(arr.id(curr), "$success"),
    ops.movePointer("pjump", arr.id(curr)),
    ops.setText(status.id, `arr[${curr}] = ${inputValues[curr]} >= ${target} → target is in block [${prev}..${curr}]`)
  ));
} else {
  steps.push(teach(
    `Reached end: arr[${curr}] = ${inputValues[curr]}`,
    `We reached the end of the array. The target must be in the last block from index ${prev} to ${curr}.`,
    ops.highlight(arr.id(curr), "$warning"),
    ops.movePointer("pjump", arr.id(curr)),
    ops.setText(status.id, `Reached end — search block [${prev}..${curr}]`)
  ));
}

// Reset all highlights before phase 2
steps.push(step("Reset for Phase 2",
  ops.reset(arr.ids)
));

// ─── Phase 2: Linear scan within the block ───
steps.push(annotatedStep(
  `Phase 2: Linear scan from index ${prev} to ${curr}`,
  "invariant",
  {
    narration: `<span class="highlight">Phase 2</span>: Now we do a simple left-to-right scan ` +
      `from index ${prev} to index ${curr}. This block has at most ${blockSize + 1} elements, ` +
      'so it is fast. We check each one until we find our target or pass it.',
    phase: "main-loop",
  },
  ops.setText(status.id, `Phase 2: Linear scan in block [${prev}..${curr}]`),
  ops.movePointer("pjump", arr.id(prev))
));

// Highlight the search block
const searchBlockIds = [];
for (let k = prev; k <= curr; k++) {
  searchBlockIds.push(arr.id(k));
}
steps.push(step("Highlight search block",
  ops.highlight(searchBlockIds, "$primary")
));

for (let i = prev; i <= curr; i++) {
  if (inputValues[i] === target) {
    // Found!
    steps.push(teach(
      `arr[${i}] = ${inputValues[i]} === ${target}: Found it!`,
      `<span class="success">Found it!</span> arr[${i}] = <span class="success">${target}</span>. ` +
        `The target ${target} is at index ${i}.`,
      ops.highlight(arr.id(i), "$success"),
      ops.movePointer("pjump", arr.id(i)),
      ops.setText(status.id, `Found ${target} at index ${i}!`)
    ));
    found = true;
    break;
  } else {
    steps.push(teach(
      `arr[${i}] = ${inputValues[i]} !== ${target}: keep scanning`,
      `arr[${i}] = <span class="warn">${inputValues[i]}</span>. ` +
        `Is it ${target}? <span class="warn">No</span>. Move to the next element.`,
      ops.highlight(arr.id(i), "$warning"),
      ops.movePointer("pjump", arr.id(i)),
      ops.setText(status.id, `arr[${i}] = ${inputValues[i]} ≠ ${target} → next`)
    ));

    steps.push(step(`Reset arr[${i}]`,
      ops.reset(arr.id(i))
    ));
  }
}

// ─── Final ───
steps.push(annotatedStep(
  found ? `Target ${target} found at index 10!` : `Target ${target} not found`,
  "explanation",
  {
    narration: found
      ? `<span class="success">Search complete!</span> We found <span class="highlight">${target}</span> at index 10. ` +
        `Phase 1 (jumping) checked ${Math.ceil((n - prev) / blockSize)} positions. ` +
        `Phase 2 (linear scan) checked a few more. ` +
        `Total comparisons: much fewer than the ${n} a linear search would need. ` +
        'Time complexity: <span class="highlight">O(sqrt(n))</span> — a nice middle ground between O(n) and O(log n).'
      : `Target ${target} was not found in the array.`,
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, found ? `Found ${target} at index 10 — O(√n) time!` : `${target} not in array`),
  ops.setText("info", `Target: ${target} | Block size: ${blockSize} | Result: ${found ? "Found at index 10" : "Not found"}`)
));

const v = viz(
  {
    algorithm: "jump_search",
    title: "Jump Search",
    description: "Two-phase search on sorted arrays: jump in blocks of sqrt(n), then linear scan within the landing block.",
    category: "searching",
    difficulty: "beginner",
    complexity: { time: "O(sqrt(n))", space: "O(1)" },
    input: `Array: [${inputValues.join(", ")}], Target: ${target}`,
  },
  [arr, title, status, infoLabel, jumpPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
