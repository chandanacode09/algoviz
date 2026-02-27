/**
 * AlgoViz Agentic Generation Loop
 *
 * Takes an algorithm description, generates a primitives script via LLM,
 * executes it, validates the output, and retries on failure.
 *
 * Supports two API backends:
 *   - OpenRouter (OPENROUTER_API_KEY) — OpenAI-compatible, any model
 *   - Anthropic  (ANTHROPIC_API_KEY)  — native Anthropic Messages API
 *
 * Architecture:
 *   prompt + API reference → LLM → JS code → execute → validate → done
 *                                      ↑                    |
 *                                      └── error feedback ──┘
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { execSync } from "child_process";
import { validate, summarize, renderToFile } from "./index";
import type { Visualization } from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ApiBackend = "openrouter" | "anthropic";

export interface GenerateOptions {
  /** Maximum retry attempts on failure */
  maxRetries?: number;
  /** Model to use */
  model?: string;
  /** Output directory for generated files */
  outputDir?: string;
  /** Also render to HTML */
  render?: boolean;
  /** Path to the algoviz package root (for require resolution) */
  packageRoot?: string;
  /** Verbose logging */
  verbose?: boolean;
  /** Force a specific backend (auto-detected from env if not set) */
  backend?: ApiBackend;
  /** Max tokens for LLM response (default: 4096) */
  maxTokens?: number;
  /** Execution timeout in ms (default: 15000) */
  execTimeout?: number;
  /** HTTP request timeout in ms for OpenRouter (default: 60000) */
  httpTimeout?: number;
}

export interface GenerateResult {
  success: boolean;
  algorithm: string;
  /** Number of attempts (1 = first-pass success) */
  attempts: number;
  /** Generated JS source code */
  code?: string;
  /** Validated visualization JSON */
  visualization?: Visualization;
  /** File paths of outputs */
  files?: { json?: string; html?: string; js?: string };
  /** Error message if failed */
  error?: string;
  /** All attempt logs */
  log: AttemptLog[];
}

export interface AttemptLog {
  attempt: number;
  codeGenerated: boolean;
  executed: boolean;
  validated: boolean;
  error?: string;
}

// ─── Backend Detection ──────────────────────────────────────────────────────

function detectBackend(options: GenerateOptions): { backend: ApiBackend; apiKey: string; defaultModel: string } {
  if (options.backend === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return { backend: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, defaultModel: "claude-sonnet-4-20250514" };
  }
  if (options.backend === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return { backend: "openrouter", apiKey: process.env.OPENROUTER_API_KEY, defaultModel: "x-ai/grok-code-fast-1" };
  }

  // Auto-detect: prefer OpenRouter if available
  if (process.env.OPENROUTER_API_KEY) {
    return { backend: "openrouter", apiKey: process.env.OPENROUTER_API_KEY, defaultModel: "x-ai/grok-code-fast-1" };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { backend: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, defaultModel: "claude-sonnet-4-20250514" };
  }

  throw new Error(
    "No API key found. Set one of:\n" +
    "  export OPENROUTER_API_KEY=sk-or-v1-...\n" +
    "  export ANTHROPIC_API_KEY=sk-ant-..."
  );
}

// ─── System Prompt ──────────────────────────────────────────────────────────

function loadSystemPrompt(packageRoot: string): string {
  const promptPath = path.join(packageRoot, "prompts", "primitives-prompt.md");
  const raw = fs.readFileSync(promptPath, "utf-8");
  const idx = raw.indexOf("\n---\n");
  if (idx === -1) return raw;
  return raw.slice(idx + 5);
}

// ─── Code Extraction ────────────────────────────────────────────────────────

