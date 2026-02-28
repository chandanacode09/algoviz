// Palindrome Check — two-pointer technique with teach() for educational narration
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Setup the word to check
const word = "racecar";
const chars = word.split("");
const arr = layout.array(chars);
const title = titleLabel("Palindrome Check");
const status = statusLabel("");
const leftPtr = pointer("L", arr.id(0), "below", { id: "pl" });
const rightPtr = pointer("R", arr.id(chars.length - 1), "above", { id: "pr" });

const steps = [];

// ─── Setup phase ───
steps.push(annotatedStep(
  `Check if "${word}" is a palindrome using two pointers`,
  "initialization",
  {
    narration: 'A <span class="highlight">palindrome</span> is a word that reads the same forwards and backwards. ' +
      'Think of it like a mirror — the left side matches the right side! ' +
      'We use <span class="warn">two pointers</span>: one starts at the left end (L=0), ' +
      `the other at the right end (R=${chars.length - 1}). If every pair matches, it's a palindrome.`,
    phase: "setup",
  },
  ops.setText(status.id, `Word: "${word}" — L=0, R=${chars.length - 1}`)
));

// ─── Main comparison loop ───
let left = 0;
let right = chars.length - 1;
let comparisonCount = 0;

while (left < right) {
  comparisonCount++;
  const lChar = chars[left];
  const rChar = chars[right];
  const match = lChar === rChar;

  // Highlight the two cells being compared
  steps.push(teach(
    `Step ${comparisonCount}: compare '${lChar}' at index ${left} with '${rChar}' at index ${right}`,
    `Looking at the two ends: <span class="highlight">'${lChar}'</span> (position ${left}) and ` +
      `<span class="highlight">'${rChar}'</span> (position ${right}). ` +
      (match
        ? `They are the <span class="success">same letter</span>! We can move both pointers inward.`
        : `They are <span class="danger">different</span> — this word is NOT a palindrome.`),
    ops.highlight([arr.id(left), arr.id(right)], "$warning"),
    ops.movePointer("pl", arr.id(left)),
    ops.movePointer("pr", arr.id(right)),
    ops.setText(status.id, `Compare: '${lChar}' (L=${left}) vs '${rChar}' (R=${right})`)
  ));

  if (match) {
    // Mark the matched pair green
    steps.push(annotatedStep(
      `'${lChar}' == '${rChar}' — match! Move pointers inward.`,
      "invariant",
      {
        narration: `<span class="success">Match!</span> Both positions have '<span class="success">${lChar}</span>'. ` +
          `So far so good — every pair we checked is a mirror image. ` +
          `<span class="highlight">Invariant</span>: all characters from index 0..${left} match their mirrors at ${right}..${chars.length - 1}.`,
        phase: "main-loop",
      },
      ops.markDone([arr.id(left), arr.id(right)]),
    ));

    left++;
    right--;
  } else {
    // Mismatch — not a palindrome
    steps.push(annotatedStep(
      `'${lChar}' != '${rChar}' — NOT a palindrome!`,
      "boundary",
      {
        narration: `<span class="danger">Mismatch!</span> '${lChar}' does not equal '${rChar}'. ` +
          `We can stop right away — the word is <span class="danger">not a palindrome</span>.`,
        phase: "main-loop",
      },
      ops.highlight([arr.id(left), arr.id(right)], "$danger"),
    ));
    break;
  }
}

// Handle the middle character for odd-length strings
if (left === right) {
  steps.push(teach(
    `Middle character '${chars[left]}' at index ${left} — no pair needed`,
    `The middle letter '<span class="highlight">${chars[left]}</span>' sits right in the center. ` +
      `It has no partner to compare with — a single letter is always a palindrome by itself!`,
    ops.markDone(arr.id(left)),
    ops.movePointer("pl", arr.id(left)),
    ops.movePointer("pr", arr.id(left)),
  ));
}

// ─── Result ───
steps.push(annotatedStep(
  `"${word}" IS a palindrome!`,
  "explanation",
  {
    narration: `<span class="success">Yes, "${word}" is a palindrome!</span> ` +
      `We checked ${comparisonCount} pairs and every one matched. ` +
      `The two-pointer trick is fast: we only look at each character once, ` +
      `so it runs in <span class="highlight">O(n)</span> time and uses ` +
      `<span class="highlight">O(1)</span> extra space (just the two pointers).`,
    phase: "cleanup",
  },
  ops.markDone(arr.ids),
  ops.setText(status.id, `"${word}" is a palindrome! (${comparisonCount} comparisons)`)
));

const v = viz(
  {
    algorithm: "palindrome_check",
    title: "Palindrome Check — Two Pointers",
    description: "Check if a string is a palindrome by comparing characters from both ends moving inward.",
    category: "string",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: `Word: "${word}"`,
  },
  [arr, title, status, leftPtr, rightPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
