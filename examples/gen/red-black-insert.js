// Red-Black Tree Insert — educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ──────────────────────────────────────────────────────────
// Red-Black Tree with 5 nodes, then insert a value that
// triggers recoloring.
//
// Initial tree (B=black, R=red):
//          11(B)
//         /    \
//       2(R)   14(B)
//      / \
//    1(B) 7(B)
//
// Insert 5 → goes as left child of 7 → colored RED
//          11(B)
//         /    \
//       2(R)   14(B)
//      / \
//    1(B) 7(B)
//         /
//        5(R)    ← new node, red
//
// But this is actually fine (parent 7 is black)!
// Let's instead use a tree that triggers recoloring:
//
//          11(B)
//         /    \
//       2(R)   14(R)
//      / \
//    1(B) 7(B)
//
// Insert 5 → left child of 7 → colored RED
// Parent 7 is BLACK so no violation yet. Let's use a different structure.
//
// Better: use a tree where uncle is red, triggering recoloring:
//          7(B)
//         /    \
//       3(R)   11(R)
//
// Insert 1: goes left of 3 → red.
// Parent 3 is RED, uncle 11 is RED → recolor case!
// Fix: recolor parent and uncle BLACK, grandparent RED
// But grandparent is root → stays BLACK
//
// Result:
//          7(B)
//         /    \
//       3(B)   11(B)
//      /
//    1(R)
// ──────────────────────────────────────────────────────────

const t = layout.tree({
  value: 7,
  left: {
    value: 3,
  },
  right: {
    value: 11,
  },
});

const title = titleLabel("Red-Black Tree: Insert & Recolor");
const status = statusLabel("");

const colorLabel = label("Node colors: red or black", 500, 500, {
  id: "lcolor", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$primary",
});

const steps = [];

// ─── Setup: color the initial tree ───
// Root 7 = black ($text), children 3 and 11 = red ($danger)
steps.push(annotatedStep(
  "Initial red-black tree: root 7 (black), children 3 (red) and 11 (red)",
  "initialization",
  {
    narration: 'We start with a small <span class="highlight">Red-Black Tree</span>. ' +
      'Node <span class="highlight">7</span> is the root and colored <span class="warn">BLACK</span>. ' +
      'Nodes <span class="highlight">3</span> and <span class="highlight">11</span> are colored <span class="warn">RED</span>. ' +
      'We will insert <span class="highlight">1</span> and see what happens!',
    phase: "setup",
  },
  ops.highlight(t.nodeId(7), "$text"),
  ops.highlight(t.nodeId(3), "$danger"),
  ops.highlight(t.nodeId(11), "$danger"),
  ops.setText(status.id, "Root=7(B), Left=3(R), Right=11(R)"),
  ops.setText("lcolor", "BLACK = dark, RED = red highlight")
));

// ─── Teach: 4 red-black properties ───
steps.push(teach(
  "Red-Black Tree has 4 key rules that keep it balanced",
  'A Red-Black Tree follows these <span class="highlight">4 rules</span>: ' +
    '(1) Every node is either <span class="warn">RED</span> or <span class="highlight">BLACK</span>. ' +
    '(2) The <span class="highlight">root is always BLACK</span>. ' +
    '(3) A <span class="warn">RED node cannot have a RED child</span> (no two reds in a row). ' +
    '(4) Every path from root to a leaf has the <span class="highlight">same number of BLACK nodes</span>. ' +
    'These rules guarantee the tree height stays at O(log n)!',
  ops.setText(status.id, "4 rules: red/black, root=black, no red-red, equal black paths"),
  ops.setText("lcolor", "Rules: root=B, no red-red, same # black on all paths")
));

// ─── Insert 1: BST insert, color RED ───
steps.push(teach(
  "Insert 1: BST insert places it as left child of 3, color it RED",
  'When we insert a new node, we first do a normal BST insert: ' +
    '<span class="highlight">1 < 7</span>, go left to <span class="highlight">3</span>. ' +
    '<span class="highlight">1 < 3</span>, go left — empty! Place 1 here. ' +
    'New nodes are always colored <span class="warn">RED</span> first.',
  ops.highlight(t.nodeId(7), "$text"),
  ops.highlight(t.nodeId(3), "$warning"),
  ops.setText(status.id, "Insert 1: 1 < 7, go left; 1 < 3, go left — place here")
));

// Create node 1 as left child of 3
const node3Actor = t.actors.find(a => a.type === "node" && a.value === 3);
const node11Actor = t.actors.find(a => a.type === "node" && a.value === 11);
const new1X = node3Actor.x - (node11Actor.x - node3Actor.x) / 2;
const new1Y = node3Actor.y + 100;

const n1id = "ins1";
const e1id = "eins1";

steps.push(annotatedStep(
  "Node 1 inserted as left child of 3, colored RED",
  "decision",
  {
    narration: '<span class="highlight">1</span> is placed as the left child of <span class="warn">3</span> ' +
      'and colored <span class="warn">RED</span>. But wait — <span class="warn">parent 3 is also RED!</span> ' +
      'That breaks Rule 3: no two red nodes in a row! We need to fix this.',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(3), "$danger"),
  ops.create({ id: n1id, type: "node", x: new1X, y: new1Y, value: 1, radius: 25, fill: "$danger" }),
  ops.create({ id: e1id, type: "edge", source: t.nodeId(3), target: n1id, directed: false }),
  ops.setText(status.id, "RED-RED violation! Node 1 (red) → parent 3 (red)"),
  ops.setText("lcolor", "VIOLATION: red child 1 under red parent 3!")
));

