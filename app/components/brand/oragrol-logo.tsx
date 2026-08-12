import { cn } from "../ui/cn";

/**
 * OragrolLogo — Header Fix Pass 3 rebuild.
 *
 * Pass 2 still rebuilt the lockup as two separately laid-out pieces (an
 * `OragrolRing` component + hand-typed text in a flex column with a
 * guessed `gap-2.5` and a guessed 0.6 font-size ratio) — CSS-approximated
 * spacing, not the source file. That's why the ring-to-wordmark gap and
 * the "GLOBAL" scale didn't match `Oragrol_Logo_Final.svg`. This version
 * inlines that file's own three graphic elements (ring `<circle>` + both
 * `<text>` nodes) with their exact source attributes untouched — same
 * cx/cy/r/stroke-width/dasharray/rotate on the ring, same x/y/font-size/
 * letter-spacing on both text nodes — so every position and gap is the
 * file's own coordinates, not a recreation of them.
 *
 * The only two changes from the raw file, both non-compositional:
 *  1. `viewBox` is cropped from the source's full 900×300 authoring
 *     canvas down to just the logo's own bounding box (measured via
 *     getBBox in a headless render) — this only changes what window is
 *     visible, not any element's position within it.
 *  2. Fill/stroke swap from the source's fixed dark-on-white values to
 *     this file's theme tokens, so it stays legible on both the dark
 *     header and any future light surface: ring stroke #018ABE →
 *     `--color-accent` (the exact same hex, already a token), "ragrol"
 *     fill #1F2937 → `--color-text-primary`, "GLOBAL" fill #9CA3AF →
 *     `--color-text-secondary` (also already the same hex as the token).
 *  Dropped entirely: the source's white background rect and its
 *  "Concept only — gap size/position/weight all adjustable" debug
 *  caption — both authoring scaffolding, never part of the mark itself.
 *
 * Font: the source specifies 'Epilogue','Inter',sans-serif — this project
 * already loads Epilogue as the confirmed brand typeface
 * (`font-brand` → `--font-epilogue`, see tokens.css), so the text nodes
 * use that Tailwind utility rather than a hardcoded font-family string.
 */
export interface OragrolLogoProps {
  /** Rendered height in px. Width follows automatically from the source
   *  file's own aspect ratio (~2.17:1) — never set independently. */
  height?: number;
  className?: string;
}

// Cropped from the source's 900x300 canvas to the measured bounding box of
// the ring + "ragrol" + "GLOBAL" (excludes bg rect + debug caption), plus
// ~20px padding on every side. Measured live via getBBox() against this
// component actually rendered with the real Epilogue web font — an
// earlier measurement against a bare-HTML copy of the source file (no
// Epilogue loaded, so the browser substituted a narrower fallback sans)
// undershot the real text width and clipped "ragrol"/"GLOBAL" in-browser.
const VIEWBOX = "28 68 391 172";
const ASPECT_RATIO = 391 / 172;

export function OragrolLogo({ height = 36, className }: OragrolLogoProps) {
  return (
    <svg
      viewBox={VIEWBOX}
      height={height}
      width={height * ASPECT_RATIO}
      role="img"
      aria-label="Oragrol Global"
      className={cn("shrink-0", className)}
    >
      {/* fused O — exact source geometry, untouched */}
      <circle
        cx={110}
        cy={150}
        r={62}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={26}
        strokeDasharray="365 24"
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(35 110 150)"
      />
      <text
        x={185}
        y={172}
        className="font-brand"
        fontWeight={500}
        fontSize={72}
        fill="var(--color-text-primary)"
      >
        ragrol
      </text>
      <text
        x={187}
        y={215}
        className="font-brand"
        fontWeight={500}
        fontSize={20}
        letterSpacing={7}
        fill="var(--color-text-secondary)"
      >
        GLOBAL
      </text>
    </svg>
  );
}
