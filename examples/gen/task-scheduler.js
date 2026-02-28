// Task Scheduler — greedy heap approach, educational step-by-step visualization
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input ───
const tasks = ["A", "A", "A", "B", "B", "B"];
const cooldown = 2;

// Layout: task input array
const taskArr = layout.array(tasks, { y: 80, prefix: "t", cellWidth: 55 });

// Timeline: max possible length = tasks.length + (cooldown * num_distinct_tasks) = 6 + 4 = 10
// Actual for this case: ABABIAB (A B idle A B idle A B) = 8 slots
const timelineSize = 8;
const timelineInit = Array(timelineSize).fill("");
const timeline = layout.array(timelineInit, { y: 400, prefix: "s", cellWidth: 55 });

const title = titleLabel("Task Scheduler (Cooldown n=2)");
const status = statusLabel("");

const taskLbl = label("Tasks: [A, A, A, B, B, B]", 500, 55, { id: "ltask", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$text" });
const freqLbl = label("Frequencies — A:3, B:3", 500, 155, { id: "lfreq", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$primary" });
const timeLbl = label("Scheduled Timeline", 500, 375, { id: "ltl", fontSize: 16, fontWeight: "bold", anchor: "middle", fill: "$success" });
const heapLbl = label("Max-Heap (by freq): []", 500, 210, { id: "lheap", fontSize: 15, fontWeight: "bold", anchor: "middle", fill: "$warning" });
const cooldownLbl = label("Cooldown queue: []", 500, 260, { id: "lcd", fontSize: 14, anchor: "middle", fill: "$muted" });

const steps = [];

// ─── Setup ───
steps.push(annotatedStep(
  "Schedule tasks with cooldown n=2 using a max-heap",
  "initialization",
  {
    narration: 'Given tasks <span class="highlight">[A,A,A,B,B,B]</span> with cooldown n=<span class="warn">2</span>, ' +
      'each task must wait at least 2 intervals before repeating. ' +
      'We use a <span class="highlight">max-heap</span> ordered by frequency to greedily pick the most frequent available task. ' +
      'This minimizes idle slots and total time.',
    phase: "setup",
  },
  ops.setText(status.id, "Tasks: [A,A,A,B,B,B], cooldown n=2")
));

// Count frequencies
steps.push(step(
  "Count task frequencies: A=3, B=3",
  ops.highlight(taskArr.ids, "$primary"),
  ops.setText(status.id, "Frequency count: A appears 3 times, B appears 3 times")
));

steps.push(teach(
  "Greedy: always schedule the most frequent task first",
  'The <span class="highlight">greedy strategy</span>: at each time slot, pick the task with the ' +
    '<span class="success">highest remaining frequency</span> that is not on cooldown. ' +
    'This minimizes idle time because spreading the most frequent task as early as possible ' +
    'leaves room for others. A <span class="warn">max-heap</span> gives us this in O(log k) per step.',
  ops.reset(taskArr.ids),
  ops.setText(heapLbl.id, "Max-Heap: [(A,3), (B,3)]"),
  ops.setText(status.id, "Heap initialized: A(3), B(3). Begin scheduling...")
));

// Simulate the scheduling
// With A:3, B:3, n=2, the optimal schedule is: A B idle A B idle A B = 8 slots
// Simulation state
let freqs = { A: 3, B: 3 };
let cooldownQueue = []; // [{task, freq, availableAt}]
let time = 0;
const scheduleResult = [];

// Manual simulation for correctness:
// t=0: heap={A:3,B:3}, pick A(3)->A(2,avail@3). schedule=A
// t=1: heap={B:3}, cooldown=[A:2@3], pick B(3)->B(2,avail@4). schedule=AB
// t=2: heap={}, cooldown=[A:2@3,B:2@4], no task available. schedule=AB_idle
// t=3: heap={A:2} (released), cooldown=[B:2@4], pick A(2)->A(1,avail@6). schedule=AB_A
// t=4: heap={B:2} (released), cooldown=[A:1@6], pick B(2)->B(1,avail@7). schedule=AB_AB
// t=5: heap={}, cooldown=[A:1@6,B:1@7], no task. schedule=AB_AB_idle
// t=6: heap={A:1} (released), cooldown=[B:1@7], pick A(1)->done. schedule=AB_AB_A
// t=7: heap={B:1} (released), pick B(1)->done. schedule=AB_AB_AB

const schedule = [
  { task: "A", freqAfter: 2, heapStr: "[(B,3)]", cdStr: "[(A,2,t=3)]", idle: false },
  { task: "B", freqAfter: 2, heapStr: "[]", cdStr: "[(A,2,t=3),(B,2,t=4)]", idle: false },
  { task: null, freqAfter: null, heapStr: "[]", cdStr: "[(A,2,t=3),(B,2,t=4)]", idle: true },
  { task: "A", freqAfter: 1, heapStr: "[]", cdStr: "[(B,2,t=4),(A,1,t=6)]", idle: false },
  { task: "B", freqAfter: 1, heapStr: "[]", cdStr: "[(A,1,t=6),(B,1,t=7)]", idle: false },
  { task: null, freqAfter: null, heapStr: "[]", cdStr: "[(A,1,t=6),(B,1,t=7)]", idle: true },
  { task: "A", freqAfter: 0, heapStr: "[]", cdStr: "[(B,1,t=7)]", idle: false },
  { task: "B", freqAfter: 0, heapStr: "[]", cdStr: "[]", idle: false },
];

for (let t = 0; t < schedule.length; t++) {
  const s = schedule[t];

  if (s.idle) {
    // Idle slot
    if (t === 2) {
      steps.push(teach(
        `Time ${t}: no task available — idle slot`,
        'Both A and B are on <span class="warn">cooldown</span>! We must insert an ' +
          '<span class="danger">idle slot</span>. This is unavoidable when all tasks are cooling down. ' +
          'The goal is to minimize these idle slots by spreading the most frequent tasks.',
        ops.setValue(timeline.id(t), "_"),
        ops.highlight(timeline.id(t), "$danger"),
        ops.setText(cooldownLbl.id, "Cooldown: " + s.cdStr),
        ops.setText(status.id, `Time ${t}: IDLE — all tasks on cooldown`)
      ));
    } else {
      steps.push(step(
        `Time ${t}: no task available — idle slot`,
        ops.setValue(timeline.id(t), "_"),
        ops.highlight(timeline.id(t), "$danger"),
        ops.setText(cooldownLbl.id, "Cooldown: " + s.cdStr),
        ops.setText(status.id, `Time ${t}: IDLE — all tasks on cooldown`)
      ));
    }

    steps.push(step(`Time ${t}: idle slot placed`,
      ops.reset(timeline.id(t))
    ));
  } else {
    // Schedule a task
    const task = s.task;
    const freqAfter = s.freqAfter;

    steps.push(step(
      `Time ${t}: schedule task ${task} (freq ${freqAfter + 1} → ${freqAfter})`,
      ops.setValue(timeline.id(t), task),
      ops.highlight(timeline.id(t), task === "A" ? "$primary" : "$warning"),
      ops.setText(heapLbl.id, "Max-Heap: " + s.heapStr),
      ops.setText(cooldownLbl.id, "Cooldown: " + s.cdStr),
      ops.setText(status.id, `Time ${t}: schedule ${task} (remaining: ${freqAfter}). ${freqAfter > 0 ? "Add to cooldown." : "Task done!"}`)
    ));

    steps.push(step(`Time ${t}: ${task} placed`,
      ops.reset(timeline.id(t))
    ));
  }
}

// Mark all timeline slots as done
steps.push(teach(
  "Schedule complete! Total time: 8 intervals (2 idle slots)",
  'The greedy heap approach produced schedule <span class="success">A B _ A B _ A B</span> in 8 intervals. ' +
    'The formula for minimum time with cooldown n is: ' +
    '<span class="highlight">max(N, (maxFreq - 1) * (n + 1) + countMaxFreq)</span>. ' +
    'Here: max(6, (3-1)*(2+1)+2) = max(6, 8) = <span class="success">8</span>.',
  ops.markDone(timeline.ids),
  ops.markDone(taskArr.ids),
  ops.setText(heapLbl.id, "Max-Heap: [] (all tasks scheduled)"),
  ops.setText(cooldownLbl.id, "Cooldown: [] (all done)"),
  ops.setText(status.id, "Schedule: A B _ A B _ A B | Total time: 8 | Idle: 2")
));

const v = viz(
  {
    algorithm: "task_scheduler",
    title: "Task Scheduler — Greedy Heap Approach",
    description: "Schedule tasks with a cooldown constraint using a max-heap to always pick the most frequent available task.",
    category: "heap",
    difficulty: "intermediate",
    complexity: { time: "O(N log k)", space: "O(k)" },
    input: "Tasks: [A,A,A,B,B,B], cooldown n=2",
  },
  [taskArr, timeline, title, status, taskLbl, freqLbl, timeLbl, heapLbl, cooldownLbl],
  steps,
  { canvas: { height: 530 } }
);

process.stdout.write(JSON.stringify(v, null, 2));
