import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site-config";

/**
 * Real, live, customer-facing pages that get a French version and an
 * hreflang pair in the sitemap. This list was built by directly checking
 * every route on the live site (not assumed from the footer nav alone —
 * how-we-work isn't footer-linked but is real; solutions/canada-coverage-
 * study/style-guide are real routes but excluded below on purpose).
 */
const bilingualRoutes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/business-automation", priority: 0.9 },
  { path: "/or-one", priority: 0.9 },
  { path: "/industries", priority: 0.8 },
  { path: "/cyber-health", priority: 0.8 },
  { path: "/resources", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/how-we-work", priority: 0.6 },
  { path: "/company", priority: 0.6 },
  { path: "/faq", priority: 0.6 },
  { path: "/careers", priority: 0.5 },
  { path: "/talent", priority: 0.5 },
  { path: "/partnerships", priority: 0.5 },
];

/**
 * Legal pages: real, live, but intentionally English-only for now —
 * Mohammad's explicit decision, no French version until a real legal
 * review happens (Bill 96 implications). No hreflang alternate is
 * emitted for these, since there is nothing at /fr/* worth indexing yet.
 */
const englishOnlyRoutes: { path: string; priority: number }[] = [
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-of-use", priority: 0.3 },
  { path: "/accessibility", priority: 0.3 },
];

// Deliberately excluded, not an oversight: /solutions (redirects to
// /services, see next.config.ts), /canada-coverage-study (dead route,
// resolves to a fallback), /style-guide (internal/disposable, marked as
// such on the page itself — never meant to be indexed).

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const bilingual: MetadataRoute.Sitemap = bilingualRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    priority: route.priority,
    alternates: {
      languages: {
        en: `${SITE_URL}${route.path}`,
        fr: `${SITE_URL}/fr${route.path === "/" ? "" : route.path}`,
      },
    },
  }));

  const englishOnly: MetadataRoute.Sitemap = englishOnlyRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    priority: route.priority,
  }));

  return [...bilingual, ...englishOnly];
}
