// Selection Sort — generated using primitives prompt
const {
  layout, ops, step, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("../../dist/src/index");

resetIds();

const arr = layout.array([64, 25, 12, 22, 11]);
const title = titleLabel("Selection Sort");
const status = statusLabel("");
const minPtr = pointer("min", arr.id(0), "below", { id: "pmin" });

const steps = [];
const n = arr.values.length;

for (let i = 0; i < n - 1; i++) {
  let minIdx = i;

  steps.push(step(`Pass ${i + 1}: find minimum in unsorted region [${i}..${n - 1}]`,
    ops.highlight(arr.id(i), "$primary"),
    ops.movePointer("pmin", arr.id(i)),
    ops.setText(status.id, `Current minimum: ${arr.values[i]} at index ${i}`)
  ));

  for (let j = i + 1; j < n; j++) {
    const isSmaller = arr.values[j] < arr.values[minIdx];

    steps.push(step(`Compare arr[${j}]=${arr.values[j]} with min=${arr.values[minIdx]}`,
      ops.highlight(arr.id(j), "$warning"),
      ops.setText(status.id, `${arr.values[j]} ${isSmaller ? "<" : "≥"} ${arr.values[minIdx]}`)
    ));

    if (isSmaller) {
      steps.push(step(`New minimum: ${arr.values[j]}`,
        ops.reset(arr.id(minIdx)),
        ops.highlight(arr.id(j), "$primary"),
        ops.movePointer("pmin", arr.id(j)),
      ));
      minIdx = j;
    } else {
      steps.push(step(`Not smaller, continue`,
        ops.reset(arr.id(j))
      ));
    }
  }

  if (minIdx !== i) {
    steps.push(step(`Swap arr[${i}]=${arr.values[i]} with arr[${minIdx}]=${arr.values[minIdx]}`,
      ops.swap(arr, i, minIdx, "$danger"),
    ));
  }

  steps.push(step(`Index ${i} sorted: ${arr.values[i]}`,
    ops.markDone(arr.id(i)),
  ));
}

steps.push(step("Array fully sorted!",
  ops.markDone(arr.id(n - 1)),
  ops.setText(status.id, `Done! [${arr.values.join(", ")}]`)
));

const v = viz(
  {
    algorithm: "selection_sort",
    title: "Selection Sort",
    category: "sorting",
    difficulty: "beginner",
    complexity: { time: "O(n²)", space: "O(1)" },
    input: `Array: [64, 25, 12, 22, 11]`,
  },
  [arr, title, status, minPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
