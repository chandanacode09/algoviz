// KMP String Search — failure function + pattern matching
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const text = "ABABDABABCABAB";
const pattern = "ABABC";
const tLen = text.length;
const pLen = pattern.length;

// ─── Layout: text array ───
const textArr = layout.array(text.split(""), { y: 160, prefix: "t", cellWidth: 50 });

// ─── Layout: pattern array ───
const patArr = layout.array(pattern.split(""), { y: 300, prefix: "p", cellWidth: 50 });

// ─── Layout: failure function array ───
const failInit = Array(pLen).fill("");
const failArr = layout.array(failInit, { y: 440, prefix: "f", cellWidth: 50 });

const title = titleLabel("KMP String Search");
const status = statusLabel("");
const textLabel = label(`Text: "${text}"`, 500, 125, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const patLabel = label(`Pattern: "${pattern}"`, 500, 265, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const failLabel = label("Failure Function (lps)", 500, 410, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const tiPtr = pointer("ti", textArr.id(0), "above", { id: "pti" });
const piPtr = pointer("pi", patArr.id(0), "below", { id: "ppi" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "KMP: search for pattern in text without backtracking",
  "initialization",
  {
    narration: '<span class="highlight">KMP (Knuth-Morris-Pratt)</span> searches for a pattern in a text ' +
      'in O(n+m) time. The key insight: when a mismatch occurs, we already know some characters in the text ' +
      'match a prefix of the pattern. The <span class="warn">failure function</span> (also called lps array) ' +
      'tells us how far to shift the pattern so we <span class="highlight">never backtrack in the text</span>.',
    phase: "setup",
  },
  ops.setText(status.id, `KMP Search: pattern "${pattern}" in text "${text}"`)
));

// ─── Phase 1: Build failure function ───
steps.push(teach(
  "Phase 1: Build the failure function (longest proper prefix that is also a suffix)",
  'The failure function lps[i] stores the length of the longest <span class="highlight">proper prefix</span> ' +
    'of pattern[0..i] that is also a <span class="highlight">suffix</span>. ' +
    'This tells us where to resume matching after a mismatch. lps[0] is always 0.',
  ops.setText(status.id, "Phase 1: Building failure function...")
));

const lps = Array(pLen).fill(0);

// lps[0] = 0 always
steps.push(step("lps[0] = 0 (single character has no proper prefix/suffix)",
  ops.setValue(failArr.id(0), 0),
  ops.highlight(failArr.id(0), "$success"),
  ops.setText(status.id, "lps[0] = 0 (base case)")
));
steps.push(step("Reset lps[0]", ops.reset(failArr.id(0))));

let len = 0;  // length of the previous longest prefix suffix
let i = 1;

while (i < pLen) {
  if (pattern[i] === pattern[len]) {
    len++;
    lps[i] = len;

    steps.push(teach(
      `lps[${i}]: pattern[${i}]='${pattern[i]}' == pattern[${len-1}]='${pattern[len-1]}' → lps[${i}] = ${len}`,
      `<span class="success">Match!</span> pattern[${i}]='${pattern[i]}' equals pattern[${len-1}]='${pattern[len-1]}'. ` +
        `The prefix "${pattern.substring(0, len)}" is also a suffix of "${pattern.substring(0, i+1)}". ` +
        `So <span class="success">lps[${i}] = ${len}</span>.`,
      ops.setValue(failArr.id(i), lps[i]),
      ops.highlight(failArr.id(i), "$success"),
      ops.highlight(patArr.id(i), "$primary"),
      ops.highlight(patArr.id(len - 1), "$primary"),
      ops.setText(status.id, `lps[${i}] = ${len}: "${pattern.substring(0, len)}" is prefix and suffix`)
    ));

    steps.push(step(`Reset highlights`,
      ops.reset(failArr.id(i)),
      ops.reset(patArr.id(i)),
      ops.reset(patArr.id(len - 1)),
    ));

    i++;
  } else {
    if (len !== 0) {
      steps.push(step(
        `lps[${i}]: pattern[${i}]='${pattern[i]}' != pattern[${len}]='${pattern[len]}' — fall back via lps[${len-1}]=${lps[len-1]}`,
        ops.highlight(patArr.id(i), "$danger"),
        ops.highlight(patArr.id(len), "$danger"),
        ops.setText(status.id, `Mismatch at len=${len}: fall back to lps[${len-1}]=${lps[len-1]}`)
      ));

      steps.push(step(`Reset mismatch highlights`,
        ops.reset(patArr.id(i)),
        ops.reset(patArr.id(len)),
      ));

      len = lps[len - 1];
    } else {
      lps[i] = 0;

      steps.push(step(
        `lps[${i}]: pattern[${i}]='${pattern[i]}' != pattern[0]='${pattern[0]}', len=0 → lps[${i}] = 0`,
        ops.setValue(failArr.id(i), 0),
        ops.highlight(failArr.id(i), "$warning"),
        ops.setText(status.id, `lps[${i}] = 0: no prefix matches suffix`)
      ));

      steps.push(step(`Reset lps[${i}]`, ops.reset(failArr.id(i))));

      i++;
    }
  }
}

// Show completed failure function
const markFailDoneActions = [];
for (let k = 0; k < pLen; k++) {
  markFailDoneActions.push(ops.markDone(failArr.id(k)));
}
steps.push(step("Failure function complete",
  ...markFailDoneActions,
  ops.setText(status.id, `lps = [${lps.join(", ")}] — ready to search!`)
));

// ─── Phase 2: KMP matching ───
steps.push(teach(
  "Phase 2: Search text using the failure function — never backtrack in text!",
  'Now we scan the text left-to-right, comparing with the pattern. ' +
    'On a <span class="success">match</span>, both pointers advance. ' +
    'On a <span class="danger">mismatch</span>, we use the failure function to shift the pattern — ' +
    'the text pointer <span class="highlight">never moves backward</span>. This is why KMP is O(n+m).',
  ops.setText(status.id, "Phase 2: KMP matching — text pointer never backtracks!")
));

let ti = 0; // text index
let pi = 0; // pattern index
const matches = [];

while (ti < tLen) {
  // Show current comparison
  steps.push(step(
    `Compare text[${ti}]='${text[ti]}' with pattern[${pi}]='${pattern[pi]}'`,
    ops.highlight(textArr.id(ti), "$warning"),
    ops.highlight(patArr.id(pi), "$warning"),
    ops.movePointer("pti", textArr.id(ti)),
    ops.movePointer("ppi", patArr.id(pi)),
    ops.setText(status.id, `text[${ti}]='${text[ti]}' vs pattern[${pi}]='${pattern[pi]}'`)
  ));

  if (text[ti] === pattern[pi]) {
    steps.push(step(`Match: '${text[ti]}' == '${pattern[pi]}' — advance both`,
      ops.highlight(textArr.id(ti), "$success"),
      ops.highlight(patArr.id(pi), "$success"),
      ops.setText(status.id, `Match! Advance text and pattern pointers`)
    ));

    steps.push(step(`Reset match highlights`,
      ops.reset(textArr.id(ti)),
      ops.reset(patArr.id(pi)),
    ));

    ti++;
    pi++;

    if (pi === pLen) {
      // Full match found!
      const matchStart = ti - pLen;
      matches.push(matchStart);

      const matchHighlights = [];
      for (let k = matchStart; k < ti; k++) {
        matchHighlights.push(ops.markDone(textArr.id(k)));
      }

      steps.push(teach(
        `Pattern found at index ${matchStart}!`,
        `<span class="success">Full match!</span> Pattern "${pattern}" found at text position ` +
          `<span class="success">${matchStart}</span> (indices ${matchStart} to ${ti - 1}). ` +
          `Now we use lps[${pLen - 1}]=${lps[pLen - 1]} to continue searching for more matches ` +
          `without backtracking in the text.`,
        ...matchHighlights,
        ops.setText(status.id, `Pattern found at index ${matchStart}! Continue searching...`)
      ));

      pi = lps[pLen - 1];
    }
  } else {
    // Mismatch
    steps.push(step(`Mismatch: '${text[ti]}' != '${pattern[pi]}'`,
      ops.highlight(textArr.id(ti), "$danger"),
      ops.highlight(patArr.id(pi), "$danger"),
      ops.setText(status.id, `Mismatch at text[${ti}] vs pattern[${pi}]`)
    ));

    if (pi !== 0) {
      const oldPi = pi;
      pi = lps[pi - 1];

      steps.push(teach(
        `Use lps[${oldPi - 1}]=${pi} to shift pattern — text pointer stays at ${ti}`,
        `Instead of starting over, we use the failure function: <span class="highlight">lps[${oldPi - 1}] = ${pi}</span>. ` +
          `We know that pattern[0..${pi - 1}] already matches text, so we shift the pattern and ` +
          `<span class="success">keep the text pointer at ${ti}</span>. No backtracking!`,
        ops.reset(textArr.id(ti)),
        ops.reset(patArr.id(oldPi)),
        ops.setText(status.id, `Shift pattern: pi = lps[${oldPi-1}] = ${pi}, ti stays at ${ti}`)
      ));
    } else {
      steps.push(step(
        `pi=0, no fallback — advance text pointer to ${ti + 1}`,
        ops.reset(textArr.id(ti)),
        ops.reset(patArr.id(pi)),
        ops.setText(status.id, `pi=0: advance text pointer to ${ti + 1}`)
      ));
      ti++;
    }
  }
}

// ─── Final answer ───
steps.push(annotatedStep(
  `KMP complete: ${matches.length} match${matches.length !== 1 ? "es" : ""} found at ${matches.length > 0 ? "index " + matches.join(", ") : "no positions"}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> Found <span class="success">${matches.length} match${matches.length !== 1 ? "es" : ""}</span> ` +
      (matches.length > 0 ? `at position${matches.length > 1 ? "s" : ""} ${matches.join(", ")}. ` : ". ") +
      'KMP never backtracks in the text, so total work is ' +
      '<span class="highlight">O(n + m)</span> — linear in the combined length of text and pattern. ' +
      'The failure function is the key: it encodes the pattern\'s self-similarity.',
    phase: "cleanup",
  },
  ops.setText(status.id, `KMP: ${matches.length} match${matches.length !== 1 ? "es" : ""} — O(n+m) time, O(m) space`)
));

const v = viz(
  {
    algorithm: "kmp_search",
    title: "KMP String Search",
    description: "Search for a pattern in text using the Knuth-Morris-Pratt algorithm with failure function.",
    category: "string",
    difficulty: "intermediate",
    complexity: { time: "O(n+m)", space: "O(m)" },
    input: `text="${text}", pattern="${pattern}"`,
  },
  [textArr, patArr, failArr, title, status, textLabel, patLabel, failLabel, tiPtr, piPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
