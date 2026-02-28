// Largest Rectangle in Histogram — stack-based approach
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

const heights = [2, 1, 5, 6, 2, 3];
const arr = layout.array(heights, { y: 120, prefix: "h" });

const title = titleLabel("Largest Rectangle in Histogram");
const status = statusLabel("");

// Labels for stack and max area
const stackLabel = label("Stack: []", 160, 250, {
  id: "lstk", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$primary",
});
const maxLabel = label("Max area: 0", 160, 280, {
  id: "lmax", fontSize: 16, fontWeight: "bold", anchor: "start", fill: "$success",
});
const calcLabel = label("", 500, 280, {
  id: "lcalc", fontSize: 14, anchor: "middle", fill: "$warning",
});

// Pointer for current index
const iPtr = pointer("i", arr.id(0), "below", { id: "pi" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Find the largest rectangle that fits under the histogram bars",
  "initialization",
  {
    narration: 'Given histogram bars with heights <span class="highlight">[2, 1, 5, 6, 2, 3]</span>, ' +
      'find the largest rectangular area. We use a <span class="warn">stack</span> to track indices of bars ' +
      'in <span class="highlight">increasing height order</span>. When we encounter a shorter bar, ' +
      'we pop and calculate areas.',
    phase: "setup",
  },
  ops.setText(status.id, "Heights: [2, 1, 5, 6, 2, 3]. Find max rectangle area.")
));

steps.push(teach(
  "Why a stack? It maintains bars in increasing height order.",
  'The stack stores <span class="highlight">indices</span> of bars whose heights are in ' +
    '<span class="warn">increasing order</span>. When we see a bar shorter than the stack top, ' +
    'the taller bars cannot extend further right — so we pop them and calculate their area. ' +
    'The <span class="highlight">width</span> of each rectangle extends from the bar after the new stack top ' +
    'to the current index.',
  ops.setText(status.id, "Stack keeps indices in increasing height order"),
  ops.setText("lcalc", "")
));

// Simulate the algorithm
let stack = []; // stores indices
let maxArea = 0;

// Process index 0: height=2, stack empty → push
steps.push(teach(
  "i=0, height=2: stack is empty, push index 0",
  'Stack is empty, so we <span class="success">push index 0</span> (height 2). ' +
    'Stack: [0].',
  ops.movePointer("pi", arr.id(0)),
  ops.highlight(arr.id(0), "$primary"),
  ops.setText("lstk", "Stack: [0]"),
  ops.setText(status.id, "Push index 0 (h=2). Stack: [0]")
));
stack.push(0);

steps.push(step("Index 0 processed",
  ops.reset(arr.id(0))
));

// Process index 1: height=1, stack top has height 2 > 1 → pop and calculate
steps.push(teach(
  "i=1, height=1: height[stack top]=2 > 1, pop index 0",
  'Bar at index 1 has height <span class="warn">1</span>, which is less than ' +
    'the stack top (index 0, height <span class="highlight">2</span>). ' +
    'The bar at index 0 can\'t extend right past index 1. <span class="warn">Pop index 0</span> and calculate area.',
  ops.movePointer("pi", arr.id(1)),
  ops.highlight(arr.id(1), "$warning"),
  ops.highlight(arr.id(0), "$danger"),
  ops.setText(status.id, "h[1]=1 < h[0]=2. Pop index 0, calculate area")
));

// Pop index 0: height=2, width=1 (stack empty, so width=i=1), area=2
steps.push(teach(
  "Pop index 0: area = height(2) x width(1) = 2",
  'Popped index 0 (height = 2). Stack is now empty, so width = i = <span class="highlight">1</span>. ' +
    'Area = 2 x 1 = <span class="success">2</span>. Max area so far: <span class="success">2</span>.',
  ops.reset(arr.id(0)),
  ops.setText("lcalc", "Area = h[0] x i = 2 x 1 = 2"),
  ops.setText("lmax", "Max area: 2"),
  ops.setText("lstk", "Stack: []"),
  ops.setText(status.id, "Area = 2. Max = 2. Push index 1.")
));
stack = [];
maxArea = 2;

// Push index 1
steps.push(step("Push index 1 (height=1)",
  ops.reset(arr.id(1)),
  ops.setText("lstk", "Stack: [1]"),
  ops.setText("lcalc", "")
));
stack.push(1);

