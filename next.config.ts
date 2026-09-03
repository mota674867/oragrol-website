import type { NextConfig } from "next";

// Security-hardening pass (pre-launch). CSP/style-src and script-src use
// 'unsafe-inline' pragmatically because Next.js emits inline hydration
// scripts and several ported pages set inline `style={{}}` — both are
// governed by CSP. Tightening to a per-request nonce is a real follow-up
// (needs middleware.ts + threading the nonce through every inline usage)
// but is a bigger lift than this pass; flagged, not done here.
// 'unsafe-eval' is dev-only (React's dev-mode debugging tools use eval();
// production React never does) — never shipped in a production build.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Solutions page removed, folded into Services (SEO/GEO brief v2, Section 2).
      // Preserves link equity from any existing backlinks/bookmarks to /solutions.
      {
        source: "/solutions",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
