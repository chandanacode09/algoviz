/**
 * AlgoViz Visualization Validator
 *
 * Two layers of validation:
 * 1. JSON Schema validation (structural correctness)
 * 2. Semantic validation (referential integrity, constraint checking)
 *
 * Usage:
 *   npx ts-node validate.ts examples/bubble-sort.json
 *   npx ts-node validate.ts examples/*.json
 */

import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";
import type { Visualization, Actor, Step, Action } from "./types";

// ─── Schema Validation ──────────────────────────────────────────────────────

function loadSchema(): object {
  const schemaPath = path.join(__dirname, "schema.json");
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}

function validateSchema(data: unknown): { valid: boolean; errors: string[] } {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schema = loadSchema();
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map((e) => {
    const loc = e.instancePath || "(root)";
    return `${loc}: ${e.message}`;
  });

  return { valid: false, errors };
}

// ─── Semantic Validation ────────────────────────────────────────────────────

interface SemanticError {
  severity: "error" | "warning";
  step: number | null; // null = global, number = step index
  message: string;
}

function validateSemantics(viz: Visualization): SemanticError[] {
  const errors: SemanticError[] = [];

  // Track actor state throughout the visualization
  const actorMap = new Map<string, { type: string; removed: boolean }>();

  // ── Check initial actors ──

  // Unique IDs
  const seenIds = new Set<string>();
  for (const actor of viz.actors) {
    if (seenIds.has(actor.id)) {
      errors.push({
        severity: "error",
        step: null,
        message: `Duplicate actor ID: "${actor.id}"`,
      });
    }
    seenIds.add(actor.id);
    actorMap.set(actor.id, { type: actor.type, removed: false });
  }

  // Edge source/target references
  for (const actor of viz.actors) {
    if (actor.type === "edge") {
      if (!actorMap.has(actor.source)) {
        errors.push({
          severity: "error",
          step: null,
          message: `Edge "${actor.id}" references non-existent source node "${actor.source}"`,
        });
      } else {
        const sourceActor = viz.actors.find((a) => a.id === actor.source);
        if (sourceActor && sourceActor.type !== "node") {
          errors.push({
            severity: "warning",
            step: null,
            message: `Edge "${actor.id}" source "${actor.source}" is a ${sourceActor.type}, not a node`,
          });
        }
      }
      if (!actorMap.has(actor.target)) {
        errors.push({
          severity: "error",
          step: null,
          message: `Edge "${actor.id}" references non-existent target node "${actor.target}"`,
        });
      } else {
        const targetActor = viz.actors.find((a) => a.id === actor.target);
        if (targetActor && targetActor.type !== "node") {
          errors.push({
            severity: "warning",
            step: null,
            message: `Edge "${actor.id}" target "${actor.target}" is a ${targetActor.type}, not a node`,
          });
        }
      }
    }

    if (actor.type === "pointer") {
      if (!actorMap.has(actor.target)) {
        errors.push({
          severity: "error",
          step: null,
          message: `Pointer "${actor.id}" references non-existent target "${actor.target}"`,
        });
      }
    }
  }

  // ── Check steps ──

  for (let i = 0; i < viz.steps.length; i++) {
    const step = viz.steps[i];

    if (!step.description || step.description.trim() === "") {
      errors.push({
        severity: "warning",
        step: i,
        message: `Step ${i} has empty description`,
      });
    }

    for (const action of step.actions) {
      switch (action.type) {
        case "update": {
          const actor = actorMap.get(action.target);
          if (!actor) {
            errors.push({
              severity: "error",
              step: i,
              message: `Update targets non-existent actor "${action.target}"`,
            });
          } else if (actor.removed) {
            errors.push({
              severity: "error",
              step: i,
              message: `Update targets removed actor "${action.target}"`,
            });
          }

          // Check for empty props
          if (!action.props || Object.keys(action.props).length === 0) {
            errors.push({
              severity: "warning",
              step: i,
              message: `Update on "${action.target}" has no properties to change`,
            });
          }

          // Validate pointer target updates reference existing actors
          if (
            action.props &&
            "target" in action.props &&
            actor?.type === "pointer"
          ) {
            const newTarget = action.props.target as string;
            const targetActor = actorMap.get(newTarget);
            if (!targetActor) {
              errors.push({
                severity: "error",
                step: i,
                message: `Pointer "${action.target}" updated to reference non-existent actor "${newTarget}"`,
              });
            } else if (targetActor.removed) {
              errors.push({
                severity: "error",
                step: i,
                message: `Pointer "${action.target}" updated to reference removed actor "${newTarget}"`,
              });
            }
          }
          break;
        }

        case "create": {
          const newActor = action.actor;
          if (actorMap.has(newActor.id)) {
            const existing = actorMap.get(newActor.id)!;
            if (!existing.removed) {
              errors.push({
                severity: "error",
                step: i,
                message: `Create action uses ID "${newActor.id}" which already exists`,
              });
            }
            // If previously removed, re-creation is allowed
          }
          actorMap.set(newActor.id, {
            type: newActor.type,
            removed: false,
          });
          break;
        }

        case "remove": {
          const actor = actorMap.get(action.target);
          if (!actor) {
            errors.push({
              severity: "error",
              step: i,
              message: `Remove targets non-existent actor "${action.target}"`,
            });
          } else if (actor.removed) {
            errors.push({
              severity: "warning",
              step: i,
              message: `Remove targets already-removed actor "${action.target}"`,
            });
          } else {
            actor.removed = true;
          }
          break;
        }
      }
    }
  }

  // ── Canvas bounds warnings ──

  const canvasW = viz.config?.canvas?.width ?? 1000;
  const canvasH = viz.config?.canvas?.height ?? 600;
  const padding = viz.config?.canvas?.padding ?? 40;

  for (const actor of viz.actors) {
    if ("x" in actor && "y" in actor) {
      const a = actor as { x: number; y: number; id: string };
      if (a.x < 0 || a.y < 0) {
        errors.push({
          severity: "warning",
          step: null,
          message: `Actor "${a.id}" has negative coordinates (${a.x}, ${a.y})`,
        });
      }
      if (a.x > canvasW || a.y > canvasH) {
        errors.push({
          severity: "warning",
          step: null,
          message: `Actor "${a.id}" position (${a.x}, ${a.y}) exceeds canvas bounds (${canvasW}×${canvasH})`,
        });
      }
    }
  }

  return errors;
}

