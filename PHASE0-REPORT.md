# Phase 0 Stress Test Report — AlgoViz Schema v1

## Executive Summary

Tested the schema against **31 algorithm visualizations** across 8 categories. All 31 pass validation after fixes. The schema itself required **zero changes** — every failure was an LLM generation error, not a schema limitation. However, 5 distinct failure patterns were identified that must be addressed in the prompt to achieve reliable zero-shot generation.

## Test Coverage

| Category | Count | Algorithms |
|---|---|---|
| Sorting | 5 | bubble sort, merge sort, quicksort, insertion sort |
| Searching | 3 | binary search, 3sum, find peak element |
| Graph | 5 | BFS, Dijkstra, DFS, topological sort, cycle detection (directed) |
| Tree | 4 | inorder, level-order, validate BST, LCA |
| Dynamic Programming | 4 | fibonacci, climbing stairs, knapsack (2D), LCS (2D) |
| Linked List | 3 | reverse, merge sorted, detect cycle |
| Stack/Other | 5 | valid parentheses, daily temps, min stack, evaluate RPN, container with water |
| String | 2 | sliding window, longest palindromic substring |

**Aggregate stats:** 454 actors, 255 steps, 1,056 actions across all 31 visualizations.

**Actor distribution:** 157 cells, 123 labels, 72 nodes, 61 edges, 30 pointers, 11 regions.

## Failure Analysis

### Pre-fix: 19 of 23 phase0 files failed validation (83% first-pass failure rate)

All 8 original hand-crafted examples passed. All 23 LLM-generated files had at least one error.

### Failure Mode 1: Enum Value Casing (14/23 files — 61%)

**Problem:** LLMs generate human-readable casing instead of schema enum values.

| Field | LLM Generated | Schema Requires |
|---|---|---|
| category | "Dynamic Programming" | "dynamic-programming" |
| category | "Tree Traversal" | "tree" |
| category | "linked-list" | "other" |
| difficulty | "Beginner", "Easy" | "beginner" |
| difficulty | "Medium" | "intermediate" |
| difficulty | "Hard" | "advanced" |

**Root cause:** LLMs default to Title Case and human-friendly names. The schema uses lowercase kebab-case.

**Fix for prompt:** Add explicit enum tables with "WRONG → RIGHT" examples. Consider making the schema case-insensitive or adding aliases.

**Schema consideration:** Add `"linked-list"` as a category value — 3 algorithms needed it and "other" is a poor fit.

### Failure Mode 2: Pointer Position Naming (3/23 files — 13%)

**Problem:** Pointers use `"top"/"bottom"` instead of `"above"/"below"`.

| Generated | Required |
|---|---|
| "top" | "above" |
| "bottom" | "below" |

**Root cause:** "top/bottom" is more common in CSS and general programming. "above/below" is AlgoViz-specific.

**Fix for prompt:** Bold the enum values, add a "COMMON MISTAKE" callout.

**Schema consideration:** Accept both `top/above` and `bottom/below` as aliases.

### Failure Mode 3: Create Action Key Name (3/23 files — 13%)

**Problem:** Create actions use `{ type: "create", target: {...} }` instead of `{ type: "create", actor: {...} }`.

**Root cause:** Update and remove both use `target`, so LLMs generalize `target` to create as well. Reasonable but wrong.

**Fix for prompt:** Add a comparison table showing all 3 action types side by side.

**Schema consideration:** This is a legitimate UX issue. The asymmetry between `target` (update/remove) and `actor` (create) is confusing.

### Failure Mode 4: Complexity as String (5/23 files — 22%)

**Problem:** `metadata.complexity` set to string `"O(n²)"` instead of object `{ time: "O(n²)", space: "O(1)" }`.

**Root cause:** LLMs take the shortcut of putting complexity as a single string rather than structured object.

**Fix for prompt:** Show the exact object shape inline. Never mention complexity without showing the object format.

### Failure Mode 5: Missing Step Description (5/23 files — 22%)

**Problem:** Steps have only `actions` array, completely missing the required `description` field.

**Root cause:** The step description is metadata for humans. LLMs focused on the structural `actions` and skipped the narrative.

**Fix for prompt:** Show a complete step example with description bolded as required.

## Schema Durability Assessment

**The schema held perfectly.** No algorithm required a new actor type, action type, or structural change.

Highlights of what the schema handled well:
- **2D DP tables** (knapsack, LCS): Modeled as grids of individual cells. Verbose but correct.
- **Linked list reversal**: Edge remove + create pattern works for changing edge direction.
- **Cycle detection**: Pointer actors with re-targeting handle fast/slow pointer patterns cleanly.
- **Monotonic stack**: Region + dynamic cell creation captures stack state changes.
- **Two-pointer patterns**: Multiple pointers on same array works naturally.
- **Weighted graph edges**: Edge `label` property handles weight display.

## Recommendations

### Prompt Engineering (High Priority)
1. Add failure mode examples to system prompt — "COMMON MISTAKES" section
2. Show all 3 action types in a comparison table
3. List every enum value explicitly, never paraphrase
4. Include a complete minimal example at the end of the prompt

### Schema v1.1 Considerations (Medium Priority)
1. Add `"linked-list"` category to enum
2. Accept `"top"/"bottom"` as position aliases alongside `"above"/"below"`
3. Consider renaming create action's `actor` → `target` for consistency (breaking change)
4. Consider making `metadata.complexity` accept either string or object format
5. Make `step.description` have a more prominent default or generate from action targets

### Tooling (Low Priority)
1. Add `--fix` flag to CLI validator that auto-corrects known LLM mistakes
2. Add a pre-validation normalizer that handles case, aliases, and common reshaping
3. Track first-pass success rate as a KPI for prompt quality

## Appendix: File Inventory

```
examples/                     (8 hand-crafted, all pass)
  bubble-sort.json            7 actors, 15 steps
  binary-search.json          16 actors, 6 steps
  bfs-graph.json              16 actors, 14 steps
  two-pointer.json            11 actors, 6 steps
  merge-sort.json             18 actors, 12 steps
  dijkstra.json               15 actors, 8 steps
  valid-parentheses.json      14 actors, 10 steps
  sliding-window.json         13 actors, 5 steps

examples/phase0/              (23 LLM-generated, all pass after fixes)
  fibonacci.json              17 actors, 7 steps
  climbing-stairs.json        15 actors, 6 steps
  knapsack.json               31 actors, 13 steps
  lcs.json                    33 actors, 13 steps
  inorder-traversal.json      13 actors, 8 steps
  level-order.json            13 actors, 8 steps
  validate-bst.json           15 actors, 8 steps
  lowest-common-ancestor.json 16 actors, 4 steps
  reverse-linked-list.json    10 actors, 5 steps
  merge-sorted-lists.json     18 actors, 8 steps
  detect-cycle.json           12 actors, 6 steps
  dfs-traversal.json          12 actors, 7 steps
  topological-sort.json       12 actors, 7 steps
  cycle-detection-directed.json 11 actors, 6 steps
  daily-temperatures.json     22 actors, 9 steps
  min-stack.json              6 actors, 8 steps
  longest-palindromic-substring.json 13 actors, 8 steps
  evaluate-rpn.json           12 actors, 5 steps
  quicksort.json              14 actors, 11 steps
  insertion-sort.json         10 actors, 9 steps
  three-sum.json              13 actors, 10 steps
  container-with-most-water.json 15 actors, 8 steps
  find-peak-element.json      11 actors, 5 steps
```