function extractCode(response: string): string {
  const jsMatch = response.match(/```(?:js|javascript)\n([\s\S]*?)```/);
  if (jsMatch) return jsMatch[1].trim();

  const codeMatch = response.match(/```\n([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();

  if (/^(?:const|let|var|import|require|\/\/)/.test(response.trim())) {
    return response.trim();
  }

  throw new Error("Could not extract JavaScript code from LLM response");
}

// ─── Code Execution ─────────────────────────────────────────────────────────

function executeCode(
  code: string,
  packageRoot: string,
  execTimeout: number = 15000,
): { success: boolean; output?: string; error?: string } {
  const distPath = path.join(packageRoot, "dist", "src", "index");
  const fixedCode = code.replace(
    /require\(["']algoviz["']\)/g,
    `require("${distPath.replace(/\\/g, "/")}")`
  );

  const tmpFile = path.join(packageRoot, ".gen-tmp.js");
  fs.writeFileSync(tmpFile, fixedCode, "utf-8");

  try {
    const output = execSync(`node "${tmpFile}"`, {
      cwd: packageRoot,
      encoding: "utf-8",
      timeout: execTimeout,
    });
    return { success: true, output };
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    return { success: false, error: err.stderr || err.message || "Unknown execution error" };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

// ─── HTTP Helper (no external deps) ─────────────────────────────────────────

function httpPost(url: string, headers: Record<string, string>, body: unknown, httpTimeout: number = 60000): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname,
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseBody.slice(0, 500)}`));
          } else {
            resolve(responseBody);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(httpTimeout, () => { req.destroy(); reject(new Error("Request timeout")); });
    req.write(data);
    req.end();
  });
}

// ─── OpenRouter Chat Completions ────────────────────────────────────────────

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 8192,
  httpTimeout: number = 60000,
): Promise<string> {
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  };

  const raw = await httpPost("https://openrouter.ai/api/v1/chat/completions", {
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": "https://github.com/sivaai09/render_engine",
    "X-Title": "AlgoViz",
  }, body, httpTimeout);

  const json = JSON.parse(raw);
  if (json.error) {
    throw new Error(json.error.message || JSON.stringify(json.error));
  }
  return json.choices?.[0]?.message?.content || "";
}

