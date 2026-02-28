// Hash Table with Open Addressing (Linear Probing)
// Insert keys into a hash table, resolve collisions with linear probing
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const TABLE_SIZE = 7;
const keys = [10, 22, 31, 4, 15];

// Hash table array (initially empty)
const table = layout.array(
  Array(TABLE_SIZE).fill(""),
  { y: 250, prefix: "h" }
);

// Slot index labels below the table
const slotLabels = [];
for (let i = 0; i < TABLE_SIZE; i++) {
  const actor = table.actors[i];
  slotLabels.push(label(`slot ${i}`, actor.x + actor.width / 2, actor.y + actor.height + 20, {
    id: `sl${i}`,
    fontSize: 11,
    fill: "$muted",
  }));
}

const title = titleLabel("Hash Table — Open Addressing");
const status = statusLabel("");
const hashLabel = label("h(k) = k % 7", 500, 100, {
  id: "hlbl",
  fontSize: 18,
  fontWeight: "bold",
  fill: "$primary",
});
const probeLabel = label("", 500, 140, {
  id: "plbl",
  fontSize: 14,
  fill: "$text",
});

const probePtr = pointer("probe", table.id(0), "above", { id: "pprobe" });

const steps = [];

// Track what is in each slot
const slots = Array(TABLE_SIZE).fill(null);

function hashFn(k) {
  return k % TABLE_SIZE;
}

// ─── Setup ───
steps.push(annotatedStep(
  "Hash table with linear probing — insert keys into a table of size 7",
  "initialization",
  {
    narration: 'A <span class="highlight">hash table</span> maps keys to indices using a hash function. ' +
      'When two keys hash to the <span class="danger">same slot</span> (a collision), ' +
      '<span class="warn">linear probing</span> resolves it by checking the next slot, ' +
      'then the next, until an empty slot is found. ' +
      `Hash function: <span class="highlight">h(k) = k % ${TABLE_SIZE}</span>.`,
    phase: "setup",
  },
  ops.setText(status.id, `Insert keys [${keys.join(", ")}] into table of size ${TABLE_SIZE}`)
));

// ─── Insert each key ───
for (let ki = 0; ki < keys.length; ki++) {
  const key = keys[ki];
  const idealSlot = hashFn(key);

  steps.push(teach(
    `Insert key ${key}: h(${key}) = ${key} % ${TABLE_SIZE} = ${idealSlot}`,
    `Inserting <span class="highlight">${key}</span>. ` +
      `Hash: h(${key}) = ${key} % ${TABLE_SIZE} = <span class="warn">${idealSlot}</span>. ` +
      `Let's check if slot ${idealSlot} is available.`,
    ops.movePointer("pprobe", table.id(idealSlot)),
    ops.highlight(table.id(idealSlot), "$warning"),
    ops.setText("plbl", `h(${key}) = ${key} % ${TABLE_SIZE} = ${idealSlot}`),
    ops.setText(status.id, `Insert ${key}: ideal slot = ${idealSlot}`)
  ));

  // Linear probing
  let probeIdx = idealSlot;
  let probeCount = 0;
  const probeSequence = [idealSlot];

  while (slots[probeIdx] !== null) {
    // Collision!
    steps.push(teach(
      `Slot ${probeIdx} is occupied by ${slots[probeIdx]} — collision! Probe next.`,
      `Slot <span class="danger">${probeIdx}</span> already contains ` +
        `<span class="danger">${slots[probeIdx]}</span>. ` +
        `<span class="warn">Collision!</span> Linear probing: try the next slot ` +
        `(${probeIdx} + 1) % ${TABLE_SIZE} = ${(probeIdx + 1) % TABLE_SIZE}.`,
      ops.highlight(table.id(probeIdx), "$danger"),
      ops.setText(status.id, `Collision at slot ${probeIdx} (has ${slots[probeIdx]}), probing...`)
    ));

    probeIdx = (probeIdx + 1) % TABLE_SIZE;
    probeCount++;
    probeSequence.push(probeIdx);

    steps.push(step(`Probe slot ${probeIdx}`,
      ops.movePointer("pprobe", table.id(probeIdx)),
      ops.highlight(table.id(probeIdx), "$warning"),
      ops.reset(table.id((probeIdx - 1 + TABLE_SIZE) % TABLE_SIZE)),
      ops.setText(status.id, `Probing slot ${probeIdx}...`)
    ));
  }

  // Found empty slot — insert
  slots[probeIdx] = key;

  const probeMsg = probeCount > 0
    ? ` after ${probeCount} probe${probeCount > 1 ? "s" : ""} (sequence: ${probeSequence.join(" -> ")})`
    : " (no collision)";

  steps.push(teach(
    `Slot ${probeIdx} is empty — insert ${key} here${probeMsg}`,
    `Slot <span class="success">${probeIdx}</span> is empty! ` +
      `Insert <span class="success">${key}</span> here` +
      (probeCount > 0
        ? `. Probe sequence: <span class="warn">${probeSequence.join(" -> ")}</span> ` +
          `(${probeCount} collision${probeCount > 1 ? "s" : ""} resolved).`
        : `. Direct insertion — <span class="success">no collision</span>.`),
    ops.setValue(table.id(probeIdx), key),
    ops.markDone(table.id(probeIdx)),
    ops.setText("plbl", probeCount > 0 ? `Probes: ${probeSequence.join(" -> ")}` : "Direct insert"),
    ops.setText(status.id, `Inserted ${key} at slot ${probeIdx}${probeMsg}`)
  ));

  // Reset for next key
  if (ki < keys.length - 1) {
    steps.push(step("Reset highlights for next insertion",
      ops.reset(table.ids),
      // Re-mark filled slots
      ...slots.map((s, i) => s !== null ? ops.markDone(table.id(i)) : []).flat()
    ));
  }
}

// ─── Final state ───
steps.push(annotatedStep(
  `All ${keys.length} keys inserted! Final table state shown.`,
  "explanation",
  {
    narration: `<span class="success">All keys inserted!</span> Final table: ` +
      slots.map((s, i) => `slot ${i}=${s === null ? "empty" : s}`).join(", ") + ". " +
      'Linear probing is simple but can cause <span class="warn">clustering</span> — ' +
      'groups of filled slots that make future insertions slower. ' +
      'Average case: <span class="highlight">O(1)</span> insert/lookup. ' +
      'Worst case: <span class="highlight">O(n)</span> when table is nearly full.',
    phase: "cleanup",
  },
  ops.markDone(table.ids.filter((_, i) => slots[i] !== null)),
  ops.setText("plbl", "All keys inserted successfully"),
  ops.setText(status.id, `Final: [${slots.map(s => s === null ? "_" : s).join(", ")}]`)
));

const v = viz(
  {
    algorithm: "hash_open_addressing",
    title: "Hash Table — Open Addressing (Linear Probing)",
    description: "Insert keys into a hash table using linear probing to resolve collisions.",
    category: "hashing",
    difficulty: "intermediate",
    complexity: { time: "O(1) avg, O(n) worst", space: "O(n)" },
    input: `Keys: [${keys.join(", ")}], Table size: ${TABLE_SIZE}, h(k) = k % ${TABLE_SIZE}`,
  },
  [table, title, status, hashLabel, probeLabel, probePtr, ...slotLabels],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
