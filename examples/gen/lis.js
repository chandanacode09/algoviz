// Longest Increasing Subsequence — DP with two arrays
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const nums = [10, 9, 2, 5, 3, 7, 101, 18];
const n = nums.length;

// ─── Layout: input array ───
const arr = layout.array(nums, { y: 180, prefix: "a", cellWidth: 65 });

// ─── Layout: DP array (all start at 1) ───
const dpInit = Array(n).fill(1);
const dpArr = layout.array(dpInit, { y: 320, prefix: "d", cellWidth: 65 });

const title = titleLabel("Longest Increasing Subsequence");
const status = statusLabel("");
const arrLabel = label("Input Array", 500, 150, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const dpLabel = label("DP Array: LIS length ending at index i", 500, 290, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const iPtr = pointer("i", arr.id(0), "above", { id: "pi" });

// Track actual dp values
const dp = Array(n).fill(1);

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "LIS: find the length of the longest strictly increasing subsequence",
  "initialization",
  {
    narration: '<span class="highlight">Longest Increasing Subsequence (LIS)</span>: ' +
      'Given an array, find the length of the longest subsequence where each element is ' +
      '<span class="warn">strictly greater</span> than the previous one. ' +
      'dp[i] = length of the longest increasing subsequence that <span class="highlight">ends at index i</span>. ' +
      'Every element is at least a subsequence of length 1 by itself.',
    phase: "setup",
  },
  ops.setText(status.id, `Input: [${nums.join(", ")}] — find LIS length`)
));

// ─── Main DP loop ───
steps.push(teach(
  "For each element, look back at all smaller elements and extend the best",
  'For each index i, we scan all indices j < i. ' +
    'If <span class="highlight">nums[j] < nums[i]</span>, we can extend the subsequence ending at j by appending nums[i]. ' +
    'So dp[i] = max(dp[i], dp[j] + 1). We try all j and keep the best.',
  ops.setText(status.id, "For each i: scan j < i, if nums[j] < nums[i], dp[i] = max(dp[i], dp[j]+1)")
));

for (let i = 1; i < n; i++) {
  // Highlight current element
  steps.push(step(`Consider nums[${i}] = ${nums[i]}`,
    ops.highlight(arr.id(i), "$warning"),
    ops.highlight(dpArr.id(i), "$warning"),
    ops.movePointer("pi", arr.id(i)),
    ops.setText(status.id, `i=${i}: nums[${i}]=${nums[i]}, scanning j=0..${i-1}`)
  ));

  let improved = false;

  for (let j = 0; j < i; j++) {
    if (nums[j] < nums[i]) {
      const candidate = dp[j] + 1;
      const isBetter = candidate > dp[i];

      steps.push(teach(
        `j=${j}: nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]} → dp[${j}]+1 = ${candidate}${isBetter ? " (new best!)" : ""}`,
        `<span class="highlight">nums[${j}]=${nums[j]}</span> < nums[${i}]=${nums[i]}, so we can extend. ` +
          `dp[${j}]+1 = ${dp[j]}+1 = <span class="${isBetter ? "success" : "warn"}">${candidate}</span>` +
          (isBetter ? ` — better than current dp[${i}]=${dp[i]}!` : ` — not better than current dp[${i}]=${dp[i]}.`),
        ops.highlight(arr.id(j), "$primary"),
        ops.highlight(dpArr.id(j), "$primary"),
        ops.setText(status.id, `nums[${j}]=${nums[j]} < ${nums[i]}: dp[${j}]+1=${candidate}${isBetter ? " ★" : ""}`)
      ));

      if (isBetter) {
        dp[i] = candidate;
        improved = true;
        steps.push(step(`Update dp[${i}] = ${dp[i]}`,
          ops.setValue(dpArr.id(i), dp[i]),
          ops.highlight(dpArr.id(i), "$success"),
          ops.reset(arr.id(j)),
          ops.reset(dpArr.id(j)),
        ));
      } else {
        steps.push(step(`No improvement, reset`,
          ops.reset(arr.id(j)),
          ops.reset(dpArr.id(j)),
        ));
      }
    } else {
      steps.push(step(
        `j=${j}: nums[${j}]=${nums[j]} >= nums[${i}]=${nums[i]} — skip`,
        ops.highlight(arr.id(j), "$danger"),
        ops.setText(status.id, `nums[${j}]=${nums[j]} >= ${nums[i]} — cannot extend`)
      ));

      steps.push(step(`Reset j=${j}`,
        ops.reset(arr.id(j)),
      ));
    }
  }

  if (!improved) {
    steps.push(step(`dp[${i}] stays at ${dp[i]} (no smaller element found or no improvement)`,
      ops.setValue(dpArr.id(i), dp[i]),
      ops.reset(dpArr.id(i)),
      ops.reset(arr.id(i)),
    ));
  } else {
    steps.push(step(`Finalize dp[${i}] = ${dp[i]}`,
      ops.reset(dpArr.id(i)),
      ops.reset(arr.id(i)),
    ));
  }
}

// ─── Find the answer ───
const lisLength = Math.max(...dp);
const lisIndex = dp.indexOf(lisLength);

steps.push(annotatedStep(
  `LIS length = ${lisLength} (max of dp array)`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> The LIS length is <span class="success">${lisLength}</span>, ` +
      `found at dp[${lisIndex}]. ` +
      `For input [${nums.join(", ")}], one longest increasing subsequence has ${lisLength} elements. ` +
      'Time: <span class="highlight">O(n^2)</span>, Space: <span class="highlight">O(n)</span>. ' +
      'A faster O(n log n) approach uses patience sorting, but the DP solution is more intuitive.',
    phase: "cleanup",
  },
  ops.highlight(dpArr.id(lisIndex), "$success"),
  ops.markDone(arr.ids),
  ops.setText(status.id, `LIS length = ${lisLength} — O(n²) time, O(n) space`)
));

const v = viz(
  {
    algorithm: "lis",
    title: "Longest Increasing Subsequence",
    description: "Find the length of the longest strictly increasing subsequence using dynamic programming.",
    category: "dynamic-programming",
    difficulty: "intermediate",
    complexity: { time: "O(n²)", space: "O(n)" },
    input: `nums = [${nums.join(", ")}]`,
  },
  [arr, dpArr, title, status, arrLabel, dpLabel, iPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
