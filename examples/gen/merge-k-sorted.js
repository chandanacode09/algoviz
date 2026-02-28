// Merge K Sorted Lists using Min-Heap — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input: 3 sorted lists ───
const list1 = [1, 4, 7];
const list2 = [2, 5, 8];
const list3 = [3, 6, 9];

// Layout: 3 horizontal arrays at different y positions
const arr1 = layout.array(list1, { y: 100, prefix: "a", cellWidth: 55 });
const arr2 = layout.array(list2, { y: 180, prefix: "b", cellWidth: 55 });
const arr3 = layout.array(list3, { y: 260, prefix: "c", cellWidth: 55 });

// Output merged array (starts empty, filled with "")
const outputInit = Array(9).fill("");
const outArr = layout.array(outputInit, { y: 470, prefix: "o", cellWidth: 55 });

const title = titleLabel("Merge K Sorted Lists (Min-Heap)");
const status = statusLabel("");

const lbl1 = label("List 1: [1, 4, 7]", 140, 75, { id: "ll1", fontSize: 14, fontWeight: "bold", anchor: "start", fill: "$primary" });
const lbl2 = label("List 2: [2, 5, 8]", 140, 155, { id: "ll2", fontSize: 14, fontWeight: "bold", anchor: "start", fill: "$primary" });
const lbl3 = label("List 3: [3, 6, 9]", 140, 235, { id: "ll3", fontSize: 14, fontWeight: "bold", anchor: "start", fill: "$primary" });
const outLbl = label("Merged Output", 500, 445, { id: "lout", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$success" });
const heapLbl = label("Min-Heap: []", 500, 350, { id: "lheap", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$warning" });

const steps = [];

// Pointers for each list
const ptr1 = pointer("p1", arr1.id(0), "below", { id: "ptr1" });
const ptr2 = pointer("p2", arr2.id(0), "below", { id: "ptr2" });
const ptr3 = pointer("p3", arr3.id(0), "below", { id: "ptr3" });

// ─── Setup ───
steps.push(annotatedStep(
  "Merge 3 sorted lists into one sorted list using a min-heap",
  "initialization",
  {
    narration: 'We have <span class="highlight">3 sorted lists</span>. To merge them efficiently, ' +
      'we use a <span class="warn">min-heap</span> to always find the global minimum across all list heads. ' +
      'This gives us <span class="success">O(N log k)</span> time where N is total elements and k is number of lists.',
    phase: "setup",
  },
  ops.setText(status.id, "3 sorted lists, 9 total elements. Use min-heap to merge.")
));

// Track state: pointers into each list, heap contents
const ptrs = [0, 0, 0]; // current index in each list
const lists = [list1, list2, list3];
const arrHandles = [arr1, arr2, arr3];
const ptrIds = ["ptr1", "ptr2", "ptr3"];
let outIdx = 0;

// Initial heap: add head of each list
steps.push(teach(
  "Initialize heap with head elements from all 3 lists",
  'Insert the <span class="highlight">first element</span> of each list into the min-heap: ' +
    '1 from List 1, 2 from List 2, 3 from List 3. The heap automatically orders them so the ' +
    '<span class="success">minimum (1)</span> is at the top.',
  ops.highlight(arr1.id(0), "$warning"),
  ops.highlight(arr2.id(0), "$warning"),
  ops.highlight(arr3.id(0), "$warning"),
  ops.setText(heapLbl.id, "Min-Heap: [1, 2, 3]"),
  ops.setText(status.id, "Heap initialized with heads: [1, 2, 3]")
));

steps.push(step("Heap ready, begin extraction",
  ops.reset(arr1.id(0)),
  ops.reset(arr2.id(0)),
  ops.reset(arr3.id(0))
));

// Simulate the merge process
// Heap state: array of {value, listIdx}
// We manually simulate heap operations since we know the sorted inputs
// Order of extraction: 1(L1), 2(L2), 3(L3), 4(L1), 5(L2), 6(L3), 7(L1), 8(L2), 9(L3)
const extractionOrder = [
  { val: 1, listIdx: 0, heapAfter: "[2, 3, 4]" },
  { val: 2, listIdx: 1, heapAfter: "[3, 4, 5]" },
  { val: 3, listIdx: 2, heapAfter: "[4, 5, 6]" },
  { val: 4, listIdx: 0, heapAfter: "[5, 6, 7]" },
  { val: 5, listIdx: 1, heapAfter: "[6, 7, 8]" },
  { val: 6, listIdx: 2, heapAfter: "[7, 8, 9]" },
  { val: 7, listIdx: 0, heapAfter: "[8, 9]" },
  { val: 8, listIdx: 1, heapAfter: "[9]" },
  { val: 9, listIdx: 2, heapAfter: "[]" },
];

for (let i = 0; i < extractionOrder.length; i++) {
  const { val, listIdx, heapAfter } = extractionOrder[i];
  const listNum = listIdx + 1;
  const srcIdx = ptrs[listIdx];
  const srcArr = arrHandles[listIdx];

  // Step: extract min from heap, highlight the source
  if (i === 0) {
    steps.push(teach(
      `Extract min=${val} from heap (from List ${listNum})`,
      'The heap gives us the <span class="success">global minimum</span> in O(log k). ' +
        `We extract <span class="highlight">${val}</span> from List ${listNum} and place it in the output. ` +
        'Then we advance that list\'s pointer and push the next element into the heap.',
      ops.highlight(srcArr.id(srcIdx), "$success"),
      ops.setValue(outArr.id(outIdx), val),
      ops.highlight(outArr.id(outIdx), "$success"),
      ops.setText(heapLbl.id, "Min-Heap: " + heapAfter),
      ops.setText(status.id, `Extract ${val} from List ${listNum} → output[${outIdx}]`)
    ));
  } else {
    const isTeachStep = (i === 3 || i === 6);
    if (isTeachStep) {
      const teachMsg = i === 3
        ? 'Each extraction is <span class="highlight">O(log k)</span> — the heap maintains order automatically. ' +
          `Extracting <span class="success">${val}</span> from List ${listNum}.`
        : 'We have now processed 2 complete lists\' worth of elements. ' +
          `Extracting <span class="success">${val}</span>. ` +
          'When a list is exhausted, the heap simply shrinks.';
      steps.push(teach(
        `Extract min=${val} from heap (from List ${listNum})`,
        teachMsg,
        ops.highlight(srcArr.id(srcIdx), "$success"),
        ops.setValue(outArr.id(outIdx), val),
        ops.highlight(outArr.id(outIdx), "$success"),
        ops.setText(heapLbl.id, "Min-Heap: " + heapAfter),
        ops.setText(status.id, `Extract ${val} from List ${listNum} → output[${outIdx}]`)
      ));
    } else {
      steps.push(step(
        `Extract min=${val} from heap (from List ${listNum})`,
        ops.highlight(srcArr.id(srcIdx), "$success"),
        ops.setValue(outArr.id(outIdx), val),
        ops.highlight(outArr.id(outIdx), "$success"),
        ops.setText(heapLbl.id, "Min-Heap: " + heapAfter),
        ops.setText(status.id, `Extract ${val} from List ${listNum} → output[${outIdx}]`)
      ));
    }
  }

  // Advance pointer and mark source done
  const resetActions = [
    ops.markDone(srcArr.id(srcIdx)),
    ops.reset(outArr.id(outIdx)),
  ];

  ptrs[listIdx]++;

  // Move pointer if not exhausted
  if (ptrs[listIdx] < lists[listIdx].length) {
    resetActions.push(ops.movePointer(ptrIds[listIdx], srcArr.id(ptrs[listIdx])));
  }

  steps.push(step(
    `Advance List ${listNum} pointer${ptrs[listIdx] >= lists[listIdx].length ? " (list exhausted)" : ""}`,
    ...resetActions
  ));

  outIdx++;
}

// ─── Teach: heap gives O(log k) ───
steps.push(teach(
  "Merge complete! Heap gives us the global minimum in O(log k)",
  'The min-heap always holds at most <span class="highlight">k elements</span> (one per list). ' +
    'Each extract-min and insert is <span class="warn">O(log k)</span>. ' +
    'With N total elements, the overall complexity is <span class="success">O(N log k)</span>. ' +
    'This is much better than the naive O(Nk) approach of scanning all list heads.',
  ops.markDone(outArr.ids),
  ops.setText(status.id, "Merged: [1,2,3,4,5,6,7,8,9] — O(N log k) time")
));

const v = viz(
  {
    algorithm: "merge_k_sorted_lists",
    title: "Merge K Sorted Lists — Min-Heap",
    description: "Merge k sorted lists into one sorted list using a min-heap to efficiently select the global minimum.",
    category: "heap",
    difficulty: "advanced",
    complexity: { time: "O(N log k)", space: "O(k)" },
    input: "Lists: [1,4,7], [2,5,8], [3,6,9]",
  },
  [arr1, arr2, arr3, outArr, title, status, lbl1, lbl2, lbl3, outLbl, heapLbl, ptr1, ptr2, ptr3],
  steps,
  { canvas: { height: 550 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
