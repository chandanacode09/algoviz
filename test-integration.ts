/**
 * Integration test: simulates the full pipeline by feeding
 * a real example through the same extraction → validation → HTML path
 * that generate.ts uses, just without the API call.
 */
import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

const BASE = "/sessions/sharp-beautiful-cray/mnt/chandana/algoviz-schema-v1";

const SCHEMA = JSON.parse(fs.readFileSync(path.join(BASE, "schema.json"), "utf-8"));
const PLAYER_HTML = fs.readFileSync(path.join(BASE, "player.html"), "utf-8");

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaValidator = ajv.compile(SCHEMA);

function extractJSON(text: string): unknown | null {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s !== -1 && e > s) { try { return JSON.parse(text.slice(s, e + 1)); } catch {} }
  return null;
}

// Simulate LLM output: wrap real example in markdown like LLM would
const realJSON = fs.readFileSync(path.join(BASE, "examples", "bubble-sort.json"), "utf-8");
const simulatedLLMOutput = `Here's the visualization for bubble sort:

\`\`\`json
${realJSON}
\`\`\`

This visualization shows the bubble sort algorithm step by step.`;

console.log("━━━ Integration Test: Simulated LLM → Player ━━━\n");

// Step 1: Extract JSON
console.log("1. Extracting JSON from simulated LLM response...");
const parsed = extractJSON(simulatedLLMOutput);
if (!parsed) { console.error("   ✗ Failed to extract JSON"); process.exit(1); }
console.log("   ✓ JSON extracted");

// Step 2: Schema validation
console.log("2. Schema validation...");
const valid1 = schemaValidator(parsed);
if (!valid1) { console.error("   ✗ Schema failed:", schemaValidator.errors); process.exit(1); }
console.log("   ✓ Schema valid");

// Step 3: Semantic validation
console.log("3. Semantic validation...");
const viz = parsed as any;
const actorIds = new Set(viz.actors.map((a: any) => a.id));
let semErrors = 0;
for (let i = 0; i < viz.steps.length; i++) {
  for (const action of viz.steps[i].actions) {
    if (action.type === "update" && !actorIds.has(action.target)) {
      console.error(`   ✗ Step ${i}: bad target "${action.target}"`);
      semErrors++;
    }
    if (action.type === "create") actorIds.add(action.actor.id);
  }
}
if (semErrors > 0) { console.error(`   ✗ ${semErrors} semantic errors`); process.exit(1); }
console.log("   ✓ Semantics valid");

// Step 4: Generate HTML
console.log("4. Generating player HTML...");
const jsonStr = JSON.stringify(parsed);
const injectScript = `<script type="application/algoviz">${jsonStr}</script>`;
const html = PLAYER_HTML.replace(
  '<div id="algoviz-root"></div>',
  `<div id="algoviz-root" style="display:flex;flex-direction:column;height:100vh;"></div>\n${injectScript}`
);
console.log(`   ✓ HTML generated (${html.length} bytes)`);

// Step 5: Write output
const outDir = "/sessions/sharp-beautiful-cray";
const htmlPath = path.join(outDir, "integration-test-output.html");
const jsonPath = path.join(outDir, "integration-test-output.json");
fs.writeFileSync(htmlPath, html);
fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2));
console.log(`   → JSON: ${jsonPath}`);
console.log(`   → HTML: ${htmlPath}`);

// Summary
console.log(`\n━━━ Summary ━━━`);
console.log(`  Algorithm: ${viz.metadata.algorithm}`);
console.log(`  Title: ${viz.metadata.title}`);
console.log(`  Actors: ${viz.actors.length}`);
console.log(`  Steps: ${viz.steps.length}`);
console.log(`  HTML size: ${(html.length / 1024).toFixed(1)} KB`);
console.log(`\n  ✓ Full pipeline integration test passed\n`);
