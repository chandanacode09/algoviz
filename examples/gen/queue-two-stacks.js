// Queue Using Two Stacks — amortized O(1) dequeue
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// Two arrays stacked vertically: "Stack In" (top) and "Stack Out" (bottom)
// We use 4 cells each to have room for the demo
const stackIn = layout.array(["", "", "", ""], { y: 180, prefix: "si" });
const stackOut = layout.array(["", "", "", ""], { y: 380, prefix: "so" });

const inLabel = label("Stack In (push here)", 500, 150, {
  id: "inlbl", fontSize: 16, fontWeight: "bold", fill: "$text",
});
const outLabel = label("Stack Out (pop here)", 500, 350, {
  id: "outlbl", fontSize: 16, fontWeight: "bold", fill: "$text",
});

const title = titleLabel("Queue Using Two Stacks");
const status = statusLabel("");
const inTopLabel = label("inTop: -1", 500, 265, {
  id: "intoplbl", fontSize: 13, fill: "$muted",
});
const outTopLabel = label("outTop: -1", 500, 465, {
  id: "outtoplbl", fontSize: 13, fill: "$muted",
});

const steps = [];

// Track stack state in JS
let inStack = [];  // values pushed into Stack In
let outStack = []; // values in Stack Out

function inTopStr() { return `inTop: ${inStack.length - 1}`; }
function outTopStr() { return `outTop: ${outStack.length - 1}`; }

// ─── Setup ───
steps.push(annotatedStep(
  "A queue is first-in first-out (FIFO). Can we build one using two stacks?",
  "initialization",
  {
    narration: '<span class="highlight">A queue</span> lets you add to the back and remove from the front (like a line at a store). ' +
      '<span class="highlight">A stack</span> only lets you add and remove from the top (like a stack of plates). ' +
      'Surprisingly, you can build a queue using <span class="warn">two stacks</span>! ' +
      '<span class="success">Stack In</span> receives new items. ' +
      '<span class="success">Stack Out</span> serves items for removal. ' +
      'When Stack Out is empty, we pour Stack In into it (reversing the order!).',
    phase: "setup",
  },
  ops.setText(status.id, "Two empty stacks — ready to simulate a queue")
));

