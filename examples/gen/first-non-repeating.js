// First Non-Repeating Character — two-pass hash approach
// Educational visualization with teach() explaining the strategy
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const str = "aabcbdef";
const chars = str.split("");

// Top row: the string characters
const strArr = layout.array(chars, { y: 180, prefix: "s" });

// Bottom row: frequency counter for relevant characters
// Show only the unique chars that appear: a, b, c, d, e, f
const uniqueChars = [...new Set(chars)];
const freqArr = layout.array(
  uniqueChars.map(() => 0),
  { y: 380, prefix: "f", sublabels: false }
);

// Add char labels above each frequency cell
const charLabels = uniqueChars.map((ch, i) => {
  const freqActor = freqArr.actors[i];
  return label(ch, freqActor.x + freqActor.width / 2, 355, {
    id: `fl${i}`,
    fontSize: 14,
    fontWeight: "bold",
    fill: "$text",
  });
});

const title = titleLabel("First Non-Repeating Character");
const status = statusLabel("", undefined, 520);
const strLabel = label("Input String", 500, 145, { id: "slbl", fontSize: 16, fontWeight: "bold" });
const freqLabel = label("Frequency Count", 500, 335, { id: "flbl", fontSize: 16, fontWeight: "bold" });

// Pointer for scanning
const scanPtr = pointer("scan", strArr.id(0), "above", { id: "pscan" });

const steps = [];

// Helper: find the index of a char in our uniqueChars array
function charIdx(ch) {
  return uniqueChars.indexOf(ch);
}

// ─── Setup ───
steps.push(annotatedStep(
  `Find the first non-repeating character in "${str}"`,
  "initialization",
  {
    narration: 'We want to find the <span class="highlight">first character</span> in the string that ' +
      'appears <span class="success">exactly once</span>. Our plan: ' +
      '<span class="warn">Pass 1</span> — scan the string and count how many times each character appears. ' +
      '<span class="warn">Pass 2</span> — scan again and find the first character with count = 1. ' +
      'This is the <span class="highlight">two-pass hash approach</span>.',
    phase: "setup",
  },
  ops.setText(status.id, `String: "${str}" | Find the first character that appears only once`)
));

// ─── Pass 1: Count frequencies ───
steps.push(teach(
  "Pass 1: Scan the string and count each character's frequency",
  '<span class="warn">Pass 1</span>: We walk through the string from left to right. ' +
    'For each character, we add 1 to its counter. ' +
    'Think of it like a <span class="highlight">tally chart</span> — one tick mark for each time we see a letter.',
  ops.setText(status.id, "Pass 1: Counting frequencies...")
));

const freq = {};
uniqueChars.forEach(ch => { freq[ch] = 0; });

for (let i = 0; i < chars.length; i++) {
  const ch = chars[i];
  freq[ch]++;
  const fi = charIdx(ch);

  steps.push(teach(
    `Read '${ch}' at index ${i}: count['${ch}'] becomes ${freq[ch]}`,
    `Reading character <span class="highlight">'${ch}'</span> at index ${i}. ` +
      `Increment its count: <span class="warn">${freq[ch] - 1} → ${freq[ch]}</span>. ` +
      (freq[ch] > 1
        ? `This character has appeared <span class="warn">${freq[ch]} times</span> — it repeats!`
        : `So far, <span class="success">'${ch}' has appeared only once</span>.`),
    ops.movePointer("pscan", strArr.id(i)),
    ops.highlight(strArr.id(i), "$warning"),
    ops.highlight(freqArr.id(fi), "$warning"),
    ops.setValue(freqArr.id(fi), freq[ch]),
    ops.setText(status.id, `Pass 1: index ${i}, char '${ch}', count = ${freq[ch]}`)
  ));

  // Reset highlights
  steps.push(step(`Done counting '${ch}'`,
    ops.reset(strArr.id(i)),
    ops.reset(freqArr.id(fi))
  ));
}

