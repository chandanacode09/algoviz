# AlgoViz Visualization Format v1 — Specification

## Overview

AlgoViz v1 is a declarative JSON format for describing algorithm visualizations. A visualization is a sequence of **steps** that modify **actors** (visual elements) on a virtual **canvas**. The format is designed for LLM generation: flat structures, minimal required fields, sensible defaults.

**Core model:** Actors define the initial scene. Steps mutate actor properties over time. At any step N, the scene is deterministically computed by applying steps 0..N to the initial actor states.

## Structure

```
{
  version    → "1.0" (always)
  metadata   → algorithm info, educational content
  config?    → canvas size, theme colors, playback timing
  actors     → visual elements with initial state
  steps      → ordered sequence of state changes
}
```

## Metadata

Required fields: `algorithm` (snake_case identifier), `title` (human-readable).

Optional: `description`, `category` (enum), `complexity` (time/space), `difficulty` (beginner/intermediate/advanced), `inputDescription`, `author`, `tags`.

Categories: sorting, searching, graph, tree, dynamic-programming, backtracking, string, hashing, heap, other.

## Config

All optional. Defaults shown.

**Canvas:** 1000×600 virtual coordinate space, 40px padding, white background. The renderer scales this to fit the actual display — authors work in virtual coordinates, never pixels.

**Theme:** Named color palette. Actors can reference theme colors with `$` prefix (e.g., `"$primary"`) or use literal CSS colors (e.g., `"#3b82f6"`).

| Name      | Default   | Usage                              |
|-----------|-----------|------------------------------------|
| default   | #e2e8f0   | Unvisited/inactive elements        |
| primary   | #3b82f6   | Active/current element             |
| secondary | #8b5cf6   | Secondary highlight                |
| success   | #10b981   | Completed/sorted/found             |
| warning   | #f59e0b   | Comparing/examining                |
| danger    | #ef4444   | Swapping/error/removing            |
| text      | #1e293b   | Default text color                 |
| muted     | #94a3b8   | Disabled/eliminated elements       |

**Playback:** 800ms per step, no autoplay.

## Actor Types

Every actor has a unique `id` and a `type`. All actors support `opacity` (0–1, default 1).

### cell

Rectangular box with a value. Use for array elements, table cells, matrix entries, stack/queue slots.

Required: `id`, `type`, `x`, `y`, `value`

| Property     | Type           | Default    | Notes                     |
|--------------|----------------|------------|---------------------------|
| x, y         | number         | —          | Top-left corner position  |
| width        | number         | 60         |                           |
| height       | number         | 60         |                           |
| value        | number\|string | —          | The data value            |
| label        | string         | str(value) | Display text inside       |
| sublabel     | string         | —          | Text below cell (e.g. index) |
| fill         | color          | $default   |                           |
| stroke       | color          | $muted     |                           |
| strokeWidth  | number         | 2          |                           |
| textColor    | color          | $text      |                           |
| fontSize     | number         | 16         |                           |
| cornerRadius | number         | 4          |                           |

### node

Circle with a value. Use for tree nodes, graph vertices, linked list nodes.

Required: `id`, `type`, `x`, `y`, `value`

| Property    | Type           | Default    | Notes               |
|-------------|----------------|------------|----------------------|
| x, y        | number         | —          | Center position      |
| radius      | number         | 25         |                      |
| value       | number\|string | —          | The data value       |
| label       | string         | str(value) | Display text inside  |
| sublabel    | string         | —          | Text below node      |
| fill        | color          | $default   |                      |
| stroke      | color          | $muted     |                      |
| strokeWidth | number         | 2          |                      |
| textColor   | color          | $text      |                      |
| fontSize    | number         | 14         |                      |

### edge

Line connecting two nodes. Use for tree edges, graph edges.

Required: `id`, `type`, `source`, `target`

| Property    | Type                     | Default | Notes                          |
|-------------|--------------------------|---------|--------------------------------|
| source      | string                   | —       | Source node actor ID           |
| target      | string                   | —       | Target node actor ID           |
| directed    | boolean                  | false   | Show arrowhead at target       |
| weight      | number\|string\|null     | null    | Displayed at edge midpoint     |
| label       | string                   | —       | Overrides weight display       |
| stroke      | color                    | $muted  |                                |
| strokeWidth | number                   | 2       |                                |
| dashArray   | string                   | ""      | SVG dash pattern. "5,5"=dashed |

### pointer

Arrow pointing at another actor. Use for index pointers, variable markers.

Required: `id`, `type`, `target`, `position`

