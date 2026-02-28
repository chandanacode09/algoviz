// Anagram Check — frequency counting approach
// Compare character frequencies of two words to determine if they are anagrams
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const word1 = "listen";
const word2 = "silent";
const chars1 = word1.split("");
const chars2 = word2.split("");

// Top row: word1
const arr1 = layout.array(chars1, { y: 140, prefix: "a" });
// Middle row: word2
const arr2 = layout.array(chars2, { y: 300, prefix: "b" });

// Build frequency arrays for the unique characters across both words
const allChars = [...new Set([...chars1, ...chars2])].sort();
const freqArr = layout.array(
  allChars.map(() => 0),
  { y: 470, prefix: "f", cellWidth: 50, gap: 6, sublabels: false }
);

// Char labels above frequency cells
const charLabels = allChars.map((ch, i) => {
  const actor = freqArr.actors[i];
  return label(ch, actor.x + actor.width / 2, 448, {
    id: `fl${i}`,
    fontSize: 14,
    fontWeight: "bold",
    fill: "$text",
  });
});

const title = titleLabel("Anagram Check");
const status = statusLabel("", undefined, 560);
const lbl1 = label(`Word 1: "${word1}"`, 500, 110, { id: "lbl1", fontSize: 16, fontWeight: "bold" });
const lbl2 = label(`Word 2: "${word2}"`, 500, 270, { id: "lbl2", fontSize: 16, fontWeight: "bold" });
const freqLbl = label("Frequency Count", 500, 425, { id: "flbl", fontSize: 16, fontWeight: "bold" });

const scanPtr = pointer("scan", arr1.id(0), "above", { id: "pscan" });

const steps = [];

function charIdx(ch) {
  return allChars.indexOf(ch);
}

// ─── Setup ───
steps.push(annotatedStep(
  `Check if "${word1}" and "${word2}" are anagrams`,
  "initialization",
  {
    narration: 'Two words are <span class="highlight">anagrams</span> if they contain the ' +
      '<span class="success">same characters with the same frequencies</span>. ' +
      'Our plan: <span class="warn">Pass 1</span> — count each character in word1 (increment). ' +
      '<span class="warn">Pass 2</span> — for each character in word2, decrement. ' +
      'If all counts end at zero, they are anagrams!',
    phase: "setup",
  },
  ops.setText(status.id, `Are "${word1}" and "${word2}" anagrams?`)
));

// ─── Pass 1: Count word1 frequencies ───
steps.push(teach(
  "Pass 1: Increment frequency for each character in word1",
  '<span class="warn">Pass 1</span>: Walk through word1 "<span class="highlight">' + word1 + '</span>". ' +
    'For each character, <span class="success">add 1</span> to its counter.',
  ops.setText(status.id, "Pass 1: Counting characters in word1...")
));

const freq = {};
allChars.forEach(ch => { freq[ch] = 0; });

for (let i = 0; i < chars1.length; i++) {
  const ch = chars1[i];
  freq[ch]++;
  const fi = charIdx(ch);

  steps.push(teach(
    `Word1[${i}] = '${ch}': freq['${ch}'] becomes ${freq[ch]}`,
    `Reading <span class="highlight">'${ch}'</span> from word1 at index ${i}. ` +
      `Increment: <span class="warn">${freq[ch] - 1} → ${freq[ch]}</span>.`,
    ops.movePointer("pscan", arr1.id(i)),
    ops.highlight(arr1.id(i), "$warning"),
    ops.highlight(freqArr.id(fi), "$warning"),
    ops.setValue(freqArr.id(fi), freq[ch]),
    ops.setText(status.id, `Pass 1: word1[${i}]='${ch}', freq['${ch}']=${freq[ch]}`)
  ));

  steps.push(step(`Done with '${ch}' in word1`,
    ops.reset(arr1.id(i)),
    ops.reset(freqArr.id(fi))
  ));
}

// ─── Pass 2: Decrement with word2 ───
steps.push(teach(
  "Pass 2: Decrement frequency for each character in word2",
  '<span class="warn">Pass 2</span>: Walk through word2 "<span class="highlight">' + word2 + '</span>". ' +
    'For each character, <span class="danger">subtract 1</span> from its counter. ' +
    'If the words are anagrams, all counts will reach <span class="success">zero</span>.',
  ops.movePointer("pscan", arr2.id(0)),
  ops.setText(status.id, "Pass 2: Decrementing with word2 characters...")
));

for (let i = 0; i < chars2.length; i++) {
  const ch = chars2[i];
  freq[ch]--;
  const fi = charIdx(ch);

  steps.push(teach(
    `Word2[${i}] = '${ch}': freq['${ch}'] becomes ${freq[ch]}`,
    `Reading <span class="highlight">'${ch}'</span> from word2 at index ${i}. ` +
      `Decrement: <span class="warn">${freq[ch] + 1} → ${freq[ch]}</span>.` +
      (freq[ch] === 0
        ? ` Count is now <span class="success">zero</span> — balanced!`
        : ` Count is <span class="warn">${freq[ch]}</span> — not yet balanced.`),
    ops.movePointer("pscan", arr2.id(i)),
    ops.highlight(arr2.id(i), "$primary"),
    ops.highlight(freqArr.id(fi), "$primary"),
    ops.setValue(freqArr.id(fi), freq[ch]),
    ops.setText(status.id, `Pass 2: word2[${i}]='${ch}', freq['${ch}']=${freq[ch]}`)
  ));

  steps.push(step(`Done with '${ch}' in word2`,
    ops.reset(arr2.id(i)),
    ops.reset(freqArr.id(fi))
  ));
}

// ─── Check result ───
const isAnagram = allChars.every(ch => freq[ch] === 0);

steps.push(annotatedStep(
  isAnagram
    ? `"${word1}" and "${word2}" ARE anagrams! All frequencies are zero.`
    : `"${word1}" and "${word2}" are NOT anagrams.`,
  "explanation",
  {
    narration: isAnagram
      ? `<span class="success">Yes, they are anagrams!</span> Every character count returned to zero, ` +
        `meaning both words have exactly the same characters. ` +
        'Time: <span class="highlight">O(n)</span>, space: <span class="highlight">O(1)</span> (26 letters max).'
      : `<span class="danger">Not anagrams</span> — some counts are nonzero.`,
    phase: "cleanup",
  },
  ...allChars.map((ch, i) =>
    ops.highlight(freqArr.id(i), freq[ch] === 0 ? "$success" : "$danger")
  ).flat(),
  ops.markDone(arr1.ids),
  ops.markDone(arr2.ids),
  ops.setText(status.id, isAnagram ? "Result: They ARE anagrams!" : "Result: NOT anagrams")
));

const v = viz(
  {
    algorithm: "anagram_check",
    title: "Anagram Check",
    description: "Determine if two words are anagrams by comparing character frequencies.",
    category: "hashing",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: `Word1: "${word1}", Word2: "${word2}"`,
  },
  [arr1, arr2, freqArr, title, status, lbl1, lbl2, freqLbl, scanPtr, ...charLabels],
  steps,
  { canvas: { height: 560 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
