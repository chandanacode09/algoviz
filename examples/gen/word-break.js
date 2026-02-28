// Word Break — DP with boolean array showing segmentation
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const word = "leetcode";
const dict = ["leet", "code"];
const chars = word.split("");
const n = word.length;

// ─── Layout: character array ───
const charArr = layout.array(chars, { y: 180, prefix: "c", cellWidth: 60 });

// ─── Layout: boolean DP array (dp[0..n]) ───
// dp[i] = true means the first i characters of word can be segmented
const dpInit = Array(n + 1).fill("F");
dpInit[0] = "T"; // base case
const dpArr = layout.array(dpInit, { y: 350, prefix: "d", cellWidth: 60 });

const title = titleLabel("Word Break");
const status = statusLabel("");
const charLabel = label(`"${word}"`, 500, 145, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const dpLabel = label("dp[i]: can first i characters be segmented?", 500, 315, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const dictLabel = label(`Dictionary: [${dict.map(w => '"' + w + '"').join(", ")}]`, 500, 80, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const iPtr = pointer("i", dpArr.id(0), "below", { id: "pi" });

// Track dp values: dp[i] = can first i chars be segmented?
const dp = Array(n + 1).fill(false);
dp[0] = true;

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Word Break: can "${word}" be segmented using dictionary [${dict.join(", ")}]?`,
  "initialization",
  {
    narration: '<span class="highlight">Word Break Problem</span>: Given a string and a dictionary of words, ' +
      'determine if the string can be segmented into a space-separated sequence of dictionary words. ' +
      'We define <span class="warn">dp[i] = true</span> if the first i characters of the string can be segmented. ' +
      'dp[0] = true (empty string is always valid).',
    phase: "setup",
  },
  ops.setText(status.id, `Word Break: "${word}" with dict [${dict.join(", ")}]`)
));

// ─── Base case ───
steps.push(teach(
  "Base case: dp[0] = T (empty string can always be segmented)",
  'The empty prefix "" is trivially segmentable. ' +
    'So <span class="success">dp[0] = T</span>. All other entries start as F (not yet proven reachable).',
  ops.highlight(dpArr.id(0), "$success"),
  ops.movePointer("pi", dpArr.id(0)),
  ops.setText(status.id, "dp[0] = T (empty string is valid)")
));

steps.push(step("Reset base case highlight",
  ops.reset(dpArr.id(0))
));

// ─── Main DP loop ───
steps.push(teach(
  "For each position i, check if any dictionary word ends here with a valid start",
  'For each position i (1 to ' + n + '), we check every word w in the dictionary. ' +
    'If the substring ending at position i matches w, and <span class="highlight">dp[i - len(w)]</span> is true, ' +
    'then dp[i] = true. This means: "the part before the word was valid, and this word fits right after."',
  ops.setText(status.id, "For each i: check if any dict word ends here with valid prefix")
));

for (let i = 1; i <= n; i++) {
  steps.push(step(`Check position i=${i}`,
    ops.highlight(dpArr.id(i), "$warning"),
    ops.movePointer("pi", dpArr.id(i)),
    ops.setText(status.id, `i=${i}: checking dictionary words...`)
  ));

  let found = false;

  for (const w of dict) {
    const wLen = w.length;
    if (wLen > i) {
      steps.push(teach(
        `Word "${w}" (length ${wLen}) is too long for position ${i} — skip`,
        `"${w}" has ${wLen} characters, but we only have ${i} characters so far. It cannot fit.`,
        ops.setText(status.id, `"${w}" too long for position ${i}`)
      ));
      continue;
    }

    const start = i - wLen;
    const substr = word.substring(start, i);
    const substringMatches = substr === w;
    const prefixValid = dp[start];

    if (substringMatches && prefixValid) {
      // Highlight the matching substring in the char array
      const highlightCharActions = [];
      for (let k = start; k < i; k++) {
        highlightCharActions.push(ops.highlight(charArr.id(k), "$success"));
      }

      steps.push(teach(
        `Word "${w}" matches at [${start}..${i-1}] and dp[${start}]=T → dp[${i}] = T!`,
        `Substring "${substr}" matches dictionary word <span class="success">"${w}"</span>, ` +
          `and <span class="highlight">dp[${start}] = T</span> (the prefix before this word is valid). ` +
          `So <span class="success">dp[${i}] = T</span> — the first ${i} characters can be segmented!`,
        ...highlightCharActions,
        ops.highlight(dpArr.id(start), "$primary"),
        ops.setText(status.id, `"${w}" at [${start}..${i-1}] + dp[${start}]=T → dp[${i}]=T!`)
      ));

      dp[i] = true;
      found = true;

      // Reset char highlights and set dp value
      const resetCharActions = [];
      for (let k = start; k < i; k++) {
        resetCharActions.push(ops.reset(charArr.id(k)));
      }
      steps.push(step(`Set dp[${i}] = T`,
        ops.setValue(dpArr.id(i), "T"),
        ops.highlight(dpArr.id(i), "$success"),
        ops.reset(dpArr.id(start)),
        ...resetCharActions,
      ));
      break; // no need to check other words once we found one
    } else if (substringMatches && !prefixValid) {
      steps.push(teach(
        `Word "${w}" matches at [${start}..${i-1}] but dp[${start}]=F — cannot use`,
        `Substring "${substr}" matches <span class="highlight">"${w}"</span>, ` +
          `but <span class="danger">dp[${start}] = F</span>. The prefix before this word is not valid, ` +
          `so we cannot use this split.`,
        ops.highlight(dpArr.id(start), "$danger"),
        ops.setText(status.id, `"${w}" at [${start}..${i-1}] but dp[${start}]=F — no good`)
      ));

      steps.push(step(`Reset highlight`,
        ops.reset(dpArr.id(start))
      ));
    } else {
      steps.push(step(
        `Word "${w}": substring [${start}..${i-1}]="${substr}" does not match`,
        ops.setText(status.id, `"${substr}" != "${w}" — no match`)
      ));
    }
  }

  if (!found) {
    steps.push(step(`dp[${i}] stays F (no valid segmentation ending here)`,
      ops.reset(dpArr.id(i)),
      ops.setText(status.id, `dp[${i}] = F — no valid segmentation`)
    ));
  } else {
    steps.push(step(`Reset dp[${i}] highlight`,
      ops.reset(dpArr.id(i))
    ));
  }
}

// ─── Final answer ───
const answer = dp[n];
steps.push(annotatedStep(
  `dp[${n}] = ${answer ? "T" : "F"} — "${word}" ${answer ? "CAN" : "CANNOT"} be segmented`,
  "explanation",
  {
    narration: `<span class="${answer ? "success" : "danger"}">${answer ? "Yes" : "No"}!</span> ` +
      `dp[${n}] = <span class="${answer ? "success" : "danger"}">${answer ? "T" : "F"}</span>. ` +
      (answer
        ? `"${word}" can be segmented into dictionary words: e.g. "${dict.join('" + "')}" `
        : `"${word}" cannot be fully segmented using the given dictionary. `) +
      'Time: <span class="highlight">O(n * m * k)</span> where n = string length, m = dictionary size, k = max word length. ' +
      'Space: <span class="highlight">O(n)</span>.',
    phase: "cleanup",
  },
  ops.highlight(dpArr.id(n), answer ? "$success" : "$danger"),
  ops.markDone(charArr.ids),
  ops.setText(status.id, `"${word}" ${answer ? "CAN" : "CANNOT"} be segmented — O(n*m*k) time`)
));

const v = viz(
  {
    algorithm: "word_break",
    title: "Word Break",
    description: "Determine if a string can be segmented into dictionary words using dynamic programming.",
    category: "dynamic-programming",
    difficulty: "intermediate",
    complexity: { time: "O(n×m×k)", space: "O(n)" },
    input: `word="${word}", dict=[${dict.map(w => '"' + w + '"').join(", ")}]`,
  },
  [charArr, dpArr, title, status, charLabel, dpLabel, dictLabel, iPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
