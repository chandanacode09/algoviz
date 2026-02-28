// Find Median from Data Stream — two-heap approach, educational step-by-step
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input stream ───
const stream = [5, 15, 1, 3, 8, 7];

// Layout: input stream at top
const inputArr = layout.array(stream, { y: 80, prefix: "i", cellWidth: 60 });

const title = titleLabel("Find Median from Data Stream");
const status = statusLabel("");

const inputLbl = label("Input Stream", 500, 55, { id: "linp", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$text" });
const maxHeapLbl = label("Max-Heap (smaller half)", 270, 190, { id: "lmax", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$primary" });
const minHeapLbl = label("Min-Heap (larger half)", 730, 190, { id: "lmin", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$warning" });
const maxContents = label("[]", 270, 280, { id: "lmaxc", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary" });
const minContents = label("[]", 730, 280, { id: "lminc", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$warning" });
const medianLbl = label("Median: ?", 500, 390, { id: "lmed", fontSize: 20, fontWeight: "bold", anchor: "middle", fill: "$success" });
const dividerLbl = label("|", 500, 250, { id: "ldiv", fontSize: 40, fontWeight: "bold", anchor: "middle", fill: "$muted" });

// Region actors for visual grouping
const maxRegionId = "rmax";
const minRegionId = "rmin";

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Find the running median of a stream using two heaps",
  "initialization",
  {
    narration: 'To find the <span class="highlight">median</span> efficiently from a stream, we use two heaps: ' +
      'a <span class="highlight">max-heap</span> for the smaller half and a <span class="warn">min-heap</span> for the larger half. ' +
      'The median is always at the top of one or both heaps. This gives <span class="success">O(log n)</span> per insertion ' +
      'and <span class="success">O(1)</span> median retrieval.',
    phase: "setup",
  },
  ops.setText(status.id, "Stream: [5, 15, 1, 3, 8, 7]. Two heaps maintain sorted halves.")
));

steps.push(teach(
  "Max-heap holds smaller half, min-heap holds larger half",
  'The <span class="highlight">max-heap</span> stores the smaller half of numbers — its root is the ' +
    '<span class="success">largest of the small numbers</span>. The <span class="warn">min-heap</span> stores the larger half — ' +
    'its root is the <span class="success">smallest of the large numbers</span>. ' +
    'The median is either the max-heap root (odd count) or the average of both roots (even count).',
  ops.setText(status.id, "Rule: max-heap.size >= min-heap.size (differ by at most 1)")
));

// State tracking
let maxHeap = []; // stored as sorted desc (root = max = last conceptually, but we show as array)
let minHeap = []; // stored as sorted asc (root = min)

function getMedian() {
  if (maxHeap.length > minHeap.length) {
    return maxHeap[0]; // root of max-heap (the max of smaller half)
  }
  return (maxHeap[0] + minHeap[0]) / 2;
}

function maxHeapStr() {
  return "[" + maxHeap.join(", ") + "]";
}

function minHeapStr() {
  return "[" + minHeap.join(", ") + "]";
}

// Process each element
for (let idx = 0; idx < stream.length; idx++) {
  const num = stream[idx];

  // Highlight current input element
  steps.push(step(
    `Process stream[${idx}] = ${num}`,
    ops.highlight(inputArr.id(idx), "$warning"),
    ops.setText(status.id, `Processing element: ${num}`)
  ));

  // Decide which heap to add to
  if (maxHeap.length === 0 || num <= maxHeap[0]) {
    // Add to max-heap
    maxHeap.push(num);
    maxHeap.sort((a, b) => b - a); // max at index 0

    steps.push(step(
      `Add ${num} to max-heap (smaller half)`,
      ops.highlight(inputArr.id(idx), "$primary"),
      ops.setText("lmaxc", maxHeapStr()),
      ops.setText(status.id, `${num} <= max-heap root (or heap empty) → add to max-heap`)
    ));
  } else {
    // Add to min-heap
    minHeap.push(num);
    minHeap.sort((a, b) => a - b); // min at index 0

    steps.push(step(
      `Add ${num} to min-heap (larger half)`,
      ops.highlight(inputArr.id(idx), "$warning"),
      ops.setText("lminc", minHeapStr()),
      ops.setText(status.id, `${num} > max-heap root → add to min-heap`)
    ));
  }

  // Rebalance if needed (sizes differ by more than 1)
  let rebalanced = false;
  if (maxHeap.length > minHeap.length + 1) {
    // Move root of max-heap to min-heap
    const moved = maxHeap.shift();
    minHeap.push(moved);
    minHeap.sort((a, b) => a - b);
    rebalanced = true;

    steps.push(teach(
      `Rebalance: move ${moved} from max-heap to min-heap`,
      `Max-heap has <span class="warn">${maxHeap.length + 1} elements</span> vs min-heap's ${minHeap.length - 1}. ` +
        `Difference > 1! Move the max-heap root <span class="highlight">${moved}</span> to the min-heap to rebalance.`,
      ops.setText("lmaxc", maxHeapStr()),
      ops.setText("lminc", minHeapStr()),
      ops.setText(status.id, `Rebalanced: moved ${moved} from max to min heap`)
    ));
  } else if (minHeap.length > maxHeap.length + 1) {
    // Move root of min-heap to max-heap
    const moved = minHeap.shift();
    maxHeap.push(moved);
    maxHeap.sort((a, b) => b - a);
    rebalanced = true;

    steps.push(teach(
      `Rebalance: move ${moved} from min-heap to max-heap`,
      `Min-heap has <span class="warn">${minHeap.length + 1} elements</span> vs max-heap's ${maxHeap.length - 1}. ` +
        `Difference > 1! Move the min-heap root <span class="highlight">${moved}</span> to the max-heap to rebalance.`,
      ops.setText("lmaxc", maxHeapStr()),
      ops.setText("lminc", minHeapStr()),
      ops.setText(status.id, `Rebalanced: moved ${moved} from min to max heap`)
    ));
  }

  // Compute and show median
  const median = getMedian();
  const medianStr = Number.isInteger(median) ? String(median) : median.toFixed(1);
  const totalElements = maxHeap.length + minHeap.length;
  const isOdd = totalElements % 2 === 1;

  const medianExplanation = isOdd
    ? `Odd count (${totalElements}): median = max-heap root = <span class="success">${medianStr}</span>`
    : `Even count (${totalElements}): median = (${maxHeap[0]} + ${minHeap[0]}) / 2 = <span class="success">${medianStr}</span>`;

  steps.push(step(
    `Median after ${totalElements} elements: ${medianStr}`,
    ops.markDone(inputArr.id(idx)),
    ops.setText("lmed", `Median: ${medianStr}`),
    ops.setText(status.id, `After ${totalElements} element${totalElements > 1 ? "s" : ""}: median = ${medianStr}` +
      ` | Max-heap: ${maxHeapStr()} | Min-heap: ${minHeapStr()}`)
  ));
}

// ─── Final ───
steps.push(annotatedStep(
  "All elements processed. Two-heap approach gives O(log n) insertion and O(1) median.",
  "explanation",
  {
    narration: '<span class="success">Stream fully processed!</span> The two-heap approach ensures: ' +
      '<span class="highlight">O(log n)</span> per insertion (heap insert + possible rebalance), ' +
      '<span class="highlight">O(1)</span> median retrieval (just read heap roots). ' +
      'Total: <span class="success">O(n log n)</span> for n elements. ' +
      'The key invariant: max-heap and min-heap sizes differ by at most 1, ' +
      'and every element in max-heap is less than or equal to every element in min-heap.',
    phase: "cleanup",
  },
  ops.setText(status.id, "Final median: " + (Number.isInteger(getMedian()) ? getMedian() : getMedian().toFixed(1)) +
    " | O(log n) per insert, O(1) median query"),
  ops.setText("lmed", "Median: " + (Number.isInteger(getMedian()) ? getMedian() : getMedian().toFixed(1)) + " (final)")
));

const v = viz(
  {
    algorithm: "find_median_stream",
    title: "Find Median from Data Stream — Two Heaps",
    description: "Maintain a running median using a max-heap for the smaller half and a min-heap for the larger half.",
    category: "heap",
    difficulty: "advanced",
    complexity: { time: "O(n log n)", space: "O(n)" },
    input: "Stream: [5, 15, 1, 3, 8, 7]",
  },
  [inputArr, title, status, inputLbl, maxHeapLbl, minHeapLbl, maxContents, minContents, medianLbl, dividerLbl],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
