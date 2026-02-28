// Fisher-Yates Shuffle — walk backward, pick random index, swap
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [1, 2, 3, 4, 5, 6, 7];
const arr = layout.array(values);
const title = titleLabel("Fisher-Yates Shuffle");
const status = statusLabel("");
const iPtr = pointer("i", arr.id(values.length - 1), "above", { id: "pi" });

const steps = [];

// Hardcoded "random" picks for determinism
// For i from 6 down to 1, pick j in [0..i]
// i=6 -> j=2, i=5 -> j=0, i=4 -> j=3, i=3 -> j=1, i=2 -> j=2, i=1 -> j=0
const randomPicks = [2, 0, 3, 1, 2, 0];

// ─── Setup ───
steps.push(annotatedStep(
  "Start with array [1, 2, 3, 4, 5, 6, 7] — we will shuffle it",
  "initialization",
  {
    narration: 'The <span class="highlight">Fisher-Yates shuffle</span> is the correct way to randomly ' +
      'rearrange a list. Imagine you have a deck of cards and you want every possible order to be ' +
      'equally likely. A bad shuffle might favor some orders over others! ' +
      '<span class="warn">Fisher-Yates guarantees every arrangement has the exact same chance.</span>',
    phase: "setup",
  },
  ops.setText(status.id, "Array: [1, 2, 3, 4, 5, 6, 7] — ready to shuffle")
));

steps.push(teach(
  "Algorithm: walk from the end, pick a random spot, swap",
  'Here is how it works: start at the <span class="highlight">last element</span> (index 6). ' +
    'Pick a <span class="warn">random index</span> from 0 up to the current position. ' +
    'Swap the current element with the one at the random index. ' +
    'Then move one step left and repeat. Each element gets <span class="success">locked in</span> after being placed.',
  ops.movePointer("pi", arr.id(values.length - 1)),
  ops.setText(status.id, "Walk backward from index 6 to 1")
));

// ─── Main shuffle loop ───
const n = values.length;
for (let step_idx = 0; step_idx < n - 1; step_idx++) {
  const i = n - 1 - step_idx;
  const j = randomPicks[step_idx];

  // Show which index we're at and which random index was picked
  steps.push(teach(
    `i=${i}: randomly pick j=${j} from range [0..${i}]`,
    `We are at index <span class="highlight">${i}</span> (value ${arr.values[i]}). ` +
      `We pick a random index <span class="warn">j=${j}</span> from the range [0..${i}]. ` +
      (i === j
        ? `j equals i, so the element <span class="success">stays in place</span>!`
        : `We will swap arr[${i}]=${arr.values[i]} with arr[${j}]=${arr.values[j]}.`),
    ops.movePointer("pi", arr.id(i)),
    ops.highlight(arr.id(i), "$primary"),
    ops.highlight(arr.id(j), "$warning"),
    ops.setText(status.id, `i=${i}, random j=${j} — ${i === j ? "no swap needed" : `swap ${arr.values[i]} and ${arr.values[j]}`}`)
  ));

  if (i !== j) {
    // Perform the swap
    const valI = arr.values[i];
    const valJ = arr.values[j];
    steps.push(teach(
      `Swap arr[${i}]=${valI} with arr[${j}]=${valJ}`,
      `Swapping <span class="warn">${valI}</span> (index ${i}) and <span class="warn">${valJ}</span> (index ${j}). ` +
        `After this swap, position ${i} is <span class="success">finalized</span> — it won't be touched again.`,
      ops.swap(arr, i, j, "$danger"),
    ));
  }

  // Mark position i as done
  steps.push(annotatedStep(
    `Position ${i} is finalized with value ${arr.values[i]}`,
    "invariant",
    {
      narration: `<span class="success">Position ${i} is locked in!</span> ` +
        `The value <span class="success">${arr.values[i]}</span> is now in its final shuffled spot. ` +
        `<span class="highlight">Invariant</span>: elements at indices ${i}..${n - 1} are all in their final random positions. ` +
        `We will never touch them again.`,
      phase: "main-loop",
    },
    ops.markDone(arr.id(i)),
    ops.reset(arr.ids.filter((_, idx) => idx < i)),
  ));
}

// Mark the first element as done too (it has no choice left)
steps.push(teach(
  `Position 0 is the only one left — it's automatically finalized`,
  `The last remaining element <span class="success">${arr.values[0]}</span> at index 0 has nowhere else to go. ` +
    `It is finalized by default.`,
  ops.markDone(arr.id(0)),
));

// ─── Conclusion ───
steps.push(annotatedStep(
  `Shuffle complete! Result: [${arr.values.join(", ")}]`,
  "explanation",
  {
    narration: `<span class="success">Shuffle done!</span> Final array: [${arr.values.join(", ")}]. ` +
      'Why does Fisher-Yates produce a <span class="highlight">perfectly uniform</span> shuffle? ' +
      'At each step, every remaining element has an equal chance of being picked. ' +
      'There are n! possible outcomes and each one is equally likely. ' +
      'Time: <span class="highlight">O(n)</span>. Space: <span class="highlight">O(1)</span> — just swaps in place.',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Shuffled: [${arr.values.join(", ")}]`)
));

const v = viz(
  {
    algorithm: "fisher_yates_shuffle",
    title: "Fisher-Yates Shuffle",
    description: "The Fisher-Yates algorithm for generating a uniformly random permutation of an array.",
    category: "other",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: "Array: [1, 2, 3, 4, 5, 6, 7]",
  },
  [arr, title, status, iPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
