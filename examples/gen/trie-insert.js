// Trie Insertion — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label,
  resetIds, nextId,
} = require("algoviz");

resetIds();

// We will build a trie by inserting "cat", "car", "card"
// Use layout.graph() to create the initial root node, then ops.create() for new nodes/edges

// Start with just a root node using a minimal graph
const g = layout.graph(
  [{ id: "root", value: "*" }],
  [],
  { directed: true, centerX: 500, centerY: 80, radius: 0 }
);

const title = titleLabel("Trie Insertion");
const status = statusLabel("");
const wordLabel = label("Words: []", 500, 550, {
  id: "wordlbl", fontSize: 14, fill: "$text",
});

const steps = [];
const insertedWords = [];

// Node position tracking
// The trie will be laid out as:
//          * (root)  y=80
//         /
//        c            y=180
//        |
//        a            y=280
//       / \
//      t    r         y=380
//           |
//           d         y=480

const nodePositions = {};
nodePositions["root"] = { x: 500, y: 80, actorId: g.nodeId("root") };

// Track which trie nodes exist: key is path like "c", "ca", "cat", etc.
const trieNodes = {};

// ─── Setup ───
steps.push(annotatedStep(
  "Build a Trie by inserting words: cat, car, card",
  "initialization",
  {
    narration: 'A <span class="highlight">Trie</span> (prefix tree) stores strings character by character. ' +
      'Each node represents a character, and paths from root to leaf spell out words. ' +
      'The key insight: words with <span class="warn">common prefixes share nodes</span>. ' +
      'We will insert <span class="highlight">"cat", "car", "card"</span> and watch how the trie grows.',
    phase: "setup",
  },
  ops.highlight(g.nodeId("root"), "$primary"),
  ops.setText(status.id, "Trie root created. Insert: cat, car, card")
));

steps.push(step(
  "Root node ready",
  ops.reset(g.nodeId("root")),
));

// Positions for child nodes - carefully laid out for visual clarity
// Root at (500, 80)
// "c" at (500, 180)
// "ca" at (500, 280)
// "cat" at (380, 380)
// "car" at (620, 380)
// "card" at (620, 480)

const layoutPositions = {
  "c": { x: 500, y: 180 },
  "ca": { x: 500, y: 280 },
  "cat": { x: 380, y: 380 },
  "car": { x: 620, y: 380 },
  "card": { x: 620, y: 480 },
};