// ─── Detect the case: uncle is RED ───
steps.push(annotatedStep(
  "Check uncle: node 11 is RED — this is the 'recoloring' case!",
  "decision",
  {
    narration: 'To fix a red-red violation, we look at the <span class="highlight">uncle</span> — ' +
      'the sibling of the parent. Parent is <span class="highlight">3</span>, ' +
      'so the uncle is <span class="highlight">11</span>. ' +
      'Uncle 11 is <span class="warn">RED</span>! When the uncle is red, ' +
      'we use the <span class="success">recoloring</span> fix (the simplest case).',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(11), "$warning"),
  ops.highlight(t.nodeId(3), "$warning"),
  ops.highlight(n1id, "$warning"),
  ops.setText(status.id, "Uncle 11 is RED → recoloring case (simplest fix)")
));

// ─── Perform recoloring ───
steps.push(teach(
  "Recoloring: flip parent and uncle to BLACK, grandparent to RED",
  'The <span class="highlight">recoloring fix</span> is simple: ' +
    'change the parent (<span class="highlight">3</span>) to <span class="highlight">BLACK</span>, ' +
    'change the uncle (<span class="highlight">11</span>) to <span class="highlight">BLACK</span>, ' +
    'and change the grandparent (<span class="highlight">7</span>) to <span class="warn">RED</span>. ' +
    'This pushes the "redness" up toward the root.',
  ops.highlight(t.nodeId(3), "$text"),
  ops.highlight(t.nodeId(11), "$text"),
  ops.highlight(t.nodeId(7), "$danger"),
  ops.highlight(n1id, "$danger"),
  ops.setText(status.id, "Recolor: 3→B, 11→B, 7→R"),
  ops.setText("lcolor", "Parent 3→BLACK, Uncle 11→BLACK, Grandparent 7→RED")
));

// ─── Root must be black ───
steps.push(annotatedStep(
  "But wait — the root must always be BLACK! Change 7 back to BLACK.",
  "boundary",
  {
    narration: 'Oops! Grandparent <span class="highlight">7</span> is now <span class="warn">RED</span>, ' +
      'but 7 is the root. Rule 2 says the root must be <span class="highlight">BLACK</span>. ' +
      'Easy fix: just color the root <span class="highlight">BLACK</span>. ' +
      'This adds one extra black node to every path, which is fine — ' +
      'it keeps all paths equal.',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(7), "$text"),
  ops.setText(status.id, "Root 7 must be BLACK — recolor it back!"),
  ops.setText("lcolor", "Root is always BLACK — fix applied!")
));

// ─── Verify all rules ───
steps.push(annotatedStep(
  "Verify: all 4 red-black rules are satisfied",
  "invariant",
  {
    narration: 'Let us check all 4 rules: ' +
      '(1) Every node is red or black — yes. ' +
      '(2) Root 7 is black — yes. ' +
      '(3) No red-red: 1 is red, parent 3 is <span class="success">black</span> — no violation! ' +
      '(4) Black path count: root→1 has 2 black nodes (7,3). Root→11 has 2 black nodes (7,11). ' +
      '<span class="success">All rules satisfied!</span>',
    phase: "main-loop",
  },
  ops.highlight(t.nodeId(7), "$success"),
  ops.highlight(t.nodeId(3), "$success"),
  ops.highlight(t.nodeId(11), "$success"),
  ops.highlight(n1id, "$success"),
  ops.setText(status.id, "All 4 rules satisfied! Tree is valid."),
  ops.setText("lcolor", "7(B)→3(B)→1(R), 7(B)→11(B): black-depth=2 on all paths")
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Insert complete! Recoloring fixed the red-red violation in O(log n) time.",
  "explanation",
  {
    narration: '<span class="success">Summary:</span> We inserted <span class="highlight">1</span> into a red-black tree. ' +
      'The new red node under a red parent created a <span class="warn">red-red violation</span>. ' +
      'Since the uncle was also red, we used <span class="highlight">recoloring</span>: ' +
      'flip parent and uncle to black, grandparent to red, then fix the root. ' +
      'In harder cases (uncle is black), we need <span class="highlight">rotations</span> too. ' +
      'Either way, red-black trees guarantee <span class="success">O(log n)</span> height!',
    phase: "cleanup",
  },
  ops.markDone(t.nodeIds),
  ops.markDone([n1id]),
  ops.setText(status.id, "Red-black insert: recoloring + root fix → O(log n)")
));

const v = viz(
  {
    algorithm: "red_black_insert",
    title: "Red-Black Tree: Insert with Recoloring",
    description: "Inserting a node into a red-black tree that triggers the recoloring case: parent and uncle are both red, so we flip colors to restore the 4 red-black properties.",
    category: "tree",
    difficulty: "advanced",
    complexity: { time: "O(log n)", space: "O(1)" },
    input: "Initial tree: 7(B), 3(R), 11(R). Insert: 1",
  },
  [t, title, status, colorLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