| Property  | Type   | Default  | Notes                                     |
|-----------|--------|----------|-------------------------------------------|
| target    | string | —        | ID of actor being pointed at              |
| position  | enum   | —        | "above" \| "below" \| "left" \| "right"  |
| label     | string | —        | Text on the pointer (e.g. "i", "pivot")   |
| fill      | color  | $primary |                                           |
| textColor | color  | $primary |                                           |
| fontSize  | number | 14       |                                           |

**Note:** Pointers follow their target. If a pointer targets cell `c3`, and you update the pointer's `target` to `c5`, the pointer moves to cell `c5`.

### label

Standalone text. Use for titles, status messages, complexity displays.

Required: `id`, `type`, `x`, `y`, `text`

| Property   | Type   | Default  | Notes                                   |
|------------|--------|----------|-----------------------------------------|
| x, y       | number | —        | Position                                |
| text       | string | —        | The text content                        |
| fontSize   | number | 16       |                                         |
| fontWeight | enum   | "normal" | "normal" \| "bold"                      |
| fill       | color  | $text    |                                         |
| anchor     | enum   | "start"  | "start" \| "middle" \| "end"            |

### region

Semi-transparent highlighted area. Use for sorted regions, search windows, partitions.

Required: `id`, `type`, `x`, `y`, `width`, `height`

| Property     | Type   | Default  | Notes                           |
|--------------|--------|----------|---------------------------------|
| x, y         | number | —        | Top-left corner                 |
| width        | number | —        |                                 |
| height       | number | —        |                                 |
| fill         | color  | $success |                                 |
| stroke       | color  | $success |                                 |
| strokeWidth  | number | 2        |                                 |
| cornerRadius | number | 8        |                                 |
| label        | string | —        | Text in the region              |
| opacity      | number | 0.15     | Note: lower default than others |

## Steps

Each step has a `description` (shown to the viewer) and an array of `actions` applied simultaneously.

Optional `transition` hint tells the renderer how to animate: `instant`, `smooth` (default), `swap`, `highlight`, `fade`.

## Actions

Three types:

### update

Change properties of an existing actor.

```json
{ "type": "update", "target": "c0", "props": { "fill": "$warning", "value": 3 } }
```

`props` is a flat object. Keys must be valid properties for the target actor's type. Values replace the current value.

### create

Add a new actor mid-visualization.

```json
{ "type": "create", "actor": { "id": "marker", "type": "label", "x": 100, "y": 50, "text": "✓" } }
```

### remove

Remove an actor from the scene.

```json
{ "type": "remove", "target": "marker" }
```

## State Computation

The state at step N is computed as:

```
state₀ = initial actor definitions
stateₙ = apply(stateₙ₋₁, steps[n].actions)

apply(state, actions):
  for each action in actions:
    if action.type == "update":
      state[action.target] = { ...state[action.target], ...action.props }
    if action.type == "create":
      state[action.actor.id] = action.actor
    if action.type == "remove":
      delete state[action.target]
  return state
```

This is a pure left fold. Same input always produces the same output. The renderer can compute the scene at any step by replaying from the beginning, or maintain a running state and apply steps incrementally.

## ID Conventions

Not enforced, but recommended for consistency and LLM training:

| Type    | Convention  | Examples          |
|---------|-------------|-------------------|
| cell    | c0, c1, c2  | c0, c1, c2       |
| node    | n0, n1, nA  | n0, n1, nA, nB   |
| edge    | e0, eAB     | e0, e1, eAB, eBC |
| pointer | p0, pL, pR  | p0, pL, pMid     |
| label   | l0, title   | l0, status, title |
| region  | r0, r1      | r0, r_sorted      |

## Constraints

1. All actor IDs must be unique across the entire visualization
2. Edge `source` and `target` must reference existing node actors
3. Pointer `target` must reference an existing actor
4. `update` actions must target existing actors (not yet removed)
5. `create` actions must not use an ID that already exists
6. `remove` actions must target existing actors
7. Steps array must have at least 1 step
8. Actors array must have at least 1 actor
9. Canvas coordinates use a virtual 1000×600 grid (configurable)
10. Colors are CSS values or theme references prefixed with `$`

## Design Decisions

**Why flat actor list (no nesting)?** LLMs generate flat structures more reliably than deeply nested ones. A tree is represented as nodes + edges, not nested children.

**Why absolute positions (no layout engine)?** Eliminates ambiguity. LLMs can compute positions with simple arithmetic. No layout algorithm variations between renderers.

**Why value changes instead of position swaps?** For sorting: cells stay in place, values move between them. Simpler for LLMs, and the renderer can animate the visual swap. Position-based swaps create tracking complexity.

**Why string-based theme references?** `"$primary"` is more readable and less error-prone than hex codes. LLMs can use semantic names without memorizing the palette.

**Why SVG-compatible properties (fill, stroke, dashArray)?** Direct mapping to SVG attributes. No abstraction layer needed. LLMs already know SVG.
