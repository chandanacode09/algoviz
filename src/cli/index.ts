#!/usr/bin/env node
/**
 * AlgoViz CLI
 *
 * Usage:
 *   algoviz validate <file.json> [file2.json ...] [--fix]
 *   algoviz render <file.json> [-o output.html] [--fix]
 *   algoviz info <file.json>
 *   algoviz generate "algorithm description" [-o dir] [--render] [--retries N] [--model name] [-v]
 */

import * as fs from "fs";
import * as path from "path";
import { validate, summarize, renderHTML, renderToFile, normalize } from "../index";
import { generate, generateBatch } from "../generate";
import type { Visualization } from "../types";

const args = process.argv.slice(2);
const command = args[0];

function usage(): void {
  console.log(`
  algoviz — Algorithm Visualization Toolkit

  Commands:
    validate <file.json> [...]        Validate AlgoViz JSON files
    render <file.json> [-o out]       Render to self-contained HTML
    info <file.json>                  Show visualization summary
    generate "description" [opts]     Generate visualization via LLM

  Validate/Render Options:
    --fix                             Auto-correct common LLM mistakes

  Generate Options:
    -o, --output <dir>                Output directory (default: ./output/gen)
    --render                          Also produce HTML artifact
    --retries <N>                     Max retry attempts (default: 2)
    --model <name>                    Model to use (default: auto-detected)
    --max-tokens <N>                  Max tokens for LLM response (default: 4096)
    --exec-timeout <ms>              Code execution timeout in ms (default: 15000)
    --http-timeout <ms>              HTTP request timeout in ms (default: 60000)
    -v, --verbose                     Show debug output
    --batch "algo1" "algo2" ...       Generate multiple algorithms

  General:
    -h, --help                        Show this help

  Environment:
    OPENROUTER_API_KEY               API key for OpenRouter (preferred)
    ANTHROPIC_API_KEY                 API key for Anthropic (fallback)

  Examples:
    algoviz validate examples/*.json
    algoviz validate examples/*.json --fix
    algoviz render viz.json -o viz.html --fix
    algoviz info viz.json
    algoviz generate "merge sort on [38, 27, 43, 3, 9, 82, 10]"
    algoviz generate "dijkstra's algorithm" --render -v
    algoviz generate --batch "insertion sort" "heap sort" "BFS" --render
`);
}

function loadJSON(filePath: string): unknown {
  const absPath = path.resolve(filePath);
  const raw = fs.readFileSync(absPath, "utf-8");
  return JSON.parse(raw);
}

