/**
 * Operation Primitives
 *
 * Pure functions that return Action[] for step mutations.
 * No closures, no context — take actor IDs and return actions.
 */

import type { Action, UpdateAction, CreateAction, RemoveAction, Actor } from "../types";
import type { ArrayHandle } from "./types";

// ─── Highlight / Color Operations ───────────────────────────────────────────

/**
 * Highlight one or more actors with a fill color.
 *
 * @example
 * ops.highlight(["c0", "c1"], "$warning")
 */
export function highlight(targets: string | string[], fill: string): Action[] {
  const ids = Array.isArray(targets) ? targets : [targets];
  return ids.map((id): UpdateAction => ({
    type: "update",
    target: id,
    props: { fill },
  }));
}

/**
 * Reset actors back to default fill.
 *
 * @example
 * ops.reset(["c0", "c1"])
 */
export function reset(targets: string | string[]): Action[] {
  const ids = Array.isArray(targets) ? targets : [targets];
  return ids.map((id): UpdateAction => ({
    type: "update",
    target: id,
    props: { fill: "$default" },
  }));
}

/**
 * Mark actors as done (success color + stroke).
 *
 * @example
 * ops.markDone(["c0", "c1"])
 */
export function markDone(targets: string | string[]): Action[] {
  const ids = Array.isArray(targets) ? targets : [targets];
  return ids.map((id): UpdateAction => ({
    type: "update",
    target: id,
    props: { fill: "$success", stroke: "$success" },
  }));
}

// ─── Value / Text Operations ────────────────────────────────────────────────

/**
 * Set the value (and label) of a cell or node.
 *
 * @example
 * ops.setValue("c0", 42)
 */
export function setValue(target: string, value: number | string): Action[] {
  return [{
    type: "update",
    target,
    props: { value, label: String(value) },
  }];
}

/**
 * Set the text of a label actor.
 *
 * @example
 * ops.setText("status", "Comparing elements...")
 */
export function setText(target: string, text: string): Action[] {
  return [{
    type: "update",
    target,
    props: { text },
  }];
}

// ─── Array-Specific Operations ──────────────────────────────────────────────

/**
 * Swap two elements in an array handle by index.
 * Physically exchanges x positions so cells animate sliding past each other.
 * Also updates values, labels, sublabels, and fill color.
 * Mutates the handle's values array AND swaps actors/ids in the handle.
 *
 * @example
 * ops.swap(arr, 0, 3, "$danger")
 */
export function swap(
  handle: ArrayHandle,
  i: number,
  j: number,
  fill: string = "$danger",
): Action[] {
  const idI = handle.id(i);
  const idJ = handle.id(j);

  // Read current positions from the position tracker (NOT from actors)
  const xI = handle._positions.get(idI)!;
  const xJ = handle._positions.get(idJ)!;

  // Mutate handle tracking: swap values and ids
  const valI = handle.values[i];
  const valJ = handle.values[j];
  handle.values[i] = valJ;
  handle.values[j] = valI;

  // Swap IDs in the handle so future handle.id(i) returns the correct actor
  handle.ids[i] = idJ;
  handle.ids[j] = idI;

  // Update position tracker (NOT the actor objects — actors must keep original positions)
  handle._positions.set(idI, xJ);
  handle._positions.set(idJ, xI);

  return [
    // Move cell I to position J, update sublabel to show new index
    { type: "update", target: idI, props: { x: xJ, sublabel: String(j), fill } },
    // Move cell J to position I, update sublabel to show new index
    { type: "update", target: idJ, props: { x: xI, sublabel: String(i), fill } },
  ];
}

// ─── Pointer Operations ─────────────────────────────────────────────────────

/**
 * Move a pointer to a new target.
 *
 * @example
 * ops.movePointer("p0", "c2")
 */
export function movePointer(pointerId: string, newTarget: string): Action[] {
  return [{
    type: "update",
    target: pointerId,
    props: { target: newTarget },
  }];
}

// ─── Visibility Operations ──────────────────────────────────────────────────

/**
 * Show an actor (opacity 1).
 */
export function show(target: string): Action[] {
  return [{ type: "update", target, props: { opacity: 1 } }];
}

/**
 * Hide an actor (opacity 0).
 */
export function hide(target: string): Action[] {
  return [{ type: "update", target, props: { opacity: 0 } }];
}

// ─── Generic Update ─────────────────────────────────────────────────────────

/**
 * Update arbitrary props on a target actor.
 *
 * @example
 * ops.update("c0", { fill: "$primary", stroke: "#000" })
 */
export function update(target: string, props: Record<string, unknown>): Action[] {
  return [{ type: "update", target, props }];
}

// ─── Create / Remove ────────────────────────────────────────────────────────

/**
 * Create a new actor in the scene.
 *
 * @example
 * ops.create({ id: "temp", type: "cell", x: 100, y: 100, value: 5, width: 60, height: 60 })
 */
export function create(actor: Actor): Action[] {
  return [{ type: "create", actor }];
}

/**
 * Remove an actor from the scene.
 *
 * @example
 * ops.remove("temp")
 */
export function remove(target: string): Action[] {
  return [{ type: "remove", target }];
}

// ─── Edge Operations ────────────────────────────────────────────────────────

/**
 * Highlight an edge with a stroke color.
 */
export function highlightEdge(targets: string | string[], stroke: string): Action[] {
  const ids = Array.isArray(targets) ? targets : [targets];
  return ids.map((id): UpdateAction => ({
    type: "update",
    target: id,
    props: { stroke, strokeWidth: 3 },
  }));
}

/**
 * Reset edge to default stroke.
 */
export function resetEdge(targets: string | string[]): Action[] {
  const ids = Array.isArray(targets) ? targets : [targets];
  return ids.map((id): UpdateAction => ({
    type: "update",
    target: id,
    props: { stroke: "$default", strokeWidth: 1 },
  }));
}
