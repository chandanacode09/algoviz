/**
 * Primitive Handle Types
 *
 * Each layout function returns a "handle" — the actors it created
 * plus metadata for referencing them in subsequent operations.
 */

import type {
  CellActor, NodeActor, EdgeActor, PointerActor, LabelActor, Actor,
} from "../types";

// ─── Canvas Defaults ────────────────────────────────────────────────────────

export const CANVAS = {
  width: 1000,
  height: 600,
  padding: 40,
} as const;

export const CELL_DEFAULTS = {
  width: 60,
  height: 60,
  gap: 10,
} as const;

export const NODE_DEFAULTS = {
  radius: 25,
} as const;

// ─── ID Counter ─────────────────────────────────────────────────────────────

let _idCounter = 0;

/** Reset the global ID counter (call before building a new visualization). */
export function resetIds(): void {
  _idCounter = 0;
}

/** Generate a unique ID with prefix. */
export function nextId(prefix: string): string {
  return `${prefix}${_idCounter++}`;
}

// ─── Layout Handles ─────────────────────────────────────────────────────────

export interface ArrayHandle {
  kind: "array";
  actors: CellActor[];
  /** Ordered list of cell IDs */
  ids: string[];
  /** Tracked values (mutable — ops.swap updates this) */
  values: (number | string)[];
  /** Get the ID at index i */
  id(i: number): string;
  /** Internal: tracks current x positions for swap animation (separate from actor objects) */
  _positions: Map<string, number>;
}

export interface TreeNode {
  value: number | string;
  left?: TreeNode;
  right?: TreeNode;
}

export interface TreeHandle {
  kind: "tree";
  actors: (NodeActor | EdgeActor)[];
  /** All node IDs in BFS order */
  nodeIds: string[];
  /** All edge IDs */
  edgeIds: string[];
  /** Map from node value → actor ID */
  valueToId: Map<number | string, string>;
  /** Get ID by value */
  nodeId(value: number | string): string;
}

export interface GraphNodeInput {
  id: string;
  value: number | string;
}

export interface GraphEdgeInput {
  from: string;
  to: string;
  weight?: number | string;
}

export interface GraphHandle {
  kind: "graph";
  actors: (NodeActor | EdgeActor)[];
  nodeIds: string[];
  edgeIds: string[];
  /** Map from input node id → actor ID */
  inputToActorId: Map<string, string>;
  /** Get actor ID from input ID */
  nodeId(inputId: string): string;
  /** Get edge actor ID from (from, to) pair */
  edgeId(from: string, to: string): string;
}

export interface LinkedListHandle {
  kind: "linkedList";
  actors: (NodeActor | EdgeActor)[];
  nodeIds: string[];
  edgeIds: string[];
  values: (number | string)[];
  id(i: number): string;
}

export interface MatrixHandle {
  kind: "matrix";
  actors: CellActor[];
  ids: string[][];  // ids[row][col]
  rows: number;
  cols: number;
  values: (number | string)[][];
  /** Get cell ID at (row, col) */
  id(row: number, col: number): string;
}

/** Union of all layout handles. */
export type LayoutHandle =
  | ArrayHandle
  | TreeHandle
  | GraphHandle
  | LinkedListHandle
  | MatrixHandle;

// ─── Layout Options ─────────────────────────────────────────────────────────

export interface ArrayOptions {
  y?: number;
  cellWidth?: number;
  cellHeight?: number;
  gap?: number;
  prefix?: string;
  sublabels?: boolean;
}

export interface TreeOptions {
  y?: number;
  levelSpacing?: number;
  prefix?: string;
}

export interface GraphOptions {
  directed?: boolean;
  prefix?: string;
  centerX?: number;
  centerY?: number;
  radius?: number;
}

export interface LinkedListOptions {
  y?: number;
  gap?: number;
  prefix?: string;
}

export interface MatrixOptions {
  x?: number;
  y?: number;
  cellWidth?: number;
  cellHeight?: number;
  gap?: number;
  prefix?: string;
  values?: (number | string)[][];
  sublabels?: boolean;
}
