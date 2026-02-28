// Rabin-Karp String Search — rolling hash pattern matching, educational step-by-step
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input ───
const text = "ABCADABCAB";
const pattern = "ABCAB";
const tLen = text.length;
const pLen = pattern.length;
const BASE = 26;
const MOD = 101;

// Layout: text and pattern arrays
const textArr = layout.array(text.split(""), { y: 120, prefix: "t", cellWidth: 55 });
const patArr = layout.array(pattern.split(""), { y: 300, prefix: "p", cellWidth: 55 });

const title = titleLabel("Rabin-Karp String Search");
const status = statusLabel("");

const textLbl = label(`Text: "${text}"`, 500, 90, { id: "ltxt", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$text" });
const patLbl = label(`Pattern: "${pattern}"`, 500, 270, { id: "lpat", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$text" });
const hashLbl = label("Pattern hash: ?", 500, 380, { id: "lhash", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$primary" });
const winHashLbl = label("Window hash: ?", 500, 410, { id: "lwh", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$warning" });
const resultLbl = label("Matches: none yet", 500, 460, { id: "lres", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$success" });

// Window pointer
const winPtr = pointer("win", textArr.id(0), "above", { id: "pwin" });

const steps = [];

// ─── Hash function: simple polynomial rolling hash ───
function charVal(ch) {
  return ch.charCodeAt(0) - "A".charCodeAt(0);
}

function computeHash(s, start, len) {
  let h = 0;
  for (let i = 0; i < len; i++) {
    h = (h * BASE + charVal(s[start + i])) % MOD;
  }
  return h;
}

// Precompute: pattern hash and h = BASE^(pLen-1) % MOD
const patHash = computeHash(pattern, 0, pLen);
let h = 1;
for (let i = 0; i < pLen - 1; i++) {
  h = (h * BASE) % MOD;
}

// ─── Setup ───
steps.push(annotatedStep(
  "Rabin-Karp: use rolling hash to search for pattern in text",
  "initialization",
  {
    narration: '<span class="highlight">Rabin-Karp</span> uses a <span class="warn">rolling hash</span> to quickly compare ' +
      'pattern with text windows. Instead of comparing characters one by one, we compare hash values. ' +
      'Hash comparison is <span class="success">O(1)</span>. Only when hashes match do we verify character-by-character ' +
      'to handle collisions.',
    phase: "setup",
  },
  ops.setText(status.id, `Rabin-Karp: pattern="${pattern}" in text="${text}", base=${BASE}, mod=${MOD}`)
));

// Compute pattern hash
steps.push(teach(
  `Compute pattern hash: hash("${pattern}") = ${patHash}`,
  'We compute the hash of the pattern using a <span class="highlight">polynomial hash</span>: ' +
    `h = sum(char_value * base^(len-i-1)) mod ${MOD}. ` +
    `For "${pattern}": hash = <span class="success">${patHash}</span>. ` +
    'This hash will be compared against each text window.',
  ops.highlight(patArr.ids, "$primary"),
  ops.setText(hashLbl.id, `Pattern hash: ${patHash}`),
  ops.setText(status.id, `Pattern hash("${pattern}") = ${patHash}`)
));

steps.push(step("Pattern hash computed",
  ops.reset(patArr.ids)
));

// Compute first window hash
const firstWinHash = computeHash(text, 0, pLen);
const firstWinStr = text.substring(0, pLen);

steps.push(step(
  `Compute first window hash: hash("${firstWinStr}") = ${firstWinHash}`,
  ops.highlight(textArr.ids.slice(0, pLen), "$warning"),
  ops.setText(winHashLbl.id, `Window hash: ${firstWinHash}`),
  ops.setText(status.id, `First window "${firstWinStr}": hash = ${firstWinHash}`)
));

steps.push(teach(
  "Hash comparison is O(1), only verify on match",
  'Comparing two hash values takes <span class="success">O(1)</span> time, regardless of pattern length. ' +
    'If hashes differ, we <span class="highlight">skip this window immediately</span>. ' +
    'If hashes match, there might be a <span class="warn">collision</span> (different strings with same hash), ' +
    'so we verify character by character in O(m) time.',
  ops.reset(textArr.ids.slice(0, pLen)),
  ops.setText(status.id, "Key insight: hash comparison O(1), char verification only when hashes match")
));

// Main loop: slide window across text
let winHash = firstWinHash;
const matches = [];

for (let i = 0; i <= tLen - pLen; i++) {
  const winStr = text.substring(i, i + pLen);

  // Highlight current window
  const windowIds = [];
  for (let j = 0; j < pLen; j++) {
    windowIds.push(textArr.id(i + j));
  }

  steps.push(step(
    `Window at index ${i}: "${winStr}", hash=${winHash}`,
    ops.highlight(windowIds, "$warning"),
    ops.movePointer("pwin", textArr.id(i)),
    ops.setText(winHashLbl.id, `Window hash: ${winHash}`),
    ops.setText(status.id, `Window[${i}]="${winStr}" hash=${winHash} vs pattern hash=${patHash}`)
  ));

  if (winHash === patHash) {
    // Hash match — verify character by character
    let verified = true;
    for (let j = 0; j < pLen; j++) {
      if (text[i + j] !== pattern[j]) {
        verified = false;
        break;
      }
    }

    if (verified) {
      matches.push(i);
      steps.push(teach(
        `Hash match at index ${i}! Verify: "${winStr}" == "${pattern}" — confirmed!`,
        `Hash values match: <span class="highlight">${winHash} == ${patHash}</span>. ` +
          'Now verify character by character: ' +
          `<span class="success">"${winStr}" equals "${pattern}"</span>! ` +
          `Pattern found at index <span class="success">${i}</span>.`,
        ops.highlight(windowIds, "$success"),
        ops.highlight(patArr.ids, "$success"),
        ops.setText(resultLbl.id, `Matches: [${matches.join(", ")}]`),
        ops.setText(status.id, `MATCH confirmed at index ${i}!`)
      ));

      steps.push(step("Match confirmed, continue searching",
        ops.markDone(windowIds),
        ops.reset(patArr.ids)
      ));
    } else {
      // Spurious hit (hash collision)
      steps.push(teach(
        `Hash match at index ${i}, but verification fails — spurious hit!`,
        `Hashes match (<span class="warn">${winHash} == ${patHash}</span>), but characters differ: ` +
          `"${winStr}" != "${pattern}". This is a <span class="danger">spurious hit</span> (hash collision). ` +
          'This is why we must always verify on hash match.',
        ops.highlight(windowIds, "$danger"),
        ops.setText(status.id, `SPURIOUS HIT at index ${i}: hash collision!`)
      ));

      steps.push(step("Spurious hit, move on",
        ops.reset(windowIds)
      ));
    }
  } else {
    // No hash match — skip
    steps.push(step(
      `Hash mismatch: ${winHash} != ${patHash} — skip`,
      ops.highlight(windowIds, "$danger"),
      ops.setText(status.id, `${winHash} != ${patHash}: no match, slide window`)
    ));

    steps.push(step("Reset and slide window",
      ops.reset(windowIds)
    ));
  }

  // Compute next window hash (rolling update)
  if (i < tLen - pLen) {
    const oldChar = text[i];
    const newChar = text[i + pLen];
    const oldHash = winHash;
    winHash = ((winHash - charVal(oldChar) * h) * BASE + charVal(newChar)) % MOD;
    if (winHash < 0) winHash += MOD;

    // Only show rolling hash explanation for first roll
    if (i === 0) {
      steps.push(teach(
        `Rolling hash: remove '${oldChar}', add '${newChar}' → hash=${winHash}`,
        'The <span class="highlight">rolling hash</span> updates in O(1): ' +
          `remove the leftmost character '<span class="warn">${oldChar}</span>' and ` +
          `add the new rightmost character '<span class="success">${newChar}</span>'. ` +
          `Formula: hash = (hash - val('${oldChar}') * ${h}) * ${BASE} + val('${newChar}') mod ${MOD} = ` +
          `<span class="success">${winHash}</span>. No need to rehash the entire window!`,
        ops.setText(winHashLbl.id, `Window hash: ${oldHash} → ${winHash}`),
        ops.setText(status.id, `Rolling update: drop '${oldChar}', add '${newChar}', new hash=${winHash}`)
      ));
    } else {
      steps.push(step(
        `Roll hash: remove '${oldChar}', add '${newChar}' → hash=${winHash}`,
        ops.setText(winHashLbl.id, `Window hash: ${winHash}`),
        ops.setText(status.id, `Roll: drop '${oldChar}', add '${newChar}' → hash=${winHash}`)
      ));
    }
  }
}

// ─── Final ───
steps.push(annotatedStep(
  `Rabin-Karp complete: ${matches.length} match${matches.length !== 1 ? "es" : ""} found at index ${matches.join(", ")}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> Found <span class="success">${matches.length} match${matches.length !== 1 ? "es" : ""}</span> ` +
      `at position${matches.length > 1 ? "s" : ""} ${matches.join(", ")}. ` +
      'Rabin-Karp runs in <span class="highlight">O(n + m)</span> expected time ' +
      '(O(nm) worst case with many collisions). The rolling hash makes each window comparison O(1), ' +
      'and we only do expensive O(m) verification on hash matches.',
    phase: "cleanup",
  },
  ops.markDone(textArr.ids),
  ops.setText(status.id, `Rabin-Karp: ${matches.length} match${matches.length !== 1 ? "es" : ""} at [${matches.join(", ")}] — O(n+m) expected`)
));

const v = viz(
  {
    algorithm: "rabin_karp_search",
    title: "Rabin-Karp String Search",
    description: "Search for a pattern in text using rolling hash comparison with character-by-character verification on hash matches.",
    category: "string",
    difficulty: "intermediate",
    complexity: { time: "O(n+m)", space: "O(1)" },
    input: `text="${text}", pattern="${pattern}"`,
  },
  [textArr, patArr, title, status, textLbl, patLbl, hashLbl, winHashLbl, resultLbl, winPtr],
  steps,
  { canvas: { height: 530 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
