import type { SVGProps } from "react";

/**
 * Social platform glyphs — Footer overhaul (D-017). `lucide-react` 1.31.0
 * dropped all brand/social icons (no LinkedIn/Instagram exports, see the
 * footer's own prior comment on this), so these are small hand-drawn
 * outline icons matching the site's existing icon convention (thin
 * `strokeWidth`, `currentColor`, matte — same as `Icon`/icon-wrapper.tsx)
 * rather than the platforms' literal filled trademark glyphs, consistent
 * with the "matte, not glossy" brand direction already used everywhere
 * else on the site.
 */

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7.2" r="0.6" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5v-4a2 2 0 0 1 4 0v4" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="16.5" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
