/**
 * Loads the two approved photo assets the six-page Cyber Health PDF
 * requires (cover: monochrome architecture, closing: monochrome
 * technology infrastructure — see app/cyber-health/pdf-report.tsx and
 * the design spec it implements). Read once from public/images/
 * cyber-health/ at module load and cached as data URIs, the same way
 * the QR code is passed into the renderer in route.ts.
 *
 * Deliberately loud on failure: a missing/misnamed asset throws with a
 * clear message rather than silently rendering a broken image or
 * falling back to a placeholder in production.
 */
import { readFileSync } from "fs";
import path from "path";

const ASSET_DIR = path.join(process.cwd(), "public", "images", "cyber-health");

function loadAsDataUri(filename: string, mime: string): string {
  const filePath = path.join(ASSET_DIR, filename);
  let buffer: Buffer;
  try {
    buffer = readFileSync(filePath);
  } catch {
    throw new Error(
      `Cyber Health PDF photo asset missing: expected ${filePath}. ` +
        `Add the approved monochrome photo before generating reports.`,
    );
  }
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

let cached: { cover: string; closing: string } | null = null;

/**
 * Returns { cover, closing } data-URI strings for the PDF's two photo
 * slots. Throws (caught by route.ts's existing PDF-generation try/catch)
 * if either asset file is missing — never renders without both, per the
 * renderer's own required-prop contract.
 */
export function getCyberHealthReportPhotos(): { cover: string; closing: string } {
  if (cached) return cached;
  cached = {
    cover: loadAsDataUri("cover.png", "image/png"),
    closing: loadAsDataUri("closing.png", "image/png"),
  };
  return cached;
}
