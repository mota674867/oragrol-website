import { Font } from "@react-pdf/renderer";
import { INTER_REGULAR, INTER_MEDIUM, INTER_SEMIBOLD, INTER_BOLD } from "./pdf-inter-data";

/**
 * Registers Inter for the client PDF reports (ODO, Cyber Health, My Scope matches the same set).
 * Call once before rendering; safe to call many times.
 */
let done = false;
export function registerPdfFonts(): void {
  if (done) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: INTER_REGULAR, fontWeight: 400 },
      { src: INTER_MEDIUM, fontWeight: 500 },
      { src: INTER_SEMIBOLD, fontWeight: 600 },
      { src: INTER_BOLD, fontWeight: 700 },
    ],
  });
  // Words are never hyphenated by react-pdf: keep whole words, as in the approved mockups.
  Font.registerHyphenationCallback((word) => [word]);
  done = true;
}
