// Binary Search — generated using primitives prompt
const {
  layout, ops, step, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("../../dist/src/index");

resetIds();

const values = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;

const arr = layout.array(values);
const title = titleLabel("Binary Search");
const status = statusLabel(`Searching for ${target}`);
const lo = pointer("lo", arr.id(0), "below", { id: "plo" });
const hi = pointer("hi", arr.id(values.length - 1), "below", { id: "phi" });
const mid = pointer("mid", arr.id(0), "above", { id: "pmid" });

const steps = [];
let left = 0;
let right = values.length - 1;

while (left <= right) {
  const m = Math.floor((left + right) / 2);

  steps.push(step(`Set mid = (${left} + ${right}) / 2 = ${m}`,
    ops.reset(arr.ids),
    ops.highlight(arr.ids.slice(left, right + 1), "$primary"),
    ops.movePointer("plo", arr.id(left)),
    ops.movePointer("phi", arr.id(right)),
    ops.movePointer("pmid", arr.id(m)),
    ops.highlight(arr.id(m), "$warning"),
    ops.setText(status.id, `mid=${m}, arr[${m}]=${values[m]}`)
  ));

  if (values[m] === target) {
    steps.push(step(`Found! arr[${m}] = ${target}`,
      ops.highlight(arr.id(m), "$success"),
      ops.setText(status.id, `Target ${target} found at index ${m}!`)
    ));
    break;
  } else if (values[m] < target) {
    steps.push(step(`arr[${m}]=${values[m]} < ${target}, search right half`,
      ops.highlight(arr.ids.slice(left, m + 1), "$muted"),
      ops.setText(status.id, `${values[m]} < ${target}, move left to ${m + 1}`)
    ));
    left = m + 1;
  } else {
    steps.push(step(`arr[${m}]=${values[m]} > ${target}, search left half`,
      ops.highlight(arr.ids.slice(m, right + 1), "$muted"),
      ops.setText(status.id, `${values[m]} > ${target}, move right to ${m - 1}`)
    ));
    right = m - 1;
  }
}

steps.push(step("Binary search complete",
  ops.markDone(arr.id(5)),
  ops.setText(status.id, `Result: ${target} is at index 5`)
));

const v = viz(
  {
    algorithm: "binary_search",
    title: "Binary Search",
    category: "searching",
    difficulty: "beginner",
    complexity: { time: "O(log n)", space: "O(1)" },
    input: `Array: [${values.join(", ")}], target: ${target}`,
  },
  [arr, title, status, lo, hi, mid],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
