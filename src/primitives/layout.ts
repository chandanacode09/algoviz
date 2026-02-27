/**
 * Layout Primitives
 *
 * Each function returns a LayoutHandle — actors with computed coordinates
 * plus metadata (IDs, values) for use in operations.
 *
 * All layouts auto-center on the default 1000×600 canvas.
 */

import type { CellActor, NodeActor, EdgeActor } from "../types";
import {
  CANVAS, CELL_DEFAULTS, NODE_DEFAULTS, nextId,
  type ArrayHandle, type ArrayOptions,
  type TreeHandle, type TreeNode, type TreeOptions,
  type GraphHandle, type GraphNodeInput, type GraphEdgeInput, type GraphOptions,
  type LinkedListHandle, type LinkedListOptions,
  type MatrixHandle, type MatrixOptions,
} from "./types";

// ─── Array Layout ───────────────────────────────────────────────────────────

/**
 * Create a horizontal array of cells, centered on canvas.
 *
 * @example
 * const arr = array([5, 3, 8, 1]);
 * arr.id(0)  // "c0"
 * arr.ids    // ["c0", "c1", "c2", "c3"]
 */
export function array(
  values: (number | string)[],
  opts: ArrayOptions = {},
): ArrayHandle {
  const {
    y = CANVAS.height / 2 - CELL_DEFAULTS.height / 2,
    cellWidth = CELL_DEFAULTS.width,
    cellHeight = CELL_DEFAULTS.height,
    gap = CELL_DEFAULTS.gap,
    prefix = "c",
    sublabels = true,
  } = opts;

  const n = values.length;
  const totalWidth = n * cellWidth + (n - 1) * gap;
  const usable = CANVAS.width - 2 * CANVAS.padding;
  const startX = CANVAS.padding + (usable - totalWidth) / 2;

  const actors: CellActor[] = [];
  const ids: string[] = [];

  for (let i = 0; i < n; i++) {
    const id = nextId(prefix);
    ids.push(id);
    const cell: CellActor = {
      id,
      type: "cell",
      x: Math.round(startX + i * (cellWidth + gap)),
      y: Math.round(y),
      width: cellWidth,
      height: cellHeight,
      value: values[i],
    };
    if (sublabels) cell.sublabel = String(i);
    actors.push(cell);
  }

  // Build position map for swap tracking (separate from actor objects)
  const _positions = new Map<string, number>();
  for (const actor of actors) {
    _positions.set(actor.id, actor.x);
  }

  return {
    kind: "array",
    actors,
    ids,
    values: [...values],
    id(i: number) { return ids[i]; },
    _positions,
  };
}

// ─── Tree Layout ────────────────────────────────────────────────────────────

/**
 * Create a binary tree with nodes and edges, auto-laid-out.
 *
 * @example
 * const t = tree({ value: 4, left: { value: 2 }, right: { value: 6 } });
 * t.nodeId(4)  // "n0"
 */
