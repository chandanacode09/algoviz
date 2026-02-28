// Counting Sort — educational visualization with teach() and annotatedStep()
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const inputValues = [4, 2, 2, 8, 3, 3, 1];
const maxVal = 8; // range 0..maxVal

// ─── Layout: input array at top, frequency array below ───
const arr = layout.array(inputValues, { y: 150, prefix: "a" });
const freq = layout.array(Array(maxVal + 1).fill(0), { y: 320, prefix: "f", cellWidth: 55 });

const title = titleLabel("Counting Sort");
const status = statusLabel("");
const arrLabel = label("Input Array", 500, 120, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const freqLabel = label("Frequency Array (index = value)", 500, 290, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const scanPtr = pointer("scan", arr.id(0), "above", { id: "pscan" });

const steps = [];

// ─── Phase 1: Setup ───
steps.push(annotatedStep(
  "Setup: input array and empty frequency array",
  "initialization",
  {
    narration: '<span class="highlight">Counting Sort</span> works differently from comparison sorts. ' +
      'Instead of comparing elements to each other, we <span class="warn">count how many times each value appears</span>. ' +
      'The top row is our input. The bottom row is our frequency table — each slot tracks how often that index-value shows up.',
    phase: "setup",
  },
  ops.setText(status.id, `Input: [${inputValues.join(", ")}] | Range: 0..${maxVal}`)
));

// ─── Phase 2: Count occurrences ───
steps.push(teach(
  "Phase 1: Count how many times each number appears",
  'We scan the input array <span class="highlight">left to right</span>. For each value we see, ' +
    'we add 1 to that slot in the frequency array. Think of it like <span class="warn">tallying votes</span> — ' +
    'each number "votes" for its own slot.',
  ops.setText(status.id, "Phase 1: Counting occurrences...")
));

// Track frequency values ourselves
const freqValues = Array(maxVal + 1).fill(0);

for (let i = 0; i < inputValues.length; i++) {
  const val = inputValues[i];
  freqValues[val]++;

  steps.push(teach(
    `arr[${i}] = ${val}: increment freq[${val}] to ${freqValues[val]}`,
    `We see <span class="highlight">${val}</span> at position ${i}. ` +
      `So we go to slot ${val} in the frequency array and bump it up: ` +
      `<span class="success">freq[${val}] = ${freqValues[val]}</span>.`,
    ops.highlight(arr.id(i), "$warning"),
    ops.movePointer("pscan", arr.id(i)),
    ops.highlight(freq.id(val), "$primary"),
    ops.setValue(freq.id(val), freqValues[val]),
    ops.setText(status.id, `arr[${i}] = ${val} → freq[${val}] becomes ${freqValues[val]}`)
  ));

  // Reset highlights
  steps.push(step(`Reset highlights`,
    ops.reset(arr.id(i)),
    ops.reset(freq.id(val))
  ));
}

// Mark counting done
steps.push(annotatedStep(
  "Counting complete! Frequency table is filled",
  "boundary",
  {
    narration: '<span class="success">Counting phase done!</span> The frequency array now tells us exactly ' +
      'how many of each number we have. For example, freq[3] = 2 means the number 3 appears twice. ' +
      'Now we just need to <span class="highlight">read off the values in order</span>.',
    phase: "main-loop",
  },
  ops.highlight(freq.ids, "$success"),
  ops.setText(status.id, `Frequency: [${freqValues.join(", ")}]`)
));

steps.push(step("Reset frequency highlights",
  ops.reset(freq.ids)
));

// ─── Phase 3: Reconstruct sorted array ───
steps.push(teach(
  "Phase 2: Rebuild the sorted array using the counts",
  'Now we walk through the frequency array <span class="highlight">from index 0 to ' + maxVal + '</span>. ' +
    'For each slot, we write that many copies of the index back into the input array. ' +
    'Since we go in order, the result is <span class="success">automatically sorted</span>!',
  ops.setText(status.id, "Phase 2: Reconstructing sorted array...")
));

let writePos = 0;
for (let val = 0; val <= maxVal; val++) {
  if (freqValues[val] === 0) continue;

  steps.push(teach(
    `freq[${val}] = ${freqValues[val]}: write ${freqValues[val]} cop${freqValues[val] === 1 ? "y" : "ies"} of ${val}`,
    `Frequency slot <span class="highlight">${val}</span> says we have <span class="warn">${freqValues[val]}</span> ` +
      `cop${freqValues[val] === 1 ? "y" : "ies"} of ${val}. We write them into positions ${writePos}..${writePos + freqValues[val] - 1}.`,
    ops.highlight(freq.id(val), "$primary"),
    ops.setText(status.id, `Writing ${freqValues[val]}x value ${val} starting at position ${writePos}`)
  ));

  for (let c = 0; c < freqValues[val]; c++) {
    steps.push(step(`Write ${val} at position ${writePos}`,
      ops.setValue(arr.id(writePos), val),
      ops.highlight(arr.id(writePos), "$success"),
    ));
    writePos++;
  }

  steps.push(step(`Done writing ${val}s`,
    ops.reset(freq.id(val)),
  ));
}

// ─── Final ───
steps.push(annotatedStep(
  "Array is now sorted!",
  "explanation",
  {
    narration: '<span class="success">Sorting complete!</span> Final array: ' +
      `[${[...inputValues].sort((a, b) => a - b).join(", ")}]. ` +
      'Counting Sort never compares two elements — it just counts and reconstructs. ' +
      'That is why it runs in <span class="highlight">O(n + k)</span> time, where n is the array size and k is the range of values. ' +
      'It is faster than comparison sorts (which need at least O(n log n)), but it only works when the range k is not too big.',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `Sorted: [${[...inputValues].sort((a, b) => a - b).join(", ")}] — O(n + k) time!`)
));

const v = viz(
  {
    algorithm: "counting_sort",
    title: "Counting Sort",
    description: "Count occurrences of each value, then reconstruct the sorted array. No comparisons needed!",
    category: "sorting",
    difficulty: "beginner",
    complexity: { time: "O(n+k)", space: "O(k)" },
    input: `Array: [${inputValues.join(", ")}], range: 0..${maxVal}`,
  },
  [arr, freq, title, status, arrLabel, freqLabel, scanPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
