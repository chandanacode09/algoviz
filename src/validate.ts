/**
 * AlgoViz Validation Module
 *
 * Importable two-layer validation:
 * 1. Schema validation (structural — JSON Schema draft-07 via Ajv)
 * 2. Semantic validation (referential integrity, constraint checking)
 */

import Ajv from "ajv";
import type { Visualization } from "./types";
import schema from "../schema.json";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  severity: "error" | "warning";
  location: string; // "global" | "step:N" | "actor:ID"
  message: string;
}

export interface ValidationSummary {
  algorithm: string;
  title: string;
  actorCount: number;
  actorsByType: Record<string, number>;
  stepCount: number;
  actionCount: { total: number; update: number; create: number; remove: number };
  complexity?: { time?: string; space?: string };
}

// ─── Schema Validator (singleton) ───────────────────────────────────────────

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaValidator = ajv.compile(schema);

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Validate an AlgoViz visualization JSON object.
 * Runs both schema validation and semantic validation.
 */
export function validate(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Layer 1: Schema
  const schemaValid = schemaValidator(data);
  if (!schemaValid) {
    for (const e of schemaValidator.errors || []) {
      errors.push({
        severity: "error",
        location: e.instancePath || "root",
        message: e.message || "Unknown schema error",
      });
    }
    return { valid: false, errors, warnings };
  }

  // Layer 2: Semantics
  const viz = data as unknown as Visualization;
  const semanticResults = validateSemantics(viz);
  for (const r of semanticResults) {
    if (r.severity === "error") errors.push(r);
    else warnings.push(r);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Schema-only validation (fast, no semantic checks).
 */
export function validateSchemaOnly(data: unknown): { valid: boolean; errors: string[] } {
  const valid = schemaValidator(data);
  if (valid) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: (schemaValidator.errors || []).map(
      (e) => `${e.instancePath || "root"}: ${e.message}`
    ),
  };
}

/**
 * Generate summary statistics for a visualization.
 */
export function summarize(viz: Visualization): ValidationSummary {
  const actorsByType: Record<string, number> = {};
  for (const actor of viz.actors) {
    actorsByType[actor.type] = (actorsByType[actor.type] || 0) + 1;
  }

  const actionCount = { total: 0, update: 0, create: 0, remove: 0 };
  for (const step of viz.steps) {
    for (const action of step.actions) {
      actionCount.total++;
      actionCount[action.type]++;
    }
  }

  return {
    algorithm: viz.metadata.algorithm,
    title: viz.metadata.title,
    actorCount: viz.actors.length,
    actorsByType,
    stepCount: viz.steps.length,
    actionCount,
    complexity: viz.metadata.complexity
      ? typeof viz.metadata.complexity === "string"
        ? { time: viz.metadata.complexity }
        : { time: viz.metadata.complexity.time, space: viz.metadata.complexity.space }
      : undefined,
  };
}

// ─── Semantic Validation (internal) ─────────────────────────────────────────

function validateSemantics(viz: Visualization): ValidationError[] {
  const results: ValidationError[] = [];
  const actorMap = new Map<string, { type: string; removed: boolean }>();

  // Unique IDs
  const seenIds = new Set<string>();
  for (const actor of viz.actors) {
    if (seenIds.has(actor.id)) {
      results.push({ severity: "error", location: `actor:${actor.id}`, message: `Duplicate actor ID: "${actor.id}"` });
    }
    seenIds.add(actor.id);
    actorMap.set(actor.id, { type: actor.type, removed: false });
  }

  // Edge/pointer reference integrity
  for (const actor of viz.actors) {
    if (actor.type === "edge") {
      if (!actorMap.has(actor.source)) {
        results.push({ severity: "error", location: `actor:${actor.id}`, message: `Edge references non-existent source "${actor.source}"` });
      }
      if (!actorMap.has(actor.target)) {
        results.push({ severity: "error", location: `actor:${actor.id}`, message: `Edge references non-existent target "${actor.target}"` });
      }
    }
    if (actor.type === "pointer") {
      if (!actorMap.has(actor.target)) {
        results.push({ severity: "error", location: `actor:${actor.id}`, message: `Pointer references non-existent target "${actor.target}"` });
      }
    }
  }

  // Step actions
  for (let i = 0; i < viz.steps.length; i++) {
    const step = viz.steps[i];
    if (!step.description || step.description.trim() === "") {
      results.push({ severity: "warning", location: `step:${i}`, message: "Empty description" });
    }
    for (const action of step.actions) {
      if (action.type === "update") {
        const actor = actorMap.get(action.target);
        if (!actor) {
          results.push({ severity: "error", location: `step:${i}`, message: `Update targets non-existent actor "${action.target}"` });
        } else if (actor.removed) {
          results.push({ severity: "error", location: `step:${i}`, message: `Update targets removed actor "${action.target}"` });
        }
        if (!action.props || Object.keys(action.props).length === 0) {
          results.push({ severity: "warning", location: `step:${i}`, message: `Update on "${action.target}" has no properties` });
        }
        // Pointer target re-reference check
        if (action.props && "target" in action.props && actorMap.get(action.target)?.type === "pointer") {
          const newTarget = action.props.target as string;
          const t = actorMap.get(newTarget);
          if (!t) results.push({ severity: "error", location: `step:${i}`, message: `Pointer "${action.target}" re-targeted to non-existent "${newTarget}"` });
          else if (t.removed) results.push({ severity: "error", location: `step:${i}`, message: `Pointer "${action.target}" re-targeted to removed "${newTarget}"` });
        }
      } else if (action.type === "create") {
        const existing = actorMap.get(action.actor.id);
        if (existing && !existing.removed) {
          results.push({ severity: "error", location: `step:${i}`, message: `Create uses existing ID "${action.actor.id}"` });
        }
        actorMap.set(action.actor.id, { type: action.actor.type, removed: false });
      } else if (action.type === "remove") {
        const actor = actorMap.get(action.target);
        if (!actor) results.push({ severity: "error", location: `step:${i}`, message: `Remove targets non-existent "${action.target}"` });
        else if (actor.removed) results.push({ severity: "warning", location: `step:${i}`, message: `Remove targets already-removed "${action.target}"` });
        else actor.removed = true;
      }
    }
  }

  // Canvas bounds
  const W = viz.config?.canvas?.width ?? 1000;
  const H = viz.config?.canvas?.height ?? 600;
  for (const actor of viz.actors) {
    if ("x" in actor && "y" in actor) {
      const a = actor as { x: number; y: number; id: string };
      if (a.x < 0 || a.y < 0) results.push({ severity: "warning", location: `actor:${a.id}`, message: `Negative coordinates (${a.x}, ${a.y})` });
      if (a.x > W || a.y > H) results.push({ severity: "warning", location: `actor:${a.id}`, message: `Position (${a.x}, ${a.y}) exceeds canvas (${W}×${H})` });
    }
  }

  return results;
}
