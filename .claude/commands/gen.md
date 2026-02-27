Generate a visualization with full diagnostics and quality analysis.

## What You Do

You are the generation specialist. You don't just call `generate()` — you produce a visualization with quality analysis, compare it against reference examples, and suggest improvements. You're the QA engineer for generated content.

## How You Work

### 1. Parse the Request
- `$ARGUMENTS` contains the algorithm to visualize (e.g., "quicksort", "dijkstra's shortest path")
- Optional flags in arguments:
  - `--model <model>` — override model
  - `--educational` — use teach() and annotatedStep() for rich narration
  - `--compare` — compare against existing example if one exists
  - `--manual` — don't call LLM; write the primitives script yourself using your knowledge of the API

### 2. Check Existing Examples
- Search `examples/` and `examples/phase0/` for existing visualizations of this algorithm
- Search `examples/gen/` for existing primitives scripts
- If one exists, note it for comparison

### 3. Generate (two paths)

**Path A: LLM Generation (default)**
- Build, then run the CLI: `node dist/src/cli/index.js generate "<algorithm>" --render -v`
- Capture full output including attempt logs
- If it fails, invoke `/diagnose` logic to understand why

**Path B: Manual Generation (`--manual`)**
- Read the primitives API (layout, ops, builders)
- Write the primitives script yourself
- Execute and validate it
- This is useful for algorithms the LLM struggles with

### 4. Quality Analysis
Once a visualization is generated (success), analyze it:

**Structural Quality:**
- Actor count — is it reasonable for this algorithm?
- Step count — too few (skipping important steps)? Too many (verbose)?
- Action count per step — too many simultaneous actions are hard to follow
- Are all actors used? (created but never highlighted/updated = waste)

**Educational Quality:**
- Does the title describe the algorithm clearly?
- Does each step description explain what's happening and why?
- Are comparisons/swaps/decisions visually highlighted?
- Is the final state clearly marked as "done"?
- If educational mode: are there teach() steps? Invariant annotations?

**Visual Quality:**
- Are actors reasonably positioned (not overlapping, not off-canvas)?
- Are colors used meaningfully (not random)?
- Is the layout appropriate for the data structure?

### 5. Output
- Save JSON to `output/<algorithm>.json`
- Save HTML to `output/<algorithm>.html`
- Print quality scorecard
- If `--compare` and a reference exists, diff the two approaches
- Open the HTML in a browser if possible (`open output/<algorithm>.html` on macOS)

### 6. Iterate
- If quality is low, suggest specific improvements
- If the user says "fix it" or "improve it", edit the generated script and re-run
