/**
 * AlgoViz Generation Pipeline
 *
 * Problem → LLM → Schema Validation → Semantic Validation → Player-ready JSON
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx ts-node generate.ts "Visualize quicksort on [7, 2, 1, 6, 8, 5, 3, 4]"
 *   ANTHROPIC_API_KEY=sk-... npx ts-node generate.ts --leetcode "Two Sum II - Input Array Is Sorted"
 *
 * Outputs:
 *   output/<algorithm>.json       — the visualization JSON
 *   output/<algorithm>.html       — self-contained player HTML
 */

import Anthropic from "@anthropic-ai/sdk";
import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

// ─── Config ─────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-20250514";
const MAX_RETRIES = 2;
const MAX_TOKENS = 8192;

// ─── Load assets ────────────────────────────────────────────────────────────

const SCHEMA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "schema.json"), "utf-8")
);

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "prompts", "system-prompt.md"),
  "utf-8"
);

// Load few-shot examples (compact — just the JSON, no explanation)
const EXAMPLES_DIR = path.join(__dirname, "examples");
const FEW_SHOT_EXAMPLES = ["bubble-sort", "binary-search", "two-pointer"]
  .map((name) => {
    const json = fs.readFileSync(
      path.join(EXAMPLES_DIR, `${name}.json`),
      "utf-8"
    );
    return { name, json: JSON.parse(json) };
  });

// Load player HTML template
const PLAYER_HTML = fs.readFileSync(
  path.join(__dirname, "player.html"),
  "utf-8"
);

// ─── Validation ─────────────────────────────────────────────────────────────

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaValidator = ajv.compile(SCHEMA);

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateSchema(data: unknown): ValidationResult {
  const valid = schemaValidator(data);
  if (valid) return { valid: true, errors: [] };
  const errors = (schemaValidator.errors || []).map(
    (e) => `${e.instancePath || "(root)"}: ${e.message}`
  );
  return { valid: false, errors };
}

