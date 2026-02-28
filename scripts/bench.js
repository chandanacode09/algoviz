#!/usr/bin/env node
/**
 * AlgoViz Generation Benchmark
 *
 * Runs a battery of algorithms through the generation pipeline,
 * measures success rate, classifies failures, and produces a report.
 *
 * Usage:
 *   node scripts/bench.js                    # Run all tiers
 *   node scripts/bench.js --tier 1           # Tier 1 only
 *   node scripts/bench.js --tier 1,2         # Tiers 1 and 2
 *   node scripts/bench.js --model <model>    # Override model
 *   node scripts/bench.js --tokens <n>       # Override maxTokens
 *   node scripts/bench.js --dry-run          # Show suite, don't run
 */

const path = require("path");
const fs = require("fs");
const { generate } = require("../dist/src/generate");

// ─── Test Suite ──────────────────────────────────────────────────────────────

const SUITE = [
  // Tier 1 — Should Always Work
  { tier: 1, prompt: "bubble sort", category: "sorting" },
  { tier: 1, prompt: "binary search", category: "searching" },
  { tier: 1, prompt: "BFS on a graph", category: "graph" },
  { tier: 1, prompt: "reverse a linked list", category: "linked-list" },

  // Tier 2 — Should Usually Work
  { tier: 2, prompt: "merge sort", category: "sorting" },
  { tier: 2, prompt: "valid parentheses using a stack", category: "stack" },
  { tier: 2, prompt: "binary tree inorder traversal", category: "tree" },
  { tier: 2, prompt: "two pointer technique for two sum", category: "searching" },

  // Tier 3 — Stretch Goals
  { tier: 3, prompt: "Dijkstra's shortest path", category: "graph" },
  { tier: 3, prompt: "longest common subsequence DP", category: "dynamic-programming" },
  { tier: 3, prompt: "topological sort", category: "graph" },
  { tier: 3, prompt: "sliding window maximum", category: "searching" },
];

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}
const dryRun = args.includes("--dry-run");
const tierFilter = getArg("tier");
const modelOverride = getArg("model");
const tokensOverride = getArg("tokens");

const tiers = tierFilter
  ? tierFilter.split(",").map(Number)
  : [1, 2, 3];

const suite = SUITE.filter((t) => tiers.includes(t.tier));

// ─── Dry Run ─────────────────────────────────────────────────────────────────

if (dryRun) {
  console.log("\n=== AlgoViz Benchmark — Dry Run ===\n");
  console.log("| # | Algorithm | Tier | Category |");
  console.log("|---|-----------|------|----------|");
  suite.forEach((t, i) => {
    console.log(`| ${i + 1} | ${t.prompt} | ${t.tier} | ${t.category} |`);
  });
  console.log(`\nTotal: ${suite.length} algorithms`);
  if (modelOverride) console.log(`Model override: ${modelOverride}`);
  if (tokensOverride) console.log(`MaxTokens override: ${tokensOverride}`);
  process.exit(0);
}

// ─── Classify Failure ────────────────────────────────────────────────────────

function classifyError(log) {
  for (const entry of log) {
    if (!entry.error) continue;
    const e = entry.error;
    if (!entry.codeGenerated) return "code-extraction";
    if (e.includes("SyntaxError")) return "syntax-error";
    if (e.includes("must have required property") || e.includes("must NOT have additional"))
      return "raw-objects";
    if (e.includes("Cannot read properties of undefined"))
      return "2d-array-access";
    if (e.includes("is not a function")) return "missing-import";
    if (e.includes("not valid JSON")) return "json-parse";
    if (e.includes("annotation") && e.includes("must be equal"))
      return "enum-mismatch";
    if (!entry.executed) return "execution-error";
    if (!entry.validated) return "validation-error";
  }
  return "unknown";
}

function failureStage(log) {
  const last = log[log.length - 1];
  if (!last) return "unknown";
  if (!last.codeGenerated) return "code-extraction";
  if (!last.executed) return "execution";
  if (!last.validated) return "validation";
  return "unknown";
}

// ─── Run Benchmark ───────────────────────────────────────────────────────────

