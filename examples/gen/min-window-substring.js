// Minimum Window Substring — Sliding Window visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const str = "ADOBECODEBANC";
const target = "ABC";
const chars = str.split("");
const arr = layout.array(chars, { cellWidth: 50, cellHeight: 50, gap: 6 });
const title = titleLabel("Minimum Window Substring");
const status = statusLabel("");
const targetLabel = label(`Target: "${target}"`, 500, 80, {
  id: "targetlbl", fontSize: 16, fill: "$text",
});
const windowLabel = label("Window: none", 500, 530, {
  id: "winlbl", fontSize: 14, fill: "$text",
});
const leftPtr = pointer("L", arr.id(0), "below", { id: "pl" });
const rightPtr = pointer("R", arr.id(0), "below", { id: "pr" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Find the minimum window in "${str}" containing all characters of "${target}"`,
  "initialization",
  {
    narration: 'The <span class="highlight">Minimum Window Substring</span> problem: find the smallest contiguous ' +
      'substring of S that contains all characters of T. We use a <span class="warn">sliding window</span> with ' +
      'two pointers: <span class="highlight">R</span> expands right to include characters, ' +
      '<span class="highlight">L</span> shrinks from the left to minimize the window. ' +
      'A frequency map tracks how many target characters are in the current window.',
    phase: "setup",
  },
  ops.setText(status.id, `S = "${str}", T = "${target}" — find smallest window containing all of T`)
));

// Build target frequency map
const targetFreq = {};
for (const ch of target) {
  targetFreq[ch] = (targetFreq[ch] || 0) + 1;
}

// Sliding window algorithm
const windowFreq = {};
let have = 0;
const need = Object.keys(targetFreq).length; // number of unique chars we need
let left = 0;
let bestLeft = -1;
let bestRight = -1;
let bestLen = Infinity;

steps.push(teach(
  `Target frequency: ${Object.entries(targetFreq).map(([k, v]) => `${k}:${v}`).join(", ")}. Need ${need} unique characters.`,
  `We need these characters with their frequencies: ` +
    `<span class="highlight">${Object.entries(targetFreq).map(([k, v]) => `${k}:${v}`).join(", ")}</span>. ` +
    `We track how many of these requirements are fully satisfied ("have"). ` +
    `When <span class="success">have == need (${need})</span>, the window is valid.`,
  ops.highlight(arr.id(0), "$primary"),
  ops.movePointer("pl", arr.id(0)),
  ops.movePointer("pr", arr.id(0)),
  ops.setText(status.id, `Need ${need} unique chars: ${Object.entries(targetFreq).map(([k, v]) => `${k}:${v}`).join(", ")}`)
));

// Reset the initial highlight
steps.push(step(
  "Begin expanding right pointer",
  ops.reset(arr.id(0)),
));

for (let right = 0; right < chars.length; right++) {
  const ch = chars[right];

  // Add character to window
  windowFreq[ch] = (windowFreq[ch] || 0) + 1;

  // Check if this character satisfies a target requirement
  let justSatisfied = false;
  if (targetFreq[ch] && windowFreq[ch] === targetFreq[ch]) {
    have++;
    justSatisfied = true;
  }

  const isTargetChar = !!targetFreq[ch];
  steps.push(teach(
    `R=${right}: add '${ch}' to window. have=${have}/${need}`,
    `Expand R to index <span class="highlight">${right}</span>, character '<span class="highlight">${ch}</span>'. ` +
      (isTargetChar
        ? (justSatisfied
            ? `This satisfies the requirement for '${ch}'! <span class="success">have = ${have}/${need}</span>.`
            : `'${ch}' is a target character but we ${windowFreq[ch] > targetFreq[ch] ? "already have enough" : `need ${targetFreq[ch]} total, have ${windowFreq[ch]}`}.`)
        : `'${ch}' is not in the target — it won't affect our count.`),
    ops.highlight(arr.id(right), isTargetChar ? "$primary" : "$muted"),
    ops.movePointer("pr", arr.id(right)),
    ops.setText("winlbl", `Window: "${str.slice(left, right + 1)}" [${left}..${right}]`),
    ops.setText(status.id, `R=${right} '${ch}': have=${have}/${need}`)
  ));

  // While window is valid, try to shrink from left
  while (have === need) {
    // Record this valid window
    const windowLen = right - left + 1;
    const improved = windowLen < bestLen;
    if (improved) {
      bestLen = windowLen;
      bestLeft = left;
      bestRight = right;
    }

    steps.push(annotatedStep(
      `Valid window [${left}..${right}] = "${str.slice(left, right + 1)}" (length ${windowLen})${improved ? " — new best!" : ""}`,
      "invariant",
      {
        narration: `<span class="success">Window is valid!</span> "${str.slice(left, right + 1)}" contains all target characters. ` +
          `Length = <span class="highlight">${windowLen}</span>. ` +
          (improved
            ? `This is the <span class="success">new minimum</span>! Previous best: ${bestLen === windowLen ? "none" : bestLen}.`
            : `Current best is still ${bestLen} (from index ${bestLeft}).`) +
          ` Now we try to <span class="warn">shrink from the left</span> to find an even smaller valid window.`,
        phase: "main-loop",
      },
      ops.highlight(arr.ids.slice(left, right + 1), "$success"),
      ops.setText(status.id, `Valid! [${left}..${right}] len=${windowLen}${improved ? " NEW BEST" : ""}`)
    ));

    // Remove leftmost character
    const leftCh = chars[left];
    const wasTarget = !!targetFreq[leftCh];
    windowFreq[leftCh]--;

    let justLost = false;
    if (targetFreq[leftCh] && windowFreq[leftCh] < targetFreq[leftCh]) {
      have--;
      justLost = true;
    }

    steps.push(teach(
      `Shrink: remove '${leftCh}' at L=${left}. have=${have}/${need}`,
      `<span class="warn">Shrink left:</span> remove '<span class="highlight">${leftCh}</span>' at index ${left}. ` +
        (justLost
          ? `We no longer have enough '${leftCh}' — <span class="danger">have drops to ${have}/${need}</span>. Window is now invalid.`
          : wasTarget
            ? `Still have enough '${leftCh}' (${windowFreq[leftCh]}/${targetFreq[leftCh]}). Window may still be valid.`
            : `'${leftCh}' was not a target character, no effect on validity.`),
      ops.highlight(arr.id(left), "$danger"),
      ops.setText(status.id, `Shrink L=${left} '${leftCh}': have=${have}/${need}`)
    ));

    left++;
    steps.push(step(
      `Move L to ${left}`,
      ops.movePointer("pl", arr.id(Math.min(left, chars.length - 1))),
      ops.reset(arr.ids.slice(0, left)),
      ops.setText("winlbl", `Window: "${str.slice(left, right + 1)}" [${left}..${right}]`)
    ));
  }
}

