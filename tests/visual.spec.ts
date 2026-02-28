import { test, expect, type Page } from "@playwright/test";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output");
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, "screenshots");

// Example files to test: name -> { jsonFile, actorCount, stepCount }
const EXAMPLES = {
  "bubble-sort": {
    json: "examples/bubble-sort.json",
    minActors: 7, // 4 cells + 3 labels
    stepCount: 15,
  },
  "bfs-graph": {
    json: "examples/bfs-graph.json",
    minActors: 10, // 6 nodes + 6 edges + 4 labels (edges rendered as lines, not .av-actor groups with data-id always)
    stepCount: 14,
  },
  dijkstra: {
    json: "examples/dijkstra.json",
    minActors: 10, // 5 nodes + 7 edges + 3 labels
    stepCount: 8,
  },
};

function htmlPath(name: string): string {
  return path.join(OUTPUT_DIR, `test-${name}.html`);
}

function fileUrl(filePath: string): string {
  return `file://${filePath}`;
}

// Generate all test HTML files before running tests
test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  for (const [name, info] of Object.entries(EXAMPLES)) {
    const outFile = htmlPath(name);
    const jsonFile = path.join(ROOT, info.json);
    execSync(
      `node dist/src/cli/index.js render "${jsonFile}" -o "${outFile}"`,
      { cwd: ROOT, stdio: "pipe" }
    );
    if (!fs.existsSync(outFile)) {
      throw new Error(`Failed to generate HTML for ${name}`);
    }
  }
});

// Collect JS errors on the page
function collectJSErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });
  return errors;
}

