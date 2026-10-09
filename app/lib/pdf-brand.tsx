/**
 * Oragrol Global logo for @react-pdf/renderer documents (logo rollout,
 * approved 2026-10-09). Same verbatim geometry as the website's
 * `app/components/brand/logo.tsx` (imported, never redrawn), drawn as
 * vector paths so it stays sharp in print. Use:
 *   - variant "horizontal" for page headers (the official logo is vertical
 *     but too tall for a header band — same rule as the website header);
 *   - variant "full" (official vertical logo) for covers / large placements;
 *   - variant "icon" for small marks.
 * Never recolour: graphite #141719 or light #F4F2ED, dot always #EF4D00.
 */
import { Svg, Path, Circle, Rect } from "@react-pdf/renderer";
import {
  BRAND_GRAPHITE, BRAND_LIGHT, BRAND_ORANGE,
  FULL_VIEWBOX, ICON_VIEWBOX, HORIZONTAL_VIEWBOX,
  RING_D, STROKE_D, TEXT_D, H_WORD1_D, H_WORD2_D,
} from "../components/brand/logo";

export type PdfLogoVariant = "full" | "icon" | "horizontal";

export function pdfLogoWidth(variant: PdfLogoVariant, height: number) {
  const vb = variant === "full" ? FULL_VIEWBOX : variant === "horizontal" ? HORIZONTAL_VIEWBOX : ICON_VIEWBOX;
  const [, , w, h] = vb.split(" ").map(Number);
  return (height * w) / h;
}

export function PdfLogo({
  variant = "horizontal",
  tone = "light-bg",
  height,
}: {
  variant?: PdfLogoVariant;
  tone?: "light-bg" | "dark-bg";
  /** Height in PDF points. Width follows the viewBox. */
  height: number;
}) {
  const ink = tone === "dark-bg" ? BRAND_LIGHT : BRAND_GRAPHITE;
  const viewBox = variant === "full" ? FULL_VIEWBOX : variant === "horizontal" ? HORIZONTAL_VIEWBOX : ICON_VIEWBOX;
  return (
    <Svg viewBox={viewBox} style={{ height, width: pdfLogoWidth(variant, height) }}>
      <Path fill={ink} fillRule="evenodd" d={RING_D} />
      <Path fill={ink} d={STROKE_D} />
      {variant === "full" ? <Path fill={ink} d={TEXT_D} /> : null}
      <Circle fill={BRAND_ORANGE} cx="505" cy="92" r="58" />
      {variant === "horizontal" ? <Rect x="650" y="253" width="10" height="494" fill={ink} fillOpacity={tone === "dark-bg" ? 0.4 : 0.35} /> : null}
      {variant === "horizontal" ? <Path fill={ink} d={H_WORD1_D} /> : null}
      {variant === "horizontal" ? <Path fill={ink} d={H_WORD2_D} /> : null}
    </Svg>
  );
}
