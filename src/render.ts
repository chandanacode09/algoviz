/**
 * AlgoViz Render Module
 *
 * Generates self-contained HTML from a Visualization JSON object.
 * The output includes the embedded player and the visualization data.
 */

import * as fs from "fs";
import * as path from "path";
import type { Visualization } from "./types";

/**
 * Read the artifact player template HTML.
 * Falls back to a minimal error page if the template is missing.
 */
function getPlayerTemplate(): string {
  // __dirname at runtime = dist/src/, so go up 2 levels to project root
  const templatePath = path.join(__dirname, "..", "..", "artifact-player.html");
  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch {
    throw new Error(
      `AlgoViz: artifact-player.html not found at ${templatePath}. ` +
      `Ensure the package is installed correctly.`
    );
  }
}

/**
 * Render a Visualization object into a self-contained HTML string.
 *
 * The HTML includes the full player engine + the visualization data,
 * ready to be opened in any browser with zero dependencies.
 */
export function renderHTML(viz: Visualization): string {
  const template = getPlayerTemplate();
  const jsonStr = JSON.stringify(viz);
  const inject = `<script type="application/algoviz">\n${jsonStr}\n</script>`;
  return template.replace("<!-- ALGOVIZ_JSON_PLACEHOLDER -->", inject);
}

/**
 * Render a Visualization and write the HTML to a file.
 */
export function renderToFile(viz: Visualization, outputPath: string): void {
  const html = renderHTML(viz);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, html, "utf-8");
}
