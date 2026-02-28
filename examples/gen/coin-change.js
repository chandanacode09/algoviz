// Coin Change — minimum coins to make a target amount (DP)
const {
  layout, ops, step, teach, annotatedStep, viz,
  titleLabel, statusLabel, label, pointer,
  resetIds,
} = require("algoviz");

resetIds();

// ─── Input data ───
const coins = [1, 3, 4];
const target = 6;

// ─── Layout: DP array (amounts 0..target) ───
const dpArr = layout.array(Array(target + 1).fill(""), { y: 250, prefix: "d", cellWidth: 65 });

const title = titleLabel("Coin Change");
const status = statusLabel("");
const dpLabel = label("DP Table: min coins to make amount i", 500, 215, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const coinsLabel = label(`Coins: [${coins.join(", ")}]  |  Target: ${target}`, 500, 80, { fontSize: 16, fontWeight: "bold", fill: "$text" });
const amtPtr = pointer("amt", dpArr.id(0), "above", { id: "pamt" });

const steps = [];

// Track DP values: dp[i] = min coins to make amount i, Infinity = impossible
const dpValues = Array(target + 1).fill(Infinity);

// ─── Setup ───
steps.push(annotatedStep(
  "Goal: find the fewest coins that add up to the target amount",
  "initialization",
  {
    narration: '<span class="highlight">Coin Change Problem</span>: You have coins of values ' +
      `[${coins.join(", ")}]. What is the <span class="warn">smallest number of coins</span> ` +
      `you need to make exactly $${target}? ` +
      'We build a table where dp[i] = minimum coins needed to make amount i.',
    phase: "setup",
  },
  ops.setText(status.id, `Coins: [${coins.join(", ")}] — Target: $${target}`)
));

// ─── Base case: amount 0 ───
dpValues[0] = 0;
steps.push(annotatedStep(
  "Base case: dp[0] = 0 (zero coins needed to make $0)",
  "boundary",
  {
    narration: '<span class="highlight">Base case</span>: To make amount $0, we need 0 coins. ' +
      'That is our starting point. Every other cell starts as <span class="warn">INF</span> (impossible until proven otherwise).',
    phase: "setup",
  },
  ops.setValue(dpArr.id(0), 0),
  ops.highlight(dpArr.id(0), "$success"),
  ops.movePointer("pamt", dpArr.id(0)),
  ops.setText(status.id, "dp[0] = 0 (base case)")
));

// Set other cells to INF display
const infActionGroups = [];
for (let i = 1; i <= target; i++) {
  infActionGroups.push(ops.setValue(dpArr.id(i), "INF"));
}
steps.push(step("Initialize all other amounts to INF (unreachable)",
  ...infActionGroups,
  ops.reset(dpArr.id(0))
));

// ─── Main DP loop ───
steps.push(teach(
  "For each amount 1 to target, try every coin and pick the best",
  'For each amount i from 1 to ' + target + ', we try each coin. ' +
    'If coin value c is not bigger than i, we check: ' +
    '<span class="highlight">dp[i - c] + 1</span>. ' +
    'That means "use one coin of value c, plus whatever it took to make the remaining amount." ' +
    'We keep the <span class="success">smallest</span> option.',
  ops.setText(status.id, "For each amount, try all coins and pick minimum")
));

for (let amount = 1; amount <= target; amount++) {
  steps.push(step(`Consider amount $${amount}`,
    ops.highlight(dpArr.id(amount), "$warning"),
    ops.movePointer("pamt", dpArr.id(amount)),
    ops.setText(status.id, `Amount $${amount}: trying each coin...`)
  ));

  let bestCoins = Infinity;
  let bestCoin = -1;

  for (let ci = 0; ci < coins.length; ci++) {
    const c = coins[ci];
    if (c > amount) {
      steps.push(teach(
        `Coin $${c}: too big for amount $${amount}, skip`,
        `Coin <span class="warn">$${c}</span> is bigger than amount $${amount}. We cannot use it here.`,
        ops.setText(status.id, `Coin $${c} > $${amount} — skip`)
      ));
      continue;
    }

    const remaining = amount - c;
    const candidate = dpValues[remaining] === Infinity ? Infinity : dpValues[remaining] + 1;
    const isBetter = candidate < bestCoins;

    if (dpValues[remaining] === Infinity) {
      steps.push(teach(
        `Coin $${c}: dp[${remaining}] = INF, so $${amount} - $${c} is not reachable yet`,
        `Using coin <span class="highlight">$${c}</span>: remaining = $${remaining}, ` +
          `but dp[${remaining}] = INF. That path does not work.`,
        ops.highlight(dpArr.id(remaining), "$danger"),
        ops.setText(status.id, `Coin $${c}: dp[${remaining}] = INF — not reachable`)
      ));
    } else {
      steps.push(teach(
        `Coin $${c}: dp[${remaining}] + 1 = ${dpValues[remaining]} + 1 = ${candidate}${isBetter ? " (new best!)" : ""}`,
        `Using coin <span class="highlight">$${c}</span>: we need dp[${remaining}] + 1 = ${dpValues[remaining]} + 1 = ` +
          `<span class="${isBetter ? "success" : "warn"}">${candidate}</span>` +
          (isBetter ? ` — that is better than our current best!` : ` — not better than ${bestCoins}.`),
        ops.highlight(dpArr.id(remaining), "$primary"),
        ops.setText(status.id, `Coin $${c}: dp[${remaining}]+1 = ${candidate}${isBetter ? " ★ new best" : ""}`)
      ));
    }

    if (isBetter) {
      bestCoins = candidate;
      bestCoin = c;
    }

    // Reset the remaining cell highlight
    if (c <= amount) {
      steps.push(step(`Reset highlight`,
        ops.reset(dpArr.id(remaining))
      ));
    }
  }

  // Write the result
  dpValues[amount] = bestCoins;
  if (bestCoins === Infinity) {
    steps.push(step(`dp[${amount}] stays INF (no coin works)`,
      ops.reset(dpArr.id(amount)),
      ops.setText(status.id, `dp[${amount}] = INF — amount $${amount} is unreachable`)
    ));
  } else {
    steps.push(teach(
      `dp[${amount}] = ${bestCoins} (using coin $${bestCoin})`,
      `Best option for amount <span class="highlight">$${amount}</span>: ` +
        `<span class="success">${bestCoins} coin${bestCoins > 1 ? "s" : ""}</span> (last coin used: $${bestCoin}).`,
      ops.setValue(dpArr.id(amount), bestCoins),
      ops.highlight(dpArr.id(amount), "$success"),
      ops.setText(status.id, `dp[${amount}] = ${bestCoins} (used coin $${bestCoin})`)
    ));

    steps.push(step(`Reset highlight for amount ${amount}`,
      ops.reset(dpArr.id(amount))
    ));
  }
}

// ─── Final answer ───
const answer = dpValues[target];
steps.push(annotatedStep(
  `Answer: dp[${target}] = ${answer} coins to make $${target}`,
  "explanation",
  {
    narration: `<span class="success">Done!</span> dp[${target}] = <span class="success">${answer}</span>. ` +
      `We need at minimum <span class="highlight">${answer} coins</span> to make $${target} ` +
      `using coins [${coins.join(", ")}]. ` +
      'This DP approach tries every coin at every amount, so it runs in ' +
      '<span class="highlight">O(amount x coins)</span> time and ' +
      '<span class="highlight">O(amount)</span> space.',
    phase: "cleanup",
  },
  ops.markDone(dpArr.ids),
  ops.highlight(dpArr.id(target), "$success"),
  ops.setText(status.id, `Answer: ${answer} coins for $${target} — O(amount × coins) time`)
));

const v = viz(
  {
    algorithm: "coin_change",
    title: "Coin Change",
    description: "Find the minimum number of coins to make a target amount using dynamic programming.",
    category: "dynamic-programming",
    difficulty: "beginner",
    complexity: { time: "O(n×k)", space: "O(n)" },
    input: `Coins: [${coins.join(", ")}], Target: ${target}`,
  },
  [dpArr, title, status, dpLabel, coinsLabel, amtPtr],
  steps,
);

process.stdout.write(JSON.stringify(v, null, 2));
