/**
 * normalize.ts — Auto-correct known LLM generation mistakes.
 *
 * This is a safety net: the prompt should prevent these errors,
 * but if they slip through, normalize() fixes them before validation.
 *
 * Returns { data, fixes } where fixes is a list of what was changed.
 */

export interface NormalizeFix {
  path: string;
  from: string;
  to: string;
}

export interface NormalizeResult {
  /** The (possibly mutated) data object */
  data: Record<string, unknown>;
  /** List of corrections applied */
  fixes: NormalizeFix[];
}

// ── Category normalization map ──────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  // Title case variants
  "Dynamic Programming": "dynamic-programming",
  "dynamic programming": "dynamic-programming",
  "dp": "dynamic-programming",
  "DP": "dynamic-programming",
  // Tree variants
  "Tree Traversal": "tree",
  "tree traversal": "tree",
  "Tree Search": "tree",
  "tree search": "tree",
  "Tree Validation": "tree",
  "tree validation": "tree",
  "Tree": "tree",
  "binary tree": "tree",
  "BST": "tree",
  "bst": "tree",
  // Underscore variants (common LLM mistake)
  "dynamic_programming": "dynamic-programming",
  "linked_list": "linked-list",
  // Linked list
  "linked list": "linked-list",
  "Linked List": "linked-list",
  // Stack/Queue
  "stack": "other",
  "Stack": "other",
  "queue": "other",
  "Queue": "other",
  "monotonic stack": "other",
  "Monotonic Stack": "other",
  // Graph variants
  "Graph": "graph",
  // Sorting
  "Sorting": "sorting",
  "sort": "sorting",
  // Searching
  "Searching": "searching",
  "search": "searching",
  "two pointer": "searching",
  "Two Pointer": "searching",
  // String
  "String": "string",
  // Backtracking
  "Backtracking": "backtracking",
  // Hashing
  "Hashing": "hashing",
  "hash": "hashing",
  "Hash Map": "hashing",
  // Heap
  "Heap": "heap",
  "priority queue": "heap",
  "Priority Queue": "heap",
  // Greedy (not in schema — map to other)
  "greedy": "other",
  "Greedy": "other",
};

const VALID_CATEGORIES = new Set([
  "sorting", "searching", "graph", "tree", "dynamic-programming",
  "backtracking", "string", "hashing", "heap", "linked-list", "other",
]);

// ── Difficulty normalization map ────────────────────────────────────────────

const DIFFICULTY_MAP: Record<string, string> = {
  // Case variants
  "Beginner": "beginner",
  "BEGINNER": "beginner",
  // Easy -> beginner
  "easy": "beginner",
  "Easy": "beginner",
  "EASY": "beginner",
  "simple": "beginner",
  "Simple": "beginner",
  // Medium -> intermediate
  "medium": "intermediate",
  "Medium": "intermediate",
  "MEDIUM": "intermediate",
  "Intermediate": "intermediate",
  "INTERMEDIATE": "intermediate",
  // Hard -> advanced
  "hard": "advanced",
  "Hard": "advanced",
  "HARD": "advanced",
  "expert": "advanced",
  "Expert": "advanced",
  "Advanced": "advanced",
  "ADVANCED": "advanced",
};

const VALID_DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);

// ── Position normalization map ──────────────────────────────────────────────

const POSITION_MAP: Record<string, string> = {
  "top": "above",
  "Top": "above",
  "TOP": "above",
  "bottom": "below",
  "Bottom": "below",
  "BOTTOM": "below",
};

const VALID_POSITIONS = new Set(["above", "below", "left", "right"]);

// ── Transition hint normalization map ─────────────────────────────────────

const TRANSITION_MAP: Record<string, string> = {
  "Instant": "instant", "INSTANT": "instant",
  "Smooth": "smooth", "SMOOTH": "smooth",
  "Swap": "swap", "SWAP": "swap",
  "Highlight": "highlight", "HIGHLIGHT": "highlight",
  "Fade": "fade", "FADE": "fade",
};

const VALID_TRANSITIONS = new Set(["instant", "smooth", "swap", "highlight", "fade"]);

// ── Annotation type normalization map ─────────────────────────────────────

const ANNOTATION_MAP: Record<string, string> = {
  "Invariant": "invariant", "INVARIANT": "invariant",
  "Initialization": "initialization", "INITIALIZATION": "initialization",
  "init": "initialization", "setup": "initialization",
  "Boundary": "boundary", "BOUNDARY": "boundary",
  "edge-case": "boundary",
  "Decision": "decision", "DECISION": "decision",
  "comparison": "decision",
  "Warning": "warning", "WARNING": "warning",
  "Explanation": "explanation", "EXPLANATION": "explanation",
  "insight": "explanation",
};

