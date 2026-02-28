// House Robber — dynamic programming with include/exclude decisions
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const houses = [2, 7, 9, 3, 1];
const n = houses.length;

// ─── Layout: houses on top, DP table below ───
const arr = layout.array(houses, { y: 150, prefix: "h" });
const dp = layout.array(Array(n).fill(0), { y: 350, prefix: "d" });

const title = titleLabel("House Robber");
const status = statusLabel("");
const arrLabel = label("Houses (money inside)", 500, 120, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const dpLabel = label("DP Table (max money up to house i)", 500, 320, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const curPtr = pointer("i", arr.id(0), "above", { id: "pcur" });

const steps = [];

// Track DP values
const dpValues = Array(n).fill(0);

// ─── Setup ───
steps.push(annotatedStep(
  "The House Robber Problem: rob houses for max money, but never two in a row",
  "initialization",
  {
    narration: '<span class="highlight">The House Robber Problem</span>: You are a robber planning to rob houses along a street. ' +
      'Each house has some money inside. But there is a catch — ' +
      '<span class="warn">you cannot rob two houses that are next to each other</span> ' +
      '(the alarm system will go off). What is the most money you can steal?',
    phase: "setup",
  },
  ops.setText(status.id, `Houses: [${houses.join(", ")}] — no two adjacent!`)
));

steps.push(annotatedStep(
  "Recurrence: dp[i] = max(dp[i-1], dp[i-2] + houses[i])",
  "explanation",
  {
    narration: 'At each house, you have two choices: ' +
      '<span class="success">SKIP it</span> (keep the best total from the previous house) or ' +
      '<span class="warn">ROB it</span> (take this house\'s money + best total from two houses back). ' +
      'The formula is: <span class="highlight">dp[i] = max(dp[i-1], dp[i-2] + houses[i])</span>. ' +
      'dp[i] stores the maximum money you can get considering houses 0 through i.',
    phase: "setup",
  },
  ops.setText(status.id, "dp[i] = max(skip, rob) = max(dp[i-1], dp[i-2] + houses[i])")
));

// ─── Base case: house 0 ───
dpValues[0] = houses[0];
steps.push(annotatedStep(
  `Base case: dp[0] = houses[0] = ${houses[0]}`,
  "boundary",
  {
    narration: `<span class="highlight">Base case</span>: With only the first house, there is no choice — just rob it! ` +
      `<span class="success">dp[0] = ${houses[0]}</span>.`,
    phase: "main-loop",
  },
  ops.highlight(arr.id(0), "$success"),
  ops.movePointer("pcur", arr.id(0)),
  ops.setValue(dp.id(0), dpValues[0]),
  ops.highlight(dp.id(0), "$success"),
  ops.setText(status.id, `dp[0] = houses[0] = ${houses[0]}`)
));

steps.push(step("Reset highlights",
  ops.reset(arr.id(0)),
  ops.reset(dp.id(0))
));

// ─── Base case: house 1 ───
dpValues[1] = Math.max(houses[0], houses[1]);
const robH1 = houses[1] > houses[0];
steps.push(annotatedStep(
  `Base case: dp[1] = max(houses[0], houses[1]) = max(${houses[0]}, ${houses[1]}) = ${dpValues[1]}`,
  "boundary",
  {
    narration: `With two houses, we pick the one with more money: ` +
      `max(${houses[0]}, ${houses[1]}) = <span class="success">${dpValues[1]}</span>. ` +
      (robH1
        ? `We choose house 1 ($${houses[1]}) over house 0 ($${houses[0]}).`
        : `We choose house 0 ($${houses[0]}) over house 1 ($${houses[1]}).`),
    phase: "main-loop",
  },
  ops.highlight(arr.id(0), robH1 ? "$danger" : "$success"),
  ops.highlight(arr.id(1), robH1 ? "$success" : "$danger"),
  ops.movePointer("pcur", arr.id(1)),
  ops.setValue(dp.id(1), dpValues[1]),
  ops.highlight(dp.id(1), "$success"),
  ops.setText(status.id, `dp[1] = max(${houses[0]}, ${houses[1]}) = ${dpValues[1]}`)
));

steps.push(step("Reset highlights",
  ops.reset(arr.ids),
  ops.reset(dp.id(1))
));

// ─── Main loop: houses 2..n-1 ───
for (let i = 2; i < n; i++) {
  const skipVal = dpValues[i - 1];
  const robVal = dpValues[i - 2] + houses[i];
  const doRob = robVal > skipVal;
  dpValues[i] = Math.max(skipVal, robVal);

  // Show the decision
  steps.push(annotatedStep(
    `House ${i}: skip (keep ${skipVal}) or rob (${dpValues[i - 2]} + ${houses[i]} = ${robVal})?`,
    "decision",
    {
      narration: `At <span class="highlight">house ${i}</span> ($${houses[i]}), we decide: ` +
        `<span class="success">SKIP</span> → keep dp[${i - 1}] = ${skipVal}, or ` +
        `<span class="warn">ROB</span> → dp[${i - 2}] + houses[${i}] = ${dpValues[i - 2]} + ${houses[i]} = ${robVal}. ` +
        (doRob
          ? `Robbing is better! <span class="warn">${robVal} > ${skipVal}</span>.`
          : `Skipping is better! <span class="success">${skipVal} >= ${robVal}</span>.`),
      phase: "main-loop",
    },
    ops.movePointer("pcur", arr.id(i)),
    ops.highlight(arr.id(i), doRob ? "$warning" : "$muted"),
    ops.highlight(dp.id(i - 1), "$primary"),
    ops.highlight(dp.id(i - 2), "$primary"),
    ops.setText(status.id, `skip=${skipVal} vs rob=${dpValues[i - 2]}+${houses[i]}=${robVal} → ${doRob ? "ROB" : "SKIP"}`)
  ));

  // Write the result
  steps.push(teach(
    `dp[${i}] = ${dpValues[i]} (${doRob ? "rob" : "skip"})`,
    doRob
      ? `We <span class="warn">rob house ${i}</span>! dp[${i}] = ${robVal}.`
      : `We <span class="success">skip house ${i}</span>. dp[${i}] = ${skipVal}.`,
    ops.setValue(dp.id(i), dpValues[i]),
    ops.highlight(dp.id(i), doRob ? "$warning" : "$success"),
    ops.highlight(arr.id(i), doRob ? "$warning" : "$muted"),
    ops.reset(dp.id(i - 1)),
    ops.reset(dp.id(i - 2)),
    ops.setText(status.id, `dp[${i}] = ${dpValues[i]}`)
  ));

  steps.push(step("Reset highlights",
    ops.reset(arr.id(i)),
    ops.reset(dp.id(i))
  ));
}

// ─── Final answer ───
steps.push(annotatedStep(
  `Maximum money: dp[${n - 1}] = ${dpValues[n - 1]}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> The answer is dp[${n - 1}] = <span class="success">${dpValues[n - 1]}</span>. ` +
      `That is the most money we can steal without robbing two adjacent houses. ` +
      `This runs in <span class="highlight">O(n)</span> time because we visit each house exactly once, ` +
      `and <span class="highlight">O(n)</span> space for the DP table (can be reduced to O(1) with two variables).`,
    phase: "cleanup",
  },
  ops.markDone(dp.ids),
  ops.highlight(dp.id(n - 1), "$success"),
  ops.setText(status.id, `Answer: $${dpValues[n - 1]} — O(n) time, O(n) space`)
));

const v = viz(
  {
    algorithm: "house_robber",
    title: "House Robber",
    description: "Maximize money stolen from non-adjacent houses using dynamic programming.",
    category: "dynamic-programming",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(n)" },
    input: `Houses: [${houses.join(", ")}]`,
  },
  [arr, dp, title, status, arrLabel, dpLabel, curPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
