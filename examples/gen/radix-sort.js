// Radix Sort — educational visualization with teach() and annotatedStep()
// Sorts by processing digits from least-significant to most-significant
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const inputValues = [170, 45, 75, 90, 802, 24, 2, 66];

// ─── Layout ───
const arr = layout.array(inputValues, { y: 200, prefix: "a", cellWidth: 65 });
const title = titleLabel("Radix Sort (LSD)");
const status = statusLabel("");
const arrLabel = label("Main Array", 500, 170, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const digitLabel = label("", 500, 350, { fontSize: 16, fontWeight: "bold", fill: "$primary", id: "digitlbl" });
const scanPtr = pointer("scan", arr.id(0), "above", { id: "pscan" });

const steps = [];

// ─── Phase 0: Introduction ───
steps.push(annotatedStep(
  "Introduction: Radix Sort processes one digit at a time",
  "initialization",
  {
    narration: '<span class="highlight">Radix Sort</span> is a clever non-comparison sort. ' +
      'Instead of asking "is A bigger than B?", it sorts by looking at <span class="warn">one digit at a time</span>. ' +
      'We start with the ones place, then the tens place, then the hundreds place. ' +
      'After processing all digits, the array is sorted!',
    phase: "setup",
  },
  ops.setText(status.id, `Array: [${inputValues.join(", ")}] — 3 digit passes needed`)
));

steps.push(teach(
  "Why start from the least-significant digit?",
  'It seems backwards, but starting from the <span class="highlight">rightmost digit (ones place)</span> is the key trick. ' +
    'Each pass uses a <span class="warn">stable sort</span> — items with the same digit keep their relative order. ' +
    'So when we sort by the tens digit, items that were already sorted by ones stay in order within each tens group. ' +
    'By the end, everything is perfectly sorted!',
  ops.highlight(arr.ids, "$primary")
));

steps.push(step("Reset highlights",
  ops.reset(arr.ids)
));

// ─── Helper: get digit at position (0=ones, 1=tens, 2=hundreds) ───
function getDigit(num, pos) {
  return Math.floor(num / Math.pow(10, pos)) % 10;
}

// Track the current values in the array
const current = [...inputValues];

// ─── Process each digit position ───
const digitNames = ["ones", "tens", "hundreds"];
const maxDigits = 3; // max number in array is 802 (3 digits)

for (let d = 0; d < maxDigits; d++) {
  const place = digitNames[d];
  const divisor = Math.pow(10, d);

  // Announce the digit pass
  steps.push(annotatedStep(
    `Pass ${d + 1}: Sort by the ${place} digit`,
    "invariant",
    {
      narration: `<span class="highlight">Pass ${d + 1}</span>: We now look at the <span class="warn">${place} digit</span> of each number. ` +
        `To find it, we divide by ${divisor} and take the remainder when dividing by 10. ` +
        `We group numbers by this digit, then put them back in order.`,
      phase: "main-loop",
    },
    ops.setText(status.id, `Pass ${d + 1}: Sorting by ${place} digit (÷${divisor} mod 10)`),
    ops.setText("digitlbl", `Current digit: ${place} place`)
  ));

  // Show each element's digit
  for (let i = 0; i < current.length; i++) {
    const digit = getDigit(current[i], d);
    steps.push(teach(
      `${current[i]}: ${place} digit is ${digit}`,
      `The number <span class="highlight">${current[i]}</span> has ${place} digit = ` +
        `<span class="warn">${digit}</span>. ` +
        (d === 0
          ? `(${current[i]} mod 10 = ${digit})`
          : `(${current[i]} ÷ ${divisor} = ${Math.floor(current[i] / divisor)}, then mod 10 = ${digit})`),
      ops.highlight(arr.id(i), "$warning"),
      ops.movePointer("pscan", arr.id(i)),
      ops.setText(status.id, `${current[i]} → ${place} digit = ${digit}`)
    ));

    steps.push(step(`Reset highlight`,
      ops.reset(arr.id(i))
    ));
  }

  // Perform counting sort by this digit
  // Build buckets
  const buckets = Array.from({ length: 10 }, () => []);
  for (let i = 0; i < current.length; i++) {
    const digit = getDigit(current[i], d);
    buckets[digit].push({ value: current[i], index: i });
  }

  // Show bucket grouping
  const bucketSummary = [];
  for (let b = 0; b < 10; b++) {
    if (buckets[b].length > 0) {
      bucketSummary.push(`${b}: [${buckets[b].map(x => x.value).join(", ")}]`);
    }
  }

  steps.push(teach(
    `Group by ${place} digit into buckets`,
    `After reading all ${place} digits, we group them into buckets: ` +
      bucketSummary.map(s => `<span class="highlight">${s}</span>`).join(", ") +
      `. Now we read them out in order (bucket 0, then 1, then 2, ...) to get the new arrangement.`,
    ops.highlight(arr.ids, "$primary"),
    ops.setText(status.id, `Buckets: ${bucketSummary.join(" | ")}`)
  ));

  // Flatten buckets back to get new order
  const newOrder = [];
  for (let b = 0; b < 10; b++) {
    for (const item of buckets[b]) {
      newOrder.push(item.value);
    }
  }

  // Update the array to reflect the new order
  steps.push(step("Reset before rearranging",
    ops.reset(arr.ids)
  ));

  for (let i = 0; i < newOrder.length; i++) {
    current[i] = newOrder[i];
    steps.push(step(`Place ${newOrder[i]} at position ${i}`,
      ops.setValue(arr.id(i), newOrder[i]),
      ops.highlight(arr.id(i), "$success")
    ));
  }

  steps.push(step(`Reset after ${place} pass`,
    ops.reset(arr.ids)
  ));

  // Show result of this pass
  steps.push(annotatedStep(
    `Pass ${d + 1} complete: array after sorting by ${place} digit`,
    "boundary",
    {
      narration: `<span class="success">Pass ${d + 1} done!</span> After sorting by the <span class="highlight">${place} digit</span>, ` +
        `the array is: [${current.join(", ")}]. ` +
        (d < maxDigits - 1
          ? `It is not fully sorted yet — we still need to process the ${digitNames[d + 1]} digit.`
          : `All digits have been processed. The array is now fully sorted!`),
      phase: "main-loop",
    },
    ops.highlight(arr.ids, "$success"),
    ops.setText(status.id, `After ${place} pass: [${current.join(", ")}]`)
  ));

  steps.push(step(`Reset highlights after pass ${d + 1}`,
    ops.reset(arr.ids)
  ));
}

// ─── Final ───
steps.push(annotatedStep(
  "Array is fully sorted!",
  "explanation",
  {
    narration: '<span class="success">Sorting complete!</span> Final array: ' +
      `[${current.join(", ")}]. ` +
      'Radix Sort processed 3 digit positions (ones, tens, hundreds). ' +
      'Each pass was a <span class="highlight">stable counting sort</span> on one digit. ' +
      'Time complexity: <span class="highlight">O(d * n)</span> where d is the number of digits and n is the array size. ' +
      'For our 8 numbers with at most 3 digits, that is just 24 operations — much faster than O(n log n) comparison sorts!',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Sorted: [${current.join(", ")}] — O(d*n) time!`),
  ops.setText("digitlbl", "All digit passes complete!")
));

const v = viz(
  {
    algorithm: "radix_sort",
    title: "Radix Sort (LSD)",
    description: "Sort numbers by processing digits from least-significant to most-significant. Each pass is a stable counting sort on one digit.",
    category: "sorting",
    difficulty: "intermediate",
    complexity: { time: "O(d*n)", space: "O(n+k)" },
    input: `Array: [${inputValues.join(", ")}]`,
  },
  [arr, title, status, arrLabel, digitLabel, scanPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
