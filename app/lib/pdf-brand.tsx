import React from "react";
import { Svg, Path, Circle } from "@react-pdf/renderer";
import {
  BRAND_GRAPHITE,
  BRAND_ORANGE,
  FULL_VIEWBOX,
  ICON_VIEWBOX,
  RING_D,
  STROKE_D,
  TEXT_D,
} from "../components/brand/logo";

/**
 * Brand marks for the client PDF reports (ODO and Cyber Health).
 *
 * Geometry is the approved logo from app/components/brand/logo.tsx, read
 * from the same constants the website renders — never redrawn here. Only
 * the fill changes: graphite ink and the orange dot for the header, one
 * flat grey for the background icon watermark.
 */

const [, , FULL_W, FULL_H] = FULL_VIEWBOX.split(" ").map(Number);

/** Full vertical logo (wordmark included) for the running page header. `width` in pt. */
export function PdfLogo({ width }: { width: number }) {
  const height = (width * FULL_H) / FULL_W;
  return (
    <Svg viewBox={FULL_VIEWBOX} style={{ width, height }}>
      <Path d={RING_D} fill={BRAND_GRAPHITE} fillRule="evenodd" />
      <Path d={STROKE_D} fill={BRAND_GRAPHITE} />
      <Path d={TEXT_D} fill={BRAND_GRAPHITE} />
      <Circle cx={505} cy={92} r={58} fill={BRAND_ORANGE} />
    </Svg>
  );
}

/** Mark only, one flat colour (used as the page watermark). `size` in pt, square. */
export function PdfIconWatermark({ size, color }: { size: number; color: string }) {
  return (
    <Svg viewBox={ICON_VIEWBOX} style={{ width: size, height: size }}>
      <Path d={RING_D} fill={color} fillRule="evenodd" />
      <Path d={STROKE_D} fill={color} />
      <Circle cx={505} cy={92} r={58} fill={color} />
    </Svg>
  );
}
