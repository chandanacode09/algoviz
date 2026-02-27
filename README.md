# AlgoViz

LLM-driven algorithm visualization runtime. Describe an algorithm → get an interactive HTML artifact.

Three layers: **composable primitives** for structural correctness, **agentic generation** for LLM-powered creation, **declarative JSON format** for deterministic playback.

## Install

```bash
npm install algoviz
```

For LLM generation, also install the Anthropic SDK:

```bash
npm install @anthropic-ai/sdk
```

## Quick Start: Build a Visualization with Primitives

```js
const { layout, ops, step, viz, titleLabel, statusLabel, resetIds } = require("algoviz");

resetIds();

const arr = layout.array([5, 3, 8, 1]);
const title = titleLabel("My Sort");
const status = statusLabel("");

const steps = [
  step("Compare arr[0] and arr[1]",
    ops.highlight([arr.id(0), arr.id(1)], "$warning"),
    ops.setText(status.id, "5 > 3? Yes")
  ),
  step("Swap them",
    ops.swap(arr, 0, 1, "$danger"),
    ops.setText(status.id, "Swapped → [3, 5, 8, 1]")
  ),
];

const v = viz(
  { algorithm: "demo", title: "My Sort", category: "sorting" },
  [arr, title, status],
  steps
);

// v is a validated Visualization object — write JSON or render HTML
```

`viz()` auto-validates. If anything is structurally wrong, it throws immediately with the exact error.

## CLI

```bash
# Validate JSON files
algoviz validate examples/*.json

# Auto-fix common LLM mistakes then validate
algoviz validate file.json --fix

# Render to interactive HTML
algoviz render viz.json -o output.html

# Show stats
algoviz info viz.json

# Generate via LLM (requires ANTHROPIC_API_KEY)
algoviz generate "merge sort on [38, 27, 43, 3, 9]" --render -v

# Batch generate
algoviz generate --batch "quicksort" "BFS" "dijkstra" --render
```

## Primitives API

### Layouts

Each returns a handle with `.actors`, `.ids`, and lookup methods.

| Layout | Signature | Returns |
|---|---|---|
| `layout.array(values, opts?)` | Horizontal cells, auto-centered | `ArrayHandle` — `.id(i)`, `.values` |
| `layout.tree(root, opts?)` | Binary tree with edges | `TreeHandle` — `.nodeId(value)` |
| `layout.graph(nodes, edges, opts?)` | Circular node placement | `GraphHandle` — `.nodeId(id)`, `.edgeId(from, to)` |
| `layout.linkedList(values, opts?)` | Horizontal node chain | `LinkedListHandle` — `.id(i)` |
| `layout.matrix(rows, cols, opts?)` | 2D cell grid (DP tables) | `MatrixHandle` — `.id(row, col)` |

### Operations

Pure functions returning `Action[]`. Pass into `step()`.

| Op | What it does |
|---|---|
| `ops.highlight(ids, fill)` | Set fill color |
| `ops.reset(ids)` | Reset to `$default` |
| `ops.markDone(ids)` | Set `$success` fill + stroke |
| `ops.swap(arrayHandle, i, j)` | Swap two array cells (mutates handle) |
| `ops.setValue(id, value)` | Update value + label |
| `ops.setText(id, text)` | Update label text |
| `ops.movePointer(id, target)` | Retarget a pointer |
| `ops.create(actor)` / `ops.remove(id)` | Add/remove actors mid-animation |
| `ops.highlightEdge(ids, stroke)` | Highlight edges |

Theme colors: `$primary`, `$success`, `$warning`, `$danger`, `$default`, `$muted`, `$text`

### Builders

```js
step("description", ops.highlight(...), ops.setText(...))   // → Step
viz(metadata, [layouts, actors], steps, config?)             // → Visualization (validated)
titleLabel("Title")                                          // → LabelActor (top center)
statusLabel("Text")                                          // → LabelActor (bottom center)
pointer("label", targetId, "above")                          // → PointerActor
```

## Generate Command

The `generate` command sends a prompt to Claude, gets back primitives code, executes it, validates the output, and retries on failure.

```bash
export ANTHROPIC_API_KEY=sk-ant-...

# Single algorithm
algoviz generate "binary search on [2, 5, 8, 12, 16, 23], target 12" --render

# Batch with custom model
algoviz generate --batch "insertion sort" "DFS" "knapsack DP" --model claude-sonnet-4-20250514 --render -v
```

The agentic loop: `prompt → LLM → code → execute → validate → (retry on error) → JSON + HTML`

## Programmatic API

```js
const { validate, renderHTML, Engine, generate } = require("algoviz");

// Validate
const result = validate(jsonData);
if (!result.valid) console.error(result.errors);

// Render to HTML string
const html = renderHTML(vizData);

// State engine for programmatic playback
const engine = new Engine(vizData);
const scene = engine.goToStep(3);

// Generate via API
const result = await generate("quicksort on [7, 2, 1, 6]", {
  render: true,
  outputDir: "./output",
});
```

## Architecture

```
                    ┌─────────────┐
    "visualize      │   Claude /  │   primitives
     quicksort" ──▶ │   Any LLM   │ ──▶ JS code
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Execute   │   node child_process
                    │   + Retry   │ ◀── error feedback
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Validate   │   schema + semantic
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          viz.json    viz.html     viz.js (source)
```

## License

MIT
