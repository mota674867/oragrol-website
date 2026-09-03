import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
