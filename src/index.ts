/**
 * AlgoViz — Algorithm Visualization Runtime
 *
 * @example
 * ```ts
 * import { validate, renderHTML, Engine } from "algoviz";
 *
 * // Validate
 * const result = validate(myVizJSON);
 * if (!result.valid) console.error(result.errors);
 *
 * // Render to self-contained HTML
 * const html = renderHTML(myVizJSON);
 *
 * // Programmatic state engine
 * const engine = new Engine(myVizJSON);
 * const scene = engine.goToStep(3);
 * ```
 */

// Types (re-export everything)
export type {
  Visualization,
  Metadata,
  AlgorithmCategory,
  Difficulty,
  Complexity,
  ComplexityObject,
  Config,
  CanvasConfig,
  Theme,
  PlaybackConfig,
  Color,
  Actor,
  ActorType,
  CellActor,
  NodeActor,
  EdgeActor,
  PointerActor,
  LabelActor,
  RegionActor,
  Step,
  TransitionHint,
  Action,
  UpdateAction,
  CreateAction,
  RemoveAction,
  Scene,
  ActorProps,
  UpdatableProps,
} from "./types";

// Validation
export {
  validate,
  validateSchemaOnly,
  summarize,
  type ValidationResult,
  type ValidationError,
  type ValidationSummary,
} from "./validate";

// State Engine
export { Engine, type EngineConfig } from "./engine";

// Render
export { renderHTML, renderToFile } from "./render";

// Normalize (auto-fix LLM mistakes)
export {
  normalize,
  type NormalizeFix,
  type NormalizeResult,
} from "./normalize";

// Composable Primitives
export { layout, ops, step, stepWithTransition, teach, annotatedStep, viz } from "./primitives";
export { titleLabel, statusLabel, label, pointer, resetIds, nextId } from "./primitives";
export type {
  ArrayHandle, TreeHandle, GraphHandle, LinkedListHandle, MatrixHandle,
  LayoutHandle, VizMetadata, TreeNode, GraphNodeInput, GraphEdgeInput,
} from "./primitives";

// Generation (agentic loop)
export {
  generate,
  generateBatch,
  type GenerateOptions,
  type GenerateResult,
} from "./generate";

// Schema (raw JSON)
import schemaJSON from "../schema.json";
export { schemaJSON as schema };