// ─── Cleanup ───
if (bestLeft >= 0) {
  const bestStr = str.slice(bestLeft, bestRight + 1);
  steps.push(annotatedStep(
    `Minimum window: "${bestStr}" [${bestLeft}..${bestRight}], length ${bestLen}`,
    "explanation",
    {
      narration: `<span class="success">Answer: "${bestStr}"</span> (indices ${bestLeft} to ${bestRight}, length ${bestLen}). ` +
        `The sliding window technique processes each character at most twice (once by R, once by L), ` +
        `giving <span class="highlight">O(|S| + |T|)</span> time. ` +
        `Space: <span class="highlight">O(|S| + |T|)</span> for the frequency maps. ` +
        `This two-pointer approach avoids the O(n^2) brute-force of checking every substring.`,
      phase: "cleanup",
    },
    ops.reset(arr.ids),
    ops.markDone(arr.ids.slice(bestLeft, bestRight + 1)),
    ops.setText(status.id, `Answer: "${bestStr}" [${bestLeft}..${bestRight}], length ${bestLen}`),
    ops.setText("winlbl", `Minimum window: "${bestStr}"`)
  ));
} else {
  steps.push(annotatedStep(
    "No valid window found",
    "explanation",
    { phase: "cleanup" },
    ops.setText(status.id, "No valid window exists")
  ));
}

const v = viz(
  {
    algorithm: "min_window_substring",
    title: "Minimum Window Substring",
    description: "Find the smallest window in a string containing all characters of a target using the sliding window + frequency map approach.",
    category: "string",
    difficulty: "intermediate",
    complexity: { time: "O(|S| + |T|)", space: "O(|S| + |T|)" },
    input: `S = "${str}", T = "${target}"`,
  },
  [arr, title, status, targetLabel, windowLabel, leftPtr, rightPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
