# AlgoViz — Project Instructions

## What This Is
LLM-driven algorithm visualization runtime. Describe an algorithm, get interactive HTML.
Three layers: composable primitives, agentic generation, declarative JSON playback.

## Build & Test
```bash
# Build TypeScript
npx tsc

# Run all tests + validate all examples
./scripts/build-test.sh

# Validate all example JSON files against schema (use --fix for auto-normalize)
./scripts/validate-examples.sh [--fix]

# Test generation pipeline (primitives code → JSON → validate)
./scripts/test-gen.sh [--render]

# Render a JSON file to HTML preview
./scripts/preview.sh <input.json> [output.html]
```

## After Making Changes
- Always run `./scripts/build-test.sh` after modifying any `.ts` file
- After schema.json changes, run `./scripts/validate-examples.sh` to check backwards compatibility
- After primitives changes, run `./scripts/test-gen.sh` to verify generation pipeline
- After player/render changes, run `./scripts/preview.sh` on an example to verify HTML output

## Key Architecture
- **Flat JSON format** — no nesting, pure actor/step lists. LLM-friendly.
- **Deterministic state** — left-fold: `state[n] = apply(state[n-1], steps[n].actions)`
- **Virtual canvas** — 1000x600, absolute positioning, scales to any display
- **Two-layer validation** — JSON Schema (Ajv) + semantic (referential integrity, bounds)
- **Normalization** — auto-fixes 40+ common LLM mistakes before validation

## File Layout
| Area | Path |
|------|------|
| Schema | `schema.json` |
| Core | `src/{types,validate,engine,normalize,render,generate}.ts` |
| Primitives | `src/primitives/{layout,ops,builders,types}.ts` |
| CLI | `src/cli/index.ts` |
| Prompts | `prompts/*.md` |
| Player | `artifact-player.html` |
| Examples | `examples/*.json`, `examples/phase0/*.json`, `examples/gen/*.js` |
| Tests | `test-primitives.js`, `gen-test.js`, `test-package.js`, `render-primitives-test.js` |
| Scripts | `scripts/*.sh` |

## Conventions
- Actor types: cell, node, edge, pointer, label, region
- Action types: update, create, remove
- Theme colors: `$primary`, `$success`, `$warning`, `$danger`, `$default`, `$muted`, `$text`, `$secondary`
- IDs: use `resetIds()` before building, auto-incremented via `nextId(prefix)`
- All layout functions return handles with `.actors`, `.ids`, lookup methods
- All ops functions return `Action[]` — composable into `step()`
- `viz()` auto-validates on construction

## Known Issues
- LLM generation ~26% first-pass success (see PHASE0-REPORT.md) — prompts improved with WRONG/RIGHT examples + pre-flight checklists
- `create.actor` vs `update.target`/`remove.target` asymmetry (mitigated by normalize.ts)
- No animation sequencing within steps (all actions simultaneous)
- No actor composition/grouping
- Test coverage ~60% (edge cases, performance, concurrency not covered)
