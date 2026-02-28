// Prefix Sum Subarray — find subarray with target sum using hash map
// Uses prefix sums and hash map to find complement
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const values = [1, 2, 3, -2, 5];
const target = 3;

// Input array
const arr = layout.array(values, { y: 130, prefix: "a" });

// Prefix sum array (one extra element for prefix[0]=0)
const prefixValues = [0];
let runningSum = 0;
for (const v of values) {
  runningSum += v;
  prefixValues.push(runningSum);
}
const prefixArr = layout.array(
  prefixValues.map(() => ""),
  { y: 310, prefix: "p", cellWidth: 50, gap: 6 }
);

const title = titleLabel("Subarray Sum Equals K");
const status = statusLabel("", undefined, 560);
const arrLabel = label("Input Array", 500, 100, { id: "albl", fontSize: 16, fontWeight: "bold" });
const prefixLabel = label("Prefix Sums", 500, 280, { id: "plbl", fontSize: 16, fontWeight: "bold" });
const hashLabel = label("Hash Map: {}", 500, 430, { id: "hlbl", fontSize: 14, fill: "$text" });
const countLabel = label("Count: 0", 500, 460, { id: "clbl", fontSize: 16, fontWeight: "bold", fill: "$success" });

const scanPtr = pointer("j", arr.id(0), "above", { id: "pj" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Find the number of subarrays with sum = ${target}`,
  "initialization",
  {
    narration: 'We want to count <span class="highlight">contiguous subarrays</span> whose elements sum to ' +
      `<span class="success">${target}</span>. The key insight: if prefix[j] - prefix[i] = k, ` +
      'then the subarray from index i+1 to j has sum k. ' +
      'We use a <span class="warn">hash map</span> to store how many times each prefix sum has occurred.',
    phase: "setup",
  },
  ops.setText(status.id, `Input: [${values.join(", ")}], target sum = ${target}`)
));

steps.push(teach(
  "Key idea: if prefix[j] - prefix[i] = k, subarray i+1..j has sum k",
  'The <span class="highlight">prefix sum</span> at index j is the sum of elements 0..j. ' +
    'If prefix[j] - prefix[i] = <span class="warn">k</span>, then the subarray from ' +
    '<span class="highlight">i+1 to j</span> has sum exactly k. ' +
    'So at each j, we look for the <span class="warn">complement</span>: prefix[j] - k in our hash map.',
  ops.setText(status.id, "prefix[j] - prefix[i] = k means subarray(i+1..j) sums to k")
));

// ─── Build prefix sums ───
steps.push(teach(
  "First, compute all prefix sums",
  'We compute prefix sums: prefix[0] = 0, prefix[i] = prefix[i-1] + arr[i-1]. ' +
    `For [${values.join(", ")}], prefix sums are [${prefixValues.join(", ")}].`,
  ops.setValue(prefixArr.id(0), 0),
  ops.highlight(prefixArr.id(0), "$primary"),
  ops.setText(status.id, "Computing prefix sums... prefix[0] = 0")
));

let ps = 0;
for (let i = 0; i < values.length; i++) {
  ps += values[i];

  steps.push(step(`prefix[${i + 1}] = prefix[${i}] + ${values[i]} = ${ps}`,
    ops.highlight(arr.id(i), "$warning"),
    ops.setValue(prefixArr.id(i + 1), ps),
    ops.highlight(prefixArr.id(i + 1), "$primary"),
    ops.reset(prefixArr.id(i)),
    ...(i > 0 ? [ops.reset(arr.id(i - 1))] : []),
    ops.setText(status.id, `prefix[${i + 1}] = ${ps}`)
  ));
}

steps.push(step("All prefix sums computed",
  ops.reset(arr.id(values.length - 1)),
  ops.reset(prefixArr.id(values.length)),
  ops.setText(status.id, `Prefix sums: [${prefixValues.join(", ")}]`)
));

// ─── Scan with hash map ───
steps.push(teach(
  "Now scan prefix sums, using hash map to find complements",
  'Initialize hash map with {0: 1} (empty prefix). For each prefix[j], ' +
    `check if (prefix[j] - ${target}) exists in the map. ` +
    'If so, we found subarrays ending at j.',
  ops.setText("hlbl", "Hash Map: {0: 1}"),
  ops.setText(status.id, "Scanning with hash map: {0: 1}")
));

const prefixCount = { 0: 1 };
let totalCount = 0;

for (let j = 1; j <= values.length; j++) {
  const pj = prefixValues[j];
  const complement = pj - target;
  const found = prefixCount[complement] || 0;

  steps.push(teach(
    `j=${j}: prefix[${j}]=${pj}, complement=${pj}-${target}=${complement}, found=${found} time(s)`,
    `At j=<span class="highlight">${j}</span>: prefix[${j}] = <span class="warn">${pj}</span>. ` +
      `Complement = ${pj} - ${target} = <span class="highlight">${complement}</span>. ` +
      (found > 0
        ? `The complement <span class="success">${complement}</span> appears ${found} time(s) in our map — ` +
          `that means ${found} subarray(s) ending here sum to ${target}!`
        : `Complement <span class="danger">${complement}</span> is not in the map — no matching subarray ending here.`),
    ops.movePointer("pj", arr.id(j - 1)),
    ops.highlight(prefixArr.id(j), "$warning"),
    ops.highlight(arr.id(j - 1), "$warning"),
    ops.setText(status.id, `j=${j}: prefix=${pj}, need ${complement}, found=${found}`)
  ));

  if (found > 0) {
    totalCount += found;
    steps.push(step(`Found ${found} subarray(s)! Total count = ${totalCount}`,
      ops.highlight(prefixArr.id(j), "$success"),
      ops.setText("clbl", `Count: ${totalCount}`),
      ops.setText(status.id, `Found! Count is now ${totalCount}`)
    ));
  }

  // Add current prefix sum to map
  prefixCount[pj] = (prefixCount[pj] || 0) + 1;
  const mapStr = Object.entries(prefixCount).map(([k, v]) => `${k}:${v}`).join(", ");

  steps.push(step(`Add prefix[${j}]=${pj} to map`,
    ops.reset(prefixArr.id(j)),
    ops.reset(arr.id(j - 1)),
    ops.setText("hlbl", `Hash Map: {${mapStr}}`),
    ops.setText(status.id, `Updated map: {${mapStr}}`)
  ));
}

// ─── Result ───
steps.push(annotatedStep(
  `Found ${totalCount} subarray(s) with sum = ${target}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> There are <span class="success">${totalCount}</span> ` +
      `contiguous subarrays that sum to <span class="highlight">${target}</span>. ` +
      'The prefix sum + hash map approach runs in ' +
      '<span class="highlight">O(n) time</span> and <span class="highlight">O(n) space</span>. ' +
      'Much better than the brute-force O(n^2) approach!',
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.markDone(prefixArr.ids),
  ops.setText("clbl", `Count: ${totalCount}`),
  ops.setText(status.id, `Result: ${totalCount} subarrays sum to ${target}`)
));

const v = viz(
  {
    algorithm: "prefix_sum_subarray",
    title: "Subarray Sum Equals K",
    description: "Count subarrays with a given sum using prefix sums and hash map lookups.",
    category: "hashing",
    difficulty: "intermediate",
    complexity: { time: "O(n)", space: "O(n)" },
    input: `Array: [${values.join(", ")}], target = ${target}`,
  },
  [arr, prefixArr, title, status, arrLabel, prefixLabel, hashLabel, countLabel, scanPtr],
  steps,
  { canvas: { height: 560 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
