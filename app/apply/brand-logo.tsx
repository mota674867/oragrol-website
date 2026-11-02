import { Logo } from "../components/brand/logo";

/** The approved Oragrol logo, in the right ink for the light or the dark theme (CSS shows one of the two). */
export function BrandLogo({ height = 26 }: { height?: number }) {
  return (
    <span className="ap-logo">
      <span className="ap-logo-l"><Logo variant="horizontal" tone="light-bg" height={height} /></span>
      <span className="ap-logo-d"><Logo variant="horizontal" tone="dark-bg" height={height} decorative /></span>
    </span>
  );
}