// ────────────────────────────────────────────────────────────
// Test Suite: Bubble Sort
// ────────────────────────────────────────────────────────────
test.describe("Bubble Sort visualization", () => {
  test("loads without JS errors", async ({ page }) => {
    const errors = collectJSErrors(page);
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });
    expect(errors).toHaveLength(0);
  });

  test("renders player UI elements", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // Play button exists
    const playBtn = page.locator(".av-btn-play");
    await expect(playBtn).toBeVisible();

    // Step counter exists
    const stepCount = page.locator(".av-step-count");
    await expect(stepCount).toBeVisible();

    // Timeline slider exists
    const timeline = page.locator(".av-timeline");
    await expect(timeline).toBeVisible();

    // Navigation buttons (prev, next)
    const prevBtn = page.locator('.av-btn[title="Previous (←)"]');
    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();

    // Canvas wrapper with SVG
    const svg = page.locator(".av-canvas-wrap svg");
    await expect(svg).toBeVisible();

    // Header with title
    const header = page.locator(".av-header h1");
    await expect(header).toHaveText("Bubble Sort");

    // Description area
    const descText = page.locator(".av-description-text");
    await expect(descText).toBeVisible();
  });

  test("renders expected number of actors on SVG", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // All actors are rendered as <g class="av-actor"> elements
    const actors = page.locator("g.av-actor");
    const count = await actors.count();
    expect(count).toBeGreaterThanOrEqual(EXAMPLES["bubble-sort"].minActors);
  });

  test("step counter shows correct initial state", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const stepCount = page.locator(".av-step-count");
    // Initial state: step 0 / N (before any step is taken, it shows "0 / 14")
    const text = await stepCount.textContent();
    expect(text).toContain(`/ ${EXAMPLES["bubble-sort"].stepCount}`);
  });

  test("clicking next step advances the visualization", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // Get initial step counter text
    const stepCount = page.locator(".av-step-count");
    const initialText = await stepCount.textContent();

    // Click next step
    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    await nextBtn.click();

    // Wait briefly for state update
    await page.waitForTimeout(200);

    // Step counter should have changed
    const afterText = await stepCount.textContent();
    expect(afterText).not.toBe(initialText);
    expect(afterText).toContain("1 /");

    // Description text should now show the first step's description
    const descText = page.locator(".av-description-text");
    const description = await descText.textContent();
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(0);
  });

  test("takes a screenshot", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // Advance a couple of steps for a more interesting screenshot
    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    await nextBtn.click();
    await page.waitForTimeout(300);
    await nextBtn.click();
    await page.waitForTimeout(300);

    const screenshotPath = path.join(SCREENSHOTS_DIR, "bubble-sort.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Test Suite: BFS Graph
// ────────────────────────────────────────────────────────────
test.describe("BFS Graph visualization", () => {
  test("loads without JS errors", async ({ page }) => {
    const errors = collectJSErrors(page);
    await page.goto(fileUrl(htmlPath("bfs-graph")));
    await page.waitForSelector("svg", { timeout: 5000 });
    expect(errors).toHaveLength(0);
  });

  test("renders player UI elements", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bfs-graph")));
    await page.waitForSelector("svg", { timeout: 5000 });

    await expect(page.locator(".av-btn-play")).toBeVisible();
    await expect(page.locator(".av-step-count")).toBeVisible();
    await expect(page.locator(".av-timeline")).toBeVisible();
    await expect(page.locator(".av-canvas-wrap svg")).toBeVisible();

    const header = page.locator(".av-header h1");
    await expect(header).toHaveText("Breadth-First Search");
  });

  test("renders expected number of actors (nodes + edges + labels)", async ({
    page,
  }) => {
    await page.goto(fileUrl(htmlPath("bfs-graph")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const actors = page.locator("g.av-actor");
    const count = await actors.count();
    // BFS has 6 nodes + 6 edges + 4 labels = 16 actors
    expect(count).toBeGreaterThanOrEqual(EXAMPLES["bfs-graph"].minActors);
  });

  test("clicking next step advances and updates description", async ({
    page,
  }) => {
    await page.goto(fileUrl(htmlPath("bfs-graph")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    await nextBtn.click();
    await page.waitForTimeout(200);

    const stepCount = page.locator(".av-step-count");
    const text = await stepCount.textContent();
    expect(text).toContain("1 /");

    const descText = page.locator(".av-description-text");
    const description = await descText.textContent();
    expect(description).toBeTruthy();
  });

  test("takes a screenshot", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bfs-graph")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // Advance a few steps to show some traversal
    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    for (let i = 0; i < 3; i++) {
      await nextBtn.click();
      await page.waitForTimeout(200);
    }

    const screenshotPath = path.join(SCREENSHOTS_DIR, "bfs-graph.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Test Suite: Dijkstra
// ────────────────────────────────────────────────────────────
test.describe("Dijkstra visualization", () => {
  test("loads without JS errors", async ({ page }) => {
    const errors = collectJSErrors(page);
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });
    expect(errors).toHaveLength(0);
  });

  test("renders player UI elements", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });

    await expect(page.locator(".av-btn-play")).toBeVisible();
    await expect(page.locator(".av-step-count")).toBeVisible();
    await expect(page.locator(".av-timeline")).toBeVisible();
    await expect(page.locator(".av-canvas-wrap svg")).toBeVisible();

    const header = page.locator(".av-header h1");
    await expect(header).toHaveText("Dijkstra's Shortest Path");
  });

  test("renders expected number of actors (nodes + edges + labels)", async ({
    page,
  }) => {
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const actors = page.locator("g.av-actor");
    const count = await actors.count();
    expect(count).toBeGreaterThanOrEqual(EXAMPLES["dijkstra"].minActors);
  });

  test("can step through all steps without errors", async ({ page }) => {
    const errors = collectJSErrors(page);
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    const stepCount = page.locator(".av-step-count");

    // Step through all steps
    for (let i = 0; i < EXAMPLES["dijkstra"].stepCount; i++) {
      await nextBtn.click();
      await page.waitForTimeout(150);
    }

    // Should be at the last step
    const text = await stepCount.textContent();
    expect(text).toContain(
      `${EXAMPLES["dijkstra"].stepCount} / ${EXAMPLES["dijkstra"].stepCount}`
    );

    // No JS errors throughout
    expect(errors).toHaveLength(0);
  });

  test("clicking previous step goes backward", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    const prevBtn = page.locator('.av-btn[title="Previous (←)"]');
    const stepCount = page.locator(".av-step-count");

    // Go forward 3 steps
    for (let i = 0; i < 3; i++) {
      await nextBtn.click();
      await page.waitForTimeout(150);
    }
    const textAfterForward = await stepCount.textContent();
    expect(textAfterForward).toContain("3 /");

    // Go back 1 step
    await prevBtn.click();
    await page.waitForTimeout(150);

    const textAfterBack = await stepCount.textContent();
    expect(textAfterBack).toContain("2 /");
  });

  test("takes a screenshot", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("dijkstra")));
    await page.waitForSelector("svg", { timeout: 5000 });

    // Advance to an interesting state
    const nextBtn = page.locator('.av-btn[title="Next (→)"]');
    for (let i = 0; i < 4; i++) {
      await nextBtn.click();
      await page.waitForTimeout(200);
    }

    const screenshotPath = path.join(SCREENSHOTS_DIR, "dijkstra.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Cross-cutting: Speed button and keyboard controls
// ────────────────────────────────────────────────────────────
test.describe("Player controls", () => {
  test("speed button cycles through speeds", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const speedBtn = page.locator(".av-speed");
    await expect(speedBtn).toHaveText("1\u00d7");

    await speedBtn.click();
    await expect(speedBtn).toHaveText("1.5\u00d7");

    await speedBtn.click();
    await expect(speedBtn).toHaveText("2\u00d7");
  });

  test("keyboard arrow right advances step", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const stepCount = page.locator(".av-step-count");
    const initialText = await stepCount.textContent();

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    const afterText = await stepCount.textContent();
    expect(afterText).not.toBe(initialText);
    expect(afterText).toContain("1 /");
  });

  test("play button starts auto-play and changes to pause icon", async ({
    page,
  }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const playBtn = page.locator(".av-btn-play");

    // Initial state: play icon
    const initialText = await playBtn.textContent();
    expect(initialText).toContain("\u25b6"); // play triangle

    // Click play
    await playBtn.click();
    await page.waitForTimeout(100);

    // Should change to pause icon
    const playingText = await playBtn.textContent();
    expect(playingText).toContain("\u23f8"); // pause icon

    // Click again to pause
    await playBtn.click();
    await page.waitForTimeout(100);

    const pausedText = await playBtn.textContent();
    expect(pausedText).toContain("\u25b6"); // back to play
  });

  test("legend is rendered with color indicators", async ({ page }) => {
    await page.goto(fileUrl(htmlPath("bubble-sort")));
    await page.waitForSelector("svg", { timeout: 5000 });

    const legendItems = page.locator(".av-legend-item");
    const count = await legendItems.count();
    expect(count).toBe(5); // Default, Active, Comparing, Swapping, Sorted

    // Check that legend dots have background colors
    const dots = page.locator(".av-legend-dot");
    for (let i = 0; i < 5; i++) {
      const dot = dots.nth(i);
      const bgColor = await dot.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).not.toBe("");
      expect(bgColor).not.toBe("transparent");
    }
  });
});