// Show all frequencies
steps.push(annotatedStep(
  "Pass 1 complete! All frequencies counted.",
  "explanation",
  {
    narration: '<span class="success">Pass 1 done!</span> Here are the counts: ' +
      uniqueChars.map(ch => `'${ch}'=${freq[ch]}`).join(", ") + ". " +
      'Now we know exactly how many times each character appears. ' +
      'Characters with count = 1 are <span class="success">non-repeating</span>.',
    phase: "main-loop",
  },
  ...uniqueChars.map((ch, i) =>
    ops.highlight(freqArr.id(i), freq[ch] === 1 ? "$success" : "$muted")
  ).flat(),
  ops.setText(status.id, "Pass 1 done! Counts: " + uniqueChars.map(ch => `${ch}=${freq[ch]}`).join(", "))
));

// ─── Pass 2: Find first non-repeating ───
steps.push(teach(
  "Pass 2: Scan string again, find the first character with count = 1",
  '<span class="warn">Pass 2</span>: Walk through the string again, left to right. ' +
    'For each character, check its count. ' +
    'The <span class="success">first character with count 1</span> is our answer!',
  ops.reset(freqArr.ids),
  ops.setText(status.id, "Pass 2: Finding first non-repeating character...")
));

let foundIdx = -1;
for (let i = 0; i < chars.length; i++) {
  const ch = chars[i];
  const fi = charIdx(ch);
  const isNonRepeating = freq[ch] === 1;

  steps.push(teach(
    `Check '${ch}' at index ${i}: count = ${freq[ch]}${isNonRepeating ? " — found it!" : " — repeats, skip"}`,
    `Checking <span class="highlight">'${ch}'</span> at index ${i}. ` +
      `Its count is <span class="warn">${freq[ch]}</span>. ` +
      (isNonRepeating
        ? `Count is 1 — <span class="success">'${ch}' is the first non-repeating character!</span>`
        : `Count is ${freq[ch]} (more than 1), so '${ch}' repeats. Move on.`),
    ops.movePointer("pscan", strArr.id(i)),
    ops.highlight(strArr.id(i), isNonRepeating ? "$success" : "$danger"),
    ops.highlight(freqArr.id(fi), isNonRepeating ? "$success" : "$danger"),
    ops.setText(status.id, `Pass 2: '${ch}' count=${freq[ch]}${isNonRepeating ? " — FOUND!" : " — skip"}`)
  ));

  if (isNonRepeating) {
    foundIdx = i;
    break;
  }

  // Reset and continue
  steps.push(step(`'${ch}' repeats, continue searching`,
    ops.reset(strArr.id(i)),
    ops.reset(freqArr.id(fi))
  ));
}

// ─── Cleanup ───
const answer = foundIdx >= 0 ? chars[foundIdx] : "none";
steps.push(annotatedStep(
  `Answer: '${answer}' at index ${foundIdx} is the first non-repeating character!`,
  "explanation",
  {
    narration: `<span class="success">Found it!</span> The first non-repeating character is ` +
      `<span class="success">'${answer}'</span> at index ${foundIdx}. ` +
      'The two-pass approach uses a <span class="highlight">hash map</span> (or frequency array) ' +
      'to count in <span class="highlight">O(n)</span>, then scans once more in <span class="highlight">O(n)</span>. ' +
      'Total: <span class="highlight">O(n) time, O(1) space</span> (since there are at most 26 letters).',
    phase: "cleanup",
  },
  ops.markDone(strArr.id(foundIdx)),
  ops.markDone(freqArr.id(charIdx(answer))),
  ops.setText(status.id, `Result: '${answer}' at index ${foundIdx} is the first non-repeating character`)
));

const v = viz(
  {
    algorithm: "first_non_repeating_char",
    title: "First Non-Repeating Character",
    description: "Find the first character that appears exactly once using a two-pass frequency counting approach.",
    category: "hashing",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: `String: "${str}"`,
  },
  [strArr, freqArr, title, status, strLabel, freqLabel, scanPtr, ...charLabels],
  steps,
  { canvas: { height: 520 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
