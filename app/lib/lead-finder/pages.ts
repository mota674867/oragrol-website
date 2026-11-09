// ORAGROL Lead Finder (pilot) — which pages of a business's own site to read.
// Pure code. Only same-site links are followed (the business's own pages).

import { decodeEntities } from "./text";

const hostOf = (u: string): string => {
  try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
};

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|svg|webp|zip|docx?|xlsx?|mp4|mp3)(\?|$)/i;

// Higher score = more likely to name the owner or manager.
const SCORES: Array<{ score: number; re: RegExp }> = [
  { score: 4, re: /\b(team|our-team|meet|staff|people|leadership|management|doctors?|dentists?|lawyers?|attorneys?|partners?|practitioners?|providers?|owner|founders?|principals?)\b/i },
  { score: 3, re: /\b(about|about-us|who-we-are|our-story|company|profile|bio|biography)\b/i },
  { score: 2, re: /\b(contact|contact-us|reach-us|get-in-touch|locations?)\b/i },
];

const FALLBACK_PATHS = ["/team", "/about", "/contact", "/our-team", "/about-us", "/contact-us"];

function score(url: string, text: string): number {
  let best = 0;
  const hay = `${new URL(url).pathname.replace(/[\/_]+/g, " ")} ${text}`;
  for (const s of SCORES) if (s.re.test(hay)) best = Math.max(best, s.score);
  return best;
}

/** Up to `max` same-site pages most likely to show who owns or runs the business. */
export function findCandidateLinks(homepageHtml: string, baseUrl: string, max = 4): string[] {
  const baseHost = hostOf(baseUrl);
  const scored = new Map<string, number>();
  for (const m of homepageHtml.matchAll(/<a\b[^>]*?href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeEntities(m[1]).trim();
    if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href) || SKIP_EXT.test(href)) continue;
    let abs: URL;
    try { abs = new URL(href, baseUrl); } catch { continue; }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
    if (hostOf(abs.toString()) !== baseHost) continue;
    abs.hash = "";
    abs.search = "";
    const url = abs.toString().replace(/\/$/, "");
    if (url === baseUrl.replace(/\/$/, "")) continue;
    const linkText = decodeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    const sc = score(url, linkText);
    if (sc > 0) scored.set(url, Math.max(scored.get(url) ?? 0, sc));
  }
  const picked = [...scored.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u).slice(0, max);
  if (picked.length < 2) {
    const origin = new URL(baseUrl).origin;
    for (const p of FALLBACK_PATHS) {
      if (picked.length >= max) break;
      const u = `${origin}${p}`;
      if (!picked.includes(u)) picked.push(u);
    }
  }
  return picked;
}
