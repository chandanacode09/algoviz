// Shell Sort — educational visualization with teach() and annotatedStep()
// Diminishing gap insertion sort
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const inputValues = [12, 34, 54, 2, 3, 8, 11, 95];

// ─── Layout ───
const arr = layout.array(inputValues, { y: 250, prefix: "c" });
const title = titleLabel("Shell Sort");
const status = statusLabel("");
const gapLabel = label("", 500, 170, { fontSize: 18, fontWeight: "bold", fill: "$primary", id: "gaplbl" });
const iPtr = pointer("i", arr.id(0), "below", { id: "pi" });
const jPtr = pointer("j", arr.id(0), "above", { id: "pj" });

const steps = [];

// ─── Introduction ───
steps.push(annotatedStep(
  "Introduction: Shell Sort improves on Insertion Sort",
  "initialization",
  {
    narration: '<span class="highlight">Shell Sort</span> is a smarter version of Insertion Sort. ' +
      'Regular Insertion Sort compares neighbors (gap = 1), which is slow when small values are stuck at the far right. ' +
      '<span class="warn">Shell Sort starts with a big gap</span>, so it can move elements long distances in one swap. ' +
      'Then it shrinks the gap until it reaches 1, finishing with a regular Insertion Sort on a nearly-sorted array.',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${inputValues.join(", ")}] — Gaps: 4, 2, 1`)
));

steps.push(teach(
  "Why do big gaps help?",
  'Imagine the smallest number is at the far right end. With regular Insertion Sort, ' +
    'it has to slide left <span class="warn">one position at a time</span> — very slow! ' +
    'With a gap of 4, it can jump 4 positions at once. ' +
    'After the big-gap passes, the array is <span class="highlight">roughly sorted</span>, ' +
    'so the final gap-1 pass finishes quickly. This is called <span class="success">diminishing increment sort</span>.',
  ops.highlight(arr.ids, "$primary")
));

steps.push(step("Reset highlights",
  ops.reset(arr.ids)
));

// ─── Shell Sort with gaps [4, 2, 1] ───
const gaps = [4, 2, 1];

for (let g = 0; g < gaps.length; g++) {
  const gap = gaps[g];

  steps.push(annotatedStep(
    `Gap = ${gap}: compare elements ${gap} positions apart`,
    "invariant",
    {
      narration: `<span class="highlight">Gap = ${gap}</span>: We now compare elements that are ${gap} position${gap > 1 ? "s" : ""} apart. ` +
        (gap > 1
          ? `Think of it as running Insertion Sort on ${gap} separate "sub-arrays" woven together. ` +
            `Elements at indices 0, ${gap}, ${2 * gap}... form one group; indices 1, ${gap + 1}, ${2 * gap + 1}... form another, and so on.`
          : `This is just regular Insertion Sort! But because the previous passes already moved elements close to their final spots, ` +
            `this pass needs very few swaps.`),
      phase: "main-loop",
    },
    ops.setText(status.id, `Gap = ${gap}: comparing elements ${gap} apart`),
    ops.setText("gaplbl", `Current gap: ${gap}`)
  ));

  // Highlight the sub-arrays for this gap (only for gap > 1)
  if (gap > 1) {
    const colors = ["$primary", "$warning", "$danger", "$secondary"];
    const subArrayActions = [];
    for (let start = 0; start < gap && start < arr.values.length; start++) {
      const groupIds = [];
      for (let k = start; k < arr.values.length; k += gap) {
        groupIds.push(arr.id(k));
      }
      subArrayActions.push(...ops.highlight(groupIds, colors[start % colors.length]));
    }
    steps.push(teach(
      `Visualize the ${gap} interleaved sub-arrays`,
      `With gap = ${gap}, the array splits into ${gap} sub-arrays shown in different colors. ` +
        `We run Insertion Sort on each sub-array independently.`,
      subArrayActions
    ));

    steps.push(step("Reset sub-array colors",
      ops.reset(arr.ids)
    ));
  }

  // Gapped insertion sort
  for (let i = gap; i < arr.values.length; i++) {
    let j = i;
    const startVal = arr.values[i];

    steps.push(teach(
      `Insert arr[${i}]=${arr.values[i]} into its gap-${gap} sub-array`,
      `We pick element at index ${i} (value <span class="highlight">${arr.values[i]}</span>) ` +
        `and compare it with the element ${gap} position${gap > 1 ? "s" : ""} to its left.`,
      ops.highlight(arr.id(i), "$warning"),
      ops.movePointer("pi", arr.id(i))
    ));

    let swapped = false;
    while (j >= gap && arr.values[j - gap] > arr.values[j]) {
      const leftIdx = j - gap;
      const leftVal = arr.values[leftIdx];
      const rightVal = arr.values[j];

      steps.push(teach(
        `Compare arr[${leftIdx}]=${leftVal} > arr[${j}]=${rightVal}: swap!`,
        `<span class="warn">${leftVal} > ${rightVal}</span>, so we swap them. ` +
          `The value ${rightVal} moves ${gap} position${gap > 1 ? "s" : ""} to the left.`,
        ops.highlight([arr.id(leftIdx), arr.id(j)], "$danger"),
        ops.movePointer("pj", arr.id(leftIdx))
      ));

      steps.push(step(`Swap ${leftVal} and ${rightVal}`,
        ops.swap(arr, leftIdx, j, "$danger")
      ));

      swapped = true;
      j -= gap;
    }

    if (j >= gap) {
      const leftIdx = j - gap;
      steps.push(teach(
        `arr[${leftIdx}]=${arr.values[leftIdx]} <= arr[${j}]=${arr.values[j]}: stop`,
        `<span class="success">${arr.values[leftIdx]} <= ${arr.values[j]}</span> — no more swaps needed. ` +
          `The value ${startVal} has found its place in the gap-${gap} sub-array.`,
        ops.highlight(arr.id(j), "$success"),
        ops.movePointer("pj", arr.id(j))
      ));
    } else if (swapped) {
      steps.push(teach(
        `Reached the start of the sub-array`,
        `<span class="success">${arr.values[j]}</span> has reached the beginning of its gap-${gap} sub-array. No more comparisons possible.`,
        ops.highlight(arr.id(j), "$success")
      ));
    }

    // Reset after this insertion
    steps.push(step("Reset highlights",
      ops.reset(arr.ids)
    ));
  }

  // Show result after this gap
  steps.push(annotatedStep(
    `Gap ${gap} pass complete`,
    "boundary",
    {
      narration: `<span class="success">Gap ${gap} pass done!</span> Array is now: [${arr.values.join(", ")}]. ` +
        (gap > 1
          ? `The array is getting closer to sorted. ` +
            `Next we use gap = ${gaps[g + 1]}, which will make finer adjustments.`
          : `With gap = 1, we did a full Insertion Sort. Because previous passes already moved elements close to where they belong, this pass was fast!`),
      phase: "main-loop",
    },
    ops.highlight(arr.ids, "$success"),
    ops.setText(status.id, `After gap ${gap}: [${arr.values.join(", ")}]`)
  ));

  steps.push(step("Reset after gap pass",
    ops.reset(arr.ids)
  ));
}

// ─── Final ───
steps.push(annotatedStep(
  "Array is fully sorted!",
  "explanation",
  {
    narration: '<span class="success">Sorting complete!</span> Final array: ' +
      `[${arr.values.join(", ")}]. ` +
      'Shell Sort used gaps [4, 2, 1]. The big gaps moved far-away elements quickly, ' +
      'and the small gaps polished the order. ' +
      'Time complexity depends on the gap sequence — with our sequence it is roughly ' +
      '<span class="highlight">O(n^(3/2))</span>, much better than Insertion Sort\'s O(n^2).',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Sorted: [${arr.values.join(", ")}]`),
  ops.setText("gaplbl", "All gap passes complete!")
));

const v = viz(
  {
    algorithm: "shell_sort",
    title: "Shell Sort",
    description: "Diminishing-gap insertion sort. Big gaps move elements quickly; small gaps polish the order.",
    category: "sorting",
    difficulty: "intermediate",
    complexity: { time: "O(n^(3/2))", space: "O(1)" },
    input: `Array: [${inputValues.join(", ")}]`,
  },
  [arr, title, status, gapLabel, iPtr, jPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
