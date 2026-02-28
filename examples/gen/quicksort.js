// Quicksort with Partition Visualization — educational step-by-step
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const arr = layout.array([6, 3, 8, 1, 7, 2, 5]);
const title = titleLabel("Quicksort");
const status = statusLabel("");
const iPtr = pointer("i", arr.id(0), "below", { id: "pi" });
const jPtr = pointer("j", arr.id(0), "above", { id: "pj" });
const pivotPtr = pointer("pivot", arr.id(0), "above", { id: "ppiv" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Initialize: Quicksort picks a pivot and partitions the array around it",
  "initialization",
  {
    narration: '<span class="highlight">Quicksort</span> is a divide-and-conquer algorithm. ' +
      'It picks a <span class="warn">pivot element</span>, then partitions the array so that ' +
      'all elements less than the pivot are on the left and all greater elements are on the right. ' +
      'Average time: <span class="highlight">O(n log n)</span>.',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${arr.values.join(", ")}]`)
));

// ─── Quicksort simulation (iterative on first partition for clarity) ───
// We will simulate the full quicksort on [6, 3, 8, 1, 7, 2, 5]
// using last element as pivot (Lomuto partition scheme)

function partition(lo, hi) {
  const pivotVal = arr.values[hi];
  const pivotId = arr.id(hi);

  steps.push(annotatedStep(
    `Partition [${lo}..${hi}]: choose pivot = ${pivotVal} (last element)`,
    "decision",
    {
      narration: `We partition indices <span class="highlight">${lo}..${hi}</span>. ` +
        `Using <span class="warn">Lomuto partition</span>: the pivot is the last element ` +
        `<span class="warn">${pivotVal}</span>. Pointer i starts before the partition (at ${lo - 1}), ` +
        `and j scans from ${lo} to ${hi - 1}.`,
      phase: "main-loop",
    },
    ops.highlight(pivotId, "$danger"),
    ops.movePointer("ppiv", pivotId),
    ops.setText(status.id, `Partitioning [${lo}..${hi}], pivot = ${pivotVal}`)
  ));

  let i = lo - 1;

  for (let j = lo; j < hi; j++) {
    const curVal = arr.values[j];
    const willSwap = curVal <= pivotVal;

    // Show j scanning
    steps.push(teach(
      `j=${j}: arr[${j}]=${curVal} vs pivot=${pivotVal}`,
      `Scanning: <span class="highlight">arr[${j}] = ${curVal}</span>. ` +
        (willSwap
          ? `${curVal} <= ${pivotVal}, so we increment i and <span class="warn">swap arr[${i + 1}] with arr[${j}]</span>.`
          : `${curVal} > ${pivotVal}, so we <span class="success">skip</span> — this element stays on the right side.`),
      ops.highlight(arr.id(j), "$warning"),
      ops.movePointer("pj", arr.id(j)),
      ...(i >= lo ? [ops.movePointer("pi", arr.id(i))] : []),
    ));

    if (willSwap) {
      i++;
      if (i !== j) {
        const valI = arr.values[i];
        steps.push(teach(
          `Swap arr[${i}]=${valI} and arr[${j}]=${curVal}`,
          `Swapping <span class="warn">${valI}</span> (index ${i}) with <span class="warn">${curVal}</span> (index ${j}). ` +
            `This moves ${curVal} into the "less than pivot" region.`,
          ops.swap(arr, i, j, "$danger"),
          ops.movePointer("pi", arr.id(i)),
        ));
      } else {
        steps.push(step(`i=${i}, j=${j}: same position, no swap needed`,
          ops.highlight(arr.id(i), "$primary"),
          ops.movePointer("pi", arr.id(i)),
        ));
      }
    }

    // Reset current j highlight
    steps.push(step(`Reset after checking index ${j}`,
      ops.reset(arr.ids.slice(lo, hi)),
      ops.highlight(arr.id(hi), "$danger"),
    ));
  }

  // Place pivot in its final position
  const pivotFinalPos = i + 1;
  if (pivotFinalPos !== hi) {
    const valAtFinal = arr.values[pivotFinalPos];
    steps.push(teach(
      `Place pivot: swap arr[${pivotFinalPos}]=${valAtFinal} with pivot arr[${hi}]=${arr.values[hi]}`,
      `The pivot <span class="warn">${arr.values[hi]}</span> goes to index ${pivotFinalPos}. ` +
        `Everything to the left is ≤ pivot, everything to the right is > pivot. ` +
        `This is the <span class="highlight">partition invariant</span>.`,
      ops.swap(arr, pivotFinalPos, hi, "$danger"),
    ));
  }

  steps.push(annotatedStep(
    `Pivot ${pivotVal} is now at its final sorted position (index ${pivotFinalPos})`,
    "invariant",
    {
      narration: `<span class="success">Partition complete!</span> The pivot <span class="success">${pivotVal}</span> ` +
        `is at index ${pivotFinalPos}. Left side: elements ≤ ${pivotVal}. Right side: elements > ${pivotVal}. ` +
        `The pivot is now in its <span class="success">final sorted position</span>.`,
      phase: "main-loop",
    },
    ops.markDone(arr.id(pivotFinalPos)),
    ops.reset(arr.ids.filter((_, idx) => idx !== pivotFinalPos)),
  ));

  return pivotFinalPos;
}

// Simulate quicksort with a stack (iterative)
const stack = [[0, arr.values.length - 1]];

while (stack.length > 0) {
  const [lo, hi] = stack.pop();
  if (lo >= hi) {
    // Single element or empty — mark as sorted if single element
    if (lo === hi) {
      steps.push(step(`Index ${lo} is a single element — already sorted`,
        ops.markDone(arr.id(lo)),
      ));
    }
    continue;
  }

  const p = partition(lo, hi);

  // Push sub-arrays (right first so left is processed first)
  if (p + 1 < hi) stack.push([p + 1, hi]);
  if (lo < p - 1) stack.push([lo, p - 1]);
  if (lo === p - 1) {
    steps.push(step(`Index ${lo} is a single element — already sorted`,
      ops.markDone(arr.id(lo)),
    ));
  }
  if (p + 1 === hi) {
    steps.push(step(`Index ${hi} is a single element — already sorted`,
      ops.markDone(arr.id(hi)),
    ));
  }
}

// ─── Cleanup ───
steps.push(annotatedStep(
  "Array is fully sorted!",
  "explanation",
  {
    narration: `<span class="success">Quicksort complete!</span> Final array: [${arr.values.join(", ")}]. ` +
      `Time complexity: <span class="highlight">O(n log n)</span> average, O(n²) worst case. ` +
      `Space: <span class="highlight">O(log n)</span> for the recursion stack. ` +
      `Quicksort is often the fastest general-purpose sort in practice.`,
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Sorted: [${arr.values.join(", ")}]`)
));

const v = viz(
  {
    algorithm: "quicksort",
    title: "Quicksort — Lomuto Partition",
    description: "Step-by-step quicksort with Lomuto partition scheme, showing pivot selection, pointer scanning, and partition invariant.",
    category: "sorting",
    difficulty: "intermediate",
    complexity: { time: "O(n log n)", space: "O(log n)" },
    input: "Array: [6, 3, 8, 1, 7, 2, 5]",
  },
  [arr, title, status, iPtr, jPtr, pivotPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
