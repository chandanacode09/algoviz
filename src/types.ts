/**
 * AlgoViz Visualization Format v1 — TypeScript Type Definitions
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
  | "sorting" | "searching" | "graph" | "tree"
  | "dynamic-programming" | "backtracking" | "string"
  | "hashing" | "heap" | "linked-list" | "other";

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
  width?: number;      // default: 1000
  height?: number;     // default: 600
  padding?: number;    // default: 40
  background?: string; // default: "#ffffff"
}

export interface Theme {
  default?: string;   // "#e2e8f0"
  primary?: string;   // "#3b82f6"
  secondary?: string; // "#8b5cf6"
  success?: string;   // "#10b981"
  warning?: string;   // "#f59e0b"
  danger?: string;    // "#ef4444"
  text?: string;      // "#1e293b"
  muted?: string;     // "#94a3b8"
}

export interface PlaybackConfig {
  stepDuration?: number; // default: 800 (ms)
  autoPlay?: boolean;    // default: false
}

// ─── Color ───────────────────────────────────────────────────────────────────

/** CSS color or $-prefixed theme reference ("$primary", "$success") */
export type Color = string;

// ─── Actors ──────────────────────────────────────────────────────────────────

export type Actor = CellActor | NodeActor | EdgeActor | PointerActor | LabelActor | RegionActor;
export type ActorType = Actor["type"];

interface ActorBase {
  id: string;
  opacity?: number;
}

export interface CellActor extends ActorBase {
  type: "cell";
  x: number; y: number;
  width?: number; height?: number;
  value: number | string;
  label?: string; sublabel?: string;
  fill?: Color; stroke?: Color; strokeWidth?: number;
  textColor?: Color; fontSize?: number; cornerRadius?: number;
}

export interface NodeActor extends ActorBase {
  type: "node";
  x: number; y: number;
  radius?: number;
  value: number | string;
  label?: string; sublabel?: string;
  fill?: Color; stroke?: Color; strokeWidth?: number;
  textColor?: Color; fontSize?: number;
}

export interface EdgeActor extends ActorBase {
  type: "edge";
  source: string; target: string;
  directed?: boolean;
  weight?: number | string | null;
  label?: string;
  stroke?: Color; strokeWidth?: number; dashArray?: string;
}

export interface PointerActor extends ActorBase {
  type: "pointer";
  target: string;
  position: "above" | "below" | "left" | "right";
  label?: string;
  fill?: Color; textColor?: Color; fontSize?: number;
}

export interface LabelActor extends ActorBase {
  type: "label";
  x: number; y: number;
  text: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fill?: Color;
  anchor?: "start" | "middle" | "end";
}

export interface RegionActor extends ActorBase {
  type: "region";
  x: number; y: number;
  width: number; height: number;
  fill?: Color; stroke?: Color;
  strokeWidth?: number; cornerRadius?: number;
  label?: string;
}

// ─── Educational Annotations ────────────────────────────────────────────────

/** Semantic label for what a step teaches or demonstrates */
export type AnnotationType =
  | "invariant"       // Demonstrates a correctness invariant
  | "initialization"  // Setup / initialization logic
  | "boundary"        // Boundary condition or edge case
  | "decision"        // Key comparison or branch point
  | "warning"         // Common learner mistake or confusion
  | "explanation";    // Concept-building / deeper insight

// ─── Steps & Actions ─────────────────────────────────────────────────────────

export interface Step {
  description: string;
  /** Rich HTML narration with <span class="highlight/warn/success"> markup */
  narration?: string;
  /** Algorithm phase: "setup", "main-loop", "cleanup", etc. */
  phase?: string;
  /** What this step teaches — rendered as a badge in the player */
  annotation?: AnnotationType;
  actions: Action[];
  transition?: TransitionHint;
}

export type TransitionHint = "instant" | "smooth" | "swap" | "highlight" | "fade";
export type Action = UpdateAction | CreateAction | RemoveAction;

export interface UpdateAction {
  type: "update";
  target: string;
  props: Record<string, unknown>;
}

export interface CreateAction {
  type: "create";
  actor: Actor;
}

export interface RemoveAction {
  type: "remove";
  target: string;
}

// ─── State Engine Types ──────────────────────────────────────────────────────

export interface Scene {
  stepIndex: number;
  description: string;
  transition: TransitionHint;
  actors: Map<string, Actor>;
}

// ─── Utility Types ───────────────────────────────────────────────────────────

export type ActorProps<T extends ActorType> = Omit<Extract<Actor, { type: T }>, "id" | "type">;
export type UpdatableProps<T extends ActorType> = keyof ActorProps<T>;
