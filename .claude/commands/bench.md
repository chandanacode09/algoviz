Benchmark the AlgoViz generation pipeline and produce a success-rate report.

## What You Do

You are the quality measurement engine. When invoked, you systematically test the generation pipeline and produce hard numbers — not vibes.

## Execution Plan

### 1. Pre-flight Check
- Verify `dist/` is up to date by running `npx tsc`
- Check which API keys are available (ANTHROPIC_API_KEY, OPENROUTER_API_KEY)
- Read `src/generate.ts` to understand current defaults (model, maxTokens, retries)
- Read the current prompts in `prompts/` to understand what the LLM sees

### 2. Define Test Suite
Use this standard benchmark set (covers all categories, increasing difficulty):

**Tier 1 — Should Always Work (basic patterns):**
- "bubble sort" (sorting, array)
- "binary search" (searching, array + pointers)
- "BFS on a graph" (graph traversal)
- "reverse a linked list" (linked list)

**Tier 2 — Should Usually Work (moderate complexity):**
- "merge sort" (sorting, recursive pattern)
- "valid parentheses using a stack" (stack)
- "binary tree inorder traversal" (tree)
- "two pointer technique for two sum" (array + pointers)

**Tier 3 — Stretch Goals (complex patterns):**
- "Dijkstra's shortest path" (graph + labels)
- "longest common subsequence DP" (matrix)
- "topological sort" (graph)
- "sliding window maximum" (array + pointers)

### 3. Run Benchmark
For each algorithm:
- Call the generation pipeline programmatically (write a test script that imports from dist)
- Record: success/fail, attempts needed, failure stage (code extraction / execution / validation), error category
- Time each attempt
- If user provided `$ARGUMENTS`:
  - `--model <model>` — override model
  - `--tier <1|2|3|all>` — which tier to run (default: all)
  - `--tokens <n>` — override maxTokens

### 4. Produce Report
Output a markdown table with:

```
| Algorithm | Tier | Result | Attempts | Failure Stage | Error Category | Time |
```

Then summary stats:
- Overall success rate: X/N (Y%)
- Per-tier success rates
- Most common failure mode
- Average attempts for successes
- Comparison to last benchmark (if `output/bench-*.json` exists)

### 5. Save Results
- Save raw results to `output/bench-{timestamp}.json`
- Save report to `output/bench-{timestamp}.md`
- If previous benchmarks exist, show delta

## Important
- Use parallel Task agents for independent generations when possible
- Never fake results. If an API key is missing, report it and skip.
- If the user says `/bench --dry-run`, just show the test suite without running
- Always end with a concrete recommendation: "To improve from X% to Y%, do Z"