function insertWord(word) {
  insertedWords.push(word);

  steps.push(teach(
    `Insert "${word}" into the trie`,
    `Inserting "<span class="highlight">${word}</span>". We traverse from the root, ` +
      `following existing edges when possible, and creating new nodes for characters not yet in the trie.`,
    ops.highlight(g.nodeId("root"), "$primary"),
    ops.setText(status.id, `Inserting "${word}" — start at root`)
  ));

  let prefix = "";
  let parentActorId = g.nodeId("root");

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const newPrefix = prefix + ch;
    const isLastChar = i === word.length - 1;

    if (trieNodes[newPrefix]) {
      // Node already exists — traverse to it
      const existingNodeId = trieNodes[newPrefix].nodeId;
      const existingEdgeId = trieNodes[newPrefix].edgeId;

      steps.push(teach(
        `"${ch}" node already exists at "${newPrefix}" — traverse`,
        `Character '<span class="highlight">${ch}</span>' already has a node in the trie (from a previous word). ` +
          `This is <span class="success">prefix sharing</span> — we reuse the existing node instead of creating a duplicate. ` +
          `Words "${insertedWords.slice(0, -1).filter(w => w.startsWith(newPrefix)).join('", "')}" share this prefix.`,
        ops.highlight(existingNodeId, "$warning"),
        ops.highlightEdge(existingEdgeId, "$warning"),
        ops.setText(status.id, `"${ch}" exists — traverse to "${newPrefix}"`)
      ));

      // Reset highlights
      steps.push(step(
        `At node "${newPrefix}"`,
        ops.reset(existingNodeId),
        ops.resetEdge(existingEdgeId),
      ));

      parentActorId = existingNodeId;
    } else {
      // Create new node
      const pos = layoutPositions[newPrefix];
      const nodeId = nextId("tn");
      const edgeId = nextId("te");

      trieNodes[newPrefix] = { nodeId, edgeId };

      steps.push(annotatedStep(
        `Create node "${ch}" for prefix "${newPrefix}"`,
        "decision",
        {
          narration: `Character '<span class="highlight">${ch}</span>' is not yet in the trie at this position. ` +
            `<span class="success">Create a new node</span> for it. ` +
            (isLastChar
              ? `This completes the word "<span class="success">${word}</span>".`
              : `We still have ${word.length - i - 1} more character(s) to insert.`),
          phase: "main-loop",
        },
        ops.create({
          id: nodeId, type: "node",
          x: pos.x, y: pos.y,
          value: ch, radius: 25, fill: "$success",
        }),
        ops.create({
          id: edgeId, type: "edge",
          source: parentActorId, target: nodeId,
          directed: true, label: ch,
        }),
        ops.setText(status.id, `Created "${ch}" node for prefix "${newPrefix}"`)
      ));

      // Settle the node color
      steps.push(step(
        `Node "${ch}" added to trie`,
        ops.highlight(nodeId, "$default"),
      ));

      parentActorId = nodeId;
    }

    prefix = newPrefix;
  }

  // Mark end of word
  const endNodeId = trieNodes[prefix].nodeId;
  steps.push(teach(
    `Word "${word}" fully inserted — mark end node`,
    `<span class="success">Word "${word}" inserted!</span> The node for '${word[word.length - 1]}' is marked as an ` +
      `<span class="success">end-of-word</span> node. The path from root: ` +
      `<span class="highlight">${word.split("").join(" -> ")}</span>.`,
    ops.markDone(endNodeId),
    ops.setText("wordlbl", `Words: [${insertedWords.map(w => `"${w}"`).join(", ")}]`),
    ops.setText(status.id, `"${word}" inserted! (${insertedWords.length} word${insertedWords.length > 1 ? "s" : ""} total)`)
  ));
}

// Insert the three words
insertWord("cat");
insertWord("car");
insertWord("card");

// ─── Cleanup ───
const allNodeIds = Object.values(trieNodes).map(n => n.nodeId);
const allEdgeIds = Object.values(trieNodes).map(n => n.edgeId);

steps.push(annotatedStep(
  "Trie complete! 3 words stored in 5 nodes (sharing prefix 'ca')",
  "explanation",
  {
    narration: '<span class="success">Trie complete!</span> We inserted 3 words using only 5 character nodes. ' +
      'The prefix "<span class="highlight">ca</span>" is shared by all three words, and ' +
      '"<span class="highlight">car</span>" is a prefix of "<span class="highlight">card</span>". ' +
      'Tries enable <span class="highlight">O(L)</span> lookup where L = word length, ' +
      'and are used for autocomplete, spell check, and IP routing. ' +
      'Space: <span class="highlight">O(total characters)</span> across all words (with prefix sharing).',
    phase: "cleanup",
  },
  ops.markDone([g.nodeId("root"), ...allNodeIds]),
  ops.highlightEdge(allEdgeIds, "$success"),
  ops.setText(status.id, "Trie: 3 words, 5 nodes, prefix sharing saves space!")
));

const v = viz(
  {
    algorithm: "trie_insert",
    title: "Trie Insertion — Prefix Tree",
    description: "Build a Trie by inserting words character by character, showing prefix sharing, node creation, and tree structure.",
    category: "tree",
    difficulty: "intermediate",
    complexity: { time: "O(L)", space: "O(total chars)" },
    input: 'Words: "cat", "car", "card"',
  },
  [g, title, status, wordLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