function validateSemantics(viz: any): ValidationResult {
  const errors: string[] = [];
  const actorIds = new Set<string>();
  const removedIds = new Set<string>();

  // Check actors
  for (const actor of viz.actors) {
    if (actorIds.has(actor.id)) {
      errors.push(`Duplicate actor ID: "${actor.id}"`);
    }
    actorIds.add(actor.id);

    if (actor.type === "edge") {
      if (!actorIds.has(actor.source))
        errors.push(`Edge "${actor.id}" references non-existent source "${actor.source}"`);
      if (!actorIds.has(actor.target))
        errors.push(`Edge "${actor.id}" references non-existent target "${actor.target}"`);
    }
    if (actor.type === "pointer" && !actorIds.has(actor.target)) {
      errors.push(`Pointer "${actor.id}" references non-existent target "${actor.target}"`);
    }
  }

  // Check steps
  for (let i = 0; i < viz.steps.length; i++) {
    const step = viz.steps[i];
    for (const action of step.actions) {
      if (action.type === "update") {
        if (!actorIds.has(action.target))
          errors.push(`Step ${i}: update targets non-existent actor "${action.target}"`);
        if (removedIds.has(action.target))
          errors.push(`Step ${i}: update targets removed actor "${action.target}"`);
      }
      if (action.type === "create") {
        if (actorIds.has(action.actor.id) && !removedIds.has(action.actor.id))
          errors.push(`Step ${i}: create uses existing ID "${action.actor.id}"`);
        actorIds.add(action.actor.id);
        removedIds.delete(action.actor.id);
      }
      if (action.type === "remove") {
        if (!actorIds.has(action.target))
          errors.push(`Step ${i}: remove targets non-existent actor "${action.target}"`);
        removedIds.add(action.target);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validate(data: unknown): ValidationResult {
  const schema = validateSchema(data);
  if (!schema.valid) return schema;
  const semantic = validateSemantics(data);
  return semantic;
}

// ─── LLM Generation ────────────────────────────────────────────────────────

async function generateVisualization(
  client: Anthropic,
  problem: string,
  retryContext?: string
): Promise<string> {
  const fewShotBlock = FEW_SHOT_EXAMPLES.map(
    (ex) =>
      `### Example: ${ex.name}\n\`\`\`json\n${JSON.stringify(ex.json, null, 2).slice(0, 2000)}...\n\`\`\``
  ).join("\n\n");

  const userMessage = retryContext
    ? `${problem}\n\nYour previous attempt had these errors:\n${retryContext}\n\nFix these errors and output the corrected JSON.`
    : problem;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT + "\n\n## Few-Shot Examples\n\n" + fewShotBlock,
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract text content
  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");

  return text;
}

function extractJSON(text: string): unknown | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {}

  // Try extracting from code fences
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }

  // Try finding the first { ... } block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return null;
}

// ─── HTML Output ────────────────────────────────────────────────────────────

function generatePlayerHTML(vizJSON: object): string {
  // Inject the visualization JSON into the player HTML using inline script
  const jsonStr = JSON.stringify(vizJSON);
  const injectScript = `<script type="application/algoviz">${jsonStr}</script>`;

  // Insert before the closing </body> tag, and set root to flex
  return PLAYER_HTML.replace(
    '<div id="algoviz-root"></div>',
    `<div id="algoviz-root" style="display:flex;flex-direction:column;height:100vh;"></div>\n${injectScript}`
  );
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: ANTHROPIC_API_KEY=sk-... npx ts-node generate.ts \"<problem description>\"");
    console.log("  e.g.: npx ts-node generate.ts \"Visualize quicksort on [7, 2, 1, 6, 8, 5, 3, 4]\"");
    process.exit(1);
  }

  const problem = args.join(" ");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable not set");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  console.log(`\n━━━ AlgoViz Generation Pipeline ━━━`);
  console.log(`Problem: ${problem}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Max retries: ${MAX_RETRIES}\n`);

  let attempt = 0;
  let retryContext: string | undefined;
  let vizData: unknown = null;

  while (attempt <= MAX_RETRIES) {
    attempt++;
    console.log(`Attempt ${attempt}/${MAX_RETRIES + 1}...`);

    // Generate
    const t0 = Date.now();
    let rawText: string;
    try {
      rawText = await generateVisualization(client, problem, retryContext);
    } catch (err) {
      console.error(`  ✗ API error: ${(err as Error).message}`);
      continue;
    }
    const genTime = Date.now() - t0;
    console.log(`  Generated in ${genTime}ms (${rawText.length} chars)`);

    // Parse
    const parsed = extractJSON(rawText);
    if (!parsed) {
      console.error(`  ✗ Could not extract valid JSON from response`);
      retryContext = "The response was not valid JSON. Output ONLY the JSON object, no markdown or explanation.";
      continue;
    }
    console.log(`  ✓ JSON parsed`);

    // Validate
    const result = validate(parsed);
    if (!result.valid) {
      console.error(`  ✗ Validation failed (${result.errors.length} errors):`);
      for (const err of result.errors.slice(0, 5)) {
        console.error(`    • ${err}`);
      }
      retryContext = result.errors.join("\n");
      continue;
    }
    console.log(`  ✓ Validation passed`);

    vizData = parsed;
    break;
  }

  if (!vizData) {
    console.error(`\n✗ Failed after ${attempt} attempts`);
    process.exit(1);
  }

  // Output
  const viz = vizData as any;
  const slug = viz.metadata.algorithm || "visualization";
  const jsonPath = path.join(outputDir, `${slug}.json`);
  const htmlPath = path.join(outputDir, `${slug}.html`);

  fs.writeFileSync(jsonPath, JSON.stringify(vizData, null, 2));
  console.log(`\n  → JSON: ${jsonPath}`);

  const html = generatePlayerHTML(vizData as object);
  fs.writeFileSync(htmlPath, html);
  console.log(`  → HTML: ${htmlPath}`);

  // Summary
  console.log(`\n━━━ Summary ━━━`);
  console.log(`  Algorithm: ${viz.metadata.algorithm}`);
  console.log(`  Title: ${viz.metadata.title}`);
  console.log(`  Actors: ${viz.actors.length}`);
  console.log(`  Steps: ${viz.steps.length}`);
  console.log(`  Attempts: ${attempt}`);
  console.log(`\n  Open ${htmlPath} in a browser to view.`);
}

main().catch(console.error);
