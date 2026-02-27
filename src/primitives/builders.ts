/**
 * Builder Primitives
 *
 * Compose layouts and operations into complete Step and Visualization objects.
 */

import type {
  Visualization, Step, Action, UpdateAction, Actor,
  TransitionHint, AlgorithmCategory, Difficulty, Complexity,
  LabelActor, PointerActor, AnnotationType,
} from "../types";
import { validate } from "../validate";
import type { LayoutHandle } from "./types";
import { CANVAS, nextId, resetIds } from "./types";

// ─── Step Builder ───────────────────────────────────────────────────────────

/**
 * Build a step from a description and one or more action arrays.
 *
 * @example
 * step("Compare arr[0] and arr[1]",
 *   ops.highlight([arr.id(0), arr.id(1)], "$warning"),
 *   ops.setText("status", "Comparing...")
 * )
 */
export function step(
  description: string,
  ...actionGroups: Action[][]
): Step {
  const actions = actionGroups.flat();

  // Auto-detect if this step contains position changes (swap animation)
  const hasPositionChange = actions.some(
    a => a.type === "update" && (a as UpdateAction).props &&
    ("x" in (a as UpdateAction).props || "y" in (a as UpdateAction).props)
  );

  return {
    description,
    actions,
    ...(hasPositionChange && { transition: "swap" as TransitionHint }),
  };
}

/**
 * Build a step with a custom transition hint.
 */
export function stepWithTransition(
  description: string,
  transition: TransitionHint,
  ...actionGroups: Action[][]
): Step {
  return {
    description,
    actions: actionGroups.flat(),
    transition,
  };
}

// ─── Educational Step Helpers ───────────────────────────────────────────────

/**
 * Build a step with rich HTML narration.
 * The `narration` string supports <span class="highlight/warn/success"> markup
 * for colored emphasis in the player. `description` is the plain-text fallback.
 *
 * @example
 * teach("After pass 1, 8 is in its final position",
 *   'After pass 1: <span class="success">8 is in its final position</span>. ' +
 *   'The <span class="highlight">invariant</span>: the largest unsorted element bubbles to the end.',
 *   ops.markDone([arr.id(4)]),
 *   ops.setText("status", "Pass 1 complete")
 * )
 */
export function teach(
  description: string,
  narration: string,
  ...actionGroups: Action[][]
): Step {
  const actions = actionGroups.flat();
  const hasPositionChange = actions.some(
    a => a.type === "update" && (a as UpdateAction).props &&
    ("x" in (a as UpdateAction).props || "y" in (a as UpdateAction).props)
  );
  return {
    description,
    narration,
    actions,
    ...(hasPositionChange && { transition: "swap" as TransitionHint }),
  };
}

/**
 * Build an annotated step with phase tag and annotation type.
 * Use this for steps that teach a specific concept (invariant, boundary, etc.).
 *
 * @example
 * annotatedStep("Set lo=0, hi=n-1", "initialization",
 *   { narration: '<span class="highlight">lo=0</span>, <span class="warn">hi=n-1</span> (inclusive bound)', phase: "setup" },
 *   ops.highlight([arr.id(0), arr.id(n-1)], "$primary")
 * )
 */
export function annotatedStep(
  description: string,
  annotation: AnnotationType,
  opts: { narration?: string; phase?: string } = {},
  ...actionGroups: Action[][]
): Step {
  const actions = actionGroups.flat();
  const hasPositionChange = actions.some(
    a => a.type === "update" && (a as UpdateAction).props &&
    ("x" in (a as UpdateAction).props || "y" in (a as UpdateAction).props)
  );
  return {
    description,
    annotation,
    ...(opts.narration && { narration: opts.narration }),
    ...(opts.phase && { phase: opts.phase }),
    actions,
    ...(hasPositionChange && { transition: "swap" as TransitionHint }),
  };
}

// ─── Label Helpers ──────────────────────────────────────────────────────────

/**
 * Create a title label, centered at the top of the canvas.
 */
export function titleLabel(text: string, id?: string): LabelActor {
  return {
    id: id || nextId("title"),
    type: "label",
    x: CANVAS.width / 2,
    y: 30,
    text,
    fontSize: 24,
    fontWeight: "bold",
    anchor: "middle",
  };
}

/**
 * Create a status label, centered near the bottom of the canvas.
 * Pass canvasHeight if using a non-default canvas height (e.g. 400).
 */
