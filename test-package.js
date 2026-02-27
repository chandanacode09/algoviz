/**
 * AlgoViz npm package test — exercises the full public API
 */
const path = require("path");
const fs = require("fs");

// Import from the built dist
const { validate, validateSchemaOnly, summarize, Engine, renderHTML, schema } = require("./dist/src/index");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); failed++; }
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

console.log("\n━━━ AlgoViz Package Tests ━━━\n");

// ─── Schema export ──────────────────────────────────────────────────────────

console.log("Schema:");
test("schema object exported", () => {
  assert(schema.$id === "https://algoviz.dev/schema/v1/visualization.json", "Wrong $id");
});

// ─── Validation ─────────────────────────────────────────────────────────────

console.log("\nValidation:");
const examples = ["bubble-sort", "binary-search", "bfs-graph", "two-pointer", "merge-sort", "dijkstra", "valid-parentheses", "sliding-window"];

for (const name of examples) {
  test(`validate ${name}`, () => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", `${name}.json`), "utf-8"));
    const result = validate(data);
    assert(result.valid, `Failed: ${result.errors.map(e => e.message).join(", ")}`);
  });
}

test("rejects missing version", () => {
  const result = validate({ metadata: { algorithm: "x", title: "x" }, actors: [], steps: [] });
  assert(!result.valid, "Should reject");
});

test("rejects bad actor type", () => {
  const result = validate({
    version: "1.0",
    metadata: { algorithm: "x", title: "x", description: "x", category: "sorting", complexity: { time: "O(1)", space: "O(1)" }, difficulty: "beginner", inputDescription: "x" },
    actors: [{ id: "a", type: "banana", x: 0, y: 0 }],
    steps: []
  });
  assert(!result.valid, "Should reject unknown actor");
});

test("schemaOnly fast path", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const result = validateSchemaOnly(data);
  assert(result.valid, "Should pass");
});

// ─── Summarize ──────────────────────────────────────────────────────────────

console.log("\nSummarize:");
test("produces correct summary", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "dijkstra.json"), "utf-8"));
  const s = summarize(data);
  assert(s.algorithm === "dijkstra", `Expected dijkstra, got ${s.algorithm}`);
  assert(s.actorCount === 15, `Expected 15 actors, got ${s.actorCount}`);
  assert(s.stepCount === 8, `Expected 8 steps, got ${s.stepCount}`);
  assert(s.actorsByType.node === 5, "Expected 5 nodes");
  assert(s.actorsByType.edge === 7, "Expected 7 edges");
});

// ─── Engine ─────────────────────────────────────────────────────────────────

console.log("\nEngine:");
test("initial state", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const engine = new Engine(data);
  assert(engine.currentStep === -1, "Should start at -1");
  assert(engine.totalSteps === 15, `Expected 15 steps, got ${engine.totalSteps}`);
  assert(engine.atStart, "Should be at start");
  assert(!engine.atEnd, "Should not be at end");
});

test("step forward and back", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const engine = new Engine(data);

  const scene1 = engine.nextStep();
  assert(scene1 !== null, "Should return scene");
  assert(engine.currentStep === 0, "Should be at step 0");

  const scene2 = engine.nextStep();
  assert(engine.currentStep === 1, "Should be at step 1");

  const scene3 = engine.prevStep();
  assert(engine.currentStep === 0, "Should be back at step 0");
});

test("goToStep deterministic", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const engine = new Engine(data);

  const scene5 = engine.goToStep(5);
  const actors5 = Array.from(scene5.actors.values());

  // Reset and go again — should be identical
  engine.goToStep(-1);
  const scene5b = engine.goToStep(5);
  const actors5b = Array.from(scene5b.actors.values());

  assert(JSON.stringify(actors5) === JSON.stringify(actors5b), "Should be deterministic");
});

test("resolveColor", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const engine = new Engine(data);
  assert(engine.resolveColor("$primary") === "#3b82f6", "Should resolve $primary");
  assert(engine.resolveColor("$success") === "#10b981", "Should resolve $success");
  assert(engine.resolveColor("#ff0000") === "#ff0000", "Should pass hex through");
  assert(engine.resolveColor(null) === null, "Null returns null");
});

test("atEnd after last step", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const engine = new Engine(data);
  engine.goToStep(14);
  assert(engine.atEnd, "Should be at end");
  assert(engine.nextStep() === null, "Next should return null at end");
});

// ─── Render ─────────────────────────────────────────────────────────────────

console.log("\nRender:");
test("renderHTML produces self-contained HTML", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "sliding-window.json"), "utf-8"));
  const html = renderHTML(data);
  assert(html.includes("<!DOCTYPE html>"), "Should have DOCTYPE");
  assert(html.includes('script type="application/algoviz"'), "Should have algoviz tag");
  assert(html.includes("sliding_window"), "Should contain the data");
  assert(html.includes("class Engine"), "Should have engine code");
  assert(html.length > 10000, "Should be substantial");
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed === 0) console.log("  ✓ All package tests passed\n");
else process.exit(1);
