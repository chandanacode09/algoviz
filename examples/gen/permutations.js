// Permutations via Backtracking — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds,
} = require("algoviz");

resetIds();

const arr = layout.array([1, 2, 3]);
const title = titleLabel("Permutations — Backtracking");
const status = statusLabel("");
const resultLabel = label("Results: []", 500, 550, {
  id: "reslbl", fontSize: 14, fill: "$text",
});

const steps = [];
const results = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Generate all permutations of [1, 2, 3] using backtracking",
  "initialization",
  {
    narration: '<span class="highlight">Backtracking</span> generates permutations by fixing one element at a time. ' +
      'At each position, we <span class="warn">choose</span> an element, <span class="warn">explore</span> the ' +
      'remaining positions recursively, then <span class="warn">un-choose</span> (swap back) to try the next option. ' +
      'This "choose, explore, un-choose" pattern is the heart of backtracking.',
    phase: "setup",
  },
  ops.setText(status.id, "Array: [1, 2, 3] — generate all 6 permutations")
));

// Backtracking algorithm: fix position `start`, recurse on rest
// permute(arr, start):
//   if start == arr.length - 1: record permutation
//   for i = start to arr.length - 1:
//     swap(arr[start], arr[i])   // choose
//     permute(arr, start + 1)    // explore
//     swap(arr[start], arr[i])   // un-choose

function permute(start) {
  if (start === arr.values.length - 1) {
    // Base case: all positions fixed, record result
    const perm = arr.values.slice();
    results.push(perm.join(","));
    steps.push(annotatedStep(
      `Permutation found: [${perm.join(", ")}]`,
      "invariant",
      {
        narration: `<span class="success">Permutation #${results.length}:</span> [<span class="success">${perm.join(", ")}</span>]. ` +
          `All positions are fixed. Record this permutation and <span class="warn">backtrack</span> to explore other choices.`,
        phase: "main-loop",
      },
      ops.markDone(arr.ids),
      ops.setText("reslbl", `Results: [${results.join(" | ")}]`),
      ops.setText(status.id, `Found permutation #${results.length}: [${perm.join(", ")}]`)
    ));

    // Reset done highlights for next exploration
    steps.push(step(
      "Reset for backtracking",
      ops.reset(arr.ids),
    ));
    return;
  }

  for (let i = start; i < arr.values.length; i++) {
    // CHOOSE: swap arr[start] with arr[i]
    if (i === start) {
      // No swap needed, just highlight the fixed element
      steps.push(teach(
        `Fix position ${start}: keep ${arr.values[start]} in place`,
        `At position <span class="highlight">${start}</span>, we choose to keep ` +
          `<span class="warn">${arr.values[start]}</span> in place (no swap needed). ` +
          `This is one of the available choices for this position.`,
        ops.highlight(arr.id(start), "$primary"),
        ops.setText(status.id, `Fix position ${start}: choose ${arr.values[start]}`)
      ));
    } else {
      const valStart = arr.values[start];
      const valI = arr.values[i];
      steps.push(teach(
        `Choose: swap arr[${start}]=${valStart} with arr[${i}]=${valI}`,
        `At position <span class="highlight">${start}</span>, we <span class="warn">choose</span> ` +
          `<span class="warn">${valI}</span> by swapping it with <span class="highlight">${valStart}</span>. ` +
          `This places ${valI} at position ${start} so we can explore permutations starting with it.`,
        ops.swap(arr, start, i, "$warning"),
        ops.setText(status.id, `Choose: swap pos ${start} and ${i} -> [${arr.values.join(", ")}]`)
      ));
    }

    // EXPLORE: recurse on the rest
    permute(start + 1);

    // UN-CHOOSE: swap back
    if (i !== start) {
      const valStart = arr.values[start];
      const valI = arr.values[i];
      steps.push(teach(
        `Un-choose: swap back arr[${start}]=${valStart} with arr[${i}]=${valI}`,
        `<span class="warn">Backtrack!</span> Swap back <span class="highlight">${valStart}</span> and ` +
          `<span class="highlight">${valI}</span> to restore the array. ` +
          `This "un-choose" step undoes our earlier decision so we can try the next option.`,
        ops.swap(arr, start, i, "$danger"),
        ops.setText(status.id, `Un-choose: swap back pos ${start} and ${i} -> [${arr.values.join(", ")}]`)
      ));
    } else {
      steps.push(step(
        `Position ${start} explored with ${arr.values[start]} — try next option`,
        ops.reset(arr.id(start)),
      ));
    }
  }
}

permute(0);

// ─── Cleanup ───
steps.push(annotatedStep(
  `All ${results.length} permutations generated!`,
  "explanation",
  {
    narration: `<span class="success">All ${results.length} permutations found!</span> ` +
      `For an array of n elements, there are <span class="highlight">n! = ${results.length}</span> permutations. ` +
      `The backtracking pattern — <span class="warn">choose, explore, un-choose</span> — systematically ` +
      `explores every possibility. Time: <span class="highlight">O(n * n!)</span>. ` +
      `Space: <span class="highlight">O(n)</span> for the recursion stack.`,
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Done! ${results.length} permutations of [1, 2, 3]`)
));

const v = viz(
  {
    algorithm: "permutations",
    title: "Permutations — Backtracking",
    description: "Generate all permutations of an array using the backtracking pattern: choose, explore, un-choose (swap and swap back).",
    category: "backtracking",
    difficulty: "intermediate",
    complexity: { time: "O(n * n!)", space: "O(n)" },
    input: "Array: [1, 2, 3]",
  },
  [arr, title, status, resultLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