// ─── Anthropic Messages API ─────────────────────────────────────────────────

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 8192,
  httpTimeout: number = 60000,
): Promise<string> {
  const body = {
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.filter((m) => m.role !== "system"),
  };

  const raw = await httpPost("https://api.anthropic.com/v1/messages", {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  }, body, httpTimeout);

  const json = JSON.parse(raw);
  if (json.error) {
    throw new Error(json.error.message || JSON.stringify(json.error));
  }
  return (json.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}

// ─── LLM Call Dispatcher ────────────────────────────────────────────────────

async function callLLM(
  backend: ApiBackend,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = 8192,
  httpTimeout: number = 60000,
): Promise<string> {
  if (backend === "openrouter") {
    return callOpenRouter(apiKey, model, systemPrompt, messages, maxTokens, httpTimeout);
  }
  return callAnthropic(apiKey, model, systemPrompt, messages, maxTokens, httpTimeout);
}

// ─── Main Generate Function ─────────────────────────────────────────────────

export async function generate(
  algorithmPrompt: string,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  const {
    maxRetries = 2,
    outputDir,
    render = false,
    packageRoot = process.cwd(),
    verbose = false,
    maxTokens = 8192,
    execTimeout = 15000,
    httpTimeout = 60000,
  } = options;

  const detected = detectBackend(options);
  const model = options.model || detected.defaultModel;
  const { backend, apiKey } = detected;

  const systemPrompt = loadSystemPrompt(packageRoot);

  const log = (msg: string) => { if (verbose) console.error(`  [gen] ${msg}`); };
  const info = (msg: string) => { console.log(`  ${msg}`); };  // Always visible
  const attemptLogs: AttemptLog[] = [];

  log(`Backend: ${backend} | Model: ${model}`);

  // Slug for file naming
  const slug = algorithmPrompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  let lastCode = "";
  let lastError = "";

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const attemptLog: AttemptLog = {
      attempt,
      codeGenerated: false,
      executed: false,
      validated: false,
    };

    info(`⏳ Attempt ${attempt}/${maxRetries + 1} for "${algorithmPrompt.slice(0, 40)}..."`);

    // ── 1. Generate code via LLM ──────────────────────────────────────────

    const messages: ChatMessage[] = [];

    if (attempt === 1) {
      messages.push({
        role: "user",
        content: `Write an AlgoViz visualization of: ${algorithmPrompt}`,
      });
    } else {
      // Classify error type for targeted feedback
      const truncatedError = lastError.slice(0, 800);
      let fixHints = "";

      if (lastError.includes("SyntaxError")) {
        fixHints =
          `This is a JavaScript syntax error. Check template literals for mismatched braces.\n` +
          `Use simple string concatenation if template literals are complex.`;
      } else if (lastError.includes("must have required property 'target'") ||
                 lastError.includes("must NOT have additional properties") ||
                 lastError.includes("must match exactly one schema in oneOf")) {
        fixHints =
          `CRITICAL: You are constructing raw action/actor objects instead of using the primitives API.\n` +
          `NEVER create raw objects like {type:"highlight", targets:[...]}.\n` +
          `ALWAYS use the provided functions:\n` +
          `  - ops.highlight(targetId, color) — NOT {type:"highlight",...}\n` +
          `  - ops.swap(handle, i, j) — NOT manual value swapping\n` +
          `  - ops.markDone(targetId) — NOT {type:"update",...}\n` +
          `  - layout.array(), layout.graph(), etc. — NOT raw actor objects\n` +
          `  - pointer(), label(), titleLabel(), statusLabel() — NOT raw actor objects\n` +
          `Every actor must come from a layout or builder function. Every action must come from an ops function.`;
      } else if (lastError.includes("must have required property 'x'") ||
                 lastError.includes("must have required property 'source'")) {
        fixHints =
          `You are creating raw actor objects instead of using layout/builder functions.\n` +
          `NEVER create actors manually. Use:\n` +
          `  - layout.array(values) for arrays\n` +
          `  - layout.graph(nodes, edges) for graphs\n` +
          `  - layout.tree(root) for trees\n` +
          `  - layout.matrix(rows, cols) for DP tables\n` +
          `  - pointer(label, target, position) for pointers\n` +
          `  - titleLabel(text), statusLabel(text), label(text, x, y) for labels`;
      } else if (lastError.includes("Cannot read properties of undefined")) {
        fixHints =
          `A property access returned undefined. Common causes:\n` +
          `- matrix.actors is a FLAT array, NOT a 2D array. To get a cell's position, use:\n` +
          `    const cellId = m.id(row, col);  // returns the ID string\n` +
          `    // DO NOT access m.actors[row][col] — it doesn't exist\n` +
          `- For matrix cell positions: cells are auto-positioned by layout.matrix(). Use m.id(row,col) to get IDs.\n` +
          `- For array cells: use arr.id(index) to get the ID, arr.values[index] for the value.\n` +
          `- Make sure loop indices are within bounds.`;
      } else if (lastError.includes("annotation") && lastError.includes("must be equal to one of")) {
        fixHints =
          `The 'annotation' field must be one of: "invariant", "initialization", "boundary", "decision", "warning", "explanation".\n` +
          `Use annotatedStep(description, annotation, opts, ...actions) to create annotated steps.`;
      } else {
        fixHints =
          `- Use handle.id references (e.g., status.id, arr.id(0)), not string literals\n` +
          `- Category values use hyphens: "dynamic-programming", not underscores\n` +
          `- Always call resetIds() first\n` +
          `- Only use ops.* functions for actions, layout.* for actors\n` +
          `- For educational narration, use teach() or annotatedStep() instead of step()`;
      }

      messages.push({
        role: "user",
        content: `Write an AlgoViz visualization of: ${algorithmPrompt}`,
      });
      messages.push({
        role: "assistant",
        content: `\`\`\`js\n${lastCode}\n\`\`\``,
      });
      messages.push({
        role: "user",
        content:
          `The code above failed with this error:\n\n\`\`\`\n${truncatedError}\n\`\`\`\n\n` +
          `${fixHints}\n\n` +
          `Fix the error and output the complete corrected code.`,
      });
    }

    let responseText: string;
    try {
      info(`  📡 Calling ${model}...`);
      const t0 = Date.now();
      responseText = await callLLM(backend, apiKey, model, systemPrompt, messages, maxTokens, httpTimeout);
      info(`  📥 Response received (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e: unknown) {
      const errMsg = (e as Error).message || "API call failed";
      info(`  ❌ API error: ${errMsg.slice(0, 120)}`);
      attemptLog.error = errMsg;
      attemptLogs.push(attemptLog);
      continue;
    }

    // ── 2. Extract code ───────────────────────────────────────────────────

    let code: string;
    try {
      code = extractCode(responseText);
      attemptLog.codeGenerated = true;
      lastCode = code;
      info(`  📝 Code extracted (${code.split("\\n").length} lines)`);
    } catch (e: unknown) {
      const errMsg = (e as Error).message;
      log(`Code extraction failed: ${errMsg}`);
      attemptLog.error = errMsg;
      attemptLogs.push(attemptLog);
      continue;
    }

    // ── 3. Execute code ───────────────────────────────────────────────────

    const execResult = executeCode(code, packageRoot, execTimeout);

    if (!execResult.success) {
      info(`  ❌ Execution failed: ${execResult.error?.slice(0, 150)}`);
      lastError = execResult.error || "Unknown error";
      attemptLog.error = lastError.slice(0, 500);
      attemptLogs.push(attemptLog);
      continue;
    }

    attemptLog.executed = true;
    info(`  ⚙️  Code executed successfully`);

    // ── 4. Parse and validate output ──────────────────────────────────────

    let vizData: unknown;
    try {
      vizData = JSON.parse(execResult.output!);
    } catch (e: unknown) {
      const errMsg = "Output was not valid JSON";
      log(errMsg);
      lastError = errMsg + ": " + execResult.output?.slice(0, 200);
      attemptLog.error = errMsg;
      attemptLogs.push(attemptLog);
      continue;
    }

    const validationResult = validate(vizData);
    if (!validationResult.valid) {
      const errMsg = validationResult.errors
        .map((e) => `[${e.location}] ${e.message}`)
        .join("\n");
      info(`  ❌ Validation failed: ${errMsg.slice(0, 150)}`);
      lastError = errMsg;
      attemptLog.error = errMsg;
      attemptLogs.push(attemptLog);
      continue;
    }

    attemptLog.validated = true;
    attemptLogs.push(attemptLog);
    info(`  ✅ Valid!`);

    // ── 5. Success — save outputs ─────────────────────────────────────────

    const viz = vizData as Visualization;
    const s = summarize(viz);
    log(`Valid! ${s.actorCount} actors, ${s.stepCount} steps, ${s.actionCount.total} actions`);

    const result: GenerateResult = {
      success: true,
      algorithm: slug,
      attempts: attempt,
      code,
      visualization: viz,
      log: attemptLogs,
    };

    if (outputDir) {
      fs.mkdirSync(outputDir, { recursive: true });
      const files: GenerateResult["files"] = {};

      const jsPath = path.join(outputDir, `${slug}.js`);
      fs.writeFileSync(jsPath, code, "utf-8");
      files.js = jsPath;

      const jsonPath = path.join(outputDir, `${slug}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(viz, null, 2) + "\n", "utf-8");
      files.json = jsonPath;

      if (render) {
        const htmlPath = path.join(outputDir, `${slug}.html`);
        renderToFile(viz, htmlPath);
        files.html = htmlPath;
      }

      result.files = files;
    }

    return result;
  }

  // All retries exhausted
  return {
    success: false,
    algorithm: slug,
    attempts: maxRetries + 1,
    error: lastError || "All attempts failed",
    log: attemptLogs,
  };
}

// ─── Batch Generate ─────────────────────────────────────────────────────────

export async function generateBatch(
  algorithms: string[],
  options: GenerateOptions = {},
): Promise<GenerateResult[]> {
  const results: GenerateResult[] = [];

  for (let i = 0; i < algorithms.length; i++) {
    const algo = algorithms[i];
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📌 [${i + 1}/${algorithms.length}] ${algo}`);
    console.log(`${"─".repeat(60)}`);
    const result = await generate(algo, options);
    if (result.success) {
      console.log(`  🎉 PASSED (attempt ${result.attempts})`);
    } else {
      console.log(`  💀 FAILED after ${result.attempts} attempts`);
    }
    results.push(result);
  }

  return results;
}
