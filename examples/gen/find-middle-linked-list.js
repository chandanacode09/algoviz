// Find Middle of Linked List — Floyd's slow/fast pointer technique
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Build a linked list: 1 → 2 → 3 → 4 → 5
const ll = layout.linkedList([1, 2, 3, 4, 5]);

const title = titleLabel("Find Middle of Linked List");
const status = statusLabel("");
const slowPtr = pointer("slow", ll.id(0), "above", { id: "pslow" });
const fastPtr = pointer("fast", ll.id(0), "below", { id: "pfast" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Find the middle node using two pointers: slow and fast",
  "initialization",
  {
    narration: '<span class="highlight">How do you find the middle of a linked list without counting all the nodes first?</span> ' +
      'Use two pointers! The <span class="warn">slow pointer</span> moves 1 step at a time. ' +
      'The <span class="success">fast pointer</span> moves 2 steps at a time. ' +
      'When fast reaches the end, slow is right at the middle! ' +
      'This is called <span class="highlight">Floyd\'s Tortoise and Hare</span> approach.',
    phase: "setup",
  },
  ops.highlight(ll.id(0), "$warning"),
  ops.setText(status.id, "Both pointers start at node 1")
));

// ─── Step 1: slow moves to 2, fast moves to 3 ───
steps.push(teach(
  "Move slow 1 step (to node 2), fast 2 steps (to node 3)",
  'The <span class="warn">slow pointer</span> takes 1 step: 1 → <span class="warn">2</span>. ' +
    'The <span class="success">fast pointer</span> takes 2 steps: 1 → 2 → <span class="success">3</span>. ' +
    'Fast moves twice as quickly, so it will reach the end in half the time!',
  ops.reset(ll.id(0)),
  ops.highlight(ll.id(1), "$warning"),
  ops.highlight(ll.id(2), "$primary"),
  ops.movePointer("pslow", ll.id(1)),
  ops.movePointer("pfast", ll.id(2)),
  ops.setText(status.id, "slow → node 2, fast → node 3")
));

// ─── Step 2: slow moves to 3, fast moves to 5 ───
steps.push(teach(
  "Move slow 1 step (to node 3), fast 2 steps (to node 5)",
  'The <span class="warn">slow pointer</span> takes 1 step: 2 → <span class="warn">3</span>. ' +
    'The <span class="success">fast pointer</span> takes 2 steps: 3 → 4 → <span class="success">5</span>. ' +
    'Fast has reached the last node! That means slow is at the middle.',
  ops.reset([ll.id(1), ll.id(2)]),
  ops.highlight(ll.id(2), "$warning"),
  ops.highlight(ll.id(4), "$primary"),
  ops.movePointer("pslow", ll.id(2)),
  ops.movePointer("pfast", ll.id(4)),
  ops.setText(status.id, "slow → node 3, fast → node 5 (end!)")
));

// ─── Fast reached the end ───
steps.push(teach(
  "Fast pointer reached the end — slow is at the middle!",
  'The <span class="success">fast pointer</span> is at the last node (5). ' +
    'It cannot move 2 more steps, so we stop. ' +
    'The <span class="warn">slow pointer</span> is at node <span class="highlight">3</span> — ' +
    'that is the <span class="success">middle of the list!</span>',
  ops.reset([ll.id(2), ll.id(4)]),
  ops.highlight(ll.id(2), "$success"),
  ops.setText(status.id, "Middle found: node 3!")
));

// ─── Why does this work? ───
steps.push(annotatedStep(
  "Why does this work? Fast moves 2x speed, so slow covers half the distance",
  "explanation",
  {
    narration: '<span class="highlight">Why does this trick work?</span> ' +
      'Think about it: if fast moves at <span class="warn">2x speed</span>, ' +
      'by the time fast finishes the whole list, slow has only gone <span class="success">halfway</span>. ' +
      'It is like a race: if one runner goes twice as fast, when the fast runner finishes, ' +
      'the slow runner is at the halfway mark! ' +
      'This runs in <span class="highlight">O(n)</span> time with <span class="highlight">O(1)</span> extra space — ' +
      'we only need two pointers, no matter how long the list is.',
    phase: "cleanup",
  },
  ops.markDone(ll.id(2)),
  ops.setText(status.id, "Middle = node 3 (value: 3)")
));

const v = viz(
  {
    algorithm: "find_middle_linked_list",
    title: "Find Middle of Linked List — Slow & Fast Pointers",
    description: "Using Floyd's tortoise and hare approach to find the middle node in one pass.",
    category: "linked-list",
    difficulty: "beginner",
    complexity: { time: "O(n)", space: "O(1)" },
    input: "Linked list: 1 → 2 → 3 → 4 → 5",
  },
  [ll, title, status, slowPtr, fastPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