function cmdValidate(files: string[], fix: boolean): void {
  if (files.length === 0) {
    console.error("Error: No files specified");
    process.exit(1);
  }

  let allPassed = true;

  for (const file of files) {
    const name = path.basename(file);
    console.log(`\n━━━ ${name} ━━━`);

    let data: unknown;
    try {
      data = loadJSON(file);
    } catch (e) {
      console.error(`  ✗ ${(e as Error).message}`);
      allPassed = false;
      continue;
    }

    // Apply auto-fix if requested
    if (fix) {
      const nr = normalize(data);
      if (nr.fixes.length > 0) {
        console.log(`  🔧 ${nr.fixes.length} auto-fix(es):`);
        for (const f of nr.fixes) {
          console.log(`    ${f.path}: ${f.from} → ${f.to}`);
        }
        data = nr.data;
        // Write fixed file back
        fs.writeFileSync(path.resolve(file), JSON.stringify(data, null, 2) + "\n", "utf-8");
        console.log(`  💾 Saved fixes to ${name}`);
      }
    }

    const result = validate(data);

    if (result.errors.length > 0) {
      console.error(`  ✗ ${result.errors.length} error(s):`);
      for (const e of result.errors) {
        console.error(`    [${e.location}] ${e.message}`);
      }
      allPassed = false;
    } else {
      console.log("  ✓ Valid");
    }

    if (result.warnings.length > 0) {
      console.warn(`  ⚠ ${result.warnings.length} warning(s):`);
      for (const w of result.warnings) {
        console.warn(`    [${w.location}] ${w.message}`);
      }
    }

    const viz = data as Visualization;
    const s = summarize(viz);
    console.log(`  ${s.title} | ${s.actorCount} actors | ${s.stepCount} steps`);
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(allPassed ? "All files valid ✓" : "Some files invalid ✗");
  process.exit(allPassed ? 0 : 1);
}

function cmdRender(files: string[], outputFlag: string | null, fix: boolean): void {
  if (files.length === 0) {
    console.error("Error: No file specified");
    process.exit(1);
  }

  const file = files[0];
  let data: unknown;
  try {
    data = loadJSON(file);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }

  // Apply auto-fix if requested
  if (fix) {
    const nr = normalize(data);
    if (nr.fixes.length > 0) {
      console.log(`🔧 ${nr.fixes.length} auto-fix(es) applied:`);
      for (const f of nr.fixes) {
        console.log(`  ${f.path}: ${f.from} → ${f.to}`);
      }
      data = nr.data;
    }
  }

  const result = validate(data);
  if (!result.valid) {
    console.error("Validation failed:");
    for (const e of result.errors) console.error(`  ${e.message}`);
    process.exit(1);
  }

  const viz = data as Visualization;
  const outPath = outputFlag || file.replace(/\.json$/, ".html");

  renderToFile(viz, outPath);
  const size = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Rendered: ${outPath} (${size} KB)`);
}

function cmdInfo(files: string[]): void {
  if (files.length === 0) {
    console.error("Error: No file specified");
    process.exit(1);
  }

  for (const file of files) {
    let data: unknown;
    try {
      data = loadJSON(file);
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      continue;
    }

    const result = validate(data);
    if (!result.valid) {
      console.error(`${path.basename(file)}: invalid`);
      continue;
    }

    const viz = data as Visualization;
    const s = summarize(viz);
    console.log(`
  ${s.title}
  Algorithm:  ${s.algorithm}
  Actors:     ${s.actorCount} (${Object.entries(s.actorsByType).map(([t, c]) => `${c} ${t}`).join(", ")})
  Steps:      ${s.stepCount}
  Actions:    ${s.actionCount.total} (${s.actionCount.update} update, ${s.actionCount.create} create, ${s.actionCount.remove} remove)
  Complexity: ${s.complexity?.time || "?"} time, ${s.complexity?.space || "?"} space`);
  }
}

async function cmdGenerate(restArgs: string[]): Promise<void> {
  // Parse generate-specific flags
  const verbose = restArgs.includes("-v") || restArgs.includes("--verbose");
  const doRender = restArgs.includes("--render");
  const isBatch = restArgs.includes("--batch");

  // Extract --retries N
  let maxRetries = 2;
  const retriesIdx = restArgs.indexOf("--retries");
  if (retriesIdx !== -1 && restArgs[retriesIdx + 1]) {
    maxRetries = parseInt(restArgs[retriesIdx + 1], 10) || 2;
  }

  // Extract --model name (undefined = use backend default)
  let model: string | undefined;
  const modelIdx = restArgs.indexOf("--model");
  if (modelIdx !== -1 && restArgs[modelIdx + 1]) {
    model = restArgs[modelIdx + 1];
  }

  // Extract -o dir
  let outputDir = path.resolve("output/gen");
  const outIdx = restArgs.indexOf("-o") !== -1 ? restArgs.indexOf("-o") : restArgs.indexOf("--output");
  if (outIdx !== -1 && restArgs[outIdx + 1]) {
    outputDir = path.resolve(restArgs[outIdx + 1]);
  }

  // Extract --max-tokens N
  let maxTokens: number | undefined;
  const maxTokensIdx = restArgs.indexOf("--max-tokens");
  if (maxTokensIdx !== -1 && restArgs[maxTokensIdx + 1]) {
    maxTokens = parseInt(restArgs[maxTokensIdx + 1], 10) || undefined;
  }

  // Extract --exec-timeout ms
  let execTimeout: number | undefined;
  const execTimeoutIdx = restArgs.indexOf("--exec-timeout");
  if (execTimeoutIdx !== -1 && restArgs[execTimeoutIdx + 1]) {
    execTimeout = parseInt(restArgs[execTimeoutIdx + 1], 10) || undefined;
  }

  // Extract --http-timeout ms
  let httpTimeout: number | undefined;
  const httpTimeoutIdx = restArgs.indexOf("--http-timeout");
  if (httpTimeoutIdx !== -1 && restArgs[httpTimeoutIdx + 1]) {
    httpTimeout = parseInt(restArgs[httpTimeoutIdx + 1], 10) || undefined;
  }

  // Determine package root: __dirname = dist/src/cli → go up 3 levels
  const packageRoot = path.resolve(__dirname, "..", "..", "..");

  // Collect algorithm descriptions (non-flag args)
  const flagsWithArgs = new Set(["--retries", "--model", "-o", "--output", "--max-tokens", "--exec-timeout", "--http-timeout"]);
  const flagsNoArgs = new Set(["-v", "--verbose", "--render", "--batch", "-h", "--help"]);
  const algorithms: string[] = [];

  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i];
    if (flagsWithArgs.has(arg)) { i++; continue; } // skip flag + its value
    if (flagsNoArgs.has(arg)) continue;
    algorithms.push(arg);
  }

  if (algorithms.length === 0) {
    console.error("Error: No algorithm description provided");
    console.error('Usage: algoviz generate "merge sort on [5, 3, 8, 1]"');
    process.exit(1);
  }

  const options = {
    maxRetries,
    model,
    outputDir,
    render: doRender,
    packageRoot,
    verbose,
    ...(maxTokens !== undefined && { maxTokens }),
    ...(execTimeout !== undefined && { execTimeout }),
    ...(httpTimeout !== undefined && { httpTimeout }),
  };

  console.log(`\n🧬 AlgoViz Generate`);
  console.log(`   Model: ${model || "(auto-detect from backend)"}`);

  console.log(`   Retries: ${maxRetries}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Algorithms: ${algorithms.length}`);

  if (isBatch || algorithms.length > 1) {
    // Batch mode
    const results = await generateBatch(algorithms, options);

    console.log(`\n${"═".repeat(60)}`);
    let passed = 0;
    let failed = 0;
    for (const r of results) {
      if (r.success) {
        passed++;
        const s = summarize(r.visualization!);
        console.log(`  ✓ ${r.algorithm} (attempt ${r.attempts}) | ${s.actorCount} actors | ${s.stepCount} steps`);
        if (r.files?.html) console.log(`    → ${r.files.html}`);
      } else {
        failed++;
        console.log(`  ✗ ${r.algorithm}: ${r.error?.slice(0, 100)}`);
      }
    }

    console.log(`\n${"═".repeat(60)}`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`First-pass rate: ${results.filter(r => r.attempts === 1 && r.success).length}/${results.length}`);
    console.log(`Final pass rate: ${passed}/${results.length}`);
    process.exit(failed > 0 ? 1 : 0);
  } else {
    // Single algorithm
    const prompt = algorithms[0];
    console.log(`   Prompt: "${prompt}"\n`);

    const result = await generate(prompt, options);

    if (result.success) {
      const s = summarize(result.visualization!);
      console.log(`\n✓ Generated "${result.algorithm}" in ${result.attempts} attempt(s)`);
      console.log(`  ${s.actorCount} actors | ${s.stepCount} steps | ${s.actionCount.total} actions`);
      if (result.files?.json) console.log(`  JSON: ${result.files.json}`);
      if (result.files?.html) console.log(`  HTML: ${result.files.html}`);
      if (result.files?.js) console.log(`  Source: ${result.files.js}`);
    } else {
      console.error(`\n✗ Failed after ${result.attempts} attempts`);
      console.error(`  Error: ${result.error}`);
      for (const l of result.log) {
        console.error(`  Attempt ${l.attempt}: code=${l.codeGenerated} exec=${l.executed} valid=${l.validated}${l.error ? " err=" + l.error.slice(0, 80) : ""}`);
      }
      process.exit(1);
    }
  }
}

// ─── Parse flags ────────────────────────────────────────────────────────────

if (!command || command === "-h" || command === "--help") {
  usage();
  process.exit(0);
}

const restArgs = args.slice(1);

if (command === "generate") {
  // Generate is async — handle it separately
  cmdGenerate(restArgs).catch((e) => {
    console.error(`Fatal: ${(e as Error).message}`);
    process.exit(1);
  });
} else {
  // Synchronous commands

  // Extract --fix flag
  const fixIdx = restArgs.indexOf("--fix");
  const fix = fixIdx !== -1;
  const argsNoFix = fix ? [...restArgs.slice(0, fixIdx), ...restArgs.slice(fixIdx + 1)] : restArgs;

  // Extract -o/--output flag
  const outputIdx = argsNoFix.indexOf("-o") !== -1 ? argsNoFix.indexOf("-o") : argsNoFix.indexOf("--output");
  let outputFlag: string | null = null;
  let fileArgs = argsNoFix;

  if (outputIdx !== -1) {
    outputFlag = argsNoFix[outputIdx + 1] || null;
    fileArgs = [...argsNoFix.slice(0, outputIdx), ...argsNoFix.slice(outputIdx + 2)];
  }

  switch (command) {
    case "validate": cmdValidate(fileArgs, fix); break;
    case "render": cmdRender(fileArgs, outputFlag, fix); break;
    case "info": cmdInfo(fileArgs); break;
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}