// Process index 2: height=5, stack top height=1 < 5 → push
steps.push(teach(
  "i=2, height=5: height[stack top]=1 < 5, push index 2",
  'Bar height 5 > stack top height 1. Increasing order maintained. ' +
    '<span class="success">Push index 2</span>. Stack: [1, 2].',
  ops.movePointer("pi", arr.id(2)),
  ops.highlight(arr.id(2), "$primary"),
  ops.setText("lstk", "Stack: [1, 2]"),
  ops.setText(status.id, "h[2]=5 > h[1]=1. Push. Stack: [1, 2]")
));
stack.push(2);

steps.push(step("Index 2 processed",
  ops.reset(arr.id(2))
));

// Process index 3: height=6, stack top height=5 < 6 → push
steps.push(teach(
  "i=3, height=6: height[stack top]=5 < 6, push index 3",
  'Bar height 6 > stack top height 5. Still increasing. ' +
    '<span class="success">Push index 3</span>. Stack: [1, 2, 3].',
  ops.movePointer("pi", arr.id(3)),
  ops.highlight(arr.id(3), "$primary"),
  ops.setText("lstk", "Stack: [1, 2, 3]"),
  ops.setText(status.id, "h[3]=6 > h[2]=5. Push. Stack: [1, 2, 3]")
));
stack.push(3);

steps.push(step("Index 3 processed",
  ops.reset(arr.id(3))
));

// Process index 4: height=2, stack top height=6 > 2 → pop
steps.push(teach(
  "i=4, height=2: height[stack top]=6 > 2, start popping!",
  'Bar height <span class="warn">2</span> is less than stack top (index 3, height 6). ' +
    'The tall bars at indices 2 and 3 can\'t extend past index 4. ' +
    'We\'ll <span class="warn">pop and calculate</span> until the stack top height is ≤ 2.',
  ops.movePointer("pi", arr.id(4)),
  ops.highlight(arr.id(4), "$warning"),
  ops.highlight(arr.id(3), "$danger"),
  ops.setText(status.id, "h[4]=2 < h[3]=6. Pop and calculate!")
));

// Pop index 3 (height=6): width = i - stack_top - 1 = 4 - 2 - 1 = 1, area = 6
steps.push(teach(
  "Pop index 3: area = 6 x 1 = 6",
  'Pop index 3 (height 6). New stack top = 2, so width = 4 - 2 - 1 = <span class="highlight">1</span>. ' +
    'Area = 6 x 1 = <span class="success">6</span>. Max area: <span class="success">6</span>.',
  ops.reset(arr.id(3)),
  ops.highlight(arr.id(3), "$success"),
  ops.setText("lcalc", "Area = h[3] x (4 - 2 - 1) = 6 x 1 = 6"),
  ops.setText("lmax", "Max area: 6"),
  ops.setText("lstk", "Stack: [1, 2]"),
  ops.setText(status.id, "Area = 6. Max = 6.")
));
stack.pop(); // remove 3
maxArea = 6;

// Still h[4]=2 < h[stack top=2]=5, pop index 2
steps.push(teach(
  "Still popping: h[4]=2 < h[stack top=2]=5, pop index 2",
  'Stack top is index 2 (height 5). Still <span class="warn">5 > 2</span>, so pop again.',
  ops.highlight(arr.id(2), "$danger"),
  ops.reset(arr.id(3)),
  ops.setText(status.id, "h[4]=2 < h[2]=5. Pop index 2.")
));

// Pop index 2 (height=5): width = i - stack_top - 1 = 4 - 1 - 1 = 2, area = 10
steps.push(teach(
  "Pop index 2: area = 5 x 2 = 10. New max!",
  'Pop index 2 (height 5). New stack top = 1, width = 4 - 1 - 1 = <span class="highlight">2</span>. ' +
    'Area = 5 x 2 = <span class="success">10</span>. <span class="success">New maximum!</span> ' +
    'This rectangle spans indices 2-3 with height 5.',
  ops.highlight(arr.id(2), "$success"),
  ops.highlight(arr.id(3), "$success"),
  ops.setText("lcalc", "Area = h[2] x (4 - 1 - 1) = 5 x 2 = 10"),
  ops.setText("lmax", "Max area: 10"),
  ops.setText("lstk", "Stack: [1]"),
  ops.setText(status.id, "Area = 10. NEW MAX! Rectangle at indices 2-3, height 5")
));
stack.pop(); // remove 2
maxArea = 10;

// Now h[4]=2 >= h[stack top=1]=1, push index 4
steps.push(step("h[4]=2 >= h[1]=1, push index 4. Stack: [1, 4]",
  ops.reset(arr.id(2)),
  ops.reset(arr.id(3)),
  ops.reset(arr.id(4)),
  ops.setText("lstk", "Stack: [1, 4]"),
  ops.setText("lcalc", ""),
  ops.setText(status.id, "Push index 4. Stack: [1, 4]")
));
stack.push(4);

