/**
 * AlgoViz Composable Primitives
 *
 * Pre-tested building blocks for algorithm visualizations.
 * Layouts handle coordinate math, ops handle actions, builders compose everything.
 *
 * @example
 * ```ts
 * import { layout, ops, step, viz, titleLabel, statusLabel, pointer, resetIds } from "algoviz/primitives";
 *
 * resetIds();
 * const arr = layout.array([5, 3, 8, 1]);
 * const title = titleLabel("Bubble Sort");
 * const status = statusLabel("Starting...");
 *
 * const steps = [
 *   step("Compare arr[0] and arr[1]",
 *     ops.highlight([arr.id(0), arr.id(1)], "$warning"),
 *     ops.setText(status.id, "Comparing 5 and 3...")
 *   ),
 * ];
 *
 * const v = viz(
 *   { algorithm: "bubble_sort", title: "Bubble Sort", category: "sorting" },
 *   [arr, title, status],
 *   steps
 * );
 * ```
 */

// Layouts — namespaced as `layout.xxx()`
import { array, tree, graph, linkedList, matrix } from "./layout";
export const layout = { array, tree, graph, linkedList, matrix } as const;

// Operations — namespaced as `ops.xxx()`
import {
  highlight, reset, markDone,
  setValue, setText,
  swap,
  movePointer,
  show, hide,
  update,
  create, remove,
  highlightEdge, resetEdge,
} from "./ops";
export const ops = {
  highlight, reset, markDone,
  setValue, setText,
  swap,
  movePointer,
  show, hide,
  update,
  create, remove,
  highlightEdge, resetEdge,
} as const;

// Builders
export { step, stepWithTransition, teach, annotatedStep, viz } from "./builders";
export type { VizMetadata } from "./builders";

// Label & pointer helpers
export { titleLabel, statusLabel, label, pointer } from "./builders";

// Handle types (for type annotations)
export type {
  ArrayHandle, TreeHandle, GraphHandle, LinkedListHandle, MatrixHandle,
  LayoutHandle,
  TreeNode, GraphNodeInput, GraphEdgeInput,
  ArrayOptions, TreeOptions, GraphOptions, LinkedListOptions, MatrixOptions,
} from "./types";

// ID management
export { resetIds, nextId } from "./types";
