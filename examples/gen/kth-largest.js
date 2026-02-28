// Kth Largest Element using Min-Heap — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Input stream and k
const values = [3, 2, 1, 5, 6, 4];
const k = 2;

// Layout the input array at the top
const arr = layout.array(values, { y: 80, prefix: "a" });

const title = titleLabel("Kth Largest Element (k=2)");
const status = statusLabel("");

// Info labels
const kLabel = label("k = 2: maintain a min-heap of size 2", 500, 160, {
  id: "lk", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});
const resultLabel = label("kth largest: ?", 500, 520, {
  id: "lres", fontSize: 18, fontWeight: "bold", anchor: "middle", fill: "$success",
});

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Find the 2nd largest element in [3, 2, 1, 5, 6, 4] using a min-heap",
  "initialization",
  {
    narration: 'To find the <span class="highlight">kth largest</span> element efficiently, we maintain a ' +
      '<span class="warn">min-heap of size k</span>. The key insight: after processing all elements, ' +
      'the <span class="success">root of the heap</span> (the minimum of the k largest values) ' +
      'is exactly the kth largest element. Here k=2.',
    phase: "setup",
  },
  ops.setText(status.id, "Input: [3, 2, 1, 5, 6, 4], k = 2")
));

// We will simulate the min-heap as a small tree.
// Process elements one by one.
// Heap state: we track it manually.

// Step 1: Process element 3 — heap is empty, add it
steps.push(teach(
  "Process arr[0] = 3: heap has space, add directly",
  'Heap size < k (0 < 2), so we <span class="success">add 3 directly</span> to the heap. ' +
    'The heap now contains [3].',
  ops.highlight(arr.id(0), "$primary"),
  ops.setText(status.id, "Process 3: heap size < k, add it. Heap: [3]")
));

// Create heap node for 3
const heapN3id = "hn0";
const heapN3X = 500;
const heapN3Y = 330;

steps.push(step("Heap now contains [3]",
  ops.create({ id: heapN3id, type: "node", x: heapN3X, y: heapN3Y, value: 3, radius: 25, fill: "$primary" }),
  ops.reset(arr.id(0))
));

// Step 2: Process element 2 — heap has space, add it
steps.push(teach(
  "Process arr[1] = 2: heap has space, add directly",
  'Heap size < k (1 < 2), so we <span class="success">add 2 directly</span>. ' +
    'Since 2 < 3, sift up: 2 becomes the root. Heap: [2, 3].',
  ops.highlight(arr.id(1), "$primary"),
  ops.setText(status.id, "Process 2: heap size < k, add it. Heap: [2, 3]")
));

// Create heap node for 3's child and adjust: root=2, child=3
const heapN2childId = "hn1";
const heapN2childX = 440;
const heapN2childY = 430;

steps.push(step("Heap: root=2, child=3 (min-heap of size 2)",
  ops.setValue(heapN3id, 2),
  ops.create({ id: heapN2childId, type: "node", x: heapN2childX, y: heapN2childY, value: 3, radius: 25, fill: "$default" }),
  ops.create({ id: "he0", type: "edge", source: heapN3id, target: heapN2childId, directed: false }),
  ops.reset(arr.id(1)),
  ops.highlight(heapN3id, "$success"),
  ops.setText("lres", "kth largest: 2 (heap root)")
));

steps.push(step("Heap settled",
  ops.reset(heapN3id)
));

// Step 3: Process element 1 — heap is full, 1 < root(2), skip
steps.push(teach(
  "Process arr[2] = 1: heap is full (size=k). Compare 1 with root 2.",
  'Heap is full (size = k = 2). Root = <span class="highlight">2</span>. ' +
    'New element = <span class="warn">1</span>. Since <span class="warn">1 < 2</span> (not bigger than root), ' +
    'this element cannot be in the top-k. <span class="success">Skip it.</span> ' +
    'If we added 1, it would push out a larger element, which is wrong.',
  ops.highlight(arr.id(2), "$danger"),
  ops.highlight(heapN3id, "$warning"),
  ops.setText(status.id, "Process 1: 1 < root(2), skip! Heap unchanged")
));

steps.push(step("Element 1 skipped, heap unchanged",
  ops.reset(arr.id(2)),
  ops.reset(heapN3id)
));

// Step 4: Process element 5 — heap is full, 5 > root(2), replace root and sift down
steps.push(teach(
  "Process arr[3] = 5: heap is full. Compare 5 with root 2.",
  'Heap is full. Root = <span class="highlight">2</span>. ' +
    'New element = <span class="success">5</span>. Since <span class="success">5 > 2</span>, ' +
    '5 belongs in the top-k. <span class="warn">Replace the root</span> with 5 and sift down. ' +
    'The old root (2) is evicted — it is NOT in the top-k.',
  ops.highlight(arr.id(3), "$success"),
  ops.highlight(heapN3id, "$danger"),
  ops.setText(status.id, "Process 5: 5 > root(2), replace root and sift down")
));

