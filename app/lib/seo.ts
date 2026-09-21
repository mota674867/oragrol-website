import { routing } from "@/i18n/routing";

/**
 * Builds the `alternates.languages` object for a page's `generateMetadata`,
 * matching this site's routing (`localePrefix: "as-needed"` — English is
 * unprefixed, French lives at `/fr${path}`). Always include an `x-default`
 * pointing at English, per Google's own guidance for a same-content default
 * when no locale matches the visitor.
 *
 * `path` is the canonical English pathname, e.g. "/", "/services",
 * "/resources/understanding-pipeda". Returns relative paths — Next.js
 * resolves them against `metadataBase` (already set in the root layout),
 * so callers never need to know or repeat SITE_URL here.
 *
 * Usage in a page's generateMetadata:
 *   alternates: { languages: languageAlternates("/services") }
 */
export function languageAlternates(path: string): Record<string, string> {
  const frPath = path === "/" ? "/fr" : `/fr${path}`;
  return {
    en: path,
    fr: frPath,
    "x-default": path,
  };
}

/** This site's two locales, re-exported here so page-level SEO code doesn't
 *  need a second import from i18n/routing just for this. */
export const locales = routing.locales;
