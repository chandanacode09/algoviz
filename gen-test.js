#!/usr/bin/env node
/**
 * gen-test.js — AlgoViz Generation Test Harness
 *
 * Takes a .js file that uses primitives, runs it, validates output.
 *
 * Usage:
 *   node gen-test.js examples/gen/selection-sort.js
 *   node gen-test.js examples/gen/selection-sort.js --render
 *   node gen-test.js examples/gen/*.js              # batch mode
 *   node gen-test.js examples/gen/*.js --render     # batch + render all
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { validate, summarize, renderToFile } = require("./dist/src/index");

const args = process.argv.slice(2);
const doRender = args.includes("--render");
const files = args.filter(a => !a.startsWith("--"));

if (files.length === 0) {
  console.error("Usage: node gen-test.js <file.js> [--render]");
  process.exit(1);
}

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const file of files) {
  const name = path.basename(file, ".js");
  process.stdout.write(`\n━━━ ${name} ━━━\n`);

  // 1. Run the generated script
  let jsonStr;
  try {
    jsonStr = execSync(`node "${path.resolve(file)}"`, {
      cwd: __dirname,
      encoding: "utf-8",
      timeout: 10000,
      env: { ...process.env, NODE_PATH: path.join(__dirname, "node_modules") },
    });
  } catch (e) {
    console.error(`  ✗ RUNTIME ERROR: ${e.stderr || e.message}`);
    totalFailed++;
    results.push({ name, status: "RUNTIME_ERROR", error: (e.stderr || e.message).slice(0, 200) });
    continue;
  }

  // 2. Parse JSON
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error(`  ✗ JSON PARSE ERROR: ${e.message}`);
    totalFailed++;
    results.push({ name, status: "JSON_ERROR", error: e.message });
    continue;
  }

  // 3. Validate
  const vr = validate(data);
  if (!vr.valid) {
    console.error(`  ✗ VALIDATION FAILED (${vr.errors.length} errors):`);
    for (const err of vr.errors.slice(0, 5)) {
      console.error(`    [${err.location}] ${err.message}`);
    }
    totalFailed++;
    results.push({ name, status: "VALIDATION_FAILED", errorCount: vr.errors.length });
    continue;
  }

  // 4. Summarize
  const s = summarize(data);
  console.log(`  ✓ VALID | ${s.actorCount} actors | ${s.stepCount} steps | ${s.actionCount.total} actions`);
  if (vr.warnings.length > 0) {
    console.log(`  ⚠ ${vr.warnings.length} warning(s)`);
  }
  totalPassed++;

  // 5. Save JSON
  const outDir = path.join(__dirname, "output", "gen");
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${name}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");

  // 6. Optional render
  if (doRender) {
    const htmlPath = path.join(outDir, `${name}.html`);
    renderToFile(data, htmlPath);
    const size = (fs.statSync(htmlPath).size / 1024).toFixed(1);
    console.log(`  → HTML: ${htmlPath} (${size} KB)`);
  }

  results.push({ name, status: "PASS", actors: s.actorCount, steps: s.stepCount, actions: s.actionCount.total });
}

// Summary
console.log(`\n${"═".repeat(60)}`);
console.log(`RESULTS: ${totalPassed} passed, ${totalFailed} failed out of ${files.length}`);
console.log(`Pass rate: ${((totalPassed / files.length) * 100).toFixed(0)}%`);

if (totalFailed > 0) {
  console.log("\nFailures:");
  for (const r of results.filter(r => r.status !== "PASS")) {
    console.log(`  ${r.name}: ${r.status}${r.error ? " — " + r.error.slice(0, 100) : ""}`);
  }
}

console.log();
process.exit(totalFailed > 0 ? 1 : 0);
