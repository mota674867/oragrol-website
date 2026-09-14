import { cn } from "../ui/cn";

/**
 * OragrolLogo — swapped to the new approved mark, 13 Sept 2026.
 *
 * Replaces the earlier fused-O + wordmark design (the one built from
 * Oragrol_Logo_Final.svg, a file whose own <title> called it a "concept
 * demo") with the new mark: a stroke-drawn O, an orange equalizer/
 * soundwave bar cluster, and "ORAGROL GLOBAL" set in Helvetica Neue.
 * Source SVG supplied directly by the client, inlined here unmodified
 * geometry-wise (same paths/rects/coordinates).
 *
 * viewBox kept at the source's full 920x280 authoring canvas rather than
 * cropped to a tight bounding box the way the previous version was —
 * that crop was measured with a real headless render (getBBox against
 * the actual rendered logo, with the real web font loaded). No working
 * browser was available to do the same here, and a wrong guessed crop
 * risks clipping real content (the previous file's own comment
 * documents exactly that mistake happening once already, from measuring
 * against a bare-HTML copy without the brand font loaded). Extra
 * whitespace around the mark is a minor, safe cosmetic issue; a bad crop
 * is not.
 *
 * Colors: the O and the wordmark are hardcoded to `#141719`, not a CSS
 * theme variable. First version here used `var(--color-text-primary)`,
 * assuming it would adapt correctly wherever this component gets
 * reused. Real, live bug on the homepage instead: that variable
 * resolved to `rgb(233,229,220)` — the page's own ivory background
 * color, not a dark text color — because the homepage's header uses a
 * separate, standalone CSS system (`.home-v3`, its own `--paper`/
 * `--graphite` custom properties) that doesn't set up
 * `--color-text-primary` the way the tokens.css system this component
 * was written against does. Confirmed via live computed-style
 * inspection: the O and wordmark were rendering in a color matching
 * the page background almost exactly, invisible, while only the
 * hardcoded orange bars stayed visible — exactly the small orange
 * blob reported. `#141719` is that same homepage's own `--graphite`
 * value, a deliberate match, not arbitrary — but it's now a fixed
 * value rather than a variable, so it renders correctly regardless of
 * which page's CSS system this component ends up inside next. The
 * equalizer bars keep the source's exact `#e86b1f` as a hardcoded
 * value, NOT mapped to this project's existing `--color-accent` /
 * `--palette-burnt-orange` token, because it is a different hex
 * (#e86b1f here vs #db5227 for the site's existing accent) — worth a
 * real decision (new distinct brand orange vs. should match the site's
 * accent exactly) rather than silently picking one.
 */
export interface OragrolLogoProps {
  /** Rendered height in px. Width follows automatically from the source
   *  file's own aspect ratio (920:280). */
  height?: number;
  className?: string;
}

const VIEWBOX = "0 0 920 280";
const ASPECT_RATIO = 920 / 280;

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
      <g
        fill="none"
        stroke="#141719"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={14}
      >
        <circle cx={100} cy={140} r={76} />
        <path d="M62 85v110m0-110s56-3 73 35c15 32-10 45-37 45H62m36 0 47 30" />
      </g>
      <g fill="#e86b1f">
        <rect width={3.6} height={56} x={210} y={112} rx={1.8} />
        <rect width={3.6} height={86} x={218} y={97} rx={1.8} />
        <rect width={3.6} height={112} x={226} y={84} rx={1.8} />
        <rect width={3.6} height={134} x={234} y={73} rx={1.8} />
        <rect width={3.6} height={150} x={242} y={65} rx={1.8} />
        <rect width={3.6} height={160} x={250} y={60} rx={1.8} />
        <rect width={3.6} height={166} x={258} y={57} rx={1.8} />
        <rect width={3.6} height={168} x={266} y={56} rx={1.8} />
        <rect width={3.6} height={166} x={274} y={57} rx={1.8} />
        <rect width={3.6} height={160} x={282} y={60} rx={1.8} />
        <rect width={3.6} height={150} x={290} y={65} rx={1.8} />
        <rect width={3.6} height={134} x={298} y={73} rx={1.8} />
        <rect width={3.6} height={112} x={306} y={84} rx={1.8} />
        <rect width={3.6} height={86} x={314} y={97} rx={1.8} />
        <rect width={3.6} height={56} x={322} y={112} rx={1.8} />
      </g>
      <g fill="#141719" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
        <text x={365} y={155} fontSize={74} fontWeight={500} letterSpacing={4}>
          ORAGROL
        </text>
        <text x={365} y={200} fontSize={21} fontWeight={400} letterSpacing={15.5}>
          GLOBAL
        </text>
      </g>
    </svg>
  );
}