// ─── Summary Stats ──────────────────────────────────────────────────────────

function summarize(viz: Visualization): string {
  const actorsByType = new Map<string, number>();
  for (const actor of viz.actors) {
    actorsByType.set(actor.type, (actorsByType.get(actor.type) ?? 0) + 1);
  }

  let totalActions = 0;
  let creates = 0;
  let removes = 0;
  let updates = 0;
  for (const step of viz.steps) {
    for (const action of step.actions) {
      totalActions++;
      if (action.type === "create") creates++;
      if (action.type === "remove") removes++;
      if (action.type === "update") updates++;
    }
  }

  const lines = [
    `  Algorithm: ${viz.metadata.algorithm}`,
    `  Title: ${viz.metadata.title}`,
    `  Actors: ${viz.actors.length} (${[...actorsByType.entries()].map(([t, c]) => `${c} ${t}`).join(", ")})`,
    `  Steps: ${viz.steps.length}`,
    `  Actions: ${totalActions} total (${updates} update, ${creates} create, ${removes} remove)`,
  ];

  if (viz.metadata.complexity?.time) {
    lines.push(`  Complexity: ${viz.metadata.complexity.time} time, ${viz.metadata.complexity.space ?? "?"} space`);
  }

  return lines.join("\n");
}

// ─── Main ───────────────────────────────────────────────────────────────────

function validateFile(filePath: string): boolean {
  const absPath = path.resolve(filePath);
  console.log(`\n━━━ Validating: ${path.basename(absPath)} ━━━`);

  // Read file
  let raw: string;
  try {
    raw = fs.readFileSync(absPath, "utf-8");
  } catch (e) {
    console.error(`  ✗ Cannot read file: ${(e as Error).message}`);
    return false;
  }

  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`  ✗ Invalid JSON: ${(e as Error).message}`);
    return false;
  }

  // Schema validation
  const schemaResult = validateSchema(data);
  if (!schemaResult.valid) {
    console.error(`  ✗ Schema validation failed:`);
    for (const err of schemaResult.errors) {
      console.error(`    • ${err}`);
    }
    return false;
  }
  console.log(`  ✓ Schema validation passed`);

  // Semantic validation
  const viz = data as Visualization;
  const semanticErrors = validateSemantics(viz);

  const errors = semanticErrors.filter((e) => e.severity === "error");
  const warnings = semanticErrors.filter((e) => e.severity === "warning");

  if (errors.length > 0) {
    console.error(`  ✗ ${errors.length} semantic error(s):`);
    for (const err of errors) {
      const loc = err.step !== null ? `step ${err.step}` : "global";
      console.error(`    • [${loc}] ${err.message}`);
    }
  } else {
    console.log(`  ✓ Semantic validation passed`);
  }

  if (warnings.length > 0) {
    console.warn(`  ⚠ ${warnings.length} warning(s):`);
    for (const w of warnings) {
      const loc = w.step !== null ? `step ${w.step}` : "global";
      console.warn(`    • [${loc}] ${w.message}`);
    }
  }

  // Summary
  console.log(`\n${summarize(viz)}`);

  const passed = errors.length === 0;
  console.log(`\n  ${passed ? "✓ PASSED" : "✗ FAILED"}`);
  return passed;
}

// CLI entry point
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: npx ts-node validate.ts <file.json> [file2.json ...]");
  console.log("       npx ts-node validate.ts examples/*.json");
  process.exit(1);
}

let allPassed = true;
for (const file of files) {
  if (!validateFile(file)) {
    allPassed = false;
  }
}

console.log(`\n${"═".repeat(50)}`);
console.log(allPassed ? "All files passed validation ✓" : "Some files failed validation ✗");
process.exit(allPassed ? 0 : 1);
