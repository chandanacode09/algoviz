// Educational Bubble Sort — uses teach() and annotatedStep() for rich narration
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("../../dist/src/index");

resetIds();

const arr = layout.array([5, 3, 8, 1, 4]);
const title = titleLabel("Bubble Sort");
const status = statusLabel("");
const iPtr = pointer("i", arr.id(0), "below", { id: "pi" });
const jPtr = pointer("j", arr.id(0), "above", { id: "pj" });

const steps = [];
const n = arr.values.length;

// ─── Setup phase ───
steps.push(annotatedStep(
  "Initialize: we'll make n-1 passes over the array",
  "initialization",
  {
    narration: '<span class="highlight">Bubble Sort</span> works by repeatedly stepping through the list, ' +
      'comparing adjacent elements and swapping them if they\'re in the wrong order. ' +
      'We need <span class="warn">n-1 = 4 passes</span> to guarantee the array is sorted.',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${arr.values.join(", ")}] — ${n - 1} passes needed`)
));

// ─── Main loop ───
for (let i = 0; i < n - 1; i++) {
  const passNum = i + 1;
  const lastUnsorted = n - 1 - i;

  steps.push(annotatedStep(
    `Pass ${passNum}: bubble the largest unsorted element to position ${lastUnsorted}`,
    "invariant",
    {
      narration: `<span class="highlight">Pass ${passNum}</span>: After this pass, ` +
        `the <span class="success">${passNum === 1 ? "largest" : `${passNum} largest`} element${passNum > 1 ? "s" : ""}</span> ` +
        `will be in ${passNum === 1 ? "its" : "their"} final position${passNum > 1 ? "s" : ""}. ` +
        `<span class="warn">Invariant</span>: elements after index ${lastUnsorted} are already sorted.`,
      phase: "main-loop",
    },
    ops.setText(status.id, `Pass ${passNum}: comparing indices 0..${lastUnsorted}`)
  ));

  for (let j = 0; j < lastUnsorted; j++) {
    const a = arr.values[j];
    const b = arr.values[j + 1];
    const willSwap = a > b;

    steps.push(teach(
      `Compare arr[${j}]=${a} and arr[${j + 1}]=${b}`,
      `Comparing <span class="highlight">${a}</span> and <span class="highlight">${b}</span>: ` +
        (willSwap
          ? `${a} > ${b}, so we <span class="warn">swap</span> them.`
          : `${a} ≤ ${b}, already in order — <span class="success">no swap needed</span>.`),
      ops.highlight([arr.id(j), arr.id(j + 1)], "$warning"),
      ops.movePointer("pj", arr.id(j)),
    ));

    if (willSwap) {
      steps.push(teach(
        `Swap ${a} and ${b}`,
        `Swapping <span class="warn">${a}</span> ↔ <span class="warn">${b}</span>. ` +
          `The larger value (${a}) "bubbles" one position toward the end.`,
        ops.swap(arr, j, j + 1, "$danger"),
      ));
    } else {
      steps.push(step(`No swap needed`,
        ops.reset([arr.id(j), arr.id(j + 1)])
      ));
    }
  }

  // Mark the element that's now in its final position
  steps.push(annotatedStep(
    `Pass ${passNum} complete: ${arr.values[lastUnsorted]} is in its final position`,
    "boundary",
    {
      narration: `<span class="success">Pass ${passNum} done!</span> The value ` +
        `<span class="success">${arr.values[lastUnsorted]}</span> at index ${lastUnsorted} ` +
        `is now in its correct sorted position. ` +
        `<span class="highlight">Boundary</span>: indices ${lastUnsorted}..${n - 1} are finalized.`,
      phase: "main-loop",
    },
    ops.markDone(arr.id(lastUnsorted)),
    ops.reset(arr.ids.filter((_, idx) => idx < lastUnsorted))
  ));
}

// ─── Cleanup ───
steps.push(annotatedStep(
  "Array fully sorted!",
  "explanation",
  {
    narration: `<span class="success">Sorting complete!</span> Final array: ` +
      `[${arr.values.join(", ")}]. Bubble Sort made <span class="warn">${n - 1} passes</span>. ` +
      `Time complexity: <span class="highlight">O(n²)</span> worst/average case. ` +
      `Space: <span class="highlight">O(1)</span> — only swaps in-place.`,
    phase: "cleanup",
  },
  ops.markDone(arr.id(0)),
  ops.setText(status.id, `Sorted: [${arr.values.join(", ")}]`)
));

const v = viz(
  {
    algorithm: "bubble_sort",
    title: "Bubble Sort — Educational",
    description: "Step-by-step bubble sort with invariant explanations, boundary tracking, and rich narration.",
    category: "sorting",
    difficulty: "beginner",
    complexity: { time: "O(n²)", space: "O(1)" },
    input: "Array: [5, 3, 8, 1, 4]",
  },
  [arr, title, status, iPtr, jPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
