/**
 * Dry-run test: validates the pipeline stages work correctly
 * without needing a real API call.
 * 
 * Tests: JSON extraction → schema validation → semantic validation → HTML generation
 */

import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

const SCHEMA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "schema.json"), "utf-8")
);
const PLAYER_HTML = fs.readFileSync(
  path.join(__dirname, "player.html"),
  "utf-8"
);

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaValidator = ajv.compile(SCHEMA);

// --- Reused from generate.ts ---

function extractJSON(text: string): unknown | null {
  try { return JSON.parse(text); } catch {}
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch) { try { return JSON.parse(fenceMatch[1]); } catch {} }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) { try { return JSON.parse(text.slice(start, end + 1)); } catch {} }
  return null;
}

function validateSchema(data: unknown) {
  const valid = schemaValidator(data);
  if (valid) return { valid: true, errors: [] as string[] };
  return { valid: false, errors: (schemaValidator.errors || []).map(e => `${e.instancePath || "(root)"}: ${e.message}`) };
}

function validateSemantics(viz: any) {
  const errors: string[] = [];
  const actorIds = new Set<string>();
  const removedIds = new Set<string>();
  for (const actor of viz.actors) {
    if (actorIds.has(actor.id)) errors.push(`Duplicate actor ID: "${actor.id}"`);
    actorIds.add(actor.id);
    if (actor.type === "edge") {
      if (!actorIds.has(actor.source)) errors.push(`Edge "${actor.id}" bad source`);
      if (!actorIds.has(actor.target)) errors.push(`Edge "${actor.id}" bad target`);
    }
    if (actor.type === "pointer" && !actorIds.has(actor.target))
      errors.push(`Pointer "${actor.id}" bad target`);
  }
  for (let i = 0; i < viz.steps.length; i++) {
    for (const action of viz.steps[i].actions) {
      if (action.type === "update" && !actorIds.has(action.target))
        errors.push(`Step ${i}: update targets "${action.target}" (not found)`);
      if (action.type === "create") { actorIds.add(action.actor.id); removedIds.delete(action.actor.id); }
      if (action.type === "remove") removedIds.add(action.target);
    }
  }
  return { valid: errors.length === 0, errors };
}

function generatePlayerHTML(vizJSON: object): string {
  const jsonStr = JSON.stringify(vizJSON);
  const injectScript = `<script type="application/algoviz">${jsonStr}</script>`;
  return PLAYER_HTML.replace(
    '<div id="algoviz-root"></div>',
    `<div id="algoviz-root" style="display:flex;flex-direction:column;height:100vh;"></div>\n${injectScript}`
  );
}

// --- Tests ---

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}: ${(e as Error).message}`); failed++; }
}

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

console.log("\n━━━ Pipeline Dry-Run Tests ━━━\n");

// 1. JSON Extraction
console.log("JSON Extraction:");
test("Direct JSON parse", () => {
  const r = extractJSON('{"version":"1.0"}');
  assert(r !== null && (r as any).version === "1.0", "Should parse raw JSON");
});
test("Extract from code fence", () => {
  const r = extractJSON('Here is the viz:\n```json\n{"version":"1.0"}\n```\nDone.');
  assert(r !== null && (r as any).version === "1.0", "Should extract from fences");
});
test("Extract from mixed text", () => {
  const r = extractJSON('The output is: {"version":"1.0","metadata":{}} and that is it.');
  assert(r !== null && (r as any).version === "1.0", "Should find first {} block");
});
test("Return null for garbage", () => {
  assert(extractJSON("no json here at all") === null, "Should return null");
});

// 2. Schema Validation
console.log("\nSchema Validation:");
const examples = ["bubble-sort", "binary-search", "bfs-graph", "two-pointer"];
for (const name of examples) {
  test(`${name}.json passes schema`, () => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", `${name}.json`), "utf-8"));
    const result = validateSchema(data);
    assert(result.valid, `Failed: ${result.errors.join(", ")}`);
  });
}
test("Missing version fails schema", () => {
  const result = validateSchema({ metadata: {}, actors: [], steps: [] });
  assert(!result.valid, "Should reject missing version");
});
test("Bad actor type fails schema", () => {
  const result = validateSchema({
    version: "1.0",
    metadata: { algorithm: "x", title: "x", description: "x", category: "sorting", complexity: { time: "O(1)", space: "O(1)" }, difficulty: "beginner", inputDescription: "x" },
    actors: [{ id: "a", type: "banana", x: 0, y: 0 }],
    steps: []
  });
  assert(!result.valid, "Should reject unknown actor type");
});

// 3. Semantic Validation
console.log("\nSemantic Validation:");
for (const name of examples) {
  test(`${name}.json passes semantics`, () => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", `${name}.json`), "utf-8"));
    const result = validateSemantics(data);
    assert(result.valid, `Failed: ${result.errors.join(", ")}`);
  });
}
test("Duplicate actor ID caught", () => {
  const result = validateSemantics({
    actors: [
      { id: "a", type: "cell", x: 0, y: 0, value: 1 },
      { id: "a", type: "cell", x: 100, y: 0, value: 2 }
    ],
    steps: []
  });
  assert(!result.valid, "Should catch duplicate IDs");
});
test("Bad update target caught", () => {
  const result = validateSemantics({
    actors: [{ id: "a", type: "cell", x: 0, y: 0, value: 1 }],
    steps: [{ description: "x", actions: [{ type: "update", target: "nonexistent", props: {} }] }]
  });
  assert(!result.valid, "Should catch bad target");
});

// 4. HTML Generation
console.log("\nHTML Generation:");
test("Generates valid HTML with embedded JSON", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const html = generatePlayerHTML(data);
  assert(html.includes('<script type="application/algoviz">'), "Should have algoviz script tag");
  assert(html.includes("bubble_sort"), "Should contain the viz data");
  assert(html.length > 5000, "Should be substantial HTML");
});
test("HTML output file is valid", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "examples", "bubble-sort.json"), "utf-8"));
  const html = generatePlayerHTML(data);
  const outPath = path.join(__dirname, "output", "test-quicksort.html");
  if (!fs.existsSync(path.join(__dirname, "output"))) fs.mkdirSync(path.join(__dirname, "output"));
  fs.writeFileSync(outPath, html);
  assert(fs.existsSync(outPath), "Output file should exist");
  const written = fs.readFileSync(outPath, "utf-8");
  assert(written === html, "Written file should match");
  fs.unlinkSync(outPath);
});

// Summary
console.log(`\n══════════════════════════════════════════════════`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log("  All pipeline stages working correctly ✓\n");