// Process index 5: height=3, stack top height=2 < 3 → push
steps.push(teach(
  "i=5, height=3: height[stack top]=2 < 3, push index 5",
  'Bar height 3 > stack top height 2. <span class="success">Push index 5</span>. Stack: [1, 4, 5]. ' +
    'All input bars processed. Now we pop remaining stack entries.',
  ops.movePointer("pi", arr.id(5)),
  ops.highlight(arr.id(5), "$primary"),
  ops.setText("lstk", "Stack: [1, 4, 5]"),
  ops.setText(status.id, "h[5]=3 > h[4]=2. Push. Stack: [1, 4, 5]")
));
stack.push(5);

steps.push(step("All bars processed. Pop remaining stack entries.",
  ops.reset(arr.id(5)),
  ops.setText(status.id, "All bars scanned. Pop remaining stack entries.")
));

// Pop remaining: index 5 (height=3), width = 6 - 4 - 1 = 1, area = 3
steps.push(teach(
  "Pop index 5: area = 3 x 1 = 3",
  'Pop index 5 (height 3). Stack top = 4, width = 6 - 4 - 1 = <span class="highlight">1</span>. ' +
    'Area = 3 x 1 = 3. Max stays <span class="success">10</span>.',
  ops.highlight(arr.id(5), "$warning"),
  ops.setText("lcalc", "Area = h[5] x (6 - 4 - 1) = 3 x 1 = 3"),
  ops.setText("lstk", "Stack: [1, 4]"),
  ops.setText(status.id, "Area = 3. Max still 10.")
));
stack.pop();

// Pop index 4 (height=2), width = 6 - 1 - 1 = 4, area = 8
steps.push(teach(
  "Pop index 4: area = 2 x 4 = 8",
  'Pop index 4 (height 2). Stack top = 1, width = 6 - 1 - 1 = <span class="highlight">4</span>. ' +
    'Area = 2 x 4 = 8. Max stays <span class="success">10</span>.',
  ops.reset(arr.id(5)),
  ops.highlight(arr.id(4), "$warning"),
  ops.highlight(arr.id(2), "$warning"),
  ops.highlight(arr.id(3), "$warning"),
  ops.highlight(arr.id(5), "$warning"),
  ops.setText("lcalc", "Area = h[4] x (6 - 1 - 1) = 2 x 4 = 8"),
  ops.setText("lstk", "Stack: [1]"),
  ops.setText(status.id, "Area = 8. Max still 10.")
));
stack.pop();

// Pop index 1 (height=1), stack empty, width = 6, area = 6
steps.push(teach(
  "Pop index 1: area = 1 x 6 = 6",
  'Pop index 1 (height 1). Stack is empty, so width = n = <span class="highlight">6</span> (the entire histogram). ' +
    'Area = 1 x 6 = 6. Max stays <span class="success">10</span>.',
  ops.reset(arr.ids),
  ops.highlight(arr.ids, "$warning"),
  ops.setText("lcalc", "Area = h[1] x n = 1 x 6 = 6"),
  ops.setText("lstk", "Stack: []"),
  ops.setText(status.id, "Area = 6. Max still 10.")
));
stack.pop();

// ─── Cleanup ───
steps.push(annotatedStep(
  "Done! Largest rectangle area = 10 (height 5, spanning indices 2-3).",
  "explanation",
  {
    narration: '<span class="success">Algorithm complete!</span> The largest rectangle has area ' +
      '<span class="success">10</span> — it spans indices 2-3 with height 5. ' +
      'The stack-based approach runs in <span class="highlight">O(n)</span> time: each index is pushed ' +
      'and popped <span class="warn">at most once</span>. Space: O(n) for the stack.',
    phase: "cleanup",
  },
  ops.reset(arr.ids),
  ops.markDone([arr.id(2), arr.id(3)]),
  ops.setText(status.id, "Answer: 10 (indices 2-3, height 5). O(n) time."),
  ops.setText("lcalc", ""),
  ops.setText("lmax", "Max area: 10")
));

const v = viz(
  {
    algorithm: "largest_rectangle_histogram",
    title: "Largest Rectangle in Histogram",
    description: "Find the largest rectangular area under a histogram using a stack-based O(n) approach. Push indices in increasing height order; pop and calculate area when a shorter bar is encountered.",
    category: "other",
    difficulty: "intermediate",
    complexity: { time: "O(n)", space: "O(n)" },
    input: "Heights: [2, 1, 5, 6, 2, 3]",
  },
  [arr, title, status, stackLabel, maxLabel, calcLabel, iPtr],
  steps,
  { canvas: { height: 400 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