async function run() {
  const packageRoot = path.resolve(__dirname, "..");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = path.join(packageRoot, "output", `bench-${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("\n=== AlgoViz Generation Benchmark ===\n");
  console.log(`Algorithms: ${suite.length}`);
  console.log(`Tiers: ${tiers.join(", ")}`);
  if (modelOverride) console.log(`Model: ${modelOverride}`);
  console.log(`Output: ${outputDir}\n`);

  const results = [];

  for (let i = 0; i < suite.length; i++) {
    const test = suite[i];
    const label = `[${i + 1}/${suite.length}]`;

    console.log(`\n${"─".repeat(60)}`);
    console.log(`${label} T${test.tier}: "${test.prompt}"`);
    console.log(`${"─".repeat(60)}`);

    const t0 = Date.now();

    const result = await generate(test.prompt, {
      maxRetries: 2,
      model: modelOverride || undefined,
      maxTokens: tokensOverride ? parseInt(tokensOverride) : undefined,
      outputDir,
      render: false,
      packageRoot,
      verbose: true,
    });

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    const entry = {
      algorithm: test.prompt,
      tier: test.tier,
      category: test.category,
      success: result.success,
      attempts: result.attempts,
      time: parseFloat(elapsed),
      failureStage: result.success ? null : failureStage(result.log),
      errorCategory: result.success ? null : classifyError(result.log),
      error: result.success ? null : result.error?.slice(0, 200),
    };

    results.push(entry);

    if (result.success) {
      console.log(`  ✅ PASS (attempt ${result.attempts}, ${elapsed}s)`);
    } else {
      console.log(`  ❌ FAIL (${entry.errorCategory}, ${elapsed}s)`);
    }
  }

  // ─── Report ──────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  // Error category counts
  const errorCounts = {};
  failed.forEach((r) => {
    errorCounts[r.errorCategory] = (errorCounts[r.errorCategory] || 0) + 1;
  });

  // Per-tier stats
  const tierStats = {};
  for (const tier of tiers) {
    const tierResults = results.filter((r) => r.tier === tier);
    const tierPassed = tierResults.filter((r) => r.success);
    tierStats[tier] = {
      total: tierResults.length,
      passed: tierPassed.length,
      rate: tierResults.length > 0
        ? ((tierPassed.length / tierResults.length) * 100).toFixed(0)
        : "N/A",
    };
  }

  // Build report
  let report = `# AlgoViz Benchmark Report\n\n`;
  report += `**Date:** ${new Date().toISOString().slice(0, 10)}\n`;
  report += `**Model:** ${modelOverride || "(auto-detected)"}\n`;
  report += `**MaxTokens:** ${tokensOverride || "8192"}\n`;
  report += `**Total Time:** ${results.reduce((s, r) => s + r.time, 0).toFixed(1)}s\n\n`;

  report += `## Results\n\n`;
  report += `| Algorithm | Tier | Result | Attempts | Stage | Error | Time |\n`;
  report += `|-----------|------|--------|----------|-------|-------|------|\n`;
  results.forEach((r) => {
    report += `| ${r.algorithm} | ${r.tier} | ${r.success ? "PASS" : "FAIL"} | ${r.attempts} | ${r.failureStage || "-"} | ${r.errorCategory || "-"} | ${r.time}s |\n`;
  });

  report += `\n## Summary\n\n`;
  report += `- **Overall:** ${passed.length}/${results.length} (${((passed.length / results.length) * 100).toFixed(0)}%)\n`;
  for (const tier of tiers) {
    const s = tierStats[tier];
    report += `- **Tier ${tier}:** ${s.passed}/${s.total} (${s.rate}%)\n`;
  }
  report += `- **Avg attempts (successes):** ${passed.length > 0 ? (passed.reduce((s, r) => s + r.attempts, 0) / passed.length).toFixed(1) : "N/A"}\n`;

  if (Object.keys(errorCounts).length > 0) {
    report += `\n## Failure Modes\n\n`;
    report += `| Error Category | Count |\n`;
    report += `|---------------|-------|\n`;
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        report += `| ${cat} | ${count} |\n`;
      });
  }

  // Check for previous benchmarks
  const benchDir = path.join(packageRoot, "output");
  const prevBenches = fs.readdirSync(benchDir)
    .filter((f) => f.startsWith("bench-") && f !== `bench-${timestamp}`)
    .sort()
    .reverse();

  if (prevBenches.length > 0) {
    const prevPath = path.join(benchDir, prevBenches[0], "results.json");
    if (fs.existsSync(prevPath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(prevPath, "utf-8"));
        const prevPassed = prev.filter((r) => r.success).length;
        const delta = passed.length - prevPassed;
        report += `\n## Delta (vs ${prevBenches[0]})\n\n`;
        report += `- Previous: ${prevPassed}/${prev.length} (${((prevPassed / prev.length) * 100).toFixed(0)}%)\n`;
        report += `- Current: ${passed.length}/${results.length} (${((passed.length / results.length) * 100).toFixed(0)}%)\n`;
        report += `- Change: ${delta > 0 ? "+" : ""}${delta}\n`;
      } catch { /* ignore */ }
    }
  }

  report += `\n## Recommendation\n\n`;
  if (passed.length === results.length) {
    report += `All algorithms passed. Consider adding harder test cases.\n`;
  } else {
    const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];
    report += `To improve from ${((passed.length / results.length) * 100).toFixed(0)}% to higher:\n`;
    report += `- Fix the most common failure mode: **${topError[0]}** (${topError[1]} failures)\n`;
    if (topError[0] === "raw-objects") {
      report += `- The LLM is constructing raw JSON objects instead of using ops/layout functions\n`;
      report += `- Add more WRONG/RIGHT examples to primitives-prompt.md\n`;
    } else if (topError[0] === "2d-array-access") {
      report += `- The LLM is using m.actors[row][col] instead of m.id(row, col)\n`;
      report += `- The matrix few-shot example may need to be more prominent\n`;
    } else if (topError[0] === "syntax-error") {
      report += `- Template literal issues — consider increasing maxTokens or simplifying prompt examples\n`;
    }
  }

  // Save results
  const resultsPath = path.join(outputDir, "results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2) + "\n");

  const reportPath = path.join(outputDir, "report.md");
  fs.writeFileSync(reportPath, report);

  console.log(`\n${"═".repeat(60)}`);
  console.log(report);
  console.log(`\nSaved: ${reportPath}`);
  console.log(`Data:  ${resultsPath}`);
}

run().catch((err) => {
  console.error("Benchmark failed:", err.message);
  process.exit(1);
});