export function tree(
  root: TreeNode,
  opts: TreeOptions = {},
): TreeHandle {
  const {
    y: startY = 80,
    levelSpacing = 100,
    prefix = "n",
  } = opts;

  const nodes: NodeActor[] = [];
  const edges: EdgeActor[] = [];
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const valueToId = new Map<number | string, string>();

  // BFS to assign IDs and compute positions
  interface QueueItem {
    node: TreeNode;
    level: number;
    position: number; // 0-indexed position at this level
    totalAtLevel: number;
  }

  // First pass: count nodes per level for positioning
  const levelCounts: number[] = [];
  const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];
  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
    if (node.left) queue.push({ node: node.left, level: level + 1 });
    if (node.right) queue.push({ node: node.right, level: level + 1 });
  }

  // Second pass: create actors with proper coordinates
  // Use a recursive approach for better binary tree spacing
  function layoutNode(
    node: TreeNode,
    level: number,
    xMin: number,
    xMax: number,
    parentId?: string,
  ): void {
    const id = nextId(prefix);
    const x = Math.round((xMin + xMax) / 2);
    const y = Math.round(startY + level * levelSpacing);

    nodeIds.push(id);
    valueToId.set(node.value, id);

    nodes.push({
      id,
      type: "node",
      x,
      y,
      value: node.value,
      radius: NODE_DEFAULTS.radius,
    });

    if (parentId) {
      const eId = nextId("e");
      edgeIds.push(eId);
      edges.push({
        id: eId,
        type: "edge",
        source: parentId,
        target: id,
        directed: false,
      });
    }

    const mid = (xMin + xMax) / 2;
    if (node.left) layoutNode(node.left, level + 1, xMin, mid, id);
    if (node.right) layoutNode(node.right, level + 1, mid, xMax, id);
  }

  layoutNode(root, 0, CANVAS.padding, CANVAS.width - CANVAS.padding);

  return {
    kind: "tree",
    actors: [...nodes, ...edges],
    nodeIds,
    edgeIds,
    valueToId,
    nodeId(value: number | string) {
      const id = valueToId.get(value);
      if (!id) throw new Error(`No tree node with value "${value}"`);
      return id;
    },
  };
}

// ─── Graph Layout ───────────────────────────────────────────────────────────

/**
 * Create a graph with nodes arranged in a circle and edges between them.
 *
 * @example
 * const g = graph(
 *   [{ id: "A", value: "A" }, { id: "B", value: "B" }],
 *   [{ from: "A", to: "B", weight: 4 }],
 *   { directed: true }
 * );
 */
export function graph(
  nodeInputs: GraphNodeInput[],
  edgeInputs: GraphEdgeInput[],
  opts: GraphOptions = {},
): GraphHandle {
  const {
    directed = false,
    prefix = "gn",
    centerX = CANVAS.width / 2,
    centerY = CANVAS.height / 2,
    radius: circleRadius = Math.min(CANVAS.width, CANVAS.height) / 3,
  } = opts;

  const nodeActors: NodeActor[] = [];
  const edgeActors: EdgeActor[] = [];
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const inputToActorId = new Map<string, string>();
  const edgeActorIdMap = new Map<string, string>(); // "from->to" => actorId

  // Place nodes in a circle
  const n = nodeInputs.length;
  for (let i = 0; i < n; i++) {
    const input = nodeInputs[i];
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start from top
    const x = Math.round(centerX + circleRadius * Math.cos(angle));
    const y = Math.round(centerY + circleRadius * Math.sin(angle));

    const id = nextId(prefix);
    nodeIds.push(id);
    inputToActorId.set(input.id, id);

    nodeActors.push({
      id,
      type: "node",
      x,
      y,
      value: input.value,
      radius: NODE_DEFAULTS.radius,
    });
  }

  // Create edges
  for (const edge of edgeInputs) {
    const sourceId = inputToActorId.get(edge.from);
    const targetId = inputToActorId.get(edge.to);
    if (!sourceId || !targetId) {
      throw new Error(`Edge references unknown node: ${edge.from} → ${edge.to}`);
    }

    const eId = nextId("ge");
    edgeIds.push(eId);
    edgeActorIdMap.set(`${edge.from}->${edge.to}`, eId);

    const edgeActor: EdgeActor = {
      id: eId,
      type: "edge",
      source: sourceId,
      target: targetId,
      directed,
    };
    if (edge.weight !== undefined) {
      edgeActor.weight = edge.weight;
      edgeActor.label = String(edge.weight);
    }
    edgeActors.push(edgeActor);
  }

  return {
    kind: "graph",
    actors: [...nodeActors, ...edgeActors],
    nodeIds,
    edgeIds,
    inputToActorId,
    nodeId(inputId: string) {
      const id = inputToActorId.get(inputId);
      if (!id) throw new Error(`No graph node with input id "${inputId}"`);
      return id;
    },
    edgeId(from: string, to: string) {
      const id = edgeActorIdMap.get(`${from}->${to}`);
      if (!id) throw new Error(`No edge from "${from}" to "${to}"`);
      return id;
    },
  };
}

