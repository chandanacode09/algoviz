/**
 * AlgoViz Visualization Format v1
 * TypeScript type definitions
 *
 * These types mirror schema.json exactly.
 * Use them for type-safe visualization authoring and validation.
 */

// ─── Root ────────────────────────────────────────────────────────────────────

export interface Visualization {
  version: "1.0";
  metadata: Metadata;
  config?: Config;
  actors: Actor[];
  steps: Step[];
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export interface Metadata {
  algorithm: string;
  title: string;
  description?: string;
  category?: AlgorithmCategory;
  complexity?: Complexity;
  difficulty?: Difficulty;
  inputDescription?: string;
  author?: string;
  tags?: string[];
}

export type AlgorithmCategory =
  | "sorting"
  | "searching"
  | "graph"
  | "tree"
  | "dynamic-programming"
  | "backtracking"
  | "string"
  | "hashing"
  | "heap"
  | "linked-list"
  | "other";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Complexity = string | ComplexityObject;

export interface ComplexityObject {
  time?: string;
  space?: string;
  best?: string;
  worst?: string;
  average?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface Config {
  canvas?: CanvasConfig;
  theme?: Theme;
  playback?: PlaybackConfig;
}

export interface CanvasConfig {
  width?: number;   // default: 1000
  height?: number;  // default: 600
  padding?: number; // default: 40
  background?: string; // default: "#ffffff"
}

export interface Theme {
  default?: string;   // default: "#e2e8f0"
  primary?: string;   // default: "#3b82f6"
  secondary?: string; // default: "#8b5cf6"
  success?: string;   // default: "#10b981"
  warning?: string;   // default: "#f59e0b"
  danger?: string;    // default: "#ef4444"
  text?: string;      // default: "#1e293b"
  muted?: string;     // default: "#94a3b8"
}

export interface PlaybackConfig {
  stepDuration?: number; // default: 800 (ms)
  autoPlay?: boolean;    // default: false
}

// ─── Color ───────────────────────────────────────────────────────────────────

/**
 * CSS color value or theme reference.
 * Theme references use "$" prefix: "$primary", "$success", etc.
 * Literal values: "#3b82f6", "rgba(0,0,0,0.5)", "red"
 */
export type Color = string;

// ─── Actors ──────────────────────────────────────────────────────────────────

export type Actor =
  | CellActor
  | NodeActor
  | EdgeActor
  | PointerActor
  | LabelActor
  | RegionActor;

export type ActorType = Actor["type"];

/** Base properties shared by all positioned actors. */
interface ActorBase {
  id: string;
  opacity?: number; // default: 1
}

/**
 * Rectangular box with a value.
 * Use for: array elements, table cells, matrix entries, stack/queue slots.
 */
export interface CellActor extends ActorBase {
  type: "cell";
  x: number;
  y: number;
  width?: number;  // default: 60
  height?: number; // default: 60
  value: number | string;
  label?: string;    // defaults to String(value)
  sublabel?: string;
  fill?: Color;      // default: "$default"
  stroke?: Color;    // default: "$muted"
  strokeWidth?: number; // default: 2
  textColor?: Color; // default: "$text"
  fontSize?: number; // default: 16
  cornerRadius?: number; // default: 4
}

/**
 * Circular element with a value.
 * Use for: tree nodes, graph vertices, linked list nodes.
 */
export interface NodeActor extends ActorBase {
  type: "node";
  x: number;
  y: number;
  radius?: number; // default: 25
  value: number | string;
  label?: string;    // defaults to String(value)
  sublabel?: string;
  fill?: Color;      // default: "$default"
  stroke?: Color;    // default: "$muted"
  strokeWidth?: number; // default: 2
  textColor?: Color; // default: "$text"
  fontSize?: number; // default: 14
}

/**
 * Line connecting two nodes.
 * Use for: tree edges, graph edges, linked list links.
 */
export interface EdgeActor extends ActorBase {
  type: "edge";
  source: string; // ID of source node
  target: string; // ID of target node
  directed?: boolean; // default: false
  weight?: number | string | null; // default: null
  label?: string;
  stroke?: Color;     // default: "$muted"
  strokeWidth?: number; // default: 2
  dashArray?: string; // default: "" (solid)
}

/**
 * Arrow/marker that points at another actor.
 * Use for: index pointers, current-element markers, variable indicators.
 */
export interface PointerActor extends ActorBase {
  type: "pointer";
  target: string; // ID of actor being pointed at
  position: "above" | "below" | "left" | "right";
  label?: string;
  fill?: Color;      // default: "$primary"
  textColor?: Color; // default: "$primary"
  fontSize?: number; // default: 14
}

/**
 * Standalone text annotation.
 * Use for: titles, status text, complexity displays, step counters.
 */
export interface LabelActor extends ActorBase {
  type: "label";
  x: number;
  y: number;
  text: string;
  fontSize?: number;  // default: 16
  fontWeight?: "normal" | "bold"; // default: "normal"
  fill?: Color;       // default: "$text"
  anchor?: "start" | "middle" | "end"; // default: "start"
}

/**
 * Semi-transparent highlighted area.
 * Use for: sorted regions, search windows, recursion boundaries, partitions.
 */
export interface RegionActor extends ActorBase {
  type: "region";
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: Color;       // default: "$success"
  stroke?: Color;     // default: "$success"
  strokeWidth?: number; // default: 2
  cornerRadius?: number; // default: 8
  label?: string;
  opacity?: number;   // default: 0.15 (note: different from other actors)
}

// ─── Steps & Actions ─────────────────────────────────────────────────────────

export interface Step {
  description: string;
  actions: Action[];
  transition?: TransitionHint; // default: "smooth"
}

export type TransitionHint =
  | "instant"   // no animation
  | "smooth"    // interpolate property changes
  | "swap"      // swap animation (two actors exchange positions)
  | "highlight" // flash then settle
  | "fade";     // opacity transition

export type Action = UpdateAction | CreateAction | RemoveAction;

/** Change one or more properties of an existing actor. */
export interface UpdateAction {
  type: "update";
  target: string; // actor ID
  props: Record<string, unknown>;
}

/** Add a new actor to the scene mid-visualization. */
export interface CreateAction {
  type: "create";
  actor: Actor;
}

/** Remove an actor from the scene. */
export interface RemoveAction {
  type: "remove";
  target: string; // actor ID
}

// ─── State Engine Types ──────────────────────────────────────────────────────

/**
 * A snapshot of all actor states at a given step.
 * Computed by the state engine, not authored directly.
 */
export interface Scene {
  stepIndex: number;
  description: string;
  actors: Map<string, ActorState>;
}

/**
 * An actor's complete state at a given step.
 * The initial actor definition plus all accumulated property changes.
 */
export type ActorState = Actor & { _removed?: boolean };

// ─── Utility Types ───────────────────────────────────────────────────────────

/** Extract the props type for a given actor type. */
export type ActorProps<T extends ActorType> = Omit<
  Extract<Actor, { type: T }>,
  "id" | "type"
>;

/** Valid property keys for update actions on a given actor type. */
export type UpdatableProps<T extends ActorType> = keyof ActorProps<T>;