export function statusLabel(text: string = "", id?: string, canvasHeight?: number): LabelActor {
  const h = canvasHeight || CANVAS.height;
  return {
    id: id || nextId("status"),
    type: "label",
    x: CANVAS.width / 2,
    y: h - 40,
    text,
    fontSize: 16,
    anchor: "middle",
    fill: "$muted",
  };
}

/**
 * Create a subtitle/info label at a specified position.
 */
export function label(
  text: string,
  x: number,
  y: number,
  opts: {
    id?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    anchor?: "start" | "middle" | "end";
    fill?: string;
  } = {},
): LabelActor {
  return {
    id: opts.id || nextId("lbl"),
    type: "label",
    x, y, text,
    fontSize: opts.fontSize ?? 14,
    fontWeight: opts.fontWeight,
    anchor: opts.anchor ?? "middle",
    fill: opts.fill,
  };
}

// ─── Pointer Helper ─────────────────────────────────────────────────────────

/**
 * Create a pointer actor targeting a specific actor.
 *
 * @example
 * pointer("i", arr.id(0), "above")
 */
export function pointer(
  labelText: string,
  target: string,
  position: "above" | "below" | "left" | "right" = "above",
  opts: { id?: string; fill?: string } = {},
): PointerActor {
  return {
    id: opts.id || nextId("p"),
    type: "pointer",
    target,
    position,
    label: labelText,
    fill: opts.fill,
  };
}

// ─── Visualization Builder ──────────────────────────────────────────────────

export interface VizMetadata {
  algorithm: string;
  title: string;
  description?: string;
  category?: AlgorithmCategory;
  difficulty?: Difficulty;
  complexity?: Complexity;
  input?: string;
  author?: string;
  tags?: string[];
}

/**
 * Build a complete Visualization from metadata, layouts/actors, and steps.
 * Auto-adds version, wraps metadata, flattens layout actors, and validates.
 *
 * @param meta - Visualization metadata
 * @param layouts - Layout handles and/or standalone actors
 * @param steps - Step array
 * @param options - Optional canvas/playback config
 *
 * @throws if validation fails
 *
 * @example
 * const v = viz(
 *   { algorithm: "bubble_sort", title: "Bubble Sort", category: "sorting", difficulty: "beginner" },
 *   [arr, titleLabel, statusLabel],
 *   steps
 * );
 */
export function viz(
  meta: VizMetadata,
  layouts: (LayoutHandle | Actor)[],
  steps: Step[],
  options?: {
    canvas?: { width?: number; height?: number; padding?: number };
    playback?: { stepDuration?: number; autoPlay?: boolean };
  },
): Visualization {
  // Flatten actors from layout handles and standalone actors
  const actors: Actor[] = [];
  for (const item of layouts) {
    if ("kind" in item && "actors" in item) {
      // It's a LayoutHandle
      actors.push(...(item as LayoutHandle).actors);
    } else {
      // It's a standalone Actor
      actors.push(item as Actor);
    }
  }

  const visualization: Visualization = {
    version: "1.0",
    metadata: {
      algorithm: meta.algorithm,
      title: meta.title,
      ...(meta.description && { description: meta.description }),
      ...(meta.category && { category: meta.category }),
      ...(meta.difficulty && { difficulty: meta.difficulty }),
      ...(meta.complexity && { complexity: meta.complexity }),
      ...(meta.input && { inputDescription: meta.input }),
      ...(meta.author && { author: meta.author }),
      ...(meta.tags && { tags: meta.tags }),
    },
    actors,
    steps,
  };

  // Auto-fix status labels if canvas height is overridden
  // Status labels placed at CANVAS.height-40 (560) would be off-screen on shorter canvases
  if (options?.canvas?.height && options.canvas.height < CANVAS.height) {
    const adjustedY = options.canvas.height - 40;
    for (const actor of actors) {
      if (actor.type === "label" && (actor as LabelActor).anchor === "middle"
          && (actor as LabelActor).fill === "$muted"
          && actor.y === CANVAS.height - 40) {
        actor.y = adjustedY;
      }
    }
  }

  // Add config only if non-default
  if (options?.canvas || options?.playback) {
    visualization.config = {};
    if (options.canvas) visualization.config.canvas = options.canvas;
    if (options.playback) visualization.config.playback = options.playback;
  }

  // Validate before returning
  const result = validate(visualization);
  if (!result.valid) {
    const errMsg = result.errors.map(e => `[${e.location}] ${e.message}`).join("\n");
    throw new Error(`Primitives produced invalid visualization:\n${errMsg}`);
  }

  return visualization;
}