// ─── Linked List Layout ─────────────────────────────────────────────────────

/**
 * Create a horizontal linked list of nodes with directed edges.
 *
 * @example
 * const ll = linkedList([1, 2, 3, 4]);
 * ll.id(0)  // "ll0"
 */
export function linkedList(
  values: (number | string)[],
  opts: LinkedListOptions = {},
): LinkedListHandle {
  const {
    y = CANVAS.height / 2,
    gap = 100,
    prefix = "ll",
  } = opts;

  const n = values.length;
  const totalWidth = (n - 1) * gap;
  const usable = CANVAS.width - 2 * CANVAS.padding;
  const startX = CANVAS.padding + (usable - totalWidth) / 2;

  const nodeActors: NodeActor[] = [];
  const edgeActors: EdgeActor[] = [];
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];

  for (let i = 0; i < n; i++) {
    const id = nextId(prefix);
    nodeIds.push(id);
    nodeActors.push({
      id,
      type: "node",
      x: Math.round(startX + i * gap),
      y: Math.round(y),
      value: values[i],
      radius: NODE_DEFAULTS.radius,
    });
  }

  for (let i = 0; i < n - 1; i++) {
    const eId = nextId("le");
    edgeIds.push(eId);
    edgeActors.push({
      id: eId,
      type: "edge",
      source: nodeIds[i],
      target: nodeIds[i + 1],
      directed: true,
    });
  }

  return {
    kind: "linkedList",
    actors: [...nodeActors, ...edgeActors],
    nodeIds,
    edgeIds,
    values: [...values],
    id(i: number) { return nodeIds[i]; },
  };
}

// ─── Matrix Layout ──────────────────────────────────────────────────────────

/**
 * Create a 2D grid of cells (for DP tables, etc).
 *
 * @example
 * const m = matrix(3, 4, { values: [[0,0,0,0], [0,1,1,1], [0,1,2,2]] });
 * m.id(1, 2)  // cell at row 1, col 2
 */
export function matrix(
  rows: number,
  cols: number,
  opts: MatrixOptions = {},
): MatrixHandle {
  const {
    cellWidth = 50,
    cellHeight = 50,
    gap = 4,
    prefix = "m",
    values,
    sublabels = false,
  } = opts;

  const totalW = cols * cellWidth + (cols - 1) * gap;
  const totalH = rows * cellHeight + (rows - 1) * gap;
  const usableW = CANVAS.width - 2 * CANVAS.padding;
  const usableH = CANVAS.height - 2 * CANVAS.padding;
  const startX = opts.x ?? CANVAS.padding + (usableW - totalW) / 2;
  const startY = opts.y ?? CANVAS.padding + (usableH - totalH) / 2;

  const actors: CellActor[] = [];
  const ids: string[][] = [];
  const cellValues: (number | string)[][] = [];

  for (let r = 0; r < rows; r++) {
    ids[r] = [];
    cellValues[r] = [];
    for (let c = 0; c < cols; c++) {
      const id = nextId(prefix);
      ids[r][c] = id;
      const val = values?.[r]?.[c] ?? "";
      cellValues[r][c] = val;

      const cell: CellActor = {
        id,
        type: "cell",
        x: Math.round(startX + c * (cellWidth + gap)),
        y: Math.round(startY + r * (cellHeight + gap)),
        width: cellWidth,
        height: cellHeight,
        value: val,
      };
      if (sublabels) cell.sublabel = `${r},${c}`;
      actors.push(cell);
    }
  }

  return {
    kind: "matrix",
    actors,
    ids,
    rows,
    cols,
    values: cellValues,
    id(row: number, col: number) { return ids[row][col]; },
  };
}
