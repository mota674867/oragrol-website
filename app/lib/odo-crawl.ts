// ORAGROL ODO — Multi-page site crawl for the Business Profile (L1)
//
// ADDED 2026-10-01 — ODO brain rebuild, roadmap item 1 (Mohammad: "Deep
// research. it must include (about, services, careers, privacy, and so
// on)"). odo-page.ts's fetchHomepage only ever reads ONE page. This reads up
// to MAX_PAGES more internal pages, picked from the homepage's own links by
// matching the page types Mohammad listed, and hands the combined text to
// odo-business-profile.ts.
//
// Fails OPEN per page, same philosophy as the rest of ODO's research: a page
// that can't be fetched is just left out, never blocks the scan or the other
// pages. This is deliberately NOT a scored Determination (odo-evidence.ts) —
// its only consumer is an AI prompt, never a reportable finding on its own.

import { normalizeDomain } from "./odo-dns";
import { safeFetch } from "./odo-ssrf-guard";

export type PageType =
  | "about" | "services" | "pricing" | "careers" | "contact"
  | "privacy" | "terms" | "clients" | "blog" | "other";

export type CrawledPage = { url: string; pageType: PageType; text: string };

const PAGE_TYPE_PATTERNS: Array<{ type: PageType; pattern: RegExp }> = [
  { type: "about", pattern: /\b(about|who-we-are|our-story|company)\b/i },
  { type: "services", pattern: /\b(services?|products?|solutions?|what-we-do|offerings?)\b/i },
  { type: "pricing", pattern: /\b(pricing|plans?|packages?)\b/i },
  { type: "careers", pattern: /\b(careers?|jobs?|join-us|hiring)\b/i },
  { type: "contact", pattern: /\b(contact|get-in-touch|reach-us)\b/i },
  { type: "privacy", pattern: /\bprivacy\b/i },
  { type: "terms", pattern: /\b(terms|tos|legal)\b/i },
  { type: "clients", pattern: /\b(clients?|customers?|case-studies|portfolio|testimonials?)\b/i },
  { type: "blog", pattern: /\b(blog|news|insights|articles?)\b/i },
];

// Homepage (fetched separately, by the caller) + up to this many more = the
// "10-15 pages" the roadmap calls for.
const MAX_PAGES = 14;
const FETCH_TIMEOUT_MS = 8000;
const MAX_CONCURRENT = 5;
// Keeps the combined prompt a sane, bounded size even at 15 pages.
const MAX_TEXT_CHARS_PER_PAGE = 6000;

/**
 * Strips scripts/styles/comments/tags from raw HTML and decodes the common
 * entities, collapsing whitespace. Good enough to feed an LLM — this is not
 * a rendering engine and doesn't need to be one.
 */
export function htmlToText(html: string): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|p|div|li|tr|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return text.replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}

/** Same-domain internal links only, classified by path, deduped by path. */
function extractInternalLinks(html: string, baseUrl: string): Array<{ url: string; type: PageType }> {
  const domain = normalizeDomain(baseUrl);
  const linkRe = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>/gi;
  const seen = new Set<string>();
  const found: Array<{ url: string; type: PageType }> = [];
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const href = m[1];
    try {
      const resolved = new URL(href, baseUrl);
      if (normalizeDomain(resolved.hostname) !== domain) continue; // external — skip
      if (/\.(pdf|jpe?g|png|gif|svg|zip|docx?|xlsx?|mp4|webp|ico)$/i.test(resolved.pathname)) continue;
      const key = resolved.pathname.replace(/\/$/, "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const matched = PAGE_TYPE_PATTERNS.find((p) => p.pattern.test(resolved.pathname));
      found.push({ url: resolved.toString(), type: matched?.type ?? "other" });
    } catch {
      // malformed href — skip
    }
  }
  return found;
}

/**
 * One page per priority type (first match wins — nav order is usually
 * priority order), then fills remaining slots with unclassified "other"
 * pages up to MAX_PAGES.
 */
function selectPagesToFetch(links: Array<{ url: string; type: PageType }>): Array<{ url: string; type: PageType }> {
  const priority: PageType[] = ["about", "services", "pricing", "careers", "contact", "privacy", "terms", "clients", "blog"];
  const selected: Array<{ url: string; type: PageType }> = [];
  for (const type of priority) {
    const match = links.find((l) => l.type === type && !selected.some((s) => s.url === l.url));
    if (match) selected.push(match);
  }
  for (const link of links) {
    if (selected.length >= MAX_PAGES) break;
    if (!selected.some((s) => s.url === link.url)) selected.push(link);
  }
  return selected.slice(0, MAX_PAGES);
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    // safeFetch (odo-ssrf-guard.ts) — CRITICAL SSRF fix 2026-10-02: `url`
    // here is a link discovered ON the scanned business's own site, so a
    // malicious page could point it at an internal/metadata address and a
    // plain fetch() would request it server-side with no check at all.
    const res = await safeFetch(url, {
      headers: { "User-Agent": "ORAGROL-ODO/1.0 (+https://orgro.ca)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return htmlToText(html).slice(0, MAX_TEXT_CHARS_PER_PAGE);
  } catch {
    return null;
  }
}

/** Never more than `limit` requests to the same site in flight at once. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Crawls up to MAX_PAGES internal pages beyond the homepage (whose HTML the
 * caller already has from odo-page.ts's fetchHomepage, so it's passed in
 * here rather than re-fetched). Returns only pages that were actually
 * readable — same fail-open philosophy as the rest of ODO's research: a
 * site with a broken careers page just gets fewer pages, never an error.
 */
export async function crawlSitePages(homepageHtml: string, homepageUrl: string): Promise<CrawledPage[]> {
  const links = extractInternalLinks(homepageHtml, homepageUrl);
  const toFetch = selectPagesToFetch(links);
  if (!toFetch.length) return [];
  const texts = await mapWithConcurrency(toFetch, MAX_CONCURRENT, (p) => fetchPageText(p.url));
  const pages: CrawledPage[] = [];
  toFetch.forEach((p, i) => {
    const text = texts[i];
    if (text && text.length > 50) pages.push({ url: p.url, pageType: p.type, text });
  });
  return pages;
}