// Replace root with 5, sift down: 5 vs child 3 → 3 < 5, swap → root=3, child=5
steps.push(teach(
  "Replace root with 5, sift down: swap 5 and 3",
  'After replacing root: heap is [5, 3]. Sift down: <span class="warn">5 > 3</span>, ' +
    'so swap. Result: root = <span class="success">3</span>, child = 5. ' +
    'Heap property restored: [3, 5]. The 2nd largest so far is <span class="success">3</span>.',
  ops.setValue(heapN3id, 3),
  ops.setValue(heapN2childId, 5),
  ops.highlight(heapN3id, "$success"),
  ops.highlight(heapN2childId, "$primary"),
  ops.reset(arr.id(3)),
  ops.setText(status.id, "Heap: [3, 5]. kth largest = 3"),
  ops.setText("lres", "kth largest: 3 (heap root)")
));

steps.push(step("Heap settled after inserting 5",
  ops.reset(heapN3id),
  ops.reset(heapN2childId)
));

// Step 5: Process element 6 — heap is full, 6 > root(3), replace root and sift down
steps.push(teach(
  "Process arr[4] = 6: heap is full. Compare 6 with root 3.",
  'Root = <span class="highlight">3</span>, new element = <span class="success">6</span>. ' +
    'Since <span class="success">6 > 3</span>, replace root with 6 and sift down.',
  ops.highlight(arr.id(4), "$success"),
  ops.highlight(heapN3id, "$danger"),
  ops.setText(status.id, "Process 6: 6 > root(3), replace and sift down")
));

// Replace root with 6, sift down: 6 vs 5 → swap → root=5, child=6
steps.push(teach(
  "Replace root with 6, sift down: swap 6 and 5",
  'After replacing root: heap is [6, 5]. Sift down: <span class="warn">6 > 5</span>, ' +
    'swap. Result: root = <span class="success">5</span>, child = 6. ' +
    'Heap: [5, 6]. The 2nd largest so far is <span class="success">5</span>.',
  ops.setValue(heapN3id, 5),
  ops.setValue(heapN2childId, 6),
  ops.highlight(heapN3id, "$success"),
  ops.highlight(heapN2childId, "$primary"),
  ops.reset(arr.id(4)),
  ops.setText(status.id, "Heap: [5, 6]. kth largest = 5"),
  ops.setText("lres", "kth largest: 5 (heap root)")
));

steps.push(step("Heap settled after inserting 6",
  ops.reset(heapN3id),
  ops.reset(heapN2childId)
));

// Step 6: Process element 4 — heap is full, 4 < root(5), skip
steps.push(teach(
  "Process arr[5] = 4: heap is full. Compare 4 with root 5.",
  'Root = <span class="highlight">5</span>, new element = <span class="warn">4</span>. ' +
    'Since <span class="warn">4 < 5</span>, element 4 is not in the top-2. <span class="success">Skip it.</span>',
  ops.highlight(arr.id(5), "$danger"),
  ops.highlight(heapN3id, "$warning"),
  ops.setText(status.id, "Process 4: 4 < root(5), skip! Heap unchanged")
));

steps.push(step("Element 4 skipped, heap unchanged",
  ops.reset(arr.id(5)),
  ops.reset(heapN3id)
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Done! The 2nd largest element is 5 (the heap root).",
  "explanation",
  {
    narration: '<span class="success">All elements processed!</span> The min-heap contains [5, 6] — ' +
      'the top <span class="highlight">k=2</span> elements. The root of this heap, ' +
      '<span class="success">5</span>, is the 2nd largest element in [3, 2, 1, 5, 6, 4]. ' +
      'Time complexity: <span class="highlight">O(n log k)</span> — we process n elements, ' +
      'each heap operation is O(log k). Space: <span class="highlight">O(k)</span> for the heap.',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.markDone([heapN3id, heapN2childId]),
  ops.setText(status.id, "Answer: 5 (2nd largest). O(n log k) time, O(k) space"),
  ops.setText("lres", "kth largest: 5")
));

const v = viz(
  {
    algorithm: "kth_largest_element",
    title: "Kth Largest Element — Min-Heap Approach",
    description: "Find the kth largest element by maintaining a min-heap of size k. The heap root always gives the kth largest seen so far.",
    category: "heap",
    difficulty: "intermediate",
    complexity: { time: "O(n log k)", space: "O(k)" },
    input: "Array: [3, 2, 1, 5, 6, 4], k = 2",
  },
  [arr, title, status, kLabel, resultLabel],
  steps,
  { canvas: { height: 570 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