// ─── Enqueue 1 ───
inStack.push(1);
steps.push(teach(
  "Enqueue 1: push 1 onto Stack In",
  'To <span class="highlight">enqueue</span> (add to queue), we simply <span class="success">push onto Stack In</span>. ' +
    'Push <span class="highlight">1</span> onto Stack In. Easy!',
  ops.setValue(stackIn.id(0), 1),
  ops.highlight(stackIn.id(0), "$success"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText(status.id, "Enqueue 1 → push to Stack In")
));

steps.push(step("Settle enqueue 1",
  ops.reset(stackIn.id(0)),
));

// ─── Enqueue 2 ───
inStack.push(2);
steps.push(teach(
  "Enqueue 2: push 2 onto Stack In",
  'Enqueue <span class="highlight">2</span>: push onto Stack In. ' +
    'Stack In now has [1, 2] (2 is on top).',
  ops.setValue(stackIn.id(1), 2),
  ops.highlight(stackIn.id(1), "$success"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText(status.id, "Enqueue 2 → push to Stack In")
));

steps.push(step("Settle enqueue 2",
  ops.reset(stackIn.id(1)),
));

// ─── Enqueue 3 ───
inStack.push(3);
steps.push(teach(
  "Enqueue 3: push 3 onto Stack In",
  'Enqueue <span class="highlight">3</span>: push onto Stack In. ' +
    'Stack In now has [1, 2, 3] (3 is on top).',
  ops.setValue(stackIn.id(2), 3),
  ops.highlight(stackIn.id(2), "$success"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText(status.id, "Enqueue 3 → push to Stack In")
));

steps.push(step("Settle enqueue 3",
  ops.reset(stackIn.id(2)),
));

// ─── Dequeue — Stack Out is empty, so pour Stack In into Stack Out ───
steps.push(teach(
  "Dequeue: Stack Out is empty! We need to pour Stack In into Stack Out",
  'Time to <span class="highlight">dequeue</span> (remove from front). ' +
    'But Stack Out is <span class="warn">empty</span>! ' +
    'We fix this by popping everything from Stack In and pushing it into Stack Out. ' +
    'This <span class="success">reverses the order</span>, so the oldest item ends up on top of Stack Out!',
  ops.highlight([stackIn.id(0), stackIn.id(1), stackIn.id(2)], "$warning"),
  ops.setText(status.id, "Dequeue: Stack Out empty → pour Stack In into Stack Out")
));

// Pour: pop 3 from Stack In, push to Stack Out
inStack.pop();
outStack.push(3);
steps.push(teach(
  "Pour: move 3 from Stack In to Stack Out",
  'Pop <span class="highlight">3</span> from Stack In, push to Stack Out. ' +
    'Stack In: [1, 2]. Stack Out: [3].',
  ops.setValue(stackIn.id(2), ""),
  ops.reset(stackIn.id(2)),
  ops.setValue(stackOut.id(0), 3),
  ops.highlight(stackOut.id(0), "$warning"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Move 3: Stack In → Stack Out")
));

// Pour: pop 2 from Stack In, push to Stack Out
inStack.pop();
outStack.push(2);
steps.push(teach(
  "Pour: move 2 from Stack In to Stack Out",
  'Pop <span class="highlight">2</span> from Stack In, push to Stack Out. ' +
    'Stack In: [1]. Stack Out: [3, 2].',
  ops.setValue(stackIn.id(1), ""),
  ops.reset([stackIn.id(1), stackOut.id(0)]),
  ops.setValue(stackOut.id(1), 2),
  ops.highlight(stackOut.id(1), "$warning"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Move 2: Stack In → Stack Out")
));

// Pour: pop 1 from Stack In, push to Stack Out
inStack.pop();
outStack.push(1);
steps.push(teach(
  "Pour: move 1 from Stack In to Stack Out",
  'Pop <span class="highlight">1</span> from Stack In, push to Stack Out. ' +
    'Stack In: []. Stack Out: [3, 2, 1]. ' +
    'Notice <span class="success">1 is now on top</span> — the oldest item is ready to be removed!',
  ops.setValue(stackIn.id(0), ""),
  ops.reset([stackIn.id(0), stackOut.id(1)]),
  ops.setValue(stackOut.id(2), 1),
  ops.highlight(stackOut.id(2), "$success"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Move 1: Stack In → Stack Out (pour done!)")
));

// Now pop 1 from Stack Out (that is the dequeue result)
outStack.pop();
steps.push(teach(
  "Dequeue result: pop 1 from Stack Out",
  'Pop <span class="success">1</span> from Stack Out — this is our dequeue result! ' +
    '<span class="highlight">1 was the first item enqueued, and it is the first item dequeued</span>. ' +
    'FIFO order works!',
  ops.setValue(stackOut.id(2), ""),
  ops.highlight(stackOut.id(2), "$danger"),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Dequeued: 1")
));

steps.push(step("Settle after dequeue 1",
  ops.reset(stackOut.id(2)),
));

// ─── Dequeue again — Stack Out still has items ───
outStack.pop();
steps.push(teach(
  "Dequeue again: Stack Out has items, just pop! Get 2",
  'Stack Out still has items [3, 2]. Just <span class="success">pop the top</span>: ' +
    '<span class="highlight">2</span>. No pouring needed this time!',
  ops.setValue(stackOut.id(1), ""),
  ops.highlight(stackOut.id(1), "$danger"),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Dequeued: 2 (no pour needed)")
));

steps.push(step("Settle after dequeue 2",
  ops.reset(stackOut.id(1)),
));

// ─── Enqueue 4 ───
inStack.push(4);
steps.push(teach(
  "Enqueue 4: push onto Stack In",
  'Enqueue <span class="highlight">4</span>: push onto Stack In. ' +
    'Stack In: [4]. Stack Out still has [3].',
  ops.setValue(stackIn.id(0), 4),
  ops.highlight(stackIn.id(0), "$success"),
  ops.setText("intoplbl", inTopStr()),
  ops.setText(status.id, "Enqueue 4 → push to Stack In")
));

steps.push(step("Settle enqueue 4",
  ops.reset(stackIn.id(0)),
));

// ─── Dequeue — Stack Out has 3, pop it ───
outStack.pop();
steps.push(teach(
  "Dequeue: Stack Out has 3 on top, pop it!",
  'Stack Out has [3]. Pop <span class="highlight">3</span>. ' +
    'No pour needed because Stack Out is not empty.',
  ops.setValue(stackOut.id(0), ""),
  ops.highlight(stackOut.id(0), "$danger"),
  ops.setText("outtoplbl", outTopStr()),
  ops.setText(status.id, "Dequeued: 3")
));

steps.push(step("Settle after dequeue 3",
  ops.reset(stackOut.id(0)),
));

// ─── Cleanup ───
steps.push(annotatedStep(
  "Demo complete! Queue order was: enqueue 1,2,3, dequeue 1, dequeue 2, enqueue 4, dequeue 3",
  "explanation",
  {
    narration: '<span class="success">Demo complete!</span> We enqueued 1, 2, 3 and dequeued them in order: 1, 2, 3. ' +
      'The trick: each item gets moved between stacks <span class="warn">at most once</span>. ' +
      'Even though one dequeue might be slow (when we pour), most dequeues are fast. ' +
      'On average, each operation is <span class="highlight">O(1)</span> — this is called ' +
      '<span class="highlight">amortized constant time</span>. ' +
      'Think of it like paying a little extra on some operations so that future operations are free!',
    phase: "cleanup",
  },
  ops.setText(status.id, "Amortized O(1) per operation — clever!")
));

const v = viz(
  {
    algorithm: "queue_two_stacks",
    title: "Queue Using Two Stacks",
    description: "Implementing a FIFO queue with two LIFO stacks, demonstrating the pour technique and amortized O(1) dequeue.",
    category: "other",
    difficulty: "beginner",
    complexity: { time: "O(1) amortized", space: "O(n)" },
    input: "Operations: enqueue 1, 2, 3, dequeue, dequeue, enqueue 4, dequeue",
  },
  [stackIn, stackOut, title, status, inLabel, outLabel, inTopLabel, outTopLabel],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