const VALID_ANNOTATIONS = new Set([
  "invariant", "initialization", "boundary", "decision", "warning", "explanation",
]);

// ── Main normalize function ─────────────────────────────────────────────────

export function normalize(data: unknown): NormalizeResult {
  // Deep clone to avoid mutating the original
  const obj = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const fixes: NormalizeFix[] = [];

  const metadata = obj.metadata as Record<string, unknown> | undefined;
  if (metadata) {
    // Fix category
    if (typeof metadata.category === "string" && !VALID_CATEGORIES.has(metadata.category)) {
      const mapped = CATEGORY_MAP[metadata.category];
      if (mapped) {
        fixes.push({ path: "metadata.category", from: metadata.category, to: mapped });
        metadata.category = mapped;
      } else {
        // Fallback: try lowercase-kebab conversion
        const kebab = metadata.category.toLowerCase().replace(/[_ ]/g, "-");
        if (VALID_CATEGORIES.has(kebab)) {
          fixes.push({ path: "metadata.category", from: metadata.category, to: kebab });
          metadata.category = kebab;
        }
      }
    }

    // Fix difficulty
    if (typeof metadata.difficulty === "string" && !VALID_DIFFICULTIES.has(metadata.difficulty)) {
      const mapped = DIFFICULTY_MAP[metadata.difficulty];
      if (mapped) {
        fixes.push({ path: "metadata.difficulty", from: metadata.difficulty, to: mapped });
        metadata.difficulty = mapped;
      }
    }

    // Fix complexity: string -> object
    if (typeof metadata.complexity === "string") {
      const orig = metadata.complexity;
      metadata.complexity = { time: orig, space: "O(1)" };
      fixes.push({ path: "metadata.complexity", from: `"${orig}"`, to: JSON.stringify(metadata.complexity) });
    }
  }

  // Fix actors
  const actors = obj.actors as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(actors)) {
    for (let i = 0; i < actors.length; i++) {
      const actor = actors[i];
      if (actor.type === "pointer" && typeof actor.position === "string") {
        if (!VALID_POSITIONS.has(actor.position)) {
          const mapped = POSITION_MAP[actor.position];
          if (mapped) {
            fixes.push({
              path: `actors[${i}].position`,
              from: actor.position,
              to: mapped,
            });
            actor.position = mapped;
          }
        }
      }
    }
  }

  // Fix steps
  const steps = obj.steps as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(steps)) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Fix missing description
      if (!step.description) {
        const title = metadata?.title || "algorithm";
        step.description = `Step ${i + 1} of ${title}`;
        fixes.push({
          path: `steps[${i}].description`,
          from: "(missing)",
          to: step.description as string,
        });
      }

      // Fix transition hint casing
      if (typeof step.transition === "string" && !VALID_TRANSITIONS.has(step.transition)) {
        const mapped = TRANSITION_MAP[step.transition];
        if (mapped) {
          fixes.push({ path: `steps[${i}].transition`, from: step.transition, to: mapped });
          step.transition = mapped;
        } else {
          const lower = step.transition.toLowerCase();
          if (VALID_TRANSITIONS.has(lower)) {
            fixes.push({ path: `steps[${i}].transition`, from: step.transition, to: lower });
            step.transition = lower;
          }
        }
      }

      // Fix annotation type casing
      if (typeof step.annotation === "string" && !VALID_ANNOTATIONS.has(step.annotation)) {
        const mapped = ANNOTATION_MAP[step.annotation];
        if (mapped) {
          fixes.push({ path: `steps[${i}].annotation`, from: step.annotation as string, to: mapped });
          step.annotation = mapped;
        } else {
          const lower = (step.annotation as string).toLowerCase();
          if (VALID_ANNOTATIONS.has(lower)) {
            fixes.push({ path: `steps[${i}].annotation`, from: step.annotation as string, to: lower });
            step.annotation = lower;
          }
        }
      }

      // Fix create actions: target -> actor
      const actions = step.actions as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(actions)) {
        for (let j = 0; j < actions.length; j++) {
          const action = actions[j];
          if (
            action.type === "create" &&
            action.target &&
            typeof action.target === "object" &&
            !action.actor
          ) {
            action.actor = action.target;
            delete action.target;
            fixes.push({
              path: `steps[${i}].actions[${j}]`,
              from: 'create.target',
              to: 'create.actor',
            });
          }
        }
      }
    }
  }

  return { data: obj, fixes };
}
