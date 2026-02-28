// Two Pointer Technique — Palindrome Check visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Palindrome check on "RACECAR"
const word = "RACECAR";
const chars = word.split("");
const arr = layout.array(chars);
const title = titleLabel("Two-Pointer: Palindrome Check");
const status = statusLabel("");
const leftPtr = pointer("L", arr.id(0), "below", { id: "pl" });
const rightPtr = pointer("R", arr.id(chars.length - 1), "below", { id: "pr" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  `Check if "${word}" is a palindrome using two pointers`,
  "initialization",
  {
    narration: 'The <span class="highlight">two-pointer technique</span> uses two indices that move toward ' +
      'each other. For a <span class="warn">palindrome check</span>, we place one pointer at the start (L) ' +
      'and one at the end (R). At each step, we compare the characters at L and R. ' +
      'If they always match, the string is a palindrome.',
    phase: "setup",
  },
  ops.setText(status.id, `Word: "${word}" — L=0, R=${chars.length - 1}`)
));

// ─── Main loop ───
let left = 0;
let right = chars.length - 1;
let isPalindrome = true;
let stepNum = 0;

while (left < right) {
  stepNum++;
  const lChar = chars[left];
  const rChar = chars[right];
  const match = lChar === rChar;

  // Highlight and compare
  steps.push(teach(
    `Step ${stepNum}: compare arr[${left}]='${lChar}' and arr[${right}]='${rChar}'`,
    `Comparing <span class="highlight">${lChar}</span> (index ${left}) with <span class="highlight">${rChar}</span> (index ${right}). ` +
      (match
        ? `They <span class="success">match</span>! Move both pointers inward.`
        : `They <span class="danger">do not match</span>! The string is NOT a palindrome.`),
    ops.highlight([arr.id(left), arr.id(right)], "$warning"),
    ops.movePointer("pl", arr.id(left)),
    ops.movePointer("pr", arr.id(right)),
    ops.setText(status.id, `Compare: '${lChar}' (L=${left}) vs '${rChar}' (R=${right})`)
  ));

  if (match) {
    // Mark matched pair as success
    steps.push(annotatedStep(
      `'${lChar}' == '${rChar}' — characters match!`,
      "invariant",
      {
        narration: `<span class="success">Match!</span> Characters at positions ${left} and ${right} are both ` +
          `'<span class="success">${lChar}</span>'. The <span class="highlight">invariant</span>: all pairs ` +
          `checked so far have matched, so the substring [${left}..${right}] is still potentially a palindrome.`,
        phase: "main-loop",
      },
      ops.markDone([arr.id(left), arr.id(right)]),
    ));

    left++;
    right--;
  } else {
    isPalindrome = false;
    steps.push(annotatedStep(
      `'${lChar}' != '${rChar}' — NOT a palindrome`,
      "boundary",
      {
        narration: `<span class="danger">Mismatch!</span> '${lChar}' at index ${left} does not equal '${rChar}' at index ${right}. ` +
          `We can immediately conclude: the string is <span class="danger">NOT a palindrome</span>.`,
        phase: "main-loop",
      },
      ops.highlight([arr.id(left), arr.id(right)], "$danger"),
    ));
    break;
  }
}

// Handle middle element for odd-length strings
if (isPalindrome && left === right) {
  steps.push(teach(
    `Middle element '${chars[left]}' at index ${left} — no pair needed`,
    `The middle element '<span class="highlight">${chars[left]}</span>' at index ${left} has no pair to compare. ` +
      `A single character is always a palindrome by itself.`,
    ops.markDone(arr.id(left)),
    ops.movePointer("pl", arr.id(left)),
    ops.movePointer("pr", arr.id(left)),
  ));
}

// ─── Cleanup ───
if (isPalindrome) {
  steps.push(annotatedStep(
    `"${word}" IS a palindrome!`,
    "explanation",
    {
      narration: `<span class="success">Palindrome confirmed!</span> "${word}" reads the same forwards and backwards. ` +
        `The two-pointer technique checked ${stepNum} pairs and all matched. ` +
        `Time: <span class="highlight">O(n/2) = O(n)</span>. Space: <span class="highlight">O(1)</span> — ` +
        `only two index variables. This technique works for any sequence comparison problem ` +
        `where you scan from both ends.`,
      phase: "cleanup",
    },
    ops.markDone(arr.ids),
    ops.setText(status.id, `"${word}" is a palindrome! (${stepNum} comparisons)`)
  ));
} else {
  steps.push(annotatedStep(
    `"${word}" is NOT a palindrome`,
    "explanation",
    {
      narration: `<span class="danger">Not a palindrome.</span> We found a mismatch at step ${stepNum}. ` +
        `Early termination is a benefit of the two-pointer approach.`,
      phase: "cleanup",
    },
    ops.setText(status.id, `"${word}" is NOT a palindrome`)
  ));
}

const v = viz(
  {
    algorithm: "two_pointer_palindrome",
    title: "Two-Pointer: Palindrome Check",
    description: "Using the two-pointer technique to check if a string is a palindrome, comparing characters from both ends moving inward.",
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
